import { EventEmitter } from 'events';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

interface WhatsAppSession {
  isConnected: boolean;
  qrCode?: string;
  status: 'initializing' | 'qr_ready' | 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError?: string;
  phoneNumber?: string;
  client?: Client;
}

class WhatsAppService extends EventEmitter {
  private sessions: Map<string, WhatsAppSession> = new Map();

  async initializeSession(sessionId: string): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      console.log(`🔄 Initializing real WhatsApp session: ${sessionId}`);
      
      // Create WhatsApp client with authentication
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: sessionId
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

      // Store session
      const session: WhatsAppSession = {
        isConnected: false,
        status: 'initializing',
        client: client
      };
      
      this.sessions.set(sessionId, session);

      // Set up event handlers
      client.on('qr', (qr) => {
        console.log(`📋 QR Code generated for session: ${sessionId}`);
        session.qrCode = qr;
        session.status = 'qr_ready';
        this.emit('qr', sessionId, qr);
      });

      client.on('ready', () => {
        console.log(`✅ WhatsApp client ready for session: ${sessionId}`);
        session.isConnected = true;
        session.status = 'connected';
        session.phoneNumber = client.info?.wid?.user || 'Unknown';
        this.emit('ready', sessionId);
      });

      client.on('authenticated', () => {
        console.log(`🔐 WhatsApp authenticated for session: ${sessionId}`);
        session.status = 'connecting';
      });

      client.on('disconnected', (reason) => {
        console.log(`📱 WhatsApp disconnected for session: ${sessionId}, reason: ${reason}`);
        session.isConnected = false;
        session.status = 'disconnected';
        this.emit('disconnected', sessionId, reason);
      });

      client.on('auth_failure', (message) => {
        console.error(`❌ WhatsApp auth failure for session: ${sessionId}, message: ${message}`);
        session.status = 'error';
        session.lastError = message;
        this.emit('auth_failure', sessionId, message);
      });

      // Initialize the client
      await client.initialize();

      return { success: true };
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

  getSessionStatus(sessionId: string): WhatsAppSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    // Create a clean status object without the client instance
    return {
      isConnected: session.isConnected,
      qrCode: session.qrCode,
      status: session.status,
      lastError: session.lastError,
      phoneNumber: session.phoneNumber
    };
  }

  async sendMessage(sessionId: string, to: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session || !session.isConnected || !session.client) {
        return { success: false, error: 'WhatsApp session not connected' };
      }

      console.log(`📤 Sending message via session ${sessionId} to ${to}: ${message}`);
      
      // Format phone number for WhatsApp (ensure it has @c.us suffix)
      const formattedNumber = to.includes('@') ? to : `${to}@c.us`;
      
      // Send message using real WhatsApp client
      await session.client.sendMessage(formattedNumber, message);
      
      return { success: true };
    } catch (error) {
      console.error(`Error sending message via session ${sessionId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async destroySession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = this.sessions.get(sessionId);
      if (session && session.client) {
        await session.client.destroy();
      }
      this.sessions.delete(sessionId);
      console.log(`🗑️ WhatsApp session destroyed: ${sessionId}`);
      return { success: true };
    } catch (error) {
      console.error(`Error destroying WhatsApp session ${sessionId}:`, error);
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