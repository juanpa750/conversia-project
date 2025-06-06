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
  productVariants,
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
  type ProductVariant,
  type InsertProductVariant,
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

  // Product variants operations
  getProductVariants(productId: number): Promise<ProductVariant[]>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  updateProductVariant(id: number, data: Partial<ProductVariant>): Promise<ProductVariant>;
  deleteProductVariant(id: number): Promise<void>;
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
    console.log('🎯 STORAGE: Looking for chatbot with ID:', id);
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, id));
    console.log('🎯 STORAGE: Found chatbot:', chatbot ? { id: chatbot.id, name: chatbot.name, userId: chatbot.userId } : 'null');
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
    // First, remove chatbot references from products
    await db.update(products)
      .set({ chatbotId: null })
      .where(eq(products.chatbotId, id));
    
    // Delete related product triggers
    await db.delete(productTriggers).where(eq(productTriggers.chatbotId, id));
    
    // Delete related product AI configs
    await db.delete(productAiConfig).where(eq(productAiConfig.chatbotId, id));
    
    // Finally delete the chatbot
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

  // Auto-chatbot generation with intelligent analysis
  async createChatbotFromProduct(productId: number, userId: string): Promise<Chatbot> {
    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // Extract comprehensive information using intelligent analysis
    const productDescription = product.description || '';
    const extractedFeatures = this.extractProductFeatures(productDescription);
    const extractedBenefits = this.extractProductBenefits(productDescription);
    const technicalSpecs = this.extractTechnicalSpecs(productDescription);
    const targetAudience = this.identifyTargetAudience(product, extractedFeatures);
    const competitiveAdvantages = this.extractCompetitiveAdvantages(productDescription);

    // Get product variants for intelligent pricing information
    const productVariants = await this.getProductVariants(productId);

    // Generate trigger keywords based on product
    const triggerKeywords = [
      product.name.toLowerCase(),
      ...extractedFeatures.slice(0, 3).map(f => f.toLowerCase()),
      product.category?.toLowerCase() || '',
      ...(product.tags || []).map(tag => tag.toLowerCase())
    ].filter(Boolean);

    // Generate AI instructions specific to this product
    const aiInstructions = this.generateProductAiInstructions(product, extractedFeatures, extractedBenefits, technicalSpecs);

    // Generate intelligent flow with visual nodes and edges
    let nodes = [
      {
        id: 'start',
        type: 'message',
        position: { x: 100, y: 100 },
        data: {
          type: 'message',
          text: `¡Hola! Soy tu especialista en ${product.name}. ${extractedFeatures.length > 0 ? `Reconocido por ${extractedFeatures[0]}.` : ''} ¿Qué te gustaría saber?`,
          isStart: true
        }
      },
      {
        id: 'info-menu',
        type: 'menu',
        position: { x: 100, y: 250 },
        data: {
          type: 'menu',
          text: '¿Qué información necesitas?',
          options: [
            { id: 'features', text: 'Características y funciones' },
            { id: 'benefits', text: 'Beneficios y ventajas' },
            { id: 'specs', text: 'Especificaciones técnicas' },
            { id: 'price', text: 'Precio y disponibilidad' }
          ]
        }
      },
      {
        id: 'features-response',
        type: 'message',
        position: { x: 400, y: 150 },
        data: {
          type: 'message',
          text: `${product.name} incluye: ${extractedFeatures.slice(0, 3).join(', ')}. ${extractedFeatures.length > 3 ? 'Y muchas características más.' : ''}`
        }
      },
      {
        id: 'benefits-response',
        type: 'message',
        position: { x: 400, y: 250 },
        data: {
          type: 'message',
          text: `Los clientes destacan: ${extractedBenefits.slice(0, 2).join(' y ')}. Imagina cómo puede transformar tu experiencia.`
        }
      },
      {
        id: 'specs-response',
        type: 'message',
        position: { x: 400, y: 350 },
        data: {
          type: 'message',
          text: `Especificaciones de ${product.name}: ${technicalSpecs.slice(0, 3).join(', ')}. ${technicalSpecs.length > 3 ? 'Contáctanos para detalles completos.' : ''}`
        }
      },
      {
        id: 'price-response',
        type: 'message',
        position: { x: 400, y: 450 },
        data: {
          type: 'message',
          text: `${product.name} está disponible${product.price ? ` por ${product.price} ${product.currency || ''}` : ''}. ${product.freeShipping ? 'Con envío gratuito. ' : ''}${product.cashOnDelivery === 'yes' ? 'Pago contra entrega disponible.' : ''}`
        }
      },
      {
        id: 'purchase-question',
        type: 'question',
        position: { x: 700, y: 300 },
        data: {
          type: 'question',
          text: '¿Te interesa realizar el pedido?',
          responses: ['Sí, quiero comprarlo', 'Necesito más información', 'No por ahora']
        }
      },
      {
        id: 'purchase-confirm',
        type: 'message',
        position: { x: 1000, y: 200 },
        data: {
          type: 'message',
          text: '¡Excelente! Te conectaré con un asesor para completar tu pedido. Proporciona tu número de teléfono y te contactaremos.'
        }
      },
      {
        id: 'more-info',
        type: 'message',
        position: { x: 1000, y: 350 },
        data: {
          type: 'message',
          text: '¿Qué información adicional necesitas? Estoy aquí para resolver todas tus dudas.'
        }
      }
    ];

    let edges = [
      { id: 'e1', source: 'start', target: 'info-menu' },
      { id: 'e2', source: 'info-menu', target: 'features-response', sourceHandle: 'features' },
      { id: 'e3', source: 'info-menu', target: 'benefits-response', sourceHandle: 'benefits' },
      { id: 'e4', source: 'info-menu', target: 'specs-response', sourceHandle: 'specs' },
      { id: 'e5', source: 'info-menu', target: 'price-response', sourceHandle: 'price' },
      { id: 'e6', source: 'features-response', target: 'purchase-question' },
      { id: 'e7', source: 'benefits-response', target: 'purchase-question' },
      { id: 'e8', source: 'specs-response', target: 'purchase-question' },
      { id: 'e9', source: 'price-response', target: 'purchase-question' },
      { id: 'e10', source: 'purchase-question', target: 'purchase-confirm', sourceHandle: 'Sí, quiero comprarlo' },
      { id: 'e11', source: 'purchase-question', target: 'more-info', sourceHandle: 'Necesito más información' },
      { id: 'e12', source: 'more-info', target: 'info-menu' }
    ];

    // Generate intelligent chatbot configuration
    const chatbotData: InsertChatbot = {
      userId,
      name: `Especialista en ${product.name} - ${product.category || 'Producto'}`,
      description: `Asistente virtual especializado en ${product.name} con conocimiento profundo del producto y metodología AIDA para ventas consultivas.`,
      type: 'sales' as any,
      status: 'active' as any,
      flow: JSON.stringify({
        nodes,
        edges,
        productContext: {
          id: product.id,
          name: product.name,
          fullDescription: productDescription,
          extractedFeatures,
          extractedBenefits,
          technicalSpecs,
          competitiveAdvantages,
          targetAudience,
          price: product.price,
          currency: product.currency,
          category: product.category,
          variants: productVariants || []
        }
      })
    };

    // If variants exist, add variant-specific nodes
    if (productVariants && productVariants.length > 0) {
      const variantMenuNode = {
        id: 'variant-menu',
        type: 'menu',
        position: { x: 700, y: 150 },
        data: {
          type: 'menu',
          text: `${product.name} tiene diferentes opciones disponibles:`,
          options: productVariants.map(v => ({
            id: `variant-${v.id}`,
            text: `${v.variantName || v.characteristics || 'Opción'} - ${v.price ? `${v.price} ${product.currency || ''}` : 'Consultar precio'}`
          }))
        }
      };

      nodes.push(variantMenuNode);

      // Add variant-specific response nodes
      productVariants.forEach((variant, index) => {
        const variantResponseNode = {
          id: `variant-response-${variant.id}`,
          type: 'message',
          position: { x: 1000, y: 100 + (index * 100) },
          data: {
            type: 'message',
            text: `${variant.variantName}: ${variant.characteristics || 'Excelente opción'}. ${variant.price ? `Precio: ${variant.price} ${product.currency || ''}` : 'Precio especial disponible'}.`
          }
        };
        nodes.push(variantResponseNode);

        // Connect variant menu to response
        edges.push({
          id: `e-variant-${variant.id}`,
          source: 'variant-menu',
          target: `variant-response-${variant.id}`,
          sourceHandle: `variant-${variant.id}`
        });

        // Connect variant response to purchase question
        edges.push({
          id: `e-variant-purchase-${variant.id}`,
          source: `variant-response-${variant.id}`,
          target: 'purchase-question'
        });
      });

      // Connect price response to variant menu instead of purchase question
      edges = edges.filter(e => e.id !== 'e9'); // Remove direct connection
      edges.push({
        id: 'e9-variant',
        source: 'price-response',
        target: 'variant-menu'
      });
    }

    const chatbot = await this.createChatbot(chatbotData);
    await this.updateProduct(productId, { chatbotId: chatbot.id });

    // Create intelligent keyword triggers
    const intelligentKeywords = [
      product.name.toLowerCase(),
      ...(product.tags || []).map(tag => tag.toLowerCase()),
      product.category?.toLowerCase(),
      ...extractedFeatures.flatMap(f => f.split(' ').filter(w => w.length > 3).slice(0, 2)),
      ...extractedBenefits.flatMap(b => b.split(' ').filter(w => w.length > 3).slice(0, 2))
    ].filter(Boolean).filter((item): item is string => typeof item === 'string').slice(0, 20);

    const advancedPhrases = [
      `información sobre ${product.name}`,
      `características de ${product.name}`,
      `precio de ${product.name}`,
      `beneficios de ${product.name}`,
      `comprar ${product.name}`,
      `disponibilidad de ${product.name}`,
      ...extractedFeatures.slice(0, 3).map(f => `${product.name} ${f.split(' ')[0]}`)
    ];

    await this.createProductTrigger({
      productId: product.id,
      chatbotId: chatbot.id,
      keywords: intelligentKeywords,
      phrases: advancedPhrases,
      isActive: true
    });

    // Create comprehensive AI configuration
    await this.createProductAiConfig({
      productId: product.id,
      chatbotId: chatbot.id,
      salesPitch: `Experto en ${product.name} con metodología AIDA consultiva`,
      targetAudience: targetAudience.join(', '),
      aiInstructions: `Especialista en ${product.name}. Usar metodología AIDA: Atención->Interés->Deseo->Acción. Características: ${extractedFeatures.join(', ')}. Beneficios: ${extractedBenefits.join(', ')}. Especificaciones: ${technicalSpecs.join(', ')}.`
    });

    return chatbot;
  }

  private extractProductFeatures(description: string): string[] {
    const features: string[] = [];
    const patterns = [
      /(?:características|features):\s*([^.]*)/gi,
      /(?:incluye|includes):\s*([^.]*)/gi,
      /•\s*([^•\n]+)/g,
      /-\s*([^-\n]+)/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(description)) !== null) {
        const feature = match[1]?.trim();
        if (feature && feature.length > 10 && feature.length < 200) {
          features.push(feature);
        }
      }
    });
    
    return Array.from(new Set(features)).slice(0, 10);
  }

  private extractProductBenefits(description: string): string[] {
    const benefits: string[] = [];
    const patterns = [
      /(?:beneficios|benefits):\s*([^.]*)/gi,
      /(?:ventajas|advantages):\s*([^.]*)/gi,
      /permite\s+([^.]+)/gi,
      /ayuda\s+a\s+([^.]+)/gi,
      /mejora\s+([^.]+)/gi
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(description)) !== null) {
        const benefit = match[1]?.trim();
        if (benefit && benefit.length > 15 && benefit.length < 300) {
          benefits.push(benefit);
        }
      }
    });
    
    return Array.from(new Set(benefits)).slice(0, 8);
  }

  private extractTechnicalSpecs(description: string): string[] {
    const specs: string[] = [];
    const patterns = [
      /(?:especificaciones|specifications):\s*([^.]*)/gi,
      /(?:dimensiones|dimensions):\s*([^.]*)/gi,
      /(?:peso|weight):\s*([^.]*)/gi,
      /\d+\s*(?:cm|mm|kg|gr|watts|volts)/gi
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(description)) !== null) {
        const spec = match[1]?.trim() || match[0]?.trim();
        if (spec && spec.length > 5 && spec.length < 150) {
          specs.push(spec);
        }
      }
    });
    
    return Array.from(new Set(specs)).slice(0, 12);
  }

  private extractCompetitiveAdvantages(description: string): string[] {
    const advantages: string[] = [];
    const patterns = [
      /(?:única|único|exclusiv[ao]|especial|superior|mejor)/gi,
      /(?:patentad[ao]|certificad[ao]|premiado)/gi,
      /(?:innovador|innovadora|avanzad[ao])/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) advantages.push(...matches.slice(0, 3));
    });
    
    return Array.from(new Set(advantages));
  }

  private identifyTargetAudience(product: any, features: string[]): string[] {
    const audiences: string[] = [];
    const category = product.category?.toLowerCase() || '';
    
    if (category.includes('tech')) audiences.push('entusiastas tecnológicos');
    if (category.includes('salud')) audiences.push('personas conscientes del bienestar');
    if (category.includes('hogar')) audiences.push('propietarios que valoran el confort');
    
    features.forEach(feature => {
      const lower = feature.toLowerCase();
      if (lower.includes('profesional')) audiences.push('profesionales');
      if (lower.includes('fácil')) audiences.push('usuarios principiantes');
      if (lower.includes('avanzado')) audiences.push('usuarios experimentados');
    });
    
    return Array.from(new Set(audiences)).slice(0, 5);
  }

  private generateAdvancedTemplate(product: any, features: string[], benefits: string[], variants?: any[]): string {
    const hasVariants = variants && variants.length > 0;
    
    let priceInfo = '';
    if (hasVariants) {
      const variantPrices = variants.map(v => `${v.variantName}: ${v.price} ${v.currency || 'USD'}`).join('\n• ');
      priceInfo = `Opciones disponibles:\n• ${variantPrices}`;
    } else {
      priceInfo = product.price ? `Precio: ${product.price} ${product.currency || ''}` : 'Precio especial';
    }

    return `
🎯 **${product.name}** - Solución inteligente

✨ **Características:**
${features.slice(0, 3).map(f => `• ${f}`).join('\n')}

🌟 **Beneficios:**
${benefits.slice(0, 2).map(b => `• ${b}`).join('\n')}

💰 **Información de precios:**
${priceInfo}
${product.freeShipping ? '🚚 Envío gratuito' : ''}
${product.cashOnDelivery === 'yes' ? '💳 Pago contra entrega' : ''}
${hasVariants ? '\n📸 Imágenes de precios disponibles para cada opción' : ''}

¿Más detalles o proceder con pedido?
    `.trim();
  }

  // Product variants operations
  async getProductVariants(productId: number): Promise<ProductVariant[]> {
    return await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))
      .orderBy(productVariants.sortOrder, productVariants.createdAt);
  }

  async createProductVariant(variantData: InsertProductVariant): Promise<ProductVariant> {
    const [variant] = await db
      .insert(productVariants)
      .values(variantData)
      .returning();
    return variant;
  }

  async updateProductVariant(id: number, data: Partial<ProductVariant>): Promise<ProductVariant> {
    const [variant] = await db
      .update(productVariants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productVariants.id, id))
      .returning();
    return variant;
  }

  async deleteProductVariant(id: number): Promise<void> {
    await db.delete(productVariants).where(eq(productVariants.id, id));
  }

  // Generate complete AIDA conversation flows for product chatbots
  private async generateAidaFlows(
    chatbotId: number, 
    product: any, 
    features: string[], 
    benefits: string[], 
    specs: string[], 
    variants: any[]
  ): Promise<void> {
    // Build comprehensive flow configuration with AIDA methodology
    const priceInfo = variants.length > 0 
      ? `Disponible en ${variants.length} opciones desde ${variants[0]?.price || 'consultar'} ${product.currency || ''}`
      : `${product.price || 'Precio especial'} ${product.currency || ''}`;

    const aidaFlows = {
      // 1. ATENCIÓN - Captar interés inicial
      attention: {
        welcome: `¡Hola! 👋 Soy tu especialista en ${product.name}.\n\n🎯 **Producto destacado** ${features.length > 0 ? `por su ${features[0]}` : 'en su categoría'}\n\n¿Qué te gustaría conocer? Puedo ayudarte con:\n• Características técnicas\n• Beneficios y ventajas\n• Precios y disponibilidad\n• Proceso de compra`,
        
        triggers: ['hola', 'información', 'detalles', 'ayuda', 'producto'],
        
        responses: [
          `¡Excelente elección! ${product.name} es uno de nuestros productos más valorados. ${features.length > 0 ? `Destaca especialmente por ${features[0]}.` : ''} ¿Te gustaría conocer sus características principales?`,
          
          `${product.name} ha sido diseñado pensando en la calidad y eficiencia. ${benefits.length > 0 ? `Los clientes destacan que ${benefits[0]}.` : ''} ¿Qué aspecto te interesa más?`,
          
          `¿Sabías que ${product.name} ${features.length > 0 ? `incluye ${features[0]}` : 'tiene características únicas'}? Te puedo contar todo sobre sus ventajas.`
        ]
      },

      // 2. INTERÉS - Despertar curiosidad con características
      interest: {
        triggers: ['características', 'funciones', 'especificaciones', 'cómo funciona', 'qué incluye'],
        
        responses: [
          `🔧 **Características principales de ${product.name}:**\n\n${features.slice(0, 4).map(f => `✅ ${f}`).join('\n')}\n\n${specs.length > 0 ? `📋 **Especificaciones técnicas:**\n${specs.slice(0, 3).map(s => `• ${s}`).join('\n')}\n\n` : ''}¿Te gustaría conocer cómo estos beneficios pueden ayudarte específicamente?`,
          
          `${product.name} integra tecnología avanzada:\n\n${features.slice(0, 3).map((f, i) => `${i + 1}. **${f}**`).join('\n')}\n\n${product.category ? `Categoría: ${product.category}` : ''}\n\n¿Qué característica te resulta más interesante?`,
          
          `Lo que hace único a ${product.name}:\n\n${features.slice(0, 3).map(f => `🌟 ${f}`).join('\n')}\n\n${specs.length > 0 ? `Plus técnico: ${specs[0]}` : ''}\n\n¿Necesitas más detalles técnicos?`
        ]
      },

      // 3. DESEO - Crear necesidad con beneficios
      desire: {
        triggers: ['beneficios', 'ventajas', 'resultados', 'por qué', 'me conviene'],
        
        responses: [
          `💎 **Beneficios que obtienes con ${product.name}:**\n\n${benefits.slice(0, 3).map(b => `🎯 ${b}`).join('\n')}\n\n**Imagina cómo esto transformaría tu experiencia:**\n• Mayor eficiencia en tus tareas\n• Resultados profesionales garantizados\n• Inversión que se paga sola\n\n¿Te gustaría conocer el precio y opciones de compra?`,
          
          `Los clientes que eligen ${product.name} experimentan:\n\n${benefits.slice(0, 2).map(b => `✨ ${b}`).join('\n')}\n\n**Casos de éxito:**\n• Mejora del 90% en productividad\n• ROI positivo en menos de 3 meses\n• Satisfacción garantizada\n\n¿Qué resultado te interesa más lograr?`,
          
          `**¿Por qué ${product.name} es la mejor inversión?**\n\n${benefits.slice(0, 3).map((b, i) => `${i + 1}. ${b}`).join('\n')}\n\n**Tu inversión incluye:**\n• Producto de calidad premium\n• Soporte técnico especializado\n• Garantía extendida\n\n¿Procedemos con la cotización?`
        ]
      },

      // 4. ACCIÓN - Motivar la compra
      action: {
        triggers: ['comprar', 'precio', 'costo', 'pedido', 'adquirir', 'cotización'],
        
        responses: [
          `💰 **Información de inversión para ${product.name}:**\n\n💳 ${priceInfo}\n\n**Beneficios incluidos:**\n${product.freeShipping ? '🚚 Envío gratuito a todo el país\n' : ''}${product.cashOnDelivery === 'yes' ? '💳 Pago contra entrega disponible\n' : ''}• Garantía de satisfacción\n• Soporte técnico incluido\n\n**¿Cómo prefieres proceder?**\n1. Reservar ahora\n2. Más información\n3. Hablar con especialista`,
          
          `🎯 **Oferta especial para ${product.name}:**\n\n💰 Precio: ${priceInfo}\n\n**Tu compra incluye:**\n• Producto original garantizado\n• Manual de usuario detallado\n• Soporte post-venta\n${variants.length > 0 ? `• ${variants.length} opciones disponibles\n` : ''}${product.freeShipping ? '• Envío sin costo adicional\n' : ''}\n\n**¿Confirmamos tu pedido?**`,
          
          `⚡ **¡Disponible ahora! ${product.name}**\n\n💎 Inversión: ${priceInfo}\n${product.stock ? `📦 Stock: ${product.stock} unidades disponibles\n` : ''}${product.freeShipping ? '🚚 Envío gratuito\n' : ''}${product.cashOnDelivery === 'yes' ? '💳 Pago contra entrega\n' : ''}\n\n**Pasos para tu compra:**\n1. Confirmar producto y cantidad\n2. Datos de envío\n3. Método de pago\n4. ¡Listo!\n\n¿Iniciamos el proceso?`
        ]
      },

      // 5. SEGUIMIENTO - Cerrar y acompañar
      followup: {
        triggers: ['dudas', 'garantía', 'soporte', 'después de comprar', 'servicio'],
        
        responses: [
          `🛡️ **Soporte completo para ${product.name}:**\n\n**Garantías incluidas:**\n• Calidad del producto\n• Funcionamiento óptimo\n• Satisfacción total\n\n**Nuestro compromiso:**\n• Soporte técnico 24/7\n• Respuesta en menos de 2 horas\n• Especialistas certificados\n\n¿Alguna pregunta específica sobre el soporte?`,
          
          `👥 **Acompañamiento post-compra:**\n\n**Incluido en tu inversión:**\n• Instalación y configuración\n• Capacitación personalizada\n• Soporte técnico continuo\n• Actualizaciones gratuitas\n\n**¿Necesitas ayuda con algo específico?**`,
          
          `🔧 **Servicio técnico especializado:**\n\n**Disponible para ti:**\n• Consultas técnicas ilimitadas\n• Mantenimiento preventivo\n• Resolución de problemas\n• Optimización del rendimiento\n\n¿Te gustaría agendar una sesión de soporte?`
        ]
      },

      // 6. POST-VENTA - Fidelización
      retention: {
        triggers: ['satisfecho', 'resultado', 'recomendación', 'otro producto'],
        
        responses: [
          `🌟 **¡Nos alegra saber de tu experiencia con ${product.name}!**\n\n**Beneficios adicionales para clientes:**\n• Descuentos en productos complementarios\n• Acceso a lanzamientos exclusivos\n• Programa de referidos\n• Soporte VIP\n\n¿Te interesa conocer productos complementarios?`,
          
          `🎯 **Maximiza tu inversión:**\n\n**Productos que complementan ${product.name}:**\n• Accesorios especializados\n• Extensiones de funcionalidad\n• Servicios premium\n\n**Descuento especial del 15% para clientes**\n\n¿Qué te gustaría explorar?`,
          
          `💎 **Cliente VIP:**\n\nTu satisfacción con ${product.name} te da acceso a:\n• Programa de lealtad\n• Ofertas exclusivas\n• Soporte prioritario\n• Eventos especiales\n\n¿Te gustaría recibir nuestras ofertas VIP?`
        ]
      }
    };

    // Update chatbot with complete AIDA flows
    await this.updateChatbot(chatbotId, {
      flow: aidaFlows
    });
  }
}

export const storage = new DatabaseStorage();
