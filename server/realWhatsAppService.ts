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
}

export const realWhatsAppService = new RealWhatsAppService();