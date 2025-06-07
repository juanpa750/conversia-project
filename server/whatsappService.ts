import { storage } from './storage';

interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'text' | 'template';
  templateName?: string;
  templateParams?: string[];
}

interface AppointmentWhatsAppData {
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  service: string;
  duration: number;
  companyName: string;
}

export class WhatsAppService {
  
  /**
   * Format WhatsApp message template with appointment data
   */
  private static formatWhatsAppTemplate(template: string, data: AppointmentWhatsAppData): string {
    return template
      .replace(/{clientName}/g, data.clientName)
      .replace(/{date}/g, new Date(data.date).toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }))
      .replace(/{time}/g, data.time)
      .replace(/{service}/g, data.service)
      .replace(/{duration}/g, data.duration.toString())
      .replace(/{companyName}/g, data.companyName || 'Nuestra empresa');
  }

  /**
   * Send WhatsApp appointment confirmation
   */
  static async sendAppointmentConfirmation(appointment: any, userId: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      const settings = await storage.getCalendarSettings(userId);
      
      const whatsappData: AppointmentWhatsAppData = {
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        date: appointment.date || appointment.scheduledDate,
        time: appointment.time || appointment.scheduledDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        service: appointment.service,
        duration: appointment.duration,
        companyName: user?.company || 'Nuestra empresa'
      };

      const defaultTemplate = `✅ *Confirmación de Cita*

Hola {clientName},

Tu cita ha sido *confirmada* para:
📅 *Fecha:* {date}
🕐 *Hora:* {time}
🔧 *Servicio:* {service}
⏱️ *Duración:* {duration} minutos

Gracias por confiar en {companyName}.

_Mensaje automático - No responder_`;

      const template = settings?.whatsappNotifications?.confirmationTemplate || defaultTemplate;
      const message = this.formatWhatsAppTemplate(template, whatsappData);

      // Send WhatsApp message (simulation for now)
      await this.sendWhatsAppMessage({
        to: appointment.clientPhone,
        message: message,
        type: 'text'
      });

      return true;
    } catch (error) {
      console.error('Error sending WhatsApp confirmation:', error);
      return false;
    }
  }

  /**
   * Send WhatsApp appointment reminder
   */
  static async sendAppointmentReminder(appointment: any, userId: string, reminderType: 'day' | 'hours'): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      const settings = await storage.getCalendarSettings(userId);
      
      const whatsappData: AppointmentWhatsAppData = {
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        date: appointment.date || appointment.scheduledDate,
        time: appointment.time || appointment.scheduledDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        service: appointment.service,
        duration: appointment.duration,
        companyName: user?.company || 'Nuestra empresa'
      };

      let defaultTemplate = '';
      
      if (reminderType === 'day') {
        defaultTemplate = `🔔 *Recordatorio de Cita*

Hola {clientName},

Te recordamos tu cita programada para *mañana*:
📅 *Fecha:* {date}
🕐 *Hora:* {time}
🔧 *Servicio:* {service}
⏱️ *Duración:* {duration} minutos

Nos vemos mañana en {companyName}.

_Mensaje automático - No responder_`;
      } else {
        defaultTemplate = `⏰ *Recordatorio Urgente*

Hola {clientName},

Tu cita es en *2 horas*:
📅 *Hoy:* {date}
🕐 *Hora:* {time}
🔧 *Servicio:* {service}

Te esperamos en {companyName}.

_Mensaje automático - No responder_`;
      }

      const template = settings?.whatsappNotifications?.reminderTemplate || defaultTemplate;
      const message = this.formatWhatsAppTemplate(template, whatsappData);

      await this.sendWhatsAppMessage({
        to: appointment.clientPhone,
        message: message,
        type: 'text'
      });

      return true;
    } catch (error) {
      console.error('Error sending WhatsApp reminder:', error);
      return false;
    }
  }

  /**
   * Send WhatsApp appointment cancellation
   */
  static async sendAppointmentCancellation(appointment: any, userId: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      const settings = await storage.getCalendarSettings(userId);
      
      const whatsappData: AppointmentWhatsAppData = {
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        date: appointment.date || appointment.scheduledDate,
        time: appointment.time || appointment.scheduledDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        service: appointment.service,
        duration: appointment.duration,
        companyName: user?.company || 'Nuestra empresa'
      };

      const defaultTemplate = `❌ *Cita Cancelada*

Hola {clientName},

Lamentamos informarte que tu cita del *{date} a las {time}* ha sido cancelada.

📞 Si necesitas reprogramar, no dudes en contactarnos.

Disculpa las molestias.

Saludos,
{companyName}

_Mensaje automático - No responder_`;

      const template = settings?.whatsappNotifications?.cancellationTemplate || defaultTemplate;
      const message = this.formatWhatsAppTemplate(template, whatsappData);

      await this.sendWhatsAppMessage({
        to: appointment.clientPhone,
        message: message,
        type: 'text'
      });

      return true;
    } catch (error) {
      console.error('Error sending WhatsApp cancellation:', error);
      return false;
    }
  }

  /**
   * Send WhatsApp message using the business WhatsApp API
   */
  private static async sendWhatsAppMessage(messageData: WhatsAppMessage): Promise<boolean> {
    try {
      // For now, we'll simulate the WhatsApp API call
      // In a real implementation, this would integrate with WhatsApp Business API
      
      console.log('📱 Enviando mensaje por WhatsApp:');
      console.log(`Para: ${messageData.to}`);
      console.log(`Tipo: ${messageData.type}`);
      console.log('Mensaje:');
      console.log('---');
      console.log(messageData.message);
      console.log('---');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real implementation, you would make the actual API call here:
      /*
      const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: messageData.to,
          type: 'text',
          text: {
            body: messageData.message
          }
        })
      });
      
      return response.ok;
      */
      
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Schedule automatic WhatsApp reminders for an appointment
   */
  static async scheduleWhatsAppReminders(appointment: any, userId: string): Promise<void> {
    try {
      const appointmentDate = new Date(appointment.scheduledDate);
      const now = new Date();
      const timeDiff = appointmentDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      const hoursDiff = Math.ceil(timeDiff / (1000 * 3600));

      console.log('📱 Programando recordatorios automáticos por WhatsApp...');
      
      // Schedule day-before reminder if appointment is more than 1 day away
      if (daysDiff > 1) {
        const reminderDate = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
        console.log(`📅 Recordatorio WhatsApp programado para: ${reminderDate.toLocaleString('es-ES')}`);
        
        // In a real implementation, you would schedule this with a job queue like Bull or Agenda
        // For now, we'll simulate the scheduling
        setTimeout(async () => {
          await this.sendAppointmentReminder(appointment, userId, 'day');
        }, Math.max(0, reminderDate.getTime() - now.getTime()));
      }
      
      // Schedule 2-hour reminder if appointment is more than 2 hours away
      if (hoursDiff > 2) {
        const reminderDate = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);
        console.log(`⏰ Recordatorio WhatsApp 2h programado para: ${reminderDate.toLocaleString('es-ES')}`);
        
        setTimeout(async () => {
          await this.sendAppointmentReminder(appointment, userId, 'hours');
        }, Math.max(0, reminderDate.getTime() - now.getTime()));
      }
      
    } catch (error) {
      console.error('Error scheduling WhatsApp reminders:', error);
    }
  }

  /**
   * Send bulk WhatsApp reminders for upcoming appointments
   */
  static async sendBulkReminders(userId: string): Promise<void> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const appointments = await storage.getAppointments(userId, tomorrowStr);
      
      console.log(`📱 Enviando recordatorios masivos para ${appointments.length} citas`);
      
      for (const appointment of appointments) {
        if (appointment.clientPhone) {
          await this.sendAppointmentReminder(appointment, userId, 'day');
          // Add delay between messages to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
    } catch (error) {
      console.error('Error sending bulk WhatsApp reminders:', error);
    }
  }

  /**
   * Validate WhatsApp phone number format
   */
  static validatePhoneNumber(phone: string): boolean {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid international format (8-15 digits)
    return cleanPhone.length >= 8 && cleanPhone.length <= 15;
  }

  /**
   * Format phone number for WhatsApp API
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleanPhone = phone.replace(/\D/g, '');
    
    // If it doesn't start with country code, assume it's Mexico (+52)
    if (!cleanPhone.startsWith('52') && cleanPhone.length === 10) {
      cleanPhone = '52' + cleanPhone;
    }
    
    return cleanPhone;
  }
}