/**
 * ⚠️  OBSOLETO - WhatsApp Master API
 * 
 * Este archivo contiene la implementación de WhatsApp Master API que ya no se utiliza.
 * El sistema ahora usa WhatsApp Web (whatsapp-web.js) en lugar de Meta Cloud API.
 * 
 * Se mantiene por referencia histórica pero NO se usa en producción.
 * Fecha de deprecación: Enero 2025
 */

import { EventEmitter } from 'events';
import { whatsappNumbers, users, type WhatsappNumber, type User } from '@shared/schema';
import { db } from './db';
import { eq, and } from 'drizzle-orm';

interface MasterAPIConfig {
  accessToken: string;
  appId: string;
  appSecret: string;
  verifyToken: string;
  apiVersion: string;
  graphApiUrl: string;
}

interface ClientMetrics {
  clientId: string;
  clientName: string;
  phoneNumber: string;
  freeMessagesRemaining: number;
  monthlyFreeUsed: number;
  conversationsToday: number;
  totalConversations: number;
  lastActivity: Date | null;
}

export class WhatsAppMasterAPI extends EventEmitter {
  private config: MasterAPIConfig;

  constructor() {
    super();
    this.config = {
      accessToken: process.env.WHATSAPP_MASTER_TOKEN || '',
      appId: process.env.WHATSAPP_APP_ID || '',
      appSecret: process.env.WHATSAPP_APP_SECRET || '',
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
      apiVersion: 'v18.0',
      graphApiUrl: 'https://graph.facebook.com'
    };
  }

  /**
   * Automatically add client WhatsApp number to Meta Business Manager
   */
  async addClientNumberToMeta(phoneNumber: string, countryCode: string = '57'): Promise<{
    success: boolean;
    phoneNumberId?: string;
    error?: string;
  }> {
    if (!process.env.WHATSAPP_BUSINESS_ACCOUNT_ID) {
      return {
        success: false,
        error: 'Business Account ID not configured'
      };
    }

    try {
      // Clean phone number (remove any formatting)
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      
      // Add phone number to Business Manager
      const response = await fetch(
        `${this.config.graphApiUrl}/${this.config.apiVersion}/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/phone_numbers`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cc: countryCode,
            phone_number: cleanNumber,
            migrated_number: `+${countryCode}${cleanNumber}`
          })
        }
      );

      const result = await response.json();

      if (response.ok && result.id) {
        return {
          success: true,
          phoneNumberId: result.id
        };
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to add phone number to Meta'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }

  /**
   * Verify phone number with SMS code
   */
  async verifyPhoneNumber(phoneNumberId: string, verificationCode: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.config.graphApiUrl}/${this.config.apiVersion}/${phoneNumberId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: verificationCode
          })
        }
      );

      const result = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error?.message || 'Verification failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }

  /**
   * Generate unique setup code for new client
   */
  generateSetupCode(): string {
    return `WA${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  /**
   * Register new client with setup code
   */
  async registerClient(clientData: {
    name: string;
    email: string;
    businessName: string;
  }): Promise<{ setupCode: string; clientId: string }> {
    const setupCode = this.generateSetupCode();
    
    // Create client with setup code  
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const [client] = await db.insert(users).values({
      id: clientId,
      email: clientData.email,
      firstName: clientData.name,
      company: clientData.businessName,
      setupCode: setupCode,
      phoneVerified: false,
      monthlyFreeUsed: 0,
      monthlyFreeLimit: 1000,
      lastResetDate: new Date(),
      role: 'user'
    }).returning();

    return {
      setupCode,
      clientId: client.id
    };
  }

  /**
   * Add WhatsApp number to master account (FULLY AUTOMATED)
   */
  async addClientWhatsAppNumber(setupCode: string, phoneNumber: string, displayName: string): Promise<{
    success: boolean;
    phoneNumberId?: string;
    error?: string;
    requiresVerification?: boolean;
    verificationId?: string;
  }> {
    try {
      // Find client by setup code
      const [client] = await db.select().from(users).where(eq(users.setupCode, setupCode));
      
      if (!client) {
        return { success: false, error: 'Código de configuración inválido' };
      }

      // Step 1: Add phone number to Meta Business Manager
      const metaResult = await this.addClientNumberToMeta(phoneNumber);
      
      if (!metaResult.success) {
        return { 
          success: false, 
          error: `Error Meta API: ${metaResult.error}` 
        };
      }

      // Step 2: Save to whatsapp_numbers table
      await db.insert(whatsappNumbers).values({
        clientId: client.id,
        phoneNumber: phoneNumber,
        phoneNumberId: metaResult.phoneNumberId!,
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
        displayName: displayName,
        verificationStatus: 'pending_verification',
        webhookConfigured: false
      });

      // Step 3: Update client with phone info
      await db.update(users)
        .set({
          phoneNumberId: metaResult.phoneNumberId,
          businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
          phoneVerified: false // Will be true after SMS verification
        })
        .where(eq(users.id, client.id));

      return {
        success: true,
        phoneNumberId: metaResult.phoneNumberId!,
        requiresVerification: true,
        verificationId: metaResult.phoneNumberId!
      };

    } catch (error) {
      console.error('Error adding WhatsApp number:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Complete phone verification with SMS code
   */
  async completePhoneVerification(phoneNumberId: string, verificationCode: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verify with Meta
      const verifyResult = await this.verifyPhoneNumber(phoneNumberId, verificationCode);
      
      if (!verifyResult.success) {
        return verifyResult;
      }

      // Update database records
      await db.update(whatsappNumbers)
        .set({
          verificationStatus: 'verified',
          webhookConfigured: true
        })
        .where(eq(whatsappNumbers.phoneNumberId, phoneNumberId));

      await db.update(users)
        .set({
          phoneVerified: true
        })
        .where(eq(users.phoneNumberId, phoneNumberId));

      return { success: true };

    } catch (error) {
      console.error('Error completing verification:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Find client by phone number ID (for webhook processing)
   */
  async findClientByPhoneId(phoneNumberId: string): Promise<User | null> {
    const [client] = await db.select().from(users).where(eq(users.phoneNumberId, phoneNumberId));
    return client || null;
  }

  /**
   * Process incoming message for specific client
   */
  async processIncomingMessage(message: any, client: User): Promise<void> {
    try {
      // Check if this starts a new conversation window (24h free window)
      const isFreeConversation = await this.checkFreeConversationWindow(
        message.from,
        client.phoneNumberId!
      );

      // Generate AI response using client's configuration
      const aiResponse = await this.generateClientAIResponse(message.text?.body || '', client);

      // Send response via WhatsApp
      await this.sendWhatsAppMessage(client.phoneNumberId!, message.from, aiResponse);

      // Update message counter if not in free window
      if (!isFreeConversation) {
        await this.updateClientMessageCounter(client.id);
      }

      // Log message for analytics
      await this.logMessage({
        clientId: client.id,
        fromNumber: message.from,
        toNumber: client.phoneNumberId!,
        messageText: message.text?.body || '',
        aiResponse: aiResponse,
        isIncoming: true,
        wasAutoReplied: true
      });

    } catch (error) {
      console.error('Error processing message for client:', client.id, error);
    }
  }

  /**
   * Check if conversation is within 24h free window
   */
  private async checkFreeConversationWindow(customerPhone: string, phoneNumberId: string): Promise<boolean> {
    // Implementation would check last customer message timestamp
    // If within 24 hours, it's free. If customer initiated, it's free.
    // This is a simplified version
    return true; // Most conversations from customers are free
  }

  /**
   * Generate AI response specific to client's configuration
   */
  private async generateClientAIResponse(message: string, client: User): Promise<string> {
    // Get client's AI personality and product information
    // This would integrate with your existing AI service
    
    const defaultPersonality = `Eres un asistente ${client.company || 'comercial'} amigable y profesional. 
    Responde de manera natural, sin sonar robótico. 
    Ayuda al cliente con información sobre productos y servicios.
    Mantén un tono conversacional y útil.`;

    // For now, return a personalized response
    return `¡Hola! Gracias por contactar a ${client.company || client.firstName}. 
    He recibido tu mensaje: "${message}". 
    ¿En qué puedo ayudarte hoy?`;
  }

  /**
   * Send WhatsApp message via Meta API
   */
  private async sendWhatsAppMessage(phoneNumberId: string, to: string, message: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.config.graphApiUrl}/${this.config.apiVersion}/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to,
            text: { body: message }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Update client's monthly message counter
   */
  private async updateClientMessageCounter(clientId: string): Promise<void> {
    const [client] = await db.select().from(users).where(eq(users.id, clientId));
    
    if (!client) return;

    // Check if we need to reset counter (new month)
    const now = new Date();
    const lastReset = client.lastResetDate ? new Date(client.lastResetDate) : now;
    
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      // Reset counter for new month
      await db.update(users)
        .set({
          monthlyFreeUsed: 1,
          lastResetDate: now
        })
        .where(eq(users.id, clientId));
    } else {
      // Increment counter
      await db.update(users)
        .set({
          monthlyFreeUsed: (client.monthlyFreeUsed || 0) + 1
        })
        .where(eq(users.id, clientId));
    }
  }

  /**
   * Log message for analytics
   */
  private async logMessage(messageData: {
    clientId: string;
    fromNumber: string;
    toNumber: string;
    messageText: string;
    aiResponse: string;
    isIncoming: boolean;
    wasAutoReplied: boolean;
  }): Promise<void> {
    // Implementation would log to whatsappMessages table
    console.log('Message logged:', {
      client: messageData.clientId,
      from: messageData.fromNumber,
      message: messageData.messageText
    });
  }

  /**
   * Get metrics for all clients
   */
  async getAllClientsMetrics(): Promise<ClientMetrics[]> {
    const clients = await db.select().from(users).where(eq(users.phoneVerified, true));

    return clients.map(client => ({
      clientId: client.id,
      clientName: client.firstName || 'Cliente',
      phoneNumber: client.phoneNumberId || '',
      freeMessagesRemaining: (client.monthlyFreeLimit || 1000) - (client.monthlyFreeUsed || 0),
      monthlyFreeUsed: client.monthlyFreeUsed || 0,
      conversationsToday: 0, // Would be calculated from messages
      totalConversations: 0, // Would be calculated from messages
      lastActivity: null // Would be calculated from messages
    }));
  }

  /**
   * Get metrics for specific client
   */
  async getClientMetrics(clientId: string): Promise<ClientMetrics | null> {
    const [client] = await db.select().from(users).where(eq(users.id, clientId));
    
    if (!client) return null;

    return {
      clientId: client.id,
      clientName: client.firstName || 'Cliente',
      phoneNumber: client.phoneNumberId || '',
      freeMessagesRemaining: (client.monthlyFreeLimit || 1000) - (client.monthlyFreeUsed || 0),
      monthlyFreeUsed: client.monthlyFreeUsed || 0,
      conversationsToday: 0, // Would be calculated from messages
      totalConversations: 0, // Would be calculated from messages
      lastActivity: null // Would be calculated from messages
    };
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config.verifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Validate master configuration
   */
  validateMasterConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.accessToken) {
      errors.push('WHATSAPP_MASTER_TOKEN requerido');
    }

    if (!this.config.verifyToken) {
      errors.push('WHATSAPP_VERIFY_TOKEN requerido');
    }

    if (!this.config.appId) {
      errors.push('WHATSAPP_APP_ID requerido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const whatsappMasterAPI = new WhatsAppMasterAPI();