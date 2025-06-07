import { db } from "./db";
import { users, whatsappConnections } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { User, WhatsappConnection } from "@shared/schema";

export interface ISimpleStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;

  // WhatsApp connection operations
  getWhatsappConnection(userId: string): Promise<WhatsappConnection | undefined>;
  createWhatsappConnection(connection: any): Promise<WhatsappConnection>;
  updateWhatsappConnection(userId: string, updates: any): Promise<WhatsappConnection>;
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
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const [user] = await db.insert(users).values(userData).returning();
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
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(whatsappConnections.userId, userId))
      .returning();
    return connection;
  }
}

export const simpleStorage = new SimpleStorage();