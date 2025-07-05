import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcode from 'qrcode';
import { enhancedAI } from './enhancedAIService';
import { chatbotProductAI } from './chatbotProductAIService';
import { advancedAIService } from './advancedAIService';
import { simpleStorage } from './storage';
import { EventEmitter } from 'events';
import { execSync } from 'child_process';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

interface WhatsAppSession {
  client: Client;
  status: 'initializing' | 'qr_ready' | 'connecting' | 'connected' | 'disconnected' | 'error';
  qrCode?: string;
  lastActivity: Date;
  userId: string;
  chatbotId?: number;
}

interface MessageContext {
  userId: string;
  chatbotId?: number;
  contactPhone: string;
  contactName?: string;
  messageHistory: string[];
}

export class WhatsAppWebService extends EventEmitter {
  private sessions: Map<string, WhatsAppSession> = new Map();
  private messageHistory: Map<string, string[]> = new Map();
  
  constructor() {
    super();
    // Configurar puppeteer con stealth plugin
    puppeteer.use(StealthPlugin());
    
    // Limpiar sesiones inactivas cada 30 minutos
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 30 * 60 * 1000);
  }

  /**
   * Detecta automáticamente el path de Chromium en el sistema
   */
  private getChromiumPath(): string | undefined {
    try {
      const chromiumPath = execSync('which chromium', { encoding: 'utf8' }).trim();
      if (chromiumPath) {
        console.log(`🔍 Chromium encontrado en: ${chromiumPath}`);
        return chromiumPath;
      }
    } catch (error) {
      console.log(`⚠️  No se pudo encontrar Chromium: ${error}`);
    }
    return undefined;
  }

  /**
   * Inicializa una nueva sesión de WhatsApp Web para un usuario
   */
  async initializeSession(userId: string, chatbotId?: number): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      console.log(`📱 Inicializando sesión WhatsApp para usuario: ${userId}`);
      
      // Cerrar sesión existente si la hay
      await this.disconnectSession(userId);
      
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: `conversia-${userId}`,
          dataPath: './whatsapp-sessions'
        }),
        puppeteer: {
          headless: true,
          executablePath: this.getChromiumPath(),
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
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-features=VizDisplayCompositor',
            '--disable-blink-features=AutomationControlled',
            '--disable-ipc-flooding-protection',
            '--disable-extensions',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--hide-scrollbars',
            '--mute-audio',
            '--no-default-browser-check',
            '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
          ]
        }
      });

      const session: WhatsAppSession = {
        client,
        status: 'initializing',
        lastActivity: new Date(),
        userId,
        chatbotId
      };

      this.sessions.set(userId, session);

      return new Promise((resolve) => {
        let resolved = false;

        // Timeout de 2 minutos para generar QR
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            session.status = 'error';
            this.sessions.delete(userId);
            resolve({ success: false, error: 'Timeout esperando código QR' });
          }
        }, 120000);

        // Escuchar eventos del cliente
        client.on('qr', async (qr) => {
          try {
            console.log(`🔍 QR recibido para usuario: ${userId}`);
            console.log(`📄 QR string length: ${qr.length}`);
            console.log(`📄 QR prefix: ${qr.substring(0, 50)}...`);
            
            // Validar que el QR sea válido
            if (!qr || qr.length < 10) {
              throw new Error('QR string inválido o muy corto');
            }
            
            // Generar QR como imagen base64 con configuración optimizada
            const qrImage = await qrcode.toDataURL(qr, {
              width: 512,  // Tamaño más grande para mejor escaneado
              margin: 4,   // Margen más grande
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              },
              errorCorrectionLevel: 'M'  // Nivel de corrección de errores medio
            });

            console.log(`✅ QR imagen generada: ${qrImage.length} caracteres`);
            console.log(`📊 Imagen base64 prefix: ${qrImage.substring(0, 50)}...`);

            session.qrCode = qrImage;
            session.status = 'qr_ready';
            session.lastActivity = new Date();
            
            // Emitir evento para frontend
            this.emit('qr', { userId, qrCode: qrImage });
            
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              console.log(`🎯 Resolviendo promesa con QR exitoso para: ${userId}`);
              resolve({ success: true, qrCode: qrImage });
            }
          } catch (error) {
            console.error('❌ Error generando QR:', error);
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              resolve({ success: false, error: 'Error generando código QR' });
            }
          }
        });

        client.on('ready', async () => {
          console.log(`✅ WhatsApp conectado para usuario: ${userId}`);
          session.status = 'connected';
          session.lastActivity = new Date();
          
          // Configurar manejadores de mensajes
          await this.setupMessageHandlers(userId, client);
          
          // Actualizar estado en base de datos
          await this.updateConnectionStatus(userId, 'connected');
          
          // Emitir evento para frontend
          this.emit('connected', { userId });
        });

        client.on('disconnected', async (reason) => {
          console.log(`❌ WhatsApp desconectado para usuario: ${userId}, razón: ${reason}`);
          session.status = 'disconnected';
          
          // Actualizar estado en base de datos
          await this.updateConnectionStatus(userId, 'disconnected');
          
          // Emitir evento para frontend
          this.emit('disconnected', { userId, reason });
          
          // Limpiar sesión
          this.sessions.delete(userId);
        });

        client.on('auth_failure', (msg) => {
          console.log(`🚫 Fallo de autenticación para usuario: ${userId}, error: ${msg}`);
          session.status = 'error';
          
          this.emit('auth_failure', { userId, error: msg });
          
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            resolve({ success: false, error: 'Fallo de autenticación' });
          }
        });

        // Inicializar cliente
        client.initialize();
      });

    } catch (error) {
      console.error('Error inicializando sesión WhatsApp:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Configura los manejadores de mensajes con IA
   */
  private async setupMessageHandlers(userId: string, client: Client): Promise<void> {
    client.on('message', async (message) => {
      try {
        // Ignorar mensajes propios, de grupos y de estados
        if (message.fromMe || message.from.includes('@g.us') || message.type === 'e2e_notification') return;
        
        console.log(`📨 Mensaje recibido de ${message.from}: ${message.body}`);
        
        // Obtener configuración del usuario
        const session = this.sessions.get(userId);
        if (!session) return;

        // Crear o actualizar contacto
        const contact = await this.getOrCreateContact(userId, message.from, 'Cliente WhatsApp');
        
        // Obtener historial de conversación
        const historyKey = `${userId}-${message.from}`;
        const history = this.messageHistory.get(historyKey) || [];
        
        // Agregar mensaje entrante al historial
        history.push(`Cliente: ${message.body}`);
        
        // Mantener solo los últimos 10 mensajes
        if (history.length > 10) {
          history.splice(0, history.length - 10);
        }
        
        this.messageHistory.set(historyKey, history);

        // Obtener configuración del chatbot
        const chatbotConfig = await this.getChatbotConfig(userId, session.chatbotId);
        
        if (!chatbotConfig || !chatbotConfig.autoRespond) {
          console.log(`🤖 Auto-respuesta desactivada para usuario: ${userId}`);
          return;
        }

        // Generar respuesta con IA
        const aiResponse = await this.generateAIResponse({
          userId,
          chatbotId: session.chatbotId,
          contactPhone: message.from,
          contactName: contact?.name,
          messageHistory: history
        }, message.body);

        if (aiResponse) {
          // Enviar respuesta
          await message.reply(aiResponse);
          
          // Agregar respuesta al historial
          history.push(`ConversIA: ${aiResponse}`);
          this.messageHistory.set(historyKey, history);
          
          // Guardar conversación en base de datos
          await this.saveConversation(userId, contact.id, message.body, aiResponse);
          
          console.log(`🤖 Respuesta enviada: ${aiResponse.substring(0, 50)}...`);
        }

      } catch (error) {
        console.error('Error procesando mensaje:', error);
      }
    });
  }

  /**
   * Genera respuesta con IA usando los servicios existentes
   */
  private async generateAIResponse(context: MessageContext, messageBody: string): Promise<string | null> {
    try {
      // Intentar con chatbot específico si está configurado
      if (context.chatbotId) {
        const chatbotResponse = await chatbotProductAI.generateIntelligentResponse(
          messageBody,
          context.chatbotId.toString(),
          context.messageHistory.join('\n')
        );
        
        if (chatbotResponse && chatbotResponse.message) {
          return chatbotResponse.message;
        }
      }

      // Fallback a IA mejorada
      const enhancedResponse = await enhancedAI.generateResponse(
        messageBody,
        context.messageHistory.join('\n'),
        context.userId,
        'ConversIA'
      );
      
      if (enhancedResponse && enhancedResponse.message) {
        return enhancedResponse.message;
      }

      // Fallback simple
      return `Gracias por tu mensaje. Un representante te contactará pronto.`;

      return null;
    } catch (error) {
      console.error('Error generando respuesta IA:', error);
      return null;
    }
  }

  /**
   * Envía mensaje manual desde el CRM
   */
  async sendMessage(userId: string, phoneNumber: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = this.sessions.get(userId);
      
      if (!session || session.status !== 'connected') {
        return { success: false, error: 'WhatsApp no está conectado' };
      }

      // Formatear número para WhatsApp
      const chatId = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;
      
      await session.client.sendMessage(chatId, message);
      
      // Actualizar historial
      const historyKey = `${userId}-${chatId}`;
      const history = this.messageHistory.get(historyKey) || [];
      history.push(`ConversIA: ${message}`);
      this.messageHistory.set(historyKey, history);
      
      console.log(`📤 Mensaje enviado a ${phoneNumber}: ${message.substring(0, 50)}...`);
      
      return { success: true };
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      return { success: false, error: 'Error enviando mensaje' };
    }
  }

  /**
   * Desconecta sesión de WhatsApp
   */
  async disconnectSession(userId: string): Promise<void> {
    const session = this.sessions.get(userId);
    
    if (session) {
      try {
        await session.client.destroy();
      } catch (error) {
        console.error('Error desconectando sesión:', error);
      }
      
      this.sessions.delete(userId);
      await this.updateConnectionStatus(userId, 'disconnected');
    }
  }

  /**
   * Obtiene el estado de conexión
   */
  getConnectionStatus(userId: string): string {
    const session = this.sessions.get(userId);
    return session ? session.status : 'disconnected';
  }

  /**
   * Obtiene o crea contacto
   */
  private async getOrCreateContact(userId: string, phoneNumber: string, name?: string): Promise<any> {
    try {
      // Limpiar número de teléfono
      const cleanPhone = phoneNumber.replace('@c.us', '').replace('@s.whatsapp.net', '');
      
      // Buscar contacto existente
      let contact = await simpleStorage.getContactByPhone(userId, cleanPhone);
      
      if (!contact) {
        // Crear nuevo contacto
        contact = await simpleStorage.createContact({
          userId,
          phone: cleanPhone,
          name: name || `Contacto ${cleanPhone}`,
          source: 'whatsapp',
          createdAt: new Date().toISOString()
        });
      }
      
      return contact;
    } catch (error) {
      console.error('Error gestionando contacto:', error);
      return { id: null, name: 'Desconocido' };
    }
  }

  /**
   * Obtiene configuración del chatbot
   */
  private async getChatbotConfig(userId: string, chatbotId?: number): Promise<any> {
    try {
      if (chatbotId) {
        return await simpleStorage.getChatbot(chatbotId);
      }
      
      // Obtener chatbot activo del usuario
      const chatbots = await simpleStorage.getChatbots(userId);
      return chatbots.find(c => c.status === 'active') || null;
    } catch (error) {
      console.error('Error obteniendo configuración chatbot:', error);
      return null;
    }
  }

  /**
   * Guarda conversación en base de datos
   */
  private async saveConversation(userId: string, contactId: any, incomingMessage: string, aiResponse: string): Promise<void> {
    try {
      // Implementar guardado de conversación cuando tengamos la tabla
      console.log(`💾 Guardando conversación: ${contactId} - ${incomingMessage.substring(0, 30)}...`);
    } catch (error) {
      console.error('Error guardando conversación:', error);
    }
  }

  /**
   * Actualiza estado de conexión en base de datos
   */
  private async updateConnectionStatus(userId: string, status: string): Promise<void> {
    try {
      // Actualizar estado en integraciones WhatsApp
      const integrations = await simpleStorage.getWhatsappIntegrations(userId);
      
      for (const integration of integrations) {
        await simpleStorage.updateWhatsappIntegration(integration.id, {
          status,
          connectedAt: status === 'connected' ? new Date().toISOString() : null,
          lastMessageAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error actualizando estado de conexión:', error);
    }
  }

  /**
   * Limpia sesiones inactivas
   */
  private cleanupInactiveSessions(): void {
    const now = new Date();
    const maxInactiveTime = 60 * 60 * 1000; // 1 hora
    
    for (const [userId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > maxInactiveTime) {
        console.log(`🧹 Limpiando sesión inactiva para usuario: ${userId}`);
        this.disconnectSession(userId);
      }
    }
  }

  /**
   * Obtiene información de todas las sesiones
   */
  getAllSessions(): any[] {
    const sessions = [];
    for (const [userId, session] of this.sessions) {
      sessions.push({
        userId,
        status: session.status,
        lastActivity: session.lastActivity,
        chatbotId: session.chatbotId
      });
    }
    return sessions;
  }
}

// Instancia singleton
export const whatsappWebService = new WhatsAppWebService();