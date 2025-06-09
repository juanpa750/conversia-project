import type { Express } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { isAuthenticated } from "./auth";

export function registerWhatsAppSimpleRoutes(app: Express) {
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

  // Obtener estado de conexión
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
      await db.execute(sql`
        UPDATE whatsapp_simple 
        SET status = 'disconnected', is_connected = false, qr_code = null, updated_at = NOW()
        WHERE user_id = ${req.userId}
      `);

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
      
      const result = await db.execute(
        sql`SELECT * FROM whatsapp_simple WHERE user_id = ${req.userId} AND is_connected = true LIMIT 1`
      );
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'WhatsApp no está conectado' 
        });
      }

      const business = result.rows[0] as any;
      let autoResponse = '';
      
      // Usar IA inteligente para generar respuesta
      try {
        const { freeAIService } = await import('./freeAIService');
        
        const context = {
          userMessage: message,
          conversationHistory: [], // En implementación real obtener del historial
          businessType: business.business_type,
          language: 'spanish',
          userId: req.userId
        };

        console.log('🧠 Generando respuesta inteligente para:', {
          message: message.substring(0, 50) + '...',
          businessType: business.business_type,
          businessName: business.business_name
        });

        const aiResponse = await freeAIService.generateResponse(context);
        
        console.log('🎯 Respuesta IA generada:', {
          confidence: aiResponse.confidence,
          detectedProducts: aiResponse.detectedProducts?.length || 0,
          sentiment: aiResponse.sentimentAnalysis?.sentiment,
          hasActions: aiResponse.recommendedActions?.length || 0
        });

        let autoResponse = aiResponse.message;
        
        // Personalizar con nombre del negocio si no está incluido
        if (!autoResponse.includes(business.business_name)) {
          if (autoResponse.startsWith('¡') || autoResponse.startsWith('Hola')) {
            autoResponse = autoResponse.replace(/^(¡[^!]+!|Hola[^.]*\.)/, `$1 Soy ${business.business_name}.`);
          } else {
            autoResponse = `En ${business.business_name}, ${autoResponse.charAt(0).toLowerCase() + autoResponse.slice(1)}`;
          }
        }

        // Log para debugging de productos detectados
        if (aiResponse.detectedProducts && aiResponse.detectedProducts.length > 0) {
          console.log('🎯 Productos detectados en mensaje:', aiResponse.detectedProducts);
        }

        // Respuesta de fallback si la IA no es confiable
        if (aiResponse.confidence < 0.5) {
          const lowerMessage = message.toLowerCase();
          if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
            autoResponse = business.welcome_message || `¡Hola! Bienvenido a ${business.business_name}. ¿En qué puedo ayudarte hoy?`;
          } else {
            autoResponse = `Gracias por contactar ${business.business_name}. ¿En qué puedo ayudarte hoy?`;
          }
        }

      } catch (error) {
        console.error('Error con IA inteligente, usando respuesta básica:', error);
        // Fallback a respuesta básica
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
          autoResponse = business.welcome_message || `¡Hola! Bienvenido a ${business.business_name}. ¿En qué puedo ayudarte hoy?`;
        } else if (business.business_type === 'products') {
          autoResponse = `Gracias por contactar ${business.business_name}. Somos especialistas en productos de calidad. ¿En qué puedo ayudarte hoy?`;
        } else {
          autoResponse = `Gracias por contactar ${business.business_name}. Ofrecemos servicios profesionales. ¿Te gustaría agendar una cita?`;
        }
      }

      // Actualizar estadísticas
      await db.execute(sql`
        UPDATE whatsapp_simple 
        SET messages_sent = messages_sent + 1, messages_received = messages_received + 1, 
            last_message_at = NOW(), updated_at = NOW()
        WHERE user_id = ${req.userId}
      `);

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