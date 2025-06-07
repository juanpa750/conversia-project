import { db } from "./db";
import { eq } from "drizzle-orm";

interface BusinessSetup {
  businessName: string;
  businessType: 'products' | 'services';
  businessDescription: string;
  adminPhoneNumber?: string;
}

interface ConnectionStatus {
  success: boolean;
  status: string;
  isConnected: boolean;
  qrCode?: string;
  businessName?: string;
  businessType?: string;
  messagesSent: number;
  messagesReceived: number;
}

export class WhatsAppSimpleService {
  // Paso 1: Configurar negocio
  static async setupBusiness(userId: string, businessData: BusinessSetup) {
    try {
      // Verificar si ya existe configuración
      const existingQuery = `
        SELECT * FROM whatsapp_simple WHERE user_id = $1 LIMIT 1
      `;
      
      const existing = await this.executeQuery(existingQuery, [userId]);
      
      const welcomeMessage = `¡Hola! Bienvenido a ${businessData.businessName}. ¿En qué puedo ayudarte?`;
      
      if (existing && existing.length > 0) {
        // Actualizar existente
        const updateQuery = `
          UPDATE whatsapp_simple 
          SET business_name = $1, business_type = $2, business_description = $3, 
              admin_phone_number = $4, welcome_message = $5, updated_at = NOW()
          WHERE user_id = $6
        `;
        
        await this.executeQuery(updateQuery, [
          businessData.businessName,
          businessData.businessType,
          businessData.businessDescription,
          businessData.adminPhoneNumber,
          welcomeMessage,
          userId
        ]);
      } else {
        // Crear nuevo
        const insertQuery = `
          INSERT INTO whatsapp_simple 
          (user_id, business_name, business_type, business_description, admin_phone_number, welcome_message, status)
          VALUES ($1, $2, $3, $4, $5, $6, 'configured')
        `;
        
        await this.executeQuery(insertQuery, [
          userId,
          businessData.businessName,
          businessData.businessType,
          businessData.businessDescription,
          businessData.adminPhoneNumber,
          welcomeMessage
        ]);
      }

      return {
        success: true,
        message: 'Negocio configurado correctamente'
      };
    } catch (error) {
      console.error('Error configurando negocio:', error);
      return {
        success: false,
        message: 'Error configurando el negocio'
      };
    }
  }

  // Paso 2: Conectar WhatsApp
  static async connectWhatsApp(userId: string) {
    try {
      // Generar QR code simulado
      const qrCode = `data:image/svg+xml;base64,${Buffer.from(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <text x="100" y="100" text-anchor="middle" fill="black" font-size="16">
            QR Code para WhatsApp
          </text>
          <text x="100" y="120" text-anchor="middle" fill="gray" font-size="12">
            User: ${userId}
          </text>
        </svg>
      `).toString('base64')}`;

      // Actualizar estado a "connecting" con QR
      const updateQuery = `
        UPDATE whatsapp_simple 
        SET status = 'connecting', qr_code = $1, updated_at = NOW()
        WHERE user_id = $2
      `;
      
      await this.executeQuery(updateQuery, [qrCode, userId]);

      // Simular conexión exitosa después de 5 segundos
      setTimeout(async () => {
        try {
          const connectQuery = `
            UPDATE whatsapp_simple 
            SET status = 'connected', is_connected = true, connected_at = NOW(), 
                qr_code = null, updated_at = NOW()
            WHERE user_id = $1
          `;
          
          await this.executeQuery(connectQuery, [userId]);
        } catch (error) {
          console.error('Error actualizando conexión:', error);
        }
      }, 5000);

      return {
        success: true,
        message: 'Código QR generado. Escaneé con WhatsApp.',
        qrCode
      };
    } catch (error) {
      console.error('Error conectando WhatsApp:', error);
      return {
        success: false,
        message: 'Error al conectar WhatsApp'
      };
    }
  }

  // Obtener estado de conexión
  static async getConnectionStatus(userId: string): Promise<ConnectionStatus> {
    try {
      const query = `
        SELECT * FROM whatsapp_simple WHERE user_id = $1 LIMIT 1
      `;
      
      const result = await this.executeQuery(query, [userId]);
      
      if (result.length === 0) {
        return {
          success: true,
          status: 'not_configured',
          isConnected: false,
          messagesSent: 0,
          messagesReceived: 0
        };
      }

      const connection = result[0];
      
      return {
        success: true,
        status: connection.status,
        isConnected: connection.is_connected,
        qrCode: connection.qr_code,
        businessName: connection.business_name,
        businessType: connection.business_type,
        messagesSent: connection.messages_sent || 0,
        messagesReceived: connection.messages_received || 0
      };
    } catch (error) {
      console.error('Error obteniendo estado:', error);
      return {
        success: false,
        status: 'error',
        isConnected: false,
        messagesSent: 0,
        messagesReceived: 0
      };
    }
  }

  // Desconectar WhatsApp
  static async disconnect(userId: string) {
    try {
      const query = `
        UPDATE whatsapp_simple 
        SET status = 'disconnected', is_connected = false, qr_code = null, updated_at = NOW()
        WHERE user_id = $1
      `;
      
      await this.executeQuery(query, [userId]);

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

  // Simular respuesta automática inteligente
  static async simulateAutoResponse(userId: string, incomingMessage: string, phoneNumber: string) {
    try {
      // Obtener configuración del negocio
      const query = `
        SELECT * FROM whatsapp_simple WHERE user_id = $1 AND is_connected = true LIMIT 1
      `;
      
      const result = await this.executeQuery(query, [userId]);
      
      if (result.length === 0) {
        return {
          success: false,
          message: 'WhatsApp no está conectado'
        };
      }

      const business = result[0];
      let autoResponse = '';
      const lowerMessage = incomingMessage.toLowerCase();

      // IA gratuita basada en reglas según tipo de negocio
      if (business.business_type === 'products') {
        if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('cuanto')) {
          autoResponse = `Hola! En ${business.business_name} tenemos excelentes productos con precios competitivos. ¿Qué producto específico te interesa?`;
        } else if (lowerMessage.includes('producto') || lowerMessage.includes('venta') || lowerMessage.includes('comprar')) {
          autoResponse = `¡Perfecto! En ${business.business_name} tenemos una gran variedad de productos. ¿Podrías decirme qué tipo de producto buscas?`;
        } else if (lowerMessage.includes('disponible') || lowerMessage.includes('stock')) {
          autoResponse = `Te ayudo a verificar la disponibilidad. ¿Cuál producto necesitas?`;
        } else if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
          autoResponse = business.welcome_message;
        } else {
          autoResponse = `Gracias por contactar ${business.business_name}. Somos especialistas en productos de calidad. ¿En qué puedo ayudarte hoy?`;
        }
      } else { // services
        if (lowerMessage.includes('cita') || lowerMessage.includes('agendar') || lowerMessage.includes('turno')) {
          autoResponse = `Hola! En ${business.business_name} estaremos encantados de atenderte. ¿Qué día y hora te conviene para tu cita?`;
        } else if (lowerMessage.includes('horario') || lowerMessage.includes('hora') || lowerMessage.includes('disponible')) {
          autoResponse = `Nuestros horarios de atención son de Lunes a Viernes de 9:00 AM a 6:00 PM. ¿Te gustaría agendar una cita?`;
        } else if (lowerMessage.includes('servicio') || lowerMessage.includes('consulta')) {
          autoResponse = `En ${business.business_name} ofrecemos servicios profesionales. ¿Qué tipo de consulta necesitas?`;
        } else if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
          autoResponse = business.welcome_message;
        } else {
          autoResponse = `Gracias por contactar ${business.business_name}. Ofrecemos servicios profesionales. ¿Te gustaría agendar una cita?`;
        }
      }

      // Actualizar estadísticas
      const updateStatsQuery = `
        UPDATE whatsapp_simple 
        SET messages_sent = messages_sent + 1, messages_received = messages_received + 1, 
            last_message_at = NOW(), updated_at = NOW()
        WHERE user_id = $1
      `;
      
      await this.executeQuery(updateStatsQuery, [userId]);

      return {
        success: true,
        response: autoResponse,
        message: 'Respuesta automática generada'
      };
    } catch (error) {
      console.error('Error simulando respuesta:', error);
      return {
        success: false,
        message: 'Error generando respuesta automática'
      };
    }
  }

  // Método auxiliar para ejecutar consultas SQL usando Drizzle
  private static async executeQuery(query: string, params: any[] = []) {
    try {
      // Usar la base de datos real con consultas SQL directas
      const result = await db.execute(query, params);
      return result.rows || [];
    } catch (error) {
      console.error('Error ejecutando query:', error);
      throw error;
    }
  }
}

export const whatsappSimpleService = new WhatsAppSimpleService();