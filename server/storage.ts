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
}

export const storage = new DatabaseStorage();
