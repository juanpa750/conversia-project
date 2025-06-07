import { eq, desc, and, gte, lte, lt } from "drizzle-orm";
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
  appointments,
  calendarSettings,
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
  type Appointment,
  type InsertAppointment,
  type CalendarSettings,
  type InsertCalendarSettings,
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

  // Calendar and appointments operations
  getAppointments(userId: string, date?: string): Promise<any[]>;
  createAppointment(appointment: any): Promise<any>;
  updateAppointment(id: number, data: any): Promise<any>;
  deleteAppointment(id: number): Promise<void>;
  getAvailableSlots(userId: string, date: string): Promise<string[]>;
  getCalendarSettings(userId: string): Promise<any>;
  updateCalendarSettings(userId: string, settings: any): Promise<any>;
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
    console.log('🗃️ STORAGE: Updating chatbot', id, 'with data:', data);
    
    // Si se está actualizando el objetivo, regenerar automáticamente el flujo
    if (data.conversationObjective) {
      const currentChatbot = await this.getChatbot(id);
      if (currentChatbot) {
        const newFlow = await this.generateFlowByObjective(data.conversationObjective, currentChatbot);
        data.flow = JSON.stringify(newFlow);
        console.log('🔄 AUTO-REGENERATED FLOW based on new objective:', data.conversationObjective);
      }
    }
    
    const [chatbot] = await db
      .update(chatbots)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(chatbots.id, id))
      .returning();
    
    console.log('🗃️ STORAGE: Updated chatbot result:', chatbot);
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
      ...(product.tags || []).map((tag: any) => tag.toLowerCase())
    ].filter(Boolean);

    // Generate AI instructions specific to this product
    const aiInstructions = `Eres un especialista en ventas de ${product.name}. Tu objetivo es ayudar a los clientes con información detallada y guiarlos hacia la compra.

PRODUCTO: ${product.name}
CATEGORÍA: ${product.category || 'General'}
PRECIO: ${product.price || 'Consultar'} ${product.currency || ''}

CARACTERÍSTICAS PRINCIPALES:
${extractedFeatures.map(f => `- ${f}`).join('\n')}

BENEFICIOS CLAVE:
${extractedBenefits.map(b => `- ${b}`).join('\n')}

ESPECIFICACIONES:
${technicalSpecs.map(s => `- ${s}`).join('\n')}

INSTRUCCIONES DE COMPORTAMIENTO:
1. Responde SIEMPRE como asistente especializado en este producto específico
2. Usa metodología AIDA: capta Atención, genera Interés, crea Deseo, motiva Acción
3. Mantén respuestas amigables pero profesionales
4. Enfócate en beneficios, no solo características
5. Guía hacia la compra de manera consultiva
6. Si preguntan por otros productos, redirige suavemente a este producto
7. Ofrece información de contacto para finalizar compra

PALABRAS CLAVE DE ACTIVACIÓN: ${triggerKeywords.join(', ')}`;

    // Generate intelligent flow with AI-driven responses (no user input required)
    let nodes = [
      {
        id: 'welcome',
        type: 'ai_message',
        position: { x: 100, y: 100 },
        data: {
          type: 'ai_message',
          text: `¡Hola! Soy tu especialista en ${product.name}. ${extractedFeatures.length > 0 ? `Destacado por ${extractedFeatures[0]}.` : ''} Te ayudaré con toda la información que necesites.`,
          isStart: true,
          aiResponse: true
        }
      },
      {
        id: 'product_intro',
        type: 'ai_message',
        position: { x: 100, y: 250 },
        data: {
          type: 'ai_message',
          text: `${product.name} es perfecto para quienes buscan ${extractedBenefits.slice(0, 2).join(' y ')}.`,
          aiResponse: true,
          delay: 2000
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
      productId: product.id,
      triggerKeywords,
      aiInstructions,
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
          variants: productVariants || [],
          // Configuración específica del producto
          linkedProductId: product.id,
          triggerKeywords: triggerKeywords,
          aiInstructions: aiInstructions,
          isProductSpecific: true
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

  // Genera flujos dinámicos basados en el objetivo de conversación
  async generateFlowByObjective(objective: string, chatbot: any): Promise<any> {
    const baseFlow = chatbot.flow ? JSON.parse(chatbot.flow) : { nodes: [], edges: [] };
    
    console.log(`🎯 Generating dynamic flow for objective: ${objective}`);
    
    // Obtener información del producto si está vinculado
    let product = null;
    if (chatbot.productId) {
      product = await this.getProduct(chatbot.productId);
    }

    switch (objective.toLowerCase()) {
      case 'ventas':
      case 'vender':
      case 'venta':
        return this.generateSalesFlow(product, chatbot);
      
      case 'soporte':
      case 'ayuda':
      case 'support':
        return this.generateSupportFlow(product, chatbot);
      
      case 'citas':
      case 'agendar':
      case 'reservar':
      case 'cita':
        return this.generateAppointmentFlow(product, chatbot);
      
      case 'información':
      case 'informacion':
      case 'info':
        return this.generateInformationFlow(product, chatbot);
      
      default:
        return this.generateGeneralFlow(objective, product, chatbot);
    }
  }

  private generateSalesFlow(product: any, chatbot: any) {
    const nodes = [
      {
        id: 'start',
        type: 'message',
        position: { x: 100, y: 100 },
        data: {
          type: 'message',
          text: `¡Hola! 👋 Soy tu especialista en ventas${product ? ` de ${product.name}` : ''}. Estoy aquí para ayudarte a encontrar la solución perfecta.`
        }
      },
      {
        id: 'qualify',
        type: 'question',
        position: { x: 300, y: 100 },
        data: {
          type: 'question',
          text: '¿Qué tipo de solución estás buscando?',
          responses: ['Ver productos', 'Consultar precios', 'Hablar con vendedor']
        }
      },
      {
        id: 'presentation',
        type: 'message',
        position: { x: 500, y: 100 },
        data: {
          type: 'message',
          text: product 
            ? `Te presento ${product.name}: ${product.description || 'Nuestra solución destacada'}`
            : 'Te presento nuestras mejores soluciones disponibles.'
        }
      },
      {
        id: 'objections',
        type: 'question',
        position: { x: 700, y: 100 },
        data: {
          type: 'question',
          text: '¿Tienes alguna duda o preocupación?',
          responses: ['Sobre el precio', 'Sobre características', 'Sobre garantía', 'Sin dudas']
        }
      },
      {
        id: 'close',
        type: 'action',
        position: { x: 900, y: 100 },
        data: {
          type: 'action',
          text: '¡Perfecto! ¿Estás listo para proceder con la compra?',
          actions: ['Comprar ahora', 'Más información', 'Contactar vendedor']
        }
      }
    ];

    const edges = [
      { id: 'e1', source: 'start', target: 'qualify' },
      { id: 'e2', source: 'qualify', target: 'presentation' },
      { id: 'e3', source: 'presentation', target: 'objections' },
      { id: 'e4', source: 'objections', target: 'close' }
    ];

    return { nodes, edges, objective: 'ventas', productContext: product };
  }

  private generateAppointmentFlow(product: any, chatbot: any) {
    const nodes = [
      {
        id: 'start',
        type: 'message',
        position: { x: 100, y: 100 },
        data: {
          type: 'message',
          text: `¡Hola! 👋 Soy tu asistente de citas${product ? ` para ${product.name}` : ''}. Te ayudo a agendar tu cita de manera rápida y sencilla.`
        }
      },
      {
        id: 'service-type',
        type: 'question',
        position: { x: 300, y: 100 },
        data: {
          type: 'question',
          text: '¿Qué tipo de servicio necesitas?',
          responses: ['Consulta inicial', 'Seguimiento', 'Urgente', 'Información general']
        }
      },
      {
        id: 'date-selection',
        type: 'calendar',
        position: { x: 500, y: 100 },
        data: {
          type: 'calendar',
          text: 'Selecciona tu fecha preferida:',
          availableDates: this.getAvailableDates(),
          timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
        }
      },
      {
        id: 'contact-info',
        type: 'form',
        position: { x: 700, y: 100 },
        data: {
          type: 'form',
          text: 'Para confirmar tu cita, necesito tus datos:',
          fields: [
            { name: 'name', label: 'Nombre completo', required: true },
            { name: 'phone', label: 'Teléfono', required: true },
            { name: 'email', label: 'Email', required: false }
          ]
        }
      },
      {
        id: 'confirmation',
        type: 'action',
        position: { x: 900, y: 100 },
        data: {
          type: 'action',
          text: '¡Cita confirmada! Te enviaremos un recordatorio por WhatsApp.',
          actions: ['Confirmar cita', 'Modificar horario', 'Cancelar']
        }
      }
    ];

    const edges = [
      { id: 'e1', source: 'start', target: 'service-type' },
      { id: 'e2', source: 'service-type', target: 'date-selection' },
      { id: 'e3', source: 'date-selection', target: 'contact-info' },
      { id: 'e4', source: 'contact-info', target: 'confirmation' }
    ];

    return { 
      nodes, 
      edges, 
      objective: 'citas', 
      productContext: product,
      calendarConfig: {
        workingHours: { start: '09:00', end: '17:00' },
        workingDays: [1, 2, 3, 4, 5], // Lunes a Viernes
        duration: 60, // minutos
        buffer: 15 // minutos entre citas
      }
    };
  }

  private generateSupportFlow(product: any, chatbot: any) {
    const nodes = [
      {
        id: 'start',
        type: 'message',
        position: { x: 100, y: 100 },
        data: {
          type: 'message',
          text: `¡Hola! 👋 Soy tu asistente de soporte${product ? ` para ${product.name}` : ''}. ¿En qué puedo ayudarte hoy?`
        }
      },
      {
        id: 'issue-type',
        type: 'question',
        position: { x: 300, y: 100 },
        data: {
          type: 'question',
          text: '¿Qué tipo de problema tienes?',
          responses: ['Problema técnico', 'Consulta de uso', 'Garantía', 'Devolución', 'Otro']
        }
      },
      {
        id: 'diagnosis',
        type: 'message',
        position: { x: 500, y: 100 },
        data: {
          type: 'message',
          text: 'Entiendo tu situación. Déjame ayudarte a resolver este problema paso a paso.'
        }
      },
      {
        id: 'solution',
        type: 'action',
        position: { x: 700, y: 100 },
        data: {
          type: 'action',
          text: '¿Esta solución resolvió tu problema?',
          actions: ['Sí, resuelto', 'Necesito más ayuda', 'Hablar con técnico']
        }
      }
    ];

    const edges = [
      { id: 'e1', source: 'start', target: 'issue-type' },
      { id: 'e2', source: 'issue-type', target: 'diagnosis' },
      { id: 'e3', source: 'diagnosis', target: 'solution' }
    ];

    return { nodes, edges, objective: 'soporte', productContext: product };
  }

  private generateInformationFlow(product: any, chatbot: any) {
    const nodes = [
      {
        id: 'start',
        type: 'message',
        position: { x: 100, y: 100 },
        data: {
          type: 'message',
          text: `¡Hola! 👋 Soy tu asistente de información${product ? ` sobre ${product.name}` : ''}. Te ayudo a encontrar lo que necesitas.`
        }
      },
      {
        id: 'info-menu',
        type: 'question',
        position: { x: 300, y: 100 },
        data: {
          type: 'question',
          text: '¿Qué información necesitas?',
          responses: ['Características', 'Especificaciones', 'Precios', 'Disponibilidad', 'Comparar productos']
        }
      }
    ];

    const edges = [
      { id: 'e1', source: 'start', target: 'info-menu' }
    ];

    return { nodes, edges, objective: 'información', productContext: product };
  }

  private generateGeneralFlow(objective: string, product: any, chatbot: any) {
    const nodes = [
      {
        id: 'start',
        type: 'message',
        position: { x: 100, y: 100 },
        data: {
          type: 'message',
          text: `¡Hola! 👋 Soy tu asistente virtual enfocado en: ${objective}. ¿Cómo puedo ayudarte?`
        }
      },
      {
        id: 'custom-goal',
        type: 'question',
        position: { x: 300, y: 100 },
        data: {
          type: 'question',
          text: `Para cumplir con el objetivo: "${objective}", ¿qué necesitas específicamente?`,
          responses: ['Más información', 'Consulta personalizada', 'Hablar con experto']
        }
      }
    ];

    const edges = [
      { id: 'e1', source: 'start', target: 'custom-goal' }
    ];

    return { nodes, edges, objective: objective, productContext: product };
  }

  private getAvailableDates(): string[] {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Solo días laborables
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  }

  // Calendar and appointments operations implementation
  async getAppointments(userId: string, date?: string): Promise<Appointment[]> {
    console.log('📅 DEBUG - getAppointments called with userId:', userId, 'date filter:', date);
    
    let query = db.select().from(appointments).where(eq(appointments.userId, userId));
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      console.log('📅 DEBUG - Date filter range:', startDate.toISOString(), 'to', endDate.toISOString());
      
      query = db.select().from(appointments).where(and(
        eq(appointments.userId, userId),
        gte(appointments.scheduledDate, startDate),
        lt(appointments.scheduledDate, endDate)
      ));
    }
    
    const result = await query.orderBy(appointments.scheduledDate);
    console.log('📅 DEBUG - Query returned appointments:', result.length);
    
    if (!date) {
      // Solo para el llamado sin filtro de fecha, mostrar todas las citas
      console.log('📅 DEBUG - ALL appointments for user:', JSON.stringify(result.map(apt => ({
        id: apt.id,
        clientName: apt.clientName,
        scheduledDate: apt.scheduledDate,
        localTime: new Date(apt.scheduledDate).toLocaleString(),
        status: apt.status
      })), null, 2));
    }
    
    return result;
  }

  async getAppointmentById(appointmentId: number): Promise<Appointment | undefined> {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId));
    return appointment;
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(appointmentData)
      .returning();

    console.log('📅 Created appointment:', appointment);

    // Send WhatsApp confirmation
    try {
      await this.sendAppointmentConfirmation(appointment);
    } catch (error) {
      console.error('Error sending WhatsApp confirmation:', error);
    }

    return appointment;
  }

  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();

    console.log('📅 Updated appointment:', appointment);
    return appointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
    console.log('📅 Deleted appointment:', id);
  }

  async updateAppointmentConfirmation(id: number, confirmed: boolean): Promise<void> {
    await db
      .update(appointments)
      .set({ confirmationSent: confirmed, updatedAt: new Date() })
      .where(eq(appointments.id, id));
    console.log('📅 Updated confirmation status for appointment:', id, 'to:', confirmed);
  }

  async getAvailableSlots(userId: string, date: string): Promise<any[]> {
    const settings = await this.getCalendarSettings(userId);
    const workingHours = settings.workingHours;
    const slotDuration = settings.appointmentDuration || 60; // Usar appointmentDuration como slotDuration
    const buffer = settings.bufferTime || 0;

    // Generar todos los slots posibles
    const slots = [];
    const startHour = parseInt(workingHours.start.split(':')[0]);
    const startMinute = parseInt(workingHours.start.split(':')[1] || '0');
    const endHour = parseInt(workingHours.end.split(':')[0]);
    const endMinute = parseInt(workingHours.end.split(':')[1] || '0');

    // Convertir a minutos para facilitar cálculos
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Generar slots cada 30 minutos
    for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += 30) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeStr);
    }

    // Obtener citas existentes para la fecha
    const existingAppointments = await this.getAppointments(userId, date);
    console.log('📅 DEBUG - Processing appointments for date:', date);
    console.log('📅 DEBUG - Found appointments:', existingAppointments.length);
    console.log('📅 DEBUG - Raw appointments data:', JSON.stringify(existingAppointments, null, 2));
    
    // Calcular slots ocupados considerando duración y buffer
    const occupiedSlots = new Set<string>();
    
    existingAppointments.forEach((appointment, index) => {
      if (appointment.status === 'cancelled') {
        console.log(`📅 DEBUG - Appointment ${index}: CANCELLED - ignoring`);
        return; // Ignorar citas canceladas
      }
      
      const appointmentDate = new Date(appointment.scheduledDate);
      const appointmentDuration = appointment.duration || slotDuration;
      
      console.log(`📅 DEBUG - Appointment ${index}:`, {
        scheduledDate: appointment.scheduledDate,
        duration: appointmentDuration,
        status: appointment.status,
        clientName: appointment.clientName
      });
      
      // Hora exacta de la cita
      const appointmentHour = appointmentDate.getHours();
      const appointmentMinute = appointmentDate.getMinutes();
      const appointmentTimeStr = `${appointmentHour.toString().padStart(2, '0')}:${appointmentMinute.toString().padStart(2, '0')}`;
      
      console.log(`📅 DEBUG - Appointment ${index} time:`, appointmentTimeStr);
      
      // Para la visualización del calendario, solo marcar el slot exacto de la cita
      // La duración y buffer se aplicarán al crear nuevas citas, no en la visualización
      occupiedSlots.add(appointmentTimeStr);
      console.log(`📅 DEBUG - Added occupied slot:`, appointmentTimeStr);
    });

    const occupiedArray = Array.from(occupiedSlots);
    console.log('📅 Occupied slots for date', date, ':', occupiedArray);
    console.log('📅 DEBUG - All generated slots:', slots);
    console.log('📅 DEBUG - Occupied slots set:', occupiedArray);
    
    // Devolver todos los slots con información de estado
    const slotsWithStatus = slots.map(slot => ({
      time: slot,
      available: !occupiedSlots.has(slot),
      occupied: occupiedSlots.has(slot)
    }));
    
    console.log('📅 Returning', slotsWithStatus.length, 'slots with status information');
    console.log('📅 Available slots:', slotsWithStatus.filter(s => s.available).length);
    console.log('📅 Occupied slots:', slotsWithStatus.filter(s => s.occupied).length);
    console.log('📅 DEBUG - Sample slots with status:', slotsWithStatus.slice(0, 5));
    
    // Debug: Show specific examples of occupied vs available slots
    const exampleOccupied = slotsWithStatus.filter(s => s.occupied).slice(0, 3);
    const exampleAvailable = slotsWithStatus.filter(s => s.available).slice(0, 3);
    console.log('📅 DEBUG - Example OCCUPIED slots:', exampleOccupied);
    console.log('📅 DEBUG - Example AVAILABLE slots:', exampleAvailable);
    
    return slotsWithStatus;
  }

  async getCalendarSettings(userId: string): Promise<CalendarSettings> {
    const [settings] = await db
      .select()
      .from(calendarSettings)
      .where(eq(calendarSettings.userId, userId));
    
    if (!settings) {
      const defaultSettings = {
        userId,
        workingHours: { start: "09:00", end: "17:00" },
        workingDays: [1, 2, 3, 4, 5],
        appointmentDuration: 60,
        bufferTime: 15,
        advanceBookingDays: 30,
        timezone: 'America/Mexico_City',
        autoConfirm: false,
        reminderSettings: { enabled: true, beforeHours: [24, 2], whatsapp: true, email: true },
        whatsappNotifications: {
          enabled: true,
          confirmationTemplate: "✅ *Confirmación de Cita*\\n\\nHola {clientName},\\n\\nTu cita ha sido *confirmada* para:\\n📅 *Fecha:* {date}\\n🕐 *Hora:* {time}\\n🔧 *Servicio:* {service}\\n⏱️ *Duración:* {duration} minutos\\n\\nGracias por confiar en {companyName}.\\n\\n_Mensaje automático - No responder_",
          reminderTemplate: "🔔 *Recordatorio de Cita*\\n\\nHola {clientName},\\n\\nTe recordamos tu cita programada para *mañana*:\\n📅 *Fecha:* {date}\\n🕐 *Hora:* {time}\\n🔧 *Servicio:* {service}\\n⏱️ *Duración:* {duration} minutos\\n\\nNos vemos mañana en {companyName}.\\n\\n_Mensaje automático - No responder_",
          cancellationTemplate: "❌ *Cita Cancelada*\\n\\nHola {clientName},\\n\\nLamentamos informarte que tu cita del *{date} a las {time}* ha sido cancelada.\\n\\n📞 Si necesitas reprogramar, no dudes en contactarnos.\\n\\nDisculpa las molestias.\\n\\nSaludos,\\n{companyName}"
        },
        emailNotifications: {
          enabled: true,
          confirmationTemplate: "Estimado/a {clientName},\\n\\nSu cita ha sido confirmada para el {date} a las {time}.\\n\\nDetalles:\\n- Servicio: {service}\\n- Duración: {duration} minutos\\n\\nGracias por su confianza.\\n\\nSaludos cordiales,\\n{companyName}",
          reminderTemplate: "Estimado/a {clientName},\\n\\nLe recordamos su cita programada para mañana {date} a las {time}.\\n\\nDetalles:\\n- Servicio: {service}\\n- Duración: {duration} minutos\\n\\nSaludos cordiales,\\n{companyName}"
        }
      };
      
      const [newSettings] = await db
        .insert(calendarSettings)
        .values(defaultSettings)
        .returning();
      return newSettings;
    }
    
    return settings;
  }

  async updateCalendarSettings(userId: string, settings: Partial<CalendarSettings>): Promise<CalendarSettings> {
    const [updatedSettings] = await db
      .update(calendarSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(calendarSettings.userId, userId))
      .returning();

    console.log('📅 Updated calendar settings for user:', userId);
    return updatedSettings;
  }

  private async sendAppointmentConfirmation(appointment: Appointment) {
    try {
      const settings = await this.getCalendarSettings(appointment.userId);
      const whatsappConfig = settings.whatsappNotifications as any;
      
      if (!whatsappConfig?.enabled) {
        console.log('📱 WhatsApp notifications disabled for user');
        return;
      }

      const templateData = {
        clientName: appointment.clientName || 'Cliente',
        date: appointment.scheduledDate.toLocaleDateString('es-ES'),
        time: appointment.scheduledDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        service: appointment.service || 'Consulta',
        duration: appointment.duration?.toString() || '60',
        companyName: 'Tu Empresa'
      };

      let message = whatsappConfig.confirmationTemplate || 
        "✅ *Confirmación de Cita*\\n\\nHola {clientName},\\n\\nTu cita ha sido *confirmada* para:\\n📅 *Fecha:* {date}\\n🕐 *Hora:* {time}\\n🔧 *Servicio:* {service}\\n⏱️ *Duración:* {duration} minutos\\n\\nGracias por confiar en {companyName}.\\n\\n_Mensaje automático - No responder_";
      
      Object.entries(templateData).forEach(([key, value]) => {
        message = message.replace(new RegExp(`{${key}}`, 'g'), value);
      });

      console.log(`📱 WhatsApp confirmación enviada a ${appointment.clientPhone}: ${message.replace(/\\n/g, '\n')}`);
      
      // Mark confirmation as sent
      await this.updateAppointment(appointment.id, { confirmationSent: true });
    } catch (error) {
      console.error('Error sending WhatsApp confirmation:', error);
    }
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
