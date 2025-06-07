import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { db } from './db';
import { whatsappConnections, whatsappMessages, businessProducts, businessServices, appointments } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { freeAIService } from './freeAIService';

export class WhatsAppUnifiedService {
  private static clients: Map<string, Client> = new Map();
  private static qrCodes: Map<string, string> = new Map();

  /**
   * Inicializar conexión WhatsApp para un usuario
   * Sistema unificado: 3 pasos simples
   */
  static async initializeConnection(userId: string): Promise<{ success: boolean; qrCode?: string; message: string }> {
    try {
      // Verificar si ya existe una conexión
      const existing = await db
        .select()
        .from(whatsappConnections)
        .where(eq(whatsappConnections.userId, userId))
        .limit(1);

      if (existing.length === 0) {
        return {
          success: false,
          message: 'Primero configure su negocio antes de conectar WhatsApp'
        };
      }

      const connection = existing[0];
      
      // Si ya está conectado, devolver estado
      if (connection.isConnected) {
        return {
          success: true,
          message: 'WhatsApp ya está conectado y funcionando'
        };
      }

      // Crear cliente WhatsApp Web
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: `client_${userId}`
        }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      });

      // Configurar eventos
      await this.setupClientEvents(client, userId);
      
      // Inicializar cliente
      await client.initialize();
      
      this.clients.set(userId, client);

      return {
        success: true,
        message: 'Escaneando QR para conectar WhatsApp...'
      };

    } catch (error) {
      console.error('Error inicializando WhatsApp:', error);
      return {
        success: false,
        message: 'Error al inicializar WhatsApp. Intente nuevamente.'
      };
    }
  }

  /**
   * Configurar eventos del cliente WhatsApp
   */
  private static async setupClientEvents(client: Client, userId: string) {
    // Generar QR code
    client.on('qr', async (qr) => {
      try {
        const qrCodeData = await QRCode.toDataURL(qr);
        this.qrCodes.set(userId, qrCodeData);
        
        // Actualizar en base de datos
        await db
          .update(whatsappConnections)
          .set({ 
            qrCode: qrCodeData,
            status: 'connecting' 
          })
          .where(eq(whatsappConnections.userId, userId));
        
        console.log(`QR generado para usuario ${userId}`);
      } catch (error) {
        console.error('Error generando QR:', error);
      }
    });

    // Cliente listo
    client.on('ready', async () => {
      console.log(`WhatsApp conectado para usuario ${userId}`);
      
      await db
        .update(whatsappConnections)
        .set({ 
          isConnected: true,
          status: 'connected',
          connectedAt: new Date(),
          qrCode: null
        })
        .where(eq(whatsappConnections.userId, userId));
    });

    // Mensajes entrantes
    client.on('message', async (message) => {
      await this.handleIncomingMessage(userId, message);
    });

    // Desconexión
    client.on('disconnected', async (reason) => {
      console.log(`WhatsApp desconectado para usuario ${userId}:`, reason);
      
      await db
        .update(whatsappConnections)
        .set({ 
          isConnected: false,
          status: 'disconnected' 
        })
        .where(eq(whatsappConnections.userId, userId));
      
      this.clients.delete(userId);
    });
  }

  /**
   * Manejar mensajes entrantes con IA gratuita
   */
  private static async handleIncomingMessage(userId: string, message: any) {
    try {
      // Guardar mensaje entrante
      await db.insert(whatsappMessages).values({
        userId,
        messageId: message.id.id,
        fromNumber: message.from,
        toNumber: message.to,
        messageText: message.body,
        messageType: message.type,
        isIncoming: true,
        wasAutoReplied: false
      });

      // Obtener configuración del usuario
      const [connection] = await db
        .select()
        .from(whatsappConnections)
        .where(eq(whatsappConnections.userId, userId));

      if (!connection || !connection.autoRespond || !connection.aiEnabled) {
        return;
      }

      // Generar respuesta con IA gratuita
      const businessInfo = await this.getBusinessInfo(userId, connection.businessType);
      const aiResponse = await freeAIService.generateResponse({
        userMessage: message.body,
        conversationHistory: [],
        businessType: connection.businessType,
        language: 'es'
      });

      // Enviar respuesta automática
      if (aiResponse.confidence > 0.7) {
        await this.sendMessage(userId, message.from, aiResponse.message);
        
        // Actualizar estadísticas
        await db
          .update(whatsappConnections)
          .set({ 
            messagesSent: (connection.messagesSent || 0) + 1,
            lastMessageAt: new Date()
          })
          .where(eq(whatsappConnections.userId, userId));
      }

    } catch (error) {
      console.error('Error manejando mensaje:', error);
    }
  }

  /**
   * Obtener información del negocio para la IA
   */
  private static async getBusinessInfo(userId: string, businessType: string) {
    if (businessType === 'products') {
      return await db
        .select()
        .from(businessProducts)
        .where(and(
          eq(businessProducts.userId, userId),
          eq(businessProducts.isActive, true)
        ));
    } else if (businessType === 'services') {
      return await db
        .select()
        .from(businessServices)
        .where(and(
          eq(businessServices.userId, userId),
          eq(businessServices.isActive, true)
        ));
    }
    return [];
  }

  /**
   * Enviar mensaje
   */
  static async sendMessage(userId: string, to: string, text: string): Promise<boolean> {
    try {
      const client = this.clients.get(userId);
      if (!client) {
        throw new Error('Cliente WhatsApp no conectado');
      }

      await client.sendMessage(to, text);
      
      // Guardar mensaje enviado
      await db.insert(whatsappMessages).values({
        userId,
        messageId: `sent_${Date.now()}`,
        fromNumber: 'bot',
        toNumber: to,
        messageText: text,
        messageType: 'text',
        isIncoming: false,
        wasAutoReplied: true,
        aiResponse: text
      });

      return true;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      return false;
    }
  }

  /**
   * Obtener estado de conexión
   */
  static async getConnectionStatus(userId: string) {
    try {
      const [connection] = await db
        .select()
        .from(whatsappConnections)
        .where(eq(whatsappConnections.userId, userId));

      if (!connection) {
        return {
          success: false,
          status: 'not_configured',
          message: 'Configure su negocio primero'
        };
      }

      return {
        success: true,
        status: connection.status,
        isConnected: connection.isConnected,
        qrCode: this.qrCodes.get(userId) || connection.qrCode,
        businessName: connection.businessName,
        businessType: connection.businessType,
        messagesSent: connection.messagesSent,
        messagesReceived: connection.messagesReceived
      };
    } catch (error) {
      console.error('Error obteniendo estado:', error);
      return {
        success: false,
        status: 'error',
        message: 'Error obteniendo estado de conexión'
      };
    }
  }

  /**
   * Configurar negocio (Paso 1 del proceso de 3 pasos)
   */
  static async setupBusiness(userId: string, businessData: {
    businessName: string;
    businessType: 'products' | 'services';
    businessDescription: string;
    adminPhoneNumber?: string;
    welcomeMessage?: string;
  }) {
    try {
      // Verificar si ya existe
      const existing = await db
        .select()
        .from(whatsappConnections)
        .where(eq(whatsappConnections.userId, userId));

      if (existing.length > 0) {
        // Actualizar existente
        await db
          .update(whatsappConnections)
          .set({
            businessName: businessData.businessName,
            businessType: businessData.businessType,
            businessDescription: businessData.businessDescription,
            adminPhoneNumber: businessData.adminPhoneNumber,
            welcomeMessage: businessData.welcomeMessage || `¡Hola! Bienvenido a ${businessData.businessName}. ¿En qué puedo ayudarte?`,
            enableAppointments: businessData.businessType === 'services',
            allowMultipleProducts: businessData.businessType === 'products',
            updatedAt: new Date()
          })
          .where(eq(whatsappConnections.userId, userId));
      } else {
        // Crear nuevo
        await db.insert(whatsappConnections).values({
          userId,
          businessName: businessData.businessName,
          businessType: businessData.businessType,
          businessDescription: businessData.businessDescription,
          adminPhoneNumber: businessData.adminPhoneNumber,
          welcomeMessage: businessData.welcomeMessage || `¡Hola! Bienvenido a ${businessData.businessName}. ¿En qué puedo ayudarte?`,
          enableAppointments: businessData.businessType === 'services',
          allowMultipleProducts: businessData.businessType === 'products',
          status: 'disconnected',
          isConnected: false,
          aiEnabled: true,
          autoRespond: true
        });
      }

      return {
        success: true,
        message: 'Negocio configurado correctamente. Ahora puede conectar WhatsApp.'
      };
    } catch (error) {
      console.error('Error configurando negocio:', error);
      return {
        success: false,
        message: 'Error configurando el negocio'
      };
    }
  }

  /**
   * Desconectar WhatsApp
   */
  static async disconnect(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const client = this.clients.get(userId);
      if (client) {
        await client.destroy();
        this.clients.delete(userId);
      }

      await db
        .update(whatsappConnections)
        .set({ 
          isConnected: false,
          status: 'disconnected',
          qrCode: null 
        })
        .where(eq(whatsappConnections.userId, userId));

      this.qrCodes.delete(userId);

      return {
        success: true,
        message: 'WhatsApp desconectado correctamente'
      };
    } catch (error) {
      console.error('Error desconectando WhatsApp:', error);
      return {
        success: false,
        message: 'Error al desconectar WhatsApp'
      };
    }
  }
}

export const whatsappUnifiedService = new WhatsAppUnifiedService();