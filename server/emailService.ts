import { storage } from './storage';

interface EmailTemplate {
  subject: string;
  body: string;
}

interface AppointmentEmailData {
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  service: string;
  duration: number;
  companyName: string;
  businessEmail: string;
}

export class EmailService {
  private static formatTemplate(template: string, data: AppointmentEmailData): string {
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

  static async sendAppointmentConfirmation(appointment: any, userId: string): Promise<boolean> {
    try {
      // Get user business email
      const user = await storage.getUser(userId);
      if (!user?.businessEmail) {
        console.log('No business email configured for user:', userId);
        return false;
      }

      // Get calendar settings for email templates
      const settings = await storage.getCalendarSettings(userId);
      
      const emailData: AppointmentEmailData = {
        clientName: appointment.clientName,
        clientEmail: appointment.clientEmail,
        date: appointment.date,
        time: appointment.time,
        service: appointment.service,
        duration: appointment.duration,
        companyName: user.company || 'Nuestra empresa',
        businessEmail: user.businessEmail
      };

      const defaultTemplate = `Estimado/a {clientName},

Su cita ha sido confirmada para el {date} a las {time}.

Detalles:
- Servicio: {service}
- Duración: {duration} minutos

Gracias por su confianza.

Saludos cordiales,
{companyName}`;

      const template = settings?.emailNotifications?.confirmationTemplate || defaultTemplate;
      const emailBody = this.formatTemplate(template, emailData);

      // Simulate email sending (in real implementation, use SendGrid or similar)
      console.log('📧 Enviando confirmación de cita por email:');
      console.log('To:', appointment.clientEmail);
      console.log('From:', user.businessEmail);
      console.log('Subject: Confirmación de Cita');
      console.log('Body:', emailBody);
      console.log('---');

      return true;
    } catch (error) {
      console.error('Error sending appointment confirmation email:', error);
      return false;
    }
  }

  static async sendAppointmentReminder(appointment: any, userId: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user?.businessEmail) {
        return false;
      }

      const settings = await storage.getCalendarSettings(userId);
      
      const emailData: AppointmentEmailData = {
        clientName: appointment.clientName,
        clientEmail: appointment.clientEmail,
        date: appointment.date,
        time: appointment.time,
        service: appointment.service,
        duration: appointment.duration,
        companyName: user.company || 'Nuestra empresa',
        businessEmail: user.businessEmail
      };

      const defaultTemplate = `Estimado/a {clientName},

Le recordamos su cita programada para mañana {date} a las {time}.

Detalles:
- Servicio: {service}
- Duración: {duration} minutos

Saludos cordiales,
{companyName}`;

      const template = settings?.emailNotifications?.reminderTemplate || defaultTemplate;
      const emailBody = this.formatTemplate(template, emailData);

      console.log('🔔 Enviando recordatorio de cita por email:');
      console.log('To:', appointment.clientEmail);
      console.log('From:', user.businessEmail);
      console.log('Subject: Recordatorio de Cita');
      console.log('Body:', emailBody);
      console.log('---');

      return true;
    } catch (error) {
      console.error('Error sending appointment reminder email:', error);
      return false;
    }
  }

  static async sendAppointmentCancellation(appointment: any, userId: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user?.businessEmail) {
        return false;
      }

      const settings = await storage.getCalendarSettings(userId);
      
      const emailData: AppointmentEmailData = {
        clientName: appointment.clientName,
        clientEmail: appointment.clientEmail,
        date: appointment.date,
        time: appointment.time,
        service: appointment.service,
        duration: appointment.duration,
        companyName: user.company || 'Nuestra empresa',
        businessEmail: user.businessEmail
      };

      const defaultTemplate = `Estimado/a {clientName},

Le informamos que su cita del {date} a las {time} ha sido cancelada.

Si necesita reprogramar, no dude en contactarnos.

Saludos cordiales,
{companyName}`;

      const template = settings?.emailNotifications?.cancellationTemplate || defaultTemplate;
      const emailBody = this.formatTemplate(template, emailData);

      console.log('❌ Enviando cancelación de cita por email:');
      console.log('To:', appointment.clientEmail);
      console.log('From:', user.businessEmail);
      console.log('Subject: Cancelación de Cita');
      console.log('Body:', emailBody);
      console.log('---');

      return true;
    } catch (error) {
      console.error('Error sending appointment cancellation email:', error);
      return false;
    }
  }
}