// Test script for WhatsApp Simple functionality
const fetch = require('node-fetch');

async function testWhatsAppSimple() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    // First, login to get a valid token
    console.log('🔐 Logging in...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');
    
    // Test WhatsApp Simple connection
    console.log('📱 Testing WhatsApp Simple connection...');
    const connectResponse = await fetch(`${baseUrl}/api/whatsapp-simple/connect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (connectResponse.ok) {
      const connectData = await connectResponse.json();
      console.log('✅ WhatsApp connection initiated:', connectData);
    } else {
      console.log('❌ Connection failed:', await connectResponse.text());
    }
    
    // Wait a moment for QR generation
    setTimeout(async () => {
      // Test QR code generation
      console.log('📋 Testing QR code generation...');
      const qrResponse = await fetch(`${baseUrl}/api/whatsapp-simple/qr`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        console.log('✅ QR code generated successfully:', {
          success: qrData.success,
          status: qrData.status,
          hasQrCode: !!qrData.qrCode
        });
      } else {
        console.log('❌ QR generation failed:', await qrResponse.text());
      }
      
      // Test status endpoint
      console.log('📊 Testing status endpoint...');
      const statusResponse = await fetch(`${baseUrl}/api/whatsapp-simple/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('✅ Status retrieved:', statusData);
      } else {
        console.log('❌ Status failed:', await statusResponse.text());
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testWhatsAppSimple();