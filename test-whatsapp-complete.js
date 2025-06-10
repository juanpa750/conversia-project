import fetch from 'node-fetch';

async function testCompleteWhatsAppWorkflow() {
  console.log('🔍 Prueba completa de funcionalidad WhatsApp...');
  
  try {
    // Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'prueba@conversia.com', password: '123456' })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso');
    
    // Verificar integración actual
    const integrationResponse = await fetch('http://localhost:5000/api/whatsapp/integrations/chatbot/26', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (integrationResponse.status === 200) {
      const integration = await integrationResponse.json();
      console.log('📱 Integración encontrada:');
      console.log('- ID:', integration.id);
      console.log('- Status:', integration.status);
      console.log('- Teléfono:', integration.phoneNumber);
      console.log('- Nombre:', integration.displayName);
      
      // Test 1: Iniciar conexión WhatsApp
      console.log('\n🔗 Iniciando conexión WhatsApp...');
      const connectResponse = await fetch(`http://localhost:5000/api/whatsapp/connect/${integration.id}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({})
      });
      
      if (connectResponse.status === 200) {
        const connectData = await connectResponse.json();
        console.log('✅ Conexión iniciada exitosamente');
        console.log('- Session ID:', connectData.sessionId);
        
        // Test 2: Obtener código QR
        console.log('\n📱 Obteniendo código QR...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const qrResponse = await fetch(`http://localhost:5000/api/whatsapp/qr/${integration.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (qrResponse.status === 200) {
          const qrData = await qrResponse.json();
          console.log('✅ Código QR generado');
          console.log('- Status:', qrData.status);
          console.log('- QR disponible:', qrData.qrCode ? 'SI' : 'NO');
          console.log('- Tamaño QR:', qrData.qrCode ? `${qrData.qrCode.length} caracteres` : '0');
          
          // Test 3: Simular espera hasta conexión
          console.log('\n⏳ Esperando simulación de conexión...');
          for (let i = 0; i < 8; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const statusResponse = await fetch(`http://localhost:5000/api/whatsapp/qr/${integration.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (statusResponse.status === 200) {
              const statusData = await statusResponse.json();
              console.log(`- Estado ${i+1}/8:`, statusData.status);
              
              if (statusData.status === 'connected') {
                console.log('🎉 WhatsApp conectado exitosamente!');
                
                // Test 4: Enviar mensaje de prueba
                console.log('\n📤 Enviando mensaje de prueba...');
                const messageResponse = await fetch('http://localhost:5000/api/whatsapp/send-message', {
                  method: 'POST',
                  headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                  },
                  body: JSON.stringify({
                    integrationId: integration.id,
                    to: '521234567890',
                    message: '¡Hola! Este es un mensaje de prueba desde BotMaster 🤖'
                  })
                });
                
                if (messageResponse.status === 200) {
                  const messageData = await messageResponse.json();
                  console.log('✅ Mensaje enviado exitosamente');
                } else {
                  console.log('❌ Error enviando mensaje:', messageResponse.status);
                }
                break;
              }
            }
          }
          
          // Test 5: Desconectar WhatsApp
          console.log('\n🔌 Desconectando WhatsApp...');
          const disconnectResponse = await fetch(`http://localhost:5000/api/whatsapp/disconnect/${integration.id}`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({})
          });
          
          if (disconnectResponse.status === 200) {
            const disconnectData = await disconnectResponse.json();
            console.log('✅ WhatsApp desconectado exitosamente');
          } else {
            console.log('❌ Error desconectando:', disconnectResponse.status);
          }
          
        } else {
          console.log('❌ Error obteniendo QR:', qrResponse.status);
        }
      } else {
        console.log('❌ Error iniciando conexión:', connectResponse.status);
        const errorData = await connectResponse.json();
        console.log('Error:', errorData);
      }
    } else {
      console.log('❌ No se encontró integración para chatbot 26');
      
      // Crear nueva integración de prueba
      console.log('\n🆕 Creando nueva integración WhatsApp...');
      const createResponse = await fetch('http://localhost:5000/api/whatsapp/integrations', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          phoneNumber: '+52 55 9876 5432',
          displayName: 'Prueba WhatsApp Bot',
          businessDescription: 'Bot de prueba para integración WhatsApp',
          businessType: 'retail',
          autoRespond: true,
          chatbotId: '26',
          productId: 10,
          operatingHours: {
            enabled: false,
            timezone: 'America/Mexico_City',
            schedule: {}
          }
        })
      });
      
      if (createResponse.status === 200) {
        const newIntegration = await createResponse.json();
        console.log('✅ Nueva integración creada:', newIntegration.id);
      } else {
        console.log('❌ Error creando integración:', createResponse.status);
        const errorData = await createResponse.json();
        console.log('Error:', errorData);
      }
    }
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testCompleteWhatsAppWorkflow();