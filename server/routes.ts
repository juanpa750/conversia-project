import type { Express } from "express";
import { createServer, type Server } from "http";
import { isAuthenticated, generateToken, hashPassword, comparePassword } from "./auth";
import { simpleStorage } from "./storage";
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

      // Generate proper JWT token
      const token = generateToken(user);
      
      res.cookie('token', token, { httpOnly: true, secure: false });
      res.json({ 
        success: true,
        token: token,
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName,
          lastName: user.lastName 
        } 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
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

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}