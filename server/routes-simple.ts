import type { Express } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { isAuthenticated } from "./auth";

export function registerSimpleRoutes(app: Express) {
  // Configurar negocio - Paso 1
  app.post('/api/simple/setup-business', isAuthenticated, async (req: any, res) => {
    try {
      const { businessName, businessType, businessDescription } = req.body;
      
      if (!businessName || !businessType) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nombre del negocio y tipo son requeridos' 
        });
      }

      const welcomeMessage = `¡Hola! Bienvenido a ${businessName}. ¿En qué puedo ayudarte?`;
      
      // Verificar si ya existe configuración
      const existing = await db.execute(
        sql`SELECT * FROM whatsapp_simple WHERE user_id = ${req.userId} LIMIT 1`
      );
      
      if (existing.rows && existing.rows.length > 0) {
        // Actualizar existente
        await db.execute(sql`
          UPDATE whatsapp_simple 
          SET business_name = ${businessName}, 
              business_type = ${businessType}, 
              business_description = ${businessDescription}, 
              welcome_message = ${welcomeMessage}, 
              updated_at = NOW()
          WHERE user_id = ${req.userId}
        `);
      } else {
        // Crear nuevo
        await db.execute(sql`
          INSERT INTO whatsapp_simple 
          (user_id, business_name, business_type, business_description, welcome_message, status)
          VALUES (${req.userId}, ${businessName}, ${businessType}, 
                  ${businessDescription}, ${welcomeMessage}, 'configured')
        `);
      }

      res.json({ 
        success: true, 
        message: 'Negocio configurado correctamente' 
      });
    } catch (error: any) {
      console.error('Error configurando negocio:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  });

  // Conectar WhatsApp - Paso 2
  app.post('/api/simple/connect-whatsapp', isAuthenticated, async (req: any, res) => {
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
        WHERE user_id = ${req.userId}
      `);

      // Simular conexión exitosa después de 3 segundos
      setTimeout(async () => {
        try {
          await db.execute(sql`
            UPDATE whatsapp_simple 
            SET status = 'connected', is_connected = true, connected_at = NOW(), 
                qr_code = null, updated_at = NOW()
            WHERE user_id = ${req.userId}
          `);
        } catch (error) {
          console.error('Error actualizando conexión:', error);
        }
      }, 3000);

      res.json({ 
        success: true, 
        message: 'Código QR generado' 
      });
    } catch (error: any) {
      console.error('Error conectando WhatsApp:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al conectar WhatsApp' 
      });
    }
  });

  // Obtener estado de conexión usando la tabla whatsapp_simple
  app.get('/api/simple/status', isAuthenticated, async (req: any, res) => {
    try {
      const result = await db.execute(
        sql`SELECT * FROM whatsapp_simple WHERE user_id = ${req.userId} LIMIT 1`
      );
      
      if (!result.rows || result.rows.length === 0) {
        return res.json({ 
          success: true,
          status: 'not_configured',
          isConnected: false,
          messagesSent: 0,
          messagesReceived: 0
        });
      }

      const connection = result.rows[0] as any;
      
      res.json({ 
        success: true,
        status: connection.status,
        isConnected: connection.is_connected,
        qrCode: connection.qr_code,
        businessName: connection.business_name,
        businessType: connection.business_type,
        messagesSent: Number(connection.messages_sent) || 0,
        messagesReceived: Number(connection.messages_received) || 0
      });
    } catch (error: any) {
      console.error('Error obteniendo estado:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo estado' 
      });
    }
  });

  // Desconectar WhatsApp
  app.post('/api/simple/disconnect', isAuthenticated, async (req: any, res) => {
    try {
      await simpleStorage.updateWhatsappConnection(req.userId, {
        status: 'disconnected',
        isConnected: false,
        qrCode: null
      });

      res.json({ 
        success: true, 
        message: 'WhatsApp desconectado correctamente' 
      });
    } catch (error: any) {
      console.error('Error desconectando WhatsApp:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al desconectar WhatsApp' 
      });
    }
  });

  // Simular respuesta automática
  app.post('/api/simple/simulate-message', isAuthenticated, async (req: any, res) => {
    try {
      const { message, phoneNumber } = req.body;
      
      const connection = await simpleStorage.getWhatsappConnection(req.userId);
      if (!connection || !connection.isConnected) {
        return res.status(400).json({ 
          success: false, 
          message: 'WhatsApp no está conectado' 
        });
      }

      // Simular respuesta automática inteligente
      let autoResponse = '';
      const lowerMessage = message.toLowerCase();
      
      if (connection.businessType === 'products') {
        if (lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
          autoResponse = `Hola! En ${connection.businessName} tenemos excelentes productos. Te puedo ayudar con información de precios. ¿Qué producto te interesa?`;
        } else if (lowerMessage.includes('producto') || lowerMessage.includes('venta')) {
          autoResponse = `¡Perfecto! En ${connection.businessName} tenemos una gran variedad de productos. ¿Podrías decirme qué tipo de producto buscas?`;
        } else {
          autoResponse = connection.welcomeMessage || `¡Hola! Bienvenido a ${connection.businessName}. ¿En qué producto puedo ayudarte?`;
        }
      } else {
        if (lowerMessage.includes('cita') || lowerMessage.includes('agendar')) {
          autoResponse = `Hola! En ${connection.businessName} estaremos encantados de atenderte. ¿Qué día y hora te conviene para tu cita?`;
        } else if (lowerMessage.includes('horario') || lowerMessage.includes('hora')) {
          autoResponse = `Nuestros horarios de atención son de Lunes a Viernes de 9:00 AM a 6:00 PM. ¿Te gustaría agendar una cita?`;
        } else {
          autoResponse = connection.welcomeMessage || `¡Hola! Bienvenido a ${connection.businessName}. ¿Te gustaría agendar una cita?`;
        }
      }

      // Actualizar estadísticas
      await simpleStorage.updateWhatsappConnection(req.userId, {
        messagesSent: (connection.messagesSent || 0) + 1,
        messagesReceived: (connection.messagesReceived || 0) + 1,
        lastMessageAt: new Date()
      });

      res.json({ 
        success: true, 
        response: autoResponse,
        message: 'Respuesta automática generada'
      });
    } catch (error: any) {
      console.error('Error simulando mensaje:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error simulando mensaje' 
      });
    }
  });
}