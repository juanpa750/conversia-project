// Servicio de IA gratuito para respuestas automáticas
interface AIResponse {
  message: string;
  confidence: number;
}

interface ChatContext {
  userMessage: string;
  conversationHistory: string[];
  businessType: string;
  language: string;
}

export class FreeAIService {
  private responses: Map<string, string[]> = new Map();
  private patterns: Map<RegExp, string[]> = new Map();

  constructor() {
    this.initializeResponses();
  }

  private initializeResponses() {
    // Respuestas de saludo
    this.responses.set('greeting', [
      '¡Hola! 👋 Gracias por contactarnos. ¿En qué podemos ayudarte hoy?',
      '¡Bienvenido/a! 😊 Estamos aquí para ayudarte. ¿Qué necesitas?',
      '¡Hola! Es un gusto saludarte. ¿Cómo podemos asistirte?'
    ]);

    // Respuestas de información
    this.responses.set('info', [
      'Te ayudo con información sobre nuestros productos y servicios. ¿Qué te interesa conocer?',
      'Estoy aquí para brindarte toda la información que necesites. ¿En qué puedo ayudarte?',
      'Con gusto te proporciono información. ¿Sobre qué producto o servicio quieres saber?'
    ]);

    // Respuestas de precios
    this.responses.set('pricing', [
      'Para información sobre precios y promociones especiales, déjame conectarte con un asesor especializado.',
      'Tenemos excelentes ofertas disponibles. Un momento mientras reviso los precios actuales para ti.',
      'Los precios varían según el producto. ¿Qué producto específico te interesa?'
    ]);

    // Respuestas de disponibilidad
    this.responses.set('availability', [
      'Verifico la disponibilidad del producto. Un momento por favor...',
      'Déjame consultar nuestro inventario para confirmar la disponibilidad.',
      'Reviso el stock disponible. ¿Qué producto necesitas?'
    ]);

    // Respuestas de despedida
    this.responses.set('goodbye', [
      '¡Gracias por contactarnos! 😊 Si necesitas algo más, estaré aquí para ayudarte.',
      'Ha sido un placer ayudarte. ¡Que tengas un excelente día!',
      '¡Hasta pronto! No dudes en escribirnos cuando necesites ayuda.'
    ]);

    // Respuestas por defecto
    this.responses.set('default', [
      'Gracias por tu mensaje. Un asesor te responderá pronto para brindarte la mejor atención.',
      'Hemos recibido tu consulta. En breve un especialista se comunicará contigo.',
      'Tu mensaje es importante para nosotros. Te responderemos lo antes posible.'
    ]);

    // Patrones de reconocimiento
    this.patterns.set(/\b(hola|hi|hello|buenos días|buenas tardes|buenas noches|saludos)\b/i, ['greeting']);
    this.patterns.set(/\b(precio|costo|vale|cuánto|cuesta|valor|tarifa)\b/i, ['pricing']);
    this.patterns.set(/\b(disponible|stock|hay|tienen|existe|inventario)\b/i, ['availability']);
    this.patterns.set(/\b(información|info|detalles|características|especificaciones)\b/i, ['info']);
    this.patterns.set(/\b(adiós|bye|hasta luego|nos vemos|chao|gracias)\b/i, ['goodbye']);
  }

  async generateResponse(context: ChatContext): Promise<AIResponse> {
    const { userMessage, businessType, language } = context;
    
    // Analizar el mensaje del usuario
    const category = this.analyzeMessage(userMessage);
    
    // Generar respuesta contextual
    let responses = this.responses.get(category) || this.responses.get('default')!;
    
    // Personalizar para el tipo de negocio
    if (businessType === 'beauty' && category === 'info') {
      responses = [
        'Te ayudo con información sobre nuestros tratamientos de belleza y productos. ¿Qué te interesa conocer?',
        'Tenemos una amplia gama de productos de belleza. ¿Buscas algo específico para el cuidado de tu piel?',
        'Estoy aquí para asesorarte sobre nuestros tratamientos y productos de belleza. ¿En qué puedo ayudarte?'
      ];
    }

    // Seleccionar respuesta aleatoria
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      message: selectedResponse,
      confidence: 0.8
    };
  }

  private analyzeMessage(message: string): string {
    const lowercaseMessage = message.toLowerCase();
    
    // Buscar patrones en el mensaje
    for (const [pattern, categories] of this.patterns.entries()) {
      if (pattern.test(lowercaseMessage)) {
        return categories[0];
      }
    }
    
    // Si no encuentra patrones específicos, usar respuesta por defecto
    return 'default';
  }

  // Configurar respuestas personalizadas para un negocio
  async configureCustomResponses(userId: string, customResponses: any): Promise<void> {
    // En una implementación real, esto se guardaría en la base de datos
    console.log(`Configurando respuestas personalizadas para usuario: ${userId}`);
  }

  // Mejorar respuestas basadas en feedback
  async improveResponse(messageId: string, feedback: 'helpful' | 'not_helpful'): Promise<void> {
    console.log(`Feedback recibido para mensaje ${messageId}: ${feedback}`);
    // Aquí se implementaría el aprendizaje automático simple
  }
}

export const freeAIService = new FreeAIService();