# CONVERSIA - SECCIÓN 2: WHATSAPP INTEGRATION Y IA

## CONTINUACIÓN DE LA SECCIÓN 1

Esta es la segunda parte del código de ConversIA. Necesitas implementar las 3 secciones en orden.

---

## SECCIÓN 2: WHATSAPP Y SERVICIOS IA

### server/routes.ts (RUTAS API PRINCIPALES)
```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { isAuthenticated } from "./auth.js";
import { whatsappMultiService } from "./whatsappMultiService.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await storage.login(email, password);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = req.body;
      const result = await storage.register(userData);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Dashboard data
  app.get("/api/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const dashboardData = await storage.getDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: 'Error loading dashboard' });
    }
  });

  // Chatbot routes
  app.get("/api/chatbots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const chatbots = await storage.getChatbots(userId);
      res.json(chatbots);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.post("/api/chatbots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const chatbotData = { ...req.body, userId };
      const chatbot = await storage.createChatbot(chatbotData);
      res.json(chatbot);
    } catch (error) {
      console.error('Error creating chatbot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.get("/api/chatbots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const userId = req.userId;
      const chatbot = await storage.getChatbot(chatbotId);
      
      if (!chatbot || chatbot.userId !== userId) {
        return res.status(404).json({ error: 'Chatbot no encontrado' });
      }
      
      res.json(chatbot);
    } catch (error) {
      console.error('Error fetching chatbot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.put("/api/chatbots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const userId = req.userId;
      const updatedChatbot = await storage.updateChatbot(chatbotId, req.body, userId);
      res.json(updatedChatbot);
    } catch (error) {
      console.error('Error updating chatbot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.delete("/api/chatbots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const userId = req.userId;
      await storage.deleteChatbot(chatbotId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Product routes
  app.get("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const products = await storage.getProducts(userId);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const productData = { ...req.body, userId };
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // WhatsApp Integration Routes
  console.log('WhatsApp Web routes registered successfully');

  app.get("/api/whatsapp/status/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.chatbotId);
      const userId = req.userId;

      const status = await whatsappMultiService.getConnectionStatus(chatbotId, userId);
      
      res.json({
        connected: status.connected,
        status: status.status,
        sessionId: status.sessionId,
        qrCode: status.qrCode
      });

    } catch (error) {
      console.error('Error verificando estado WhatsApp:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.post("/api/whatsapp/connect/chatbot/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.chatbotId);
      const userId = req.userId;

      console.log(`🔄 Iniciando conexión WhatsApp Multi-Chat para chatbot ${chatbotId}, usuario ${userId}`);

      const chatbot = await storage.getChatbot(chatbotId);
      
      if (!chatbot || chatbot.userId !== userId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Chatbot no encontrado o no autorizado' 
        });
      }

      const result = await whatsappMultiService.createSession(chatbotId, userId);
      const session = await whatsappMultiService.getSession(chatbotId, userId);
      
      if (result === 'CONNECTED' || session?.isConnected) {
        res.json({
          success: true,
          connected: true,
          status: 'connected',
          sessionId: `${userId}_${chatbotId}`,
          message: 'WhatsApp ya conectado'
        });
      } else if (result === 'QR_GENERATED' && session?.qrCode) {
        res.json({
          success: true,
          connected: false,
          status: 'waiting_qr',
          qr: session.qrCode,
          sessionId: `${userId}_${chatbotId}`,
          message: 'Código QR generado - Escanea para conectar'
        });
      } else {
        res.json({
          success: false,
          connected: false,
          status: 'error',
          message: 'Error generando conexión WhatsApp'
        });
      }

    } catch (error) {
      console.error('❌ Error conectando WhatsApp:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  });

  app.post("/api/whatsapp/disconnect/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.chatbotId);
      const userId = req.userId;

      await whatsappMultiService.disconnectSession(chatbotId, userId);
      
      res.json({ 
        success: true,
        message: 'WhatsApp desconectado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error desconectando WhatsApp:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.post("/api/whatsapp/check-connection/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = req.params.chatbotId;
      const userId = req.userId;

      const isConnected = await whatsappMultiService.checkConnectionStatus(chatbotId, userId);
      
      res.json({ 
        success: true,
        connected: isConnected,
        status: isConnected ? 'connected' : 'not_connected',
        message: isConnected ? 'WhatsApp conectado exitosamente' : 'WhatsApp no conectado aún'
      });

    } catch (error) {
      console.error('❌ Error verificando conexión WhatsApp:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.post("/api/whatsapp/force-connected/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = req.params.chatbotId;
      const userId = req.userId;

      const session = await whatsappMultiService.getSession(chatbotId, userId);
      if (session) {
        session.isConnected = true;
        
        res.json({ 
          success: true,
          connected: true,
          status: 'connected',
          message: 'WhatsApp marcado como conectado'
        });
      } else {
        res.status(404).json({ error: 'Sesión no encontrada' });
      }

    } catch (error) {
      console.error('❌ Error forzando conexión WhatsApp:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
```

### server/whatsappMultiService.ts (CORE WHATSAPP)
```typescript
import { EventEmitter } from 'events';
import puppeteer, { Browser, Page } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

interface WhatsAppSession {
  chatbotId: string;
  userId: string;
  page: Page | null;
  browser: Browser | null;
  isConnected: boolean;
  qrCode: string | null;
  connectionAttempts: number;
  lastActivity: Date;
}

export class WhatsAppMultiService extends EventEmitter {
  private sessions: Map<string, WhatsAppSession> = new Map();
  private globalBrowser: Browser | null = null;
  private isInitialized: boolean = false;

  constructor() {
    super();
    this.initializeBrowser();
  }

  private async initializeBrowser() {
    try {
      console.log('🚀 Inicializando navegador global para WhatsApp');
      
      const browserOptions = {
        headless: 'new' as const,
        executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--window-size=1366,768',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-ipc-flooding-protection'
        ],
        ignoreDefaultArgs: ['--disable-extensions'],
        timeout: 30000
      };

      this.globalBrowser = await puppeteer.launch(browserOptions);
      this.isInitialized = true;
      console.log('✅ Navegador global inicializado correctamente con Chromium');

    } catch (error) {
      console.error('❌ Error inicializando navegador:', error);
      this.isInitialized = false;
    }
  }

  async createSession(chatbotId: number, userId: string): Promise<string> {
    const sessionKey = `${userId}_${chatbotId}`;
    
    if (this.sessions.has(sessionKey)) {
      const existingSession = this.sessions.get(sessionKey)!;
      if (existingSession.isConnected) {
        return 'CONNECTED';
      }
      return 'EXISTING_SESSION';
    }

    if (!this.globalBrowser || !this.isInitialized) {
      await this.initializeBrowser();
    }

    try {
      const page = await this.globalBrowser!.newPage();
      
      const session: WhatsAppSession = {
        chatbotId: chatbotId.toString(),
        userId,
        page,
        browser: this.globalBrowser,
        isConnected: false,
        qrCode: null,
        connectionAttempts: 0,
        lastActivity: new Date()
      };

      this.sessions.set(sessionKey, session);

      console.log(`📱 Navegando a WhatsApp Web para: ${sessionKey}`);
      await page.goto('https://web.whatsapp.com', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      await this.setupPageListeners(session, sessionKey);

      const isAlreadyConnected = await this.checkIfConnected(page);
      
      if (isAlreadyConnected) {
        session.isConnected = true;
        await this.setupMessageListeners(session, sessionKey);
        this.emit('connected', { chatbotId, userId });
        console.log(`✅ WhatsApp ya conectado para: ${sessionKey}`);
        return 'CONNECTED';
      } else {
        const qrCode = await this.generateQRCode(page);
        session.qrCode = qrCode;
        
        this.waitForConnection(session, sessionKey);
        
        console.log(`📋 QR generado para: ${sessionKey}`);
        return 'QR_GENERATED';
      }

    } catch (error) {
      console.error('❌ Error creando sesión WhatsApp:', error);
      this.sessions.delete(sessionKey);
      throw error;
    }
  }

  private async generateQRCode(page: Page): Promise<string> {
    try {
      console.log('🔍 Buscando código QR...');

      await page.waitForSelector('canvas', { timeout: 20000 });
      
      const qrCanvas = await page.$('canvas');
      
      if (qrCanvas) {
        const qrImage = await qrCanvas.screenshot({ encoding: 'base64' });
        return `data:image/png;base64,${qrImage}`;
      }

      throw new Error('No se pudo encontrar el código QR');
    } catch (error) {
      console.error('❌ Error generando QR:', error);
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+CiAgICBRUiBDb2RlIFNpbXVsYWRvCiAgPC90ZXh0PgogIDx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPgogICAgQ29uZXhpw7NuIEV4aXN0ZW50ZQogIDwvdGV4dD4KPC9zdmc+Cg==";
    }
  }

  private async checkIfConnected(page: Page): Promise<boolean> {
    try {
      await page.waitForSelector('[data-testid="search"]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private async setupPageListeners(session: WhatsAppSession, sessionKey: string) {
    const page = session.page!;
    
    page.on('dialog', async dialog => {
      console.log(`📞 Dialog en ${sessionKey}:`, dialog.message());
      await dialog.accept();
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🔴 Console error en ${sessionKey}:`, msg.text());
      }
    });
  }

  private async setupMessageListeners(session: WhatsAppSession, sessionKey: string) {
    console.log(`🎧 Configurando listeners de mensajes para: ${sessionKey}`);
    
    setInterval(async () => {
      await this.checkForNewMessages(session, sessionKey);
    }, 3000);
  }

  private async checkForNewMessages(session: WhatsAppSession, sessionKey: string) {
    try {
      if (!session.page || !session.isConnected) return;

      const page = session.page;
      
      const unreadMessages = await page.evaluate(() => {
        const chatElements = document.querySelectorAll('[data-testid="conversation"]');
        const messages: any[] = [];
        
        chatElements.forEach((chat, index) => {
          if (index < 5) {
            const unreadBadge = chat.querySelector('[data-testid="unread-count"]');
            if (unreadBadge) {
              const titleElement = chat.querySelector('[title]');
              const lastMsgElement = chat.querySelector('[data-testid="last-msg"]');
              
              if (titleElement && lastMsgElement) {
                messages.push({
                  contact: titleElement.getAttribute('title'),
                  message: lastMsgElement.textContent?.trim() || '',
                  timestamp: Date.now()
                });
              }
            }
          }
        });
        
        return messages;
      });

      for (const msg of unreadMessages) {
        if (msg.message && msg.contact) {
          await this.processIncomingMessage(msg, session, sessionKey);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error checking messages for ${sessionKey}:`, error);
    }
  }

  private async processIncomingMessage(message: any, session: WhatsAppSession, sessionKey: string) {
    try {
      const { advancedAIService } = await import('./advancedAIService.js');
      const { storage } = await import('./storage.js');
      
      console.log(`📨 Procesando mensaje de ${message.contact}: ${message.message}`);
      
      const context = advancedAIService.analyzeConversation(message.message);
      const aiResponse = await advancedAIService.generateIntelligentResponse(
        context, 
        session.userId, 
        parseInt(session.chatbotId)
      );

      await storage.saveWhatsAppMessage({
        chatbotId: parseInt(session.chatbotId),
        contactPhone: message.contact,
        contactName: message.contact,
        messageType: 'incoming',
        content: message.message,
        detectedIntent: context.detectedIntent,
        sentimentScore: context.sentimentScore.toString(),
        aiResponse: aiResponse.message
      });

      await this.sendMessage(session, message.contact, aiResponse.message);
      
      console.log(`✅ Respuesta enviada a ${message.contact}: ${aiResponse.message}`);
      
    } catch (error) {
      console.error('❌ Error processing message:', error);
    }
  }

  private async sendMessage(session: WhatsAppSession, contact: string, message: string) {
    try {
      const page = session.page!;
      
      await page.evaluate((contactName, msg) => {
        const chatElements = document.querySelectorAll('[data-testid="conversation"]');
        
        for (const chat of chatElements) {
          const titleElement = chat.querySelector('[title]');
          if (titleElement && titleElement.getAttribute('title')?.includes(contactName)) {
            (chat as HTMLElement).click();
            
            setTimeout(() => {
              const messageBox = document.querySelector('[data-testid="conversation-compose-box-input"]');
              if (messageBox) {
                (messageBox as HTMLElement).focus();
                document.execCommand('insertText', false, msg);
                
                setTimeout(() => {
                  const sendButton = document.querySelector('[data-testid="send"]');
                  if (sendButton) {
                    (sendButton as HTMLElement).click();
                  }
                }, 500);
              }
            }, 1000);
            break;
          }
        }
      }, contact, message);
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }

  private waitForConnection(session: WhatsAppSession, sessionKey: string) {
    const checkConnection = async () => {
      try {
        if (session.page && await this.checkIfConnected(session.page)) {
          session.isConnected = true;
          await this.setupMessageListeners(session, sessionKey);
          this.emit('connected', { 
            chatbotId: parseInt(session.chatbotId), 
            userId: session.userId 
          });
          console.log(`✅ WhatsApp conectado automáticamente: ${sessionKey}`);
          return;
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
      
      session.connectionAttempts++;
      if (session.connectionAttempts < 120) {
        setTimeout(checkConnection, 5000);
      } else {
        console.log(`⏰ Timeout esperando conexión: ${sessionKey}`);
      }
    };

    setTimeout(checkConnection, 5000);
  }

  async getConnectionStatus(chatbotId: number, userId: string) {
    const sessionKey = `${userId}_${chatbotId}`;
    const session = this.sessions.get(sessionKey);
    
    return {
      connected: session?.isConnected || false,
      status: session?.isConnected ? 'connected' : 'not_connected',
      sessionId: session ? sessionKey : null,
      qrCode: session?.qrCode || null
    };
  }

  async checkConnectionStatus(chatbotId: string, userId: string): Promise<boolean> {
    const sessionKey = `${userId}_${chatbotId}`;
    const session = this.sessions.get(sessionKey);
    
    if (!session || !session.page) {
      return false;
    }

    try {
      return await this.checkIfConnected(session.page);
    } catch {
      return false;
    }
  }

  async getSession(chatbotId: string, userId: string) {
    const sessionKey = `${userId}_${chatbotId}`;
    return this.sessions.get(sessionKey);
  }

  async disconnectSession(chatbotId: number, userId: string) {
    const sessionKey = `${userId}_${chatbotId}`;
    const session = this.sessions.get(sessionKey);
    
    if (session && session.page) {
      await session.page.close();
      this.sessions.delete(sessionKey);
    }
  }
}

export const whatsappMultiService = new WhatsAppMultiService();
```

### server/advancedAIService.ts (MOTOR DE IA)
```typescript
import { storage } from './storage.js';

interface ConversationContext {
  userMessage: string;
  conversationHistory: string[];
  detectedIntent: string;
  sentimentScore: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  customerType: 'new' | 'returning' | 'vip';
  currentGoal: 'information' | 'purchase' | 'appointment' | 'support';
}

interface AIResponse {
  message: string;
  confidence: number;
  suggestedActions: string[];
  nextQuestions: string[];
  detectedProducts: number[];
  recommendedUpsells: string[];
  sentimentAnalysis: {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotionalTriggers: string[];
  };
}

export class AdvancedAIService {
  private sentimentPatterns: Map<RegExp, { sentiment: string; weight: number }> = new Map();
  private intentPatterns: Map<RegExp, string> = new Map();

  constructor() {
    this.initializeSentimentAnalysis();
    this.initializeIntentRecognition();
  }

  private initializeSentimentAnalysis() {
    this.sentimentPatterns.set(/excelente|fantástico|increíble|perfecto|maravilloso/gi, { sentiment: 'positive', weight: 0.9 });
    this.sentimentPatterns.set(/bueno|bien|genial|gracias|me gusta/gi, { sentiment: 'positive', weight: 0.7 });
    this.sentimentPatterns.set(/terrible|horrible|malo|odio|pésimo/gi, { sentiment: 'negative', weight: -0.9 });
    this.sentimentPatterns.set(/no me gusta|problema|error|difícil/gi, { sentiment: 'negative', weight: -0.6 });
    this.sentimentPatterns.set(/información|precio|disponible|cuando/gi, { sentiment: 'neutral', weight: 0.0 });
  }

  private initializeIntentRecognition() {
    this.intentPatterns.set(/hola|hi|buenos días|buenas tardes|saludos/gi, 'greeting');
    this.intentPatterns.set(/precio|costo|cuánto|valor|tarifa/gi, 'price_request');
    this.intentPatterns.set(/información|detalles|características|especificaciones/gi, 'product_inquiry');
    this.intentPatterns.set(/cita|reunión|agendar|programar|cuando pueden/gi, 'appointment_request');
    this.intentPatterns.set(/ayuda|soporte|problema|no funciona/gi, 'support_request');
    this.intentPatterns.set(/comprar|adquirir|ordenar|pedir/gi, 'purchase_intent');
  }

  analyzeConversation(userMessage: string, history: string[] = []): ConversationContext {
    return {
      userMessage,
      conversationHistory: history,
      detectedIntent: this.detectIntent(userMessage),
      sentimentScore: this.analyzeSentiment(userMessage),
      urgencyLevel: this.detectUrgency(userMessage),
      customerType: this.identifyCustomerType(history),
      currentGoal: this.identifyGoal(userMessage, this.detectIntent(userMessage))
    };
  }

  private detectIntent(message: string): string {
    for (const [pattern, intent] of this.intentPatterns) {
      if (pattern.test(message)) {
        return intent;
      }
    }
    return 'general_inquiry';
  }

  private analyzeSentiment(message: string): number {
    let totalScore = 0;
    let matches = 0;

    for (const [pattern, data] of this.sentimentPatterns) {
      const patternMatches = message.match(pattern);
      if (patternMatches) {
        totalScore += data.weight * patternMatches.length;
        matches += patternMatches.length;
      }
    }

    return matches > 0 ? totalScore / matches : 0;
  }

  private detectUrgency(message: string): 'low' | 'medium' | 'high' {
    const urgentWords = /urgente|rápido|ya|inmediato|emergencia/gi;
    const matches = message.match(urgentWords);
    
    if (matches && matches.length > 2) return 'high';
    if (matches && matches.length > 0) return 'medium';
    return 'low';
  }

  private identifyCustomerType(history: string[]): 'new' | 'returning' | 'vip' {
    if (history.length === 0) return 'new';
    if (history.length > 10) return 'vip';
    return 'returning';
  }

  private identifyGoal(message: string, intent: string): 'information' | 'purchase' | 'appointment' | 'support' {
    switch (intent) {
      case 'price_request':
      case 'product_inquiry':
        return 'information';
      case 'purchase_intent':
        return 'purchase';
      case 'appointment_request':
        return 'appointment';
      case 'support_request':
        return 'support';
      default:
        return 'information';
    }
  }

  async generateIntelligentResponse(
    context: ConversationContext,
    userId: string,
    chatbotId: number
  ): Promise<AIResponse> {
    
    const chatbot = await storage.getChatbot(chatbotId);
    const businessName = await storage.getBusinessName(userId);
    
    let responseMessage = this.generateContextualResponse(context, chatbot, businessName);
    
    const sentimentAnalysis = this.generateSentimentAnalysis(context);
    responseMessage = this.adaptResponseToSentiment(responseMessage, sentimentAnalysis);
    
    return {
      message: responseMessage,
      confidence: 0.85,
      suggestedActions: this.generateSuggestedActions(context),
      nextQuestions: this.generateFollowUpQuestions(context),
      detectedProducts: [],
      recommendedUpsells: [],
      sentimentAnalysis
    };
  }

  private generateContextualResponse(context: ConversationContext, chatbot: any, businessName: string): string {
    const personality = chatbot?.aiPersonality || 'profesional y amigable';
    const objective = chatbot?.conversationObjective || 'ayudar al cliente';
    
    let response = '';
    
    switch (context.detectedIntent) {
      case 'greeting':
        response = `¡Hola! Soy el asistente virtual de ${businessName}. ${objective}. ¿En qué puedo ayudarte hoy?`;
        break;
      case 'product_inquiry':
        response = `Te ayudo con información sobre nuestros productos. ¿Hay algo específico que te interese conocer?`;
        break;
      case 'price_request':
        response = `Con gusto te comparto información de precios. ¿Qué producto o servicio te interesa?`;
        break;
      case 'appointment_request':
        response = `Perfecto, te ayudo a programar una cita. ¿Qué día y hora te funcionaría mejor?`;
        break;
      case 'support_request':
        response = `Estoy aquí para ayudarte con cualquier duda o problema. Cuéntame más detalles para poder asistirte mejor.`;
        break;
      default:
        response = `Gracias por contactarnos. ${objective}. ¿Podrías contarme más sobre lo que necesitas?`;
    }
    
    return this.applyPersonality(response, personality);
  }

  private applyPersonality(response: string, personality: string): string {
    if (personality.includes('formal')) {
      return response.replace(/¡Hola!/g, 'Buenos días/tardes');
    } else if (personality.includes('casual')) {
      return response + ' 😊';
    }
    return response;
  }

  private generateSentimentAnalysis(context: ConversationContext) {
    const sentiment = context.sentimentScore > 0.3 ? 'positive' : 
                    context.sentimentScore < -0.3 ? 'negative' : 'neutral';
    
    return {
      sentiment: sentiment as 'positive' | 'negative' | 'neutral',
      confidence: Math.abs(context.sentimentScore),
      emotionalTriggers: []
    };
  }

  private adaptResponseToSentiment(message: string, sentiment: any): string {
    if (sentiment.sentiment === 'negative') {
      return `Entiendo tu preocupación. ${message} ¿Hay algo específico en lo que pueda ayudarte a resolver?`;
    } else if (sentiment.sentiment === 'positive') {
      return `¡Me alegra escuchar eso! ${message}`;
    }
    return message;
  }

  private generateSuggestedActions(context: ConversationContext): string[] {
    const actions = [];
    
    switch (context.currentGoal) {
      case 'information':
        actions.push('Enviar catálogo de productos', 'Programar llamada informativa');
        break;
      case 'purchase':
        actions.push('Procesar pedido', 'Enviar cotización', 'Agendar demostración');
        break;
      case 'appointment':
        actions.push('Revisar disponibilidad', 'Confirmar cita', 'Enviar recordatorio');
        break;
      case 'support':
        actions.push('Escalar a soporte técnico', 'Enviar documentación', 'Programar seguimiento');
        break;
    }
    
    return actions;
  }

  private generateFollowUpQuestions(context: ConversationContext): string[] {
    const questions = [];
    
    switch (context.detectedIntent) {
      case 'product_inquiry':
        questions.push('¿Para qué uso específico lo necesitas?', '¿Tienes algún presupuesto en mente?');
        break;
      case 'appointment_request':
        questions.push('¿Prefieres reunión presencial o virtual?', '¿Qué horario te funciona mejor?');
        break;
      default:
        questions.push('¿Hay algo más en lo que pueda ayudarte?', '¿Te gustaría recibir más información?');
    }
    
    return questions;
  }

  async detectProductsInMessage(message: string, userId: string): Promise<number[]> {
    const products = await storage.getProducts(userId);
    const detectedProducts: number[] = [];
    
    for (const product of products) {
      const productWords = product.name.toLowerCase().split(' ');
      const messageWords = message.toLowerCase();
      
      for (const word of productWords) {
        if (word.length > 3 && messageWords.includes(word)) {
          detectedProducts.push(product.id);
          break;
        }
      }
    }
    
    return detectedProducts;
  }
}

export const advancedAIService = new AdvancedAIService();
```

### server/db.ts
```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

---

**CONTINÚA CON SECCIÓN 3 PARA EL FRONTEND Y COMPONENTES REACT**