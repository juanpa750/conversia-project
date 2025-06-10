import { EventEmitter } from 'events';
import fetch from 'node-fetch';

interface WhatsAppCloudConfig {
  accessToken: string;
  phoneNumberId: string;
  verifyToken: string;
  apiVersion: string;
  graphApiUrl: string;
}

interface MessageData {
  from: string;
  to: string;
  message: string;
  timestamp: number;
  messageId: string;
  conversationType: 'service' | 'marketing';
}

interface ConversationWindow {
  isFree: boolean;
  reason: string;
  expiresAt: Date | null;
  conversationType: 'service' | 'marketing';
}

interface MessageCounter {
  freeMessagesUsed: number;
  freeMessagesLimit: number;
  resetDate: Date;
  serviceConversations: number;
}

export class WhatsAppCloudAPI extends EventEmitter {
  private config: WhatsAppCloudConfig;
  private conversationWindows: Map<string, Date> = new Map();

  constructor() {
    super();
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
      apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
      graphApiUrl: process.env.GRAPH_API_URL || 'https://graph.facebook.com'
    };
  }

  /**
   * Verificar webhook de WhatsApp (GET)
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    console.log('🔍 Verifying WhatsApp webhook...');
    
    if (mode === 'subscribe' && token === this.config.verifyToken) {
      console.log('✅ Webhook verified successfully');
      return challenge;
    }
    
    console.log('❌ Webhook verification failed');
    return null;
  }

  /**
   * Procesar mensaje entrante del webhook (POST)
   */
  async processIncomingMessage(webhookData: any): Promise<void> {
    try {
      console.log('📨 Processing incoming WhatsApp message...');
      
      const entry = webhookData.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      
      if (!value?.messages) {
        console.log('ℹ️ No messages in webhook data');
        return;
      }

      const message = value.messages[0];
      const contact = value.contacts?.[0];
      const metadata = value.metadata;

      const messageData: MessageData = {
        from: message.from,
        to: metadata.phone_number_id,
        message: message.text?.body || message.type,
        timestamp: parseInt(message.timestamp),
        messageId: message.id,
        conversationType: 'service' // Cliente inició = servicio gratuito
      };

      console.log(`📱 Message from ${messageData.from}: ${messageData.message}`);

      // Actualizar ventana de conversación gratuita
      this.updateConversationWindow(messageData.from);

      // Emitir evento para que el CRM procese el mensaje
      this.emit('message_received', messageData, contact);

    } catch (error) {
      console.error('❌ Error processing incoming message:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje vía WhatsApp Cloud API
   */
  async sendMessage(to: string, message: string, clientId: string): Promise<{ success: boolean; messageId?: string; cost?: number; error?: string }> {
    try {
      console.log(`📤 Sending WhatsApp message to ${to}`);

      // Verificar ventana gratuita
      const window = await this.checkFreeWindow(to, clientId);
      
      if (!window.isFree) {
        const counter = await this.getMessageCounter(clientId);
        if (counter.freeMessagesUsed >= counter.freeMessagesLimit) {
          return { 
            success: false, 
            error: 'Free message limit reached for this month' 
          };
        }
      }

      const url = `${this.config.graphApiUrl}/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json() as any;

      if (response.ok && result.messages?.[0]?.id) {
        console.log('✅ Message sent successfully');
        
        // Actualizar contador solo si no es conversación de servicio gratuita
        if (!window.isFree) {
          await this.updateMessageCounter(clientId, window.conversationType);
        }

        return { 
          success: true, 
          messageId: result.messages[0].id,
          cost: window.isFree ? 0 : 1
        };
      } else {
        console.error('❌ WhatsApp API error:', result);
        return { 
          success: false, 
          error: result.error?.message || 'Failed to send message' 
        };
      }

    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Verificar ventana de conversación gratuita (24h después de que cliente inició)
   */
  async checkFreeWindow(customerPhone: string, clientId: string): Promise<ConversationWindow> {
    const lastCustomerMessage = this.conversationWindows.get(customerPhone);
    
    if (!lastCustomerMessage) {
      return {
        isFree: false,
        reason: 'No recent customer-initiated conversation',
        expiresAt: null,
        conversationType: 'marketing'
      };
    }

    const now = new Date();
    const windowExpiry = new Date(lastCustomerMessage.getTime() + (24 * 60 * 60 * 1000));

    if (now <= windowExpiry) {
      return {
        isFree: true,
        reason: 'Within 24h service window',
        expiresAt: windowExpiry,
        conversationType: 'service'
      };
    }

    return {
      isFree: false,
      reason: '24h service window expired',
      expiresAt: null,
      conversationType: 'marketing'
    };
  }

  /**
   * Actualizar ventana de conversación cuando cliente envía mensaje
   */
  private updateConversationWindow(customerPhone: string): void {
    this.conversationWindows.set(customerPhone, new Date());
    console.log(`🕐 Updated conversation window for ${customerPhone}`);
  }

  /**
   * Obtener contador de mensajes gratuitos del cliente
   */
  async getMessageCounter(clientId: string): Promise<MessageCounter> {
    // Esta función será implementada por el CRM para consultar la base de datos
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // Primer día del próximo mes

    return {
      freeMessagesUsed: 0, // Obtener de base de datos
      freeMessagesLimit: 1000,
      resetDate: resetDate,
      serviceConversations: 0
    };
  }

  /**
   * Actualizar contador de mensajes
   */
  async updateMessageCounter(clientId: string, conversationType: 'service' | 'marketing'): Promise<void> {
    console.log(`📊 Updating message counter for client ${clientId}, type: ${conversationType}`);
    
    // Solo contar mensajes de marketing hacia el límite de 1000
    if (conversationType === 'marketing') {
      // Actualizar en base de datos: incrementar monthly_free_messages_used
      this.emit('update_message_counter', clientId, conversationType);
    }
  }

  /**
   * Enviar mensaje de prueba
   */
  async sendTestMessage(clientId: string, phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    const testMessage = '¡Hola! Este es un mensaje de prueba desde tu WhatsApp Business API. La integración está funcionando correctamente. 🎉';
    
    const result = await this.sendMessage(phoneNumber, testMessage, clientId);
    
    if (result.success) {
      console.log('✅ Test message sent successfully');
      return { success: true };
    } else {
      console.error('❌ Test message failed:', result.error);
      return { success: false, error: result.error };
    }
  }

  /**
   * Validar configuración de WhatsApp
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.accessToken) {
      errors.push('WHATSAPP_ACCESS_TOKEN is required');
    }
    if (!this.config.phoneNumberId) {
      errors.push('WHATSAPP_PHONE_NUMBER_ID is required');
    }
    if (!this.config.verifyToken) {
      errors.push('WHATSAPP_VERIFY_TOKEN is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtener estado de conexión
   */
  async getConnectionStatus(): Promise<{ connected: boolean; phoneNumber?: string; error?: string }> {
    try {
      const url = `${this.config.graphApiUrl}/${this.config.apiVersion}/${this.config.phoneNumberId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json() as any;
        return {
          connected: true,
          phoneNumber: data.display_phone_number
        };
      } else {
        return {
          connected: false,
          error: 'Failed to connect to WhatsApp API'
        };
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const whatsappCloudAPI = new WhatsAppCloudAPI();