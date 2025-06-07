import type { Express } from "express";
import { whatsappSimpleService } from "./whatsappSimpleService";
import { isAuthenticated } from "./auth";
import { storage } from "./storage";

export function registerWhatsAppSimpleRoutes(app: Express) {
  
  // Inicializar sesión de WhatsApp Web (generar QR)
  app.post('/api/whatsapp-simple/initialize', isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId!;
      
      // Inicializar sesión
      await whatsappSimpleService.initializeSession(userId);
      
      res.json({ 
        success: true, 
        message: 'Sesión de WhatsApp Web inicializada. Escanea el código QR que aparecerá.' 
      });
    } catch (error: any) {
      console.error('Error inicializando sesión WhatsApp Web:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error inicializando WhatsApp Web', 
        error: error.message 
      });
    }
  });

  // Obtener código QR
  app.get('/api/whatsapp-simple/qr', isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId!;
      const status = whatsappWebService.getSessionStatus(userId);
      
      if (status.status === 'qr_pending' && status.qrCode) {
        res.json({
          success: true,
          qrCode: status.qrCode,
          status: status.status
        });
      } else {
        res.json({
          success: false,
          message: 'Código QR no disponible',
          status: status.status
        });
      }
    } catch (error: any) {
      console.error('Error obteniendo código QR:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo código QR', 
        error: error.message 
      });
    }
  });

  // Obtener estado de la sesión
  app.get('/api/whatsapp-simple/status', isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId!;
      const status = whatsappWebService.getSessionStatus(userId);
      
      res.json({
        success: true,
        ...status
      });
    } catch (error: any) {
      console.error('Error obteniendo estado:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo estado', 
        error: error.message 
      });
    }
  });

  // Enviar mensaje manual
  app.post('/api/whatsapp-simple/send-message', isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId!;
      const { to, message } = req.body;

      if (!to || !message) {
        return res.status(400).json({
          success: false,
          message: 'Número de destino y mensaje son requeridos'
        });
      }

      const sent = await whatsappWebService.sendMessage(userId, to, message);
      
      if (sent) {
        res.json({
          success: true,
          message: 'Mensaje enviado correctamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'No se pudo enviar el mensaje. Verifica que WhatsApp esté conectado.'
        });
      }
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error enviando mensaje', 
        error: error.message 
      });
    }
  });

  // Desconectar sesión
  app.post('/api/whatsapp-simple/disconnect', isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId!;
      await whatsappWebService.disconnectSession(userId);
      
      res.json({
        success: true,
        message: 'Sesión de WhatsApp desconectada'
      });
    } catch (error: any) {
      console.error('Error desconectando sesión:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error desconectando sesión', 
        error: error.message 
      });
    }
  });

  // Reiniciar sesión
  app.post('/api/whatsapp-simple/restart', isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId!;
      await whatsappWebService.restartSession(userId);
      
      res.json({
        success: true,
        message: 'Sesión de WhatsApp reiniciada. Escanea el nuevo código QR.'
      });
    } catch (error: any) {
      console.error('Error reiniciando sesión:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error reiniciando sesión', 
        error: error.message 
      });
    }
  });

  // Obtener configuración de respuesta automática
  app.get('/api/whatsapp-simple/auto-response-config', isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId!;
      
      // Obtener chatbots del usuario
      const chatbots = await storage.getChatbotsByUser(userId);
      
      res.json({
        success: true,
        chatbots: chatbots.map(bot => ({
          id: bot.id,
          name: bot.name,
          status: bot.status,
          aiPersonality: bot.aiPersonality,
          aiInstructions: bot.aiInstructions,
          conversationObjective: bot.conversationObjective
        }))
      });
    } catch (error: any) {
      console.error('Error obteniendo configuración:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo configuración', 
        error: error.message 
      });
    }
  });

  // Actualizar configuración de chatbot para respuesta automática
  app.patch('/api/whatsapp-simple/auto-response-config/:chatbotId', isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId!;
      const { chatbotId } = req.params;
      const { aiPersonality, aiInstructions, conversationObjective } = req.body;

      // Verificar que el chatbot pertenece al usuario
      const chatbot = await storage.getChatbotById(parseInt(chatbotId));
      if (!chatbot || chatbot.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Chatbot no encontrado'
        });
      }

      // Actualizar chatbot
      const updatedChatbot = await storage.updateChatbot(parseInt(chatbotId), {
        aiPersonality,
        aiInstructions,
        conversationObjective
      });

      res.json({
        success: true,
        message: 'Configuración de IA actualizada',
        chatbot: updatedChatbot
      });
    } catch (error: any) {
      console.error('Error actualizando configuración:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error actualizando configuración', 
        error: error.message 
      });
    }
  });

  // Obtener historial de conversaciones
  app.get('/api/whatsapp-simple/conversations', isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId!;
      
      const conversations = await storage.getConversationsByUser(userId);
      
      res.json({
        success: true,
        conversations: conversations.map(conv => ({
          id: conv.id,
          contactId: conv.contactId,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          status: conv.status
        }))
      });
    } catch (error: any) {
      console.error('Error obteniendo conversaciones:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo conversaciones', 
        error: error.message 
      });
    }
  });

  // Obtener mensajes de una conversación
  app.get('/api/whatsapp-simple/conversations/:conversationId/messages', isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId!;
      const { conversationId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      // Verificar que la conversación pertenece al usuario
      const conversation = await storage.getConversationById(parseInt(conversationId));
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversación no encontrada'
        });
      }

      const messages = await storage.getMessagesByConversation(parseInt(conversationId), limit);
      
      res.json({
        success: true,
        messages: messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          isFromContact: msg.isFromContact,
          createdAt: msg.createdAt
        }))
      });
    } catch (error: any) {
      console.error('Error obteniendo mensajes:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo mensajes', 
        error: error.message 
      });
    }
  });
}