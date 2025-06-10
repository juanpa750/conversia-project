const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
import QRCode from 'qrcode';
import { EventEmitter } from 'events';

interface WhatsAppSession {
  client: Client;
  isConnected: boolean;
  qrCode?: string;
  status: 'initializing' | 'qr_ready' | 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError?: string;
}

class WhatsAppService extends EventEmitter {
  private sessions: Map<string, WhatsAppSession> = new Map();

  async initializeSession(sessionId: string): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      console.log(`🔄 Initializing WhatsApp session: ${sessionId}`);
      
      // Create new client with persistent session
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: sessionId,
          dataPath: './whatsapp_sessions'
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
        client,
        isConnected: false,
        status: 'initializing'
      };
      this.sessions.set(sessionId, session);

      // Setup event listeners
      client.on('qr', async (qr) => {
        console.log(`📱 QR Code generated for session: ${sessionId}`);
        try {
          const qrCodeDataURL = await QRCode.toDataURL(qr);
          session.qrCode = qrCodeDataURL;
          session.status = 'qr_ready';
          this.emit('qr', sessionId, qrCodeDataURL);
        } catch (error) {
          console.error('Error generating QR code:', error);
          session.status = 'error';
          session.lastError = 'Error generating QR code';
        }
      });

      client.on('ready', () => {
        console.log(`✅ WhatsApp client ready for session: ${sessionId}`);
        session.isConnected = true;
        session.status = 'connected';
        session.qrCode = undefined;
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
        session.lastError = `Authentication failed: ${msg}`;
        this.emit('auth_failure', sessionId, msg);
      });

      client.on('disconnected', (reason) => {
        console.log(`🔌 WhatsApp disconnected for session ${sessionId}:`, reason);
        session.isConnected = false;
        session.status = 'disconnected';
        session.lastError = `Disconnected: ${reason}`;
        this.emit('disconnected', sessionId, reason);
      });

      client.on('message', async (message) => {
        this.emit('message', sessionId, message);
      });

      // Initialize client
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
    return this.sessions.get(sessionId) || null;
  }

  async sendMessage(sessionId: string, to: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session || !session.isConnected) {
        return { success: false, error: 'WhatsApp session not connected' };
      }

      // Format phone number (ensure it has country code)
      const formattedNumber = to.replace(/\D/g, ''); // Remove non-digits
      const chatId = `${formattedNumber}@c.us`;

      await session.client.sendMessage(chatId, message);
      console.log(`📤 Message sent via session ${sessionId} to ${to}`);
      
      return { success: true };
    } catch (error) {
      console.error(`Error sending message via session ${sessionId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async sendMedia(sessionId: string, to: string, mediaPath: string, caption?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session || !session.isConnected) {
        return { success: false, error: 'WhatsApp session not connected' };
      }

      const formattedNumber = to.replace(/\D/g, '');
      const chatId = `${formattedNumber}@c.us`;

      const media = MessageMedia.fromFilePath(mediaPath);
      await session.client.sendMessage(chatId, media, { caption });
      
      console.log(`📤 Media sent via session ${sessionId} to ${to}`);
      return { success: true };
    } catch (error) {
      console.error(`Error sending media via session ${sessionId}:`, error);
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

      if (session.client) {
        await session.client.destroy();
      }
      
      this.sessions.delete(sessionId);
      console.log(`🔌 WhatsApp session ${sessionId} disconnected and removed`);
      
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

      const info = await session.client.info;
      return info.wid.user;
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
}

export const whatsappService = new WhatsAppService();