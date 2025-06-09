// Test WhatsApp integration endpoints
const baseUrl = 'http://localhost:5000';

async function testWhatsAppIntegration() {
  console.log('🧪 Testing WhatsApp Integration API...');
  
  // Test login first
  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'prueba@botmaster.com',
        password: '123456'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.success);
    
    const token = loginData.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test getting WhatsApp integrations
    console.log('\n📋 Testing GET /api/whatsapp/integrations...');
    const integrationsResponse = await fetch(`${baseUrl}/api/whatsapp/integrations`, {
      headers
    });
    
    if (integrationsResponse.ok) {
      const integrations = await integrationsResponse.json();
      console.log('✅ WhatsApp integrations:', integrations);
    } else {
      console.log('❌ Error getting integrations:', integrationsResponse.status);
    }
    
    // Test creating WhatsApp integration for chatbot 26
    console.log('\n📝 Testing POST /api/whatsapp/integrations...');
    const createResponse = await fetch(`${baseUrl}/api/whatsapp/integrations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        phoneNumber: '+52 55 1234 5678',
        displayName: 'Mi Negocio Test',
        businessDescription: 'Negocio de prueba para WhatsApp',
        businessType: 'products',
        autoRespond: true,
        operatingHours: {
          enabled: false,
          timezone: 'America/Mexico_City',
          schedule: {}
        },
        chatbotId: '26',
        productId: 10
      })
    });
    
    if (createResponse.ok) {
      const newIntegration = await createResponse.json();
      console.log('✅ WhatsApp integration created:', newIntegration);
    } else {
      const error = await createResponse.text();
      console.log('❌ Error creating integration:', createResponse.status, error);
    }
    
    // Test getting integration for specific chatbot
    console.log('\n🔍 Testing GET /api/whatsapp/integrations/chatbot/26...');
    const chatbotIntegrationResponse = await fetch(`${baseUrl}/api/whatsapp/integrations/chatbot/26`, {
      headers
    });
    
    if (chatbotIntegrationResponse.ok) {
      const chatbotIntegration = await chatbotIntegrationResponse.json();
      console.log('✅ Chatbot WhatsApp integration:', chatbotIntegration);
    } else {
      console.log('❌ Error getting chatbot integration:', chatbotIntegrationResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWhatsAppIntegration();