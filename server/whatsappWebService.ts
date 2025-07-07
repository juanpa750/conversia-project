const { Client, LocalAuth } = require('whatsapp-web.js');
import qrcode from 'qrcode';
import { storage } from './storage';
import * as fs from 'fs';
import * as path from 'path';

interface WhatsAppSession {
  client: Client;
  chatbotId: number;
  userId: string;
  phoneNumber?: string;
  isReady: boolean;
  qrCode?: string;
  status: 'initializing' | 'qr_code' | 'authenticated' | 'ready' | 'disconnected' | 'error';
  lastActivity: Date;
}

export class WhatsAppWebService {
  private sessions: Map<number, WhatsAppSession> = new Map();
  private sessionDir = path.join(process.cwd(), 'whatsapp-sessions');

  constructor() {
    // Crear directorio de sesiones si no existe
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  /**
   * Inicializar sesión WhatsApp para un chatbot específico
   */
  async initializeSession(chatbotId: number, userId: string): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      // Verificar si ya existe una sesión activa
      if (this.sessions.has(chatbotId)) {
        const existingSession = this.sessions.get(chatbotId)!;
        if (existingSession.isReady) {
          return { success: true };
        }
        if (existingSession.qrCode) {
          return { success: false, qrCode: existingSession.qrCode };
        }
      }

      // Crear nueva sesión
      const sessionId = `chatbot_${chatbotId}_${userId}`;
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: sessionId,
          dataPath: this.sessionDir
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        }
      });

      const session: WhatsAppSession = {
        client,
        chatbotId,
        userId,
        isReady: false,
        status: 'initializing',
        lastActivity: new Date()
      };

      this.sessions.set(chatbotId, session);

      // Configurar eventos del cliente
      this.setupClientEvents(session);

      // Inicializar cliente
      await client.initialize();

      return { success: false }; // Esperando QR o autenticación
    } catch (error) {
      console.error(`Error initializing WhatsApp session for chatbot ${chatbotId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Configurar eventos del cliente WhatsApp
   */
  private setupClientEvents(session: WhatsAppSession) {
    const { client, chatbotId, userId } = session;

    // Evento QR Code
    client.on('qr', async (qr) => {
      try {
        console.log(`📱 QR Code generated for chatbot ${chatbotId}`);
        const qrCodeDataUrl = await qrcode.toDataURL(qr);
        session.qrCode = qrCodeDataUrl;
        session.status = 'qr_code';
        
        // Actualizar estado en la base de datos
        await storage.updateWhatsappIntegrationStatus(chatbotId, 'qr_pending');
      } catch (error) {
        console.error('Error generating QR code:', error);
        session.status = 'error';
      }
    });

    // Evento autenticado
    client.on('authenticated', async () => {
      console.log(`✅ WhatsApp authenticated for chatbot ${chatbotId}`);
      session.status = 'authenticated';
      session.qrCode = undefined;
    });

    // Evento listo
    client.on('ready', async () => {
      console.log(`🚀 WhatsApp ready for chatbot ${chatbotId}`);
      session.isReady = true;
      session.status = 'ready';
      session.lastActivity = new Date();

      // Obtener número de teléfono del cliente
      const clientInfo = client.info;
      if (clientInfo && clientInfo.wid) {
        session.phoneNumber = clientInfo.wid.user;
        
        // Actualizar en la base de datos
        await storage.updateWhatsappIntegrationPhone(chatbotId, session.phoneNumber);
        await storage.updateWhatsappIntegrationStatus(chatbotId, 'connected');
      }
    });

    // Evento mensaje recibido
    client.on('message', async (message) => {
      if (session.isReady) {
        await this.handleIncomingMessage(session, message);
      }
    });

    // Evento desconectado
    client.on('disconnected', async (reason) => {
      console.log(`❌ WhatsApp disconnected for chatbot ${chatbotId}:`, reason);
      session.isReady = false;
      session.status = 'disconnected';
      
      // Actualizar estado en la base de datos
      await storage.updateWhatsappIntegrationStatus(chatbotId, 'disconnected');
      
      // Limpiar sesión
      this.sessions.delete(chatbotId);
    });

    // Evento error
    client.on('auth_failure', async (message) => {
      console.error(`🔐 Authentication failed for chatbot ${chatbotId}:`, message);
      session.status = 'error';
      await storage.updateWhatsappIntegrationStatus(chatbotId, 'error');
    });
  }

  /**
   * Manejar mensajes entrantes
   */
  private async handleIncomingMessage(session: WhatsAppSession, message: any) {
    try {
      const { chatbotId, userId } = session;
      
      // Obtener configuración del chatbot
      const chatbot = await storage.getChatbot(chatbotId);
      if (!chatbot) {
        console.error(`Chatbot ${chatbotId} not found`);
        return;
      }

      // Verificar trigger keywords
      const messageText = message.body.toLowerCase();
      const triggerKeywords = chatbot.triggerKeywords || [];
      
      const shouldRespond = triggerKeywords.some(keyword => 
        messageText.includes(keyword.toLowerCase())
      );

      if (shouldRespond) {
        // Obtener respuesta del chatbot
        const response = await this.generateChatbotResponse(chatbot, message.body);
        
        // Enviar respuesta
        await message.reply(response);
        
        // Registrar conversación
        await this.logConversation(chatbotId, userId, message.from, message.body, response);
      }

      session.lastActivity = new Date();
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  /**
   * Generar respuesta del chatbot
   */
  private async generateChatbotResponse(chatbot: any, messageText: string): Promise<string> {
    // Implementar lógica de AI aquí
    const baseResponse = chatbot.aiInstructions || 'Hola, gracias por contactarnos. ¿En qué puedo ayudarte?';
    
    // Si hay producto asociado, incluir información del producto
    if (chatbot.productId) {
      const product = await storage.getProduct(chatbot.productId);
      if (product) {
        return `${baseResponse}\n\nTe comparto información sobre ${product.name}:\n${product.description}`;
      }
    }
    
    return baseResponse;
  }

  /**
   * Registrar conversación en la base de datos
   */
  private async logConversation(chatbotId: number, userId: string, phoneNumber: string, message: string, response: string) {
    // Implementar logging de conversación
    console.log(`📝 Conversation logged for chatbot ${chatbotId}: ${phoneNumber} -> ${message.substring(0, 50)}...`);
  }

  /**
   * Obtener QR code para un chatbot
   */
  async getQRCode(chatbotId: number): Promise<string | null> {
    const session = this.sessions.get(chatbotId);
    return session?.qrCode || null;
  }

  /**
   * Verificar si una sesión está conectada
   */
  isConnected(chatbotId: number): boolean {
    const session = this.sessions.get(chatbotId);
    return session?.isReady || false;
  }

  /**
   * Obtener estado de la sesión
   */
  getSessionStatus(chatbotId: number): { connected: boolean; status: string; phoneNumber?: string } {
    const session = this.sessions.get(chatbotId);
    if (!session) {
      return { connected: false, status: 'not_initialized' };
    }
    
    return {
      connected: session.isReady,
      status: session.status,
      phoneNumber: session.phoneNumber
    };
  }

  /**
   * Desconectar sesión
   */
  async disconnect(chatbotId: number): Promise<void> {
    const session = this.sessions.get(chatbotId);
    if (session) {
      try {
        await session.client.destroy();
        this.sessions.delete(chatbotId);
        await storage.updateWhatsappIntegrationStatus(chatbotId, 'disconnected');
      } catch (error) {
        console.error(`Error disconnecting chatbot ${chatbotId}:`, error);
      }
    }
  }

  /**
   * Enviar mensaje desde el chatbot
   */
  async sendMessage(chatbotId: number, phoneNumber: string, message: string): Promise<boolean> {
    const session = this.sessions.get(chatbotId);
    if (!session || !session.isReady) {
      return false;
    }

    try {
      const formattedNumber = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;
      await session.client.sendMessage(formattedNumber, message);
      return true;
    } catch (error) {
      console.error(`Error sending message from chatbot ${chatbotId}:`, error);
      return false;
    }
  }

  /**
   * Limpiar sesiones inactivas
   */
  async cleanupInactiveSessions(): Promise<void> {
    const now = new Date();
    const maxInactiveTime = 30 * 60 * 1000; // 30 minutos

    for (const [chatbotId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > maxInactiveTime) {
        console.log(`🧹 Cleaning up inactive session for chatbot ${chatbotId}`);
        await this.disconnect(chatbotId);
      }
    }
  }
}

export const whatsappWebService = new WhatsAppWebService();

// Limpiar sesiones inactivas cada 15 minutos
setInterval(() => {
  whatsappWebService.cleanupInactiveSessions();
}, 15 * 60 * 1000);