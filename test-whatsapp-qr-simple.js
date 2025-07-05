import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import { execSync } from 'child_process';

// Función para detectar Chromium
function getChromiumPath() {
  try {
    const chromiumPath = execSync('which chromium', { encoding: 'utf8' }).trim();
    console.log('🔍 Chromium encontrado en:', chromiumPath);
    return chromiumPath;
  } catch (error) {
    console.log('⚠️ No se pudo encontrar Chromium:', error.message);
    return undefined;
  }
}

async function testWhatsAppQR() {
  console.log('🚀 Iniciando test de WhatsApp QR...');
  
  const chromiumPath = getChromiumPath();
  if (!chromiumPath) {
    console.error('❌ Chromium no encontrado');
    return;
  }

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'test-conversia',
      dataPath: './test-sessions'
    }),
    puppeteer: {
      headless: true,
      executablePath: chromiumPath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    }
  });

  let qrReceived = false;

  client.on('qr', async (qr) => {
    try {
      qrReceived = true;
      console.log('🔍 QR recibido!');
      console.log('📄 QR length:', qr.length);
      console.log('📄 QR prefix:', qr.substring(0, 50) + '...');
      
      // Validar QR
      if (qr.length < 100) {
        console.error('❌ QR muy corto, posible error');
        return;
      }
      
      // Generar imagen QR
      const qrImage = await qrcode.toDataURL(qr, {
        width: 512,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      console.log('✅ QR imagen generada exitosamente');
      console.log('📊 Imagen length:', qrImage.length);
      console.log('📊 Es data URL válida:', qrImage.startsWith('data:image/png;base64,'));
      
      // Verificar que la imagen base64 sea válida
      const base64Data = qrImage.replace('data:image/png;base64,', '');
      const buffer = Buffer.from(base64Data, 'base64');
      console.log('📊 Buffer size:', buffer.length, 'bytes');
      
      if (buffer.length > 1000) {
        console.log('✅ QR imagen parece válida - buffer suficientemente grande');
      } else {
        console.log('⚠️ QR imagen muy pequeña, posible problema');
      }

    } catch (error) {
      console.error('❌ Error procesando QR:', error);
    }
  });

  client.on('ready', () => {
    console.log('✅ Cliente WhatsApp listo');
  });

  client.on('authenticated', () => {
    console.log('🔐 WhatsApp autenticado');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
  });

  client.on('disconnected', (reason) => {
    console.log('🔌 Desconectado:', reason);
    process.exit(0);
  });

  client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Loading: ${percent}% - ${message}`);
  });

  try {
    console.log('🔄 Inicializando cliente...');
    await client.initialize();
    
    // Esperar 30 segundos para QR
    setTimeout(() => {
      if (!qrReceived) {
        console.log('⏰ Timeout - no se recibió QR en 30 segundos');
        client.destroy();
        process.exit(1);
      }
    }, 30000);
    
  } catch (error) {
    console.error('❌ Error inicializando cliente:', error);
    process.exit(1);
  }
}

// Ejecutar test
testWhatsAppQR().catch(console.error);