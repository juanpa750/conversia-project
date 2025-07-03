import { EventEmitter } from 'events';
import QRCode from 'qrcode';

interface WhatsAppSession {
  status: 'disconnected' | 'initializing' | 'qr_ready' | 'connecting' | 'connected';
  qrCode?: string;
  userId: string;
  simulatedPhone?: string;
}

export class WhatsAppWebSimulator extends EventEmitter {
  private sessions: Map<string, WhatsAppSession> = new Map();

  /**
   * Inicializa una sesión simulada de WhatsApp Web
   */
  async initializeSession(userId: string): Promise<{ success: boolean; sessionId: string }> {
    console.log(`🚀 Initializing simulated WhatsApp Web session for user: ${userId}`);

    try {
      // Generar código QR simulado
      const qrData = this.generateQRData(userId);
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const session: WhatsAppSession = {
        status: 'qr_ready',
        qrCode: qrCodeDataUrl,
        userId,
        simulatedPhone: this.generateSimulatedPhone()
      };

      this.sessions.set(userId, session);

      // Simular autenticación después de 10 segundos
      setTimeout(() => {
        this.simulateAuthentication(userId);
      }, 10000);

      console.log(`✅ Simulated WhatsApp session initialized for user: ${userId}`);
      return { success: true, sessionId: userId };

    } catch (error) {
      console.error(`❌ Error initializing simulated WhatsApp session for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Genera datos para el código QR
   */
  private generateQRData(userId: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    return `whatsapp-web-simulator:${userId}:${timestamp}:${randomId}`;
  }

  /**
   * Genera un número de teléfono simulado
   */
  private generateSimulatedPhone(): string {
    const areaCodes = ['11', '15', '21', '351', '261'];
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const number = Math.floor(Math.random() * 90000000) + 10000000;
    return `+54${areaCode}${number}`;
  }

  /**
   * Simula el proceso de autenticación
   */
  private simulateAuthentication(userId: string): void {
    const session = this.sessions.get(userId);
    if (!session) return;

    console.log(`📱 Simulating WhatsApp authentication for session: ${userId}`);
    
    // Cambiar a estado "conectando"
    session.status = 'connecting';
    this.emit('status_update', { userId, status: 'connecting' });

    // Después de 3 segundos, cambiar a "conectado"
    setTimeout(() => {
      session.status = 'connected';
      console.log(`✅ WhatsApp authenticated for session: ${userId}`);
      this.emit('status_update', { userId, status: 'connected' });
      this.emit('authenticated', { userId, phone: session.simulatedPhone });
    }, 3000);
  }

  /**
   * Simula el envío de un mensaje
   */
  async sendMessage(userId: string, phoneNumber: string, message: string): Promise<boolean> {
    const session = this.sessions.get(userId);
    if (!session || session.status !== 'connected') {
      throw new Error('WhatsApp no está conectado');
    }

    console.log(`📤 Simulated message sent from ${userId} to ${phoneNumber}: ${message}`);
    
    // Simular mensaje de confirmación automática después de 2 segundos
    setTimeout(() => {
      this.simulateIncomingMessage(userId, phoneNumber, `Mensaje recibido: "${message}". Esta es una respuesta automática del simulador.`);
    }, 2000);

    return true;
  }

  /**
   * Simula un mensaje entrante
   */
  private simulateIncomingMessage(userId: string, fromNumber: string, messageText: string): void {
    console.log(`📥 Simulated incoming message for ${userId} from ${fromNumber}: ${messageText}`);
    
    const message = {
      from: fromNumber,
      body: messageText,
      timestamp: new Date(),
      isSimulated: true
    };

    this.emit('message', { userId, message });
  }

  /**
   * Obtiene el estado de la sesión
   */
  getSessionStatus(userId: string): { status: string; qrCode?: string; isSimulated: boolean } {
    const session = this.sessions.get(userId);
    if (!session) {
      return { status: 'disconnected', isSimulated: true };
    }

    return {
      status: session.status,
      qrCode: session.qrCode,
      isSimulated: true
    };
  }

  /**
   * Destruye una sesión
   */
  async destroySession(userId: string): Promise<void> {
    const session = this.sessions.get(userId);
    if (session) {
      console.log(`🔌 Disconnecting simulated WhatsApp session for user: ${userId}`);
      this.sessions.delete(userId);
      this.emit('disconnected', { userId });
    }
  }

  /**
   * Simula mensajes de prueba periódicos
   */
  startDemoMessages(userId: string): void {
    const session = this.sessions.get(userId);
    if (!session || session.status !== 'connected') return;

    const demoMessages = [
      'Hola, estoy interesado en sus productos',
      '¿Cuáles son sus precios?',
      'Me gustaría agendar una cita',
      '¿Tienen descuentos disponibles?',
      'Gracias por la información'
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
      if (!this.sessions.has(userId) || this.sessions.get(userId)?.status !== 'connected') {
        clearInterval(interval);
        return;
      }

      if (messageIndex < demoMessages.length) {
        this.simulateIncomingMessage(
          userId,
          session.simulatedPhone || '+54911234567',
          demoMessages[messageIndex]
        );
        messageIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30000); // Cada 30 segundos
  }

  /**
   * Obtiene información de todas las sesiones activas
   */
  getActiveSessions(): { userId: string; status: string; isSimulated: boolean }[] {
    return Array.from(this.sessions.entries()).map(([userId, session]) => ({
      userId,
      status: session.status,
      isSimulated: true
    }));
  }
}

export const whatsappWebSimulator = new WhatsAppWebSimulator();