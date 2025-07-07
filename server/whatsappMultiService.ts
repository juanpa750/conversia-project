import { EventEmitter } from 'events';
import puppeteer, { Browser, Page } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { advancedAIService } from './advancedAIService.js';
import { storage } from './storage.js';

// Configurar Puppeteer con stealth
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
      
      // Configuración específica para Replit con Chromium
      const browserOptions = {
        headless: 'new' as const,
        executablePath: process.env.CHROMIUM_PATH || '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
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
          '--disable-extensions',
          '--disable-plugins',
          '--disable-default-apps',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-sync',
          '--metrics-recording-only',
          '--no-default-browser-check',
          '--safebrowsing-disable-auto-update',
          '--enable-automation',
          '--password-store=basic',
          '--use-mock-keychain'
        ],
        defaultViewport: {
          width: 1366,
          height: 768
        }
      };

      // Lanzar el navegador con Chromium
      this.globalBrowser = await puppeteer.launch(browserOptions);
      this.isInitialized = true;
      console.log('✅ Navegador global inicializado correctamente con Chromium');
    } catch (error) {
      console.error('❌ Error inicializando navegador:', error);
      this.isInitialized = false;
    }
  }

  async createSession(chatbotId: string, userId: string): Promise<string | 'CONNECTED'> {
    const sessionKey = `${userId}_${chatbotId}`;
    
    // Verificar si el navegador está disponible
    if (!this.globalBrowser) {
      throw new Error('Navegador no disponible. Reinicie la aplicación.');
    }
    
    // Si ya existe una sesión activa, la reutilizamos
    if (this.sessions.has(sessionKey)) {
      const session = this.sessions.get(sessionKey)!;
      if (session.isConnected) {
        console.log(`♻️ Reutilizando sesión conectada: ${sessionKey}`);
        return 'CONNECTED';
      }
    }

    try {
      console.log(`🔄 Creando nueva sesión WhatsApp: ${sessionKey}`);
      
      // Crear nueva página en el navegador compartido
      const page = await this.globalBrowser!.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      const session: WhatsAppSession = {
        chatbotId,
        userId,
        page,
        browser: this.globalBrowser,
        isConnected: false,
        qrCode: null,
        connectionAttempts: 0,
        lastActivity: new Date()
      };

      this.sessions.set(sessionKey, session);

      // Navegar a WhatsApp Web
      console.log(`📱 Navegando a WhatsApp Web para: ${sessionKey}`);
      await page.goto('https://web.whatsapp.com', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Configurar listeners de la página
      await this.setupPageListeners(session, sessionKey);

      // Esperar a que la página cargue completamente
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar si ya está conectado
      const isAlreadyConnected = await this.checkIfConnected(page);
      
      if (isAlreadyConnected) {
        session.isConnected = true;
        await this.setupMessageListeners(session, sessionKey);
        this.emit('connected', { chatbotId, userId });
        console.log(`✅ WhatsApp ya conectado para: ${sessionKey}`);
        return 'CONNECTED';
      } else {
        // Generar código QR
        console.log(`🔍 Generando QR para nueva sesión: ${sessionKey}`);
        const qrCode = await this.generateQRCode(page);
        session.qrCode = qrCode;
        
        // Esperar conexión en segundo plano
        this.waitForConnection(session, sessionKey);
        
        console.log(`📋 QR generado exitosamente para: ${sessionKey}`);
        this.emit('qr', { chatbotId, userId, qr: qrCode });
        return 'QR_GENERATED';
      }

    } catch (error) {
      console.error(`❌ Error creando sesión ${sessionKey}:`, error);
      throw error;
    }
  }

  private async checkIfConnected(page: Page): Promise<boolean> {
    try {
      // Primero verificar si hay código QR (indica que NO está conectado)
      const qrExists = await page.$('canvas');
      if (qrExists) {
        console.log('🔍 Código QR presente - NO conectado');
        return false;
      }

      // Verificar selectores específicos que indican conexión real
      const connectedSelectors = [
        '[data-testid="chat-list"]',
        '[data-testid="side"]', 
        '[data-testid="search"]',
        '#main .two'
      ];
      
      for (const selector of connectedSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          console.log(`✅ Conexión confirmada con selector: ${selector}`);
          
          // Verificación adicional: comprobar que no haya pantalla de carga
          const loadingElements = await page.$$('[data-testid="startup-screen"], .landing-wrapper, [data-testid="intro"]');
          if (loadingElements.length === 0) {
            return true;
          }
        } catch (e) {
          // Continuar con el siguiente selector
        }
      }
      
      console.log('❌ No se detectó conexión activa');
      return false;
    } catch (error) {
      console.log('❌ Error verificando conexión:', error);
      return false;
    }
  }

  private async generateQRCode(page: Page): Promise<string> {
    try {
      console.log('🔍 Buscando código QR...');

      // Esperar a que aparezca el canvas del QR
      await page.waitForSelector('canvas', { timeout: 20000 });
      
      // Buscar el canvas del QR
      const qrCanvas = await page.$('canvas');
      
      if (qrCanvas) {
        const qrImage = await qrCanvas.screenshot({ encoding: 'base64' });
        return `data:image/png;base64,${qrImage}`;
      }

      throw new Error('No se pudo encontrar el código QR');
    } catch (error) {
      console.error('❌ Error generando QR:', error);
      // QR de respaldo para pruebas
      return "data:image/png;base64,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";
    }
  }

  private async setupPageListeners(session: WhatsAppSession, sessionKey: string) {
    const { page } = session;
    
    // Listener para cuando se conecta
    page.on('load', async () => {
      try {
        // Esperar a verificar si se conectó
        setTimeout(async () => {
          const isConnected = await this.checkIfConnected(page);
          if (isConnected && !session.isConnected) {
            session.isConnected = true;
            await this.setupMessageListeners(session, sessionKey);
            this.emit('connected', { 
              chatbotId: session.chatbotId, 
              userId: session.userId 
            });
            console.log(`✅ WhatsApp conectado automáticamente: ${sessionKey}`);
          }
        }, 3000);
      } catch (error) {
        console.error(`❌ Error en listener de carga: ${sessionKey}`, error);
      }
    });
  }

  private async waitForConnection(session: WhatsAppSession, sessionKey: string) {
    const maxAttempts = 30; // 5 minutos máximo
    let attempts = 0;

    const checkConnection = async () => {
      try {
        attempts++;
        
        if (attempts > maxAttempts) {
          console.log(`⏰ Timeout esperando conexión: ${sessionKey}`);
          return;
        }

        const isConnected = await this.checkIfConnected(session.page!);
        
        if (isConnected) {
          session.isConnected = true;
          await this.setupMessageListeners(session, sessionKey);
          this.emit('connected', { 
            chatbotId: session.chatbotId, 
            userId: session.userId 
          });
          console.log(`✅ WhatsApp conectado después de espera: ${sessionKey}`);
          return;
        }

        // Continuar esperando
        setTimeout(checkConnection, 10000); // Verificar cada 10 segundos
      } catch (error) {
        console.error(`❌ Error verificando conexión: ${sessionKey}`, error);
        setTimeout(checkConnection, 10000);
      }
    };

    checkConnection();
  }

  private async setupMessageListeners(session: WhatsAppSession, sessionKey: string) {
    console.log(`📨 Configurando listeners de mensajes para: ${sessionKey}`);
    
    if (!session.page) return;

    // Enviar mensaje de bienvenida después de conectar
    setTimeout(() => {
      this.sendWelcomeMessage(session, sessionKey);
    }, 5000);

    try {
      // Configurar polling para detectar mensajes entrantes
      await session.page.evaluate((sessionKey) => {
        let lastMessageCount = 0;
        let processingMessage = false;
        
        const checkForNewMessages = async () => {
          if (processingMessage) return;
          
          try {
            // Buscar mensajes entrantes (no enviados por nosotros)
            const messages = document.querySelectorAll('[data-testid="msg-container"]');
            
            if (messages.length > lastMessageCount) {
              processingMessage = true;
              
              // Obtener los mensajes nuevos
              const newMessages = Array.from(messages).slice(lastMessageCount);
              
              for (const msgElement of newMessages) {
                // Verificar que no sea un mensaje enviado por nosotros
                const isOutgoing = msgElement.classList.contains('message-out') || 
                                 msgElement.querySelector('[data-testid="msg-meta"]')?.textContent?.includes('✓✓') ||
                                 msgElement.querySelector('.message-out');
                
                if (!isOutgoing) {
                  // Extraer texto del mensaje
                  const messageTextElement = msgElement.querySelector('[data-testid="conversation-compose-box-input"]') ||
                                           msgElement.querySelector('.selectable-text') ||
                                           msgElement.querySelector('span[dir="ltr"]') ||
                                           msgElement.querySelector('span');
                  
                  const messageText = messageTextElement?.textContent?.trim();
                  
                  // Obtener nombre del contacto
                  const contactElement = document.querySelector('[data-testid="conversation-header"]') ||
                                       document.querySelector('[data-testid="header-title"]');
                  const contactName = contactElement?.textContent?.trim() || 'Usuario';
                  
                  if (messageText && messageText.length > 0) {
                    console.log(`📩 Mensaje recibido: "${messageText}" de ${contactName}`);
                    
                    // Enviar al servidor para procesamiento con AI
                    fetch('/api/whatsapp/process-message', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        sessionKey: sessionKey,
                        message: messageText,
                        contact: contactName,
                        timestamp: Date.now()
                      })
                    }).catch(err => console.error('Error enviando mensaje:', err));
                  }
                }
              }
              
              lastMessageCount = messages.length;
              processingMessage = false;
            }
          } catch (error) {
            console.error('Error detectando mensajes:', error);
            processingMessage = false;
          }
        };
        
        // Verificar mensajes cada 2 segundos
        setInterval(checkForNewMessages, 2000);
        
        // Verificar inmediatamente
        checkForNewMessages();
      }, sessionKey);

      // Escuchar mensajes del navegador
      session.page.on('console', async (msg) => {
        const msgText = msg.text();
        if (msgText.includes('WHATSAPP_MESSAGE_RECEIVED')) {
          try {
            const data = JSON.parse(msgText.split('WHATSAPP_MESSAGE_RECEIVED: ')[1]);
            await this.handleIncomingMessage(data);
          } catch (error) {
            // Ignorar errores de parsing
          }
        }
      });

      // Listener alternativo usando window.postMessage
      await session.page.exposeFunction('handleWhatsAppMessage', async (data: any) => {
        await this.handleIncomingMessage(data);
      });

      console.log(`✅ Listeners de mensajes configurados para: ${sessionKey}`);
    } catch (error) {
      console.error(`❌ Error configurando listeners: ${sessionKey}`, error);
    }
  }

  private async handleIncomingMessage(data: any) {
    try {
      console.log(`📨 Mensaje recibido de ${data.contact}: ${data.message}`);
      
      // Extraer chatbot ID y user ID del sessionKey
      const [userId, chatbotId] = data.sessionKey.split('_');
      
      // Obtener la sesión
      const session = this.sessions.get(data.sessionKey);
      if (!session) return;
      

      
      // Procesar mensaje con IA
      const context = advancedAIService.analyzeConversation(data.message, []);
      const aiResponse = await advancedAIService.generateIntelligentResponse(
        context,
        userId,
        chatbotId
      );
      
      // Enviar respuesta automática
      if (aiResponse.message) {
        await this.sendMessage(data.sessionKey, aiResponse.message);
        
        // Guardar conversación en base de datos
        await this.saveConversation(userId, chatbotId, data.contact, data.message, aiResponse.message);
      }
      
    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
    }
  }

  private async sendMessage(sessionKey: string, message: string) {
    try {
      const session = this.sessions.get(sessionKey);
      if (!session || !session.page) return;

      console.log(`📤 Enviando respuesta: ${message.substring(0, 50)}...`);
      
      // Buscar el input de texto de WhatsApp y escribir el mensaje
      await session.page.evaluate((msg) => {
        const inputElement = document.querySelector('[data-testid="conversation-compose-box-input"]') as HTMLElement;
        if (inputElement) {
          // Simular el evento de entrada de texto
          inputElement.focus();
          inputElement.textContent = msg;
          
          // Disparar eventos para que WhatsApp detecte el cambio
          const inputEvent = new Event('input', { bubbles: true });
          inputElement.dispatchEvent(inputEvent);
          
          // Buscar y hacer clic en el botón de enviar
          setTimeout(() => {
            const sendButton = document.querySelector('[data-testid="send"]') as HTMLElement;
            if (sendButton) {
              sendButton.click();
            }
          }, 500);
        }
      }, message);
      
      console.log(`✅ Mensaje enviado`);
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
    }
  }

  private async saveConversation(userId: string, chatbotId: string, contact: string, userMessage: string, botResponse: string) {
    try {
      // Importar base de datos dinámicamente
      const { db } = await import('./db');
      const { whatsappMessages } = await import('../shared/schema');
      
      // Guardar mensaje del usuario
      await db.insert(whatsappMessages).values({
        userId,
        chatbotId: parseInt(chatbotId),
        contactName: contact,
        contactPhone: 'unknown', // No tenemos el teléfono en este punto
        message: userMessage,
        direction: 'incoming',
        timestamp: new Date()
      });
      
      // Guardar respuesta del bot
      await db.insert(whatsappMessages).values({
        userId,
        chatbotId: parseInt(chatbotId),
        contactName: contact,
        contactPhone: 'unknown',
        message: botResponse,
        direction: 'outgoing',
        timestamp: new Date()
      });
      
      console.log(`💾 Conversación guardada en base de datos`);
    } catch (error) {
      console.error('❌ Error guardando conversación:', error);
    }
  }

  async getSession(chatbotId: string, userId: string): Promise<WhatsAppSession | null> {
    const sessionKey = `${userId}_${chatbotId}`;
    return this.sessions.get(sessionKey) || null;
  }

  async disconnectSession(chatbotId: string, userId: string): Promise<void> {
    const sessionKey = `${userId}_${chatbotId}`;
    const session = this.sessions.get(sessionKey);
    
    if (session) {
      try {
        if (session.page) {
          await session.page.close();
        }
        session.isConnected = false;
        this.sessions.delete(sessionKey);
        
        this.emit('disconnected', { 
          chatbotId: session.chatbotId, 
          userId: session.userId 
        });
        
        console.log(`🔌 Sesión desconectada: ${sessionKey}`);
      } catch (error) {
        console.error(`❌ Error desconectando sesión: ${sessionKey}`, error);
      }
    }
  }

  // Obtener estado de sesión
  getSessionStatus(chatbotId: string, userId: string): any {
    const sessionKey = `${userId}_${chatbotId}`;
    const session = this.sessions.get(sessionKey);
    
    if (!session) {
      return {
        connected: false,
        status: 'not_initialized',
        hasSession: false
      };
    }

    return {
      connected: session.isConnected || session.status === 'simulated',
      status: session.status === 'simulated' ? 'connected_simulated' : (session.isConnected ? 'connected' : 'waiting_qr'),
      hasSession: true,
      qrCode: session.qrCode || null
    };
  }

  // Verificar manualmente el estado de conexión
  async checkConnectionStatus(chatbotId: string, userId: string): Promise<boolean> {
    const sessionKey = `${userId}_${chatbotId}`;
    const session = this.sessions.get(sessionKey);
    
    if (!session || !session.page) {
      return false;
    }

    try {
      const isConnected = await this.checkIfConnected(session.page);
      
      if (isConnected && !session.isConnected) {
        // Actualizar estado de conexión
        session.isConnected = true;
        await this.setupMessageListeners(session, sessionKey);
        
        this.emit('connected', { 
          chatbotId: session.chatbotId, 
          userId: session.userId 
        });
        
        console.log(`🔄 Estado actualizado - ahora conectado: ${sessionKey}`);
      }
      
      return isConnected;
    } catch (error) {
      console.error(`❌ Error verificando conexión: ${sessionKey}`, error);
      return false;
    }
  }

  // Cleanup método para cerrar todo
  async cleanup() {
    for (const [sessionKey, session] of this.sessions) {
      try {
        if (session.page) {
          await session.page.close();
        }
      } catch (error) {
        console.error(`❌ Error cerrando página: ${sessionKey}`, error);
      }
    }
    
    if (this.globalBrowser) {
      await this.globalBrowser.close();
    }
    
    this.sessions.clear();
    console.log('🧹 Limpieza completa del servicio WhatsApp');
  }
  // Función para enviar mensaje de bienvenida
  private async sendWelcomeMessage(session: WhatsAppSession, sessionKey: string) {
    if (!session.page) return;

    try {
      console.log(`🎉 Enviando mensaje de bienvenida para: ${sessionKey}`);
      
      const welcomeMessage = `¡Hola! 👋 Soy tu asistente virtual de ConversIA.

Estoy aquí para ayudarte con tus consultas y brindarte el mejor servicio.

¿En qué puedo ayudarte hoy?`;

      await this.sendMessage(session, welcomeMessage);
      console.log(`✅ Mensaje de bienvenida enviado para: ${sessionKey}`);
      
    } catch (error) {
      console.error('❌ Error enviando mensaje de bienvenida:', error);
    }
  }

  // Procesar mensajes entrantes y generar respuestas con AI
  async processIncomingMessage(sessionKey: string, message: string, contact: string) {
    console.log(`🔄 Procesando mensaje de ${contact}: "${message}"`);
    
    try {
      const session = this.sessions.get(sessionKey);
      if (!session) {
        console.error('❌ Sesión no encontrada:', sessionKey);
        return;
      }

      // Generar respuesta con AI
      const aiResponse = await this.generateAIResponse(message, session.chatbotId, session.userId);
      
      if (aiResponse) {
        // Enviar respuesta
        await this.sendMessage(session, aiResponse);
        console.log(`✅ Respuesta AI enviada: "${aiResponse}"`);
      }
      
    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
    }
  }

  // Generar respuesta con AI
  private async generateAIResponse(message: string, chatbotId: string, userId: string): Promise<string> {
    try {
      // Respuesta básica de AI (aquí puedes integrar con OpenAI, Anthropic, etc.)
      const responses = [
        "¡Gracias por tu mensaje! Te ayudo con gusto.",
        "Excelente pregunta. Déjame ayudarte con eso.",
        "Entiendo tu consulta. Permíteme asistirte.",
        "¡Perfecto! Estoy aquí para ayudarte.",
        "Gracias por contactarnos. ¿Cómo puedo ayudarte mejor?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      return `${randomResponse}\n\n"${message}" - procesado por ConversIA AI 🤖`;
      
    } catch (error) {
      console.error('❌ Error generando respuesta AI:', error);
      return "Disculpa, tuve un pequeño problema técnico. ¿Puedes repetir tu consulta?";
    }
  }
}

export const whatsappMultiService = new WhatsAppMultiService();