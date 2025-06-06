import { eq, desc, and, gte, lte } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  chatbots,
  templates,
  contacts,
  conversations,
  messages,
  tickets,
  ticketMessages,
  faqs,
  analytics,
  whatsappIntegrations,
  userPreferences,
  multimediaFiles,
  products,
  productTriggers,
  productAiConfig,
  type User,
  type UpsertUser,
  type InsertUser,
  type Chatbot,
  type InsertChatbot,
  type Template,
  type Contact,
  type InsertContact,
  type Conversation,
  type Message,
  type Ticket,
  type InsertTicket,
  type TicketMessage,
  type InsertTicketMessage,
  type FAQ,
  type AnalyticsData,
  type WhatsappIntegration,
  type InsertWhatsappIntegration,
  type UserPreference,
  type MultimediaFile,
  type InsertMultimediaFile,
  type Product,
  type InsertProduct,
  type ProductTrigger,
  type InsertProductTrigger,
  type ProductAiConfig,
  type InsertProductAiConfig,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  upsertUser(userData: UpsertUser): Promise<User>;

  // Chatbot operations
  getChatbots(userId: string): Promise<Chatbot[]>;
  getChatbot(id: number): Promise<Chatbot | undefined>;
  createChatbot(chatbot: InsertChatbot): Promise<Chatbot>;
  updateChatbot(id: number, data: Partial<Chatbot>): Promise<Chatbot>;
  deleteChatbot(id: number): Promise<void>;

  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;

  // Contact operations
  getContacts(userId: string): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, data: Partial<Contact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;

  // Conversation operations
  getConversationsByUser(userId: string, page?: number, pageSize?: number): Promise<{ conversations: Conversation[], total: number }>;
  getConversationMessages(conversationId: number): Promise<Message[]>;

  // Support ticket operations
  getTickets(userId: string): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket>;
  getTicketMessages(ticketId: number): Promise<TicketMessage[]>;
  addTicketMessage(message: InsertTicketMessage): Promise<TicketMessage>;

  // FAQ operations
  getFaqs(): Promise<FAQ[]>;

  // Analytics operations
  getAnalytics(userId: string, timeRange: string, chatbotId?: number): Promise<AnalyticsData[]>;

  // WhatsApp integration operations
  getWhatsappIntegration(userId: string): Promise<WhatsappIntegration | undefined>;
  createWhatsappIntegration(integration: InsertWhatsappIntegration): Promise<WhatsappIntegration>;
  updateWhatsappIntegration(id: number, data: Partial<WhatsappIntegration>): Promise<WhatsappIntegration>;

  // User preferences operations
  getUserPreferences(userId: string): Promise<UserPreference | undefined>;
  updateUserPreferences(userId: string, data: Partial<UserPreference>): Promise<UserPreference>;

  // Multimedia operations
  getMultimediaFiles(userId: string): Promise<MultimediaFile[]>;
  getMultimediaFile(id: number): Promise<MultimediaFile | undefined>;
  createMultimediaFile(data: InsertMultimediaFile): Promise<MultimediaFile>;
  deleteMultimediaFile(id: number): Promise<void>;

  // AI Conversation Control operations
  updateConversationAI(conversationId: number, data: { aiEnabled?: boolean; aiStatus?: string }): Promise<void>;
  addManualMessage(conversationId: number, messageData: any): Promise<any>;

  // Product operations
  getProducts(userId: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Product triggers operations
  getProductTriggers(chatbotId: number): Promise<ProductTrigger[]>;
  createProductTrigger(trigger: InsertProductTrigger): Promise<ProductTrigger>;
  updateProductTrigger(id: number, data: Partial<ProductTrigger>): Promise<ProductTrigger>;
  deleteProductTrigger(id: number): Promise<void>;

  // Product AI config operations
  getProductAiConfig(productId: number, chatbotId: number): Promise<ProductAiConfig | undefined>;
  createProductAiConfig(config: InsertProductAiConfig): Promise<ProductAiConfig>;
  updateProductAiConfig(id: number, data: Partial<ProductAiConfig>): Promise<ProductAiConfig>;

  // Auto-chatbot generation
  createChatbotFromProduct(productId: number, userId: string): Promise<Chatbot>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Chatbot operations
  async getChatbots(userId: string): Promise<Chatbot[]> {
    return db
      .select()
      .from(chatbots)
      .where(eq(chatbots.userId, userId))
      .orderBy(desc(chatbots.updatedAt));
  }

  async getChatbot(id: number): Promise<Chatbot | undefined> {
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, id));
    return chatbot;
  }

  async createChatbot(chatbotData: InsertChatbot): Promise<Chatbot> {
    const [chatbot] = await db
      .insert(chatbots)
      .values(chatbotData)
      .returning();
    return chatbot;
  }

  async updateChatbot(id: number, data: Partial<Chatbot>): Promise<Chatbot> {
    const [chatbot] = await db
      .update(chatbots)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(chatbots.id, id))
      .returning();
    return chatbot;
  }

  async deleteChatbot(id: number): Promise<void> {
    await db.delete(chatbots).where(eq(chatbots.id, id));
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return db.select().from(templates);
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  // Contact operations
  async getContacts(userId: string): Promise<Contact[]> {
    return db
      .select()
      .from(contacts)
      .where(eq(contacts.userId, userId))
      .orderBy(desc(contacts.updatedAt));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(contactData: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(contactData)
      .returning();
    return contact;
  }

  async updateContact(id: number, data: Partial<Contact>): Promise<Contact> {
    const [contact] = await db
      .update(contacts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // Conversation operations
  async getConversationsByUser(userId: string, page = 1, pageSize = 10): Promise<{ conversations: Conversation[], total: number }> {
    // Get user's chatbots
    const userChatbots = await db.select().from(chatbots).where(eq(chatbots.userId, userId));
    const chatbotIds = userChatbots.map(chatbot => chatbot.id);
    
    if (chatbotIds.length === 0) {
      return { conversations: [], total: 0 };
    }

    // Query conversations for these chatbots
    const conversationList = await db
      .select()
      .from(conversations)
      .where(chatbots.id.in(chatbotIds))
      .orderBy(desc(conversations.lastMessageTime))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // Get total count
    const [{ count }] = await db
      .select({ count: db.fn.count() })
      .from(conversations)
      .where(chatbots.id.in(chatbotIds));

    return { 
      conversations: conversationList, 
      total: Number(count) 
    };
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  // Support ticket operations
  async getTickets(userId: string): Promise<Ticket[]> {
    return db
      .select()
      .from(tickets)
      .where(eq(tickets.userId, userId))
      .orderBy(desc(tickets.updatedAt));
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    const [ticket] = await db
      .insert(tickets)
      .values(ticketData)
      .returning();
    return ticket;
  }

  async updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket> {
    const [ticket] = await db
      .update(tickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  async getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
    return db
      .select()
      .from(ticketMessages)
      .where(eq(ticketMessages.ticketId, ticketId))
      .orderBy(ticketMessages.createdAt);
  }

  async addTicketMessage(messageData: InsertTicketMessage): Promise<TicketMessage> {
    const [message] = await db
      .insert(ticketMessages)
      .values(messageData)
      .returning();
    
    // Update the ticket's updated_at
    await db
      .update(tickets)
      .set({ updatedAt: new Date() })
      .where(eq(tickets.id, messageData.ticketId));
      
    return message;
  }

  // FAQ operations
  async getFaqs(): Promise<FAQ[]> {
    return db.select().from(faqs);
  }

  // Analytics operations
  async getAnalytics(userId: string, timeRange: string, chatbotId?: number): Promise<AnalyticsData[]> {
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    let query = db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.userId, userId),
          gte(analytics.date, startDate)
        )
      );
    
    if (chatbotId) {
      query = query.where(eq(analytics.chatbotId, chatbotId));
    }
    
    return query.orderBy(analytics.date);
  }

  // WhatsApp integration operations
  async getWhatsappIntegration(userId: string): Promise<WhatsappIntegration | undefined> {
    const [integration] = await db
      .select()
      .from(whatsappIntegrations)
      .where(eq(whatsappIntegrations.userId, userId));
    return integration;
  }

  async createWhatsappIntegration(integrationData: InsertWhatsappIntegration): Promise<WhatsappIntegration> {
    const [integration] = await db
      .insert(whatsappIntegrations)
      .values(integrationData)
      .returning();
    return integration;
  }

  async updateWhatsappIntegration(id: number, data: Partial<WhatsappIntegration>): Promise<WhatsappIntegration> {
    const [integration] = await db
      .update(whatsappIntegrations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(whatsappIntegrations.id, id))
      .returning();
    return integration;
  }

  // User preferences operations
  async getUserPreferences(userId: string): Promise<UserPreference | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async updateUserPreferences(userId: string, data: Partial<UserPreference>): Promise<UserPreference> {
    const [preferences] = await db
      .insert(userPreferences)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      })
      .returning();
    return preferences;
  }

  // Multimedia operations
  async getMultimediaFiles(userId: string): Promise<MultimediaFile[]> {
    return await db
      .select()
      .from(multimediaFiles)
      .where(eq(multimediaFiles.userId, userId))
      .orderBy(desc(multimediaFiles.createdAt));
  }

  async getMultimediaFile(id: number): Promise<MultimediaFile | undefined> {
    const [file] = await db
      .select()
      .from(multimediaFiles)
      .where(eq(multimediaFiles.id, id));
    return file;
  }

  async createMultimediaFile(data: InsertMultimediaFile): Promise<MultimediaFile> {
    const [file] = await db
      .insert(multimediaFiles)
      .values(data)
      .returning();
    return file;
  }

  async deleteMultimediaFile(id: number): Promise<void> {
    await db
      .delete(multimediaFiles)
      .where(eq(multimediaFiles.id, id));
  }

  // AI Conversation Control operations
  async updateConversationAI(conversationId: number, data: { aiEnabled?: boolean; aiStatus?: string }): Promise<void> {
    const updateData: any = {};
    if (data.aiEnabled !== undefined) {
      updateData.aiEnabled = data.aiEnabled;
    }
    if (data.aiStatus !== undefined) {
      updateData.aiStatus = data.aiStatus;
    }
    updateData.updatedAt = new Date();

    await db.update(conversations)
      .set(updateData)
      .where(eq(conversations.id, conversationId));
  }

  async addManualMessage(conversationId: number, messageData: any): Promise<any> {
    const [message] = await db.insert(messages).values({
      conversationId,
      content: messageData.content,
      isFromUser: !messageData.isAI,
      timestamp: messageData.timestamp || new Date(),
    }).returning();

    // Update conversation last message
    await db.update(conversations)
      .set({
        lastMessage: messageData.content,
        lastMessageTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    return message;
  }

  // Product operations
  async getProducts(userId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.userId, userId))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(productData)
      .returning();
    return product;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Product triggers operations
  async getProductTriggers(chatbotId: number): Promise<ProductTrigger[]> {
    return await db
      .select()
      .from(productTriggers)
      .where(eq(productTriggers.chatbotId, chatbotId))
      .orderBy(desc(productTriggers.priority));
  }

  async createProductTrigger(triggerData: InsertProductTrigger): Promise<ProductTrigger> {
    const [trigger] = await db
      .insert(productTriggers)
      .values(triggerData)
      .returning();
    return trigger;
  }

  async updateProductTrigger(id: number, data: Partial<ProductTrigger>): Promise<ProductTrigger> {
    const [trigger] = await db
      .update(productTriggers)
      .set(data)
      .where(eq(productTriggers.id, id))
      .returning();
    return trigger;
  }

  async deleteProductTrigger(id: number): Promise<void> {
    await db.delete(productTriggers).where(eq(productTriggers.id, id));
  }

  // Product AI config operations
  async getProductAiConfig(productId: number, chatbotId: number): Promise<ProductAiConfig | undefined> {
    const [config] = await db
      .select()
      .from(productAiConfig)
      .where(and(
        eq(productAiConfig.productId, productId),
        eq(productAiConfig.chatbotId, chatbotId)
      ));
    return config;
  }

  async createProductAiConfig(configData: InsertProductAiConfig): Promise<ProductAiConfig> {
    const [config] = await db
      .insert(productAiConfig)
      .values(configData)
      .returning();
    return config;
  }

  async updateProductAiConfig(id: number, data: Partial<ProductAiConfig>): Promise<ProductAiConfig> {
    const [config] = await db
      .update(productAiConfig)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productAiConfig.id, id))
      .returning();
    return config;
  }

  // Auto-chatbot generation from product
  async createChatbotFromProduct(productId: number, userId: string): Promise<Chatbot> {
    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // Create chatbot with product-specific configuration
    const chatbotData: InsertChatbot = {
      userId,
      name: `Chatbot - ${product.name}`,
      description: `Chatbot automático para ${product.name}`,
      type: 'sales' as any,
      status: 'draft' as any,
      configuration: {
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productDescription: product.description,
        productFeatures: product.features || [],
        autoGenerated: true,
        aiPrompt: `Eres un asistente de ventas especializado en ${product.name}. Tu objetivo es vender este producto usando la metodología AIDA.`,
      },
      welcomeMessage: `¡Hola! Te puedo ayudar con información sobre ${product.name}. ¿Qué te gustaría saber?`,
    };

    const chatbot = await this.createChatbot(chatbotData);

    // Update product with chatbot association
    await this.updateProduct(productId, { chatbotId: chatbot.id });

    // Create default triggers for the product
    const defaultKeywords = [
      product.name.toLowerCase(),
      ...(product.tags || []).map(tag => tag.toLowerCase()),
      product.category?.toLowerCase(),
    ].filter(Boolean);

    if (defaultKeywords.length > 0) {
      await this.createProductTrigger({
        productId: product.id,
        chatbotId: chatbot.id,
        keywords: defaultKeywords,
        phrases: [
          `información sobre ${product.name}`,
          `quiero comprar ${product.name}`,
          `precio de ${product.name}`,
        ],
        priority: 1,
        isActive: true,
      });
    }

    // Create AI configuration for the product
    await this.createProductAiConfig({
      productId: product.id,
      chatbotId: chatbot.id,
      salesPitch: `${product.name} es perfecto para ti porque ${product.description}`,
      targetAudience: 'Clientes interesados en productos de calidad',
      useCases: product.features || [],
      benefits: product.features || [],
      aiInstructions: `
        Usa la metodología AIDA:
        1. ATENCIÓN: Capta el interés con el nombre del producto
        2. INTERÉS: Destaca las características principales
        3. DESEO: Explica los beneficios únicos
        4. ACCIÓN: Guía hacia la compra
        
        Producto: ${product.name}
        Precio: ${product.price} ${product.currency}
        Descripción: ${product.description}
        Características: ${(product.features || []).join(', ')}
      `,
    });

    return chatbot;
  }
}

export const storage = new DatabaseStorage();
