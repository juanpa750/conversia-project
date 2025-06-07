import type { Express } from "express";
import { simpleStorage } from "./storage-simple";
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

      // Crear o actualizar conexión WhatsApp
      const existing = await simpleStorage.getWhatsappConnection(req.userId);
      
      if (existing) {
        await simpleStorage.updateWhatsappConnection(req.userId, {
          businessName,
          businessType,
          businessDescription,
          status: 'configured'
        });
      } else {
        await simpleStorage.createWhatsappConnection({
          userId: req.userId,
          businessName,
          businessType,
          businessDescription,
          status: 'configured',
          isConnected: false,
          aiEnabled: true,
          autoRespond: true,
          welcomeMessage: `¡Hola! Bienvenido a ${businessName}. ¿En qué puedo ayudarte?`
        });
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
      // Simular proceso de conexión
      await simpleStorage.updateWhatsappConnection(req.userId, {
        status: 'connecting',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      });

      // Simular conexión exitosa después de 3 segundos
      setTimeout(async () => {
        try {
          await simpleStorage.updateWhatsappConnection(req.userId, {
            status: 'connected',
            isConnected: true,
            connectedAt: new Date(),
            qrCode: null
          });
        } catch (error) {
          console.error('Error actualizando estado:', error);
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
      const connection = await simpleStorage.getWhatsappConnection(req.userId);
      
      if (!connection) {
        return res.json({ 
          success: true,
          status: 'not_configured',
          message: 'Configure su negocio primero'
        });
      }

      res.json({ 
        success: true,
        status: connection.status,
        isConnected: connection.isConnected,
        qrCode: connection.qrCode,
        businessName: connection.businessName,
        businessType: connection.businessType,
        messagesSent: connection.messagesSent || 0,
        messagesReceived: connection.messagesReceived || 0
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