import { storage } from './storage';
import type { WhatsappIntegration, InsertWhatsappMessage } from '@shared/schema';

interface WhatsAppAPIMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text' | 'template' | 'image' | 'document';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
  image?: {
    link: string;
    caption?: string;
  };
  document?: {
    link: string;
    filename: string;
    caption?: string;
  };
}

interface WhatsAppWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  audio?: {
    id: string;
    mime_type: string;
  };
  video?: {
    id: string;
    mime_type: string;
  };
  document?: {
    id: string;
    mime_type: string;
    filename: string;
    caption?: string;
  };
}

export class WhatsAppAPI {
  private static readonly BASE_URL = 'https://graph.facebook.com/v18.0';

  /**
   * Send a WhatsApp message using the Business API
   */
  static async sendMessage(
    integration: WhatsappIntegration,
    to: string,
    message: WhatsAppAPIMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!integration.accessToken || !integration.phoneNumberId) {
        return { success: false, error: 'Configuración de WhatsApp incompleta' };
      }

      const url = `${this.BASE_URL}/${integration.phoneNumberId}/messages`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...message,
          to: this.formatPhoneNumber(to),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('WhatsApp API Error:', result);
        return { 
          success: false, 
          error: result.error?.message || 'Error enviando mensaje' 
        };
      }

      // Log message to database
      await this.logMessage({
        integrationId: integration.id,
        messageId: result.messages[0].id,
        conversationId: `${integration.phoneNumberId}_${to}`,
        fromNumber: integration.phoneNumber,
        toNumber: to,
        messageType: message.type,
        content: this.extractMessageContent(message),
        direction: 'outbound',
        status: 'sent',
        timestamp: new Date(),
      });

      // Update integration stats
      await storage.updateWhatsappIntegration(integration.id, {
        messagesSent: (integration.messagesSent || 0) + 1,
        lastMessageAt: new Date(),
      });

      return { success: true, messageId: result.messages[0].id };
    } catch (error: any) {
      console.error('WhatsApp send error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a text message
   */
  static async sendTextMessage(
    integration: WhatsappIntegration,
    to: string,
    text: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendMessage(integration, to, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    });
  }

  /**
   * Send a template message
   */
  static async sendTemplateMessage(
    integration: WhatsappIntegration,
    to: string,
    templateName: string,
    parameters: string[] = []
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendMessage(integration, to, {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'es' },
        components: parameters.length > 0 ? [{
          type: 'body',
          parameters: parameters.map(param => ({
            type: 'text',
            text: param,
          })),
        }] : undefined,
      },
    });
  }

  /**
   * Send an image message
   */
  static async sendImageMessage(
    integration: WhatsappIntegration,
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendMessage(integration, to, {
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: {
        link: imageUrl,
        caption,
      },
    });
  }

  /**
   * Process incoming webhook message
   */
  static async processWebhookMessage(
    integration: WhatsappIntegration,
    message: WhatsAppWebhookMessage,
    conversationId: string
  ): Promise<void> {
    try {
      // Log incoming message
      await this.logMessage({
        integrationId: integration.id,
        messageId: message.id,
        conversationId,
        fromNumber: message.from,
        toNumber: integration.phoneNumber,
        messageType: message.type,
        content: this.extractWebhookMessageContent(message),
        mediaUrl: await this.getMediaUrl(integration, message),
        direction: 'inbound',
        status: 'received',
        timestamp: new Date(parseInt(message.timestamp) * 1000),
      });

      // Update integration stats
      await storage.updateWhatsappIntegration(integration.id, {
        messagesReceived: (integration.messagesReceived || 0) + 1,
        lastMessageAt: new Date(),
      });

      // Process message with chatbot logic
      await this.processChatbotResponse(integration, message, conversationId);

    } catch (error) {
      console.error('Error processing webhook message:', error);
    }
  }

  /**
   * Process chatbot response for incoming message
   */
  private static async processChatbotResponse(
    integration: WhatsappIntegration,
    message: WhatsAppWebhookMessage,
    conversationId: string
  ): Promise<void> {
    try {
      // Get active chatbots for this user
      const chatbots = await storage.getChatbots(integration.userId);
      
      if (chatbots.length === 0) return;

      // For now, use the first active chatbot
      const activeChatbot = chatbots.find(bot => bot.status === 'active') || chatbots[0];
      
      if (!activeChatbot) return;

      const messageText = this.extractWebhookMessageContent(message);
      
      // Simple keyword-based response (can be enhanced with AI)
      let response = await this.generateChatbotResponse(activeChatbot, messageText);
      
      if (response) {
        // Send response after a short delay to seem more natural
        setTimeout(async () => {
          await this.sendTextMessage(integration, message.from, response);
        }, 1000 + Math.random() * 2000); // 1-3 second delay
      }

    } catch (error) {
      console.error('Error processing chatbot response:', error);
    }
  }

  /**
   * Generate chatbot response based on message
   */
  private static async generateChatbotResponse(chatbot: any, message: string): Promise<string | null> {
    // Simple keyword-based responses for now
    const lowerMessage = message.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
      return `¡Hola! Soy ${chatbot.name}. ¿En qué puedo ayudarte hoy?`;
    }
    
    // Help responses
    if (lowerMessage.includes('ayuda') || lowerMessage.includes('info') || lowerMessage.includes('información')) {
      return `Estoy aquí para ayudarte. Puedo ayudarte con información sobre nuestros servicios, agendar citas, y responder tus preguntas.`;
    }
    
    // Appointment responses
    if (lowerMessage.includes('cita') || lowerMessage.includes('agendar') || lowerMessage.includes('reservar')) {
      return `Te puedo ayudar a agendar una cita. ¿Qué día te gustaría? Puedes decirme algo como "quiero una cita para mañana" o "necesito agendar para el viernes".`;
    }
    
    // Product/service responses
    if (lowerMessage.includes('servicio') || lowerMessage.includes('producto') || lowerMessage.includes('precio')) {
      return `Te puedo dar información sobre nuestros servicios. ¿Hay algo específico que te interese? También puedo ayudarte a agendar una consulta.`;
    }
    
    // Default response for unrecognized messages
    return `Gracias por tu mensaje. Un momento, te ayudo con eso. Si necesitas hablar con una persona, escribe "hablar con agente".`;
  }

  /**
   * Log message to database
   */
  private static async logMessage(messageData: InsertWhatsappMessage): Promise<void> {
    try {
      await storage.createWhatsappMessage(messageData);
    } catch (error) {
      console.error('Error logging WhatsApp message:', error);
    }
  }

  /**
   * Get media URL from WhatsApp API
   */
  private static async getMediaUrl(
    integration: WhatsappIntegration,
    message: WhatsAppWebhookMessage
  ): Promise<string | undefined> {
    if (!message.image && !message.audio && !message.video && !message.document) {
      return undefined;
    }

    try {
      const mediaId = message.image?.id || message.audio?.id || message.video?.id || message.document?.id;
      
      if (!mediaId || !integration.accessToken) return undefined;

      // Get media URL from WhatsApp API
      const response = await fetch(`${this.BASE_URL}/${mediaId}`, {
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
        },
      });

      const result = await response.json();
      return result.url;

    } catch (error) {
      console.error('Error getting media URL:', error);
      return undefined;
    }
  }

  /**
   * Extract message content from API message
   */
  private static extractMessageContent(message: WhatsAppAPIMessage): string {
    if (message.text) return message.text.body;
    if (message.template) return `Template: ${message.template.name}`;
    if (message.image) return message.image.caption || 'Image';
    if (message.document) return message.document.caption || message.document.filename || 'Document';
    return 'Message';
  }

  /**
   * Extract message content from webhook message
   */
  private static extractWebhookMessageContent(message: WhatsAppWebhookMessage): string {
    if (message.text) return message.text.body;
    if (message.image) return message.image.caption || 'Image';
    if (message.document) return message.document.caption || message.document.filename || 'Document';
    if (message.audio) return 'Audio message';
    if (message.video) return 'Video message';
    return 'Message';
  }

  /**
   * Format phone number for WhatsApp API
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleanPhone = phone.replace(/\D/g, '');
    
    // If it doesn't start with country code, assume it's Colombia (+57)
    if (!cleanPhone.startsWith('57') && cleanPhone.length === 10) {
      cleanPhone = '57' + cleanPhone;
    }
    
    return cleanPhone;
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 8 && cleanPhone.length <= 15;
  }

  /**
   * Verify webhook token
   */
  static verifyWebhookToken(token: string, expectedToken: string): boolean {
    return token === expectedToken;
  }

  /**
   * Get QR code for WhatsApp Business setup
   */
  static async getQRCode(integration: WhatsappIntegration): Promise<string | null> {
    try {
      if (!integration.accessToken) return null;

      // This would typically involve the WhatsApp Business API setup flow
      // For now, return a placeholder QR code URL
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp://send?phone=${integration.phoneNumber}`;
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  }

  /**
   * Test WhatsApp connection
   */
  static async testConnection(integration: WhatsappIntegration): Promise<{ success: boolean; error?: string }> {
    try {
      if (!integration.accessToken || !integration.phoneNumberId) {
        return { success: false, error: 'Configuración incompleta' };
      }

      // Test by getting phone number info
      const response = await fetch(`${this.BASE_URL}/${integration.phoneNumberId}`, {
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error?.message || 'Error de conexión' };
      }

      return { success: true };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}