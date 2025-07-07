import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import QRCode from 'qrcode';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';

interface RealWhatsAppSession {
  client: Client;
  isConnected: boolean;
  qrCode?: string;
  status: 'initializing' | 'qr_ready' | 'connecting' | 'connected' | 'disconnected' | 'error';
  phoneNumber?: string;
  sessionId: string;
}

export class RealWhatsAppService extends EventEmitter {
  private sessions: Map<string, RealWhatsAppSession> = new Map();
  private sessionDir = path.join(process.cwd(), 'whatsapp-sessions');

  constructor() {
    super();
    // Ensure session directory exists
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  async initializeSession(sessionId: string): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      console.log(`🔄 Starting REAL WhatsApp session: ${sessionId}`);
      
      // Clean up existing session if exists
      await this.destroySession(sessionId);
      
      const clientSessionPath = path.join(this.sessionDir, sessionId);
      
      // Create WhatsApp client with real authentication
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: sessionId,
          dataPath: clientSessionPath
        }),
        puppeteer: {
          headless: 'new',
          executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
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
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--user-data-dir=/tmp/chrome-user-data',
            '--remote-debugging-port=0',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        }
      });

      const session: RealWhatsAppSession = {
        client,
        isConnected: false,
        status: 'initializing',
        sessionId
      };

      this.sessions.set(sessionId, session);

      // Set up event handlers
      client.on('qr', async (qr) => {
        try {
          console.log(`📱 Real QR Code generated for session: ${sessionId}`);
          const qrCodeImage = await QRCode.toDataURL(qr, {
            errorCorrectionLevel: 'M',
            width: 512,
            margin: 2
          });
          
          session.qrCode = qrCodeImage;
          session.status = 'qr_ready';
          
          console.log(`✅ Real QR Code ready (${qrCodeImage.length} chars)`);
          this.emit('qr', sessionId, qrCodeImage);
        } catch (error) {
          console.error(`Error generating QR for session ${sessionId}:`, error);
        }
      });

      client.on('ready', () => {
        console.log(`✅ WhatsApp client ready for session: ${sessionId}`);
        session.isConnected = true;
        session.status = 'connected';
        session.qrCode = undefined;
        
        // Get phone number
        client.info.wid.user && (session.phoneNumber = `+${client.info.wid.user}`);
        
        this.emit('ready', sessionId);
      });

      client.on('authenticated', () => {
        console.log(`🔐 WhatsApp authenticated for session: ${sessionId}`);
        session.status = 'connecting';
        this.emit('authenticated', sessionId);
      });

      client.on('auth_failure', (msg) => {
        console.error(`❌ WhatsApp auth failure for session ${sessionId}:`, msg);
        session.status = 'error';
        this.emit('auth_failure', sessionId, msg);
      });

      client.on('disconnected', (reason) => {
        console.log(`🔌 WhatsApp disconnected for session ${sessionId}:`, reason);
        session.isConnected = false;
        session.status = 'disconnected';
        session.qrCode = undefined;
        this.emit('disconnected', sessionId, reason);
      });

      // Manejador de mensajes entrantes - CRÍTICO PARA RESPUESTAS
      client.on('message', async (message: any) => {
        try {
          // Solo procesar mensajes de texto entrantes (no enviados por nosotros)
          if (message.body && !message.fromMe && message.type === 'chat') {
            console.log(`📨 Mensaje recibido en sesión ${sessionId}: ${message.body} de ${message.from}`);
            await this.processIncomingMessage(message, sessionId);
          }
        } catch (error) {
          console.error(`❌ Error procesando mensaje en sesión ${sessionId}:`, error);
        }
      });

      // Initialize the client
      await client.initialize();

      return { success: true };
    } catch (error) {
      console.error(`Error initializing real WhatsApp session ${sessionId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getSessionStatus(sessionId: string): {
    connected: boolean;
    status: string;
    qrCode?: string;
    phoneNumber?: string;
  } {
    const session = this.sessions.get(sessionId);
    console.log(`🔍 Getting status for session ${sessionId}:`, session ? {
      status: session.status,
      connected: session.isConnected,
      hasQR: !!session.qrCode
    } : 'not found');
    
    if (!session) {
      return {
        connected: false,
        status: 'not_found'
      };
    }

    return {
      connected: session.isConnected,
      status: session.status,
      qrCode: session.qrCode,
      phoneNumber: session.phoneNumber
    };
  }

  async sendMessage(sessionId: string, to: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session || !session.isConnected) {
        return { success: false, error: 'WhatsApp session not connected' };
      }

      const chatId = to.includes('@') ? to : `${to}@c.us`;
      await session.client.sendMessage(chatId, message);
      
      console.log(`📤 Real message sent via session ${sessionId} to ${to}`);
      return { success: true };
    } catch (error) {
      console.error(`Error sending real message via session ${sessionId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async destroySession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = this.sessions.get(sessionId);
      if (session) {
        await session.client.destroy();
        this.sessions.delete(sessionId);
        console.log(`🗑️ Real WhatsApp session destroyed: ${sessionId}`);
      }
      return { success: true };
    } catch (error) {
      console.error(`Error destroying real WhatsApp session ${sessionId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async disconnectSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return { success: false, error: 'Session not found' };
      }

      await session.client.logout();
      session.isConnected = false;
      session.status = 'disconnected';
      session.qrCode = undefined;
      
      console.log(`🔌 Real WhatsApp session disconnected: ${sessionId}`);
      return { success: true };
    } catch (error) {
      console.error(`Error disconnecting real WhatsApp session ${sessionId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getAllSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  // Procesar mensaje entrante y generar respuesta AI
  private async processIncomingMessage(message: any, sessionId: string): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        console.error(`❌ Sesión no encontrada: ${sessionId}`);
        return;
      }

      // Extraer chatbotId del sessionId (formato: test_user_29 o userId_chatbotId)
      let chatbotId: number;
      if (sessionId.includes('test_user_')) {
        chatbotId = parseInt(sessionId.replace('test_user_', ''));
      } else {
        chatbotId = parseInt(sessionId.split('_')[1]);
      }
      
      if (!chatbotId || isNaN(chatbotId)) {
        console.error(`❌ ChatbotId no válido en sessionId: ${sessionId}`);
        return;
      }

      // Importar servicios necesarios
      const { chatbotProductAI } = await import('./chatbotProductAIService');
      const { simpleStorage } = await import('./storage');

      // Obtener configuración del chatbot
      const chatbot = await simpleStorage.getChatbot(chatbotId);
      if (!chatbot) {
        console.error(`❌ Chatbot ${chatbotId} no encontrado`);
        return;
      }

      console.log(`🤖 Procesando mensaje con chatbot: ${chatbot.name}`);

      // Sistema de activación por conversación
      const triggerWords = chatbot.triggerKeywords || [];
      const messageText = message.body.toLowerCase();
      const contactPhone = message.from;
      
      // Verificar si ya existe una conversación activa para este contacto
      let isActiveConversation = false;
      try {
        const { simpleStorage } = await import('./storage');
        const recentMessages = await simpleStorage.getRecentMessagesForContact(chatbotId, contactPhone, 30); // últimos 30 minutos
        isActiveConversation = recentMessages && recentMessages.length > 0;
      } catch (error) {
        console.log('No se pudo verificar conversación activa, asumiendo nueva conversación');
      }
      
      let shouldRespond = false;
      
      if (isActiveConversation) {
        // Si hay conversación activa, responder a todo
        shouldRespond = true;
        console.log(`🔄 Conversación activa detectada para ${contactPhone}`);
      } else if (triggerWords.length === 0) {
        // Si no hay palabras activadoras configuradas, responder a todo
        shouldRespond = true;
        console.log(`🚀 Sin palabras activadoras, respondiendo a todo`);
      } else {
        // Verificar si el mensaje contiene alguna palabra activadora para iniciar conversación
        shouldRespond = triggerWords.some((keyword: string) => 
          messageText.includes(keyword.toLowerCase())
        );
        if (shouldRespond) {
          console.log(`🎯 Palabra activadora detectada: ${triggerWords.find(k => messageText.includes(k.toLowerCase()))}`);
        }
      }

      if (!shouldRespond) {
        console.log(`⏭️ Conversación no activa y sin palabras activadoras: ${triggerWords.join(', ')}`);
        return;
      }

      // Generar respuesta con IA
      const aiResponse = await chatbotProductAI.generateIntelligentResponse(
        message.body,
        chatbot.userId,
        chatbotId,
        []  // historial vacío por simplicidad
      );

      let responseText = aiResponse.message;

      // Si hay mensaje de bienvenida y es primera interacción, usarlo
      if (chatbot.welcomeMessage && chatbot.welcomeMessage.trim()) {
        responseText = chatbot.welcomeMessage + '\n\n' + responseText;
      }

      console.log(`🤖 Enviando respuesta: ${responseText.substring(0, 100)}...`);

      // Enviar respuesta
      await message.reply(responseText);

      // Guardar mensaje en la base de datos
      try {
        await simpleStorage.saveWhatsAppMessage({
          chatbotId: chatbotId,
          contactPhone: message.from,
          contactName: message.notifyName || 'Usuario',
          messageType: 'received',
          content: message.body,
          messageId: message.id._serialized,
          aiResponse: responseText
        });
      } catch (dbError) {
        console.error('Error guardando mensaje en BD:', dbError);
        // No interrumpir el flujo por errores de BD
      }

      console.log(`✅ Mensaje procesado exitosamente para chatbot ${chatbotId}`);

    } catch (error) {
      console.error(`❌ Error procesando mensaje en sesión ${sessionId}:`, error);
    }
  }
}

export const realWhatsAppService = new RealWhatsAppService();