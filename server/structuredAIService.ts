import { storage } from "./storage";

interface ConversationContext {
  userMessage: string;
  conversationHistory: string[];
  detectedIntent: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  customerType: 'new' | 'returning' | 'vip';
}

interface StructuredAIResponse {
  message: string;
  confidence: number;
  nextAction: string;
  conversationStage: 'greeting' | 'qualifying' | 'presenting' | 'objection_handling' | 'closing';
}

export class StructuredAIService {
  
  /**
   * Genera respuesta usando el sistema de prompts estructurados
   */
  async generateStructuredResponse(
    context: ConversationContext,
    userId: string,
    chatbotId: number
  ): Promise<StructuredAIResponse> {
    
    // Obtener datos del chatbot y producto
    const chatbot = await storage.getChatbot(chatbotId);
    const product = chatbot?.product_id ? await storage.getProduct(chatbot.product_id) : null;
    
    if (!chatbot) {
      return {
        message: "Disculpa, estoy teniendo problemas para acceder a mi configuración.",
        confidence: 0.1,
        nextAction: "retry",
        conversationStage: 'greeting'
      };
    }

    // Construir el System Prompt estructurado
    const systemPrompt = this.buildSystemPrompt(chatbot, product, context);
    
    // Generar respuesta basada en reglas estructuradas
    const response = this.generateResponseFromStructuredRules(chatbot, product, context);
    
    return response;
  }

  /**
   * Construir el System Prompt dinámicamente
   */
  private buildSystemPrompt(chatbot: any, product: any, context: ConversationContext): string {
    const businessName = "KANUVA"; // Por ahora hardcoded, luego lo sacaremos de BD
    const productName = product?.name || "Nuestro producto";
    const productDescription = product?.description || "";
    
    return `
Eres "CONVERSIA-BOT", un asistente de IA avanzado para WhatsApp. Sigue estas reglas ESTRICTAMENTE.

### 1. IDENTIDAD DEL BOT
- **Nombre del Negocio:** ${businessName}
- **Nombre del Chatbot:** ${chatbot.name}
- **Personalidad:** ${chatbot.communication_personality || 'equilibrada'}
- **Instrucciones Específicas:** ${chatbot.ai_instructions || 'Eres un asistente amigable de ventas.'}

### 2. OBJETIVO PRINCIPAL: ${chatbot.objective?.toUpperCase() || 'VENTAS'}

**Si el objetivo es VENTAS:**
1. **Calificar Lead:** Haz preguntas para entender la necesidad específica
2. **Presentar Producto:** Explica beneficios de ${productName} que resuelven su necesidad
3. **Manejar Objeciones:** Responde dudas con valor agregado
4. **Cerrar Venta:** Guía hacia la compra con llamadas a la acción

### 3. REGLAS GENERALES
- NUNCA inventes información que no tengas
- Responde SOLO a lo que el cliente pregunta específicamente
- Mantén respuestas ${chatbot.response_length || 'moderadas'} (máximo 2-3 oraciones)
- Siempre termina con una pregunta para continuar la conversación
- Usa un tono ${chatbot.communication_personality || 'equilibrado'}

### 4. INFORMACIÓN DEL PRODUCTO (SOLO PARA TU CONOCIMIENTO INTERNO):
Producto: ${productName}
Precio: ${product?.price || 'consultar'}
Descripción para referencia: ${productDescription}

### 5. HISTORIAL:
${context.conversationHistory.slice(-3).join('\n')}

### 6. MENSAJE ACTUAL:
Usuario: "${context.userMessage}"

RESPONDE siguiendo todas las reglas anteriores:`;
  }

  /**
   * Generar respuesta usando reglas estructuradas
   */
  private generateResponseFromStructuredRules(
    chatbot: any, 
    product: any, 
    context: ConversationContext
  ): StructuredAIResponse {
    
    const message = context.userMessage.toLowerCase();
    const objective = chatbot.objective || 'sales';
    const personality = chatbot.communication_personality || 'balanced';
    
    let response = '';
    let stage: 'greeting' | 'qualifying' | 'presenting' | 'objection_handling' | 'closing' = 'greeting';
    let nextAction = 'continue';

    // Determinar etapa de la conversación
    if (context.conversationHistory.length === 0) {
      stage = 'greeting';
    } else if (message.includes('precio') || message.includes('costo')) {
      stage = 'objection_handling';
    } else if (message.includes('comprar') || message.includes('pedir')) {
      stage = 'closing';
    } else if (message.includes('beneficio') || message.includes('sirve')) {
      stage = 'presenting';
    } else {
      stage = 'qualifying';
    }

    // Generar respuesta según objetivo y etapa
    if (objective === 'sales') {
      response = this.generateSalesResponse(chatbot, product, context, stage);
    } else if (objective === 'appointments') {
      response = this.generateAppointmentResponse(chatbot, context, stage);
    } else {
      response = this.generateInfoResponse(chatbot, product, context);
    }

    // Aplicar personalidad
    response = this.applyPersonalityToResponse(response, personality);

    return {
      message: response,
      confidence: 0.8,
      nextAction,
      conversationStage: stage
    };
  }

  /**
   * Generar respuesta enfocada en ventas
   */
  private generateSalesResponse(
    chatbot: any, 
    product: any, 
    context: ConversationContext, 
    stage: string
  ): string {
    
    const message = context.userMessage.toLowerCase();
    const productName = product?.name || "nuestro producto";
    
    switch (stage) {
      case 'greeting':
        return `¡Hola! Soy ${chatbot.name.split(' ')[0]} de KANUVA. Veo que te interesa ${productName}. ¿Qué tipo de cabello tienes?`;
      
      case 'qualifying':
        if (message.includes('crespo') || message.includes('rizo')) {
          return `Perfecto, ${productName} es ideal para cabellos crespos y rizos. ¿Cuál es tu mayor preocupación? ¿Falta de definición, sequedad o frizz?`;
        }
        return `Entiendo. Para recomendarte mejor, ¿qué problemas has tenido con productos anteriores?`;
      
      case 'presenting':
        if (message.includes('beneficio') || message.includes('sirve')) {
          return `${productName} hidrata y define los rizos desde la primera aplicación. Es 100% natural y da resultados visibles. ¿Te interesa conocer el precio especial?`;
        }
        return `${productName} soluciona exactamente eso. Resultados desde el primer uso. ¿Quieres que te cuente por qué es diferente?`;
      
      case 'objection_handling':
        if (message.includes('precio') || message.includes('costo')) {
          return `${productName} cuesta $${product?.price || '129.900'} con envío gratis. Es una inversión que se paga sola porque evitas comprar múltiples productos. ¿Te gustaría separarlo?`;
        }
        return `Entiendo tu preocupación. ${productName} tiene garantía y miles de clientas satisfechas. ¿Qué específicamente te genera dudas?`;
      
      case 'closing':
        return `¡Excelente decisión! ${productName} por $${product?.price || '129.900'} con envío gratis y pago contra entrega. ¿Confirmo tu pedido?`;
      
      default:
        return `${productName} es perfecto para ti. ¿Qué te gustaría saber específicamente?`;
    }
  }

  /**
   * Generar respuesta para agendar citas
   */
  private generateAppointmentResponse(chatbot: any, context: ConversationContext, stage: string): string {
    switch (stage) {
      case 'greeting':
        return `¡Hola! Soy ${chatbot.name.split(' ')[0]}. ¿Te gustaría agendar una cita? Tengo disponibilidad mañana a las 10:00 AM o a las 3:00 PM.`;
      
      case 'qualifying':
        return `Perfecto. ¿Cuál de estos horarios te funciona mejor: mañana 10:00 AM o 3:00 PM?`;
      
      case 'closing':
        return `¡Excelente! Tu cita está confirmada. Solo necesito tu nombre completo y email para enviarte la confirmación.`;
      
      default:
        return `Con gusto te ayudo a agendar una cita. ¿Qué día prefieres?`;
    }
  }

  /**
   * Generar respuesta informativa
   */
  private generateInfoResponse(chatbot: any, product: any, context: ConversationContext): string {
    const message = context.userMessage.toLowerCase();
    
    if (message.includes('horario')) {
      return `Nuestro horario es de lunes a viernes de 9:00 AM a 6:00 PM. ¿En qué más puedo ayudarte?`;
    }
    
    if (message.includes('ubicación') || message.includes('dirección')) {
      return `Estamos ubicados en el centro de la ciudad. ¿Necesitas direcciones específicas?`;
    }
    
    return `Te ayudo con información sobre nuestros productos y servicios. ¿Qué necesitas saber específicamente?`;
  }

  /**
   * Aplicar personalidad a la respuesta
   */
  private applyPersonalityToResponse(response: string, personality: string): string {
    switch (personality) {
      case 'friendly':
        if (!response.includes('😊') && !response.includes('!')) {
          response = response.replace('.', '! 😊');
        }
        break;
      
      case 'formal':
        response = response.replace(/tú/g, 'usted');
        response = response.replace(/!/g, '.');
        break;
      
      case 'direct':
        // Mantener respuestas cortas y directas
        break;
      
      default: // balanced
        // Mantener balance entre amigable y profesional
        break;
    }
    
    return response;
  }
}

export const structuredAIService = new StructuredAIService();