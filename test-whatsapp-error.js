// Test script para identificar el error de conexión de WhatsApp
import fetch from 'node-fetch';

async function testWhatsAppConnection() {
  console.log('🔍 Iniciando prueba de conexión WhatsApp...');
  
  try {
    // Primero, limpiar las cookies corruptas
    console.log('🧹 Limpiando cookies...');
    await fetch('http://localhost:5000/api/auth/logout', { method: 'POST' });
    
    // Hacer login con captura de cookies
    const cookieJar = [];
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
    
    // Capturar cookies del login
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      cookieJar.push(setCookieHeader);
    }
    
    if (!loginResponse.ok) {
      console.error('❌ Error en login:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso, token:', token ? 'Disponible' : 'No disponible');
    
    // Intentar conectar WhatsApp con cookies y token
    const chatbotId = 29;
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (cookieJar.length > 0) {
      headers['Cookie'] = cookieJar.join('; ');
    }
    
    const connectResponse = await fetch(`http://localhost:5000/api/whatsapp/connect/${chatbotId}`, {
      method: 'POST',
      headers
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
      headers
    });
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('📊 Estado actual:', JSON.stringify(statusData, null, 2));
    } else {
      console.error('❌ Error verificando estado:', await statusResponse.text());
    }
    
  } catch (error) {
    console.error('💥 Error en prueba:', error);
  }
}

testWhatsAppConnection();