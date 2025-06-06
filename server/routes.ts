import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, comparePassword, generateToken, isAuthenticated, isAdmin } from "./auth";
import { setupStripe } from "./stripe";
import cookieParser from "cookie-parser";
import cors from "cors";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(cookieParser());
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5000',
    credentials: true
  }));

  // Set up Stripe routes
  setupStripe(app);

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName
      });
      
      // Generate token
      const token = generateToken(user);
      
      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Verify password
      const isPasswordValid = await comparePassword(password, user.password || '');
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Generate token
      const token = generateToken(user);
      
      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        user: userWithoutPassword,
        token: token
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user data', error: error.message });
    }
  });

  // Chatbot routes
  app.get('/api/chatbots', isAuthenticated, async (req, res) => {
    try {
      const chatbots = await storage.getChatbots(req.userId);
      res.json(chatbots);
    } catch (error: any) {
      console.error('Get chatbots error:', error);
      res.status(500).json({ message: 'Failed to get chatbots', error: error.message });
    }
  });

  app.get('/api/chatbots/:id', isAuthenticated, async (req, res) => {
    try {
      const chatbot = await storage.getChatbot(Number(req.params.id));
      
      if (!chatbot) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }
      
      // Check ownership
      if (chatbot.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      res.json(chatbot);
    } catch (error: any) {
      console.error('Get chatbot error:', error);
      res.status(500).json({ message: 'Failed to get chatbot', error: error.message });
    }
  });

  app.post('/api/chatbots', isAuthenticated, async (req, res) => {
    try {
      const chatbotData = { ...req.body, userId: req.userId };
      const chatbot = await storage.createChatbot(chatbotData);
      res.status(201).json(chatbot);
    } catch (error: any) {
      console.error('Create chatbot error:', error);
      res.status(500).json({ message: 'Failed to create chatbot', error: error.message });
    }
  });

  app.put('/api/chatbots/:id', isAuthenticated, async (req, res) => {
    try {
      const chatbotId = Number(req.params.id);
      const chatbot = await storage.getChatbot(chatbotId);
      
      if (!chatbot) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }
      
      // Check ownership
      if (chatbot.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const updatedChatbot = await storage.updateChatbot(chatbotId, req.body);
      res.json(updatedChatbot);
    } catch (error: any) {
      console.error('Update chatbot error:', error);
      res.status(500).json({ message: 'Failed to update chatbot', error: error.message });
    }
  });

  app.delete('/api/chatbots/:id', isAuthenticated, async (req, res) => {
    try {
      const chatbotId = Number(req.params.id);
      const chatbot = await storage.getChatbot(chatbotId);
      
      if (!chatbot) {
        return res.status(404).json({ message: 'Chatbot not found' });
      }
      
      // Check ownership
      if (chatbot.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      await storage.deleteChatbot(chatbotId);
      res.json({ message: 'Chatbot deleted successfully' });
    } catch (error: any) {
      console.error('Delete chatbot error:', error);
      res.status(500).json({ message: 'Failed to delete chatbot', error: error.message });
    }
  });

  // Chatbot templates routes
  app.get('/api/chatbot-templates', async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error('Get templates error:', error);
      res.status(500).json({ message: 'Failed to get templates', error: error.message });
    }
  });

  app.get('/api/chatbot-templates/:id', async (req, res) => {
    try {
      const template = await storage.getTemplate(Number(req.params.id));
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      res.json(template);
    } catch (error: any) {
      console.error('Get template error:', error);
      res.status(500).json({ message: 'Failed to get template', error: error.message });
    }
  });

  // Contact (CRM) routes
  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const contacts = await storage.getContacts(req.userId);
      res.json(contacts);
    } catch (error: any) {
      console.error('Get contacts error:', error);
      res.status(500).json({ message: 'Failed to get contacts', error: error.message });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const contactData = { ...req.body, userId: req.userId };
      const contact = await storage.createContact(contactData);
      res.status(201).json(contact);
    } catch (error: any) {
      console.error('Create contact error:', error);
      res.status(500).json({ message: 'Failed to create contact', error: error.message });
    }
  });

  app.get('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const contact = await storage.getContact(Number(req.params.id));
      
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      // Check ownership
      if (contact.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      res.json(contact);
    } catch (error: any) {
      console.error('Get contact error:', error);
      res.status(500).json({ message: 'Failed to get contact', error: error.message });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const contactId = Number(req.params.id);
      const contact = await storage.getContact(contactId);
      
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      // Check ownership
      if (contact.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const updatedContact = await storage.updateContact(contactId, req.body);
      res.json(updatedContact);
    } catch (error: any) {
      console.error('Update contact error:', error);
      res.status(500).json({ message: 'Failed to update contact', error: error.message });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const contactId = Number(req.params.id);
      const contact = await storage.getContact(contactId);
      
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      // Check ownership
      if (contact.userId !== req.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      await storage.deleteContact(contactId);
      res.json({ message: 'Contact deleted successfully' });
    } catch (error: any) {
      console.error('Delete contact error:', error);
      res.status(500).json({ message: 'Failed to delete contact', error: error.message });
    }
  });

  // Conversations routes
  app.get('/api/conversations', isAuthenticated, async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      
      const result = await storage.getConversationsByUser(req.userId, page, pageSize);
      res.json(result);
    } catch (error: any) {
      console.error('Get conversations error:', error);
      res.status(500).json({ message: 'Failed to get conversations', error: error.message });
    }
  });

  app.get('/api/conversations/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const conversationId = Number(req.params.id);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error: any) {
      console.error('Get conversation messages error:', error);
      res.status(500).json({ message: 'Failed to get messages', error: error.message });
    }
  });

  // Support ticket routes
  app.get('/api/support/tickets', isAuthenticated, async (req, res) => {
    try {
      const tickets = await storage.getTickets(req.userId);
      res.json(tickets);
    } catch (error: any) {
      console.error('Get tickets error:', error);
      res.status(500).json({ message: 'Failed to get tickets', error: error.message });
    }
  });

  app.post('/api/support/tickets', isAuthenticated, async (req, res) => {
    try {
      const ticketData = { ...req.body, userId: req.userId };
      const ticket = await storage.createTicket(ticketData);
      
      // Add the first message
      await storage.addTicketMessage({
        ticketId: ticket.id,
        text: ticket.description,
        isAdmin: false
      });
      
      res.status(201).json(ticket);
    } catch (error: any) {
      console.error('Create ticket error:', error);
      res.status(500).json({ message: 'Failed to create ticket', error: error.message });
    }
  });

  app.get('/api/support/tickets/:id', isAuthenticated, async (req, res) => {
    try {
      const ticket = await storage.getTicket(Number(req.params.id));
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      // Check ownership or admin
      if (ticket.userId !== req.userId && req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      res.json(ticket);
    } catch (error: any) {
      console.error('Get ticket error:', error);
      res.status(500).json({ message: 'Failed to get ticket', error: error.message });
    }
  });

  app.post('/api/support/tickets/:id/reply', isAuthenticated, async (req, res) => {
    try {
      const ticketId = Number(req.params.id);
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      // Check ownership or admin
      const isAdmin = req.userRole === 'admin';
      if (ticket.userId !== req.userId && !isAdmin) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const message = await storage.addTicketMessage({
        ticketId,
        text: req.body.message,
        isAdmin
      });
      
      // Update ticket status if needed
      if (ticket.status === 'closed') {
        await storage.updateTicket(ticketId, { status: 'pending' });
      }
      
      res.status(201).json(message);
    } catch (error: any) {
      console.error('Reply to ticket error:', error);
      res.status(500).json({ message: 'Failed to reply to ticket', error: error.message });
    }
  });

  app.get('/api/support/tickets/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const ticketId = Number(req.params.id);
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      // Check ownership or admin
      if (ticket.userId !== req.userId && req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const messages = await storage.getTicketMessages(ticketId);
      res.json(messages);
    } catch (error: any) {
      console.error('Get ticket messages error:', error);
      res.status(500).json({ message: 'Failed to get ticket messages', error: error.message });
    }
  });

  // FAQ routes
  app.get('/api/faqs', async (req, res) => {
    try {
      const faqs = await storage.getFaqs();
      res.json(faqs);
    } catch (error: any) {
      console.error('Get FAQs error:', error);
      res.status(500).json({ message: 'Failed to get FAQs', error: error.message });
    }
  });

  // Analytics routes
  app.get('/api/analytics', isAuthenticated, async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || '7d';
      const chatbotId = req.query.chatbotId ? Number(req.query.chatbotId) : undefined;
      
      const data = await storage.getAnalytics(req.userId, timeRange, chatbotId);
      res.json(data);
    } catch (error: any) {
      console.error('Get analytics error:', error);
      res.status(500).json({ message: 'Failed to get analytics', error: error.message });
    }
  });

  // WhatsApp integration routes
  app.get('/api/settings/whatsapp', isAuthenticated, async (req, res) => {
    try {
      const integration = await storage.getWhatsappIntegration(req.userId);
      res.json(integration || { status: 'disconnected' });
    } catch (error: any) {
      console.error('Get WhatsApp integration error:', error);
      res.status(500).json({ message: 'Failed to get WhatsApp integration', error: error.message });
    }
  });

  app.post('/api/settings/whatsapp/connect', isAuthenticated, async (req, res) => {
    try {
      const integration = await storage.getWhatsappIntegration(req.userId);
      
      if (integration) {
        // Update existing integration
        const updatedIntegration = await storage.updateWhatsappIntegration(integration.id, {
          ...req.body,
          status: 'connected',
          connectedAt: new Date()
        });
        return res.json(updatedIntegration);
      }
      
      // Create new integration
      const newIntegration = await storage.createWhatsappIntegration({
        ...req.body,
        userId: req.userId,
        status: 'connected',
        connectedAt: new Date()
      });
      
      res.status(201).json(newIntegration);
    } catch (error: any) {
      console.error('Connect WhatsApp error:', error);
      res.status(500).json({ message: 'Failed to connect WhatsApp', error: error.message });
    }
  });

  app.post('/api/settings/whatsapp/disconnect', isAuthenticated, async (req, res) => {
    try {
      const integration = await storage.getWhatsappIntegration(req.userId);
      
      if (!integration) {
        return res.status(404).json({ message: 'WhatsApp integration not found' });
      }
      
      const updatedIntegration = await storage.updateWhatsappIntegration(integration.id, {
        status: 'disconnected',
        connectedAt: null
      });
      
      res.json(updatedIntegration);
    } catch (error: any) {
      console.error('Disconnect WhatsApp error:', error);
      res.status(500).json({ message: 'Failed to disconnect WhatsApp', error: error.message });
    }
  });

  // User preferences routes
  app.get('/api/settings/preferences', isAuthenticated, async (req, res) => {
    try {
      const preferences = await storage.getUserPreferences(req.userId);
      res.json(preferences || {
        language: 'es',
        timezone: 'Europe/Madrid',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        emailNotifications: true,
        marketingEmails: false,
        newMessage: true,
        newConnection: true,
        accountUpdates: true
      });
    } catch (error: any) {
      console.error('Get preferences error:', error);
      res.status(500).json({ message: 'Failed to get preferences', error: error.message });
    }
  });

  app.put('/api/settings/preferences', isAuthenticated, async (req, res) => {
    try {
      const preferences = await storage.updateUserPreferences(req.userId, req.body);
      res.json(preferences);
    } catch (error: any) {
      console.error('Update preferences error:', error);
      res.status(500).json({ message: 'Failed to update preferences', error: error.message });
    }
  });
  
  // Profile settings routes
  app.put('/api/settings/profile', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.updateUser(req.userId, req.body);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  });

  app.put('/api/settings/password', isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Get user
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify current password
      const isPasswordValid = await comparePassword(currentPassword, user.password || '');
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      await storage.updateUser(req.userId, { password: hashedPassword });
      
      res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
      console.error('Update password error:', error);
      res.status(500).json({ message: 'Failed to update password', error: error.message });
    }
  });

  // Multimedia routes
  app.get("/api/multimedia", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const files = await storage.getMultimediaFiles(userId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching multimedia files:", error);
      res.status(500).json({ message: "Failed to fetch multimedia files" });
    }
  });

  app.post("/api/multimedia", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const fileData = { ...req.body, userId };
      const file = await storage.createMultimediaFile(fileData);
      res.json(file);
    } catch (error) {
      console.error("Error creating multimedia file:", error);
      res.status(500).json({ message: "Failed to create multimedia file" });
    }
  });

  app.delete("/api/multimedia/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMultimediaFile(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting multimedia file:", error);
      res.status(500).json({ message: "Failed to delete multimedia file" });
    }
  });

  // Product routes
  app.get("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const products = await storage.getProducts(userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const productData = { ...req.body, userId };
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.put("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.updateProduct(id, req.body);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Auto-generate chatbot from product
  app.post("/api/products/:id/create-chatbot", isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const userId = req.userId;
      const chatbot = await storage.createChatbotFromProduct(productId, userId);
      res.json(chatbot);
    } catch (error) {
      console.error("Error creating chatbot from product:", error);
      res.status(500).json({ message: "Failed to create chatbot from product" });
    }
  });

  // Product triggers routes
  app.get("/api/chatbots/:id/triggers", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const triggers = await storage.getProductTriggers(chatbotId);
      res.json(triggers);
    } catch (error) {
      console.error("Error fetching product triggers:", error);
      res.status(500).json({ message: "Failed to fetch product triggers" });
    }
  });

  app.post("/api/triggers", isAuthenticated, async (req: any, res) => {
    try {
      const trigger = await storage.createProductTrigger(req.body);
      res.json(trigger);
    } catch (error) {
      console.error("Error creating product trigger:", error);
      res.status(500).json({ message: "Failed to create product trigger" });
    }
  });

  app.put("/api/triggers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const trigger = await storage.updateProductTrigger(id, req.body);
      res.json(trigger);
    } catch (error) {
      console.error("Error updating product trigger:", error);
      res.status(500).json({ message: "Failed to update product trigger" });
    }
  });

  app.delete("/api/triggers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProductTrigger(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product trigger:", error);
      res.status(500).json({ message: "Failed to delete product trigger" });
    }
  });

  // Product AI config routes
  app.get("/api/products/:productId/ai-config/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const chatbotId = parseInt(req.params.chatbotId);
      const config = await storage.getProductAiConfig(productId, chatbotId);
      res.json(config || {});
    } catch (error) {
      console.error("Error fetching AI config:", error);
      res.status(500).json({ message: "Failed to fetch AI config" });
    }
  });

  app.post("/api/ai-config", isAuthenticated, async (req: any, res) => {
    try {
      const config = await storage.createProductAiConfig(req.body);
      res.json(config);
    } catch (error) {
      console.error("Error creating AI config:", error);
      res.status(500).json({ message: "Failed to create AI config" });
    }
  });

  app.put("/api/ai-config/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const config = await storage.updateProductAiConfig(id, req.body);
      res.json(config);
    } catch (error) {
      console.error("Error updating AI config:", error);
      res.status(500).json({ message: "Failed to update AI config" });
    }
  });

  // AI Conversation Control routes
  app.get("/api/conversations/ai-control", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const conversations = await storage.getConversationsByUser(userId);
      
      // Add AI control metadata to each conversation
      const conversationsWithAI = conversations.conversations.map(conv => ({
        id: conv.id,
        contactName: conv.contactName || "Unknown Contact",
        contactPhone: conv.contactId || "N/A",
        lastMessage: conv.lastMessage || "No messages",
        lastMessageTime: conv.updatedAt || new Date(),
        aiEnabled: conv.aiEnabled || false,
        status: conv.aiStatus || 'active',
        messageCount: conv.messageCount || 0,
        chatbotId: conv.chatbotId
      }));

      res.json(conversationsWithAI);
    } catch (error) {
      console.error("Error fetching AI control conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.put("/api/conversations/:id/ai-control", isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { aiEnabled } = req.body;
      
      // Update conversation AI settings
      await storage.updateConversationAI(conversationId, { aiEnabled });
      
      res.json({ success: true, message: "AI control updated successfully" });
    } catch (error) {
      console.error("Error updating AI control:", error);
      res.status(500).json({ message: "Failed to update AI control" });
    }
  });

  app.put("/api/conversations/:id/ai-pause", isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      await storage.updateConversationAI(conversationId, { aiStatus: 'paused' });
      
      res.json({ success: true, message: "AI paused successfully" });
    } catch (error) {
      console.error("Error pausing AI:", error);
      res.status(500).json({ message: "Failed to pause AI" });
    }
  });

  app.put("/api/conversations/:id/ai-resume", isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      await storage.updateConversationAI(conversationId, { aiStatus: 'active' });
      
      res.json({ success: true, message: "AI resumed successfully" });
    } catch (error) {
      console.error("Error resuming AI:", error);
      res.status(500).json({ message: "Failed to resume AI" });
    }
  });

  app.post("/api/conversations/:id/manual-message", isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;
      const userId = req.userId;
      
      // Create manual message
      const message = await storage.addManualMessage(conversationId, {
        content,
        isAI: false,
        sentBy: userId,
        timestamp: new Date()
      });
      
      res.json({ success: true, message: message });
    } catch (error) {
      console.error("Error sending manual message:", error);
      res.status(500).json({ message: "Failed to send manual message" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
