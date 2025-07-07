// Test script para identificar el error de conexión de WhatsApp
import fetch from 'node-fetch';

async function testWhatsAppConnection() {
  console.log('🔍 Iniciando prueba de conexión WhatsApp...');
  
  try {
    // Primero, hacer login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'prueba@botmaster.com',
        password: '123456'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Error en login:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso');
    
    // Intentar conectar WhatsApp con el chatbot 29
    const chatbotId = 29;
    const connectResponse = await fetch(`http://localhost:5000/api/whatsapp/connect/${chatbotId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📋 Estado de respuesta:', connectResponse.status);
    
    if (!connectResponse.ok) {
      const errorText = await connectResponse.text();
      console.error('❌ Error en conexión WhatsApp:', errorText);
    } else {
      const data = await connectResponse.json();
      console.log('✅ Respuesta de conexión:', JSON.stringify(data, null, 2));
    }
    
    // Verificar estado de conexión
    const statusResponse = await fetch(`http://localhost:5000/api/whatsapp/status/${chatbotId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('📊 Estado actual:', JSON.stringify(statusData, null, 2));
    }
    
  } catch (error) {
    console.error('💥 Error en prueba:', error);
  }
}

testWhatsAppConnection();