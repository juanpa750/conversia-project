import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, foreignKey, pgEnum, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'unpaid', 'trial']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show']);
export const chatbotStatusEnum = pgEnum('chatbot_status', ['draft', 'active', 'paused', 'archived']);
export const chatbotTypeEnum = pgEnum('chatbot_type', ['sales', 'support', 'appointment', 'general']);

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
  // WhatsApp Cloud API Integration - Master API Architecture
  phoneNumberId: text("phone_number_id"), // Meta Phone Number ID for this client
  businessAccountId: text("business_account_id"), // Meta Business Account ID
  monthlyFreeUsed: integer("monthly_free_used").default(0), // Messages used this month
  monthlyFreeLimit: integer("monthly_free_limit").default(1000), // 1000 free per client
  setupCode: text("setup_code"), // Unique code for client onboarding
  phoneVerified: boolean("phone_verified").default(false), // If completed verification
  lastResetDate: timestamp("last_reset_date"), // Last counter reset
  // Legacy fields (will be deprecated)
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
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: varchar("plan_id").notNull(),
  status: subscriptionStatusEnum("status").default('active'),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// WhatsApp Simple Connection - Sistema unificado según especificaciones
export const whatsappConnections = pgTable("whatsapp_connections", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Información del negocio
  businessName: varchar("business_name").notNull(),
  phoneNumber: varchar("phone_number"),
  businessType: varchar("business_type").notNull(), // 'products' o 'services'
  businessDescription: text("business_description"),
  
  // Estado de conexión WhatsApp Web
  status: varchar("status").default("disconnected").notNull(),
  qrCode: text("qr_code"),
  isConnected: boolean("is_connected").default(false),
  
  // Configuración de IA gratuita
  aiEnabled: boolean("ai_enabled").default(true),
  autoRespond: boolean("auto_respond").default(true),
  welcomeMessage: text("welcome_message"),
  
  // Para empresas de productos (caso 1)
  allowMultipleProducts: boolean("allow_multiple_products").default(false),
  adminPhoneNumber: varchar("admin_phone_number"), // WhatsApp administrativo
  
  // Para servicios/citas (caso 2)
  enableAppointments: boolean("enable_appointments").default(false),
  
  // Horarios de operación
  operatingHours: jsonb("operating_hours"),
  
  // Estadísticas básicas
  connectedAt: timestamp("connected_at"),
  lastMessageAt: timestamp("last_message_at"),
  messagesSent: integer("messages_sent").default(0),
  messagesReceived: integer("messages_received").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chatbots table
export const chatbots = pgTable("chatbots", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  description: text("description"),
  status: chatbotStatusEnum("status").default('draft'),
  type: chatbotTypeEnum("type").default('support'),
  flow: jsonb("flow"),
  triggerKeywords: text("trigger_keywords").array(),
  aiInstructions: text("ai_instructions"),
  aiPersonality: text("ai_personality"),
  objective: varchar("objective").default('sales'),
  conversationObjective: varchar("conversation_objective").default('sales'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// WhatsApp Integrations table - Per chatbot configuration
export const whatsappIntegrations = pgTable("whatsapp_integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  chatbotId: integer("chatbot_id").notNull().references(() => chatbots.id, { onDelete: 'cascade' }),
  productId: integer("product_id"),
  
  // WhatsApp configuration
  phoneNumber: varchar("phone_number").notNull(),
  displayName: varchar("display_name").notNull(),
  businessDescription: text("business_description"),
  
  // Integration settings
  status: varchar("status").default("disconnected").notNull(), // connected, disconnected, error
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1),
  autoRespond: boolean("auto_respond").default(true),
  operatingHours: jsonb("operating_hours"),
  
  // Statistics
  messagesSent: integer("messages_sent").default(0),
  messagesReceived: integer("messages_received").default(0),
  lastMessageAt: timestamp("last_message_at"),
  connectedAt: timestamp("connected_at"),
  lastError: text("last_error"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Productos del negocio (para caso 1)
export const businessProducts = pgTable("business_products", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default('COP'),
  images: jsonb("images"),
  
  // IA específica del producto
  chatbotResponses: jsonb("chatbot_responses"),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Servicios del negocio (para caso 2)
export const businessServices = pgTable("business_services", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  name: varchar("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // minutos
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default('COP'),
  
  // Disponibilidad
  availabilityHours: jsonb("availability_hours"),
  maxAdvanceBooking: integer("max_advance_booking").default(30),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Citas agendadas (para caso 2)
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  serviceId: integer("service_id").notNull().references(() => businessServices.id, { onDelete: 'cascade' }),
  
  // Información del cliente
  clientName: varchar("client_name").notNull(),
  clientPhone: varchar("client_phone").notNull(),
  clientEmail: varchar("client_email"),
  
  // Información de la cita
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").notNull(),
  status: appointmentStatusEnum("status").default('scheduled'),
  notes: text("notes"),
  
  // Recordatorios
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mensajes de WhatsApp
export const whatsappMessages = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  messageId: varchar("message_id").notNull(),
  fromNumber: varchar("from_number").notNull(),
  toNumber: varchar("to_number").notNull(),
  messageText: text("message_text"),
  messageType: varchar("message_type").default('text'),
  
  isIncoming: boolean("is_incoming").default(true),
  wasAutoReplied: boolean("was_auto_replied").default(false),
  aiResponse: text("ai_response"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Master API multi-client numbers table
export const whatsappNumbers = pgTable("whatsapp_numbers", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id").references(() => users.id),
  phoneNumber: text("phone_number"), // +57300123456
  phoneNumberId: text("phone_number_id"), // Meta Phone Number ID
  businessAccountId: text("business_account_id"), // Meta Business Account ID
  displayName: text("display_name"), // Business name
  verificationStatus: text("verification_status").default("pending"), // pending, verified, rejected
  webhookConfigured: boolean("webhook_configured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Esquemas de validación
export const insertWhatsappConnectionSchema = createInsertSchema(whatsappConnections);
export const insertWhatsappIntegrationSchema = createInsertSchema(whatsappIntegrations);
export const insertChatbotSchema = createInsertSchema(chatbots);
export const insertBusinessProductSchema = createInsertSchema(businessProducts);
export const insertBusinessServiceSchema = createInsertSchema(businessServices);
export const insertAppointmentSchema = createInsertSchema(appointments);
export const insertWhatsappMessageSchema = createInsertSchema(whatsappMessages);
export const insertWhatsappNumberSchema = createInsertSchema(whatsappNumbers);

// Tipos
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type WhatsappConnection = typeof whatsappConnections.$inferSelect;
export type InsertWhatsappConnection = z.infer<typeof insertWhatsappConnectionSchema>;
export type WhatsappIntegration = typeof whatsappIntegrations.$inferSelect;
export type InsertWhatsappIntegration = z.infer<typeof insertWhatsappIntegrationSchema>;
export type Chatbot = typeof chatbots.$inferSelect;
export type InsertChatbot = z.infer<typeof insertChatbotSchema>;
export type BusinessProduct = typeof businessProducts.$inferSelect;
export type InsertBusinessProduct = z.infer<typeof insertBusinessProductSchema>;
export type BusinessService = typeof businessServices.$inferSelect;
export type InsertBusinessService = z.infer<typeof insertBusinessServiceSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = z.infer<typeof insertWhatsappMessageSchema>;