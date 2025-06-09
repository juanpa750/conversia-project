import { storage } from "./storage";

interface ChatbotConfig {
  id: number;
  name: string;
  productId: number | null;
  triggerKeywords: string[];
  aiInstructions: string;
  aiPersonality: string;
  conversationObjective: string;
}

interface ProductInfo {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  specifications: string;
  features: string;
  availability: boolean;
}

interface AIResponse {
  message: string;
  confidence: number;
  detectedChatbotId?: number;
  aidaStage: 'attention' | 'interest' | 'desire' | 'action' | 'retention';
  requiresHuman: boolean;
}

export class ChatbotProductAIService {
  
  /**
   * Detecta qué chatbot debe responder basado en palabras clave
   */
  async detectActiveChatbot(message: string, userId: string): Promise<number | null> {
    try {
      const chatbots = await storage.getChatbots(userId);
      const messageLower = message.toLowerCase();
      
      console.log('🎯 Chatbots disponibles:', chatbots.length);
      console.log('🔍 Mensaje a analizar:', messageLower);
      
      let bestMatch: number | null = null;
      let highestScore = 0;
      
      for (const chatbot of chatbots) {
        let score = 0;
        
        console.log(`\n📋 Analizando chatbot ID ${chatbot.id}:`, chatbot.name);
        console.log('📝 Keywords raw:', chatbot.triggerKeywords);
        console.log('📝 Keywords type:', typeof chatbot.triggerKeywords);
        console.log('🔗 Product ID:', chatbot.productId);
        
        // Verificar palabras clave de disparadores
        if (chatbot.triggerKeywords && Array.isArray(chatbot.triggerKeywords)) {
          console.log('✅ Keywords son array, verificando...');
          for (const keyword of chatbot.triggerKeywords) {
            const keywordLower = keyword.toLowerCase();
            console.log(`  🔍 Verificando "${keywordLower}" en "${messageLower}"`);
            if (messageLower.includes(keywordLower)) {
              score += 10;
              console.log(`  ✅ MATCH! +10 puntos. Score actual: ${score}`);
            }
          }
        } else {
          console.log('❌ Keywords no son array:', chatbot.triggerKeywords);
        }
        
        // Si el chatbot tiene un producto asociado, verificar nombre del producto
        if (chatbot.productId) {
          try {
            const product = await storage.getProduct(chatbot.productId);
            console.log('🛍️ Producto asociado:', product?.name);
            if (product && messageLower.includes(product.name.toLowerCase())) {
              score += 8;
              console.log(`  ✅ MATCH nombre producto! +8 puntos. Score actual: ${score}`);
            }
            if (product?.category && messageLower.includes(product.category.toLowerCase())) {
              score += 5;
              console.log(`  ✅ MATCH categoría! +5 puntos. Score actual: ${score}`);
            }
          } catch (error) {
            console.log('Error loading product for chatbot:', error);
          }
        }
        
        console.log(`📊 Score final para chatbot ${chatbot.id}: ${score}`);
        
        if (score > highestScore) {
          highestScore = score;
          bestMatch = chatbot.id;
          console.log(`🏆 Nuevo mejor match: ID ${bestMatch} con score ${highestScore}`);
        }
      }
      
      console.log('🎯 Chatbot detectado:', bestMatch, 'con score:', highestScore);
      return highestScore > 0 ? bestMatch : null;
      
    } catch (error) {
      console.error('Error detecting chatbot:', error);
      return null;
    }
  }
  
  /**
   * Genera respuesta inteligente usando chatbot + producto
   */
  async generateIntelligentResponse(
    message: string,
    userId: string,
    businessName: string,
    conversationHistory: string[] = []
  ): Promise<AIResponse> {
    
    // 1. Detectar chatbot activo
    const activeChatbotId = await this.detectActiveChatbot(message, userId);
    
    if (!activeChatbotId) {
      // Sin chatbot específico - respuesta general
      return this.generateGeneralResponse(message, userId, businessName);
    }
    
    // 2. Obtener configuración del chatbot
    const chatbot = await storage.getChatbot(activeChatbotId);
    if (!chatbot) {
      return this.generateGeneralResponse(message, userId, businessName);
    }
    
    // 3. Obtener información del producto (si está configurado)
    let productInfo: ProductInfo | null = null;
    if (chatbot.productId) {
      try {
        productInfo = await storage.getProduct(chatbot.productId);
      } catch (error) {
        console.log('Error loading product:', error);
      }
    }
    
    // 4. Determinar etapa AIDA
    const aidaStage = this.determineAidaStage(message, conversationHistory);
    
    // 5. Generar respuesta combinando chatbot + producto
    const response = await this.generateCombinedResponse(
      message,
      chatbot as ChatbotConfig,
      productInfo,
      aidaStage,
      businessName
    );
    
    return {
      message: response,
      confidence: 0.9,
      detectedChatbotId: activeChatbotId,
      aidaStage,
      requiresHuman: false
    };
  }
  
  /**
   * Genera respuesta combinando configuración del chatbot + información del producto
   */
  private async generateCombinedResponse(
    message: string,
    chatbot: ChatbotConfig,
    product: ProductInfo | null,
    aidaStage: string,
    businessName: string
  ): Promise<string> {
    
    const msgLower = message.toLowerCase();
    
    // Información base del producto
    const productContext = product ? {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      specifications: product.specifications || '',
      features: product.features || '',
      availability: product.availability
    } : null;
    
    // Instrucciones del chatbot
    const instructions = chatbot.aiInstructions || '';
    const personality = chatbot.aiPersonality || '';
    const objective = chatbot.conversationObjective || '';
    
    let response = '';
    
    if (product) {
      // Respuesta específica del producto
      if (aidaStage === 'attention') {
        response = this.generateAttentionResponse(product, personality);
      } else if (aidaStage === 'interest') {
        response = this.generateInterestResponse(product, message, instructions);
      } else if (aidaStage === 'desire') {
        response = this.generateDesireResponse(product, instructions);
      } else if (aidaStage === 'action') {
        response = this.generateActionResponse(product, businessName);
      } else {
        response = this.generateRetentionResponse(product, businessName);
      }
    } else {
      // Respuesta basada solo en configuración del chatbot
      response = this.generateObjectiveBasedResponse(message, objective, personality, businessName);
    }
    
    // Aplicar personalidad del chatbot
    if (personality) {
      response = this.applyPersonality(response, personality);
    }
    
    return response;
  }
  
  private generateAttentionResponse(product: ProductInfo, personality: string): string {
    const greetings = [
      `¡Hola! Veo que te interesa ${product.name}. Es una excelente elección.`,
      `¡Perfecto! ${product.name} es uno de nuestros productos más populares.`,
      `Me da mucho gusto que preguntes por ${product.name}. Te va a encantar.`
    ];
    
    const selectedGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    return `${selectedGreeting} ${product.description || ''} ¿Te gustaría conocer más detalles?`;
  }
  
  private generateInterestResponse(product: ProductInfo, message: string, instructions: string): string {
    const msgLower = message.toLowerCase();
    
    if (msgLower.includes('precio') || msgLower.includes('costo') || msgLower.includes('valor')) {
      let priceResponse = `${product.name} tiene un precio de ${product.price || 'consultar'}.`;
      
      if (instructions.toLowerCase().includes('promocion') || instructions.toLowerCase().includes('descuento')) {
        priceResponse += ' Además, tenemos promociones especiales disponibles.';
      }
      
      return priceResponse + ' ¿Te gustaría conocer más sobre sus beneficios?';
    }
    
    if (msgLower.includes('características') || msgLower.includes('detalles') || msgLower.includes('especificaciones')) {
      const specs = product.specifications || product.features || product.description;
      return `${product.name} cuenta con estas características: ${specs}. ¿Hay algo específico que te gustaría saber?`;
    }
    
    return `${product.name} es perfecto para lo que necesitas. ${product.description || ''} ¿Qué aspecto te interesa más conocer?`;
  }
  
  private generateDesireResponse(product: ProductInfo, instructions: string): string {
    let response = `Los beneficios principales de ${product.name} son realmente increíbles. `;
    
    if (product.features) {
      response += `${product.features}. `;
    }
    
    if (instructions.toLowerCase().includes('garantia')) {
      response += 'Además, viene con garantía completa de satisfacción. ';
    }
    
    if (instructions.toLowerCase().includes('testimonios')) {
      response += 'Nuestros clientes han tenido resultados excelentes. ';
    }
    
    response += '¿Te gustaría proceder con tu compra?';
    
    return response;
  }
  
  private generateActionResponse(product: ProductInfo, businessName: string): string {
    return `¡Excelente decisión con ${product.name}! Para proceder con tu compra, contáctanos directamente. ${businessName} te ayudará con todo el proceso. ${product.price ? `La inversión es de ${product.price}.` : ''} ¿Prefieres que te contactemos o vienes a nuestra ubicación?`;
  }
  
  private generateRetentionResponse(product: ProductInfo, businessName: string): string {
    return `Gracias por tu interés en ${product.name}. Si tienes alguna duda adicional o necesitas soporte, ${businessName} está aquí para ayudarte. También tenemos productos complementarios que podrían interesarte.`;
  }
  
  private generateObjectiveBasedResponse(message: string, objective: string, personality: string, businessName: string): string {
    if (objective.toLowerCase().includes('ventas')) {
      return `¡Hola! En ${businessName} tenemos productos increíbles que te van a encantar. ¿Qué tipo de producto estás buscando?`;
    }
    
    if (objective.toLowerCase().includes('citas') || objective.toLowerCase().includes('appointment')) {
      return `¡Hola! ¿Te gustaría agendar una cita con ${businessName}? Podemos ayudarte con todo lo que necesitas.`;
    }
    
    if (objective.toLowerCase().includes('soporte')) {
      return `¡Hola! Estoy aquí para ayudarte con cualquier consulta sobre nuestros productos y servicios de ${businessName}.`;
    }
    
    return `¡Hola! ¿Cómo puedo ayudarte hoy con ${businessName}?`;
  }
  
  private applyPersonality(response: string, personality: string): string {
    if (personality.toLowerCase().includes('amigable') || personality.toLowerCase().includes('casual')) {
      response = response.replace(/¡Hola!/g, '¡Hola! 😊');
      response += ' ¡Estoy aquí para ayudarte!';
    }
    
    if (personality.toLowerCase().includes('profesional') || personality.toLowerCase().includes('formal')) {
      response = response.replace(/¡/g, '').replace(/!/g, '.');
      response = 'Buenos días. ' + response;
    }
    
    return response;
  }
  
  private determineAidaStage(message: string, history: string[]): 'attention' | 'interest' | 'desire' | 'action' | 'retention' {
    const msg = message.toLowerCase();
    
    if (msg.includes('quiero comprar') || msg.includes('lo llevo') || msg.includes('proceder')) {
      return 'action';
    }
    
    if (msg.includes('beneficio') || msg.includes('ventaja') || msg.includes('mejor')) {
      return 'desire';
    }
    
    if (msg.includes('precio') || msg.includes('características') || msg.includes('detalles')) {
      return 'interest';
    }
    
    return history.length <= 1 ? 'attention' : 'interest';
  }
  
  private async generateGeneralResponse(message: string, userId: string, businessName: string): Promise<AIResponse> {
    return {
      message: `¡Hola! Bienvenido a ${businessName}. ¿En qué puedo ayudarte hoy?`,
      confidence: 0.5,
      aidaStage: 'attention',
      requiresHuman: false
    };
  }
}

export const chatbotProductAI = new ChatbotProductAIService();