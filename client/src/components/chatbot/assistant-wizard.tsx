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
        'Saludo personalizado',
        'Identificar necesidades',
        'Presentar soluciones',
        'Manejar objeciones',
        'Cerrar venta'
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
    return objective.recommendations.structure.map((step, index) => ({
      id: `step-${index + 1}`,
      name: step,
      type: 'message',
      content: `Paso ${index + 1}: ${step}`,
      nextSteps: index < objective.recommendations.structure.length - 1 ? [`step-${index + 2}`] : []
    }));
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
      settings: {
        objective: selectedObjective.name,
        industry: chatbotConfig.industry,
        targetAudience: chatbotConfig.targetAudience,
        tone: selectedObjective.recommendations.tone,
        personality: personalityConfig,
        conversationFlow: conversationFlow,
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