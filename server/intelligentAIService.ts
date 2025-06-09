// Servicio de IA Inteligente - Análisis profundo de productos y servicios
import { storage } from './storage';

interface ProductInsights {
  productId: number;
  keyFeatures: string[];
  targetAudience: string[];
  salesPoints: string[];
  objectionHandlers: string[];
  crossSellSuggestions: string[];
}

interface ConversationAnalysis {
  intent: string;
  sentiment: number; // -1 to 1
  urgency: 'low' | 'medium' | 'high';
  purchaseIntent: number; // 0 to 1
  emotionalTriggers: string[];
}

interface IntelligentResponse {
  message: string;
  confidence: number;
  detectedProducts: number[];
  suggestedActions: string[];
  nextQuestions: string[];
  analysis: ConversationAnalysis;
}

export class IntelligentAIService {
  private productCache = new Map<number, ProductInsights>();
  
  // Patrones de análisis de sentimientos
  private positiveWords = ['excelente', 'perfecto', 'bueno', 'genial', 'me gusta', 'interesa', 'quiero', 'necesito', 'gracias'];
  private negativeWords = ['malo', 'terrible', 'caro', 'no me gusta', 'problema', 'error', 'molesto', 'difícil'];
  private urgentWords = ['urgente', 'rápido', 'ya', 'ahora', 'inmediato', 'pronto', 'necesito'];
  
  // Patrones de intención
  private intentPatterns = {
    pricing: ['precio', 'costo', 'cuanto', 'vale', 'pagar', '$', '€'],
    purchase: ['comprar', 'adquirir', 'llevarlo', 'pedirlo', 'ordenar'],
    info: ['información', 'detalles', 'características', 'especificaciones'],
    availability: ['disponible', 'stock', 'tienen', 'hay', 'existe'],
    appointment: ['cita', 'reserva', 'agendar', 'programar', 'turno'],
    support: ['problema', 'ayuda', 'soporte', 'error', 'no funciona'],
    comparison: ['comparar', 'diferencia', 'mejor', 'versus', 'vs']
  };

  /**
   * Análisis inteligente de productos
   */
  async analyzeProduct(productId: number, userId: string): Promise<ProductInsights> {
    if (this.productCache.has(productId)) {
      return this.productCache.get(productId)!;
    }

    const products = await storage.getProducts(userId);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const insights: ProductInsights = {
      productId,
      keyFeatures: this.extractFeatures(product.name, product.description),
      targetAudience: this.identifyAudience(product.description, product.category),
      salesPoints: this.generateSalesPoints(product),
      objectionHandlers: this.generateObjectionHandlers(product),
      crossSellSuggestions: await this.findCrossSellOpportunities(product, products)
    };

    this.productCache.set(productId, insights);
    return insights;
  }

  private extractFeatures(name: string, description: string): string[] {
    const text = `${name} ${description}`.toLowerCase();
    const features: string[] = [];

    // Características técnicas
    const techFeatures = ['premium', 'profesional', 'avanzado', 'inteligente', 'automático', 'rápido', 'eficiente'];
    techFeatures.forEach(feature => {
      if (text.includes(feature)) features.push(feature);
    });

    // Beneficios funcionales
    const benefits = ['resistente', 'duradero', 'fácil', 'simple', 'económico', 'portable', 'versátil', 'innovador'];
    benefits.forEach(benefit => {
      if (text.includes(benefit)) features.push(benefit);
    });

    // Extraer medidas y números importantes
    const measurements = text.match(/\d+\s*(cm|mm|kg|gb|mb|horas?|días?)/g);
    if (measurements) {
      features.push(...measurements);
    }

    return features.slice(0, 5); // Máximo 5 características principales
  }

  private identifyAudience(description: string, category: string): string[] {
    const text = description.toLowerCase();
    const audiences: string[] = [];

    const audienceMap = {
      empresas: ['empresas', 'negocios', 'oficinas', 'comercios'],
      profesionales: ['profesionales', 'expertos', 'especialistas'],
      familias: ['familias', 'hogares', 'casas', 'domésticos'],
      estudiantes: ['estudiantes', 'universidad', 'colegio', 'escuela'],
      jóvenes: ['jóvenes', 'adolescentes', 'teenagers'],
      deportistas: ['deportistas', 'atletas', 'fitness', 'gym']
    };

    Object.entries(audienceMap).forEach(([audience, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        audiences.push(audience);
      }
    });

    // Audiencia basada en categoría
    const categoryAudience: Record<string, string[]> = {
      'tecnología': ['profesionales', 'jóvenes'],
      'ropa': ['jóvenes', 'profesionales'],
      'hogar': ['familias'],
      'deportes': ['deportistas', 'jóvenes'],
      'salud': ['familias', 'profesionales']
    };

    const catLower = category.toLowerCase();
    Object.entries(categoryAudience).forEach(([cat, auds]) => {
      if (catLower.includes(cat)) {
        audiences.push(...auds);
      }
    });

    return Array.from(new Set(audiences));
  }

  private generateSalesPoints(product: any): string[] {
    const points: string[] = [];

    // Punto de valor/precio
    if (product.price && parseFloat(product.price) < 100) {
      points.push('Excelente relación calidad-precio');
    } else {
      points.push('Inversión en calidad premium');
    }

    // Punto de disponibilidad
    if (product.stock && product.stock < 10) {
      points.push('Stock limitado - disponibilidad inmediata');
    } else {
      points.push('Disponibilidad garantizada');
    }

    // Puntos genéricos efectivos
    points.push('Garantía de satisfacción incluida');
    points.push('Soporte técnico especializado');
    points.push('Entrega rápida y segura');

    return points;
  }

  private generateObjectionHandlers(product: any): string[] {
    return [
      `Precio: "Entiendo tu preocupación por el precio. Si consideramos el valor y beneficios de ${product.name}, verás que es una inversión que se paga sola..."`,
      'Calidad: "Trabajamos solo con materiales certificados y ofrecemos garantía completa de satisfacción..."',
      'Necesidad: "Muchos clientes inicialmente pensaron lo mismo, pero después nos agradecieron la recomendación..."',
      'Tiempo: "Te entiendo, por eso hemos diseñado este producto para ahorrarte tiempo y esfuerzo..."'
    ];
  }

  private async findCrossSellOpportunities(product: any, allProducts: any[]): Promise<string[]> {
    const opportunities: string[] = [];

    // Productos de la misma categoría
    const relatedProducts = allProducts.filter(p => 
      p.id !== product.id && 
      p.category === product.category
    );

    relatedProducts.slice(0, 2).forEach(p => {
      opportunities.push(`${p.name} - Perfecta combinación con tu elección`);
    });

    // Productos complementarios generales
    if (opportunities.length === 0) {
      opportunities.push('Accesorios y productos complementarios disponibles');
      opportunities.push('Productos de mantenimiento recomendados');
    }

    return opportunities;
  }

  /**
   * Análisis profundo de conversación
   */
  analyzeConversation(message: string, history: string[] = []): ConversationAnalysis {
    const lowerMessage = message.toLowerCase();
    
    const intent = this.detectIntent(lowerMessage);
    const sentiment = this.analyzeSentiment(lowerMessage);
    const urgency = this.detectUrgency(lowerMessage);
    const purchaseIntent = this.calculatePurchaseIntent(lowerMessage, intent);
    const emotionalTriggers = this.identifyEmotionalTriggers(lowerMessage, sentiment);

    return {
      intent,
      sentiment,
      urgency,
      purchaseIntent,
      emotionalTriggers
    };
  }

  private detectIntent(message: string): string {
    let maxScore = 0;
    let detectedIntent = 'general';

    Object.entries(this.intentPatterns).forEach(([intent, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (message.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
      }
    });

    return detectedIntent;
  }

  private analyzeSentiment(message: string): number {
    let score = 0;
    
    this.positiveWords.forEach(word => {
      if (message.includes(word)) score += 0.1;
    });
    
    this.negativeWords.forEach(word => {
      if (message.includes(word)) score -= 0.1;
    });

    return Math.max(-1, Math.min(1, score));
  }

  private detectUrgency(message: string): 'low' | 'medium' | 'high' {
    const urgentCount = this.urgentWords.reduce((count, word) => {
      return count + (message.includes(word) ? 1 : 0);
    }, 0);

    if (urgentCount >= 2) return 'high';
    if (urgentCount >= 1) return 'medium';
    return 'low';
  }

  private calculatePurchaseIntent(message: string, intent: string): number {
    let score = 0;

    // Score base según intención
    const intentScores: Record<string, number> = {
      purchase: 0.8,
      pricing: 0.6,
      availability: 0.5,
      info: 0.3,
      comparison: 0.4,
      general: 0.1
    };

    score = intentScores[intent] || 0.1;

    // Modificadores
    if (message.includes('comprar') || message.includes('llevarlo')) score += 0.2;
    if (message.includes('cuanto cuesta')) score += 0.1;
    if (message.includes('disponible')) score += 0.1;

    return Math.min(1, score);
  }

  private identifyEmotionalTriggers(message: string, sentiment: number): string[] {
    const triggers: string[] = [];

    if (sentiment > 0.3) triggers.push('entusiasmo');
    if (sentiment < -0.3) triggers.push('frustración');
    if (message.includes('urgente')) triggers.push('urgencia');
    if (message.includes('precio') || message.includes('caro')) triggers.push('precio');
    if (message.includes('calidad')) triggers.push('calidad');
    if (message.includes('rápido')) triggers.push('velocidad');

    return triggers;
  }

  /**
   * Detección inteligente de productos en mensaje
   */
  async detectProductsInMessage(message: string, userId: string): Promise<number[]> {
    try {
      const products = await storage.getProducts(userId);
      const detected: number[] = [];
      const lowerMessage = message.toLowerCase();

      products.forEach(product => {
        const productName = product.name.toLowerCase();
        
        // Coincidencia exacta del nombre
        if (lowerMessage.includes(productName)) {
          detected.push(product.id);
          return;
        }

        // Coincidencia por palabras clave del nombre
        const nameWords = productName.split(' ').filter(word => word.length > 2);
        const matchedWords = nameWords.filter(word => lowerMessage.includes(word));
        
        if (matchedWords.length >= Math.min(2, nameWords.length)) {
          detected.push(product.id);
          return;
        }

        // Coincidencia por categoría
        if (product.category && lowerMessage.includes(product.category.toLowerCase())) {
          detected.push(product.id);
        }

        // Coincidencia por tags/etiquetas
        if (product.tags && Array.isArray(product.tags)) {
          const hasTagMatch = product.tags.some((tag: string) => 
            lowerMessage.includes(tag.toLowerCase())
          );
          if (hasTagMatch) {
            detected.push(product.id);
          }
        }
      });

      return Array.from(new Set(detected));
    } catch (error) {
      console.error('Error detecting products:', error);
      return [];
    }
  }

  /**
   * Generación de respuesta inteligente principal
   */
  async generateIntelligentResponse(
    message: string, 
    history: string[], 
    userId: string,
    businessType: 'products' | 'services' = 'products'
  ): Promise<IntelligentResponse> {
    
    const analysis = this.analyzeConversation(message, history);
    const detectedProducts = await this.detectProductsInMessage(message, userId);
    
    let responseMessage = '';
    const suggestedActions: string[] = [];
    const nextQuestions: string[] = [];

    if (businessType === 'products' && detectedProducts.length > 0) {
      // Respuesta inteligente para productos
      const productInsights = await this.analyzeProduct(detectedProducts[0], userId);
      responseMessage = await this.generateProductResponse(analysis, productInsights);
      suggestedActions.push(...productInsights.salesPoints.slice(0, 2));
      nextQuestions.push(...this.generateProductQuestions(analysis.intent));
    } else if (businessType === 'services') {
      // Respuesta inteligente para servicios/citas
      responseMessage = this.generateServiceResponse(analysis);
      suggestedActions.push('Verificar disponibilidad', 'Agendar cita');
      nextQuestions.push(...this.generateServiceQuestions(analysis.intent));
    } else {
      // Respuesta general inteligente
      responseMessage = this.generateGeneralResponse(analysis);
      suggestedActions.push('Identificar necesidad', 'Ofrecer información');
      nextQuestions.push('¿En qué puedo ayudarte específicamente?');
    }

    // Adaptación según sentimiento
    responseMessage = this.adaptToSentiment(responseMessage, analysis);

    return {
      message: responseMessage,
      confidence: 0.85,
      detectedProducts,
      suggestedActions,
      nextQuestions,
      analysis
    };
  }

  private async generateProductResponse(analysis: ConversationAnalysis, insights: ProductInsights): Promise<string> {
    let response = '';

    switch (analysis.intent) {
      case 'pricing':
        response = `Te entiendo perfectamente. Antes de hablar del precio, déjame contarte por qué vale cada centavo. Este producto destaca por ${insights.keyFeatures.slice(0, 2).join(' y ')}.`;
        break;
      case 'purchase':
        response = `¡Excelente decisión! Este producto es perfecto porque ${insights.salesPoints[0]}. ${insights.keyFeatures.slice(0, 2).join(' y ')}.`;
        break;
      case 'info':
        response = `Te explico todo sobre este increíble producto. Sus características principales son ${insights.keyFeatures.slice(0, 3).join(', ')}. Es ideal para ${insights.targetAudience.slice(0, 2).join(' y ')}.`;
        break;
      case 'availability':
        response = `Perfecto, verifico la disponibilidad. Este producto ${insights.salesPoints[0]} y ${insights.keyFeatures[0]}.`;
        break;
      case 'comparison':
        response = `Excelente pregunta. Este producto se destaca porque ${insights.salesPoints.slice(0, 2).join(' y ')}. Sus ventajas principales son ${insights.keyFeatures.slice(0, 3).join(', ')}.`;
        break;
      default:
        response = `Este producto es una excelente opción. Destaca por ${insights.keyFeatures.slice(0, 2).join(' y ')}. ${insights.salesPoints[0]}.`;
    }

    // Agregar urgencia si es necesaria
    if (analysis.urgency === 'high') {
      response += ' Tenemos disponibilidad inmediata para entrega hoy mismo.';
    }

    return response;
  }

  private generateServiceResponse(analysis: ConversationAnalysis): string {
    let response = '';

    switch (analysis.intent) {
      case 'appointment':
        response = '¡Perfecto! Te ayudo a agendar tu cita. Nuestro servicio incluye atención personalizada y resultados garantizados. ¿Qué día te conviene más?';
        break;
      case 'info':
        response = 'Te explico sobre nuestros servicios. Ofrecemos atención profesional personalizada con seguimiento completo y garantía de satisfacción.';
        break;
      case 'pricing':
        response = 'Entiendo tu interés en conocer los precios. Nuestros servicios tienen un excelente valor porque incluyen consulta completa, seguimiento y garantía.';
        break;
      case 'availability':
        response = 'Verifico nuestra disponibilidad. Tenemos horarios flexibles y podemos adaptarnos a tus necesidades específicas.';
        break;
      default:
        response = 'Nuestros servicios están diseñados para ofrecerte la mejor experiencia. Incluyen atención especializada y resultados comprobados.';
    }

    if (analysis.urgency === 'high') {
      response += ' Tenemos disponibilidad para citas urgentes incluso hoy mismo.';
    }

    return response;
  }

  private generateGeneralResponse(analysis: ConversationAnalysis): string {
    const responses: Record<string, string> = {
      pricing: 'Te ayudo con información sobre precios y opciones de pago. ¿Qué producto o servicio te interesa?',
      info: '¡Perfecto! Estoy aquí para darte toda la información que necesites. ¿Sobre qué quieres saber más?',
      support: 'Entiendo que necesitas ayuda. Estoy aquí para resolver cualquier duda o problema que tengas.',
      general: '¡Hola! Gracias por contactarnos. Estoy aquí para ayudarte con información sobre nuestros productos y servicios.'
    };

    return responses[analysis.intent] || responses.general;
  }

  private generateProductQuestions(intent: string): string[] {
    const questions: Record<string, string[]> = {
      pricing: ['¿Te interesa conocer nuestras opciones de financiamiento?', '¿Hay algún presupuesto específico que tienes en mente?'],
      info: ['¿Hay alguna característica que te interesa más?', '¿Para qué uso principal lo necesitas?'],
      purchase: ['¿Prefieres que coordinemos la entrega?', '¿Necesitas algún accesorio adicional?'],
      availability: ['¿Para cuándo lo necesitas?', '¿Te interesa que te avisemos cuando tengamos stock?'],
      general: ['¿Qué tipo de producto estás buscando?', '¿Cómo puedo ayudarte mejor?']
    };

    return questions[intent] || questions.general;
  }

  private generateServiceQuestions(intent: string): string[] {
    const questions: Record<string, string[]> = {
      appointment: ['¿Qué horario te conviene mejor?', '¿Es la primera vez que tomas este servicio?'],
      info: ['¿Qué tipo de servicio necesitas?', '¿Hay algo específico que te preocupa?'],
      pricing: ['¿Te interesa conocer nuestros paquetes?', '¿Buscas algo específico dentro de tu presupuesto?'],
      general: ['¿Qué tipo de servicio necesitas?', '¿Cómo puedo ayudarte hoy?']
    };

    return questions[intent] || questions.general;
  }

  private adaptToSentiment(message: string, analysis: ConversationAnalysis): string {
    if (analysis.sentiment < -0.3) {
      return `Entiendo tu preocupación y quiero asegurarme de que tengas la mejor experiencia. ${message}`;
    }
    if (analysis.sentiment > 0.3) {
      return `¡Me alegra tu entusiasmo! ${message}`;
    }
    return message;
  }
}

export const intelligentAI = new IntelligentAIService();