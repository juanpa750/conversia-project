import { storage } from './server/storage.js';
import { WhatsAppService } from './server/whatsappService.js';

async function testAppointmentSystem() {
  console.log('🧪 Iniciando prueba del sistema de citas...');
  
  try {
    // Crear una cita de prueba
    const testUserId = 'd91ec757-59a8-4171-a18e-96c0d60f9160';
    
    const appointmentData = {
      userId: testUserId,
      title: 'Consulta de Prueba',
      clientName: 'Juan Pérez',
      clientPhone: '+521234567890',
      clientEmail: 'juan@example.com',
      service: 'Consulta General',
      scheduledDate: new Date('2025-01-07T16:00:00.000Z'),
      duration: 60,
      description: 'Cita de prueba para verificar el sistema',
      status: 'scheduled'
    };

    console.log('📝 Creando cita de prueba...');
    const appointment = await storage.createAppointment(appointmentData);
    console.log('✅ Cita creada:', appointment);

    // Probar obtener horarios disponibles
    console.log('⏰ Verificando horarios disponibles...');
    const availableSlots = await storage.getAvailableSlots(testUserId, '2025-01-07');
    console.log('✅ Horarios disponibles:', availableSlots);

    // Probar notificación de WhatsApp
    console.log('📱 Enviando notificación de WhatsApp...');
    const whatsappResult = await WhatsAppService.sendAppointmentConfirmation(appointment, testUserId);
    console.log('✅ Notificación enviada:', whatsappResult);

    // Obtener todas las citas del usuario
    console.log('📋 Obteniendo citas del usuario...');
    const userAppointments = await storage.getAppointments(testUserId, '2025-01-07');
    console.log('✅ Citas encontradas:', userAppointments.length);

    console.log('🎉 Prueba del sistema completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Detalles:', error);
  }
}

testAppointmentSystem();