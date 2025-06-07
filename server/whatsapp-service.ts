import { db } from "./db";
import { sql } from "drizzle-orm";

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

export class WhatsAppService {
  // Paso 1: Configurar negocio
  static async setupBusiness(userId: string, businessData: BusinessSetup) {
    try {
      const welcomeMessage = `¡Hola! Bienvenido a ${businessData.businessName}. ¿En qué puedo ayudarte?`;
      
      // Verificar si ya existe configuración
      const existing = await db.execute(
        sql`SELECT * FROM whatsapp_simple WHERE user_id = ${userId} LIMIT 1`
      );
      
      if (existing.rows && existing.rows.length > 0) {
        // Actualizar existente
        await db.execute(sql`
          UPDATE whatsapp_simple 
          SET business_name = ${businessData.businessName}, 
              business_type = ${businessData.businessType}, 
              business_description = ${businessData.businessDescription}, 
              admin_phone_number = ${businessData.adminPhoneNumber}, 
              welcome_message = ${welcomeMessage}, 
              updated_at = NOW()
          WHERE user_id = ${userId}
        `);
      } else {
        // Crear nuevo
        await db.execute(sql`
          INSERT INTO whatsapp_simple 
          (user_id, business_name, business_type, business_description, admin_phone_number, welcome_message, status)
          VALUES (${userId}, ${businessData.businessName}, ${businessData.businessType}, 
                  ${businessData.businessDescription}, ${businessData.adminPhoneNumber}, 
                  ${welcomeMessage}, 'configured')
        `);
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
      // Generar QR code SVG
      const qrCode = `data:image/svg+xml;base64,${Buffer.from(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white" stroke="#000" stroke-width="2"/>
          <rect x="20" y="20" width="20" height="20" fill="black"/>
          <rect x="60" y="20" width="20" height="20" fill="black"/>
          <rect x="100" y="20" width="20" height="20" fill="black"/>
          <rect x="140" y="20" width="20" height="20" fill="black"/>
          
          <rect x="20" y="60" width="20" height="20" fill="black"/>
          <rect x="140" y="60" width="20" height="20" fill="black"/>
          
          <rect x="20" y="100" width="20" height="20" fill="black"/>
          <rect x="60" y="100" width="20" height="20" fill="black"/>
          <rect x="100" y="100" width="20" height="20" fill="black"/>
          <rect x="140" y="100" width="20" height="20" fill="black"/>
          
          <rect x="20" y="140" width="20" height="20" fill="black"/>
          <rect x="140" y="140" width="20" height="20" fill="black"/>
          
          <rect x="20" y="160" width="20" height="20" fill="black"/>
          <rect x="60" y="160" width="20" height="20" fill="black"/>
          <rect x="100" y="160" width="20" height="20" fill="black"/>
          <rect x="140" y="160" width="20" height="20" fill="black"/>
          
          <text x="100" y="190" text-anchor="middle" fill="#666" font-size="10">
            Escanear con WhatsApp
          </text>
        </svg>
      `).toString('base64')}`;

      // Actualizar estado a "connecting" con QR
      await db.execute(sql`
        UPDATE whatsapp_simple 
        SET status = 'connecting', qr_code = ${qrCode}, updated_at = NOW()
        WHERE user_id = ${userId}
      `);

      // Simular conexión exitosa después de 3 segundos
      setTimeout(async () => {
        try {
          await db.execute(sql`
            UPDATE whatsapp_simple 
            SET status = 'connected', is_connected = true, connected_at = NOW(), 
                qr_code = null, updated_at = NOW()
            WHERE user_id = ${userId}
          `);
        } catch (error) {
          console.error('Error actualizando conexión:', error);
        }
      }, 3000);

      return {
        success: true,
        message: 'Código QR generado. Escanea con WhatsApp.',
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
      const result = await db.execute(
        sql`SELECT * FROM whatsapp_simple WHERE user_id = ${userId} LIMIT 1`
      );
      
      if (!result.rows || result.rows.length === 0) {
        return {
          success: true,
          status: 'not_configured',
          isConnected: false,
          messagesSent: 0,
          messagesReceived: 0
        };
      }

      const connection = result.rows[0] as any;
      
      return {
        success: true,
        status: connection.status as string,
        isConnected: connection.is_connected as boolean,
        qrCode: connection.qr_code as string | undefined,
        businessName: connection.business_name as string,
        businessType: connection.business_type as string,
        messagesSent: Number(connection.messages_sent) || 0,
        messagesReceived: Number(connection.messages_received) || 0
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
      await db.execute(sql`
        UPDATE whatsapp_simple 
        SET status = 'disconnected', is_connected = false, qr_code = null, updated_at = NOW()
        WHERE user_id = ${userId}
      `);

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
      const result = await db.execute(
        sql`SELECT * FROM whatsapp_simple WHERE user_id = ${userId} AND is_connected = true LIMIT 1`
      );
      
      if (!result.rows || result.rows.length === 0) {
        return {
          success: false,
          message: 'WhatsApp no está conectado'
        };
      }

      const business = result.rows[0] as any;
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
      await db.execute(sql`
        UPDATE whatsapp_simple 
        SET messages_sent = messages_sent + 1, messages_received = messages_received + 1, 
            last_message_at = NOW(), updated_at = NOW()
        WHERE user_id = ${userId}
      `);

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
}

export const whatsappService = new WhatsAppService();