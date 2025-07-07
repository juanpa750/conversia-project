import { Router } from 'express';
import { whatsappWebService } from './whatsappWebService';
import { storage } from './storage';

const router = Router();

/**
 * Conectar WhatsApp para un chatbot específico
 */
router.post('/connect/:chatbotId', async (req, res) => {
  try {
    const chatbotId = parseInt(req.params.chatbotId);
    const userId = req.body.userId || 'default_user'; // Obtener del auth

    if (isNaN(chatbotId)) {
      return res.status(400).json({ error: 'Invalid chatbot ID' });
    }

    // Verificar que el chatbot existe
    const chatbot = await storage.getChatbot(chatbotId);
    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Inicializar sesión WhatsApp
    const result = await whatsappWebService.initializeSession(chatbotId, userId);
    
    if (result.success) {
      return res.json({ 
        success: true, 
        message: 'WhatsApp connected successfully' 
      });
    } else if (result.qrCode) {
      return res.json({ 
        success: false, 
        qrCode: result.qrCode,
        message: 'QR Code generated, scan to connect' 
      });
    } else {
      return res.status(500).json({ 
        error: result.error || 'Failed to initialize WhatsApp session' 
      });
    }
  } catch (error) {
    console.error('Error connecting WhatsApp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Obtener QR code para un chatbot
 */
router.get('/qr/:chatbotId', async (req, res) => {
  try {
    const chatbotId = parseInt(req.params.chatbotId);
    
    if (isNaN(chatbotId)) {
      return res.status(400).json({ error: 'Invalid chatbot ID' });
    }

    const qrCode = await whatsappWebService.getQRCode(chatbotId);
    
    if (qrCode) {
      res.json({ qrCode });
    } else {
      res.status(404).json({ error: 'QR Code not available' });
    }
  } catch (error) {
    console.error('Error getting QR code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Obtener estado de conexión WhatsApp para un chatbot
 */
router.get('/status/:chatbotId', async (req, res) => {
  try {
    const chatbotId = parseInt(req.params.chatbotId);
    
    if (isNaN(chatbotId)) {
      return res.status(400).json({ error: 'Invalid chatbot ID' });
    }

    const status = whatsappWebService.getSessionStatus(chatbotId);
    res.json(status);
  } catch (error) {
    console.error('Error getting WhatsApp status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Desconectar WhatsApp para un chatbot
 */
router.post('/disconnect/:chatbotId', async (req, res) => {
  try {
    const chatbotId = parseInt(req.params.chatbotId);
    
    if (isNaN(chatbotId)) {
      return res.status(400).json({ error: 'Invalid chatbot ID' });
    }

    await whatsappWebService.disconnect(chatbotId);
    res.json({ success: true, message: 'WhatsApp disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Enviar mensaje desde un chatbot
 */
router.post('/send/:chatbotId', async (req, res) => {
  try {
    const chatbotId = parseInt(req.params.chatbotId);
    const { phoneNumber, message } = req.body;
    
    if (isNaN(chatbotId)) {
      return res.status(400).json({ error: 'Invalid chatbot ID' });
    }

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    const success = await whatsappWebService.sendMessage(chatbotId, phoneNumber, message);
    
    if (success) {
      res.json({ success: true, message: 'Message sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send message' });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Probar respuesta del chatbot (para testing)
 */
router.post('/test-response/:chatbotId', async (req, res) => {
  try {
    const chatbotId = parseInt(req.params.chatbotId);
    const { message } = req.body;
    
    if (isNaN(chatbotId)) {
      return res.status(400).json({ error: 'Invalid chatbot ID' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Obtener configuración del chatbot
    const chatbot = await storage.getChatbot(chatbotId);
    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Verificar trigger keywords
    const messageText = message.toLowerCase();
    const triggerKeywords = chatbot.triggerKeywords || [];
    
    const shouldRespond = triggerKeywords.some(keyword => 
      messageText.includes(keyword.toLowerCase())
    );

    if (!shouldRespond) {
      return res.json({ 
        willRespond: false, 
        reason: 'Message does not contain trigger keywords',
        triggerKeywords 
      });
    }

    // Generar respuesta (sin enviar)
    let response = chatbot.aiInstructions || 'Hola, gracias por contactarnos. ¿En qué puedo ayudarte?';
    
    // Si hay producto asociado, incluir información del producto
    if (chatbot.productId) {
      const product = await storage.getProduct(chatbot.productId);
      if (product) {
        response = `${response}\n\nTe comparto información sobre ${product.name}:\n${product.description}`;
      }
    }

    res.json({ 
      willRespond: true, 
      response,
      triggerKeywords,
      matchedKeyword: triggerKeywords.find(keyword => messageText.includes(keyword.toLowerCase()))
    });
  } catch (error) {
    console.error('Error testing chatbot response:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;