import whatsappWeb from 'whatsapp-web.js';
const { Client, LocalAuth } = whatsappWeb;
import { execSync } from 'child_process';
import { storage } from './storage';
import { enhancedAI } from './enhancedAIService';
import { CRMService } from './crmService';
import { EventEmitter } from 'events';

interface WhatsAppSession {
  client: any;
  status: 'initializing' | 'qr_ready' | 'connecting' | 'connected' | 'disconnected';
  qrCode?: string;
  userId: string;
}

export class WhatsAppWebService extends EventEmitter {
  private sessions: Map<string, WhatsAppSession> = new Map();
  private crmService: CRMService;

  constructor() {
    super();
    this.crmService = new CRMService();
  }

  /**
   * Detecta automáticamente el path de Chromium en el sistema
   */
  private getChromiumPath(): string {
    try {
      const chromiumPath = execSync('which chromium', { encoding: 'utf8' }).trim();
      console.log(`📍 Chromium found at: ${chromiumPath}`);
      return chromiumPath;
    } catch (error) {
      console.warn('⚠️ Chromium not found, using default path');
      return '/usr/bin/chromium-browser'; // fallback
    }
  }

  /**
   * Inicializa una nueva sesión de WhatsApp Web para un usuario
   */
  async initializeSession(userId: string): Promise<{ success: boolean; sessionId: string }> {
    console.log(`🔄 Initializing WhatsApp Web session for user: ${userId}`);
    
    // Si ya existe una sesión, la destruimos primero
    if (this.sessions.has(userId)) {
      await this.destroySession(userId);
    }

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: `conversia-user-${userId}`
      }),
      puppeteer: {
        headless: true,
        executablePath: this.getChromiumPath(),
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-crash-reporter',
          '--disable-in-process-stack-traces',
          '--disable-logging',
          '--disable-dev-shm-usage',
          '--remote-debugging-port=9222',
          '--user-data-dir=/tmp/chrome-user-data'
        ]
      }
    });

    const session: WhatsAppSession = {
      client,
      status: 'initializing',
      userId
    };

    this.sessions.set(userId, session);

    // Configurar eventos del cliente
    this.setupClientEvents(userId, client);

    // Inicializar cliente
    try {
      await client.initialize();
      return { success: true, sessionId: userId };
    } catch (error) {
      console.error(`❌ Error initializing WhatsApp session for ${userId}:`, error);
      this.sessions.delete(userId);
      throw error;
    }
  }

  /**
   * Configura los eventos del cliente WhatsApp
   */
  private setupClientEvents(userId: string, client: any) {
    const session = this.sessions.get(userId);
    if (!session) return;

    // Evento QR - cuando se genera el código QR
    client.on('qr', (qr: string) => {
      console.log(`📱 QR Code generated for user ${userId}`);
      session.status = 'qr_ready';
      session.qrCode = qr;
      this.emit('qr', { userId, qr });
    });

    // Evento de autenticación
    client.on('authenticated', () => {
      console.log(`🔐 User ${userId} authenticated`);
      session.status = 'connecting';
      this.emit('authenticated', { userId });
    });

    // Evento ready - cuando está completamente conectado
    client.on('ready', async () => {
      console.log(`✅ WhatsApp ready for user ${userId}`);
      session.status = 'connected';
      
      // Actualizar estado en base de datos
      await this.updateUserWhatsAppStatus(userId, 'connected');
      
      this.emit('ready', { userId });
    });

    // Evento de desconexión
    client.on('disconnected', async (reason: string) => {
      console.log(`📴 User ${userId} disconnected:`, reason);
      session.status = 'disconnected';
      
      // Actualizar estado en base de datos
      await this.updateUserWhatsAppStatus(userId, 'disconnected');
      
      this.emit('disconnected', { userId, reason });
    });

    // Evento de mensaje entrante
    client.on('message', async (message: any) => {
      await this.handleIncomingMessage(userId, message);
    });

    // Evento de error de autenticación
    client.on('auth_failure', (msg: string) => {
      console.error(`❌ Auth failure for user ${userId}:`, msg);
      session.status = 'disconnected';
      this.emit('auth_failure', { userId, error: msg });
    });
  }

  /**
   * Maneja mensajes entrantes y los procesa con IA
   */
  private async handleIncomingMessage(userId: string, message: any) {
    try {
      // Evitar responder a mensajes propios
      if (message.fromMe) return;

      console.log(`📨 Message received for user ${userId}: ${message.body}`);

      // Obtener contacto del chat
      const contact = await message.getContact();
      const chat = await message.getChat();
      
      const contactPhone = contact.id.user;
      const contactName = contact.pushname || contact.name || 'Usuario';

      // Obtener configuración del chatbot
      const chatbotConfig = await this.getChatbotConfig(userId);
      
      if (!chatbotConfig || !chatbotConfig.enabled) {
        console.log(`🤖 Chatbot disabled for user ${userId}`);
        return;
      }

      // Generar respuesta con IA
      const aiResponse = await enhancedAI.generateResponse(
        message.body,
        userId,
        'ConversIA',
        [] // historial - implementar después
      );

      // Responder automáticamente
      if (aiResponse.message) {
        await message.reply(aiResponse.message);
        console.log(`🤖 AI Response sent to ${contactPhone}: ${aiResponse.message}`);
      }

      // Guardar conversación en CRM
      await this.saveConversationToCRM({
        userId,
        contactPhone,
        contactName,
        incomingMessage: message.body,
        aiResponse: aiResponse.message || '',
        chatbotId: chatbotConfig.id
      });

    } catch (error) {
      console.error(`❌ Error handling message for user ${userId}:`, error);
    }
  }

  /**
   * Envía un mensaje manualmente desde el CRM
   */
  async sendMessage(userId: string, phoneNumber: string, message: string): Promise<boolean> {
    const session = this.sessions.get(userId);
    
    if (!session || session.status !== 'connected') {
      throw new Error('WhatsApp no está conectado');
    }

    try {
      // Formatear número para WhatsApp
      const chatId = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;
      
      await session.client.sendMessage(chatId, message);
      
      console.log(`📤 Manual message sent from user ${userId} to ${phoneNumber}: ${message}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Error sending message from user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de la sesión
   */
  getSessionStatus(userId: string): { status: string; qrCode?: string } {
    const session = this.sessions.get(userId);
    
    if (!session) {
      return { status: 'disconnected' };
    }

    return {
      status: session.status,
      qrCode: session.qrCode
    };
  }

  /**
   * Destruye una sesión
   */
  async destroySession(userId: string): Promise<void> {
    const session = this.sessions.get(userId);
    
    if (session) {
      try {
        await session.client.destroy();
      } catch (error) {
        console.error(`Error destroying session for ${userId}:`, error);
      }
      
      this.sessions.delete(userId);
      await this.updateUserWhatsAppStatus(userId, 'disconnected');
    }
  }

  /**
   * Obtiene configuración del chatbot
   */
  private async getChatbotConfig(userId: string): Promise<any> {
    try {
      // Obtener el primer chatbot activo del usuario
      const chatbots = await storage.getChatbots(userId);
      return chatbots.find(bot => bot.status === 'active') || null;
    } catch (error) {
      console.error('Error getting chatbot config:', error);
      return null;
    }
  }

  /**
   * Actualiza el estado de WhatsApp del usuario
   */
  private async updateUserWhatsAppStatus(userId: string, status: string): Promise<void> {
    try {
      // Implementar actualización en base de datos
      console.log(`📊 Updated WhatsApp status for user ${userId}: ${status}`);
    } catch (error) {
      console.error('Error updating WhatsApp status:', error);
    }
  }

  /**
   * Guarda conversación en CRM
   */
  private async saveConversationToCRM(data: {
    userId: string;
    contactPhone: string;
    contactName: string;
    incomingMessage: string;
    aiResponse: string;
    chatbotId: number;
  }): Promise<void> {
    try {
      await CRMService.logConversation({
        userId: data.userId,
        contactPhone: data.contactPhone,
        contactName: data.contactName,
        messageType: 'incoming',
        messageContent: data.incomingMessage,
        chatbotId: data.chatbotId
      });

      if (data.aiResponse) {
        await CRMService.logConversation({
          userId: data.userId,
          contactPhone: data.contactPhone,
          contactName: data.contactName,
          messageType: 'outgoing',
          messageContent: data.aiResponse,
          chatbotId: data.chatbotId
        });
      }
    } catch (error) {
      console.error('Error saving conversation to CRM:', error);
    }
  }

  /**
   * Obtiene información de todas las sesiones activas
   */
  getActiveSessions(): { userId: string; status: string }[] {
    return Array.from(this.sessions.entries()).map(([userId, session]) => ({
      userId,
      status: session.status
    }));
  }
}

// Singleton instance
export const whatsappWebService = new WhatsAppWebService();