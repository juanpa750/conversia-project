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
  
  // WhatsApp integration operations
  getWhatsappIntegrations(userId: string): Promise<any[]>;
  getWhatsappIntegrationByChatbot(chatbotId: number, userId: string): Promise<any>;
  getWhatsappIntegrationById(id: number): Promise<any>;
  createWhatsappIntegration(integration: any): Promise<any>;
  deleteWhatsappIntegration(id: number): Promise<void>;
  
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
      
      console.log('🗄️ Raw database result for getChatbots:', JSON.stringify(result.rows?.[0], null, 2));
      
      // Map snake_case columns to camelCase for JavaScript compatibility
      return (result.rows || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        productId: row.product_id,
        triggerKeywords: row.trigger_keywords,
        aiInstructions: row.ai_instructions,
        aiPersonality: row.ai_personality,
        conversationObjective: row.conversation_objective,
        status: row.status,
        type: row.type,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      return [];
    }
  }

  async createChatbot(chatbotData: any): Promise<any> {
    try {
      // Convert trigger keywords to a simple comma-separated string instead of array
      const triggerKeywordsString = chatbotData.triggerKeywords || '';
      
      const result = await db.execute(sql`
        INSERT INTO chatbots (
          user_id, name, description, product_id,
          ai_instructions, ai_personality, conversation_objective, 
          status, type, created_at, updated_at
        ) VALUES (
          ${chatbotData.userId}, 
          ${chatbotData.name}, 
          ${chatbotData.description}, 
          ${chatbotData.productId || null},
          ${chatbotData.aiInstructions || ''},
          ${chatbotData.aiPersonality || ''},
          ${chatbotData.conversationObjective || ''},
          'active',
          'sales',
          NOW(), 
          NOW()
        ) RETURNING *
      `);
      
      // Update trigger_keywords separately using a direct SQL approach
      const chatbot = result.rows[0];
      if (triggerKeywordsString && chatbot.id) {
        const keywordsArray = triggerKeywordsString.split(',').map((k: string) => k.trim());
        await db.execute(sql`
          UPDATE chatbots 
          SET trigger_keywords = ${keywordsArray} 
          WHERE id = ${chatbot.id}
        `);
      }
      
      return chatbot;
    } catch (error) {
      console.error('Error creating chatbot:', error);
      throw error;
    }
  }

  async getChatbot(id: number): Promise<any> {
    try {
      const result = await db.execute(
        sql`SELECT c.*, p.name as product_name, p.description as product_description 
            FROM chatbots c 
            LEFT JOIN products p ON c.product_id = p.id 
            WHERE c.id = ${id}`
      );
      
      console.log('🗄️ Raw chatbot result:', JSON.stringify(result.rows?.[0], null, 2));
      
      if (!result.rows || result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        productId: row.product_id,
        triggerKeywords: row.trigger_keywords,
        aiInstructions: row.ai_instructions,
        aiPersonality: row.ai_personality,
        conversationObjective: row.conversation_objective,
        status: row.status,
        type: row.type,
        flow: row.flow,
        objective: row.objective,
        productName: row.product_name,
        productDescription: row.product_description,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
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
        sql`SELECT p.*, c.id as chatbot_id, c.name as chatbot_name 
            FROM products p 
            LEFT JOIN chatbots c ON p.id = c.product_id 
            WHERE p.user_id = ${userId} 
            ORDER BY p.created_at DESC`
      );
      
      return (result.rows || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        price: row.price,
        currency: row.currency,
        category: row.category,
        productImage: row.product_image,
        images: row.images,
        features: row.features,
        specifications: row.specifications,
        availability: row.availability,
        stock: row.stock,
        sku: row.sku,
        tags: row.tags,
        freeShipping: row.free_shipping,
        cashOnDelivery: row.cash_on_delivery,
        aiInstructions: row.ai_instructions,
        conversationObjective: row.conversation_objective,
        aiPersonality: row.ai_personality,
        triggerKeywords: row.trigger_keywords,
        chatbotId: row.chatbot_id,
        chatbotName: row.chatbot_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
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

  // WhatsApp Integration methods
  async getWhatsappIntegrations(userId: string): Promise<any[]> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM whatsapp_integrations WHERE user_id = ${userId} ORDER BY created_at DESC`
      );
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching WhatsApp integrations:', error);
      return [];
    }
  }

  async getWhatsappIntegrationByChatbot(chatbotId: number, userId: string): Promise<any> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM whatsapp_integrations WHERE chatbot_id = ${chatbotId} AND user_id = ${userId}`
      );
      const row = result.rows?.[0];
      if (!row) return null;
      
      // Map database fields to expected interface
      return {
        id: row.id,
        phoneNumber: row.phone_number,
        displayName: row.display_name,
        businessDescription: row.business_description,
        status: row.status,
        isActive: row.is_active,
        chatbotId: row.chatbot_id,
        productId: row.product_id,
        priority: row.priority,
        autoRespond: row.auto_respond,
        operatingHours: (() => {
          try {
            if (typeof row.operating_hours === 'string') {
              return JSON.parse(row.operating_hours);
            }
            return row.operating_hours || {};
          } catch (e) {
            return {};
          }
        })(),
        createdAt: row.created_at,
        user_id: row.user_id
      };
    } catch (error) {
      console.error('Error fetching WhatsApp integration by chatbot:', error);
      return null;
    }
  }

  async getWhatsappIntegrationById(id: number): Promise<any> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM whatsapp_integrations WHERE id = ${id}`
      );
      const row = result.rows?.[0];
      if (!row) return null;
      
      // Map database fields to expected interface
      return {
        id: row.id,
        phoneNumber: row.phone_number,
        displayName: row.display_name,
        businessDescription: row.business_description,
        status: row.status,
        isActive: row.is_active,
        chatbotId: row.chatbot_id,
        productId: row.product_id,
        priority: row.priority,
        autoRespond: row.auto_respond,
        operatingHours: (() => {
          try {
            if (typeof row.operating_hours === 'string') {
              return JSON.parse(row.operating_hours);
            }
            return row.operating_hours || {};
          } catch (e) {
            return {};
          }
        })(),
        createdAt: row.created_at,
        user_id: row.user_id
      };
    } catch (error) {
      console.error('Error fetching WhatsApp integration by ID:', error);
      return null;
    }
  }

  async createWhatsappIntegration(integration: any): Promise<any> {
    try {
      const result = await db.execute(sql`
        INSERT INTO whatsapp_integrations (
          user_id, phone_number, display_name, business_description,
          chatbot_id, product_id, priority, auto_respond, operating_hours,
          status, is_active, created_at, updated_at
        ) VALUES (
          ${integration.userId},
          ${integration.phoneNumber},
          ${integration.displayName},
          ${integration.businessDescription},
          ${integration.chatbotId},
          ${integration.productId},
          ${integration.priority},
          ${integration.autoRespond},
          ${integration.operatingHours ? JSON.stringify(integration.operatingHours) : null},
          ${integration.status},
          ${integration.isActive},
          NOW(),
          NOW()
        )
        RETURNING *
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating WhatsApp integration:', error);
      throw error;
    }
  }

  async deleteWhatsappIntegration(id: number): Promise<void> {
    try {
      await db.execute(
        sql`DELETE FROM whatsapp_integrations WHERE id = ${id}`
      );
    } catch (error) {
      console.error('Error deleting WhatsApp integration:', error);
      throw error;
    }
  }

  async updateWhatsappIntegrationStatus(id: number, status: string): Promise<void> {
    try {
      await db.execute(
        sql`UPDATE whatsapp_integrations SET status = ${status}, updated_at = NOW() WHERE id = ${id}`
      );
    } catch (error) {
      console.error('Error updating WhatsApp integration status:', error);
      throw error;
    }
  }

  async updateWhatsappIntegrationPhone(id: number, phoneNumber: string): Promise<void> {
    try {
      await db.execute(
        sql`UPDATE whatsapp_integrations SET phone_number = ${phoneNumber}, updated_at = NOW() WHERE id = ${id}`
      );
    } catch (error) {
      console.error('Error updating WhatsApp integration phone:', error);
      throw error;
    }
  }
}

export const simpleStorage = new SimpleStorage();
export const storage = simpleStorage;