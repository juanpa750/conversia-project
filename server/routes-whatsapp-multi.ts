import type { Express } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./auth";

// Endpoints para gestión de múltiples integraciones de WhatsApp por usuario y producto
export function registerMultiWhatsAppRoutes(app: Express) {
  
  // Obtener todas las integraciones de WhatsApp del usuario
  app.get('/api/whatsapp/integrations', isAuthenticated, async (req, res) => {
    try {
      const integrations = await storage.getAllWhatsappIntegrations(req.userId!);
      res.json(integrations);
    } catch (error: any) {
      console.error('Error obteniendo integraciones de WhatsApp:', error);
      res.status(500).json({ message: 'Error obteniendo integraciones de WhatsApp', error: error.message });
    }
  });

  // Obtener integraciones activas
  app.get('/api/whatsapp/integrations/active', isAuthenticated, async (req, res) => {
    try {
      const integrations = await storage.getActiveWhatsappIntegrations(req.userId!);
      res.json(integrations);
    } catch (error: any) {
      console.error('Error obteniendo integraciones activas:', error);
      res.status(500).json({ message: 'Error obteniendo integraciones activas', error: error.message });
    }
  });

  // Obtener integraciones por producto específico
  app.get('/api/whatsapp/integrations/product/:productId', isAuthenticated, async (req, res) => {
    try {
      const { productId } = req.params;
      const integrations = await storage.getWhatsappIntegrationsByProduct(req.userId!, parseInt(productId));
      res.json(integrations);
    } catch (error: any) {
      console.error('Error obteniendo integraciones por producto:', error);
      res.status(500).json({ message: 'Error obteniendo integraciones por producto', error: error.message });
    }
  });

  // Crear nueva integración de WhatsApp
  app.post('/api/whatsapp/integrations', isAuthenticated, async (req, res) => {
    try {
      const {
        phoneNumber,
        displayName,
        businessDescription,
        productId,
        chatbotId,
        priority = 1,
        autoRespond = true,
        operatingHours
      } = req.body;

      const integrationData = {
        userId: req.userId!,
        phoneNumber,
        displayName,
        businessDescription,
        productId: productId ? parseInt(productId) : null,
        chatbotId: chatbotId ? parseInt(chatbotId) : null,
        priority,
        autoRespond,
        operatingHours,
        status: 'disconnected',
        isActive: true
      };

      const integration = await storage.createWhatsappIntegration(integrationData);
      res.json(integration);
    } catch (error: any) {
      console.error('Error creando integración de WhatsApp:', error);
      res.status(500).json({ message: 'Error creando integración de WhatsApp', error: error.message });
    }
  });

  // Actualizar integración específica
  app.patch('/api/whatsapp/integrations/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const integrationId = parseInt(id);
      
      // Verificar que la integración pertenece al usuario
      const existing = await storage.getWhatsappIntegrationById(integrationId);
      if (!existing || existing.userId !== req.userId) {
        return res.status(404).json({ message: 'Integración no encontrada' });
      }

      const updatedIntegration = await storage.updateWhatsappIntegration(integrationId, req.body);
      res.json(updatedIntegration);
    } catch (error: any) {
      console.error('Error actualizando integración:', error);
      res.status(500).json({ message: 'Error actualizando integración', error: error.message });
    }
  });

  // Activar/Desactivar integración
  app.patch('/api/whatsapp/integrations/:id/toggle', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const integrationId = parseInt(id);
      
      const existing = await storage.getWhatsappIntegrationById(integrationId);
      if (!existing || existing.userId !== req.userId) {
        return res.status(404).json({ message: 'Integración no encontrada' });
      }

      const updatedIntegration = await storage.updateWhatsappIntegration(integrationId, {
        isActive: !existing.isActive
      });
      
      res.json(updatedIntegration);
    } catch (error: any) {
      console.error('Error cambiando estado de integración:', error);
      res.status(500).json({ message: 'Error cambiando estado de integración', error: error.message });
    }
  });

  // Eliminar integración
  app.delete('/api/whatsapp/integrations/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const integrationId = parseInt(id);
      
      const existing = await storage.getWhatsappIntegrationById(integrationId);
      if (!existing || existing.userId !== req.userId) {
        return res.status(404).json({ message: 'Integración no encontrada' });
      }

      await storage.deleteWhatsappIntegration(integrationId);
      res.json({ message: 'Integración eliminada correctamente' });
    } catch (error: any) {
      console.error('Error eliminando integración:', error);
      res.status(500).json({ message: 'Error eliminando integración', error: error.message });
    }
  });

  // Conectar integración específica con WhatsApp Business API
  app.post('/api/whatsapp/integrations/:id/connect', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { accessToken, phoneNumberId, businessAccountId } = req.body;
      const integrationId = parseInt(id);
      
      const existing = await storage.getWhatsappIntegrationById(integrationId);
      if (!existing || existing.userId !== req.userId) {
        return res.status(404).json({ message: 'Integración no encontrada' });
      }

      // Actualizar con credenciales de WhatsApp Business API
      const updatedIntegration = await storage.updateWhatsappIntegration(integrationId, {
        accessToken,
        phoneNumberId,
        businessAccountId,
        status: 'connected',
        connectedAt: new Date()
      });
      
      res.json(updatedIntegration);
    } catch (error: any) {
      console.error('Error conectando integración:', error);
      res.status(500).json({ message: 'Error conectando integración', error: error.message });
    }
  });

  // Obtener mensajes de una integración específica
  app.get('/api/whatsapp/integrations/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = 50 } = req.query;
      const integrationId = parseInt(id);
      
      const existing = await storage.getWhatsappIntegrationById(integrationId);
      if (!existing || existing.userId !== req.userId) {
        return res.status(404).json({ message: 'Integración no encontrada' });
      }

      const messages = await storage.getWhatsappMessages(integrationId, Number(limit));
      res.json(messages);
    } catch (error: any) {
      console.error('Error obteniendo mensajes:', error);
      res.status(500).json({ message: 'Error obteniendo mensajes', error: error.message });
    }
  });

  // Enviar mensaje desde integración específica
  app.post('/api/whatsapp/integrations/:id/send', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { to, message, type = 'text' } = req.body;
      const integrationId = parseInt(id);
      
      const integration = await storage.getWhatsappIntegrationById(integrationId);
      if (!integration || integration.userId !== req.userId) {
        return res.status(404).json({ message: 'Integración no encontrada' });
      }

      if (integration.status !== 'connected') {
        return res.status(400).json({ message: 'Integración no está conectada' });
      }

      // Aquí implementarías el envío real usando WhatsApp Business API
      // Por ahora simulamos el envío exitoso
      const messageData = {
        integrationId,
        messageId: `msg_${Date.now()}`,
        conversationId: `conv_${to}`,
        fromNumber: integration.phoneNumber,
        toNumber: to,
        messageType: type,
        content: message,
        direction: 'outbound',
        status: 'sent',
        timestamp: new Date()
      };

      const savedMessage = await storage.createWhatsappMessage(messageData);
      
      // Actualizar estadísticas
      await storage.updateWhatsappIntegration(integrationId, {
        messagesSent: integration.messagesSent + 1,
        lastMessageAt: new Date()
      });

      res.json({ 
        success: true, 
        message: 'Mensaje enviado correctamente',
        messageData: savedMessage 
      });
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      res.status(500).json({ message: 'Error enviando mensaje', error: error.message });
    }
  });

  // Webhook para recibir mensajes (soporta múltiples integraciones)
  app.post('/api/whatsapp/webhook/:integrationId', async (req, res) => {
    try {
      const { integrationId } = req.params;
      const webhookData = req.body;
      
      const integration = await storage.getWhatsappIntegrationById(parseInt(integrationId));
      if (!integration) {
        return res.status(404).json({ message: 'Integración no encontrada' });
      }

      // Procesar mensaje entrante
      if (webhookData.entry && webhookData.entry[0]?.changes) {
        for (const change of webhookData.entry[0].changes) {
          if (change.value?.messages) {
            for (const message of change.value.messages) {
              const messageData = {
                integrationId: parseInt(integrationId),
                messageId: message.id,
                conversationId: `conv_${message.from}`,
                fromNumber: message.from,
                toNumber: integration.phoneNumber,
                messageType: message.type,
                content: message.text?.body || '',
                direction: 'inbound',
                status: 'received',
                timestamp: new Date(parseInt(message.timestamp) * 1000)
              };

              await storage.createWhatsappMessage(messageData);
              
              // Actualizar estadísticas
              await storage.updateWhatsappIntegration(parseInt(integrationId), {
                messagesReceived: integration.messagesReceived + 1,
                lastMessageAt: new Date()
              });
            }
          }
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error procesando webhook:', error);
      res.status(500).json({ message: 'Error procesando webhook', error: error.message });
    }
  });

  // Verificación de webhook
  app.get('/api/whatsapp/webhook/:integrationId', async (req, res) => {
    try {
      const { integrationId } = req.params;
      const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
      
      const integration = await storage.getWhatsappIntegrationById(parseInt(integrationId));
      if (!integration) {
        return res.status(404).send('Integración no encontrada');
      }

      if (mode === 'subscribe' && token === integration.webhookToken) {
        res.status(200).send(challenge);
      } else {
        res.status(403).send('Token de verificación incorrecto');
      }
    } catch (error: any) {
      console.error('Error verificando webhook:', error);
      res.status(500).send('Error verificando webhook');
    }
  });
}