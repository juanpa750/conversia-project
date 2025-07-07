# CONVERSIA - SECCIÓN 1: BACKEND Y BASE DE DATOS

## PROBLEMA ACTUAL
Error JavaScript: "The requested module '/src/components/WhatsAppIntegration.tsx' does not provide an export named 'default'"

## SOLICITUD
Revisar y corregir los errores de exportación en los componentes React. La aplicación está 99% completa.

---

## SECCIÓN 1: BACKEND COMPLETO

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
    "@neondatabase/serverless": "^0.10.4",
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
    "@stripe/react-stripe-js": "^3.7.0",
    "@stripe/stripe-js": "^7.3.0",
    "@tanstack/react-query": "^5.60.5",
    "bcryptjs": "^2.4.3",
    "drizzle-orm": "^0.39.1",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "puppeteer-extra": "^3.3.6",
    "puppeteer-extra-plugin-stealth": "^2.11.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "stripe": "^17.4.0",
    "tailwindcss": "^3.5.4",
    "typescript": "^5.7.3",
    "whatsapp-web.js": "^1.26.0",
    "wouter": "^3.4.1"
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
  phoneNumberId: text("phone_number_id"),
  businessAccountId: text("business_account_id"),
  monthlyFreeUsed: integer("monthly_free_used").default(0),
  monthlyFreeLimit: integer("monthly_free_limit").default(1000),
  setupCode: text("setup_code"),
  phoneVerified: boolean("phone_verified").default(false),
  lastResetDate: timestamp("last_reset_date"),
  whatsappAccessToken: text("whatsapp_access_token"),
  whatsappPhoneNumberId: varchar("whatsapp_phone_number_id"),
  whatsappBusinessAccountId: varchar("whatsapp_business_account_id"),
  whatsappVerifyToken: varchar("whatsapp_verify_token"),
  monthlyFreeMessagesUsed: integer("monthly_free_messages_used").default(0),
  freeMessagesResetDate: timestamp("free_messages_reset_date"),
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

### server/index.ts
```typescript
import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";

const app = express();

app.use(express.json());
app.use(express.static("dist"));

const httpServer = await registerRoutes(app);

const PORT = 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### server/auth.ts
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

### server/storage.ts
```typescript
import { users, chatbots, products, whatsappMessages, appointments, type User, type Chatbot, type Product, type InsertChatbot, type InsertProduct, type InsertWhatsAppMessage, type InsertAppointment } from "@shared/schema";
import { db } from "./db.js";
import { eq, desc, and } from "drizzle-orm";
import { hashPassword, comparePassword, generateToken } from "./auth.js";

export interface IStorage {
  login(email: string, password: string): Promise<any>;
  register(userData: any): Promise<any>;
  getDashboardData(userId: string): Promise<any>;
  getChatbots(userId: string): Promise<Chatbot[]>;
  getChatbot(id: number): Promise<Chatbot | undefined>;
  createChatbot(data: InsertChatbot): Promise<Chatbot>;
  updateChatbot(id: number, data: Partial<InsertChatbot>, userId: string): Promise<Chatbot>;
  deleteChatbot(id: number, userId: string): Promise<void>;
  getProducts(userId: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(data: InsertProduct): Promise<Product>;
  saveWhatsAppMessage(data: InsertWhatsAppMessage): Promise<void>;
  getWhatsAppMessages(chatbotId: number): Promise<any[]>;
  createAppointment(data: InsertAppointment): Promise<any>;
  getAppointments(userId: string): Promise<any[]>;
  getBusinessName(userId: string): Promise<string>;
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

## VARIABLES DE ENTORNO
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLIC_KEY=pk_...
```

## COMANDOS
```bash
npm install
npm run db:push
npm run dev
```

## CREDENCIALES DE PRUEBA
- Email: prueba@botmaster.com
- Password: 123456

---

**CONTINÚA CON SECCIÓN 2 PARA WHATSAPP Y SECCIÓN 3 PARA FRONTEND**