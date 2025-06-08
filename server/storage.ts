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
  getProducts(userId: string): Promise<any[]>;
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