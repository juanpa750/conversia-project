import QRCode from 'qrcode';
import { EventEmitter } from 'events';
import WebSocket from 'ws';

interface WhatsAppSession {
  isConnected: boolean;
  qrCode?: string;
  status: 'initializing' | 'qr_ready' | 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError?: string;
  phoneNumber?: string;
  sessionData?: any;
}

class WhatsAppService extends EventEmitter {
  private sessions: Map<string, WhatsAppSession> = new Map();

  async initializeSession(sessionId: string): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      console.log(`🔄 Initializing WhatsApp session: ${sessionId}`);
      
      // Generate WhatsApp-compatible QR code format
      const timestamp = Date.now();
      const randomRef = Math.random().toString(36).substring(2, 15);
      const publicKey = Buffer.from(`whatsapp-web-${sessionId}-${timestamp}`).toString('base64');
      const privateKey = Buffer.from(`private-${randomRef}-${timestamp}`).toString('base64');
      
      // WhatsApp Web QR format: ref,publicKey,privateKey,serverToken,advSecret,status
      const qrData = `${randomRef},${publicKey},${privateKey},s1,c0,2`;
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });

      // Store session
      const session: WhatsAppSession = {
        isConnected: false,
        status: 'qr_ready',
        qrCode: qrCodeDataURL
      };
      
      this.sessions.set(sessionId, session);

      // Simulate QR scan process
      setTimeout(() => {
        this.simulateQRScan(sessionId);
      }, 5000); // Auto-connect after 5 seconds for demo

      return { success: true, qrCode: qrCodeDataURL };
    } catch (error) {
      console.error(`Error initializing WhatsApp session ${sessionId}:`, error);
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = 'error';
        session.lastError = error instanceof Error ? error.message : 'Unknown error';
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private simulateQRScan(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.log(`📱 Simulating QR scan for session: ${sessionId}`);
    
    // Update to connecting
    session.status = 'connecting';
    session.qrCode = undefined;
    this.emit('qr_scanned', sessionId);

    // Simulate connection process
    setTimeout(() => {
      if (session.status === 'connecting') {
        session.isConnected = true;
        session.status = 'connected';
        session.phoneNumber = '+521234567890'; // Simulated phone number
        console.log(`✅ WhatsApp connected for session: ${sessionId}`);
        this.emit('connected', sessionId);
      }
    }, 3000);
  }

  getSessionStatus(sessionId: string): WhatsAppSession | null {
    return this.sessions.get(sessionId) || null;
  }

  async sendMessage(sessionId: string, to: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session || !session.isConnected) {
        return { success: false, error: 'WhatsApp session not connected' };
      }

      // Simulate message sending
      console.log(`📤 Sending message via session ${sessionId} to ${to}: ${message}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (error) {
      console.error(`Error sending message via session ${sessionId}:`, error);
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

      session.isConnected = false;
      session.status = 'disconnected';
      session.qrCode = undefined;
      
      console.log(`🔌 WhatsApp session ${sessionId} disconnected`);
      this.emit('disconnected', sessionId);
      
      return { success: true };
    } catch (error) {
      console.error(`Error disconnecting session ${sessionId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getConnectedNumber(sessionId: string): Promise<string | null> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session || !session.isConnected) {
        return null;
      }

      return session.phoneNumber?.replace('+', '') || null;
    } catch (error) {
      console.error(`Error getting connected number for session ${sessionId}:`, error);
      return null;
    }
  }

  listSessions(): { sessionId: string; status: string; isConnected: boolean }[] {
    return Array.from(this.sessions.entries()).map(([sessionId, session]) => ({
      sessionId,
      status: session.status,
      isConnected: session.isConnected
    }));
  }

  // Real-time connection updates
  async connectWithQR(sessionId: string): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return await this.initializeSession(sessionId);
    }

    if (session.status === 'qr_ready' && session.qrCode) {
      return { success: true, qrCode: session.qrCode };
    }

    return await this.initializeSession(sessionId);
  }
}

export const whatsappService = new WhatsAppService();