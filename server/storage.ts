import { users, whatsappConnections, type User, type WhatsappConnection } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export interface ISimpleStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;

  // WhatsApp connection operations
  getWhatsappConnection(userId: string): Promise<WhatsappConnection | undefined>;
  createWhatsappConnection(connection: any): Promise<WhatsappConnection>;
  updateWhatsappConnection(userId: string, updates: any): Promise<WhatsappConnection>;
  
  // Data operations
  getChatbots(userId: string): Promise<any[]>;
  createChatbot(chatbot: any): Promise<any>;
  getChatbot(id: number): Promise<any>;
  updateChatbot(id: number, updates: any): Promise<any>;
  deleteChatbot(id: number): Promise<void>;
  getProducts(userId: string): Promise<any[]>;
  getUserProducts(userId: string): Promise<any[]>;
  getProduct(id: number): Promise<any>;
  updateProduct(id: number, updates: any): Promise<any>;
  getAppointments(userId: string): Promise<any[]>;
}

export class SimpleStorage implements ISimpleStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id || `user_${Date.now()}`,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'user'
      })
      .returning();
    return user;
  }

  async getWhatsappConnection(userId: string): Promise<WhatsappConnection | undefined> {
    const [connection] = await db
      .select()
      .from(whatsappConnections)
      .where(eq(whatsappConnections.userId, userId));
    return connection;
  }

  async createWhatsappConnection(connectionData: any): Promise<WhatsappConnection> {
    const [connection] = await db
      .insert(whatsappConnections)
      .values(connectionData)
      .returning();
    return connection;
  }

  async updateWhatsappConnection(userId: string, updates: any): Promise<WhatsappConnection> {
    const [connection] = await db
      .update(whatsappConnections)
      .set(updates)
      .where(eq(whatsappConnections.userId, userId))
      .returning();
    return connection;
  }

  async getChatbots(userId: string): Promise<any[]> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM chatbots WHERE user_id = ${userId} ORDER BY created_at DESC`
      );
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      return [];
    }
  }

  async createChatbot(chatbotData: any): Promise<any> {
    try {
      const triggerKeywordsArray = chatbotData.triggerKeywords ? 
        chatbotData.triggerKeywords.split(',').map((k: string) => k.trim()) : [];
      
      const result = await db.execute(sql`
        INSERT INTO chatbots (
          user_id, name, description, product_id, trigger_keywords,
          ai_instructions, ai_personality, conversation_objective, 
          status, type, created_at, updated_at
        ) VALUES (
          ${chatbotData.userId}, 
          ${chatbotData.name}, 
          ${chatbotData.description}, 
          ${chatbotData.productId || null},
          ${triggerKeywordsArray},
          ${chatbotData.aiInstructions || ''},
          ${chatbotData.aiPersonality || ''},
          ${chatbotData.conversationObjective || ''},
          'active',
          'sales',
          NOW(), 
          NOW()
        ) RETURNING *
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating chatbot:', error);
      throw error;
    }
  }

  async getChatbot(id: number): Promise<any> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM chatbots WHERE id = ${id}`
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching chatbot:', error);
      return null;
    }
  }

  async updateChatbot(id: number, updates: any): Promise<any> {
    try {
      const result = await db.execute(sql`
        UPDATE chatbots 
        SET 
          name = COALESCE(${updates.name}, name),
          description = COALESCE(${updates.description}, description),
          type = COALESCE(${updates.type}, type),
          status = COALESCE(${updates.status}, status),
          flow = COALESCE(${updates.flow ? (typeof updates.flow === 'string' ? updates.flow : JSON.stringify(updates.flow)) : null}, flow),
          ai_instructions = COALESCE(${updates.aiInstructions}, ai_instructions),
          ai_personality = COALESCE(${updates.aiPersonality}, ai_personality),
          conversation_objective = COALESCE(${updates.conversationObjective}, conversation_objective),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating chatbot:', error);
      throw error;
    }
  }

  async deleteChatbot(id: number): Promise<void> {
    try {
      await db.execute(sql`DELETE FROM chatbots WHERE id = ${id}`);
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      throw error;
    }
  }

  async getProducts(userId: string): Promise<any[]> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM products WHERE user_id = ${userId} ORDER BY created_at DESC`
      );
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getUserProducts(userId: string): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          id, user_id, name, description, price, currency, category, 
          product_image, images, features, specifications, availability, 
          stock, sku, tags, free_shipping, cash_on_delivery,
          ai_instructions, conversation_objective, ai_personality, trigger_keywords,
          created_at, updated_at
        FROM products 
        WHERE user_id = ${userId} AND availability = true 
        ORDER BY created_at DESC
      `);
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching user products:', error);
      return [];
    }
  }

  async getProduct(id: number): Promise<any> {
    try {
      const result = await db.execute(sql`
        SELECT 
          id, user_id, name, description, price, currency, category, 
          product_image, images, features, specifications, availability, 
          stock, sku, tags, free_shipping, cash_on_delivery,
          ai_instructions, conversation_objective, ai_personality, trigger_keywords,
          created_at, updated_at
        FROM products 
        WHERE id = ${id}
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async updateProduct(id: number, updates: any): Promise<any> {
    try {
      const result = await db.execute(sql`
        UPDATE products 
        SET 
          name = COALESCE(${updates.name}, name),
          description = COALESCE(${updates.description}, description),
          price = COALESCE(${updates.price}, price),
          category = COALESCE(${updates.category}, category),
          ai_instructions = COALESCE(${updates.aiInstructions}, ai_instructions),
          conversation_objective = COALESCE(${updates.conversationObjective}, conversation_objective),
          ai_personality = COALESCE(${updates.aiPersonality}, ai_personality),
          trigger_keywords = COALESCE(${updates.triggerKeywords ? JSON.stringify(updates.triggerKeywords) : null}, trigger_keywords),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async getAppointments(userId: string): Promise<any[]> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM appointments WHERE user_id = ${userId} ORDER BY scheduled_date DESC`
      );
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }
}

export const simpleStorage = new SimpleStorage();
export const storage = simpleStorage;