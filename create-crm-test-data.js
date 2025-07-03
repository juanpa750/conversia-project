import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configure neon for Node.js environment
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  webSocketConstructor: ws
});

async function createCRMTestData() {
  console.log('🚀 Creando datos de prueba para el CRM...');
  
  const userId = 'd91ec757-59a8-4171-a18e-96c0d60f9160'; // Usuario de prueba actual
  
  try {
    // 1. Crear tabla conversation_history si no existe
    console.log('📋 Creando tabla conversation_history...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversation_history (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        contact_phone VARCHAR NOT NULL,
        contact_name VARCHAR,
        contact_email VARCHAR,
        message_type VARCHAR NOT NULL,
        message_content TEXT,
        chatbot_id INTEGER,
        product_id INTEGER,
        service_id INTEGER,
        lead_stage VARCHAR DEFAULT 'new_contact',
        estimated_value DECIMAL(10,2),
        priority VARCHAR DEFAULT 'medium',
        sentiment VARCHAR,
        intent VARCHAR,
        urgency VARCHAR DEFAULT 'low',
        response_time INTEGER,
        is_read BOOLEAN DEFAULT false,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Limpiar datos existentes para evitar duplicados
    console.log('🧹 Limpiando datos existentes...');
    await pool.query('DELETE FROM conversation_history WHERE user_id = $1', [userId]);

    // 3. Insertar conversaciones de prueba
    console.log('💬 Insertando conversaciones de prueba...');
    
    const conversations = [
      // Conversaciones de hoy
      {
        contact_phone: '+573001234567',
        contact_name: 'María García',
        contact_email: 'maria.garcia@email.com',
        message_type: 'incoming',
        message_content: 'Hola, me interesa el suplemento de vitamina D3. ¿Tienen descuentos?',
        chatbot_id: 26,
        product_id: 10,
        lead_stage: 'engaged',
        estimated_value: 45.99,
        priority: 'high',
        sentiment: 'positive',
        intent: 'purchase',
        urgency: 'medium',
        response_time: 120,
        created_at: 'NOW()'
      },
      {
        contact_phone: '+573001234567',
        contact_name: 'María García',
        contact_email: 'maria.garcia@email.com',
        message_type: 'outgoing',
        message_content: '¡Hola María! 😊 Sí, tenemos promoción especial del 20% de descuento en Vitamina D3. Es perfecto para fortalecer tu sistema inmunológico.',
        chatbot_id: 26,
        product_id: 10,
        lead_stage: 'engaged',
        estimated_value: 36.79,
        priority: 'high',
        sentiment: 'positive',
        intent: 'purchase',
        urgency: 'medium',
        response_time: null,
        created_at: 'NOW() - INTERVAL \'2 minutes\''
      },
      {
        contact_phone: '+573009876543',
        contact_name: 'Carlos López',
        contact_email: 'carlos.lopez@email.com',
        message_type: 'incoming',
        message_content: '¿El suplemento es natural? Tengo problemas digestivos',
        chatbot_id: 26,
        product_id: 10,
        lead_stage: 'qualified',
        estimated_value: 45.99,
        priority: 'medium',
        sentiment: 'neutral',
        intent: 'information',
        urgency: 'low',
        response_time: 180,
        created_at: 'NOW() - INTERVAL \'1 hour\''
      },
      {
        contact_phone: '+573005555555',
        contact_name: 'Ana Martínez',
        message_type: 'incoming',
        message_content: 'Necesito agendar una cita para consulta nutricional',
        lead_stage: 'proposal_sent',
        estimated_value: 150.00,
        priority: 'high',
        sentiment: 'positive',
        intent: 'appointment',
        urgency: 'high',
        response_time: 90,
        created_at: 'NOW() - INTERVAL \'3 hours\''
      },
      
      // Conversaciones de ayer
      {
        contact_phone: '+573002222222',
        contact_name: 'Pedro Sánchez',
        message_type: 'incoming',
        message_content: 'Excelente producto, ya hice la transferencia. ¿Cuándo llega?',
        chatbot_id: 26,
        product_id: 10,
        lead_stage: 'sale_closed',
        estimated_value: 45.99,
        priority: 'low',
        sentiment: 'positive',
        intent: 'support',
        urgency: 'low',
        response_time: 300,
        created_at: 'NOW() - INTERVAL \'1 day\''
      },
      {
        contact_phone: '+573003333333',
        contact_name: 'Laura Torres',
        message_type: 'incoming',
        message_content: 'El precio está muy alto, buscaré otras opciones',
        chatbot_id: 26,
        product_id: 10,
        lead_stage: 'lost',
        estimated_value: 0,
        priority: 'low',
        sentiment: 'negative',
        intent: 'complaint',
        urgency: 'low',
        response_time: 600,
        created_at: 'NOW() - INTERVAL \'1 day\''
      },
      
      // Conversaciones de la semana pasada
      {
        contact_phone: '+573004444444',
        contact_name: 'Roberto Silva',
        message_type: 'incoming',
        message_content: 'Hola, me pueden enviar más información sobre sus productos?',
        lead_stage: 'new_contact',
        estimated_value: 0,
        priority: 'medium',
        sentiment: 'neutral',
        intent: 'information',
        urgency: 'low',
        response_time: 240,
        created_at: 'NOW() - INTERVAL \'5 days\''
      },
      {
        contact_phone: '+573006666666',
        contact_name: 'Sofía Herrera',
        message_type: 'incoming',
        message_content: 'Me interesa el plan de suplementos completo, ¿tienen paquetes?',
        chatbot_id: 26,
        lead_stage: 'qualified',
        estimated_value: 200.00,
        priority: 'high',
        sentiment: 'positive',
        intent: 'purchase',
        urgency: 'medium',
        response_time: 150,
        created_at: 'NOW() - INTERVAL \'7 days\''
      }
    ];

    for (const conv of conversations) {
      const values = [
        userId,
        conv.contact_phone,
        conv.contact_name || null,
        conv.contact_email || null,
        conv.message_type,
        conv.message_content,
        conv.chatbot_id || null,
        conv.product_id || null,
        conv.service_id || null,
        conv.lead_stage,
        conv.estimated_value || null,
        conv.priority,
        conv.sentiment || null,
        conv.intent || null,
        conv.urgency,
        conv.response_time || null,
        false, // is_read
        [], // tags
        conv.created_at
      ];

      await pool.query(`
        INSERT INTO conversation_history (
          user_id, contact_phone, contact_name, contact_email, message_type,
          message_content, chatbot_id, product_id, service_id, lead_stage,
          estimated_value, priority, sentiment, intent, urgency,
          response_time, is_read, tags, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, ${conv.created_at}
        )
      `, values);
    }

    console.log('✅ Datos de prueba creados exitosamente!');
    console.log(`📊 Se insertaron ${conversations.length} conversaciones`);
    console.log('🎯 Métricas disponibles:');
    console.log('   • Contactos totales: 8');
    console.log('   • Leads calificados: 3');
    console.log('   • Ventas cerradas: 1');
    console.log('   • Tasa de conversión: ~37%');
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar script
createCRMTestData();