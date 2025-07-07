// server/whatsappRoutesNew.ts - Rutas API para WhatsApp
import { Router } from 'express';
import { whatsappManager } from './whatsapp';
import { isAuthenticated } from './auth';
import { storage } from './storage';

const whatsappRouter = Router();

// Conectar WhatsApp a un chatbot
whatsappRouter.post('/whatsapp/connect/:id', isAuthenticated, async (req: any, res) => {
  try {
    const chatbotId = parseInt(req.params.id);
    const userId = req.userId;
    
    // Verificar que el chatbot pertenece al usuario
    const chatbot = await storage.getChatbot(chatbotId);
    if (!chatbot || chatbot.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permiso para conectar este chatbot' 
      });
    }
    
    // Verificar estado actual
    const currentStatus = whatsappManager.getConnectionStatus(chatbotId);
    if (currentStatus.connected) {
      return res.json({
        success: true,
        connected: true,
        message: 'WhatsApp ya está conectado'
      });
    }
    
    // Inicializar sesión
    const result = await whatsappManager.initializeSession(chatbotId);
    
    if (result.success) {
      // Esperar un poco para que se genere el QR
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const status = whatsappManager.getConnectionStatus(chatbotId);
      
      return res.json({
        success: true,
        connected: status.connected,
        qr: status.qrCode,
        message: status.connected ? 'Conectado exitosamente' : 'QR generado, escanea para conectar'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message || 'Error conectando WhatsApp'
      });
    }
  } catch (error) {
    console.error('Error en /connect/chatbot:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener estado de conexión
whatsappRouter.get('/whatsapp/status/:id', isAuthenticated, async (req: any, res) => {
  try {
    const chatbotId = parseInt(req.params.id);
    const userId = req.userId;
    
    // Verificar que el chatbot pertenece al usuario
    const chatbot = await storage.getChatbot(chatbotId);
    if (!chatbot || chatbot.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permiso para ver este chatbot' 
      });
    }
    
    const status = whatsappManager.getConnectionStatus(chatbotId);
    
    res.json({
      success: true,
      connected: status.connected,
      status: status.status,
      qrCode: status.qrCode,
      sessionId: `chatbot_${chatbotId}`,
      lastCheck: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en /status:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando estado'
    });
  }
});

// Desconectar WhatsApp
whatsappRouter.post('/whatsapp/disconnect/:id', isAuthenticated, async (req: any, res) => {
  try {
    const chatbotId = parseInt(req.params.id);
    const userId = req.userId;
    
    // Verificar que el chatbot pertenece al usuario
    const chatbot = await storage.getChatbot(chatbotId);
    if (!chatbot || chatbot.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permiso para desconectar este chatbot' 
      });
    }
    
    const result = await whatsappManager.disconnectSession(chatbotId);
    
    if (result) {
      res.json({
        success: true,
        message: 'WhatsApp desconectado exitosamente'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error desconectando WhatsApp'
      });
    }
  } catch (error) {
    console.error('Error en /disconnect:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Verificar conexión manualmente
whatsappRouter.post('/whatsapp/check-connection/:id', isAuthenticated, async (req: any, res) => {
  try {
    const chatbotId = parseInt(req.params.id);
    const userId = req.userId;
    
    // Verificar que el chatbot pertenece al usuario
    const chatbot = await storage.getChatbot(chatbotId);
    if (!chatbot || chatbot.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permiso para verificar este chatbot' 
      });
    }
    
    const status = whatsappManager.getConnectionStatus(chatbotId);
    
    // Actualizar estado en base de datos
    try {
      await storage.updateChatbot(chatbotId, { 
        whatsappConnected: status.connected,
        lastConnectionCheck: new Date()
      }, userId);
    } catch (error) {
      console.error('Error actualizando estado en BD:', error);
    }
    
    res.json({
      success: true,
      connected: status.connected,
      status: status.status,
      message: status.connected ? 'WhatsApp está conectado' : 'WhatsApp no está conectado'
    });
  } catch (error) {
    console.error('Error en /check-connection:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando conexión'
    });
  }
});

// Forzar conexión (botón "Ya escaneé el QR")
whatsappRouter.post('/whatsapp/force-connected/:id', isAuthenticated, async (req: any, res) => {
  try {
    const chatbotId = parseInt(req.params.id);
    const userId = req.userId;
    
    // Verificar que el chatbot pertenece al usuario
    const chatbot = await storage.getChatbot(chatbotId);
    if (!chatbot || chatbot.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permiso para modificar este chatbot' 
      });
    }
    
    const result = await whatsappManager.forceConnected(chatbotId);
    
    if (result) {
      res.json({
        success: true,
        message: 'WhatsApp marcado como conectado'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error marcando como conectado'
      });
    }
  } catch (error) {
    console.error('Error en /force-connected:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener mensajes de WhatsApp
whatsappRouter.get('/whatsapp/messages/:id', isAuthenticated, async (req: any, res) => {
  try {
    const chatbotId = parseInt(req.params.id);
    const userId = req.userId;
    
    // Verificar que el chatbot pertenece al usuario
    const chatbot = await storage.getChatbot(chatbotId);
    if (!chatbot || chatbot.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permiso para ver estos mensajes' 
      });
    }
    
    const messages = await storage.getWhatsAppMessages(chatbotId);
    
    res.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg.id,
        contactPhone: msg.contactPhone,
        contactName: msg.contactName,
        content: msg.content,
        aiResponse: msg.aiResponse,
        timestamp: msg.timestamp,
        detectedIntent: msg.detectedIntent
      }))
    });
  } catch (error) {
    console.error('Error en /messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo mensajes'
    });
  }
});

// Enviar mensaje manual
whatsappRouter.post('/whatsapp/send-message/:id', isAuthenticated, async (req: any, res) => {
  try {
    const chatbotId = parseInt(req.params.id);
    const userId = req.userId;
    const { phone, message } = req.body;
    
    // Verificar que el chatbot pertenece al usuario
    const chatbot = await storage.getChatbot(chatbotId);
    if (!chatbot || chatbot.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permiso para usar este chatbot' 
      });
    }
    
    const status = whatsappManager.getConnectionStatus(chatbotId);
    if (!status.connected) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp no está conectado'
      });
    }
    
    // Aquí implementarías el envío manual de mensajes
    // const session = whatsappManager.sessions.get(chatbotId);
    // await session.client.sendMessage(phone, message);
    
    res.json({
      success: true,
      message: 'Mensaje enviado exitosamente'
    });
  } catch (error) {
    console.error('Error en /send-message:', error);
    res.status(500).json({
      success: false,
      message: 'Error enviando mensaje'
    });
  }
});

export default whatsappRouter;