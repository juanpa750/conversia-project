import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Bot, 
  Target, 
  ShoppingCart, 
  HeadphonesIcon, 
  Calendar, 
  UtensilsCrossed, 
  Building, 
  GraduationCap,
  Heart,
  Car,
  Lightbulb,
  MessageSquare,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface ChatbotObjective {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  industry: string[];
  features: string[];
  templates: string[];
  recommendations: {
    tone: string;
    structure: string[];
    keyMessages: string[];
    followUpActions: string[];
  };
}

const objectives: ChatbotObjective[] = [
  {
    id: 'sales',
    name: 'Incrementar Ventas',
    description: 'Generar leads, mostrar productos y cerrar ventas',
    icon: <ShoppingCart className="w-6 h-6" />,
    industry: ['E-commerce', 'Retail', 'Inmobiliaria', 'Servicios'],
    features: ['Catálogo de productos', 'Carrito de compras', 'Pagos', 'Seguimiento'],
    templates: ['Bienvenida comercial', 'Presentación de productos', 'Manejo de objeciones'],
    recommendations: {
      tone: 'Persuasivo y amigable, enfocado en beneficios',
      structure: [
        'Atención - Captar interés inicial',
        'Interés - Despertar curiosidad',
        'Deseo - Crear necesidad del producto',
        'Acción - Motivar la compra',
        'Seguimiento - Cerrar y acompañar',
        'Post-venta - Fidelización'
      ],
      keyMessages: [
        'Ofrecer valor inmediato',
        'Crear urgencia apropiada',
        'Destacar beneficios únicos',
        'Testimonios de clientes'
      ],
      followUpActions: [
        'Enviar cotización',
        'Programar llamada',
        'Ofrecer descuentos',
        'Compartir testimonios'
      ]
    }
  },
  {
    id: 'support',
    name: 'Servicio al Cliente',
    description: 'Resolver dudas y problemas de manera eficiente',
    icon: <HeadphonesIcon className="w-6 h-6" />,
    industry: ['Tecnología', 'Telecomunicaciones', 'Banca', 'Seguros'],
    features: ['Base de conocimiento', 'Tickets', 'Escalación', 'Seguimiento'],
    templates: ['Resolución de problemas', 'Preguntas frecuentes', 'Escalación a humano'],
    recommendations: {
      tone: 'Empático, profesional y solucionador',
      structure: [
        'Escuchar el problema',
        'Hacer preguntas clarificadoras',
        'Ofrecer soluciones',
        'Confirmar resolución',
        'Seguimiento'
      ],
      keyMessages: [
        'Entendemos tu situación',
        'Estamos aquí para ayudarte',
        'Vamos a resolver esto juntos',
        'Tu satisfacción es importante'
      ],
      followUpActions: [
        'Crear ticket de soporte',
        'Transferir a especialista',
        'Enviar tutorial',
        'Programar seguimiento'
      ]
    }
  },
  {
    id: 'appointments',
    name: 'Agendamiento de Citas',
    description: 'Gestionar reservas y citas de manera automática',
    icon: <Calendar className="w-6 h-6" />,
    industry: ['Salud', 'Belleza', 'Consultoría', 'Servicios profesionales'],
    features: ['Calendario integrado', 'Recordatorios', 'Cancelaciones', 'Reprogramación'],
    templates: ['Solicitud de cita', 'Confirmación', 'Recordatorios'],
    recommendations: {
      tone: 'Organizado, claro y confirmativo',
      structure: [
        'Consultar disponibilidad',
        'Confirmar detalles',
        'Agendar cita',
        'Enviar confirmación',
        'Recordatorios automáticos'
      ],
      keyMessages: [
        'Agenda fácil y rápido',
        'Confirmación inmediata',
        'Flexibilidad de horarios',
        'Recordatorios automáticos'
      ],
      followUpActions: [
        'Enviar confirmación',
        'Configurar recordatorios',
        'Solicitar información adicional',
        'Ofrecer servicios relacionados'
      ]
    }
  },
  {
    id: 'orders',
    name: 'Tomar Pedidos',
    description: 'Gestionar pedidos de restaurantes y delivery',
    icon: <UtensilsCrossed className="w-6 h-6" />,
    industry: ['Restaurantes', 'Delivery', 'Comida rápida', 'Catering'],
    features: ['Menú digital', 'Personalización', 'Pagos', 'Seguimiento de entrega'],
    templates: ['Mostrar menú', 'Tomar pedido', 'Confirmar orden'],
    recommendations: {
      tone: 'Apetitoso, eficiente y descriptivo',
      structure: [
        'Mostrar menú destacado',
        'Tomar preferencias',
        'Configurar pedido',
        'Confirmar detalles',
        'Procesar pago'
      ],
      keyMessages: [
        'Ingredientes frescos',
        'Preparación rápida',
        'Entrega puntual',
        'Satisfacción garantizada'
      ],
      followUpActions: [
        'Confirmar pedido',
        'Procesar pago',
        'Enviar tiempo estimado',
        'Rastrear entrega'
      ]
    }
  },
  {
    id: 'lead_generation',
    name: 'Generación de Leads',
    description: 'Capturar y calificar clientes potenciales',
    icon: <Target className="w-6 h-6" />,
    industry: ['B2B', 'Inmobiliaria', 'Educación', 'Seguros'],
    features: ['Formularios dinámicos', 'Scoring', 'Segmentación', 'Nurturing'],
    templates: ['Captura de datos', 'Calificación', 'Seguimiento'],
    recommendations: {
      tone: 'Consultivo, profesional y orientado a valor',
      structure: [
        'Despertar interés',
        'Identificar necesidades',
        'Capturar información',
        'Calificar prospecto',
        'Programar seguimiento'
      ],
      keyMessages: [
        'Soluciones personalizadas',
        'Experiencia comprobada',
        'Resultados medibles',
        'Consulta gratuita'
      ],
      followUpActions: [
        'Agendar consulta',
        'Enviar material informativo',
        'Asignar vendedor',
        'Crear perfil de cliente'
      ]
    }
  },
  {
    id: 'information',
    name: 'Información y FAQ',
    description: 'Proporcionar información general y responder preguntas',
    icon: <MessageSquare className="w-6 h-6" />,
    industry: ['Gobierno', 'Educación', 'ONGs', 'Servicios públicos'],
    features: ['Base de conocimiento', 'Búsqueda inteligente', 'Categorización'],
    templates: ['Respuestas FAQ', 'Información general', 'Direccionamiento'],
    recommendations: {
      tone: 'Informativo, claro y accesible',
      structure: [
        'Entender consulta',
        'Proporcionar información',
        'Verificar comprensión',
        'Ofrecer recursos adicionales',
        'Direccionar si es necesario'
      ],
      keyMessages: [
        'Información actualizada',
        'Respuestas precisas',
        'Recursos adicionales',
        'Estamos para ayudar'
      ],
      followUpActions: [
        'Enviar documentos',
        'Direccionar a especialista',
        'Proporcionar enlaces',
        'Programar llamada informativa'
      ]
    }
  }
];

interface AssistantWizardProps {
  onComplete: (config: any) => void;
}

export function AssistantWizard({ onComplete }: AssistantWizardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedObjective, setSelectedObjective] = useState<ChatbotObjective | null>(null);
  const [chatbotConfig, setChatbotConfig] = useState({
    name: '',
    description: '',
    industry: '',
    targetAudience: '',
    personalityTraits: [],
    customInstructions: ''
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleObjectiveSelect = (objective: ChatbotObjective) => {
    setSelectedObjective(objective);
    setCurrentStep(2);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Mutation to create chatbot
  const createChatbotMutation = useMutation({
    mutationFn: async (chatbotData: any) => {
      return await apiRequest("POST", "/api/chatbots", chatbotData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbots"] });
      toast({
        title: "Chatbot creado exitosamente",
        description: "Tu chatbot inteligente está listo para usar con todas las configuraciones recomendadas.",
      });
      setIsOpen(false);
      onComplete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear chatbot",
        description: error.message || "No se pudo crear el chatbot. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const generateConversationFlow = (objective: ChatbotObjective) => {
    const nodes = [];
    const edges = [];
    
    // Nodo de bienvenida inicial
    nodes.push({
      id: 'welcome',
      type: 'start',
      data: { 
        label: 'Bienvenida',
        message: getWelcomeMessage(objective)
      },
      position: { x: 250, y: 50 }
    });

    // Generar nodos basados en la estructura del objetivo
    objective.recommendations.structure.forEach((step, index) => {
      const nodeId = `step-${index + 1}`;
      nodes.push({
        id: nodeId,
        type: 'message',
        data: {
          label: step,
          message: getStepMessage(objective, step, index),
          options: getStepOptions(objective, step)
        },
        position: { x: 250 + (index % 3) * 300, y: 200 + Math.floor(index / 3) * 150 }
      });

      // Conectar nodos secuencialmente
      if (index === 0) {
        edges.push({
          id: `welcome-${nodeId}`,
          source: 'welcome',
          target: nodeId
        });
      }
      
      if (index < objective.recommendations.structure.length - 1) {
        edges.push({
          id: `${nodeId}-step-${index + 2}`,
          source: nodeId,
          target: `step-${index + 2}`
        });
      }
    });

    // Nodo de cierre con acciones de seguimiento
    const finalNodeId = 'final-action';
    nodes.push({
      id: finalNodeId,
      type: 'action',
      data: {
        label: 'Acción Final',
        message: getFinalMessage(objective),
        actions: objective.recommendations.followUpActions
      },
      position: { x: 250, y: 200 + Math.ceil(objective.recommendations.structure.length / 3) * 150 }
    });

    // Conectar último paso con acción final
    if (objective.recommendations.structure.length > 0) {
      edges.push({
        id: `step-${objective.recommendations.structure.length}-${finalNodeId}`,
        source: `step-${objective.recommendations.structure.length}`,
        target: finalNodeId
      });
    }

    return { nodes, edges };
  };

  const getWelcomeMessage = (objective: ChatbotObjective) => {
    const messages = {
      'sales': `¡Hola! 👋 Soy tu asistente de ventas. Estoy aquí para ayudarte a encontrar la mejor solución para tus necesidades. ¿En qué puedo ayudarte hoy?`,
      'support': `¡Hola! 👋 Soy tu asistente de soporte técnico. Estoy aquí para resolver cualquier problema que tengas. ¿Cuál es tu consulta?`,
      'appointments': `¡Hola! 👋 Soy tu asistente de citas. Te ayudo a programar tu cita de forma rápida y sencilla. ¿Qué tipo de cita necesitas?`,
      'restaurant': `¡Hola! 👋 Bienvenido a nuestro restaurante. Soy tu asistente para pedidos. ¿Te gustaría ver nuestro menú o hacer un pedido?`,
      'information': `¡Hola! 👋 Soy tu asistente de información. Estoy aquí para responder tus preguntas y proporcionarte la información que necesites.`
    };
    return messages[objective.id] || messages['support'];
  };

  const getStepMessage = (objective: ChatbotObjective, step: string, index: number) => {
    const stepMessages = {
      'sales': {
        'Atención - Captar interés inicial': '¡Hola! 👋 Soy tu asistente especializado. He visto que buscas soluciones innovadoras para tu negocio. ¿Te gustaría conocer cómo hemos ayudado a empresas como la tuya a aumentar sus ventas en un 40%? 🎯',
        'Interés - Despertar curiosidad': 'Perfecto! Te envío un breve video que muestra los resultados reales de nuestros clientes. Mientras lo ves, ¿podrías contarme qué desafío específico necesitas resolver? 📹',
        'Deseo - Crear necesidad del producto': 'Basándome en tu situación, tengo una propuesta que se adapta perfectamente a tus necesidades. Te comparto una infografía que explica los beneficios específicos para tu caso. ¿Te interesa conocer más detalles? 📊',
        'Acción - Motivar la compra': 'Como puedes ver, esta solución está diseñada exactamente para empresas como la tuya. Tengo una oferta especial válida hoy que incluye un descuento del 25% y implementación gratuita. ¿Aprovechamos esta oportunidad? 💰',
        'Seguimiento - Cerrar y acompañar': '¡Excelente decisión! Te envío el contrato digital para firma electrónica y los próximos pasos. También te asignaré un especialista dedicado. ¿Cuál es tu horario preferido para la llamada de bienvenida? 📋',
        'Post-venta - Fidelización': 'Bienvenido a nuestra familia de clientes exitosos! Te envío tu kit de bienvenida digital con tutoriales exclusivos y acceso a nuestro grupo VIP. ¿Hay algo específico en lo que te gustaría enfocarte primero? 🌟'
      },
      'support': {
        'Recepción empática del problema': '¡Hola! Lamento que estés experimentando dificultades. Estoy aquí para ayudarte a resolver tu problema de manera rápida y efectiva. Te envío un video tutorial básico mientras me describes qué está pasando. 🎥',
        'Diagnóstico interactivo': 'Entiendo tu situación. Te comparto una guía visual paso a paso que te ayudará a identificar la causa. Por favor, sígueme en estas verificaciones y dime qué encuentras: 📋',
        'Solución personalizada': 'Perfecto! Basándome en tu información, he preparado una solución específica para tu caso. Te envío un video explicativo y documentos de apoyo. ¿Comenzamos con el primer paso? 📹',
        'Verificación y seguimiento': '¡Excelente progreso! Ahora verifiquemos que todo funcione correctamente. Te envío una checklist interactiva para confirmar que el problema está resuelto. ✅',
        'Documentación y prevención': '¡Problema resuelto exitosamente! Te envío un resumen con consejos de prevención y acceso directo a nuestro centro de ayuda para futuras consultas. 📚'
      },
      'appointments': {
        'Bienvenida y consulta inicial': '¡Hola! Estoy aquí para ayudarte a programar tu cita de manera rápida y conveniente. Te envío una breve presentación de nuestros servicios disponibles. ¿Qué tipo de servicio necesitas? 📅',
        'Evaluación de necesidades': 'Perfecto! Para ofrecerte el mejor servicio, te comparto un formulario interactivo que me ayudará a entender tus necesidades específicas y preparar todo para tu visita. 📝',
        'Calendario inteligente': 'Excelente! Te muestro nuestro calendario en tiempo real con todas las opciones disponibles. He marcado los horarios que mejor se adaptan a tu solicitud. ¿Cuál prefieres? 🗓️',
        'Confirmación personalizada': '¡Perfecto! Tu cita está confirmada. Te envío un resumen detallado, instrucciones de llegada y un recordatorio automático. También puedes descargar el evento para tu calendario personal. ✅',
        'Seguimiento proactivo': '¡Todo listo! Recibirás recordatorios automáticos y podrás reprogramar fácilmente si surge algún imprevisto. ¿Hay algo más en lo que pueda ayudarte para tu próxima visita? 🔔'
      }
    };
    
    const objectiveMessages = stepMessages[objective.id] || stepMessages['support'];
    return objectiveMessages[step] || `${step}: Te ayudo con este paso importante del proceso.`;
  };

  const getStepOptions = (objective: ChatbotObjective, step: string) => {
    const baseOptions = ['Sí, continuar', 'Necesito más información', 'Hablar con un agente'];
    
    if (objective.id === 'sales') {
      return ['Ver propuesta', 'Más información', 'Hablar con vendedor'];
    } else if (objective.id === 'support') {
      return ['Problema resuelto', 'Necesito más ayuda', 'Escalar a técnico'];
    } else if (objective.id === 'appointments') {
      return ['Confirmar cita', 'Cambiar horario', 'Más opciones'];
    }
    
    return baseOptions;
  };

  const getFinalMessage = (objective: ChatbotObjective) => {
    const messages = {
      'sales': '¡Perfecto! Has completado el proceso de consulta. Un especialista se pondrá en contacto contigo pronto.',
      'support': '¡Excelente! Tu consulta ha sido resuelta. Si tienes más preguntas, no dudes en contactarnos.',
      'appointments': '¡Listo! Tu cita ha sido confirmada. Recibirás todos los detalles por WhatsApp.',
      'restaurant': '¡Perfecto! Tu pedido está siendo preparado. Te notificaremos cuando esté listo.',
      'information': '¡Espero haberte ayudado! Si necesitas más información, estoy aquí para asistirte.'
    };
    return messages[objective.id] || messages['support'];
  };

  const generatePersonalityConfig = (objective: ChatbotObjective) => {
    return {
      tone: objective.recommendations.tone,
      style: objective.name.includes('Ventas') ? 'persuasivo' : 
             objective.name.includes('Soporte') ? 'servicial' : 
             objective.name.includes('Citas') ? 'organizativo' : 'amigable',
      traits: ['profesional', 'empático', 'eficiente']
    };
  };

  const handleComplete = () => {
    if (!selectedObjective || !chatbotConfig.name) return;

    // Generate complete chatbot configuration based on objective
    const conversationFlow = generateConversationFlow(selectedObjective);
    const personalityConfig = generatePersonalityConfig(selectedObjective);
    
    const chatbotData = {
      name: chatbotConfig.name,
      description: chatbotConfig.description || `Chatbot inteligente para ${selectedObjective.name.toLowerCase()}`,
      type: selectedObjective.id,
      status: 'active',
      flow: conversationFlow, // This will save the complete conversation structure
      settings: {
        objective: selectedObjective.name,
        industry: chatbotConfig.industry,
        targetAudience: chatbotConfig.targetAudience,
        tone: selectedObjective.recommendations.tone,
        personality: personalityConfig,
        features: selectedObjective.features,
        templates: selectedObjective.templates,
        keyMessages: selectedObjective.recommendations.keyMessages,
        followUpActions: selectedObjective.recommendations.followUpActions,
        customInstructions: chatbotConfig.customInstructions,
        aiInstructions: generateAIInstructions()
      }
    };

    createChatbotMutation.mutate(chatbotData);
  };

  const generateAIInstructions = () => {
    if (!selectedObjective) return '';
    
    return `
OBJETIVO PRINCIPAL: ${selectedObjective.name}
TONO DE COMUNICACIÓN: ${selectedObjective.recommendations.tone}

ESTRUCTURA DE CONVERSACIÓN:
${selectedObjective.recommendations.structure.map((step, index) => `${index + 1}. ${step}`).join('\n')}

MENSAJES CLAVE A TRANSMITIR:
${selectedObjective.recommendations.keyMessages.map(msg => `• ${msg}`).join('\n')}

ACCIONES DE SEGUIMIENTO:
${selectedObjective.recommendations.followUpActions.map(action => `• ${action}`).join('\n')}

INDUSTRIA: ${chatbotConfig.industry}
AUDIENCIA OBJETIVO: ${chatbotConfig.targetAudience}

INSTRUCCIONES PERSONALIZADAS:
${chatbotConfig.customInstructions}

Siempre mantén el objetivo principal en mente y adapta cada respuesta para maximizar las probabilidades de alcanzarlo.
    `.trim();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Bot className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">¿Cuál es tu objetivo principal?</h3>
              <p className="text-gray-600">Selecciona el propósito principal de tu chatbot para recibir recomendaciones personalizadas</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objectives.map((objective) => (
                <Card 
                  key={objective.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedObjective?.id === objective.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleObjectiveSelect(objective)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      {objective.icon}
                      <h4 className="font-semibold">{objective.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{objective.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {objective.industry.slice(0, 2).map((industry, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {industry}
                        </Badge>
                      ))}
                      {objective.industry.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{objective.industry.length - 2} más
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
              <h3 className="text-xl font-semibold mb-2">Configuración Básica</h3>
              <p className="text-gray-600">Proporciona información básica sobre tu chatbot</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Chatbot</Label>
                <Input
                  id="name"
                  placeholder="Ej: Asistente de Ventas Maria"
                  value={chatbotConfig.name}
                  onChange={(e) => setChatbotConfig({...chatbotConfig, name: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe brevemente qué hace tu chatbot"
                  value={chatbotConfig.description}
                  onChange={(e) => setChatbotConfig({...chatbotConfig, description: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="industry">Industria</Label>
                <Input
                  id="industry"
                  placeholder="Ej: E-commerce, Restaurante, Consultoría"
                  value={chatbotConfig.industry}
                  onChange={(e) => setChatbotConfig({...chatbotConfig, industry: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="audience">Audiencia Objetivo</Label>
                <Input
                  id="audience"
                  placeholder="Ej: Jóvenes profesionales, Familias, Empresarios"
                  value={chatbotConfig.targetAudience}
                  onChange={(e) => setChatbotConfig({...chatbotConfig, targetAudience: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Zap className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h3 className="text-xl font-semibold mb-2">Recomendaciones de IA</h3>
              <p className="text-gray-600">Basado en tu objetivo: {selectedObjective?.name}</p>
            </div>

            {selectedObjective && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tono Recomendado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedObjective.recommendations.tone}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estructura de Conversación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-1">
                      {selectedObjective.recommendations.structure.map((step, index) => (
                        <li key={index} className="text-gray-700">{step}</li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mensajes Clave</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedObjective.recommendations.keyMessages.map((message, index) => (
                        <li key={index} className="text-gray-700">{message}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="custom">Instrucciones Adicionales (Opcional)</Label>
                  <Textarea
                    id="custom"
                    placeholder="Agrega instrucciones específicas para tu chatbot..."
                    value={chatbotConfig.customInstructions}
                    onChange={(e) => setChatbotConfig({...chatbotConfig, customInstructions: e.target.value})}
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-2">¡Configuración Completa!</h3>
              <p className="text-gray-600">Tu chatbot está listo para ser creado</p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Configuración</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <strong>Nombre:</strong> {chatbotConfig.name}
                  </div>
                  <div>
                    <strong>Objetivo:</strong> {selectedObjective?.name}
                  </div>
                  <div>
                    <strong>Industria:</strong> {chatbotConfig.industry}
                  </div>
                  <div>
                    <strong>Audiencia:</strong> {chatbotConfig.targetAudience}
                  </div>
                  {selectedObjective && (
                    <div>
                      <strong>Features incluidas:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedObjective.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Bot className="w-5 h-5 mr-2" />
          Asistente IA para Chatbots
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="w-6 h-6" />
            <span>Asistente Virtual para Configuración</span>
          </DialogTitle>
          <DialogDescription>
            Te guío paso a paso para crear el chatbot perfecto según tus objetivos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Paso {currentStep} de {totalSteps}</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={currentStep === 1 && !selectedObjective}
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Crear Chatbot
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}