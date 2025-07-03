import { db } from "./db";
import { conversationHistory } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function populateCRMTestData(userId: string) {
  console.log('🚀 Populando datos de prueba para el CRM...');
  
  try {
    // Limpiar datos existentes para evitar duplicados
    await db.delete(conversationHistory);
    
    const conversations = [
      // Conversaciones recientes con diferentes etapas
      {
        userId,
        contactPhone: '+573001234567',
        contactName: 'María García',
        contactEmail: 'maria.garcia@email.com',
        messageType: 'incoming' as const,
        messageContent: 'Hola, me interesa el suplemento de vitamina D3. ¿Tienen descuentos?',
        chatbotId: 26,
        productId: 10,
        leadStage: 'engaged',
        estimatedValue: '45.99',
        priority: 'high',
        sentiment: 'positive',
        intent: 'purchase',
        urgency: 'medium',
        responseTime: 120,
        createdAt: new Date()
      },
      {
        userId,
        contactPhone: '+573009876543',
        contactName: 'Carlos López',
        contactEmail: 'carlos.lopez@email.com',
        messageType: 'incoming' as const,
        messageContent: '¿El suplemento es natural? Tengo problemas digestivos',
        chatbotId: 26,
        productId: 10,
        leadStage: 'qualified',
        estimatedValue: '45.99',
        priority: 'medium',
        sentiment: 'neutral',
        intent: 'information',
        urgency: 'low',
        responseTime: 180,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hora atrás
      },
      {
        userId,
        contactPhone: '+573005555555',
        contactName: 'Ana Martínez',
        messageType: 'incoming' as const,
        messageContent: 'Necesito agendar una cita para consulta nutricional',
        leadStage: 'proposal_sent',
        estimatedValue: '150.00',
        priority: 'high',
        sentiment: 'positive',
        intent: 'appointment',
        urgency: 'high',
        responseTime: 90,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 horas atrás
      },
      {
        userId,
        contactPhone: '+573002222222',
        contactName: 'Pedro Sánchez',
        messageType: 'incoming' as const,
        messageContent: 'Excelente producto, ya hice la transferencia. ¿Cuándo llega?',
        chatbotId: 26,
        productId: 10,
        leadStage: 'sale_closed',
        estimatedValue: '45.99',
        priority: 'low',
        sentiment: 'positive',
        intent: 'support',
        urgency: 'low',
        responseTime: 300,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 día atrás
      },
      {
        userId,
        contactPhone: '+573003333333',
        contactName: 'Laura Torres',
        messageType: 'incoming' as const,
        messageContent: 'El precio está muy alto, buscaré otras opciones',
        chatbotId: 26,
        productId: 10,
        leadStage: 'lost',
        estimatedValue: '0',
        priority: 'low',
        sentiment: 'negative',
        intent: 'complaint',
        urgency: 'low',
        responseTime: 600,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 día atrás
      },
      {
        userId,
        contactPhone: '+573004444444',
        contactName: 'Roberto Silva',
        messageType: 'incoming' as const,
        messageContent: 'Hola, me pueden enviar más información sobre sus productos?',
        leadStage: 'new_contact',
        estimatedValue: '0',
        priority: 'medium',
        sentiment: 'neutral',
        intent: 'information',
        urgency: 'low',
        responseTime: 240,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 días atrás
      },
      {
        userId,
        contactPhone: '+573006666666',
        contactName: 'Sofía Herrera',
        messageType: 'incoming' as const,
        messageContent: 'Me interesa el plan de suplementos completo, ¿tienen paquetes?',
        chatbotId: 26,
        leadStage: 'qualified',
        estimatedValue: '200.00',
        priority: 'high',
        sentiment: 'positive',
        intent: 'purchase',
        urgency: 'medium',
        responseTime: 150,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días atrás
      },
      // Respuestas del chatbot
      {
        userId,
        contactPhone: '+573001234567',
        contactName: 'María García',
        messageType: 'outgoing' as const,
        messageContent: '¡Hola María! 😊 Sí, tenemos promoción especial del 20% de descuento en Vitamina D3. Es perfecto para fortalecer tu sistema inmunológico.',
        chatbotId: 26,
        productId: 10,
        leadStage: 'engaged',
        estimatedValue: '36.79',
        priority: 'high',
        sentiment: 'positive',
        intent: 'purchase',
        urgency: 'medium',
        createdAt: new Date(Date.now() - 2 * 60 * 1000) // 2 minutos después
      }
    ];

    // Insertar las conversaciones
    for (const conv of conversations) {
      await db.insert(conversationHistory).values(conv);
    }

    console.log(`✅ Se insertaron ${conversations.length} conversaciones de prueba`);
    
    return {
      success: true,
      count: conversations.length,
      message: 'Datos de prueba del CRM creados exitosamente'
    };
    
  } catch (error) {
    console.error('❌ Error populando datos CRM:', error);
    return {
      success: false,
      error: String(error)
    };
  }
}