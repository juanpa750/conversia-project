import { storage } from "./storage";

interface ProductConfig {
  id: number;
  name: string;
  description: string;
  price: string;
  aiInstructions: string;
  conversationObjective: string;
  triggerKeywords: string[];
}

interface AIResponse {
  message: string;
  confidence: number;
  detectedProductId?: number;
  aidaStage: string;
  requiresHuman: boolean;
}

export class EnhancedAIService {
  private aidaStages = ['attention', 'interest', 'desire', 'action', 'retention'];
  
  /**
   * Detecta producto basado en palabras clave del mensaje
   */
  async detectProduct(message: string, userId: string): Promise<number | null> {
    console.log('🔍 Detectando producto en mensaje:', message);
    
    const products = await storage.getUserProducts(userId);
    const messageLower = message.toLowerCase();
    
    let bestMatch = null;
    let highestScore = 0;

    for (const product of products) {
      let score = 0;
      
      // Verificar palabras clave específicas
      if (product.trigger_keywords) {
        const keywords = Array.isArray(product.trigger_keywords) 
          ? product.trigger_keywords 
          : JSON.parse(product.trigger_keywords || '[]');
          
        for (const keyword of keywords) {
          if (messageLower.includes(keyword.toLowerCase())) {
            score += 10;
          }
        }
      }
      
      // Verificar nombre del producto
      if (messageLower.includes(product.name.toLowerCase())) {
        score += 8;
      }
      
      // Verificar categoría
      if (product.category && messageLower.includes(product.category.toLowerCase())) {
        score += 5;
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = product.id;
      }
    }
    
    console.log('🎯 Producto detectado:', bestMatch, 'con score:', highestScore);
    return bestMatch;
  }
  
  /**
   * Determina etapa AIDA (interno - no visible al cliente)
   */
  private determineAidaStage(message: string, conversationHistory: string[]): string {
    const msg = message.toLowerCase();
    
    // ACTION: Intención clara de compra
    if (msg.includes('quiero comprar') || msg.includes('lo llevo') || msg.includes('proceder')) {
      return 'action';
    }
    
    // DESIRE: Preguntas sobre beneficios
    if (msg.includes('beneficio') || msg.includes('ventaja') || msg.includes('mejor')) {
      return 'desire';
    }
    
    // INTEREST: Preguntas sobre detalles
    if (msg.includes('precio') || msg.includes('características') || msg.includes('detalles')) {
      return 'interest';
    }
    
    // ATTENTION: Primera interacción
    return conversationHistory.length <= 1 ? 'attention' : 'interest';
  }
  
  /**
   * Genera respuesta inteligente con AIDA oculto
   */
  async generateResponse(
    message: string, 
    userId: string, 
    businessName: string,
    conversationHistory: string[] = []
  ): Promise<AIResponse> {
    
    console.log('🧠 Generando respuesta para:', { message, userId, businessName });
    
    // Detectar producto específico
    const detectedProductId = await this.detectProduct(message, userId);
    
    // Determinar etapa AIDA (interno)
    const aidaStage = this.determineAidaStage(message, conversationHistory);
    
    let response: string;
    let confidence = 0.7;
    
    if (detectedProductId) {
      // Respuesta específica del producto
      response = await this.generateProductResponse(detectedProductId, message, aidaStage, businessName);
      confidence = 0.9;
    } else {
      // Mostrar lista de productos disponibles
      response = await this.generateProductListResponse(userId, businessName);
      confidence = 0.6;
    }
    
    return {
      message: response,
      confidence,
      detectedProductId: detectedProductId || undefined,
      aidaStage,
      requiresHuman: confidence < 0.5
    };
  }
  
  /**
   * Genera respuesta específica para un producto
   */
  private async generateProductResponse(
    productId: number, 
    userMessage: string, 
    aidaStage: string,
    businessName: string
  ): Promise<string> {
    
    const product = await storage.getProduct(productId);
    if (!product) {
      return `Tenemos varios productos disponibles. ¿Qué necesitas específicamente?`;
    }
    
    // Análisis inteligente del mensaje del cliente
    const message = userMessage.toLowerCase();
    let response = '';
    
    // Usar descripción del producto como conocimiento interno, no para copiar todo
    const productKnowledge = product.description || '';
    
    // Responder SOLO a lo que el cliente pregunta específicamente
    if (message.includes('precio') || message.includes('costo') || message.includes('vale')) {
      response = `${product.name} cuesta ${product.price || 'consultar'}. Es una excelente inversión porque da resultados desde la primera aplicación. ¿Te gustaría conocer algún beneficio específico?`;
    } 
    else if (message.includes('beneficio') || message.includes('sirve') || message.includes('ayuda')) {
      // Extraer 2-3 beneficios clave del conocimiento del producto
      const benefitKeywords = ['hidrata', 'nutre', 'repara', 'fortalece', 'define', 'brillo', 'suavidad', 'crecimiento'];
      const foundBenefits = benefitKeywords.filter(b => productKnowledge.toLowerCase().includes(b)).slice(0, 2);
      
      response = foundBenefits.length > 0 
        ? `${product.name} ${foundBenefits.join(' y ')} el cabello de manera natural. ¿Qué tipo de cabello tienes?`
        : `${product.name} tiene múltiples beneficios para el cabello. ¿Cuál es tu mayor preocupación capilar?`;
    }
    else if (message.includes('como') && (message.includes('usar') || message.includes('aplicar'))) {
      response = `${product.name} es muy fácil de usar. Te explico paso a paso cuando confirmes tu pedido. ¿Te interesa conocer el precio especial?`;
    }
    else if (message.includes('testimonio') || message.includes('funciona') || message.includes('resultado')) {
      response = `${product.name} tiene excelentes resultados. Nuestras clientas ven cambios desde la primera aplicación. ¿Quieres saber cómo puede ayudar a tu tipo de cabello específicamente?`;
    }
    else if (message.includes('envio') || message.includes('entrega')) {
      response = `Tenemos envío gratis y pago contra entrega en toda Colombia para ${product.name}. ¿En qué ciudad te encuentras?`;
    }
    else {
      // Respuesta general pero específica
      response = `${product.name} es perfecto para cabellos que necesitan nutrición profunda. Es 100% natural y da resultados visibles. ¿Qué te gustaría saber específicamente?`;
    }
    
    return response;
  }
  
  /**
   * Genera lista de productos cuando no se detecta uno específico
   */
  private async generateProductListResponse(userId: string, businessName: string): Promise<string> {
    const products = await storage.getUserProducts(userId);
    
    if (products.length === 0) {
      return `En ${businessName}, ofrecemos productos de calidad garantizada. ¿En qué te puedo ayudar específicamente?`;
    }
    
    const productList = products
      .filter(p => p.availability !== false)
      .slice(0, 5)
      .map(p => `• ${p.name}${p.price ? ` - ${p.price}` : ''}`)
      .join('\n');
    
    return `En ${businessName}, manejamos varios productos garantizados:\n\n${productList}\n\n¿Cuál te interesa o qué necesidad específica tienes?`;
  }
}

export const enhancedAI = new EnhancedAIService();