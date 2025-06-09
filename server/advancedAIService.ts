// Servicio de IA Avanzada Gratuita - Análisis profundo de productos y servicios
import { storage } from './storage';

interface ProductAnalysis {
  productId: number;
  keyFeatures: string[];
  targetAudience: string[];
  useCase: string[];
  competitiveAdvantages: string[];
  salesAngles: string[];
  objectionHandling: string[];
  crossSellOpportunities: string[];
}

interface ServiceAnalysis {
  serviceType: string;
  duration: number;
  benefits: string[];
  idealCustomer: string[];
  preparationNeeded: string[];
  followUpActions: string[];
  upsellOpportunities: string[];
}

interface ConversationContext {
  userMessage: string;
  conversationHistory: string[];
  detectedIntent: string;
  sentimentScore: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  customerType: 'new' | 'returning' | 'vip';
  currentGoal: 'information' | 'purchase' | 'appointment' | 'support';
}

interface AIResponse {
  message: string;
  confidence: number;
  suggestedActions: string[];
  nextQuestions: string[];
  detectedProducts: number[];
  recommendedUpsells: string[];
  sentimentAnalysis: {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotionalTriggers: string[];
  };
}

export class AdvancedAIService {
  private productAnalysisCache: Map<number, ProductAnalysis> = new Map();
  private sentimentPatterns: Map<RegExp, { sentiment: string; weight: number }> = new Map();
  private intentPatterns: Map<RegExp, string> = new Map();
  private salesPsychology: Map<string, string[]> = new Map();

  constructor() {
    this.initializeSentimentAnalysis();
    this.initializeIntentRecognition();
    this.initializeSalesPsychology();
  }

  private initializeSentimentAnalysis() {
    // Patrones avanzados de análisis de sentimientos en español
    const positivePatterns = [
      { pattern: /\b(excelente|fantástico|increíble|perfecto|genial|estupendo)\b/gi, weight: 0.9 },
      { pattern: /\b(bueno|bien|gusta|interesa|quiero|necesito|me conviene)\b/gi, weight: 0.7 },
      { pattern: /\b(gracias|por favor|amable|atento|servicio)\b/gi, weight: 0.6 },
      { pattern: /\b(rápido|eficiente|económico|barato|oferta|descuento)\b/gi, weight: 0.8 },
      { pattern: /😊|😄|👍|❤️|🔥|💯/g, weight: 0.8 }
    ];

    const negativePatterns = [
      { pattern: /\b(malo|terrible|pésimo|horrible|desastre|odio)\b/gi, weight: -0.9 },
      { pattern: /\b(caro|costoso|no me gusta|no quiero|no puedo|problema)\b/gi, weight: -0.7 },
      { pattern: /\b(lento|difícil|complicado|confuso|molesto)\b/gi, weight: -0.6 },
      { pattern: /\b(cancelar|devolver|reembolso|queja|reclamo)\b/gi, weight: -0.8 },
      { pattern: /😡|😠|👎|💔|😞|😤/g, weight: -0.8 }
    ];

    const urgencyPatterns = [
      { pattern: /\b(urgente|rápido|ya|ahora|inmediato|pronto)\b/gi, weight: 0.9 },
      { pattern: /\b(necesito|requiero|debo|tengo que|es importante)\b/gi, weight: 0.7 },
      { pattern: /\b(hoy|mañana|esta semana|cuanto antes)\b/gi, weight: 0.8 }
    ];

    positivePatterns.forEach(({ pattern, weight }) => {
      this.sentimentPatterns.set(pattern, { sentiment: 'positive', weight });
    });

    negativePatterns.forEach(({ pattern, weight }) => {
      this.sentimentPatterns.set(pattern, { sentiment: 'negative', weight: Math.abs(weight) });
    });

    urgencyPatterns.forEach(({ pattern, weight }) => {
      this.sentimentPatterns.set(pattern, { sentiment: 'urgent', weight });
    });
  }

  private initializeIntentRecognition() {
    // Reconocimiento avanzado de intenciones
    this.intentPatterns.set(/\b(precio|costo|cuanto|vale|pagar|dinero|€|\$)\b/gi, 'pricing_inquiry');
    this.intentPatterns.set(/\b(disponible|stock|tienen|hay|existe|inventario)\b/gi, 'availability_check');
    this.intentPatterns.set(/\b(comprar|adquirir|llevarlo|pedirlo|ordenar)\b/gi, 'purchase_intent');
    this.intentPatterns.set(/\b(información|detalles|características|especificaciones|más)\b/gi, 'information_request');
    this.intentPatterns.set(/\b(cita|reserva|agendar|programar|turno|horario)\b/gi, 'appointment_booking');
    this.intentPatterns.set(/\b(problema|ayuda|soporte|error|no funciona)\b/gi, 'support_request');
    this.intentPatterns.set(/\b(comparar|diferencia|mejor|versus|vs)\b/gi, 'comparison_request');
    this.intentPatterns.set(/\b(envío|entrega|delivery|transporte|llegar)\b/gi, 'shipping_inquiry');
    this.intentPatterns.set(/\b(garantía|devolución|cambio|reembolso)\b/gi, 'warranty_inquiry');
    this.intentPatterns.set(/\b(descuento|oferta|promoción|rebaja|barato)\b/gi, 'discount_inquiry');
  }

  private initializeSalesPsychology() {
    // Psicología de ventas avanzada
    this.salesPsychology.set('pricing_inquiry', [
      'Valor percibido: Enfoca en beneficios antes que precio',
      'Ancla de precio: Compara con opciones más caras',
      'Urgencia: Menciona ofertas limitadas en tiempo'
    ]);

    this.salesPsychology.set('purchase_intent', [
      'Facilitación: Simplifica el proceso de compra',
      'Seguridad: Menciona garantías y devoluciones',
      'Escasez: Indica stock limitado o demanda alta'
    ]);

    this.salesPsychology.set('comparison_request', [
      'Diferenciación: Destaca ventajas únicas',
      'Autoridad: Menciona testimonios y reviews',
      'Consenso social: Indica qué eligen otros clientes'
    ]);

    this.salesPsychology.set('appointment_booking', [
      'Disponibilidad limitada: Crear urgencia por agendar',
      'Beneficio de la consulta: Enfatizar valor de la cita',
      'Opciones múltiples: Ofrecer diferentes horarios'
    ]);
  }

  /**
   * Análisis profundo de productos
   */
  async analyzeProduct(productId: number): Promise<ProductAnalysis> {
    if (this.productAnalysisCache.has(productId)) {
      return this.productAnalysisCache.get(productId)!;
    }

    // Obtener todos los productos y buscar el específico
    const products = await storage.getProducts(''); // Se pasará el userId correcto desde el contexto
    const product = products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const analysis: ProductAnalysis = {
      productId,
      keyFeatures: this.extractKeyFeatures(product.description, product.name),
      targetAudience: this.identifyTargetAudience(product.description, product.category),
      useCase: this.extractUseCases(product.description),
      competitiveAdvantages: this.identifyAdvantages(product.description),
      salesAngles: this.generateSalesAngles(product),
      objectionHandling: this.generateObjectionHandling(product),
      crossSellOpportunities: await this.identifyCrossSell(product)
    };

    this.productAnalysisCache.set(productId, analysis);
    return analysis;
  }

  private extractKeyFeatures(description: string, name: string): string[] {
    const text = `${name} ${description}`.toLowerCase();
    const features: string[] = [];

    // Patrones para identificar características clave
    const featurePatterns = [
      /\b(calidad|premium|profesional|avanzado|mejorado)\b/g,
      /\b(rápido|eficiente|automático|inteligente|smart)\b/g,
      /\b(resistente|duradero|robusto|sólido|fuerte)\b/g,
      /\b(fácil|simple|intuitivo|user-friendly|amigable)\b/g,
      /\b(económico|barato|accesible|asequible)\b/g,
      /\b(portable|portátil|ligero|compacto|pequeño)\b/g,
      /\b(versátil|flexible|adaptable|multifuncional)\b/g,
      /\b(innovador|moderno|actual|última generación)\b/g
    ];

    featurePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        features.push(...matches);
      }
    });

    // Extraer números y medidas importantes
    const measurements = text.match(/\d+\s*(cm|mm|kg|gb|mb|horas?|días?|años?)/g);
    if (measurements) {
      features.push(...measurements);
    }

    return Array.from(new Set(features)); // Eliminar duplicados
  }

  private identifyTargetAudience(description: string, category: string): string[] {
    const text = description.toLowerCase();
    const audiences: string[] = [];

    const audiencePatterns = [
      { pattern: /\b(empresas?|negocios?|comercios?|oficinas?)\b/g, audience: 'Empresas' },
      { pattern: /\b(profesionales?|expertos?|especialistas?)\b/g, audience: 'Profesionales' },
      { pattern: /\b(familias?|hogares?|casas?|domésticos?)\b/g, audience: 'Familias' },
      { pattern: /\b(estudiantes?|universidad|colegio|escuela)\b/g, audience: 'Estudiantes' },
      { pattern: /\b(jóvenes?|adolescentes?|teenagers?)\b/g, audience: 'Jóvenes' },
      { pattern: /\b(adultos?|mayores?|seniors?)\b/g, audience: 'Adultos' },
      { pattern: /\b(deportistas?|atletas?|fitness|gym)\b/g, audience: 'Deportistas' },
      { pattern: /\b(gamers?|videojuegos?|gaming)\b/g, audience: 'Gamers' }
    ];

    audiencePatterns.forEach(({ pattern, audience }) => {
      if (pattern.test(text)) {
        audiences.push(audience);
      }
    });

    // Audiencia basada en categoría
    const categoryAudience: Record<string, string[]> = {
      'tecnología': ['Profesionales', 'Jóvenes', 'Estudiantes'],
      'ropa': ['Jóvenes', 'Adultos', 'Profesionales'],
      'hogar': ['Familias', 'Adultos'],
      'deportes': ['Deportistas', 'Jóvenes'],
      'salud': ['Adultos', 'Familias'],
      'educación': ['Estudiantes', 'Profesionales']
    };

    const categoryLower = category.toLowerCase();
    Object.keys(categoryAudience).forEach(cat => {
      if (categoryLower.includes(cat)) {
        audiences.push(...categoryAudience[cat]);
      }
    });

    return [...new Set(audiences)];
  }

  private extractUseCases(description: string): string[] {
    const text = description.toLowerCase();
    const useCases: string[] = [];

    const useCasePatterns = [
      /\bpara\s+([^.!?]*)/g,
      /\bideal\s+para\s+([^.!?]*)/g,
      /\bperfecto\s+para\s+([^.!?]*)/g,
      /\bútil\s+para\s+([^.!?]*)/g,
      /\bse\s+usa\s+para\s+([^.!?]*)/g
    ];

    useCasePatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].length > 5) {
          useCases.push(match[1].trim());
        }
      });
    });

    return useCases.slice(0, 5); // Límite de 5 casos de uso
  }

  private identifyAdvantages(description: string): string[] {
    const text = description.toLowerCase();
    const advantages: string[] = [];

    const advantagePatterns = [
      'ahorra tiempo',
      'reduce costos',
      'mejora eficiencia',
      'fácil de usar',
      'alta calidad',
      'mejor precio',
      'garantía extendida',
      'soporte técnico',
      'instalación gratuita',
      'entrega rápida'
    ];

    advantagePatterns.forEach(advantage => {
      if (text.includes(advantage)) {
        advantages.push(advantage);
      }
    });

    return advantages;
  }

  private generateSalesAngles(product: any): string[] {
    const angles: string[] = [];

    // Ángulo de precio/valor
    if (product.price && parseFloat(product.price) < 100) {
      angles.push('Inversión accesible con gran retorno de valor');
    } else {
      angles.push('Calidad premium que justifica la inversión');
    }

    // Ángulo de escasez
    if (product.stock && product.stock < 10) {
      angles.push('Stock limitado - disponibilidad inmediata');
    }

    // Ángulo de urgencia
    angles.push('Oferta por tiempo limitado');

    // Ángulo de garantía
    angles.push('Garantía de satisfacción incluida');

    return angles;
  }

  private generateObjectionHandling(product: any): string[] {
    return [
      `Precio: "Entiendo la preocupación por el precio. Considerando ${product.name}, el valor que obtienes supera la inversión..."`,
      'Tiempo: "Sabemos que tu tiempo es valioso. Por eso este producto está diseñado para ahorrarte horas..."',
      'Calidad: "Trabajamos solo con proveedores certificados y ofrecemos garantía completa..."',
      'Necesidad: "Muchos clientes inicialmente pensaron lo mismo, pero después nos agradecieron..."'
    ];
  }

  private async identifyCrossSell(product: any): Promise<string[]> {
    try {
      const allProducts = await storage.getProducts(product.userId);
      const crossSells: string[] = [];

      // Productos relacionados por categoría
      const related = allProducts.filter(p => 
        p.id !== product.id && 
        p.category === product.category
      );

      related.slice(0, 3).forEach(p => {
        crossSells.push(`${p.name} - Complementa perfectamente tu compra`);
      });

      return crossSells;
    } catch {
      return ['Productos complementarios disponibles bajo consulta'];
    }
  }

  /**
   * Análisis contextual de conversación
   */
  analyzeConversation(userMessage: string, history: string[] = []): ConversationContext {
    const detectedIntent = this.detectIntent(userMessage);
    const sentimentScore = this.analyzeSentiment(userMessage);
    const urgencyLevel = this.detectUrgency(userMessage);
    const customerType = this.identifyCustomerType(history);
    const currentGoal = this.identifyGoal(userMessage, detectedIntent);

    return {
      userMessage,
      conversationHistory: history,
      detectedIntent,
      sentimentScore,
      urgencyLevel,
      customerType,
      currentGoal
    };
  }

  private detectIntent(message: string): string {
    for (const [pattern, intent] of this.intentPatterns) {
      if (pattern.test(message)) {
        return intent;
      }
    }
    return 'general_inquiry';
  }

  private analyzeSentiment(message: string): number {
    let score = 0;
    let totalWeight = 0;

    for (const [pattern, { sentiment, weight }] of this.sentimentPatterns) {
      const matches = message.match(pattern);
      if (matches) {
        const multiplier = sentiment === 'negative' ? -1 : 1;
        score += (weight * multiplier * matches.length);
        totalWeight += weight * matches.length;
      }
    }

    // Normalizar entre -1 y 1
    return totalWeight > 0 ? Math.max(-1, Math.min(1, score / totalWeight)) : 0;
  }

  private detectUrgency(message: string): 'low' | 'medium' | 'high' {
    const urgentWords = ['urgente', 'rápido', 'ya', 'inmediato', 'ahora'];
    const moderateWords = ['pronto', 'necesito', 'importante'];
    
    const lowerMessage = message.toLowerCase();
    
    if (urgentWords.some(word => lowerMessage.includes(word))) return 'high';
    if (moderateWords.some(word => lowerMessage.includes(word))) return 'medium';
    return 'low';
  }

  private identifyCustomerType(history: string[]): 'new' | 'returning' | 'vip' {
    if (history.length === 0) return 'new';
    if (history.length > 10) return 'vip';
    return 'returning';
  }

  private identifyGoal(message: string, intent: string): 'information' | 'purchase' | 'appointment' | 'support' {
    if (intent.includes('purchase') || intent.includes('pricing')) return 'purchase';
    if (intent.includes('appointment')) return 'appointment';
    if (intent.includes('support')) return 'support';
    return 'information';
  }

  /**
   * Generación de respuesta inteligente
   */
  async generateIntelligentResponse(
    context: ConversationContext,
    detectedProducts: number[] = [],
    serviceType?: string
  ): Promise<AIResponse> {
    
    const sentimentAnalysis = this.generateSentimentAnalysis(context);
    let message = '';
    const suggestedActions: string[] = [];
    const nextQuestions: string[] = [];
    const recommendedUpsells: string[] = [];

    // Análisis de productos detectados
    if (detectedProducts.length > 0) {
      const productAnalyses = await Promise.all(
        detectedProducts.map(id => this.analyzeProduct(id))
      );
      
      message = await this.generateProductResponse(context, productAnalyses[0]);
      suggestedActions.push(...productAnalyses[0].salesAngles);
      recommendedUpsells.push(...productAnalyses[0].crossSellOpportunities);
    } 
    // Análisis de servicios
    else if (serviceType) {
      const serviceAnalysis = this.analyzeService(serviceType);
      message = this.generateServiceResponse(context, serviceAnalysis);
      suggestedActions.push('Agendar consulta', 'Revisar disponibilidad');
    }
    // Respuesta general inteligente
    else {
      message = this.generateContextualResponse(context);
      suggestedActions.push('Continuar conversación', 'Identificar necesidad');
    }

    // Adaptación según sentimiento
    message = this.adaptResponseToSentiment(message, sentimentAnalysis);

    // Generar preguntas de seguimiento
    nextQuestions.push(...this.generateFollowUpQuestions(context));

    return {
      message,
      confidence: 0.85,
      suggestedActions,
      nextQuestions,
      detectedProducts,
      recommendedUpsells,
      sentimentAnalysis
    };
  }

  private generateSentimentAnalysis(context: ConversationContext): {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotionalTriggers: string[];
  } {
    const score = context.sentimentScore;
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    
    if (score > 0.2) sentiment = 'positive';
    else if (score < -0.2) sentiment = 'negative';

    const emotionalTriggers: string[] = [];
    if (context.urgencyLevel === 'high') emotionalTriggers.push('urgencia');
    if (sentiment === 'negative') emotionalTriggers.push('frustración');
    if (context.currentGoal === 'purchase') emotionalTriggers.push('decisión de compra');

    return {
      sentiment,
      confidence: Math.abs(score),
      emotionalTriggers
    };
  }

  private async generateProductResponse(context: ConversationContext, analysis: ProductAnalysis): Promise<string> {
    const psychology = this.salesPsychology.get(context.detectedIntent) || [];
    let response = '';

    // Respuesta base según intención
    switch (context.detectedIntent) {
      case 'pricing_inquiry':
        response = `Te entiendo perfectamente. Antes de hablar del precio, déjame contarte por qué este producto es una excelente inversión. ${analysis.keyFeatures.slice(0, 2).join(' y ')}. `;
        break;
      case 'information_request':
        response = `¡Excelente elección! Este producto destacó por ${analysis.keyFeatures.slice(0, 3).join(', ')}. Es ideal para ${analysis.targetAudience.slice(0, 2).join(' y ')}.`;
        break;
      case 'purchase_intent':
        response = `¡Perfecto! Estás tomando una gran decisión. Este producto te va a encantar porque ${analysis.competitiveAdvantages.slice(0, 2).join(' y ')}.`;
        break;
      default:
        response = `Te puedo ayudar con información sobre este increíble producto. Sus principales beneficios son ${analysis.keyFeatures.slice(0, 3).join(', ')}.`;
    }

    // Adaptación según urgencia
    if (context.urgencyLevel === 'high') {
      response += ' Tenemos disponibilidad inmediata y podemos procesarlo hoy mismo.';
    }

    // Adaptación según tipo de cliente
    if (context.customerType === 'vip') {
      response += ' Como cliente preferencial, tienes acceso a descuentos especiales.';
    }

    return response;
  }

  private analyzeService(serviceType: string): ServiceAnalysis {
    // Análisis básico de servicios - se puede expandir
    return {
      serviceType,
      duration: 60,
      benefits: ['Consulta personalizada', 'Atención profesional', 'Resultados garantizados'],
      idealCustomer: ['Personas que buscan soluciones específicas'],
      preparationNeeded: ['Información básica', 'Disponibilidad de tiempo'],
      followUpActions: ['Seguimiento post-servicio', 'Evaluación de resultados'],
      upsellOpportunities: ['Servicios complementarios', 'Paquetes de seguimiento']
    };
  }

  private generateServiceResponse(context: ConversationContext, analysis: ServiceAnalysis): string {
    let response = '';

    switch (context.detectedIntent) {
      case 'appointment_booking':
        response = `¡Perfecto! Te ayudo a agendar tu cita. Nuestro servicio incluye ${analysis.benefits.slice(0, 2).join(' y ')}. ¿Qué día te conviene más?`;
        break;
      case 'information_request':
        response = `Te explico sobre nuestro servicio. Incluye ${analysis.benefits.join(', ')} con una duración aproximada de ${analysis.duration} minutos.`;
        break;
      default:
        response = `Nuestro servicio está diseñado para ${analysis.idealCustomer[0]}. Los beneficios principales son ${analysis.benefits.slice(0, 3).join(', ')}.`;
    }

    if (context.urgencyLevel === 'high') {
      response += ' Tenemos disponibilidad para citas urgentes hoy mismo.';
    }

    return response;
  }

  private generateContextualResponse(context: ConversationContext): string {
    const responses = {
      'general_inquiry': '¡Hola! Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?',
      'support_request': 'Entiendo que necesitas ayuda. Estoy aquí para resolver cualquier duda o problema que tengas.',
      'comparison_request': 'Te ayudo a comparar opciones para que tomes la mejor decisión según tus necesidades.',
      'shipping_inquiry': 'Por supuesto, te proporciono toda la información sobre envíos y entrega.',
      'warranty_inquiry': 'Claro, te explico todo sobre nuestras garantías y políticas de devolución.',
      'discount_inquiry': 'Te entiendo, todos buscamos la mejor oferta. Déjame revisar las promociones disponibles.'
    };

    return responses[context.detectedIntent as keyof typeof responses] || responses['general_inquiry'];
  }

  private adaptResponseToSentiment(message: string, sentiment: any): string {
    if (sentiment.sentiment === 'negative') {
      return `Entiendo tu preocupación y quiero asegurarme de que tengas la mejor experiencia. ${message}`;
    }
    if (sentiment.sentiment === 'positive') {
      return `¡Me alegra tu entusiasmo! ${message}`;
    }
    return message;
  }

  private generateFollowUpQuestions(context: ConversationContext): string[] {
    const questions = {
      'pricing_inquiry': [
        '¿Te gustaría conocer nuestras opciones de financiamiento?',
        '¿Hay algún presupuesto específico que tienes en mente?'
      ],
      'information_request': [
        '¿Hay alguna característica específica que te interesa más?',
        '¿Para qué uso principal lo necesitas?'
      ],
      'purchase_intent': [
        '¿Prefieres que coordinemos la entrega o lo recoges?',
        '¿Necesitas algún accesorio adicional?'
      ],
      'appointment_booking': [
        '¿Qué horario te conviene mejor: mañana o tarde?',
        '¿Es la primera vez que tomas este servicio?'
      ],
      'general_inquiry': [
        '¿Estás buscando algo específico?',
        '¿Cómo puedo ayudarte mejor?'
      ]
    };

    return questions[context.detectedIntent as keyof typeof questions] || questions['general_inquiry'];
  }

  /**
   * Detección inteligente de productos en mensaje
   */
  async detectProductsInMessage(message: string, userId: string): Promise<number[]> {
    try {
      const products = await storage.getProducts(userId);
      const detectedProducts: number[] = [];
      const lowerMessage = message.toLowerCase();

      products.forEach(product => {
        const productName = product.name.toLowerCase();
        const productWords = productName.split(' ');
        
        // Coincidencia exacta del nombre
        if (lowerMessage.includes(productName)) {
          detectedProducts.push(product.id);
          return;
        }

        // Coincidencia de palabras clave (al menos 2 palabras si el nombre tiene más de 2)
        if (productWords.length > 1) {
          const matchedWords = productWords.filter(word => 
            word.length > 2 && lowerMessage.includes(word)
          );
          
          if (matchedWords.length >= Math.min(2, productWords.length)) {
            detectedProducts.push(product.id);
          }
        }

        // Coincidencia por categoría
        if (product.category && lowerMessage.includes(product.category.toLowerCase())) {
          detectedProducts.push(product.id);
        }

        // Coincidencia por tags
        if (product.tags && product.tags.length > 0) {
          const hasTagMatch = product.tags.some(tag => 
            lowerMessage.includes(tag.toLowerCase())
          );
          if (hasTagMatch) {
            detectedProducts.push(product.id);
          }
        }
      });

      return [...new Set(detectedProducts)]; // Eliminar duplicados
    } catch (error) {
      console.error('Error detecting products:', error);
      return [];
    }
  }

  /**
   * Análisis de intención de compra
   */
  analyzePurchaseIntent(context: ConversationContext): {
    score: number;
    stage: 'awareness' | 'consideration' | 'decision' | 'purchase';
    signals: string[];
  } {
    const message = context.userMessage.toLowerCase();
    let score = 0;
    const signals: string[] = [];

    // Señales de alta intención
    const highIntentPatterns = [
      { pattern: /\b(comprar|compro|adquirir|llevarlo|pedirlo)\b/g, score: 0.8, signal: 'Intención directa de compra' },
      { pattern: /\b(cuanto cuesta|precio|pagar|dinero)\b/g, score: 0.6, signal: 'Interés en precio' },
      { pattern: /\b(disponible|stock|tienen|hay)\b/g, score: 0.5, signal: 'Verificación de disponibilidad' },
      { pattern: /\b(entrega|envío|cuando llega)\b/g, score: 0.7, signal: 'Planificación de entrega' }
    ];

    // Señales de consideración
    const considerationPatterns = [
      { pattern: /\b(información|detalles|características)\b/g, score: 0.4, signal: 'Búsqueda de información' },
      { pattern: /\b(comparar|diferencia|mejor|versus)\b/g, score: 0.5, signal: 'Comparación de opciones' },
      { pattern: /\b(opiniones|reviews|comentarios)\b/g, score: 0.3, signal: 'Validación social' }
    ];

    // Señales de consciencia
    const awarenessPatterns = [
      { pattern: /\b(qué es|para qué|cómo funciona)\b/g, score: 0.2, signal: 'Descubrimiento de producto' },
      { pattern: /\b(me interesa|me gusta|quiero saber)\b/g, score: 0.3, signal: 'Interés inicial' }
    ];

    // Calcular score y señales
    [...highIntentPatterns, ...considerationPatterns, ...awarenessPatterns].forEach(({ pattern, score: patternScore, signal }) => {
      if (pattern.test(message)) {
        score += patternScore;
        signals.push(signal);
      }
    });

    // Determinar etapa
    let stage: 'awareness' | 'consideration' | 'decision' | 'purchase' = 'awareness';
    if (score > 0.7) stage = 'purchase';
    else if (score > 0.5) stage = 'decision';
    else if (score > 0.3) stage = 'consideration';

    // Factores adicionales
    if (context.urgencyLevel === 'high') score += 0.2;
    if (context.customerType === 'returning') score += 0.1;

    return {
      score: Math.min(1, score),
      stage,
      signals
    };
  }
}

export const advancedAIService = new AdvancedAIService();