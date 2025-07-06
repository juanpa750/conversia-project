// whatsappWebService.ts - Servicio completo para WhatsApp Web
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

// Configurar puppeteer con stealth
puppeteer.use(StealthPlugin());

interface WhatsAppSession {
  chatbotId: string;
  browser: Browser;
  page: Page;
  isConnected: boolean;
  qrCode?: string;
  phoneNumber?: string;
  sessionPath: string;
}

interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  isFromMe: boolean;
  chatbotId: string;
}

class WhatsAppWebService extends EventEmitter {
  private sessions: Map<string, WhatsAppSession> = new Map();
  private sessionsDir: string;

  constructor() {
    super();
    this.sessionsDir = path.join(process.cwd(), 'whatsapp-sessions');
    this.ensureSessionsDirectory();
  }

  private ensureSessionsDirectory() {
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  // Iniciar sesión de WhatsApp para un chatbot específico
  async initializeSession(chatbotId: string): Promise<string> {
    try {
      if (this.sessions.has(chatbotId)) {
        await this.disconnectSession(chatbotId);
      }

      const sessionPath = path.join(this.sessionsDir, `session_${chatbotId}`);
      
      // Configurar navegador con stealth
      const browser = await puppeteer.launch({
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
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ],
        userDataDir: fs.existsSync(sessionPath) ? sessionPath : undefined
      });

      const page = await browser.newPage();
      
      // Configurar viewport y headers
      await page.setViewport({ width: 1366, height: 768 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Navegar a WhatsApp Web
      await page.goto('https://web.whatsapp.com', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });

      const session: WhatsAppSession = {
        chatbotId,
        browser,
        page,
        isConnected: false,
        sessionPath
      };

      this.sessions.set(chatbotId, session);

      // Configurar listeners
      await this.setupPageListeners(session);

      // Verificar si ya está conectado o necesita QR
      const isLoggedIn = await this.checkIfLoggedIn(page);
      
      if (isLoggedIn) {
        session.isConnected = true;
        await this.setupMessageListeners(session);
        this.emit('connected', { chatbotId });
        return 'CONNECTED';
      } else {
        const qrCode = await this.waitForQRCode(page);
        session.qrCode = qrCode;
        this.emit('qr', { chatbotId, qr: qrCode });
        
        // Esperar conexión
        await this.waitForConnection(session);
        return qrCode;
      }

    } catch (error) {
      console.error(`Error initializing WhatsApp session for chatbot ${chatbotId}:`, error);
      throw error;
    }
  }

  // Verificar si ya está logueado
  private async checkIfLoggedIn(page: Page): Promise<boolean> {
    try {
      await page.waitForSelector('[data-testid="chat-list"]', { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  // Esperar y capturar código QR
  private async waitForQRCode(page: Page): Promise<string> {
    try {
      console.log('Esperando código QR...');
      
      // Esperar a que aparezca el QR
      await page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 30000 });
      
      // Capturar QR como base64
      const qrElement = await page.$('canvas[aria-label="Scan me!"]');
      if (!qrElement) {
        throw new Error('No se encontró el elemento QR');
      }

      const qrCode = await qrElement.screenshot({ encoding: 'base64' });
      return `data:image/png;base64,${qrCode}`;
      
    } catch (error) {
      console.error('Error esperando QR:', error);
      throw error;
    }
  }

  // Esperar conexión después de escanear QR
  private async waitForConnection(session: WhatsAppSession): Promise<void> {
    try {
      console.log(`Esperando conexión para chatbot ${session.chatbotId}...`);
      
      // Esperar a que aparezca la lista de chats
      await session.page.waitForSelector('[data-testid="chat-list"]', { timeout: 120000 });
      
      session.isConnected = true;
      await this.setupMessageListeners(session);
      
      this.emit('connected', { chatbotId: session.chatbotId });
      console.log(`WhatsApp conectado para chatbot ${session.chatbotId}`);
      
    } catch (error) {
      console.error(`Error esperando conexión para chatbot ${session.chatbotId}:`, error);
      throw error;
    }
  }

  // Configurar listeners de página
  private async setupPageListeners(session: WhatsAppSession): Promise<void> {
    const { page, chatbotId } = session;

    // Listener para desconexión
    page.on('close', () => {
      console.log(`Página cerrada para chatbot ${chatbotId}`);
      this.emit('disconnected', { chatbotId });
    });

    // Listener para errores
    page.on('error', (error) => {
      console.error(`Error en página para chatbot ${chatbotId}:`, error);
      this.emit('error', { chatbotId, error });
    });

    // Listener para cambios de red
    page.on('response', async (response) => {
      if (response.url().includes('web.whatsapp.com') && response.status() === 500) {
        console.log(`Posible desconexión detectada para chatbot ${chatbotId}`);
        session.isConnected = false;
        this.emit('disconnected', { chatbotId });
      }
    });
  }

  // Configurar listeners de mensajes
  private async setupMessageListeners(session: WhatsAppSession): Promise<void> {
    const { page, chatbotId } = session;

    try {
      // Inyectar script para escuchar mensajes
      await page.evaluateOnNewDocument(() => {
        // @ts-ignore
        window.WhatsAppListener = {
          messages: [],
          initialized: false
        };
      });

      await page.evaluate(() => {
        // Script para interceptar mensajes
        const originalLog = console.log;
        
        // Función para detectar nuevos mensajes
        const detectMessages = () => {
          const messages = document.querySelectorAll('[data-testid="msg-container"]');
          
          messages.forEach((msgElement) => {
            const isFromMe = msgElement.classList.contains('message-out');
            const textElement = msgElement.querySelector('.selectable-text');
            
            if (textElement && !isFromMe) {
              const text = textElement.textContent || '';
              const timeElement = msgElement.querySelector('[data-testid="msg-meta"]');
              
              if (text && !textElement.hasAttribute('data-processed')) {
                textElement.setAttribute('data-processed', 'true');
                
                // Enviar mensaje al backend
                // @ts-ignore
                if (window.messageCallback) {
                  // @ts-ignore
                  window.messageCallback({
                    body: text,
                    timestamp: new Date().toISOString(),
                    isFromMe: false
                  });
                }
              }
            }
          });
        };

        // Observar cambios en el DOM
        const observer = new MutationObserver(() => {
          detectMessages();
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        // Detectar mensajes iniciales
        setTimeout(detectMessages, 2000);
      });

      // Configurar callback para mensajes
      await page.exposeFunction('messageCallback', async (messageData: any) => {
        const message: WhatsAppMessage = {
          id: Date.now().toString(),
          from: 'contact', // Se puede mejorar para obtener el número real
          to: 'chatbot',
          body: messageData.body,
          timestamp: new Date(messageData.timestamp),
          isFromMe: messageData.isFromMe,
          chatbotId
        };

        this.emit('message', message);
      });

      console.log(`Listeners de mensajes configurados para chatbot ${chatbotId}`);
      
    } catch (error) {
      console.error(`Error configurando listeners para chatbot ${chatbotId}:`, error);
    }
  }

  // Enviar mensaje
  async sendMessage(chatbotId: string, to: string, message: string): Promise<boolean> {
    const session = this.sessions.get(chatbotId);
    
    if (!session || !session.isConnected) {
      throw new Error(`Session not connected for chatbot ${chatbotId}`);
    }

    try {
      const { page } = session;
      
      // Buscar o abrir chat
      await this.openChat(page, to);
      
      // Escribir mensaje
      const messageBox = await page.waitForSelector('[data-testid="message-composer"]', { timeout: 10000 });
      await messageBox?.click();
      await messageBox?.type(message);
      
      // Enviar mensaje
      const sendButton = await page.waitForSelector('[data-testid="send"]', { timeout: 5000 });
      await sendButton?.click();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
      
    } catch (error) {
      console.error(`Error sending message for chatbot ${chatbotId}:`, error);
      return false;
    }
  }

  // Abrir chat específico
  private async openChat(page: Page, contact: string): Promise<void> {
    try {
      // Buscar en la lista de chats
      const searchBox = await page.waitForSelector('[data-testid="chat-list-search"]', { timeout: 10000 });
      await searchBox?.click();
      await searchBox?.type(contact);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Hacer clic en el primer resultado
      const firstChat = await page.waitForSelector('[data-testid="chat-list"] > div:first-child', { timeout: 10000 });
      await firstChat?.click();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error opening chat:', error);
      throw error;
    }
  }

  // Obtener estado de la sesión
  getSessionStatus(chatbotId: string): { isConnected: boolean; qrCode?: string } {
    const session = this.sessions.get(chatbotId);
    
    if (!session) {
      return { isConnected: false };
    }

    return {
      isConnected: session.isConnected,
      qrCode: session.qrCode
    };
  }

  // Desconectar sesión
  async disconnectSession(chatbotId: string): Promise<void> {
    const session = this.sessions.get(chatbotId);
    
    if (session) {
      try {
        await session.browser.close();
      } catch (error) {
        console.error(`Error closing browser for chatbot ${chatbotId}:`, error);
      }
      
      this.sessions.delete(chatbotId);
      this.emit('disconnected', { chatbotId });
    }
  }

  // Obtener todas las sesiones activas
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys()).filter(
      chatbotId => this.sessions.get(chatbotId)?.isConnected
    );
  }

  // Limpiar todas las sesiones
  async cleanup(): Promise<void> {
    const promises = Array.from(this.sessions.keys()).map(
      chatbotId => this.disconnectSession(chatbotId)
    );
    
    await Promise.all(promises);
  }
}

export default WhatsAppWebService;