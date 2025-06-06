import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, foreignKey, pgEnum, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'unpaid', 'trial']);
export const chatbotStatusEnum = pgEnum('chatbot_status', ['active', 'inactive', 'draft']);
export const chatbotTypeEnum = pgEnum('chatbot_type', ['support', 'sales', 'information', 'other']);
export const contactStatusEnum = pgEnum('contact_status', ['active', 'inactive', 'new']);
export const contactSourceEnum = pgEnum('contact_source', ['whatsapp', 'web', 'manual']);
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'closed', 'pending']);

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
  phone: varchar("phone"),
  bio: text("bio"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
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

// Chatbots table
export const chatbots = pgTable("chatbots", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  description: text("description"),
  status: chatbotStatusEnum("status").default('draft'),
  type: chatbotTypeEnum("type").default('support'),
  flow: jsonb("flow"),
  productId: integer("product_id").references(() => products.id, { onDelete: 'set null' }),
  triggerKeywords: text("trigger_keywords").array(),
  aiInstructions: text("ai_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Templates table
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: chatbotTypeEnum("category").default('support'),
  difficulty: varchar("difficulty").notNull(),
  popularity: integer("popularity").default(0),
  flow: jsonb("flow").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contacts (CRM) table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  status: contactStatusEnum("status").default('new'),
  source: contactSourceEnum("source").default('manual'),
  tags: text("tags").array(),
  lastContact: timestamp("last_contact"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversations table
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  chatbotId: integer("chatbot_id").notNull().references(() => chatbots.id, { onDelete: 'cascade' }),
  contactId: integer("contact_id").notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  lastMessage: text("last_message"),
  lastMessageTime: timestamp("last_message_time"),
  status: varchar("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  text: text("text").notNull(),
  isFromContact: boolean("is_from_contact").default(true),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Support tickets table
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").default('open'),
  category: varchar("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ticket messages table
export const ticketMessages = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id, { onDelete: 'cascade' }),
  text: text("text").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// FAQs table
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: varchar("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics data table
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  chatbotId: integer("chatbot_id").references(() => chatbots.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull(),
  messages: integer("messages").default(0),
  responses: integer("responses").default(0),
  newContacts: integer("new_contacts").default(0),
  conversions: integer("conversions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// WhatsApp integrations table
export const whatsappIntegrations = pgTable("whatsapp_integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  phoneNumber: varchar("phone_number").notNull(),
  displayName: varchar("display_name").notNull(),
  businessDescription: text("business_description"),
  status: varchar("status").default("disconnected").notNull(),
  connectedAt: timestamp("connected_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  userId: varchar("user_id").primaryKey().notNull().references(() => users.id, { onDelete: 'cascade' }),
  language: varchar("language").default("es").notNull(),
  timezone: varchar("timezone").default("Europe/Madrid").notNull(),
  dateFormat: varchar("date_format").default("DD/MM/YYYY").notNull(),
  timeFormat: varchar("time_format").default("24h").notNull(),
  emailNotifications: boolean("email_notifications").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  newMessage: boolean("new_message").default(true),
  newConnection: boolean("new_connection").default(true),
  accountUpdates: boolean("account_updates").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Multimedia files table
export const multimediaFiles = pgTable("multimedia_files", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  fileName: varchar("file_name").notNull(),
  originalName: varchar("original_name").notNull(),
  fileType: varchar("file_type").notNull(), // 'image' | 'video'
  mimeType: varchar("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: varchar("file_path").notNull(),
  url: varchar("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Productos de la tienda
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"), // Ahora incluye características, beneficios, FAQ, modo de uso, etc.
  price: varchar("price"),
  currency: varchar("currency").default("USD"),
  category: varchar("category"),
  productImage: varchar("product_image"), // 1 imagen principal del producto
  images: text("images").array(), // Mantener compatibilidad
  features: text("features").array(), // Mantener campo existente
  specifications: text("specifications").array(), // Mantener campo existente
  testimonialImages: text("testimonial_images").array(), // hasta 4 imágenes de testimonios
  priceImages: text("price_images").array(), // hasta 4 imágenes de precios
  availability: boolean("availability").default(true),
  stock: integer("stock").default(0),
  sku: varchar("sku"),
  tags: text("tags").array(),
  freeShipping: boolean("free_shipping").default(false), // Envío gratis sí/no
  cashOnDelivery: varchar("cash_on_delivery").default("no"), // "yes", "no", "not_applicable"
  chatbotId: integer("chatbot_id").references(() => chatbots.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Variantes de productos con múltiples opciones de precio
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  variantName: varchar("variant_name").notNull(), // e.g., "Presentación Grande", "Color Azul", "Tamaño XL"
  characteristics: text("characteristics").notNull(), // Descripción de las características de esta variante
  price: varchar("price").notNull(),
  currency: varchar("currency").default("USD"),
  variantImage: varchar("variant_image"), // Imagen específica para esta variante
  priceImages: text("price_images").array(), // Imágenes de precios específicas para esta variante
  stock: integer("stock").default(0),
  available: boolean("available").default(true), // Si la variante está disponible
  category: varchar("category"), // Categoría específica de la variante
  sku: varchar("sku"), // SKU específico de la variante
  isDefault: boolean("is_default").default(false), // Marcar una variante como predeterminada
  sortOrder: integer("sort_order").default(0), // Para ordenar las variantes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Disparadores de IA para productos
export const productTriggers = pgTable("product_triggers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  chatbotId: integer("chatbot_id").references(() => chatbots.id).notNull(),
  keywords: text("keywords").array(),
  phrases: text("phrases").array(),
  priority: integer("priority").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Configuración de IA para productos específicos
export const productAiConfig = pgTable("product_ai_config", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  chatbotId: integer("chatbot_id").references(() => chatbots.id).notNull(),
  salesPitch: text("sales_pitch"),
  objectionHandling: jsonb("objection_handling"),
  competitorAnalysis: text("competitor_analysis"),
  targetAudience: text("target_audience"),
  useCases: text("use_cases").array(),
  benefits: text("benefits").array(),
  aiInstructions: text("ai_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schema types
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  role: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export const insertChatbotSchema = createInsertSchema(chatbots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketMessageSchema = createInsertSchema(ticketMessages).omit({
  id: true,
  createdAt: true,
});

export const insertWhatsappIntegrationSchema = createInsertSchema(whatsappIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  connectedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductTriggerSchema = createInsertSchema(productTriggers).omit({
  id: true,
  createdAt: true,
});

export const insertProductAiConfigSchema = createInsertSchema(productAiConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductVariantSchema = createInsertSchema(productVariants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

export type Chatbot = typeof chatbots.$inferSelect;
export type InsertChatbot = z.infer<typeof insertChatbotSchema>;

export type Template = typeof templates.$inferSelect;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;

export type FAQ = typeof faqs.$inferSelect;
export type AnalyticsData = typeof analytics.$inferSelect;

export type WhatsappIntegration = typeof whatsappIntegrations.$inferSelect;
export type InsertWhatsappIntegration = z.infer<typeof insertWhatsappIntegrationSchema>;

export type UserPreference = typeof userPreferences.$inferSelect;

export type MultimediaFile = typeof multimediaFiles.$inferSelect;
export type InsertMultimediaFile = typeof multimediaFiles.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type ProductTrigger = typeof productTriggers.$inferSelect;
export type InsertProductTrigger = typeof productTriggers.$inferInsert;

export type ProductAiConfig = typeof productAiConfig.$inferSelect;
export type InsertProductAiConfig = typeof productAiConfig.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;
