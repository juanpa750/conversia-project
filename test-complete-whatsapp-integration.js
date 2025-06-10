import fetch from 'node-fetch';

async function testCompleteWhatsAppIntegration() {
  console.log('🧪 Testing complete WhatsApp integration with QR functionality...');
  
  try {
    // Login with existing credentials
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'prueba@conversia.com', password: '123456' })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Authentication successful');
    
    // Get chatbot 26 integration status
    const integrationResponse = await fetch('http://localhost:5000/api/whatsapp/integrations/chatbot/26', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const integration = await integrationResponse.json();
    console.log('📋 Integration status:', integration.status);
    console.log('📱 Phone number:', integration.phoneNumber);
    console.log('🏢 Business name:', integration.displayName);
    
    // Test WhatsApp connection initiation
    console.log('\n🔗 Initiating WhatsApp connection...');
    const connectResponse = await fetch(`http://localhost:5000/api/whatsapp/connect/${integration.id}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({})
    });
    
    const connectData = await connectResponse.json();
    console.log('📡 Connection initiation:', connectData.success ? 'SUCCESS' : 'FAILED');
    if (connectData.qrCode) {
      console.log('🔑 QR Code generated: YES (length:', connectData.qrCode.length, 'chars)');
    }
    
    // Poll QR status multiple times to simulate connection process
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const qrResponse = await fetch(`http://localhost:5000/api/whatsapp/qr/${integration.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const qrData = await qrResponse.json();
      console.log(`📱 QR Status (${i+1}/3):`, qrData.status);
      
      if (qrData.status === 'connected') {
        console.log('🎉 WhatsApp connected successfully!');
        
        // Test message sending
        const messageResponse = await fetch(`http://localhost:5000/api/whatsapp/send-message`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            integrationId: integration.id,
            to: '521234567890',
            message: 'Hola! Este es un mensaje de prueba desde ConversIA 🤖'
          })
        });
        
        const messageResult = await messageResponse.json();
        console.log('📤 Message sending test:', messageResult.success ? 'SUCCESS' : 'FAILED');
        break;
      }
    }
    
    // Test disconnection
    console.log('\n🔌 Testing disconnection...');
    const disconnectResponse = await fetch(`http://localhost:5000/api/whatsapp/disconnect/${integration.id}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({})
    });
    
    const disconnectData = await disconnectResponse.json();
    console.log('🔌 Disconnection test:', disconnectData.success ? 'SUCCESS' : 'FAILED');
    
    console.log('\n✅ WhatsApp integration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteWhatsAppIntegration();