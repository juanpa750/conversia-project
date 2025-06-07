import QRCode from 'qrcode';
import { EventEmitter } from 'events';
import { freeAIService } from './freeAIService';

interface WhatsAppSimpleSession {
  userId: string;
  status: 'disconnected' | 'qr_pending' | 'authenticating' | 'connected' | 'error';
  qrCode?: string;
  qrCodeImage?: string;
  lastError?: string;
  connectedAt?: Date;
  phoneNumber?: string;
  profileName?: string;
}

class WhatsAppSimpleService extends EventEmitter {
  private sessions: Map<string, WhatsAppSimpleSession> = new Map();

  constructor() {
    super();
  }

  async initializeSession(userId: string): Promise<void> {
    console.log(`Initializing WhatsApp session for user: ${userId}`);

    if (this.sessions.has(userId)) {
      console.log(`Session already exists for user: ${userId}`);
      return;
    }

    const session: WhatsAppSimpleSession = {
      userId,
      status: 'disconnected'
    };

    this.sessions.set(userId, session);
    await this.simulateConnectionFlow(session);
  }

  private async simulateConnectionFlow(session: WhatsAppSimpleSession) {
    const { userId } = session;

    // Generate QR Code immediately
    await this.generateQRCode(session);
    
    // Auto-connect after 45 seconds for demo (in production, this would wait for actual scan)
    setTimeout(() => {
      this.completeConnection(session);
    }, 45000);
  }

  private async generateQRCode(session: WhatsAppSimpleSession) {
    try {
      // Generate realistic QR data
      const qrData = `2@${Buffer.from(`${session.userId}-${Date.now()}`).toString('base64')},${Math.random().toString(36).substring(7)},Aw==`;
      
      // Generate QR code image
      const qrCodeImage = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      session.status = 'qr_pending';
      session.qrCode = qrData;
      session.qrCodeImage = qrCodeImage;

      console.log(`QR code generated for user: ${session.userId}`);
      this.emit('qr_generated', session.userId, qrCodeImage);
    } catch (error) {
      console.error(`Error generating QR for user ${session.userId}:`, error);
      session.status = 'error';
      session.lastError = 'Error generating QR code';
    }
  }

  private completeConnection(session: WhatsAppSimpleSession) {
    session.status = 'connected';
    session.connectedAt = new Date();
    session.phoneNumber = '+1234567890';
    session.profileName = 'Demo User';
    session.qrCode = undefined;
    session.qrCodeImage = undefined;

    console.log(`WhatsApp connected for user: ${session.userId}`);
    this.emit('connected', session.userId, {
      phoneNumber: session.phoneNumber,
      profileName: session.profileName
    });

    // Simular mensajes entrantes para demostración
    setTimeout(() => {
      this.simulateIncomingMessage(session.userId, '+1234567891', 'Hola, ¿tienen productos disponibles?');
    }, 10000); // Después de 10 segundos

    setTimeout(() => {
      this.simulateIncomingMessage(session.userId, '+1234567892', 'Buenos días, quisiera información sobre precios');
    }, 25000); // Después de 25 segundos
  }

  async sendMessage(userId: string, to: string, message: string): Promise<boolean> {
    const session = this.sessions.get(userId);
    if (!session || session.status !== 'connected') {
      return false;
    }

    console.log(`Sending message from ${userId} to ${to}: ${message}`);
    // In production, this would send actual WhatsApp message
    return true;
  }

  async disconnectSession(userId: string): Promise<void> {
    const session = this.sessions.get(userId);
    if (session) {
      session.status = 'disconnected';
      this.sessions.delete(userId);
      console.log(`Session disconnected for user: ${userId}`);
    }
  }

  getSessionStatus(userId: string): WhatsAppSimpleSession | null {
    return this.sessions.get(userId) || null;
  }

  async getQRCode(userId: string): Promise<string | null> {
    const session = this.sessions.get(userId);
    return session?.qrCodeImage || null;
  }

  async restartSession(userId: string): Promise<void> {
    await this.disconnectSession(userId);
    await this.initializeSession(userId);
  }

  // Simular mensajes entrantes para demostración
  private async simulateIncomingMessage(userId: string, fromNumber: string, message: string): Promise<void> {
    const session = this.sessions.get(userId);
    if (!session || session.status !== 'connected') {
      return;
    }

    console.log(`📱 Mensaje entrante para ${userId} de ${fromNumber}: ${message}`);

    // Generar respuesta automática usando IA gratuita
    const aiResponse = await freeAIService.generateResponse({
      userMessage: message,
      conversationHistory: [],
      businessType: 'general',
      language: 'es'
    });

    // Simular respuesta automática después de 2-3 segundos
    setTimeout(() => {
      console.log(`🤖 Respuesta automática enviada a ${fromNumber}: ${aiResponse.message}`);
      
      // Emitir evento para notificar a la aplicación
      this.emit('message_received', {
        userId,
        fromNumber,
        message,
        autoResponse: aiResponse.message,
        timestamp: new Date()
      });
    }, 2000 + Math.random() * 1000);
  }

  // Método para enviar mensaje de prueba manual
  async sendTestMessage(userId: string, fromNumber: string, message: string): Promise<void> {
    await this.simulateIncomingMessage(userId, fromNumber, message);
  }
}

export const whatsappSimpleService = new WhatsAppSimpleService();