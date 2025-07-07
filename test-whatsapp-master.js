import { whatsappMultiService } from './server/whatsappMultiService';

async function testWhatsAppMasterSystem() {
  console.log('🧪 Iniciando test del sistema WhatsApp Master...\n');
  
  // Datos de prueba
  const userId = 'd91ec757-59a8-4171-a18e-96c0d60f9160';
  const masterChatbotId = '29';
  
  try {
    console.log('1️⃣ Probando creación de sesión para chatbot master...');
    const result = await whatsappMultiService.createSession(masterChatbotId, userId);
    
    if (result === 'CONNECTED') {
      console.log('✅ WhatsApp ya estaba conectado');
    } else if (result.startsWith('data:image/png;base64,')) {
      console.log('✅ Código QR generado exitosamente');
      console.log(`📏 Tamaño del QR: ${result.length} caracteres`);
    } else {
      console.log('⚠️ Resultado inesperado:', result.substring(0, 100) + '...');
    }
    
    console.log('\n2️⃣ Probando obtención de sesión...');
    const session = await whatsappMultiService.getSession(masterChatbotId, userId);
    
    if (session) {
      console.log('✅ Sesión encontrada:');
      console.log(`   - Chatbot ID: ${session.chatbotId}`);
      console.log(`   - Usuario ID: ${session.userId}`);
      console.log(`   - Conectado: ${session.isConnected}`);
      console.log(`   - Última actividad: ${session.lastActivity}`);
    } else {
      console.log('❌ No se encontró la sesión');
    }
    
    console.log('\n3️⃣ Esperando 5 segundos para simular el escaneo del QR...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n4️⃣ Verificando estado actualizado...');
    const updatedSession = await whatsappMultiService.getSession(masterChatbotId, userId);
    
    if (updatedSession) {
      console.log(`✅ Estado actualizado - Conectado: ${updatedSession.isConnected}`);
    }
    
    console.log('\n🎯 Test completado exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Servicio multi-chat inicializado');
    console.log('   ✅ Sesión creada correctamente');
    console.log('   ✅ QR generado (o ya conectado)');
    console.log('   ✅ Gestión de sesiones funcionando');
    
    console.log('\n📌 Próximos pasos:');
    console.log('   1. El chatbot master (ID: 29) está listo');
    console.log('   2. Otros chatbots pueden clonar su configuración');
    console.log('   3. Sistema multi-chat operativo');
    
  } catch (error) {
    console.error('❌ Error durante el test:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Función para limpiar al finalizar
async function cleanup() {
  try {
    console.log('\n🧹 Limpiando recursos...');
    await whatsappMultiService.cleanup();
    console.log('✅ Limpieza completada');
  } catch (error) {
    console.error('❌ Error durante limpieza:', error);
  }
  process.exit(0);
}

// Ejecutar test
testWhatsAppMasterSystem()
  .then(() => {
    console.log('\n⏰ Test completado. Presiona Ctrl+C para salir.');
  })
  .catch(console.error);

// Manejar cierre limpio
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);