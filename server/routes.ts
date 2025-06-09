import type { Express } from "express";
import { createServer, type Server } from "http";
import { isAuthenticated, generateToken, hashPassword, comparePassword } from "./auth";
import { simpleStorage } from "./storage";
import { registerWhatsAppSimpleRoutes } from "./routes-whatsapp-simple";

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
      
      // Obtener citas existentes para la fecha específica
      const existingAppointments = await db.execute(
        sql`SELECT * FROM appointments WHERE user_id = ${userId} ORDER BY scheduled_date DESC`
      );
      const dateAppointments = existingAppointments.rows.filter((apt: any) => {
        if (!apt.scheduled_date) return false;
        const aptDate = new Date(apt.scheduled_date).toISOString().split('T')[0];
        return aptDate === date;
      });
      
      // Marcar slots ocupados basado en citas reales
      const occupiedTimes = new Set();
      dateAppointments.forEach(apt => {
        if (apt.status !== 'cancelled' && apt.scheduled_date) {
          const aptDate = new Date(apt.scheduled_date);
          const timeStr = `${aptDate.getHours().toString().padStart(2, '0')}:${aptDate.getMinutes().toString().padStart(2, '0')}`;
          occupiedTimes.add(timeStr);
        }
      });
      
      // Devolver slots con información de estado real
      const slotsWithStatus = slots.map(slot => ({
        time: slot,
        available: !occupiedTimes.has(slot),
        occupied: occupiedTimes.has(slot)
      }));
      
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

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}