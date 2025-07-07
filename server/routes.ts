import type { Express } from "express";
import { createServer, type Server } from "http";
import { isAuthenticated, generateToken, hashPassword, comparePassword } from "./auth";
import { simpleStorage } from "./storage";
import { whatsappMultiService } from "./whatsappMultiService";
import { whatsappCloudAPI } from "./whatsappCloudAPI";
import { whatsappRoutes } from './whatsappRoutes';
import { whatsappService } from './whatsappService';
import realWhatsAppRoutes from './realWhatsAppRoutes';

import { registerWhatsAppSimpleRoutes } from "./routes-whatsapp-simple";
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple authentication route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await simpleStorage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password if it exists, otherwise allow login for demo
      if (user.password && !(await comparePassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session for user
      const session = (req as any).session;
      session.user = {
        id: user.id,
        role: user.role || 'user'
      };
      
      // Generate JWT token for API requests
      const token = generateToken(user);
      
      // Set token as httpOnly cookie for web requests
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      res.json({ 
        success: true,
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role || 'user'
        } 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout route to clear session and cookies
  app.post("/api/auth/logout", (req, res) => {
    // Clear session
    if ((req as any).session) {
      (req as any).session.destroy();
    }
    
    // Clear cookies
    res.clearCookie('token');
    res.clearCookie('connect.sid');
    
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Get current user
  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const user = await simpleStorage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user exists
      const existingUser = await simpleStorage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create user with ID
      const userData = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password,
        firstName,
        lastName
      };

      const user = await simpleStorage.createUser(userData);
      
      res.json({ 
        success: true,
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName,
          lastName: user.lastName 
        } 
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", isAuthenticated, async (req: any, res) => {
    try {
      const user = await simpleStorage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName 
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  // Register simple WhatsApp routes
  registerWhatsAppSimpleRoutes(app);

  // Basic data routes
  app.get("/api/chatbots", isAuthenticated, async (req: any, res) => {
    try {
      const chatbots = await simpleStorage.getChatbots(req.userId);
      res.json(chatbots);
    } catch (error) {
      console.error('Get chatbots error:', error);
      res.json([]);
    }
  });

  app.post("/api/chatbots", isAuthenticated, async (req: any, res) => {
    try {
      const { name, description, type = 'sales', status = 'draft', objective, aiInstructions } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'Chatbot name is required' });
      }

      const chatbotData = {
        userId: req.userId,
        name,
        description: description || '',
        type,
        status,
        objective: objective || 'sales',
        aiInstructions: aiInstructions || '',
        flow: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const chatbot = await simpleStorage.createChatbot(chatbotData);
      res.status(201).json(chatbot);
    } catch (error: any) {
      console.error('Create chatbot error:', error);
      res.status(500).json({ message: 'Failed to create chatbot', error: error?.message || 'Unknown error' });
    }
  });

  app.get("/api/chatbots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const chatbot = await simpleStorage.getChatbot(chatbotId);
      
      console.log('Chatbot found:', chatbot?.id, 'User match:', chatbot?.userId === req.userId);
      
      if (!chatbot || chatbot.userId !== req.userId) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }
      
      res.json(chatbot);
    } catch (error) {
      console.error('Get chatbot error:', error);
      res.status(500).json({ message: 'Failed to get chatbot' });
    }
  });

  // Obtener datos completos del chatbot para edición
  app.get("/api/chatbots/:id/edit", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const chatbot = await simpleStorage.getChatbot(chatbotId);
      
      if (!chatbot || chatbot.userId !== req.userId) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }
      
      res.json(chatbot);
    } catch (error) {
      console.error('Get chatbot for edit error:', error);
      res.status(500).json({ message: 'Failed to fetch chatbot for edit' });
    }
  });

  app.put("/api/chatbots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Check if chatbot exists and belongs to user
      const existing = await simpleStorage.getChatbot(chatbotId);
      if (!existing || existing.userId !== req.userId) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }

      const updatedChatbot = await simpleStorage.updateChatbot(chatbotId, updateData);
      res.json(updatedChatbot);
    } catch (error) {
      console.error('Update chatbot error:', error);
      res.status(500).json({ message: 'Failed to update chatbot' });
    }
  });

  app.delete("/api/chatbots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      
      // Check if chatbot exists and belongs to user
      const existing = await simpleStorage.getChatbot(chatbotId);
      if (!existing || existing.userId !== req.userId) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }

      await simpleStorage.deleteChatbot(chatbotId);
      res.json({ message: 'Chatbot deleted successfully' });
    } catch (error) {
      console.error('Delete chatbot error:', error);
      res.status(500).json({ message: 'Failed to delete chatbot' });
    }
  });

  app.get("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const products = await simpleStorage.getProducts(req.userId);
      res.json(products);
    } catch (error) {
      console.error('Get products error:', error);
      res.json([]);
    }
  });

  app.get("/api/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const appointments = await simpleStorage.getAppointments(req.userId);
      res.json(appointments);
    } catch (error) {
      console.error('Get appointments error:', error);
      res.json([]);
    }
  });

  // WhatsApp Integration Routes
  
  // Get all WhatsApp integrations for user
  app.get("/api/whatsapp/integrations", isAuthenticated, async (req: any, res) => {
    try {
      const integrations = await simpleStorage.getWhatsappIntegrations(req.userId);
      res.json(integrations);
    } catch (error) {
      console.error('Get WhatsApp integrations error:', error);
      res.status(500).json({ message: 'Failed to get WhatsApp integrations' });
    }
  });

  // Get WhatsApp integration for specific chatbot
  app.get("/api/whatsapp/integrations/chatbot/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.chatbotId);
      const integration = await simpleStorage.getWhatsappIntegrationByChatbot(chatbotId, req.userId);
      res.json(integration);
    } catch (error) {
      console.error('Get WhatsApp integration by chatbot error:', error);
      res.status(500).json({ message: 'Failed to get WhatsApp integration' });
    }
  });

  // Create new WhatsApp integration
  app.post("/api/whatsapp/integrations", isAuthenticated, async (req: any, res) => {
    try {
      const {
        phoneNumber,
        displayName,
        businessDescription,
        businessType,
        autoRespond,
        operatingHours,
        chatbotId,
        productId
      } = req.body;

      const integrationData = {
        userId: req.userId,
        phoneNumber,
        displayName,
        businessDescription,
        chatbotId: parseInt(chatbotId),
        productId: productId ? parseInt(productId) : null,
        priority: 1,
        autoRespond: autoRespond ?? true,
        operatingHours,
        status: 'disconnected', // Start as disconnected until QR scan
        isActive: true
      };

      const integration = await simpleStorage.createWhatsappIntegration(integrationData);
      res.json(integration);
    } catch (error) {
      console.error('Create WhatsApp integration error:', error);
      res.status(500).json({ message: 'Failed to create WhatsApp integration' });
    }
  });

  // Link existing WhatsApp integration to chatbot
  app.post("/api/whatsapp/integrations/:id/link-chatbot", isAuthenticated, async (req: any, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const { chatbotId } = req.body;

      // Verify integration belongs to user
      const integration = await simpleStorage.getWhatsappIntegrationById(integrationId);
      if (!integration || integration.userId !== req.userId) {
        return res.status(404).json({ message: 'Integration not found' });
      }

      // Create a new integration record linked to the chatbot
      const newIntegration = await simpleStorage.createWhatsappIntegration({
        userId: req.userId,
        phoneNumber: integration.phoneNumber,
        displayName: integration.displayName,
        businessDescription: integration.businessDescription,
        chatbotId: parseInt(chatbotId),
        productId: integration.productId,
        priority: integration.priority,
        autoRespond: integration.autoRespond,
        operatingHours: integration.operatingHours,
        status: integration.status,
        isActive: true
      });

      res.json(newIntegration);
    } catch (error) {
      console.error('Link WhatsApp integration error:', error);
      res.status(500).json({ message: 'Failed to link WhatsApp integration' });
    }
  });

  // Connect WhatsApp for a specific chatbot using NEW Multi-Chat Service
  app.post("/api/whatsapp/connect/chatbot/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.chatbotId);
      const userId = req.userId;

      console.log(`🔄 Iniciando conexión WhatsApp Multi-Chat para chatbot ${chatbotId}, usuario ${userId}`);

      // Verificar que el chatbot pertenece al usuario
      const chatbot = await simpleStorage.getChatbot(chatbotId);
      if (!chatbot || chatbot.userId !== userId) {
        return res.status(404).json({ message: 'Chatbot no encontrado' });
      }

      // Inicializar sesión WhatsApp con el nuevo servicio multi-chat
      const result = await whatsappMultiService.createSession(chatbotId.toString(), userId);
      
      if (result === 'CONNECTED') {
        res.json({ 
          success: true, 
          status: 'connected',
          message: 'WhatsApp ya está conectado',
          sessionId: `${userId}_${chatbotId}`
        });
      } else if (result === 'QR_GENERATED') {
        // Obtener el QR de la sesión
        const session = await whatsappMultiService.getSession(chatbotId, userId);
        res.json({ 
          success: true, 
          connected: false,
          status: 'waiting_qr',
          qr: session?.qrCode,
          message: 'Escanea el código QR con WhatsApp',
          sessionId: `${userId}_${chatbotId}`
        });
      } else {
        res.json({ 
          success: false,
          connected: false,
          status: 'error',
          message: 'Error generando conexión WhatsApp'
        });
      }

    } catch (error) {
      console.error('❌ Error conectando WhatsApp Multi-Chat:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Desconectar sesión WhatsApp
  app.post("/api/whatsapp/disconnect/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.chatbotId);
      const userId = req.userId;

      // Find integration for this chatbot
      const integration = await simpleStorage.getWhatsappIntegrationByChatbotId(chatbotId);
      if (!integration || integration.user_id !== userId) {
        return res.status(404).json({ message: 'Integration not found' });
      }

      // Create session ID for this integration
      const sessionId = `${userId}_${integration.id}`;
      
      // Remove session from WhatsApp service
      whatsappService.sessions.delete(sessionId);

      // Update integration status to disconnected
      await simpleStorage.updateWhatsappIntegrationStatus(integration.id, 'disconnected');
      
      res.json({ 
        success: true, 
        message: 'WhatsApp desconectado exitosamente' 
      });

    } catch (error) {
      console.error('❌ Error desconectando WhatsApp:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Restart WhatsApp session to generate new QR
  app.post("/api/whatsapp/restart/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.chatbotId);
      const userId = req.userId;

      // Find integration for this chatbot
      const integration = await simpleStorage.getWhatsappIntegrationByChatbotId(chatbotId);
      if (!integration || integration.user_id !== userId) {
        return res.status(404).json({ message: 'Integration not found' });
      }

      // Create session ID for this integration
      const sessionId = `${userId}_${integration.id}`;
      
      // Restart WhatsApp session
      const result = await whatsappService.restartSession(sessionId);
      
      if (result.success) {
        // Update integration status to initializing
        await simpleStorage.updateWhatsappIntegrationStatus(integration.id, 'initializing');
        res.json({ 
          success: true, 
          sessionId, 
          qrCode: result.qrCode,
          message: 'WhatsApp session restarted' 
        });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('❌ Error restarting WhatsApp:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Obtener estado de sesión WhatsApp
  app.get("/api/whatsapp/status/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = req.params.chatbotId;
      const userId = req.userId;

      // Find integration for this chatbot
      const integration = await simpleStorage.getWhatsappIntegrationByChatbotId(parseInt(chatbotId));
      if (!integration || integration.user_id !== userId) {
        return res.json({ 
          connected: false, 
          status: 'not_initialized' 
        });
      }

      // Create session ID for this integration
      const sessionId = `${userId}_${integration.id}`;
      
      // Get session status from WhatsApp service
      const session = whatsappService.getSessionStatus(sessionId);
      
      if (!session) {
        return res.json({ 
          connected: false, 
          status: 'not_initialized' 
        });
      }

      res.json({ 
        connected: session.isConnected,
        status: session.status,
        qrCode: session.qrCode,
        phoneNumber: session.phoneNumber,
        lastError: session.lastError,
        sessionId: sessionId
      });

    } catch (error) {
      console.error('❌ Error obteniendo estado WhatsApp:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Procesar mensajes entrantes de WhatsApp
  app.post("/api/whatsapp/process-message", async (req: any, res) => {
    try {
      const { sessionKey, message, contact, timestamp } = req.body;
      
      console.log(`📨 Procesando mensaje de WhatsApp: "${message}" de ${contact}`);
      
      // Procesar mensaje con AI
      await whatsappMultiService.processIncomingMessage(sessionKey, message, contact);
      
      res.json({ success: true, processed: true });
      
    } catch (error) {
      console.error('❌ Error procesando mensaje WhatsApp:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Verificar manualmente el estado de conexión
  app.post("/api/whatsapp/check-connection/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = req.params.chatbotId;
      const userId = req.userId;

      console.log(`🔍 Verificación manual solicitada para chatbot ${chatbotId}`);

      const isConnected = await whatsappMultiService.checkConnectionStatus(chatbotId, userId);
      
      res.json({ 
        success: true,
        connected: isConnected,
        status: isConnected ? 'connected' : 'not_connected',
        message: isConnected ? 'WhatsApp conectado exitosamente' : 'WhatsApp no conectado aún'
      });

    } catch (error) {
      console.error('❌ Error verificando conexión WhatsApp:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Forzar marcado como conectado (para cuando el usuario confirma que escaneó el QR)
  app.post("/api/whatsapp/force-connected/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = req.params.chatbotId;
      const userId = req.userId;

      console.log(`🔧 Forzando estado conectado para chatbot ${chatbotId}`);

      const session = await whatsappMultiService.getSession(chatbotId, userId);
      if (session) {
        session.isConnected = true;
        console.log(`✅ Estado forzado a conectado para: ${userId}_${chatbotId}`);
        
        res.json({ 
          success: true,
          connected: true,
          status: 'connected',
          message: 'WhatsApp marcado como conectado'
        });
      } else {
        res.status(404).json({ error: 'Sesión no encontrada' });
      }

    } catch (error) {
      console.error('❌ Error forzando conexión WhatsApp:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Clonar configuración del chatbot master
  app.post("/api/chatbots/clone-master/:targetChatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const { targetChatbotId } = req.params;
      const userId = req.userId;

      // Buscar el chatbot master (ID: 29)
      const masterChatbot = await simpleStorage.getChatbot(29);
      if (!masterChatbot || masterChatbot.userId !== userId) {
        return res.status(404).json({ error: 'Chatbot master no encontrado' });
      }

      // Obtener el chatbot objetivo
      const targetChatbot = await simpleStorage.getChatbot(parseInt(targetChatbotId));
      if (!targetChatbot || targetChatbot.userId !== userId) {
        return res.status(404).json({ error: 'Chatbot objetivo no encontrado' });
      }

      // Clonar configuración del master al objetivo
      const updatedChatbot = await simpleStorage.updateChatbot(parseInt(targetChatbotId), {
        ai_instructions: masterChatbot.ai_instructions,
        ai_personality: masterChatbot.ai_personality,
        conversation_objective: masterChatbot.conversation_objective,
        type: masterChatbot.type,
        objective: masterChatbot.objective
      });

      console.log(`✅ Configuración clonada del master al chatbot ${targetChatbotId}`);

      res.json({ 
        success: true, 
        message: 'Configuración clonada exitosamente',
        chatbot: updatedChatbot
      });

    } catch (error) {
      console.error('❌ Error clonando configuración:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Assign existing WhatsApp number to a chatbot
  app.post("/api/whatsapp/assign", isAuthenticated, async (req: any, res) => {
    try {
      const { chatbotId, phoneNumber } = req.body;
      
      // Verify chatbot belongs to user
      const chatbot = await simpleStorage.getChatbot(chatbotId);
      if (!chatbot || chatbot.userId !== req.userId) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }

      // Find the integration with this phone number
      const existingIntegration = await simpleStorage.getWhatsappIntegrationByPhone(phoneNumber, req.userId);
      if (!existingIntegration) {
        return res.status(404).json({ message: 'WhatsApp number not found' });
      }

      // Check if it's already assigned to another chatbot
      if (existingIntegration.chatbotId && existingIntegration.chatbotId !== chatbotId) {
        return res.status(400).json({ message: 'This number is already assigned to another chatbot' });
      }

      // Assign the integration to this chatbot
      await simpleStorage.updateWhatsappIntegration(existingIntegration.id, {
        chatbotId: chatbotId
      });

      res.json({
        success: true,
        message: 'WhatsApp number assigned to chatbot successfully'
      });
    } catch (error) {
      console.error('Assign WhatsApp error:', error);
      res.status(500).json({ message: 'Failed to assign WhatsApp number' });
    }
  });

  // Get WhatsApp integration for specific chatbot
  app.get("/api/whatsapp/integrations/chatbot/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.chatbotId);
      
      // Verify chatbot belongs to user
      const chatbot = await simpleStorage.getChatbot(chatbotId);
      if (!chatbot || chatbot.userId !== req.userId) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }

      // Get WhatsApp integration for this chatbot
      const integration = await simpleStorage.getWhatsappIntegrationByChatbot(chatbotId, req.userId);
      
      if (!integration) {
        return res.status(404).json({ message: 'No WhatsApp integration found for this chatbot' });
      }

      res.json(integration);
    } catch (error) {
      console.error('Get chatbot WhatsApp integration error:', error);
      res.status(500).json({ message: 'Failed to get WhatsApp integration' });
    }
  });

  // Delete WhatsApp integration
  app.delete("/api/whatsapp/integrations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      
      // Verify integration belongs to user
      const integration = await simpleStorage.getWhatsappIntegrationById(integrationId);
      if (!integration || integration.userId !== req.userId) {
        return res.status(404).json({ message: 'Integration not found' });
      }

      await simpleStorage.deleteWhatsappIntegration(integrationId);
      res.json({ message: 'WhatsApp integration deleted successfully' });
    } catch (error) {
      console.error('Delete WhatsApp integration error:', error);
      res.status(500).json({ message: 'Failed to delete WhatsApp integration' });
    }
  });

  // Real WhatsApp Connection endpoints
  // Initialize WhatsApp connection with QR by chatbotId (convenience route)
  app.post("/api/whatsapp/connect/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.chatbotId);
      
      // Find integration for this chatbot
      const integration = await simpleStorage.getWhatsappIntegrationByChatbotId(chatbotId);
      if (!integration || integration.user_id !== req.userId) {
        return res.status(404).json({ message: 'Integration not found' });
      }

      // Create session ID for this integration
      const sessionId = `${req.userId}_${integration.id}`;
      
      // Initialize WhatsApp session
      const result = await whatsappService.initializeSession(sessionId);
      
      if (result.success) {
        // Update integration status to initializing
        await simpleStorage.updateWhatsappIntegrationStatus(integration.id, 'initializing');
        res.json({ success: true, sessionId, message: 'WhatsApp initialization started' });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('WhatsApp connect error:', error);
      res.status(500).json({ message: 'Failed to initialize WhatsApp connection' });
    }
  });

  // Initialize WhatsApp connection with QR by integrationId
  app.post("/api/whatsapp/connect/integration/:integrationId", isAuthenticated, async (req: any, res) => {
    try {
      const integrationId = parseInt(req.params.integrationId);
      
      // Verify integration belongs to user
      const integration = await simpleStorage.getWhatsappIntegrationById(integrationId);
      if (!integration || (integration.user_id !== req.userId && integration.userId !== req.userId)) {
        return res.status(404).json({ message: 'Integration not found' });
      }

      // Create session ID for this integration
      const sessionId = `${req.userId}_${integrationId}`;
      
      // Initialize WhatsApp session
      const result = await whatsappService.initializeSession(sessionId);
      
      if (result.success) {
        // Update integration status to initializing
        await simpleStorage.updateWhatsappIntegrationStatus(integrationId, 'initializing');
        res.json({ success: true, sessionId, message: 'WhatsApp initialization started' });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('WhatsApp connect error:', error);
      res.status(500).json({ message: 'Failed to initialize WhatsApp connection' });
    }
  });

  // Get QR code for WhatsApp connection
  app.get("/api/whatsapp/qr/:integrationId", isAuthenticated, async (req: any, res) => {
    try {
      const integrationId = parseInt(req.params.integrationId);
      
      // Verify integration belongs to user
      const integration = await simpleStorage.getWhatsappIntegrationById(integrationId);
      if (!integration || (integration.user_id !== req.userId && integration.userId !== req.userId)) {
        return res.status(404).json({ message: 'Integration not found' });
      }

      const sessionId = `${req.userId}_${integrationId}`;
      const session = whatsappService.getSessionStatus(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found. Initialize connection first.' });
      }

      res.json({
        status: session.status,
        qrCode: session.qrCode,
        isConnected: session.isConnected,
        error: session.lastError
      });
    } catch (error) {
      console.error('Get QR code error:', error);
      res.status(500).json({ message: 'Failed to get QR code' });
    }
  });

  // Get WhatsApp connection status
  app.get("/api/whatsapp/status/:integrationId", isAuthenticated, async (req: any, res) => {
    try {
      const integrationId = parseInt(req.params.integrationId);
      
      // Verify integration belongs to user
      const integration = await simpleStorage.getWhatsappIntegrationById(integrationId);
      if (!integration || integration.user_id !== req.userId) {
        return res.status(404).json({ message: 'Integration not found' });
      }

      const sessionId = `${req.userId}_${integrationId}`;
      const session = whatsappService.getSessionStatus(sessionId);
      
      if (!session) {
        return res.json({
          status: 'disconnected',
          isConnected: false,
          phoneNumber: null
        });
      }

      // Get connected phone number if available
      const connectedNumber = session.isConnected ? 
        await whatsappService.getConnectedNumber(sessionId) : null;

      // Update database status if session is connected
      if (session.isConnected && integration.status !== 'connected') {
        await simpleStorage.updateWhatsappIntegrationStatus(integrationId, 'connected');
        if (connectedNumber) {
          await simpleStorage.updateWhatsappIntegrationPhone(integrationId, `+${connectedNumber}`);
        }
      }

      res.json({
        status: session.status,
        isConnected: session.isConnected,
        phoneNumber: connectedNumber ? `+${connectedNumber}` : integration.phoneNumber,
        error: session.lastError
      });
    } catch (error) {
      console.error('Get WhatsApp status error:', error);
      res.status(500).json({ message: 'Failed to get WhatsApp status' });
    }
  });

  // Disconnect WhatsApp session
  app.post("/api/whatsapp/disconnect/:integrationId", isAuthenticated, async (req: any, res) => {
    try {
      const integrationId = parseInt(req.params.integrationId);
      
      // Verify integration belongs to user
      const integration = await simpleStorage.getWhatsappIntegrationById(integrationId);
      if (!integration || integration.user_id !== req.userId) {
        return res.status(404).json({ message: 'Integration not found' });
      }

      const sessionId = `${req.userId}_${integrationId}`;
      const result = await whatsappService.disconnectSession(sessionId);
      
      // Update database status
      await simpleStorage.updateWhatsappIntegrationStatus(integrationId, 'disconnected');
      
      if (result.success) {
        res.json({ success: true, message: 'WhatsApp disconnected successfully' });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('WhatsApp disconnect error:', error);
      res.status(500).json({ message: 'Failed to disconnect WhatsApp' });
    }
  });

  // Send message via WhatsApp
  app.post("/api/whatsapp/send-message", isAuthenticated, async (req: any, res) => {
    try {
      const { integrationId, to, message } = req.body;
      
      // Verify integration belongs to user
      const integration = await simpleStorage.getWhatsappIntegrationById(integrationId);
      if (!integration || integration.user_id !== req.userId) {
        return res.status(404).json({ message: 'Integration not found' });
      }

      const sessionId = `${req.userId}_${integrationId}`;
      const result = await whatsappService.sendMessage(sessionId, to, message);
      
      if (result.success) {
        res.json({ success: true, message: 'Message sent successfully' });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  // Send test message via WhatsApp
  app.post("/api/whatsapp/test-message/:integrationId", isAuthenticated, async (req: any, res) => {
    try {
      const integrationId = parseInt(req.params.integrationId);
      const { to, message } = req.body;
      
      // Verify integration belongs to user
      const integration = await simpleStorage.getWhatsappIntegrationById(integrationId);
      if (!integration || integration.user_id !== req.userId) {
        return res.status(404).json({ message: 'Integration not found' });
      }

      const sessionId = `${req.userId}_${integrationId}`;
      const result = await whatsappService.sendMessage(sessionId, to, message);
      
      if (result.success) {
        res.json({ success: true, message: 'Message sent successfully' });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('Send test message error:', error);
      res.status(500).json({ message: 'Failed to send test message' });
    }
  });

  app.get("/api/calendar/available-slots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      
      console.log('📅 Getting available slots for user:', userId, 'date:', date);
      
      // Generar todos los slots posibles para el día
      const slots = [];
      const startHour = 9;
      const endHour = 17;
      
      // Generar slots cada 30 minutos
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(timeStr);
        }
      }
      
      console.log('📅 Generated', slots.length, 'slots');
      
      // Obtener citas existentes para la fecha específica
      const existingAppointments = await simpleStorage.getAppointments(userId);
      console.log('📅 Found', existingAppointments.length, 'total appointments');
      
      const dateAppointments = existingAppointments.filter((apt: any) => {
        if (!apt.scheduled_date) return false;
        const aptDate = new Date(apt.scheduled_date).toISOString().split('T')[0];
        return aptDate === date;
      });
      
      console.log('📅 Found', dateAppointments.length, 'appointments for date', date);
      
      // Marcar slots ocupados basado en citas reales
      const occupiedTimes = new Set();
      dateAppointments.forEach((apt: any) => {
        if (apt.status !== 'cancelled' && apt.scheduled_date) {
          const aptDate = new Date(apt.scheduled_date);
          const timeStr = `${aptDate.getHours().toString().padStart(2, '0')}:${aptDate.getMinutes().toString().padStart(2, '0')}`;
          occupiedTimes.add(timeStr);
          console.log('📅 Occupied slot:', timeStr, 'by appointment:', apt.client_name);
        }
      });
      
      // Devolver slots con información de estado real
      const slotsWithStatus = slots.map(slot => ({
        time: slot,
        available: !occupiedTimes.has(slot),
        occupied: occupiedTimes.has(slot)
      }));
      
      const availableSlots = slotsWithStatus.filter(s => s.available).length;
      const occupiedSlots = slotsWithStatus.filter(s => s.occupied).length;
      
      console.log('📅 Returning', slotsWithStatus.length, 'slots:', availableSlots, 'available,', occupiedSlots, 'occupied');
      
      res.json(slotsWithStatus);
    } catch (error) {
      console.error('Get calendar slots error:', error);
      res.json([]);
    }
  });

  app.get("/api/calendar/settings", isAuthenticated, async (req: any, res) => {
    try {
      res.json({
        workingHours: { start: "09:00", end: "18:00" },
        workingDays: [1, 2, 3, 4, 5],
        appointmentDuration: 60,
        bufferTime: 15
      });
    } catch (error) {
      console.error('Get calendar settings error:', error);
      res.json({});
    }
  });

  // Create chatbot from product with auto-configuration
  app.post("/api/products/:id/create-chatbot", isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      // Get product details
      const product = await simpleStorage.getProduct(productId);
      if (!product || product.user_id !== req.userId) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if product already has a chatbot
      if (product.chatbotId) {
        return res.status(400).json({ message: 'Product already has a chatbot' });
      }

      // Extract keywords from product name and description
      const extractKeywords = (text: string): string[] => {
        const words = text.toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 2);
        return Array.from(new Set(words)).slice(0, 10);
      };

      const nameKeywords = extractKeywords(product.name);
      const descKeywords = product.description ? extractKeywords(product.description) : [];
      const keywordSet = new Set([...nameKeywords, ...descKeywords]);
      const triggerKeywords = Array.from(keywordSet);

      // Generate AI instructions based on product
      const aiInstructions = `Eres un especialista en ${product.name}. 

INFORMACIÓN DEL PRODUCTO:
- Nombre: ${product.name}
- Precio: ${product.price} ${product.currency || 'USD'}
- Categoría: ${product.category || 'General'}
- Descripción: ${product.description || 'Producto de alta calidad'}

OBJETIVOS DE CONVERSACIÓN:
1. Captar ATENCIÓN con beneficios del producto
2. Generar INTERÉS explicando características únicas
3. Crear DESEO mostrando valor y soluciones
4. Motivar ACCIÓN para compra o consulta

PERSONALIDAD:
- Experto y confiable
- Enfocado en soluciones
- Consultivo, no agresivo
- Orientado al cliente

Responde de manera natural y conversacional. Usa la información del producto para educar al cliente y guiarlo hacia una decisión de compra informada.`;

      // Create chatbot with auto-configuration
      const chatbotData = {
        name: `${product.name} - Asistente`,
        description: `Chatbot especializado en ${product.name} con IA avanzada`,
        userId: req.userId,
        productId: productId,
        triggerKeywords: triggerKeywords.join(','),
        aiInstructions: aiInstructions,
        aiPersonality: 'Experto consultivo y orientado al cliente',
        conversationObjective: `Vender ${product.name} usando metodología AIDA de forma natural`
      };

      const chatbot = await simpleStorage.createChatbot(chatbotData);

      // Update product with chatbot reference
      await simpleStorage.updateProduct(productId, { chatbotId: chatbot.id });

      res.json({ 
        chatbot, 
        message: 'Chatbot creado y configurado automáticamente',
        autoConfigured: true 
      });
    } catch (error) {
      console.error('Create chatbot from product error:', error);
      res.status(500).json({ message: 'Failed to create chatbot from product' });
    }
  });

  // Import and register WhatsApp Web routes
  try {
    const whatsappRoutesNew = await import('./whatsappRoutesNew');
    app.use('/api', whatsappRoutesNew.default);
    console.log('WhatsApp Web routes registered successfully');
  } catch (error) {
    console.error('Error importing WhatsApp routes:', error);
  }

  // Register REAL WhatsApp routes (using whatsapp-web.js)
  app.use('/api/whatsapp-real', realWhatsAppRoutes);
  console.log('Real WhatsApp routes registered successfully');

  // Rutas para WhatsApp real (sin autenticación para pruebas)
  app.post('/api/whatsapp-real/connect/:chatbotId', async (req, res) => {
    try {
      const { chatbotId } = req.params;
      const sessionId = `chatbot_${chatbotId}`;
      
      const result = await import('./realWhatsAppService').then(module => 
        module.realWhatsAppService.initializeSession(sessionId)
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error connecting real WhatsApp:', error);
      res.status(500).json({ success: false, error: 'Failed to connect real WhatsApp' });
    }
  });

  app.get('/api/whatsapp-real/status/:chatbotId', async (req, res) => {
    try {
      const { chatbotId } = req.params;
      const sessionId = `chatbot_${chatbotId}`;
      
      const status = await import('./realWhatsAppService').then(module => 
        module.realWhatsAppService.getSessionStatus(sessionId)
      );
      
      res.json(status);
    } catch (error) {
      console.error('Error getting real WhatsApp status:', error);
      res.status(500).json({ success: false, error: 'Failed to get real WhatsApp status' });
    }
  });

  app.post('/api/whatsapp-real/disconnect/:chatbotId', async (req, res) => {
    try {
      const { chatbotId } = req.params;
      const sessionId = `chatbot_${chatbotId}`;
      
      const result = await import('./realWhatsAppService').then(module => 
        module.realWhatsAppService.disconnectSession(sessionId)
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error disconnecting real WhatsApp:', error);
      res.status(500).json({ success: false, error: 'Failed to disconnect real WhatsApp' });
    }
  });

  // Create HTTP server

  const httpServer = createServer(app);
  return httpServer;
}