import type { Express } from "express";
import { WhatsAppUnifiedService } from "./whatsappUnifiedService";
import { unifiedStorage } from "./storage-unified";
import { isAuthenticated } from "./auth";

export function registerUnifiedWhatsAppRoutes(app: Express) {
  // Paso 1: Configurar negocio
  app.post('/api/whatsapp-unified/setup-business', isAuthenticated, async (req: any, res) => {
    try {
      const { businessName, businessType, businessDescription, adminPhoneNumber, welcomeMessage } = req.body;
      
      if (!businessName || !businessType) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nombre del negocio y tipo son requeridos' 
        });
      }

      const result = await WhatsAppUnifiedService.setupBusiness(req.userId, {
        businessName,
        businessType,
        businessDescription,
        adminPhoneNumber,
        welcomeMessage
      });

      res.json(result);
    } catch (error: any) {
      console.error('Error configurando negocio:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  });

  // Paso 2: Conectar WhatsApp (generar QR)
  app.post('/api/whatsapp-unified/connect', isAuthenticated, async (req: any, res) => {
    try {
      const result = await WhatsAppUnifiedService.initializeConnection(req.userId);
      res.json(result);
    } catch (error: any) {
      console.error('Error conectando WhatsApp:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al conectar WhatsApp' 
      });
    }
  });

  // Obtener estado de conexión
  app.get('/api/whatsapp-unified/status', isAuthenticated, async (req: any, res) => {
    try {
      const status = await WhatsAppUnifiedService.getConnectionStatus(req.userId);
      res.json(status);
    } catch (error: any) {
      console.error('Error obteniendo estado:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo estado' 
      });
    }
  });

  // Desconectar WhatsApp
  app.post('/api/whatsapp-unified/disconnect', isAuthenticated, async (req: any, res) => {
    try {
      const result = await WhatsAppUnifiedService.disconnect(req.userId);
      res.json(result);
    } catch (error: any) {
      console.error('Error desconectando WhatsApp:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al desconectar WhatsApp' 
      });
    }
  });

  // Enviar mensaje de prueba
  app.post('/api/whatsapp-unified/send-test', isAuthenticated, async (req: any, res) => {
    try {
      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ 
          success: false, 
          message: 'Número de teléfono y mensaje son requeridos' 
        });
      }

      const result = await WhatsAppUnifiedService.sendMessage(req.userId, phoneNumber, message);
      
      res.json({ 
        success: result, 
        message: result ? 'Mensaje enviado' : 'Error enviando mensaje' 
      });
    } catch (error: any) {
      console.error('Error enviando mensaje de prueba:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error enviando mensaje' 
      });
    }
  });

  // Gestión de productos (para caso 1)
  app.get('/api/whatsapp-unified/products', isAuthenticated, async (req: any, res) => {
    try {
      const products = await unifiedStorage.getBusinessProducts(req.userId);
      res.json({ success: true, products });
    } catch (error: any) {
      console.error('Error obteniendo productos:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo productos' 
      });
    }
  });

  app.post('/api/whatsapp-unified/products', isAuthenticated, async (req: any, res) => {
    try {
      const productData = { ...req.body, userId: req.userId };
      const product = await unifiedStorage.createBusinessProduct(productData);
      res.json({ success: true, product });
    } catch (error: any) {
      console.error('Error creando producto:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error creando producto' 
      });
    }
  });

  // Gestión de servicios (para caso 2)
  app.get('/api/whatsapp-unified/services', isAuthenticated, async (req: any, res) => {
    try {
      const services = await unifiedStorage.getBusinessServices(req.userId);
      res.json({ success: true, services });
    } catch (error: any) {
      console.error('Error obteniendo servicios:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo servicios' 
      });
    }
  });

  app.post('/api/whatsapp-unified/services', isAuthenticated, async (req: any, res) => {
    try {
      const serviceData = { ...req.body, userId: req.userId };
      const service = await unifiedStorage.createBusinessService(serviceData);
      res.json({ success: true, service });
    } catch (error: any) {
      console.error('Error creando servicio:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error creando servicio' 
      });
    }
  });

  // Gestión de citas (para caso 2)
  app.get('/api/whatsapp-unified/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const appointments = await unifiedStorage.getAppointments(req.userId);
      res.json({ success: true, appointments });
    } catch (error: any) {
      console.error('Error obteniendo citas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo citas' 
      });
    }
  });

  app.post('/api/whatsapp-unified/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const appointmentData = { ...req.body, userId: req.userId };
      const appointment = await unifiedStorage.createAppointment(appointmentData);
      res.json({ success: true, appointment });
    } catch (error: any) {
      console.error('Error creando cita:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error creando cita' 
      });
    }
  });

  // Obtener mensajes de WhatsApp
  app.get('/api/whatsapp-unified/messages', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await unifiedStorage.getWhatsappMessages(req.userId, limit);
      res.json({ success: true, messages });
    } catch (error: any) {
      console.error('Error obteniendo mensajes:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo mensajes' 
      });
    }
  });

  // Configuración de respuestas automáticas
  app.get('/api/whatsapp-unified/auto-response-config', isAuthenticated, async (req: any, res) => {
    try {
      const connection = await unifiedStorage.getWhatsappConnection(req.userId);
      
      if (!connection) {
        return res.json({ 
          success: true, 
          config: { 
            aiEnabled: true, 
            autoRespond: true, 
            welcomeMessage: '' 
          } 
        });
      }

      res.json({ 
        success: true, 
        config: {
          aiEnabled: connection.aiEnabled,
          autoRespond: connection.autoRespond,
          welcomeMessage: connection.welcomeMessage,
          businessType: connection.businessType,
          businessDescription: connection.businessDescription
        }
      });
    } catch (error: any) {
      console.error('Error obteniendo configuración:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo configuración' 
      });
    }
  });

  app.post('/api/whatsapp-unified/auto-response-config', isAuthenticated, async (req: any, res) => {
    try {
      const { aiEnabled, autoRespond, welcomeMessage } = req.body;
      
      await unifiedStorage.updateWhatsappConnection(req.userId, {
        aiEnabled,
        autoRespond,
        welcomeMessage
      });

      res.json({ 
        success: true, 
        message: 'Configuración actualizada' 
      });
    } catch (error: any) {
      console.error('Error actualizando configuración:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error actualizando configuración' 
      });
    }
  });
}