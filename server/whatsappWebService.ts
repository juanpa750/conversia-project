import QRCode from 'qrcode';
import { storage } from './storage';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';

interface WhatsAppWebSession {
  userId: string;
  status: 'disconnected' | 'qr_pending' | 'authenticating' | 'connected' | 'error';
  qrCode?: string;
  lastError?: string;
  connectedAt?: Date;
  phoneNumber?: string;
  profileName?: string;
  simulatedClient?: any;
}

class WhatsAppWebService extends EventEmitter {
  private sessions: Map<string, WhatsAppWebSession> = new Map();
  private aiService: any; // Importaremos el servicio de IA

  constructor() {
    super();
    this.setupDirectories();
  }

  private setupDirectories() {
    const sessionDir = path.join(process.cwd(), '.wwebjs_auth');
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
  }

  async initializeSession(userId: string): Promise<void> {
    if (this.sessions.has(userId)) {
      await this.disconnectSession(userId);
    }

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: `user_${userId}`,
        dataPath: path.join(process.cwd(), '.wwebjs_auth')
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
          '--disable-gpu'
        ]
      }
    });

    const session: WhatsAppWebSession = {
      userId,
      client,
      status: 'disconnected'
    };

    this.sessions.set(userId, session);
    this.setupClientEvents(session);

    try {
      await client.initialize();
    } catch (error: any) {
      session.status = 'error';
      session.lastError = error.message;
      this.emit('session_error', userId, error.message);
    }
  }

  private setupClientEvents(session: WhatsAppWebSession) {
    const { client, userId } = session;

    client.on('qr', async (qr) => {
      try {
        const qrCodeData = await QRCode.toDataURL(qr, {
          width: 512,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        session.qrCode = qrCodeData;
        session.status = 'qr_pending';
        
        this.emit('qr_code', userId, qrCodeData);
        
        // Actualizar estado en base de datos
        await this.updateSessionStatus(userId, 'qr_pending');
      } catch (error: any) {
        session.status = 'error';
        session.lastError = error.message;
        this.emit('session_error', userId, error.message);
      }
    });

    client.on('authenticated', () => {
      session.status = 'authenticating';
      this.emit('authenticated', userId);
    });

    client.on('ready', async () => {
      try {
        const info = client.info;
        session.status = 'connected';
        session.connectedAt = new Date();
        session.phoneNumber = info.wid.user;
        session.profileName = info.pushname;
        session.qrCode = undefined;

        this.emit('ready', userId, {
          phoneNumber: session.phoneNumber,
          profileName: session.profileName
        });

        // Actualizar en base de datos
        await this.updateSessionStatus(userId, 'connected', {
          phoneNumber: session.phoneNumber,
          profileName: session.profileName,
          connectedAt: session.connectedAt
        });

        console.log(`WhatsApp Web session ready for user ${userId}: ${session.profileName} (${session.phoneNumber})`);
      } catch (error: any) {
        session.status = 'error';
        session.lastError = error.message;
        this.emit('session_error', userId, error.message);
      }
    });

    client.on('message', async (message) => {
      try {
        // Solo procesar mensajes entrantes
        if (!message.fromMe && !message.isStatus) {
          await this.handleIncomingMessage(userId, message);
        }
      } catch (error: any) {
        console.error(`Error handling message for user ${userId}:`, error);
      }
    });

    client.on('disconnected', async (reason) => {
      session.status = 'disconnected';
      session.qrCode = undefined;
      
      this.emit('disconnected', userId, reason);
      await this.updateSessionStatus(userId, 'disconnected');
      
      console.log(`WhatsApp Web session disconnected for user ${userId}: ${reason}`);
    });

    client.on('auth_failure', async (message) => {
      session.status = 'error';
      session.lastError = 'Authentication failed';
      
      this.emit('auth_failure', userId, message);
      await this.updateSessionStatus(userId, 'error', { lastError: 'Authentication failed' });
    });
  }

  private async handleIncomingMessage(userId: string, message: any) {
    try {
      // Obtener configuración del usuario para respuesta automática
      const user = await storage.getUser(userId);
      if (!user) return;

      // Obtener chatbots activos del usuario
      const chatbots = await storage.getChatbotsByUser(userId);
      const activeChatbot = chatbots.find(bot => bot.status === 'active');

      if (!activeChatbot) return;

      const contact = message.getContact();
      const chat = await message.getChat();

      // Guardar mensaje entrante en base de datos
      await this.saveMessage(userId, {
        messageId: message.id.id,
        fromNumber: message.from,
        toNumber: message.to,
        content: message.body,
        type: message.type,
        direction: 'inbound',
        timestamp: new Date(message.timestamp * 1000),
        contactName: contact.name || contact.pushname || 'Unknown'
      });

      // Generar respuesta con IA
      const aiResponse = await this.generateAIResponse(activeChatbot, message.body, {
        contactName: contact.name || contact.pushname,
        chatHistory: await this.getChatHistory(userId, message.from)
      });

      if (aiResponse) {
        // Enviar respuesta
        await this.sendMessage(userId, message.from, aiResponse);
      }

    } catch (error: any) {
      console.error('Error handling incoming message:', error);
    }
  }

  private async generateAIResponse(chatbot: any, userMessage: string, context: any): Promise<string | null> {
    try {
      // Importar dinámicamente el servicio de IA de Anthropic
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      
      if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('ANTHROPIC_API_KEY not configured, skipping AI response');
        return null;
      }

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const systemPrompt = `Eres un asistente de WhatsApp para un negocio. 

Información del chatbot:
- Nombre: ${chatbot.name}
- Personalidad: ${chatbot.aiPersonality || 'Amigable y profesional'}
- Instrucciones: ${chatbot.aiInstructions || 'Ayuda a los clientes con sus consultas'}
- Objetivo de conversación: ${chatbot.conversationObjective || 'Brindar excelente servicio al cliente'}

Contexto del cliente:
- Nombre: ${context.contactName || 'Cliente'}

IMPORTANTE:
- Responde en español
- Sé conciso y útil
- Mantén un tono profesional pero amigable
- Si no puedes ayudar, ofrece derivar a un humano
- No inventes información que no tienes`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514', // the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      });

      return response.content[0]?.text || null;
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      return null;
    }
  }

  async sendMessage(userId: string, to: string, message: string): Promise<boolean> {
    const session = this.sessions.get(userId);
    if (!session || session.status !== 'connected') {
      return false;
    }

    try {
      await session.client.sendMessage(to, message);
      
      // Guardar mensaje enviado
      await this.saveMessage(userId, {
        messageId: `sent_${Date.now()}`,
        fromNumber: session.phoneNumber || '',
        toNumber: to,
        content: message,
        type: 'text',
        direction: 'outbound',
        timestamp: new Date()
      });

      return true;
    } catch (error: any) {
      console.error(`Error sending message for user ${userId}:`, error);
      return false;
    }
  }

  async sendMedia(userId: string, to: string, mediaPath: string, caption?: string): Promise<boolean> {
    const session = this.sessions.get(userId);
    if (!session || session.status !== 'connected') {
      return false;
    }

    try {
      const media = MessageMedia.fromFilePath(mediaPath);
      await session.client.sendMessage(to, media, { caption });
      
      return true;
    } catch (error: any) {
      console.error(`Error sending media for user ${userId}:`, error);
      return false;
    }
  }

  private async saveMessage(userId: string, messageData: any) {
    try {
      // Crear conversación si no existe
      const existingConversation = await storage.getConversationByContactPhone(userId, messageData.fromNumber === messageData.toNumber ? messageData.toNumber : messageData.fromNumber);
      
      let conversationId;
      if (!existingConversation) {
        // Crear nuevo contacto y conversación
        const contactData = {
          userId,
          name: messageData.contactName || 'WhatsApp Contact',
          phone: messageData.direction === 'inbound' ? messageData.fromNumber : messageData.toNumber,
          email: null,
          source: 'whatsapp' as const,
          status: 'active' as const
        };
        
        const contact = await storage.createContact(contactData);
        
        const conversationData = {
          contactId: contact.id,
          chatbotId: 1, // Default chatbot
          status: 'active',
          lastMessage: messageData.content,
          lastMessageTime: messageData.timestamp
        };
        
        const conversation = await storage.createConversation(conversationData);
        conversationId = conversation.id;
      } else {
        conversationId = existingConversation.id;
        
        // Actualizar última actividad
        await storage.updateConversation(conversationId, {
          lastMessage: messageData.content,
          lastMessageTime: messageData.timestamp
        });
      }

      // Guardar mensaje
      await storage.createMessage({
        conversationId,
        text: messageData.content,
        isFromContact: messageData.direction === 'inbound',
        createdAt: messageData.timestamp
      });

    } catch (error: any) {
      console.error('Error saving message:', error);
    }
  }

  private async getChatHistory(userId: string, phoneNumber: string): Promise<any[]> {
    try {
      const conversation = await storage.getConversationByContactPhone(userId, phoneNumber);
      if (!conversation) return [];
      
      return await storage.getMessagesByConversation(conversation.id, 10);
    } catch (error) {
      return [];
    }
  }

  private async updateSessionStatus(userId: string, status: string, additionalData?: any) {
    try {
      // Aquí actualizarías la base de datos con el estado de la sesión
      // Por ahora solo log
      console.log(`Session status updated for user ${userId}: ${status}`, additionalData);
    } catch (error: any) {
      console.error('Error updating session status:', error);
    }
  }

  async disconnectSession(userId: string): Promise<void> {
    const session = this.sessions.get(userId);
    if (!session) return;

    try {
      if (session.client) {
        await session.client.destroy();
      }
    } catch (error: any) {
      console.error(`Error disconnecting session for user ${userId}:`, error);
    }

    this.sessions.delete(userId);
    await this.updateSessionStatus(userId, 'disconnected');
  }

  getSessionStatus(userId: string): any {
    const session = this.sessions.get(userId);
    if (!session) {
      return { status: 'disconnected' };
    }

    return {
      status: session.status,
      qrCode: session.qrCode,
      phoneNumber: session.phoneNumber,
      profileName: session.profileName,
      connectedAt: session.connectedAt,
      lastError: session.lastError
    };
  }

  async getQRCode(userId: string): Promise<string | null> {
    const session = this.sessions.get(userId);
    return session?.qrCode || null;
  }

  async restartSession(userId: string): Promise<void> {
    await this.disconnectSession(userId);
    await this.initializeSession(userId);
  }

  // Limpiar sesiones al cerrar la aplicación
  async cleanup(): Promise<void> {
    const userIds = Array.from(this.sessions.keys());
    await Promise.all(userIds.map(userId => this.disconnectSession(userId)));
  }
}

// Instancia singleton del servicio
export const whatsappWebService = new WhatsAppWebService();

// Cleanup al cerrar la aplicación
process.on('SIGINT', async () => {
  console.log('Cleaning up WhatsApp Web sessions...');
  await whatsappWebService.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Cleaning up WhatsApp Web sessions...');
  await whatsappWebService.cleanup();
  process.exit(0);
});

export default whatsappWebService;