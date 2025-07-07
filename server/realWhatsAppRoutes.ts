import { Router } from 'express';
import { realWhatsAppService } from './realWhatsAppService';
import { isAuthenticated } from './auth';

const router = Router();

// Initialize/connect real WhatsApp session (temporarily without auth for testing)
router.post('/connect/:chatbotId', async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const userId = 'test_user'; // Temporary for testing
    const sessionId = `${userId}_${chatbotId}`;
    
    console.log(`🚀 Connecting REAL WhatsApp for chatbot ${chatbotId}`);
    
    const result = await realWhatsAppService.initializeSession(sessionId);
    
    if (result.success) {
      res.json({
        success: true,
        sessionId,
        message: 'Real WhatsApp session initializing'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error connecting real WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get real WhatsApp session status
router.get('/status/:chatbotId', isAuthenticated, async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const userId = req.userId;
    const sessionId = `${userId}_${chatbotId}`;
    
    const status = realWhatsAppService.getSessionStatus(sessionId);
    
    res.json({
      connected: status.connected,
      status: status.status,
      qrCode: status.qrCode,
      phoneNumber: status.phoneNumber,
      sessionId
    });
  } catch (error) {
    console.error('Error getting real WhatsApp status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Restart real WhatsApp session
router.post('/restart/:chatbotId', isAuthenticated, async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const userId = req.userId;
    const sessionId = `${userId}_${chatbotId}`;
    
    console.log(`🔄 Restarting REAL WhatsApp session: ${sessionId}`);
    
    // First destroy existing session
    await realWhatsAppService.destroySession(sessionId);
    
    // Then create new session
    const result = await realWhatsAppService.initializeSession(sessionId);
    
    if (result.success) {
      res.json({
        success: true,
        sessionId,
        message: 'Real WhatsApp session restarted'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error restarting real WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Disconnect real WhatsApp session
router.post('/disconnect/:chatbotId', isAuthenticated, async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const userId = req.userId;
    const sessionId = `${userId}_${chatbotId}`;
    
    const result = await realWhatsAppService.disconnectSession(sessionId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Real WhatsApp session disconnected'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error disconnecting real WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send message via real WhatsApp
router.post('/send/:chatbotId', isAuthenticated, async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const { to, message } = req.body;
    const userId = req.userId;
    const sessionId = `${userId}_${chatbotId}`;
    
    const result = await realWhatsAppService.sendMessage(sessionId, to, message);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Message sent via real WhatsApp'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending real WhatsApp message:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;