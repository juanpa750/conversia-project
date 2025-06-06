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

    // Generate intelligent chatbot configuration
    const chatbotData: InsertChatbot = {
      userId,
      name: `Especialista en ${product.name}`,
      description: `Asistente virtual especializado en ${product.name} con conocimiento profundo del producto y metodología AIDA para ventas consultivas.`,
      type: 'sales' as any,
      status: 'active' as any,
      flow: JSON.stringify({
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
          availability: product.availability,
          freeShipping: product.freeShipping,
          cashOnDelivery: product.cashOnDelivery
        },
        aidaFlow: {
          attention: {
            triggers: ['precio', 'información', 'detalles', 'disponible'],
            message: `¡Excelente elección! ${product.name} es destacado ${extractedFeatures.length > 0 ? `por ${extractedFeatures[0]}` : 'en su categoría'}. ¿Sabías que tiene características únicas?`
          },
          interest: {
            triggers: ['características', 'funciones', 'especificaciones'],
            message: `${product.name} incluye: ${extractedFeatures.slice(0, 3).join(', ')}. ¿Te gustaría conocer cómo te benefician?`
          },
          desire: {
            triggers: ['beneficios', 'ventajas', 'resultados'],
            message: `Los clientes destacan: ${extractedBenefits.slice(0, 2).join(' y ')}. Imagina cómo puede transformar tu experiencia.`
          },
          action: {
            triggers: ['comprar', 'precio', 'pedido'],
            message: `${product.name} está disponible${product.price ? ` por ${product.price} ${product.currency || ''}` : ''}. ${product.freeShipping ? 'Con envío gratuito. ' : ''}¿Proceder con el pedido?`
          }
        },
        responses: {
          welcome: `¡Hola! Soy tu especialista en ${product.name}. ${extractedFeatures.length > 0 ? `Reconocido por ${extractedFeatures[0]}.` : ''} ¿Qué te gustaría saber?`,
          technical: `Especificaciones de ${product.name}: ${technicalSpecs.slice(0, 3).join(', ')}. ¿Necesitas más detalles técnicos?`,
          comparison: `${product.name} se distingue ${competitiveAdvantages.length > 0 ? `por ser ${competitiveAdvantages.slice(0, 2).join(' y ')}` : 'por su calidad superior'}. ¿Comparamos con otras opciones?`,
          purchase: `Para ${product.name}: ${product.price ? `Precio ${product.price} ${product.currency || ''}` : 'Precio especial disponible'}. ${product.freeShipping ? 'Envío gratuito. ' : ''}${product.cashOnDelivery === 'yes' ? 'Pago contra entrega disponible.' : ''}`
        }
      })
    };

    const chatbot = await this.createChatbot(chatbotData);
    await this.updateProduct(productId, { chatbotId: chatbot.id });

    // Create intelligent keyword triggers
    const intelligentKeywords = [
      product.name.toLowerCase(),
      ...(product.tags || []).map(tag => tag.toLowerCase()),
      product.category?.toLowerCase(),
      ...extractedFeatures.flatMap(f => f.split(' ').filter(w => w.length > 3).slice(0, 2)),
      ...extractedBenefits.flatMap(b => b.split(' ').filter(w => w.length > 3).slice(0, 2))
    ].filter(Boolean).slice(0, 20);

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
      triggerPhrases: advancedPhrases,
      isActive: true,
      responseTemplate: this.generateAdvancedTemplate(product, extractedFeatures, extractedBenefits),
    });

    // Create comprehensive AI configuration
    await this.createProductAiConfig({
      productId: product.id,
      chatbotId: chatbot.id,
      aiPersonality: 'expert_consultant',
      responseStyle: 'detailed_helpful',
      salesApproach: 'aida_methodology',
      knowledgeBase: JSON.stringify({
        features: extractedFeatures,
        benefits: extractedBenefits,
        specifications: technicalSpecs,
        advantages: competitiveAdvantages,
        audience: targetAudience
      }),
      customPrompts: JSON.stringify({
        system: `Experto en ${product.name} con metodología AIDA consultiva`,
        features: `Características: ${extractedFeatures.join(', ')}`,
        benefits: `Beneficios: ${extractedBenefits.join(', ')}`,
        technical: `Especificaciones: ${technicalSpecs.join(', ')}`,
        sales: `Guía usando AIDA con información específica del producto`
      })
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
    
    return [...new Set(features)].slice(0, 10);
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
    
    return [...new Set(benefits)].slice(0, 8);
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
    
    return [...new Set(specs)].slice(0, 12);
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
    
    return [...new Set(advantages)];
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
    
    return [...new Set(audiences)].slice(0, 5);
  }

  private generateAdvancedTemplate(product: any, features: string[], benefits: string[]): string {
    return `
🎯 **${product.name}** - Solución inteligente

✨ **Características:**
${features.slice(0, 3).map(f => `• ${f}`).join('\n')}

🌟 **Beneficios:**
${benefits.slice(0, 2).map(b => `• ${b}`).join('\n')}

💰 **Información:**
${product.price ? `Precio: ${product.price} ${product.currency || ''}` : 'Precio especial'}
${product.freeShipping ? '🚚 Envío gratuito' : ''}
${product.cashOnDelivery === 'yes' ? '💳 Pago contra entrega' : ''}

¿Más detalles o proceder con pedido?
    `.trim();
  }
}

export const storage = new DatabaseStorage();
