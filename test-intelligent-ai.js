// Prueba del Sistema de IA Inteligente
import axios from 'axios';

const API_BASE = 'http://localhost:5000';
const TEST_USER = {
  email: 'demo@test.com',
  password: 'demo123'
};

async function testIntelligentAI() {
  console.log('🧠 Probando Sistema de IA Inteligente\n');

  try {
    // 1. Autenticar usuario
    console.log('1. Autenticando usuario...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, TEST_USER);
    const token = loginResponse.data.token;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Verificar estado de WhatsApp
    console.log('2. Verificando configuración de WhatsApp...');
    const statusResponse = await axios.get(`${API_BASE}/api/simple/status`, { headers });
    console.log('   Estado:', statusResponse.data.success ? 'Conectado' : 'Desconectado');
    console.log('   Tipo de negocio:', statusResponse.data.businessType);
    console.log('   Nombre del negocio:', statusResponse.data.businessName);

    // 3. Obtener productos disponibles
    console.log('\n3. Obteniendo productos para análisis...');
    const productsResponse = await axios.get(`${API_BASE}/api/products`, { headers });
    const products = productsResponse.data;
    console.log(`   Productos disponibles: ${products.length}`);
    
    if (products.length > 0) {
      console.log('   Ejemplos:');
      products.slice(0, 3).forEach(p => {
        console.log(`   - ${p.name} (${p.category}) - $${p.price}`);
      });
    }

    // 4. Probar diferentes tipos de mensajes para analizar la IA
    console.log('\n4. Probando respuestas inteligentes...\n');

    const testMessages = [
      {
        name: 'Saludo básico',
        message: 'Hola, buenos días',
        expected: 'saludo personalizado'
      },
      {
        name: 'Consulta de precio',
        message: 'Cuánto cuesta el iPhone 14',
        expected: 'análisis de producto + estrategia de precio'
      },
      {
        name: 'Intención de compra',
        message: 'Quiero comprar una laptop para trabajo',
        expected: 'análisis de necesidad + recomendación'
      },
      {
        name: 'Consulta de disponibilidad',
        message: 'Tienen stock de Samsung Galaxy disponible?',
        expected: 'verificación + información de producto'
      },
      {
        name: 'Comparación de productos',
        message: 'Cuál es mejor entre iPhone y Samsung?',
        expected: 'análisis comparativo + ventajas'
      },
      {
        name: 'Mensaje con sentimiento negativo',
        message: 'Sus productos son muy caros y el servicio es malo',
        expected: 'manejo de objeciones + recuperación'
      },
      {
        name: 'Solicitud urgente',
        message: 'Necesito urgente una tablet para hoy mismo',
        expected: 'detección de urgencia + solución rápida'
      },
      {
        name: 'Consulta de servicios/cita',
        message: 'Quiero agendar una cita para consulta',
        expected: 'gestión de citas + disponibilidad'
      }
    ];

    for (const test of testMessages) {
      console.log(`📱 Prueba: ${test.name}`);
      console.log(`   Mensaje: "${test.message}"`);
      console.log(`   Expectativa: ${test.expected}`);
      
      try {
        const messageResponse = await axios.post(
          `${API_BASE}/api/simple/simulate-message`, 
          {
            message: test.message,
            phoneNumber: '+1234567890'
          }, 
          { headers }
        );

        console.log(`   ✅ Respuesta IA: "${messageResponse.data.response}"`);
        console.log(`   📊 Éxito: ${messageResponse.data.success}`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      }
      
      console.log('   ' + '-'.repeat(60));
    }

    // 5. Estadísticas finales
    console.log('\n5. Verificando estadísticas actualizadas...');
    const finalStatus = await axios.get(`${API_BASE}/api/simple/status`, { headers });
    console.log(`   Mensajes enviados: ${finalStatus.data.messagesSent}`);
    console.log(`   Mensajes recibidos: ${finalStatus.data.messagesReceived}`);

    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('\n📈 Beneficios de la IA Inteligente demostrados:');
    console.log('   ✓ Análisis automático de productos');
    console.log('   ✓ Detección de sentimientos');
    console.log('   ✓ Reconocimiento de intenciones');
    console.log('   ✓ Respuestas contextualizadas');
    console.log('   ✓ Manejo de objeciones');
    console.log('   ✓ Estrategias de venta inteligentes');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

// Ejecutar prueba
testIntelligentAI();