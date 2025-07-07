import fetch from 'node-fetch';

async function testRealWhatsApp() {
  try {
    console.log('🔄 Probando conexión a WhatsApp Real...');
    
    // Test basic connection
    const response = await fetch('http://localhost:5000/api/whatsapp-real/connect/26', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    const result = await response.json();
    console.log('📱 Resultado:', result);
    
    if (response.ok) {
      console.log('✅ WhatsApp Real conectado exitosamente');
    } else {
      console.log('❌ Error en conexión:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRealWhatsApp();