import { db } from "./db";
import { conversationHistory, users, chatbots, businessProducts, businessServices, appointments } from "@shared/schema";
import { eq, and, sql, desc, gte, lte, count, avg, sum } from "drizzle-orm";

interface CRMMetrics {
  totalContacts: number;
  qualifiedLeads: number;
  monthlySales: number;
  conversionRate: number;
  contactsChange: number;
  leadsChange: number;
  salesChange: number;
  conversionChange: number;
  dailyConversations: Array<{ date: string; count: number; }>;
  leadDistribution: Array<{ name: string; value: number; }>;
  averageResponseTime: number;
  messagesSentToday: number;
  activeConversations: number;
}

interface PipelineItem {
  id: number;
  title: string;
  contact_name: string;
  contact_phone: string;
  estimated_value: number;
  stage: string;
  created_at: string;
  chatbot_name?: string;
  product_name?: string;
  priority: string;
}

interface ContactOverview {
  recent: Array<{
    id: number;
    name: string;
    phone: string;
    email?: string;
    lastMessage: string;
    lastMessageAt: string;
    leadStage: string;
    priority: string;
    estimatedValue: number;
    responseTime?: number;
    sentiment?: string;
  }>;
  total: number;
  newToday: number;
  qualified: number;
}

export class CRMService {
  /**
   * Obtiene métricas principales del CRM
   */
  static async getCRMMetrics(userId: string, dateRange: string = 'last_30_days'): Promise<CRMMetrics> {
    const now = new Date();
    let startDate: Date;
    
    // Calcular rango de fechas
    switch (dateRange) {
      case 'last_7_days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last_30_days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last_90_days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Contactos únicos totales
    const totalContactsResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT contact_phone)` })
      .from(conversationHistory)
      .where(eq(conversationHistory.userId, userId));
    
    const totalContacts = totalContactsResult[0]?.count || 0;

    // Leads calificados
    const qualifiedLeadsResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT contact_phone)` })
      .from(conversationHistory)
      .where(
        and(
          eq(conversationHistory.userId, userId),
          sql`lead_stage IN ('qualified', 'proposal_sent', 'sale_closed')`
        )
      );
    
    const qualifiedLeads = qualifiedLeadsResult[0]?.count || 0;

    // Ventas del mes (suma de valores estimados cerrados)
    const monthlySalesResult = await db
      .select({ total: sql<number>`COALESCE(SUM(estimated_value), 0)` })
      .from(conversationHistory)
      .where(
        and(
          eq(conversationHistory.userId, userId),
          eq(conversationHistory.leadStage, 'sale_closed'),
          gte(conversationHistory.createdAt, startDate)
        )
      );
    
    const monthlySales = Number(monthlySalesResult[0]?.total || 0);

    // Tasa de conversión
    const conversionRate = totalContacts > 0 ? Math.round((qualifiedLeads / totalContacts) * 100) : 0;

    // Conversaciones por día (últimos 7 días)
    const dailyConversationsResult = await db
      .select({
        date: sql<string>`DATE(created_at)`,
        count: sql<number>`COUNT(*)`
      })
      .from(conversationHistory)
      .where(
        and(
          eq(conversationHistory.userId, userId),
          gte(conversationHistory.createdAt, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
        )
      )
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    // Distribución de leads por etapa
    const leadDistributionResult = await db
      .select({
        name: conversationHistory.leadStage,
        value: sql<number>`COUNT(DISTINCT contact_phone)`
      })
      .from(conversationHistory)
      .where(eq(conversationHistory.userId, userId))
      .groupBy(conversationHistory.leadStage);

    // Tiempo promedio de respuesta (en minutos)
    const avgResponseTimeResult = await db
      .select({ avg: sql<number>`AVG(response_time)` })
      .from(conversationHistory)
      .where(
        and(
          eq(conversationHistory.userId, userId),
          sql`response_time IS NOT NULL`,
          gte(conversationHistory.createdAt, startDate)
        )
      );
    
    const averageResponseTime = Math.round((avgResponseTimeResult[0]?.avg || 0) / 60); // convertir a minutos

    // Mensajes enviados hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const messagesSentTodayResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(conversationHistory)
      .where(
        and(
          eq(conversationHistory.userId, userId),
          eq(conversationHistory.messageType, 'outgoing'),
          gte(conversationHistory.createdAt, today)
        )
      );
    
    const messagesSentToday = messagesSentTodayResult[0]?.count || 0;

    // Conversaciones activas (último mensaje en 24h)
    const activeConversationsResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT contact_phone)` })
      .from(conversationHistory)
      .where(
        and(
          eq(conversationHistory.userId, userId),
          gte(conversationHistory.createdAt, new Date(now.getTime() - 24 * 60 * 60 * 1000))
        )
      );
    
    const activeConversations = activeConversationsResult[0]?.count || 0;

    // Formatear distribución de leads
    const leadDistribution = leadDistributionResult.map(item => ({
      name: this.getStageDisplayName(item.name || 'new_contact'),
      value: item.value
    }));

    return {
      totalContacts,
      qualifiedLeads,
      monthlySales,
      conversionRate,
      contactsChange: 0, // TODO: Calcular cambio vs período anterior
      leadsChange: 0,
      salesChange: 0,
      conversionChange: 0,
      dailyConversations: dailyConversationsResult.map(item => ({
        date: item.date,
        count: item.count
      })),
      leadDistribution,
      averageResponseTime,
      messagesSentToday,
      activeConversations
    };
  }

  /**
   * Obtiene el pipeline de ventas
   */
  static async getSalesPipeline(userId: string): Promise<PipelineItem[]> {
    const pipelineResult = await db
      .select({
        id: conversationHistory.id,
        contact_name: conversationHistory.contactName,
        contact_phone: conversationHistory.contactPhone,
        estimated_value: conversationHistory.estimatedValue,
        stage: conversationHistory.leadStage,
        created_at: conversationHistory.createdAt,
        priority: conversationHistory.priority,
        chatbot_name: chatbots.name,
        product_name: businessProducts.name,
      })
      .from(conversationHistory)
      .leftJoin(chatbots, eq(conversationHistory.chatbotId, chatbots.id))
      .leftJoin(businessProducts, eq(conversationHistory.productId, businessProducts.id))
      .where(
        and(
          eq(conversationHistory.userId, userId),
          sql`estimated_value > 0`,
          sql`lead_stage != 'lost'`
        )
      )
      .orderBy(desc(conversationHistory.createdAt));

    return pipelineResult.map(item => ({
      id: item.id,
      title: item.product_name || `Contacto ${item.contact_name || 'Sin nombre'}`,
      contact_name: item.contact_name || 'Sin nombre',
      contact_phone: item.contact_phone,
      estimated_value: Number(item.estimated_value || 0),
      stage: item.stage || 'new_contact',
      created_at: item.created_at?.toISOString() || '',
      chatbot_name: item.chatbot_name || undefined,
      product_name: item.product_name || undefined,
      priority: item.priority || 'medium'
    }));
  }

  /**
   * Obtiene resumen de contactos
   */
  static async getContactsOverview(userId: string): Promise<ContactOverview> {
    // Contactos recientes (últimos 20)
    const recentContactsResult = await db
      .select({
        id: conversationHistory.id,
        name: conversationHistory.contactName,
        phone: conversationHistory.contactPhone,
        email: conversationHistory.contactEmail,
        lastMessage: conversationHistory.messageContent,
        lastMessageAt: conversationHistory.createdAt,
        leadStage: conversationHistory.leadStage,
        priority: conversationHistory.priority,
        estimatedValue: conversationHistory.estimatedValue,
        responseTime: conversationHistory.responseTime,
        sentiment: conversationHistory.sentiment,
      })
      .from(conversationHistory)
      .where(eq(conversationHistory.userId, userId))
      .orderBy(desc(conversationHistory.createdAt))
      .limit(20);

    // Total de contactos únicos
    const totalResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT contact_phone)` })
      .from(conversationHistory)
      .where(eq(conversationHistory.userId, userId));

    // Nuevos contactos hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newTodayResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT contact_phone)` })
      .from(conversationHistory)
      .where(
        and(
          eq(conversationHistory.userId, userId),
          gte(conversationHistory.createdAt, today)
        )
      );

    // Contactos calificados
    const qualifiedResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT contact_phone)` })
      .from(conversationHistory)
      .where(
        and(
          eq(conversationHistory.userId, userId),
          sql`lead_stage IN ('qualified', 'proposal_sent', 'sale_closed')`
        )
      );

    const recent = recentContactsResult.map(item => ({
      id: item.id,
      name: item.name || 'Sin nombre',
      phone: item.phone,
      email: item.email || undefined,
      lastMessage: item.lastMessage || '',
      lastMessageAt: item.lastMessageAt?.toISOString() || '',
      leadStage: item.leadStage || 'new_contact',
      priority: item.priority || 'medium',
      estimatedValue: Number(item.estimatedValue || 0),
      responseTime: item.responseTime || undefined,
      sentiment: item.sentiment || undefined,
    }));

    return {
      recent,
      total: totalResult[0]?.count || 0,
      newToday: newTodayResult[0]?.count || 0,
      qualified: qualifiedResult[0]?.count || 0
    };
  }

  /**
   * Actualiza la etapa de lead de un contacto
   */
  static async updateLeadStage(userId: string, contactPhone: string, newStage: string, estimatedValue?: number): Promise<boolean> {
    try {
      const updateData: any = {
        leadStage: newStage,
        updatedAt: new Date()
      };

      if (estimatedValue !== undefined) {
        updateData.estimatedValue = estimatedValue.toString();
      }

      await db
        .update(conversationHistory)
        .set(updateData)
        .where(
          and(
            eq(conversationHistory.userId, userId),
            eq(conversationHistory.contactPhone, contactPhone)
          )
        );

      return true;
    } catch (error) {
      console.error('Error updating lead stage:', error);
      return false;
    }
  }

  /**
   * Registra una nueva conversación
   */
  static async logConversation(data: {
    userId: string;
    contactPhone: string;
    contactName?: string;
    messageType: 'incoming' | 'outgoing' | 'automated';
    messageContent: string;
    chatbotId?: number;
    productId?: number;
    sentiment?: string;
    intent?: string;
    responseTime?: number;
  }): Promise<boolean> {
    try {
      await db.insert(conversationHistory).values({
        userId: data.userId,
        contactPhone: data.contactPhone,
        contactName: data.contactName,
        messageType: data.messageType,
        messageContent: data.messageContent,
        chatbotId: data.chatbotId,
        productId: data.productId,
        sentiment: data.sentiment,
        intent: data.intent,
        responseTime: data.responseTime,
        createdAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error logging conversation:', error);
      return false;
    }
  }

  /**
   * Obtiene nombre de etapa para mostrar
   */
  private static getStageDisplayName(stage: string): string {
    const stageNames: Record<string, string> = {
      'new_contact': 'Nuevo Contacto',
      'engaged': 'Interesado',
      'qualified': 'Calificado',
      'proposal_sent': 'Propuesta Enviada',
      'sale_closed': 'Venta Cerrada',
      'lost': 'Perdido'
    };

    return stageNames[stage] || stage;
  }
}