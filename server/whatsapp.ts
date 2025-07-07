// server/whatsapp.ts - Sistema completo de WhatsApp con IA
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import { storage } from './storage';
import type { Chatbot } from '@shared/schema';

// Mapa de sesiones activas: chatbotId -> Client
const whatsappClients = new Map<number, Client>();
const qrCodes = new Map<number, string>();
const connectionStatus = new Map<number, 'connecting' | 'connected' | 'disconnected' | 'error'>();

interface WhatsAppSession {
  chatbotId: number;
  client: Client;
  isConnected: boolean;
  lastActivity: Date;
  qrCode?: string;
}

export class WhatsAppManager {
  private sessions: Map<number, WhatsAppSession> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  // Inicializar sesión de WhatsApp
  async initializeSession(chatbotId: number): Promise<{ success: boolean; qr?: string; connected?: boolean; message?: string }> {
    try {
      // Verificar si ya existe una sesión
      if (this.sessions.has(chatbotId)) {
        const session = this.sessions.get(chatbotId)!;
        if (session.isConnected) {
          return { success: true, connected: true };
        }
      }

      // Crear nuevo cliente
      const client = new Client({
        authStrategy: new LocalAuth({ clientId: `chatbot_${chatbotId}` }),
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

      // Configurar eventos
      await this.setupClientEvents(client, chatbotId);

      // Inicializar cliente
      await client.initialize();

      // Crear sesión
      const session: WhatsAppSession = {
        chatbotId,
        client,
        isConnected: false,
        lastActivity: new Date()
      };

      this.sessions.set(chatbotId, session);
      connectionStatus.set(chatbotId, 'connecting');

      return { success: true, connected: false };
    } catch (error) {
      console.error('Error inicializando WhatsApp:', error);
      connectionStatus.set(chatbotId, 'error');
      return { success: false, message: 'Error inicializando WhatsApp' };
    }
  }

  // Configurar eventos del cliente
  private async setupClientEvents(client: Client, chatbotId: number) {
    // Evento QR
    client.on('qr', async (qr) => {
      try {
        const qrCodeUrl = await qrcode.toDataURL(qr);
        qrCodes.set(chatbotId, qrCodeUrl);
        
        const session = this.sessions.get(chatbotId);
        if (session) {
          session.qrCode = qrCodeUrl;
        }
        
        console.log(`QR generado para chatbot ${chatbotId}`);
      } catch (error) {
        console.error('Error generando QR:', error);
      }
    });

    // Evento conectado
    client.on('ready', async () => {
      console.log(`WhatsApp conectado para chatbot ${chatbotId}`);
      connectionStatus.set(chatbotId, 'connected');
      
      const session = this.sessions.get(chatbotId);
      if (session) {
        session.isConnected = true;
        session.lastActivity = new Date();
      }

      // Actualizar estado en base de datos
      await storage.updateChatbot(chatbotId, { 
        whatsappConnected: true,
        lastConnectionCheck: new Date()
      }, 'system');
    });

    // Evento desconectado
    client.on('disconnected', async (reason) => {
      console.log(`WhatsApp desconectado para chatbot ${chatbotId}:`, reason);
      connectionStatus.set(chatbotId, 'disconnected');
      
      const session = this.sessions.get(chatbotId);
      if (session) {
        session.isConnected = false;
      }

      // Actualizar estado en base de datos
      await storage.updateChatbot(chatbotId, { 
        whatsappConnected: false,
        lastConnectionCheck: new Date()
      }, 'system');
    });

    // Evento mensaje recibido - AQUÍ ESTÁ LA MAGIA DE LA IA
    client.on('message', async (message) => {
      try {
        // Evitar responder a mensajes propios
        if (message.fromMe) return;

        // Actualizar actividad de la sesión
        const session = this.sessions.get(chatbotId);
        if (session) {
          session.lastActivity = new Date();
        }

        // Procesar mensaje con IA
        const response = await this.processMessageWithAI(message.body, chatbotId, message.from);
        
        if (response) {
          // Enviar respuesta
          await message.reply(response);
          
          // Guardar en base de datos
          await storage.saveWhatsAppMessage({
            chatbotId,
            contactPhone: message.from,
            contactName: message.notifyName || 'Usuario',
            messageType: 'received',
            content: message.body,
            messageId: message.id._serialized,
            aiResponse: response
          });
        }
      } catch (error) {
        console.error('Error procesando mensaje:', error);
      }
    });

    // Evento error
    client.on('auth_failure', (message) => {
      console.error(`Error de autenticación para chatbot ${chatbotId}:`, message);
      connectionStatus.set(chatbotId, 'error');
    });
  }

  // Procesar mensaje con IA - PUNTO 3
  private async processMessageWithAI(message: string, chatbotId: number, contactPhone: string): Promise<string | null> {
    try {
      // Obtener configuración del chatbot
      const chatbot = await storage.getChatbot(chatbotId);
      if (!chatbot) {
        console.error(`Chatbot ${chatbotId} no encontrado`);
        return null;
      }

      // Obtener productos del usuario (si es chatbot de ventas)
      const products = await storage.getProducts(chatbot.userId);
      
      // Obtener nombre del negocio
      const businessName = await storage.getBusinessName(chatbot.userId);

      // Construir prompt personalizado
      const systemPrompt = this.buildSystemPrompt(chatbot, products, businessName);
      
      // Obtener historial de conversación (últimos 5 mensajes)
      const conversationHistory = await this.getConversationHistory(chatbotId, contactPhone);

      // Respuesta inteligente básica (sin Anthropic por ahora)
      const aiResponse = this.generateIntelligentResponse(message, chatbot, products, businessName);
      
      // Detectar intenciones
      const intent = this.detectIntent(message, chatbot.type);
      
      return aiResponse;
    } catch (error) {
      console.error('Error procesando con IA:', error);
      return "Disculpa, estoy teniendo problemas técnicos. ¿Puedes repetir tu mensaje?";
    }
  }

  // Generar respuesta inteligente básica
  private generateIntelligentResponse(message: string, chatbot: any, products: any[], businessName: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Saludo
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
      return `¡Hola! Bienvenido a ${businessName}. Soy ${chatbot.name}, tu asistente virtual. ¿En qué puedo ayudarte hoy?`;
    }
    
    // Precios
    if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('valor')) {
      if (products.length > 0) {
        let response = `Te puedo ayudar con información sobre nuestros precios:\n\n`;
        products.slice(0, 3).forEach(product => {
          response += `• ${product.name}: $${product.price}\n`;
        });
        response += `\n¿Te interesa algún producto en particular?`;
        return response;
      }
      return `Me da mucho gusto que preguntes por nuestros precios. Te puedo ayudar con información detallada. ¿Qué producto o servicio te interesa?`;
    }
    
    // Productos específicos
    if (products.length > 0) {
      for (const product of products) {
        if (lowerMessage.includes(product.name.toLowerCase())) {
          return `¡Excelente elección! ${product.name}: ${product.description}\n\nPrecio: $${product.price}\n\n¿Te gustaría más información o tienes alguna pregunta específica?`;
        }
      }
    }
    
    // Compra
    if (lowerMessage.includes('comprar') || lowerMessage.includes('pedido') || lowerMessage.includes('orden')) {
      return `¡Perfecto! Me encanta ayudarte con tu compra. Para procesar tu pedido necesito algunos datos. ¿Qué producto te interesa y cuál es tu método de pago preferido?`;
    }
    
    // Horarios
    if (lowerMessage.includes('horario') || lowerMessage.includes('hora') || lowerMessage.includes('abierto')) {
      return `Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM. ¿En qué más puedo ayudarte?`;
    }
    
    // Ayuda
    if (lowerMessage.includes('ayuda') || lowerMessage.includes('soporte') || lowerMessage.includes('problema')) {
      return `Estoy aquí para ayudarte. Puedo asistirte con información sobre productos, precios, pedidos y cualquier consulta. ¿Cuál es tu consulta específica?`;
    }
    
    // Gracias
    if (lowerMessage.includes('gracias')) {
      return `¡De nada! Estoy aquí para ayudarte. Si tienes más preguntas, no dudes en escribirme.`;
    }

    // Respuesta general con IA personalizada
    let response = `Hola! Soy ${chatbot.name} de ${businessName}. `;
    
    if (chatbot.aiInstructions) {
      response += `${chatbot.aiInstructions} `;
    }
    
    response += `Recibí tu mensaje: "${message}". ¿Cómo puedo ayudarte específicamente?`;
    
    return response;
  }

  // Construir prompt del sistema
  private buildSystemPrompt(chatbot: any, products: any[], businessName: string): string {
    let prompt = `Eres un asistente de IA para ${businessName}. `;
    
    if (chatbot.aiPersonality) {
      prompt += `Tu personalidad es: ${chatbot.aiPersonality}. `;
    }
    
    if (chatbot.conversationObjective) {
      prompt += `Tu objetivo en las conversaciones es: ${chatbot.conversationObjective}. `;
    }
    
    if (chatbot.aiInstructions) {
      prompt += `Instrucciones específicas: ${chatbot.aiInstructions}. `;
    }

    // Agregar información de productos si es chatbot de ventas
    if (chatbot.type === 'sales' && products.length > 0) {
      prompt += `\n\nProductos disponibles:\n`;
      products.forEach(product => {
        prompt += `- ${product.name}: ${product.description} - $${product.price}\n`;
      });
    }

    prompt += `\n\nReglas importantes:
- Responde en español
- Sé amigable y profesional
- Mantén respuestas concisas (máximo 200 caracteres)
- Si no sabes algo, di que puedes conectar con un humano
- No inventes información sobre productos o servicios`;

    return prompt;
  }

  // Obtener historial de conversación
  private async getConversationHistory(chatbotId: number, contactPhone: string): Promise<any[]> {
    try {
      const messages = await storage.getWhatsAppMessages(chatbotId);
      
      // Filtrar mensajes de este contacto y tomar los últimos 5
      const contactMessages = messages
        .filter(msg => msg.contactPhone === contactPhone)
        .slice(-5);

      const history: any[] = [];
      
      for (const msg of contactMessages) {
        history.push({ role: "user", content: msg.content });
        if (msg.aiResponse) {
          history.push({ role: "assistant", content: msg.aiResponse });
        }
      }

      return history;
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }
  }

  // Detectar intención del mensaje
  private detectIntent(message: string, chatbotType: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Intenciones comunes
    if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('cuanto')) {
      return 'pricing_inquiry';
    }
    
    if (lowerMessage.includes('comprar') || lowerMessage.includes('pedido') || lowerMessage.includes('orden')) {
      return 'purchase_intent';
    }
    
    if (lowerMessage.includes('cita') || lowerMessage.includes('appointment') || lowerMessage.includes('agendar')) {
      return 'appointment_request';
    }
    
    if (lowerMessage.includes('ayuda') || lowerMessage.includes('soporte') || lowerMessage.includes('problema')) {
      return 'support_request';
    }
    
    return 'general_inquiry';
  }

  // Obtener estado de conexión
  getConnectionStatus(chatbotId: number): { connected: boolean; status: string; qrCode?: string } {
    const session = this.sessions.get(chatbotId);
    const status = connectionStatus.get(chatbotId) || 'disconnected';
    const qrCode = qrCodes.get(chatbotId);
    
    return {
      connected: session?.isConnected || false,
      status,
      qrCode
    };
  }

  // Desconectar sesión
  async disconnectSession(chatbotId: number): Promise<boolean> {
    try {
      const session = this.sessions.get(chatbotId);
      if (session) {
        await session.client.destroy();
        this.sessions.delete(chatbotId);
        connectionStatus.delete(chatbotId);
        qrCodes.delete(chatbotId);
        
        // Actualizar base de datos
        await storage.updateChatbot(chatbotId, { 
          whatsappConnected: false,
          lastConnectionCheck: new Date()
        }, 'system');
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error desconectando sesión:', error);
      return false;
    }
  }

  // Limpiar sesiones inactivas - PUNTO 4
  startSessionCleanup() {
    setInterval(() => {
      const now = new Date();
      
      for (const [chatbotId, session] of this.sessions.entries()) {
        const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
        
        if (timeSinceActivity > this.SESSION_TIMEOUT && !session.isConnected) {
          console.log(`Limpiando sesión inactiva para chatbot ${chatbotId}`);
          this.disconnectSession(chatbotId);
        }
      }
    }, 5 * 60 * 1000); // Revisar cada 5 minutos
  }

  // Forzar conexión (para el botón "Ya escaneé el QR")
  async forceConnected(chatbotId: number): Promise<boolean> {
    try {
      const session = this.sessions.get(chatbotId);
      if (session) {
        session.isConnected = true;
        connectionStatus.set(chatbotId, 'connected');
        
        await storage.updateChatbot(chatbotId, { 
          whatsappConnected: true,
          lastConnectionCheck: new Date()
        }, 'system');
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error forzando conexión:', error);
      return false;
    }
  }
}

// Instancia global del manager
export const whatsappManager = new WhatsAppManager();

// Inicializar limpieza de sesiones al arrancar
whatsappManager.startSessionCleanup();