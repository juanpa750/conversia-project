import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Sistema unificado de WhatsApp - Arquitectura simplificada

// Conexión principal de WhatsApp por usuario
export const whatsappConnection = pgTable("whatsapp_connection", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  
  // Información del negocio
  businessName: varchar("business_name").notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  businessType: varchar("business_type").notNull(), // 'products' o 'services'
  businessDescription: text("business_description"),
  
  // Estado de conexión
  status: varchar("status").default("disconnected").notNull(),
  qrCode: text("qr_code"),
  isConnected: boolean("is_connected").default(false),
  
  // Configuración básica
  aiEnabled: boolean("ai_enabled").default(true),
  autoRespond: boolean("auto_respond").default(true),
  welcomeMessage: text("welcome_message"),
  
  // Para productos (caso 1)
  allowMultipleProducts: boolean("allow_multiple_products").default(false),
  adminPhoneNumber: varchar("admin_phone_number"), // WhatsApp administrativo para reportes
  
  // Para servicios/citas (caso 2)
  enableAppointments: boolean("enable_appointments").default(false),
  
  // Horarios
  operatingHours: jsonb("operating_hours"),
  
  // Estadísticas
  connectedAt: timestamp("connected_at"),
  lastMessageAt: timestamp("last_message_at"),
  messagesSent: integer("messages_sent").default(0),
  messagesReceived: integer("messages_received").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Productos del negocio (para caso 1)
export const businessProducts = pgTable("business_products", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  
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
  userId: varchar("user_id").notNull(),
  
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

// Citas agendadas
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  serviceId: integer("service_id").notNull(),
  
  // Cliente
  clientName: varchar("client_name").notNull(),
  clientPhone: varchar("client_phone").notNull(),
  clientEmail: varchar("client_email"),
  
  // Cita
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").notNull(),
  status: varchar("status").default('scheduled'), // scheduled, confirmed, cancelled, completed, no_show
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
  userId: varchar("user_id").notNull(),
  
  messageId: varchar("message_id").notNull(),
  fromNumber: varchar("from_number").notNull(),
  toNumber: varchar("to_number").notNull(),
  messageText: text("message_text"),
  messageType: varchar("message_type").default('text'), // text, image, audio, etc
  
  isIncoming: boolean("is_incoming").default(true),
  wasAutoReplied: boolean("was_auto_replied").default(false),
  aiResponse: text("ai_response"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Esquemas de validación
export const insertWhatsappConnectionSchema = createInsertSchema(whatsappConnection);
export const insertBusinessProductSchema = createInsertSchema(businessProducts);
export const insertBusinessServiceSchema = createInsertSchema(businessServices);
export const insertAppointmentSchema = createInsertSchema(appointments);
export const insertWhatsappMessageSchema = createInsertSchema(whatsappMessages);

// Tipos
export type WhatsappConnection = typeof whatsappConnection.$inferSelect;
export type InsertWhatsappConnection = z.infer<typeof insertWhatsappConnectionSchema>;
export type BusinessProduct = typeof businessProducts.$inferSelect;
export type InsertBusinessProduct = z.infer<typeof insertBusinessProductSchema>;
export type BusinessService = typeof businessServices.$inferSelect;
export type InsertBusinessService = z.infer<typeof insertBusinessServiceSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = z.infer<typeof insertWhatsappMessageSchema>;