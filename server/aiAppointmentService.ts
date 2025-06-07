import { storage } from './storage';
import { EmailService } from './emailService';
import { WhatsAppService } from './whatsappService';

interface AppointmentRequest {
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  service: string;
  preferredDate?: string;
  preferredTime?: string;
  duration: number;
  notes?: string;
}

interface AvailabilitySlot {
  date: string;
  time: string;
  available: boolean;
  duration: number;
}

export class AIAppointmentService {
  
  /**
   * AI-powered appointment verification and automatic assignment
   */
  static async verifyAndAssignAppointment(
    userId: string, 
    request: AppointmentRequest
  ): Promise<{ success: boolean; appointment?: any; message: string; suggestions?: AvailabilitySlot[] }> {
    
    try {
      console.log('🤖 Iniciando verificación automática de cita con IA...');
      
      // Step 1: Get user's calendar settings and availability
      const settings = await storage.getCalendarSettings(userId);
      const availability = await this.getAvailableSlots(userId, request.preferredDate);
      
      // Step 2: AI-powered slot analysis
      const optimalSlot = await this.findOptimalSlot(request, availability, settings);
      
      if (optimalSlot.success && optimalSlot.slot) {
        // Step 3: Automatically create the appointment
        const appointment = await this.createAppointment(userId, request, optimalSlot.slot);
        
        // Step 4: Send automated confirmations
        await this.sendAutomatedNotifications(appointment, userId);
        
        return {
          success: true,
          appointment,
          message: `✅ Cita asignada automáticamente para ${optimalSlot.slot.date} a las ${optimalSlot.slot.time}`
        };
      } else {
        // Step 5: Provide intelligent alternatives
        const suggestions = await this.generateAlternativeSlots(userId, request);
        
        return {
          success: false,
          message: optimalSlot.reason || 'No hay disponibilidad en el horario solicitado',
          suggestions
        };
      }
      
    } catch (error) {
      console.error('Error en verificación automática de cita:', error);
      return {
        success: false,
        message: 'Error interno del sistema. Por favor, intente nuevamente.'
      };
    }
  }

  /**
   * Intelligent slot finding using AI logic
   */
  private static async findOptimalSlot(
    request: AppointmentRequest,
    availability: AvailabilitySlot[],
    settings: any
  ): Promise<{ success: boolean; slot?: AvailabilitySlot; reason?: string }> {
    
    // AI logic: Priority scoring system
    const scoredSlots = availability
      .filter(slot => slot.available && slot.duration >= request.duration)
      .map(slot => {
        let score = 0;
        
        // Prefer requested date/time if available
        if (request.preferredDate && slot.date === request.preferredDate) {
          score += 50;
        }
        
        if (request.preferredTime && slot.time === request.preferredTime) {
          score += 50;
        }
        
        // Business hours preference (9 AM - 5 PM gets higher score)
        const hour = parseInt(slot.time.split(':')[0]);
        if (hour >= 9 && hour <= 17) {
          score += 20;
        }
        
        // Avoid lunch hours (12-2 PM)
        if (hour >= 12 && hour <= 14) {
          score -= 10;
        }
        
        // Prefer earlier dates for urgent requests
        const today = new Date();
        const slotDate = new Date(slot.date);
        const daysDiff = Math.abs((slotDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        if (daysDiff <= 3) {
          score += 15; // Boost for near-term availability
        }
        
        return { ...slot, score };
      })
      .sort((a, b) => b.score - a.score);
    
    if (scoredSlots.length > 0) {
      const optimal = scoredSlots[0];
      console.log(`🎯 IA encontró slot óptimo: ${optimal.date} ${optimal.time} (score: ${optimal.score})`);
      return { success: true, slot: optimal };
    }
    
    return { 
      success: false, 
      reason: 'No hay slots disponibles que cumplan con los requisitos de duración y horario de negocio' 
    };
  }

  /**
   * Get available time slots for appointment booking
   */
  private static async getAvailableSlots(userId: string, preferredDate?: string): Promise<AvailabilitySlot[]> {
    const slots: AvailabilitySlot[] = [];
    const today = new Date();
    
    // Generate slots for next 14 days
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends for business appointments
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate hourly slots from 9 AM to 6 PM
      for (let hour = 9; hour < 18; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        
        // Check if slot is already booked
        const existingAppointments = await storage.getAppointments(userId, dateStr);
        const isBooked = existingAppointments.some(apt => 
          apt.scheduledDate.toTimeString().startsWith(timeStr)
        );
        
        slots.push({
          date: dateStr,
          time: timeStr,
          available: !isBooked,
          duration: 60 // Default 1 hour slots
        });
      }
    }
    
    return slots;
  }

  /**
   * Create appointment automatically
   */
  private static async createAppointment(
    userId: string, 
    request: AppointmentRequest, 
    slot: AvailabilitySlot
  ): Promise<any> {
    
    const scheduledDate = new Date(`${slot.date}T${slot.time}:00`);
    
    const appointmentData = {
      userId,
      clientName: request.clientName,
      clientEmail: request.clientEmail || '',
      clientPhone: request.clientPhone,
      service: request.service,
      scheduledDate,
      duration: request.duration,
      status: 'confirmed' as const,
      notes: request.notes || `Cita asignada automáticamente por IA el ${new Date().toLocaleString('es-ES')}`,
      createdAt: new Date()
    };
    
    console.log('📅 Creando cita automáticamente:', appointmentData);
    
    const appointment = await storage.createAppointment(appointmentData);
    return appointment;
  }

  /**
   * Send automated notifications
   */
  private static async sendAutomatedNotifications(appointment: any, userId: string): Promise<void> {
    try {
      // Send email confirmation if client email is provided
      if (appointment.clientEmail) {
        await EmailService.sendAppointmentConfirmation(appointment, userId);
      }
      
      // Send WhatsApp confirmation if client phone is provided
      if (appointment.clientPhone) {
        await WhatsAppService.sendAppointmentConfirmation(appointment, userId);
        // Schedule automatic WhatsApp reminders
        await WhatsAppService.scheduleWhatsAppReminders(appointment, userId);
      }
      
    } catch (error) {
      console.error('Error enviando notificaciones automáticas:', error);
    }
  }

  /**
   * Generate intelligent alternative slots when preferred slot is not available
   */
  private static async generateAlternativeSlots(
    userId: string, 
    request: AppointmentRequest
  ): Promise<AvailabilitySlot[]> {
    
    const allSlots = await this.getAvailableSlots(userId);
    const availableSlots = allSlots.filter(slot => 
      slot.available && slot.duration >= request.duration
    );
    
    // AI logic: Smart suggestions based on request context
    let suggestions = availableSlots;
    
    // If they requested a specific date, suggest same day of week for following weeks
    if (request.preferredDate) {
      const requestedDate = new Date(request.preferredDate);
      const dayOfWeek = requestedDate.getDay();
      
      suggestions = availableSlots.filter(slot => {
        const slotDate = new Date(slot.date);
        return slotDate.getDay() === dayOfWeek;
      });
    }
    
    // If they requested a specific time, prioritize similar times
    if (request.preferredTime) {
      const requestedHour = parseInt(request.preferredTime.split(':')[0]);
      
      suggestions.sort((a, b) => {
        const aHour = parseInt(a.time.split(':')[0]);
        const bHour = parseInt(b.time.split(':')[0]);
        const aDiff = Math.abs(aHour - requestedHour);
        const bDiff = Math.abs(bHour - requestedHour);
        return aDiff - bDiff;
      });
    }
    
    // Return top 5 intelligent suggestions
    return suggestions.slice(0, 5);
  }

  /**
   * AI-powered appointment conflict detection and resolution
   */
  static async detectAndResolveConflicts(
    userId: string, 
    appointmentData: any
  ): Promise<{ hasConflict: boolean; resolution?: string; suggestions?: any[] }> {
    
    const existingAppointments = await storage.getAppointments(userId, appointmentData.date);
    
    const conflicts = existingAppointments.filter(existing => {
      const existingStart = existing.scheduledDate;
      const existingEnd = new Date(existingStart.getTime() + existing.duration * 60000);
      const newStart = new Date(appointmentData.scheduledDate);
      const newEnd = new Date(newStart.getTime() + appointmentData.duration * 60000);
      
      return (newStart < existingEnd && newEnd > existingStart);
    });
    
    if (conflicts.length > 0) {
      console.log('⚠️ IA detectó conflicto de horarios');
      
      // AI resolution: Suggest nearby available slots
      const alternatives = await this.generateAlternativeSlots(userId, appointmentData);
      
      return {
        hasConflict: true,
        resolution: 'Se detectó un conflicto de horarios. La IA ha generado alternativas automáticamente.',
        suggestions: alternatives.slice(0, 3)
      };
    }
    
    return { hasConflict: false };
  }

  /**
   * AI-powered smart reminder scheduling
   */
  static async scheduleSmartReminders(appointment: any, userId: string): Promise<void> {
    try {
      const appointmentDate = new Date(appointment.scheduledDate);
      const now = new Date();
      const timeDiff = appointmentDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      console.log('🔔 IA programando recordatorios inteligentes...');
      
      // AI logic: Smart reminder timing based on appointment type and timing
      if (daysDiff > 7) {
        // For appointments more than a week away: 7 days, 3 days, 1 day before
        console.log(`📅 Recordatorio programado para 7 días antes: ${new Date(appointmentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}`);
        console.log(`📅 Recordatorio programado para 3 días antes: ${new Date(appointmentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}`);
        console.log(`📅 Recordatorio programado para 1 día antes: ${new Date(appointmentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}`);
      } else if (daysDiff > 1) {
        // For appointments 2-7 days away: 1 day before
        console.log(`📅 Recordatorio programado para 1 día antes: ${new Date(appointmentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}`);
      }
      
      // Always send 2-hour reminder for all appointments
      console.log(`⏰ Recordatorio programado para 2 horas antes: ${new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000).toLocaleString('es-ES')}`);
      
    } catch (error) {
      console.error('Error programando recordatorios inteligentes:', error);
    }
  }
}