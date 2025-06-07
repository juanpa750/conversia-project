import { db } from "./db";
import { users, whatsappConnections, businessProducts, businessServices, appointments, whatsappMessages } from "@shared/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { 
  User, 
  InsertUser, 
  WhatsappConnection, 
  InsertWhatsappConnection,
  BusinessProduct,
  InsertBusinessProduct,
  BusinessService,
  InsertBusinessService,
  Appointment,
  InsertAppointment,
  WhatsappMessage,
  InsertWhatsappMessage
} from "@shared/schema";

export interface IUnifiedStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // WhatsApp connection operations
  getWhatsappConnection(userId: string): Promise<WhatsappConnection | undefined>;
  createWhatsappConnection(connection: InsertWhatsappConnection): Promise<WhatsappConnection>;
  updateWhatsappConnection(userId: string, updates: Partial<WhatsappConnection>): Promise<WhatsappConnection>;

  // Business products operations
  getBusinessProducts(userId: string): Promise<BusinessProduct[]>;
  createBusinessProduct(product: InsertBusinessProduct): Promise<BusinessProduct>;
  updateBusinessProduct(id: number, updates: Partial<BusinessProduct>): Promise<BusinessProduct>;
  deleteBusinessProduct(id: number): Promise<void>;

  // Business services operations
  getBusinessServices(userId: string): Promise<BusinessService[]>;
  createBusinessService(service: InsertBusinessService): Promise<BusinessService>;
  updateBusinessService(id: number, updates: Partial<BusinessService>): Promise<BusinessService>;
  deleteBusinessService(id: number): Promise<void>;

  // Appointments operations
  getAppointments(userId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
  getAvailableSlots(userId: string, date: string): Promise<any[]>;

  // WhatsApp messages operations
  getWhatsappMessages(userId: string, limit?: number): Promise<WhatsappMessage[]>;
  createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage>;
}

export class UnifiedStorage implements IUnifiedStorage {
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
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // WhatsApp connection operations
  async getWhatsappConnection(userId: string): Promise<WhatsappConnection | undefined> {
    const [connection] = await db
      .select()
      .from(whatsappConnections)
      .where(eq(whatsappConnections.userId, userId));
    return connection;
  }

  async createWhatsappConnection(connectionData: InsertWhatsappConnection): Promise<WhatsappConnection> {
    const [connection] = await db
      .insert(whatsappConnections)
      .values(connectionData)
      .returning();
    return connection;
  }

  async updateWhatsappConnection(userId: string, updates: Partial<WhatsappConnection>): Promise<WhatsappConnection> {
    const [connection] = await db
      .update(whatsappConnections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(whatsappConnections.userId, userId))
      .returning();
    return connection;
  }

  // Business products operations
  async getBusinessProducts(userId: string): Promise<BusinessProduct[]> {
    return await db
      .select()
      .from(businessProducts)
      .where(eq(businessProducts.userId, userId))
      .orderBy(desc(businessProducts.createdAt));
  }

  async createBusinessProduct(productData: InsertBusinessProduct): Promise<BusinessProduct> {
    const [product] = await db
      .insert(businessProducts)
      .values(productData)
      .returning();
    return product;
  }

  async updateBusinessProduct(id: number, updates: Partial<BusinessProduct>): Promise<BusinessProduct> {
    const [product] = await db
      .update(businessProducts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(businessProducts.id, id))
      .returning();
    return product;
  }

  async deleteBusinessProduct(id: number): Promise<void> {
    await db.delete(businessProducts).where(eq(businessProducts.id, id));
  }

  // Business services operations
  async getBusinessServices(userId: string): Promise<BusinessService[]> {
    return await db
      .select()
      .from(businessServices)
      .where(eq(businessServices.userId, userId))
      .orderBy(desc(businessServices.createdAt));
  }

  async createBusinessService(serviceData: InsertBusinessService): Promise<BusinessService> {
    const [service] = await db
      .insert(businessServices)
      .values(serviceData)
      .returning();
    return service;
  }

  async updateBusinessService(id: number, updates: Partial<BusinessService>): Promise<BusinessService> {
    const [service] = await db
      .update(businessServices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(businessServices.id, id))
      .returning();
    return service;
  }

  async deleteBusinessService(id: number): Promise<void> {
    await db.delete(businessServices).where(eq(businessServices.id, id));
  }

  // Appointments operations
  async getAppointments(userId: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(appointmentData)
      .returning();
    return appointment;
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  async getAvailableSlots(userId: string, date: string): Promise<any[]> {
    // Implementar lógica de disponibilidad
    // Por ahora devolvemos slots básicos
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: true
      });
    }
    return slots;
  }

  // WhatsApp messages operations
  async getWhatsappMessages(userId: string, limit: number = 50): Promise<WhatsappMessage[]> {
    return await db
      .select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.userId, userId))
      .orderBy(desc(whatsappMessages.createdAt))
      .limit(limit);
  }

  async createWhatsappMessage(messageData: InsertWhatsappMessage): Promise<WhatsappMessage> {
    const [message] = await db
      .insert(whatsappMessages)
      .values(messageData)
      .returning();
    return message;
  }
}

export const unifiedStorage = new UnifiedStorage();