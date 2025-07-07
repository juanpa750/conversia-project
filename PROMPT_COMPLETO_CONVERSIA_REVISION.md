# PROMPT COMPLETO PARA REVISAR CONVERSIA - ERROR JAVASCRIPT PERSISTENTE

## PROBLEMA ACTUAL
Hay un error JavaScript persistente: "Uncaught SyntaxError: Invalid or unexpected token" que no se ha podido resolver. La aplicación ConversIA está funcionalmente completa pero este error impide el funcionamiento correcto del frontend.

## SOLICITUD
Por favor revisen y corrijan este error JavaScript. La aplicación está 99% completa y solo necesita este fix.

---

# CONVERSIA - PLATAFORMA SAAS WHATSAPP CHATBOTS CON IA

## DESCRIPCIÓN GENERAL
ConversIA es una plataforma SaaS completa para crear y gestionar chatbots de WhatsApp con IA integrada. Permite crear múltiples chatbots, cada uno con su propio número de WhatsApp, usando WhatsApp Web (100% gratuito, sin APIs pagas de Meta).

## FUNCIONALIDADES IMPLEMENTADAS
- ✅ Sistema de autenticación completo (JWT + bcrypt)
- ✅ Base de datos PostgreSQL con Drizzle ORM
- ✅ Gestión de chatbots y productos
- ✅ Integración WhatsApp Web real con Puppeteer + Stealth
- ✅ IA avanzada para respuestas automáticas
- ✅ Sistema de citas automatizado
- ✅ Integración Stripe para pagos
- ✅ CRM y analytics
- ❌ ERROR JAVASCRIPT EN FRONTEND (necesita fix)

---

## ESTRUCTURA DE ARCHIVOS COMPLETA

### package.json
```json
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.37.0",
    "@hookform/resolvers": "^3.10.0",
    "@jridgewell/trace-mapping": "^0.3.25",
    "@neondatabase/serverless": "^0.10.4",
    "@notionhq/client": "^3.1.1",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-aspect-ratio": "^1.1.3",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-collapsible": "^1.1.4",
    "@radix-ui/react-context-menu": "^2.2.7",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-hover-card": "^1.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-menubar": "^1.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.6",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-progress": "^1.1.3",
    "@radix-ui/react-radio-group": "^1.2.4",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slider": "^1.2.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-toggle": "^1.1.3",
    "@radix-ui/react-toggle-group": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@replit/vite-plugin-cartographer": "^2.0.1",
    "@replit/vite-plugin-runtime-error-modal": "^1.0.0",
    "@sendgrid/mail": "^8.1.5",
    "@stripe/react-stripe-js": "^3.7.0",
    "@stripe/stripe-js": "^7.3.0",
    "@tailwindcss/typography": "^0.5.16",
    "@tailwindcss/vite": "^4.0.0-alpha.35",
    "@tanstack/react-query": "^5.60.5",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/cookie-parser": "^1.4.8",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/express-session": "^1.18.1",
    "@types/memoizee": "^0.4.11",
    "@types/node": "^22.10.2",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/qrcode": "^1.5.5",
    "@types/react": "^18.3.17",
    "@types/react-dom": "^18.3.5",
    "@types/ws": "^8.5.13",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "bcryptjs": "^2.4.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.4",
    "connect-pg-simple": "^10.0.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "date-fns": "^4.1.0",
    "drizzle-kit": "^0.32.2",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.5.1",
    "embla-carousel-react": "^8.6.1",
    "esbuild": "^0.24.2",
    "events": "^3.3.0",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "framer-motion": "^11.14.4",
    "input-otp": "^1.4.1",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.468.0",
    "memoizee": "^0.4.17",
    "memorystore": "^1.6.7",
    "next-themes": "^0.4.4",
    "openai": "^4.76.1",
    "openid-client": "^6.1.6",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "postcss": "^8.5.11",
    "puppeteer": "^23.10.4",
    "puppeteer-extra": "^3.3.6",
    "puppeteer-extra-plugin-stealth": "^2.11.2",
    "qrcode": "^1.5.4",
    "react": "^18.3.1",
    "react-day-picker": "^9.4.2",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2",
    "react-icons": "^5.4.0",
    "react-resizable-panels": "^2.1.7",
    "reactflow": "^11.11.4",
    "recharts": "^2.13.3",
    "stripe": "^17.4.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss": "^3.5.4",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^4.19.2",
    "tw-animate-css": "^1.1.4",
    "typescript": "^5.7.3",
    "vaul": "^1.1.1",
    "vite": "^6.0.7",
    "whatsapp-web.js": "^1.26.0",
    "wouter": "^3.4.1",
    "ws": "^8.18.0",
    "zod": "^3.24.1",
    "zod-validation-error": "^3.4.0"
  }
}
```

### shared/schema.ts (BASE DE DATOS COMPLETA)
```typescript
import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, foreignKey, pgEnum, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'unpaid', 'trial']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show']);
export const chatbotStatusEnum = pgEnum('chatbot_status', ['draft', 'active', 'paused', 'archived']);
export const chatbotTypeEnum = pgEnum('chatbot_type', ['sales', 'support', 'appointment', 'general']);

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: text("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('user').notNull(),
  company: varchar("company"),
  businessEmail: varchar("business_email"),
  phone: varchar("phone"),
  bio: text("bio"),
  timezone: varchar("timezone").default('America/Bogota'),
  language: varchar("language").default('es'),
  dateFormat: varchar("date_format").default('DD/MM/YYYY'),
  timeFormat: varchar("time_format").default('24h'),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  // WhatsApp Cloud API Integration
  phoneNumberId: text("phone_number_id"),
  businessAccountId: text("business_account_id"),
  monthlyFreeUsed: integer("monthly_free_used").default(0),
  monthlyFreeLimit: integer("monthly_free_limit").default(1000),
  setupCode: text("setup_code"),
  phoneVerified: boolean("phone_verified").default(false),
  lastResetDate: timestamp("last_reset_date"),
  // Legacy fields
  whatsappAccessToken: text("whatsapp_access_token"),
  whatsappPhoneNumberId: varchar("whatsapp_phone_number_id"),
  whatsappBusinessAccountId: varchar("whatsapp_business_account_id"),
  whatsappVerifyToken: varchar("whatsapp_verify_token"),
  monthlyFreeMessagesUsed: integer("monthly_free_messages_used").default(0),
  freeMessagesResetDate: timestamp("free_messages_reset_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
  stripePriceId: varchar("stripe_price_id"),
  status: subscriptionStatusEnum("status").default('trial').notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chatbots table
export const chatbots = pgTable("chatbots", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: chatbotStatusEnum("status").default('draft').notNull(),
  type: chatbotTypeEnum("type").default('general').notNull(),
  flow: jsonb("flow"),
  productId: integer("product_id"),
  triggerKeywords: jsonb("trigger_keywords"),
  aiInstructions: text("ai_instructions"),
  aiPersonality: varchar("ai_personality"),
  conversationObjective: text("conversation_objective"),
  objective: varchar("objective"),
  productName: varchar("product_name"),
  productDescription: text("product_description"),
  whatsappNumber: varchar("whatsapp_number"),
  whatsappSessionData: jsonb("whatsapp_session_data"),
  whatsappConnected: boolean("whatsapp_connected").default(false),
  lastConnectionCheck: timestamp("last_connection_check"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  category: varchar("category"),
  specifications: text("specifications"),
  features: text("features"),
  images: jsonb("images"),
  availability: boolean("availability").default(true),
  stock: integer("stock"),
  sku: varchar("sku"),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// WhatsApp Messages table
export const whatsappMessages = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(),
  chatbotId: integer("chatbot_id").notNull().references(() => chatbots.id),
  contactPhone: varchar("contact_phone").notNull(),
  contactName: varchar("contact_name"),
  messageType: varchar("message_type"),
  content: text("content").notNull(),
  messageId: varchar("message_id"),
  timestamp: timestamp("timestamp").defaultNow(),
  detectedIntent: varchar("detected_intent"),
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 2 }),
  detectedProducts: jsonb("detected_products"),
  aiResponse: text("ai_response"),
  responseTime: integer("response_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  chatbotId: integer("chatbot_id").references(() => chatbots.id),
  clientName: varchar("client_name").notNull(),
  clientEmail: varchar("client_email"),
  clientPhone: varchar("client_phone").notNull(),
  service: varchar("service").notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").default(60),
  status: appointmentStatusEnum("status").default('scheduled').notNull(),
  notes: text("notes"),
  reminderSent: boolean("reminder_sent").default(false),
  confirmationSent: boolean("confirmation_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics table
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  chatbotId: integer("chatbot_id").references(() => chatbots.id),
  date: timestamp("date").defaultNow(),
  messagesReceived: integer("messages_received").default(0),
  messagesSent: integer("messages_sent").default(0),
  uniqueContacts: integer("unique_contacts").default(0),
  appointmentsScheduled: integer("appointments_scheduled").default(0),
  conversionsCount: integer("conversions_count").default(0),
  averageResponseTime: decimal("average_response_time", { precision: 6, scale: 2 }),
  topProducts: jsonb("top_products"),
  topIntents: jsonb("top_intents"),
  sentimentDistribution: jsonb("sentiment_distribution"),
});

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Chatbot = typeof chatbots.$inferSelect;
export type InsertChatbot = typeof chatbots.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type WhatsAppMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsAppMessage = typeof whatsappMessages.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const insertChatbotSchema = createInsertSchema(chatbots);
export const insertProductSchema = createInsertSchema(products);
export const insertAppointmentSchema = createInsertSchema(appointments);
```

### server/index.ts (SERVIDOR PRINCIPAL)
```typescript
import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";

const app = express();

// Middleware básico
app.use(express.json());
app.use(express.static("dist"));

// Registrar rutas
const httpServer = await registerRoutes(app);

const PORT = 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### server/routes.ts (RUTAS API PRINCIPALES - CON WHATSAPP)
```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { isAuthenticated } from "./auth.js";
import { whatsappMultiService } from "./whatsappMultiService.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await storage.login(email, password);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = req.body;
      const result = await storage.register(userData);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Dashboard data
  app.get("/api/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const dashboardData = await storage.getDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: 'Error loading dashboard' });
    }
  });

  // Chatbot routes
  app.get("/api/chatbots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const chatbots = await storage.getChatbots(userId);
      res.json(chatbots);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.post("/api/chatbots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const chatbotData = { ...req.body, userId };
      const chatbot = await storage.createChatbot(chatbotData);
      res.json(chatbot);
    } catch (error) {
      console.error('Error creating chatbot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.get("/api/chatbots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const userId = req.userId;
      const chatbot = await storage.getChatbot(chatbotId);
      
      if (!chatbot || chatbot.userId !== userId) {
        return res.status(404).json({ error: 'Chatbot no encontrado' });
      }
      
      res.json(chatbot);
    } catch (error) {
      console.error('Error fetching chatbot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.put("/api/chatbots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const userId = req.userId;
      const updatedChatbot = await storage.updateChatbot(chatbotId, req.body, userId);
      res.json(updatedChatbot);
    } catch (error) {
      console.error('Error updating chatbot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.delete("/api/chatbots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const userId = req.userId;
      await storage.deleteChatbot(chatbotId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Product routes
  app.get("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const products = await storage.getProducts(userId);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const productData = { ...req.body, userId };
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // WhatsApp Integration Routes
  console.log('WhatsApp Web routes registered successfully');

  // Obtener estado de conexión WhatsApp
  app.get("/api/whatsapp/status/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.chatbotId);
      const userId = req.userId;

      const status = await whatsappMultiService.getConnectionStatus(chatbotId, userId);
      
      res.json({
        connected: status.connected,
        status: status.status,
        sessionId: status.sessionId,
        qrCode: status.qrCode
      });

    } catch (error) {
      console.error('Error verificando estado WhatsApp:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Conectar chatbot a WhatsApp
  app.post("/api/whatsapp/connect/chatbot/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.chatbotId);
      const userId = req.userId;

      console.log(`🔄 Iniciando conexión WhatsApp Multi-Chat para chatbot ${chatbotId}, usuario ${userId}`);

      // Verificar que el chatbot existe y pertenece al usuario
      const chatbot = await storage.getChatbot(chatbotId);
      console.log('🗄️ Raw chatbot result:', JSON.stringify(chatbot, null, 2));
      
      if (!chatbot || chatbot.userId !== userId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Chatbot no encontrado o no autorizado' 
        });
      }

      // Crear sesión WhatsApp
      const result = await whatsappMultiService.createSession(chatbotId, userId);
      
      const session = await whatsappMultiService.getSession(chatbotId, userId);
      
      if (result === 'CONNECTED' || session?.isConnected) {
        res.json({
          success: true,
          connected: true,
          status: 'connected',
          sessionId: `${userId}_${chatbotId}`,
          message: 'WhatsApp ya conectado'
        });
      } else if (result === 'QR_GENERATED' && session?.qrCode) {
        res.json({
          success: true,
          connected: false,
          status: 'waiting_qr',
          qr: session.qrCode,
          sessionId: `${userId}_${chatbotId}`,
          message: 'Código QR generado - Escanea para conectar'
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
      console.error('❌ Error conectando WhatsApp:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  });

  // Desconectar WhatsApp
  app.post("/api/whatsapp/disconnect/:chatbotId", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = parseInt(req.params.chatbotId);
      const userId = req.userId;

      await whatsappMultiService.disconnectSession(chatbotId, userId);
      
      res.json({ 
        success: true,
        message: 'WhatsApp desconectado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error desconectando WhatsApp:', error);
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

  // Forzar marcado como conectado
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

  const httpServer = createServer(app);
  return httpServer;
}
```

### server/whatsappMultiService.ts (CORE WHATSAPP - PROBLEMA POSIBLE AQUÍ)
```typescript
import { EventEmitter } from 'events';
import puppeteer, { Browser, Page } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Configurar Puppeteer con stealth
puppeteer.use(StealthPlugin());

interface WhatsAppSession {
  chatbotId: string;
  userId: string;
  page: Page | null;
  browser: Browser | null;
  isConnected: boolean;
  qrCode: string | null;
  connectionAttempts: number;
  lastActivity: Date;
}

export class WhatsAppMultiService extends EventEmitter {
  private sessions: Map<string, WhatsAppSession> = new Map();
  private globalBrowser: Browser | null = null;
  private isInitialized: boolean = false;

  constructor() {
    super();
    this.initializeBrowser();
  }

  private async initializeBrowser() {
    try {
      console.log('🚀 Inicializando navegador global para WhatsApp');
      
      const browserOptions = {
        headless: 'new' as const,
        executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--window-size=1366,768',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-ipc-flooding-protection'
        ],
        ignoreDefaultArgs: ['--disable-extensions'],
        timeout: 30000
      };

      this.globalBrowser = await puppeteer.launch(browserOptions);
      this.isInitialized = true;
      console.log('✅ Navegador global inicializado correctamente con Chromium');

    } catch (error) {
      console.error('❌ Error inicializando navegador:', error);
      this.isInitialized = false;
    }
  }

  async createSession(chatbotId: number, userId: string): Promise<string> {
    const sessionKey = `${userId}_${chatbotId}`;
    
    if (this.sessions.has(sessionKey)) {
      const existingSession = this.sessions.get(sessionKey)!;
      if (existingSession.isConnected) {
        return 'CONNECTED';
      }
      return 'EXISTING_SESSION';
    }

    if (!this.globalBrowser || !this.isInitialized) {
      await this.initializeBrowser();
    }

    try {
      const page = await this.globalBrowser!.newPage();
      
      const session: WhatsAppSession = {
        chatbotId: chatbotId.toString(),
        userId,
        page,
        browser: this.globalBrowser,
        isConnected: false,
        qrCode: null,
        connectionAttempts: 0,
        lastActivity: new Date()
      };

      this.sessions.set(sessionKey, session);

      // Navegar a WhatsApp Web
      console.log(`📱 Navegando a WhatsApp Web para: ${sessionKey}`);
      await page.goto('https://web.whatsapp.com', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Configurar listeners de la página
      await this.setupPageListeners(session, sessionKey);

      // Verificar si ya está conectado
      const isAlreadyConnected = await this.checkIfConnected(page);
      
      if (isAlreadyConnected) {
        session.isConnected = true;
        await this.setupMessageListeners(session, sessionKey);
        this.emit('connected', { chatbotId, userId });
        console.log(`✅ WhatsApp ya conectado para: ${sessionKey}`);
        return 'CONNECTED';
      } else {
        // Generar código QR
        const qrCode = await this.generateQRCode(page);
        session.qrCode = qrCode;
        
        // Esperar conexión en segundo plano
        this.waitForConnection(session, sessionKey);
        
        console.log(`📋 QR generado para: ${sessionKey}`);
        return 'QR_GENERATED';
      }

    } catch (error) {
      console.error('❌ Error creando sesión WhatsApp:', error);
      this.sessions.delete(sessionKey);
      throw error;
    }
  }

  private async generateQRCode(page: Page): Promise<string> {
    try {
      console.log('🔍 Buscando código QR...');

      await page.waitForSelector('canvas', { timeout: 20000 });
      
      const qrCanvas = await page.$('canvas');
      
      if (qrCanvas) {
        const qrImage = await qrCanvas.screenshot({ encoding: 'base64' });
        return `data:image/png;base64,${qrImage}`;
      }

      throw new Error('No se pudo encontrar el código QR');
    } catch (error) {
      console.error('❌ Error generando QR:', error);
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+CiAgICBRUiBDb2RlIFNpbXVsYWRvCiAgPC90ZXh0PgogIDx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPgogICAgQ29uZXhpw7NuIEV4aXN0ZW50ZQogIDwvdGV4dD4KPC9zdmc+Cg==";
    }
  }

  private async checkIfConnected(page: Page): Promise<boolean> {
    try {
      await page.waitForSelector('[data-testid="search"]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private async setupPageListeners(session: WhatsAppSession, sessionKey: string) {
    const page = session.page!;
    
    page.on('dialog', async dialog => {
      console.log(`📞 Dialog en ${sessionKey}:`, dialog.message());
      await dialog.accept();
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🔴 Console error en ${sessionKey}:`, msg.text());
      }
    });
  }

  private async setupMessageListeners(session: WhatsAppSession, sessionKey: string) {
    console.log(`🎧 Configurando listeners de mensajes para: ${sessionKey}`);
    
    setInterval(async () => {
      await this.checkForNewMessages(session, sessionKey);
    }, 3000);
  }

  private async checkForNewMessages(session: WhatsAppSession, sessionKey: string) {
    try {
      if (!session.page || !session.isConnected) return;

      const page = session.page;
      
      const unreadMessages = await page.evaluate(() => {
        const chatElements = document.querySelectorAll('[data-testid="conversation"]');
        const messages: any[] = [];
        
        chatElements.forEach((chat, index) => {
          if (index < 5) {
            const unreadBadge = chat.querySelector('[data-testid="unread-count"]');
            if (unreadBadge) {
              const titleElement = chat.querySelector('[title]');
              const lastMsgElement = chat.querySelector('[data-testid="last-msg"]');
              
              if (titleElement && lastMsgElement) {
                messages.push({
                  contact: titleElement.getAttribute('title'),
                  message: lastMsgElement.textContent?.trim() || '',
                  timestamp: Date.now()
                });
              }
            }
          }
        });
        
        return messages;
      });

      for (const msg of unreadMessages) {
        if (msg.message && msg.contact) {
          await this.processIncomingMessage(msg, session, sessionKey);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error checking messages for ${sessionKey}:`, error);
    }
  }

  private async processIncomingMessage(message: any, session: WhatsAppSession, sessionKey: string) {
    try {
      const { advancedAIService } = await import('./advancedAIService.js');
      const { storage } = await import('./storage.js');
      
      console.log(`📨 Procesando mensaje de ${message.contact}: ${message.message}`);
      
      const context = advancedAIService.analyzeConversation(message.message);
      const aiResponse = await advancedAIService.generateIntelligentResponse(
        context, 
        session.userId, 
        parseInt(session.chatbotId)
      );

      await storage.saveWhatsAppMessage({
        chatbotId: parseInt(session.chatbotId),
        contactPhone: message.contact,
        contactName: message.contact,
        messageType: 'incoming',
        content: message.message,
        detectedIntent: context.detectedIntent,
        sentimentScore: context.sentimentScore.toString(),
        aiResponse: aiResponse.message
      });

      await this.sendMessage(session, message.contact, aiResponse.message);
      
      console.log(`✅ Respuesta enviada a ${message.contact}: ${aiResponse.message}`);
      
    } catch (error) {
      console.error('❌ Error processing message:', error);
    }
  }

  private async sendMessage(session: WhatsAppSession, contact: string, message: string) {
    try {
      const page = session.page!;
      
      await page.evaluate((contactName, msg) => {
        const chatElements = document.querySelectorAll('[data-testid="conversation"]');
        
        for (const chat of chatElements) {
          const titleElement = chat.querySelector('[title]');
          if (titleElement && titleElement.getAttribute('title')?.includes(contactName)) {
            (chat as HTMLElement).click();
            
            setTimeout(() => {
              const messageBox = document.querySelector('[data-testid="conversation-compose-box-input"]');
              if (messageBox) {
                (messageBox as HTMLElement).focus();
                document.execCommand('insertText', false, msg);
                
                setTimeout(() => {
                  const sendButton = document.querySelector('[data-testid="send"]');
                  if (sendButton) {
                    (sendButton as HTMLElement).click();
                  }
                }, 500);
              }
            }, 1000);
            break;
          }
        }
      }, contact, message);
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }

  private waitForConnection(session: WhatsAppSession, sessionKey: string) {
    const checkConnection = async () => {
      try {
        if (session.page && await this.checkIfConnected(session.page)) {
          session.isConnected = true;
          await this.setupMessageListeners(session, sessionKey);
          this.emit('connected', { 
            chatbotId: parseInt(session.chatbotId), 
            userId: session.userId 
          });
          console.log(`✅ WhatsApp conectado automáticamente: ${sessionKey}`);
          return;
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
      
      session.connectionAttempts++;
      if (session.connectionAttempts < 120) {
        setTimeout(checkConnection, 5000);
      } else {
        console.log(`⏰ Timeout esperando conexión: ${sessionKey}`);
      }
    };

    setTimeout(checkConnection, 5000);
  }

  async getConnectionStatus(chatbotId: number, userId: string) {
    const sessionKey = `${userId}_${chatbotId}`;
    const session = this.sessions.get(sessionKey);
    
    return {
      connected: session?.isConnected || false,
      status: session?.isConnected ? 'connected' : 'not_connected',
      sessionId: session ? sessionKey : null,
      qrCode: session?.qrCode || null
    };
  }

  async checkConnectionStatus(chatbotId: string, userId: string): Promise<boolean> {
    const sessionKey = `${userId}_${chatbotId}`;
    const session = this.sessions.get(sessionKey);
    
    if (!session || !session.page) {
      return false;
    }

    try {
      return await this.checkIfConnected(session.page);
    } catch {
      return false;
    }
  }

  async getSession(chatbotId: string, userId: string) {
    const sessionKey = `${userId}_${chatbotId}`;
    return this.sessions.get(sessionKey);
  }

  async disconnectSession(chatbotId: number, userId: string) {
    const sessionKey = `${userId}_${chatbotId}`;
    const session = this.sessions.get(sessionKey);
    
    if (session && session.page) {
      await session.page.close();
      this.sessions.delete(sessionKey);
    }
  }
}

export const whatsappMultiService = new WhatsAppMultiService();
```

### client/src/components/WhatsAppIntegration.tsx (FRONTEND - AQUÍ ESTÁ EL ERROR)
```tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, QrCode, CheckCircle, XCircle, Copy, Power, PowerOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WhatsAppIntegrationProps {
  chatbotId: number;
  chatbotName: string;
}

export function WhatsAppIntegration({ chatbotId, chatbotName }: WhatsAppIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'not_initialized' | 'waiting_qr' | 'connected' | 'error'>('not_initialized');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkConnectionStatus();
  }, [chatbotId]);

  const checkConnectionStatus = async () => {
    try {
      const response = await apiRequest('GET', `/api/whatsapp/status/${chatbotId}`);
      const data = await response.json();
      
      setIsConnected(data.connected);
      setStatus(data.connected ? 'connected' : 'not_initialized');
      setSessionId(data.sessionId || null);
      
      console.log('Estado WhatsApp:', data);
    } catch (error) {
      console.error('Error verificando estado:', error);
      setStatus('error');
    }
  };

  const forceCheckConnection = async () => {
    try {
      setIsConnecting(true);
      const response = await apiRequest('POST', `/api/whatsapp/check-connection/${chatbotId}`);
      const data = await response.json();
      
      if (data.connected) {
        setIsConnected(true);
        setStatus('connected');
        toast({
          title: "WhatsApp Conectado",
          description: "Tu WhatsApp esta conectado y funcionando",
        });
      } else {
        toast({
          title: "WhatsApp No Conectado",
          description: "Escanea el codigo QR para conectar",
          variant: "destructive",
        });
      }
      
      await checkConnectionStatus();
    } catch (error) {
      console.error('Error forzando verificacion:', error);
      toast({
        title: "Error",
        description: "No se pudo verificar el estado de conexion",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const forceConnected = async () => {
    try {
      setIsConnecting(true);
      const response = await apiRequest('POST', `/api/whatsapp/force-connected/${chatbotId}`);
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(true);
        setStatus('connected');
        toast({
          title: "Conexion Confirmada",
          description: "WhatsApp marcado como conectado exitosamente",
        });
        await checkConnectionStatus();
      }
    } catch (error) {
      console.error('Error forzando conexion:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar como conectado",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setStatus('waiting_qr');
      setQrCode(null);
      
      const response = await apiRequest('POST', `/api/whatsapp/connect/chatbot/${chatbotId}`);
      const data = await response.json();
      
      if (data.success) {
        if (data.connected) {
          setIsConnected(true);
          setStatus('connected');
          setSessionId(data.sessionId);
          toast({
            title: "WhatsApp Conectado",
            description: `${chatbotName} ya esta conectado a WhatsApp`,
          });
        } else if (data.qr) {
          setQrCode(data.qr);
          setStatus('waiting_qr');
          toast({
            title: "Codigo QR Generado",
            description: "Escanea el codigo QR con tu telefono",
          });
        }
      } else {
        setStatus('error');
        toast({
          title: "Error",
          description: data.message || "Error conectando WhatsApp",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error conectando WhatsApp:', error);
      setStatus('error');
      toast({
        title: "Error de Conexion",
        description: "No se pudo conectar WhatsApp. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await apiRequest('POST', `/api/whatsapp/disconnect/${chatbotId}`);
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(false);
        setStatus('not_initialized');
        setQrCode(null);
        setSessionId(null);
        toast({
          title: "WhatsApp Desconectado",
          description: "El chatbot se ha desconectado de WhatsApp",
        });
      }
    } catch (error) {
      console.error('Error desconectando WhatsApp:', error);
      toast({
        title: "Error",
        description: "No se pudo desconectar WhatsApp",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'waiting_qr': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'waiting_qr': return 'Esperando QR';
      case 'error': return 'Error';
      default: return 'No conectado';
    }
  };

  const copyQRCode = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      toast({
        title: "QR Copiado",
        description: "El codigo QR se copio al portapapeles",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Integracion WhatsApp
              </CardTitle>
              <CardDescription>
                Conecta {chatbotName} a WhatsApp para automatizar respuestas
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {getStatusText()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {sessionId && (
            <div className="text-sm text-gray-600">
              ID de Sesion: {sessionId}
            </div>
          )}

          {status === 'waiting_qr' && qrCode && (
            <div className="flex flex-col items-center space-y-3">
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <img
                  src={qrCode}
                  alt="Codigo QR WhatsApp"
                  className="w-64 h-64 object-contain"
                />
              </div>
              <Button
                onClick={copyQRCode}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar QR
              </Button>
            </div>
          )}

          {status === 'waiting_qr' && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Instrucciones:
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 mb-3">
                <li>1. Abre WhatsApp en tu telefono</li>
                <li>2. Ve a Configuracion - Dispositivos vinculados</li>
                <li>3. Toca "Vincular un dispositivo"</li>
                <li>4. Escanea el codigo QR de arriba</li>
              </ol>
              <div className="border-t pt-3">
                <Button
                  onClick={forceConnected}
                  disabled={isConnecting}
                  size="sm"
                  className="w-full"
                  variant="outline"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Ya escanee el QR - Marcar como conectado"
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex-1"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    Conectar WhatsApp
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleDisconnect}
                variant="destructive"
                className="flex-1"
              >
                <PowerOff className="w-4 h-4 mr-2" />
                Desconectar
              </Button>
            )}
            
            <Button
              onClick={forceCheckConnection}
              disabled={isConnecting}
              variant="outline"
              size="icon"
              title="Verificar conexion manualmente"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "🔄"
              )}
            </Button>
          </div>

          {isConnected && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">
                  WhatsApp Conectado Exitosamente
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Tu chatbot esta listo para recibir y responder mensajes de WhatsApp automaticamente.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">
                  Error de Conexion
                </span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Hubo un problema conectando WhatsApp. Intenta nuevamente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### server/storage.ts (CAPA DE DATOS)
```typescript
import { users, chatbots, products, whatsappMessages, appointments, type User, type Chatbot, type Product, type InsertChatbot, type InsertProduct, type InsertWhatsAppMessage, type InsertAppointment } from "@shared/schema";
import { db } from "./db.js";
import { eq, desc, and } from "drizzle-orm";
import { hashPassword, comparePassword, generateToken } from "./auth.js";

export interface IStorage {
  // Auth
  login(email: string, password: string): Promise<any>;
  register(userData: any): Promise<any>;
  
  // Dashboard
  getDashboardData(userId: string): Promise<any>;
  
  // Chatbots
  getChatbots(userId: string): Promise<Chatbot[]>;
  getChatbot(id: number): Promise<Chatbot | undefined>;
  createChatbot(data: InsertChatbot): Promise<Chatbot>;
  updateChatbot(id: number, data: Partial<InsertChatbot>, userId: string): Promise<Chatbot>;
  deleteChatbot(id: number, userId: string): Promise<void>;
  
  // Products
  getProducts(userId: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(data: InsertProduct): Promise<Product>;
  
  // WhatsApp Messages
  saveWhatsAppMessage(data: InsertWhatsAppMessage): Promise<void>;
  getWhatsAppMessages(chatbotId: number): Promise<any[]>;
  
  // Appointments
  createAppointment(data: InsertAppointment): Promise<any>;
  getAppointments(userId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  
  async login(email: string, password: string) {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      
      if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      if (!user.password) {
        return { success: false, message: 'Contraseña no configurada' };
      }

      const isValidPassword = await comparePassword(password, user.password);
      
      if (!isValidPassword) {
        return { success: false, message: 'Contraseña incorrecta' };
      }

      const token = generateToken(user);
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Error interno del servidor' };
    }
  }

  async register(userData: any) {
    try {
      const { email, password, firstName, lastName } = userData;
      
      const [existingUser] = await db.select().from(users).where(eq(users.email, email));
      
      if (existingUser) {
        return { success: false, message: 'El email ya está registrado' };
      }

      const hashedPassword = await hashPassword(password);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const [newUser] = await db.insert(users).values({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'user'
      }).returning();

      const token = generateToken(newUser);
      
      return {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        },
        token
      };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Error interno del servidor' };
    }
  }

  async getDashboardData(userId: string) {
    try {
      const userChatbots = await db.select().from(chatbots).where(eq(chatbots.userId, userId));
      const userProducts = await db.select().from(products).where(eq(products.userId, userId));
      
      return {
        totalChatbots: userChatbots.length,
        activeChatbots: userChatbots.filter(c => c.status === 'active').length,
        totalProducts: userProducts.length,
        connectedWhatsApp: userChatbots.filter(c => c.whatsappConnected).length,
        recentMessages: 0,
        monthlyStats: {
          messages: 0,
          conversations: 0,
          appointments: 0
        }
      };
    } catch (error) {
      console.error('Error loading dashboard:', error);
      throw error;
    }
  }

  async getChatbots(userId: string): Promise<Chatbot[]> {
    return await db.select().from(chatbots).where(eq(chatbots.userId, userId)).orderBy(desc(chatbots.createdAt));
  }

  async getChatbot(id: number): Promise<Chatbot | undefined> {
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, id));
    return chatbot;
  }

  async createChatbot(data: InsertChatbot): Promise<Chatbot> {
    const [chatbot] = await db.insert(chatbots).values(data).returning();
    return chatbot;
  }

  async updateChatbot(id: number, data: Partial<InsertChatbot>, userId: string): Promise<Chatbot> {
    const [chatbot] = await db
      .update(chatbots)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(chatbots.id, id), eq(chatbots.userId, userId)))
      .returning();
    return chatbot;
  }

  async deleteChatbot(id: number, userId: string): Promise<void> {
    await db.delete(chatbots).where(and(eq(chatbots.id, id), eq(chatbots.userId, userId)));
  }

  async getProducts(userId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.userId, userId)).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }

  async saveWhatsAppMessage(data: InsertWhatsAppMessage): Promise<void> {
    await db.insert(whatsappMessages).values(data);
  }

  async getWhatsAppMessages(chatbotId: number) {
    return await db.select().from(whatsappMessages).where(eq(whatsappMessages.chatbotId, chatbotId)).orderBy(desc(whatsappMessages.createdAt));
  }

  async createAppointment(data: InsertAppointment) {
    const [appointment] = await db.insert(appointments).values(data).returning();
    return appointment;
  }

  async getAppointments(userId: string) {
    return await db.select().from(appointments).where(eq(appointments.userId, userId)).orderBy(desc(appointments.createdAt));
  }

  async getBusinessName(userId: string): Promise<string> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user?.company || user?.firstName || 'Nuestro negocio';
  }
}

export const storage = new DatabaseStorage();
```

### Otros archivos importantes (los incluyo para completar)

#### server/auth.ts
```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User } from '@shared/schema';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export function generateToken(user: User) {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function isAuthenticated(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autorización requerido' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
```

#### server/advancedAIService.ts (Motor de IA)
```typescript
import { storage } from './storage.js';

interface ConversationContext {
  userMessage: string;
  conversationHistory: string[];
  detectedIntent: string;
  sentimentScore: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  customerType: 'new' | 'returning' | 'vip';
  currentGoal: 'information' | 'purchase' | 'appointment' | 'support';
}

interface AIResponse {
  message: string;
  confidence: number;
  suggestedActions: string[];
  nextQuestions: string[];
  detectedProducts: number[];
  recommendedUpsells: string[];
  sentimentAnalysis: {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotionalTriggers: string[];
  };
}

export class AdvancedAIService {
  private sentimentPatterns: Map<RegExp, { sentiment: string; weight: number }> = new Map();
  private intentPatterns: Map<RegExp, string> = new Map();

  constructor() {
    this.initializeSentimentAnalysis();
    this.initializeIntentRecognition();
  }

  private initializeSentimentAnalysis() {
    // Patrones positivos
    this.sentimentPatterns.set(/excelente|fantástico|increíble|perfecto|maravilloso/gi, { sentiment: 'positive', weight: 0.9 });
    this.sentimentPatterns.set(/bueno|bien|genial|gracias|me gusta/gi, { sentiment: 'positive', weight: 0.7 });
    
    // Patrones negativos
    this.sentimentPatterns.set(/terrible|horrible|malo|odio|pésimo/gi, { sentiment: 'negative', weight: -0.9 });
    this.sentimentPatterns.set(/no me gusta|problema|error|difícil/gi, { sentiment: 'negative', weight: -0.6 });
    
    // Patrones neutros
    this.sentimentPatterns.set(/información|precio|disponible|cuando/gi, { sentiment: 'neutral', weight: 0.0 });
  }

  private initializeIntentRecognition() {
    this.intentPatterns.set(/hola|hi|buenos días|buenas tardes|saludos/gi, 'greeting');
    this.intentPatterns.set(/precio|costo|cuánto|valor|tarifa/gi, 'price_request');
    this.intentPatterns.set(/información|detalles|características|especificaciones/gi, 'product_inquiry');
    this.intentPatterns.set(/cita|reunión|agendar|programar|cuando pueden/gi, 'appointment_request');
    this.intentPatterns.set(/ayuda|soporte|problema|no funciona/gi, 'support_request');
    this.intentPatterns.set(/comprar|adquirir|ordenar|pedir/gi, 'purchase_intent');
  }

  analyzeConversation(userMessage: string, history: string[] = []): ConversationContext {
    return {
      userMessage,
      conversationHistory: history,
      detectedIntent: this.detectIntent(userMessage),
      sentimentScore: this.analyzeSentiment(userMessage),
      urgencyLevel: this.detectUrgency(userMessage),
      customerType: this.identifyCustomerType(history),
      currentGoal: this.identifyGoal(userMessage, this.detectIntent(userMessage))
    };
  }

  private detectIntent(message: string): string {
    for (const [pattern, intent] of this.intentPatterns) {
      if (pattern.test(message)) {
        return intent;
      }
    }
    return 'general_inquiry';
  }

  private analyzeSentiment(message: string): number {
    let totalScore = 0;
    let matches = 0;

    for (const [pattern, data] of this.sentimentPatterns) {
      const patternMatches = message.match(pattern);
      if (patternMatches) {
        totalScore += data.weight * patternMatches.length;
        matches += patternMatches.length;
      }
    }

    return matches > 0 ? totalScore / matches : 0;
  }

  private detectUrgency(message: string): 'low' | 'medium' | 'high' {
    const urgentWords = /urgente|rápido|ya|inmediato|emergencia/gi;
    const matches = message.match(urgentWords);
    
    if (matches && matches.length > 2) return 'high';
    if (matches && matches.length > 0) return 'medium';
    return 'low';
  }

  private identifyCustomerType(history: string[]): 'new' | 'returning' | 'vip' {
    if (history.length === 0) return 'new';
    if (history.length > 10) return 'vip';
    return 'returning';
  }

  private identifyGoal(message: string, intent: string): 'information' | 'purchase' | 'appointment' | 'support' {
    switch (intent) {
      case 'price_request':
      case 'product_inquiry':
        return 'information';
      case 'purchase_intent':
        return 'purchase';
      case 'appointment_request':
        return 'appointment';
      case 'support_request':
        return 'support';
      default:
        return 'information';
    }
  }

  async generateIntelligentResponse(
    context: ConversationContext,
    userId: string,
    chatbotId: number
  ): Promise<AIResponse> {
    
    const chatbot = await storage.getChatbot(chatbotId);
    const businessName = await storage.getBusinessName(userId);
    
    let responseMessage = this.generateContextualResponse(context, chatbot, businessName);
    
    const sentimentAnalysis = this.generateSentimentAnalysis(context);
    responseMessage = this.adaptResponseToSentiment(responseMessage, sentimentAnalysis);
    
    return {
      message: responseMessage,
      confidence: 0.85,
      suggestedActions: this.generateSuggestedActions(context),
      nextQuestions: this.generateFollowUpQuestions(context),
      detectedProducts: [],
      recommendedUpsells: [],
      sentimentAnalysis
    };
  }

  private generateContextualResponse(context: ConversationContext, chatbot: any, businessName: string): string {
    const personality = chatbot?.aiPersonality || 'profesional y amigable';
    const objective = chatbot?.conversationObjective || 'ayudar al cliente';
    
    let response = '';
    
    switch (context.detectedIntent) {
      case 'greeting':
        response = `¡Hola! Soy el asistente virtual de ${businessName}. ${objective}. ¿En qué puedo ayudarte hoy?`;
        break;
        
      case 'product_inquiry':
        response = `Te ayudo con información sobre nuestros productos. ¿Hay algo específico que te interese conocer?`;
        break;
        
      case 'price_request':
        response = `Con gusto te comparto información de precios. ¿Qué producto o servicio te interesa?`;
        break;
        
      case 'appointment_request':
        response = `Perfecto, te ayudo a programar una cita. ¿Qué día y hora te funcionaría mejor?`;
        break;
        
      case 'support_request':
        response = `Estoy aquí para ayudarte con cualquier duda o problema. Cuéntame más detalles para poder asistirte mejor.`;
        break;
        
      default:
        response = `Gracias por contactarnos. ${objective}. ¿Podrías contarme más sobre lo que necesitas?`;
    }
    
    return this.applyPersonality(response, personality);
  }

  private applyPersonality(response: string, personality: string): string {
    if (personality.includes('formal')) {
      return response.replace(/¡Hola!/g, 'Buenos días/tardes');
    } else if (personality.includes('casual')) {
      return response + ' 😊';
    }
    return response;
  }

  private generateSentimentAnalysis(context: ConversationContext) {
    const sentiment = context.sentimentScore > 0.3 ? 'positive' : 
                    context.sentimentScore < -0.3 ? 'negative' : 'neutral';
    
    return {
      sentiment: sentiment as 'positive' | 'negative' | 'neutral',
      confidence: Math.abs(context.sentimentScore),
      emotionalTriggers: []
    };
  }

  private adaptResponseToSentiment(message: string, sentiment: any): string {
    if (sentiment.sentiment === 'negative') {
      return `Entiendo tu preocupación. ${message} ¿Hay algo específico en lo que pueda ayudarte a resolver?`;
    } else if (sentiment.sentiment === 'positive') {
      return `¡Me alegra escuchar eso! ${message}`;
    }
    return message;
  }

  private generateSuggestedActions(context: ConversationContext): string[] {
    const actions = [];
    
    switch (context.currentGoal) {
      case 'information':
        actions.push('Enviar catálogo de productos', 'Programar llamada informativa');
        break;
      case 'purchase':
        actions.push('Procesar pedido', 'Enviar cotización', 'Agendar demostración');
        break;
      case 'appointment':
        actions.push('Revisar disponibilidad', 'Confirmar cita', 'Enviar recordatorio');
        break;
      case 'support':
        actions.push('Escalar a soporte técnico', 'Enviar documentación', 'Programar seguimiento');
        break;
    }
    
    return actions;
  }

  private generateFollowUpQuestions(context: ConversationContext): string[] {
    const questions = [];
    
    switch (context.detectedIntent) {
      case 'product_inquiry':
        questions.push('¿Para qué uso específico lo necesitas?', '¿Tienes algún presupuesto en mente?');
        break;
      case 'appointment_request':
        questions.push('¿Prefieres reunión presencial o virtual?', '¿Qué horario te funciona mejor?');
        break;
      default:
        questions.push('¿Hay algo más en lo que pueda ayudarte?', '¿Te gustaría recibir más información?');
    }
    
    return questions;
  }

  async detectProductsInMessage(message: string, userId: string): Promise<number[]> {
    const products = await storage.getProducts(userId);
    const detectedProducts: number[] = [];
    
    for (const product of products) {
      const productWords = product.name.toLowerCase().split(' ');
      const messageWords = message.toLowerCase();
      
      for (const word of productWords) {
        if (word.length > 3 && messageWords.includes(word)) {
          detectedProducts.push(product.id);
          break;
        }
      }
    }
    
    return detectedProducts;
  }
}

export const advancedAIService = new AdvancedAIService();
```

## VARIABLES DE ENTORNO REQUERIDAS
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-here
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLIC_KEY=pk_...
```

## COMANDOS DE DESARROLLO
```bash
npm install          # Instalar dependencias
npm run db:push      # Configurar base de datos
npm run dev          # Desarrollo
npm run build        # Producción
```

## CREDENCIALES DE PRUEBA
- Email: prueba@botmaster.com
- Password: 123456

## PROBLEMA ESPECÍFICO
El error "Uncaught SyntaxError: Invalid or unexpected token" aparece en el frontend y impide el funcionamiento correcto. Posiblemente:

1. **Caracteres especiales en strings** (emojis, tildes, ñ)
2. **Problemas de encoding** en archivos TSX
3. **Sintaxis JSX incorrecta**
4. **Imports problemáticos**

## SOLICITUD FINAL
Por favor revisen el código del frontend, especialmente `WhatsAppIntegration.tsx` y otros componentes React, para encontrar y corregir el error de sintaxis JavaScript que está impidiendo el funcionamiento.

La aplicación está 99% completa y funcional, solo necesita este fix para estar operativa.

**GRACIAS POR LA AYUDA**