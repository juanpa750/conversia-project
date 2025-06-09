import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { storage } from "./storage";

interface ProductConfiguration {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  aiInstructions: string;
  conversationObjective: string;
  aiPersonality: string;
  triggerKeywords: string[];
  features: string[];
  specifications: string[];
  availability: boolean;
}

interface ConversationContext {
  userMessage: string;
  conversationHistory: string[];
  businessName: string;
  businessType: string;
  detectedProductId?: number;
  currentAidaStage: 'attention' | 'interest' | 'desire' | 'action' | 'retention';
}

interface AIResponse {
  message: string;
  confidence: number;
  detectedProductId?: number;
  nextAidaStage: 'attention' | 'interest' | 'desire' | 'action' | 'retention';
  suggestedFollowUp: string[];
  objectiveProgress: number; // 0-100%
  requiresHumanIntervention: boolean;
}

export class ProductBasedAIService {
  private productCache = new Map<number, ProductConfiguration>();
  private userProductsCache = new Map<string, ProductConfiguration[]>();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns() {
    // Patrones de intención optimizados para detección de productos
    this.intentPatterns = {
      product_inquiry: /\b(información|info|detalles|características|precio|costo|valor|cuánto|cuanto)\b/i,
      purchase_intent: /\b(quiero|necesito|deseo|comprar|adquirir|llevarlo|me interesa)\b/i,
      comparison: /\b(diferencia|comparar|mejor|peor|versus|vs|cual|cuál)\b/i,
      availability: /\b(disponible|stock|hay|tienen|consigo)\b/i,
      objection: /\b(caro|costoso|barato|no funciona|malo|problema|duda)\b/i
    };

    // Palabras positivas y negativas para análisis de sentimiento
    this.sentimentWords = {
      positive: ['excelente', 'perfecto', 'bueno', 'genial', 'me gusta', 'interesa', 'quiero', 'necesito', 'gracias', 'increíble', 'fantástico'],
      negative: ['malo', 'terrible', 'caro', 'costoso', 'no me gusta', 'problema', 'error', 'molesto', 'difícil', 'complicado'],
      neutral: ['información', 'detalles', 'precio', 'características', 'disponibilidad']
    };
  }

  private intentPatterns: { [key: string]: RegExp } = {};
  private sentimentWords: { [key: string]: string[] } = {};

  /**
   * Detecta qué producto específico menciona el usuario basado en palabras clave
   */
  async detectProductFromMessage(message: string, userId: string): Promise<number | null> {
    console.log('🔍 Detectando producto para usuario:', userId, 'mensaje:', message);
    
    const userProducts = await this.getUserProducts(userId);
    const messageLower = message.toLowerCase();
    
    let bestMatch: { productId: number; score: number } | null = null;

    for (const product of userProducts) {
      let score = 0;
      
      // Verificar keywords principales del producto
      if (product.triggerKeywords && product.triggerKeywords.length > 0) {
        for (const keyword of product.triggerKeywords) {
          if (messageLower.includes(keyword.toLowerCase())) {
            score += 10; // Peso alto para keywords específicos
          }
        }
      }

      // Verificar nombre del producto
      if (messageLower.includes(product.name.toLowerCase())) {
        score += 8;
      }

      // Verificar palabras en la descripción
      const descriptionWords = product.description?.toLowerCase().split(' ') || [];
      for (const word of descriptionWords) {
        if (word.length > 3 && messageLower.includes(word)) {
          score += 1;
        }
      }

      // Verificar categoría
      if (product.category && messageLower.includes(product.category.toLowerCase())) {
        score += 3;
      }

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { productId: product.id, score };
      }
    }

    console.log('🎯 Mejor coincidencia:', bestMatch);
    return bestMatch ? bestMatch.productId : null;
  }

  /**
   * Obtiene todos los productos de un usuario con su configuración AI
   */
  private async getUserProducts(userId: string): Promise<ProductConfiguration[]> {
    if (this.userProductsCache.has(userId)) {
      return this.userProductsCache.get(userId)!;
    }

    try {
      const products = await storage.getUserProducts(userId);
      const configurations: ProductConfiguration[] = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        aiInstructions: product.aiInstructions || '',
        conversationObjective: product.conversationObjective || 'sales',
        aiPersonality: product.aiPersonality || '',
        triggerKeywords: product.triggerKeywords || [],
        features: product.features || [],
        specifications: product.specifications || [],
        availability: product.availability !== false
      }));

      this.userProductsCache.set(userId, configurations);
      return configurations;
    } catch (error) {
      console.error('Error obteniendo productos del usuario:', error);
      return [];
    }
  }

  /**
   * Determina la etapa AIDA actual basada en la conversación (INTERNO)
   */
  private determineAidaStage(context: ConversationContext): 'attention' | 'interest' | 'desire' | 'action' | 'retention' {
    const message = context.userMessage.toLowerCase();
    const historyText = context.conversationHistory.join(' ').toLowerCase();

    // ATTENTION: Primera interacción o consulta general
    if (context.conversationHistory.length <= 1) {
      return 'attention';
    }

    // ACTION: Intención clara de compra
    if (this.intentPatterns.purchase_intent?.test(message)) {
      if (message.includes('comprar') || message.includes('adquirir') || message.includes('llevarlo')) {
        return 'action';
      }
    }

    // DESIRE: Preguntas sobre beneficios, comparaciones
    if (this.intentPatterns.comparison?.test(message) || message.includes('beneficio') || message.includes('ventaja')) {
      return 'desire';
    }

    // INTEREST: Preguntas sobre características, precios
    if (this.intentPatterns.product_inquiry?.test(message)) {
      return 'interest';
    }

    // RETENTION: Cliente ya compró o conversación avanzada
    if (context.conversationHistory.length > 5 && historyText.includes('compré')) {
      return 'retention';
    }

    return context.currentAidaStage || 'attention';
  }

  /**
   * Genera respuesta inteligente basada en el producto detectado y configuración
   */
  async generateProductBasedResponse(context: ConversationContext): Promise<AIResponse> {
    console.log('🧠 Generando respuesta basada en producto para:', context);

    let detectedProductId = context.detectedProductId;
    
    // Si no hay producto detectado, intentar detectarlo
    if (!detectedProductId) {
      const detected = await this.detectProductFromMessage(context.userMessage, context.businessName);
      detectedProductId = detected || undefined;
    }

    // Determinar etapa AIDA (interno)
    const currentStage = this.determineAidaStage(context);
    const nextStage = this.getNextAidaStage(currentStage);

    let response: AIResponse;

    if (detectedProductId) {
      // Respuesta específica del producto
      response = await this.generateProductSpecificResponse(detectedProductId, context, currentStage);
    } else {
      // No se detectó producto específico - mostrar lista de productos
      response = await this.generateProductListResponse(context);
    }

    return {
      ...response,
      nextAidaStage: nextStage,
      objectiveProgress: this.calculateObjectiveProgress(currentStage),
      requiresHumanIntervention: this.shouldRequireHuman(context, response.confidence)
    };
  }

  /**
   * Genera respuesta específica para un producto detectado
   */
  private async generateProductSpecificResponse(
    productId: number, 
    context: ConversationContext, 
    aidaStage: string
  ): Promise<Partial<AIResponse>> {
    
    const product = await this.getProductConfiguration(productId);
    if (!product) {
      return this.generateProductListResponse(context);
    }

    let message = '';
    let confidence = 0.8;
    const suggestedFollowUp: string[] = [];

    // Combinar instrucciones globales con específicas del producto
    const combinedInstructions = this.combineInstructions(context, product);
    
    // Generar respuesta según etapa AIDA
    switch (aidaStage) {
      case 'attention':
        message = this.generateAttentionResponse(product, combinedInstructions);
        suggestedFollowUp.push(`¿Te gustaría conocer más detalles sobre ${product.name}?`);
        break;
        
      case 'interest':
        message = this.generateInterestResponse(product, combinedInstructions, context.userMessage);
        suggestedFollowUp.push(`¿Qué otras características te interesan de ${product.name}?`);
        break;
        
      case 'desire':
        message = this.generateDesireResponse(product, combinedInstructions);
        suggestedFollowUp.push(`¿Te gustaría proceder con la compra de ${product.name}?`);
        break;
        
      case 'action':
        message = this.generateActionResponse(product, combinedInstructions);
        confidence = 0.9;
        break;
        
      default:
        message = this.generateAttentionResponse(product, combinedInstructions);
    }

    // Agregar personalidad si está configurada
    if (product.aiPersonality) {
      message = this.applyPersonality(message, product.aiPersonality);
    }

    // Prefijo con nombre del negocio
    message = `En ${context.businessName}, ${message}`;

    return {
      message,
      confidence,
      detectedProductId: productId,
      suggestedFollowUp
    };
  }

  /**
   * Genera respuesta cuando no se detecta producto específico
   */
  private async generateProductListResponse(context: ConversationContext): Promise<Partial<AIResponse>> {
    const userProducts = await this.getUserProducts(context.businessName); // Necesitamos userId aquí
    
    if (userProducts.length === 0) {
      return {
        message: `En ${context.businessName}, ofrecemos productos de calidad garantizada. ¿En qué te puedo ayudar específicamente?`,
        confidence: 0.6,
        suggestedFollowUp: ['¿Qué tipo de producto buscas?', '¿Tienes alguna necesidad específica?']
      };
    }

    const productList = userProducts
      .filter(p => p.availability)
      .slice(0, 5) // Máximo 5 productos
      .map(p => `• ${p.name}${p.price ? ` - ${p.price}` : ''}`)
      .join('\n');

    const message = `En ${context.businessName}, manejamos varios productos garantizados de alta calidad:\n\n${productList}\n\n¿Cuál de estos productos te interesa o qué necesidad específica tienes?`;

    return {
      message,
      confidence: 0.7,
      suggestedFollowUp: [
        '¿Podrías decirme qué necesidad tienes?',
        '¿Cuál de estos productos llama tu atención?'
      ]
    };
  }

  /**
   * Combina instrucciones globales del chatbot con específicas del producto
   */
  private combineInstructions(context: ConversationContext, product: ProductConfiguration): string {
    let combined = '';
    
    // Agregar objetivo del producto
    if (product.conversationObjective) {
      combined += `Objetivo: ${product.conversationObjective}. `;
    }
    
    // Agregar instrucciones específicas del producto
    if (product.aiInstructions) {
      combined += `Instrucciones del producto: ${product.aiInstructions}. `;
    }
    
    // Agregar contexto del negocio
    combined += `Negocio: ${context.businessName} (${context.businessType}).`;
    
    return combined;
  }

  // Métodos para generar respuestas según etapa AIDA (internos)
  private generateAttentionResponse(product: ProductConfiguration, instructions: string): string {
    const features = product.features.slice(0, 2).join(' y ') || 'múltiples beneficios';
    return `${product.name} es una excelente opción que ofrece ${features}. ${product.description || 'Producto de alta calidad garantizada.'} ${product.price ? `Inversión: ${product.price}` : ''} 😊`;
  }

  private generateInterestResponse(product: ProductConfiguration, instructions: string, userMessage: string): string {
    // Detectar qué información específica busca
    const message = userMessage.toLowerCase();
    
    if (message.includes('precio') || message.includes('costo') || message.includes('valor')) {
      return `${product.name} tiene un precio de ${product.price || 'consultar'}. Es una inversión que vale la pena por su calidad y beneficios garantizados.`;
    }
    
    if (message.includes('características') || message.includes('detalles')) {
      const specs = product.specifications.slice(0, 3).join(', ') || product.features.slice(0, 3).join(', ');
      return `${product.name} cuenta con estas características principales: ${specs}. ${product.description || ''}`;
    }
    
    return `${product.name} destaca por ${product.features.slice(0, 2).join(' y ')}. ${product.description || ''} ¿Te gustaría conocer algún aspecto específico?`;
  }

  private generateDesireResponse(product: ProductConfiguration, instructions: string): string {
    const benefits = product.features.map(f => `✓ ${f}`).slice(0, 3).join('\n');
    return `Los beneficios principales de ${product.name} son:\n\n${benefits}\n\nEs una inversión inteligente que te dará resultados garantizados. Muchos clientes han quedado satisfechos con su compra.`;
  }

  private generateActionResponse(product: ProductConfiguration, instructions: string): string {
    return `Perfecto! ${product.name} es una excelente decisión. ${product.price ? `El precio es ${product.price}` : ''} y podemos proceder con tu pedido ahora mismo. ¿Confirmas tu compra?`;
  }

  private applyPersonality(message: string, personality: string): string {
    // Aplicar personalidad específica si está configurada
    if (personality.includes('formal')) {
      return message.replace(/😊/g, '').replace(/!/g, '.');
    }
    if (personality.includes('amigable')) {
      return message + ' ¡Estoy aquí para ayudarte! 😊';
    }
    return message;
  }

  private getNextAidaStage(current: string): 'attention' | 'interest' | 'desire' | 'action' | 'retention' {
    const stages = ['attention', 'interest', 'desire', 'action', 'retention'];
    const currentIndex = stages.indexOf(current);
    return stages[Math.min(currentIndex + 1, stages.length - 1)] as any;
  }

  private calculateObjectiveProgress(stage: string): number {
    switch (stage) {
      case 'attention': return 20;
      case 'interest': return 40;
      case 'desire': return 70;
      case 'action': return 90;
      case 'retention': return 100;
      default: return 0;
    }
  }

  private shouldRequireHuman(context: ConversationContext, confidence: number): boolean {
    // Requerir intervención humana si:
    // - Confianza muy baja
    // - Múltiples objeciones
    // - Palabras negativas repetidas
    return confidence < 0.5 || 
           context.conversationHistory.filter(h => 
             this.sentimentWords.negative.some(word => h.toLowerCase().includes(word))
           ).length > 2;
  }

  private async getProductConfiguration(productId: number): Promise<ProductConfiguration | null> {
    if (this.productCache.has(productId)) {
      return this.productCache.get(productId)!;
    }

    try {
      const product = await storage.getProduct(productId);
      if (!product) return null;

      const config: ProductConfiguration = {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        aiInstructions: product.aiInstructions || '',
        conversationObjective: product.conversationObjective || 'sales',
        aiPersonality: product.aiPersonality || '',
        triggerKeywords: product.triggerKeywords || [],
        features: product.features || [],
        specifications: product.specifications || [],
        availability: product.availability !== false
      };

      this.productCache.set(productId, config);
      return config;
    } catch (error) {
      console.error('Error obteniendo configuración del producto:', error);
      return null;
    }
  }

  /**
   * Limpia caché para un usuario específico
   */
  clearUserCache(userId: string): void {
    this.userProductsCache.delete(userId);
  }
}

export const productBasedAI = new ProductBasedAIService();