import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  MessageSquare, 
  ShoppingCart, 
  Heart,
  Phone,
  Calendar,
  Gift,
  Briefcase,
  GraduationCap,
  Home,
  Car,
  Plane,
  Coffee,
  Shirt,
  Zap,
  Users,
  Target,
  Clock,
  ArrowRight,
  Play,
  Settings
} from 'lucide-react';

interface AITemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  estimatedSetupTime: number;
  features: string[];
  aiFlow: AIFlowStep[];
  icon: React.ReactNode;
  color: string;
  tags: string[];
  usageCount: number;
  rating: number;
  conversionRate: number;
}

interface AIFlowStep {
  id: string;
  type: 'welcome' | 'ai_analysis' | 'question' | 'condition' | 'action' | 'ai_response' | 'human_handoff';
  title: string;
  content: string;
  aiPrompt?: string;
  conditions?: Array<{
    field: string;
    operator: string;
    value: string;
    nextStep: string;
  }>;
  nextStep?: string;
  aiContext?: string;
  learningPoints?: string[];
}

const aiTemplates: AITemplate[] = [
  {
    id: 'ecommerce-ai-sales',
    name: 'Ventas E-commerce con IA',
    description: 'Bot inteligente que analiza comportamiento del cliente y recomienda productos personalizados',
    category: 'Ventas',
    industry: 'E-commerce',
    complexity: 'advanced',
    estimatedSetupTime: 45,
    features: ['Análisis de preferencias con IA', 'Recomendaciones personalizadas', 'Procesamiento de órdenes', 'Seguimiento post-venta'],
    conversionRate: 34,
    aiFlow: [
      {
        id: 'welcome',
        type: 'welcome',
        title: 'Bienvenida Personalizada',
        content: '¡Hola! Soy tu asistente de compras inteligente. Te ayudaré a encontrar exactamente lo que necesitas.',
        aiContext: 'Analizar historial de navegación y comportamiento previo',
        nextStep: 'analyze_preferences'
      },
      {
        id: 'analyze_preferences',
        type: 'ai_analysis',
        title: 'Análisis de Preferencias',
        content: 'Analizando tus preferencias...',
        aiPrompt: 'Analiza el historial de navegación, productos vistos, búsquedas previas y comportamiento del usuario para identificar preferencias y necesidades específicas.',
        learningPoints: ['Categorías de interés', 'Rango de precios', 'Marcas preferidas', 'Estilo personal'],
        nextStep: 'personalized_greeting'
      },
      {
        id: 'personalized_greeting',
        type: 'ai_response',
        title: 'Saludo Personalizado',
        content: 'Veo que te interesan [categoría detectada]. Tenemos nuevos productos que podrían gustarte.',
        aiPrompt: 'Genera un saludo personalizado basado en las preferencias detectadas, mencionando productos específicos relevantes.',
        nextStep: 'product_recommendation'
      },
      {
        id: 'product_recommendation',
        type: 'ai_response',
        title: 'Recomendación Inteligente',
        content: 'Te recomiendo estos productos basándome en tu perfil:',
        aiPrompt: 'Selecciona y presenta 3-4 productos específicos que mejor coincidan con el perfil del usuario, explicando por qué son perfectos para él.',
        nextStep: 'interest_check'
      },
      {
        id: 'interest_check',
        type: 'question',
        title: 'Verificación de Interés',
        content: '¿Alguno de estos productos te interesa? ¿O buscas algo específico?',
        conditions: [
          { field: 'response', operator: 'contains', value: 'sí|me gusta|interesa', nextStep: 'product_details' },
          { field: 'response', operator: 'contains', value: 'no|otro|diferente', nextStep: 'alternative_search' },
          { field: 'response', operator: 'contains', value: 'precio|costo|barato', nextStep: 'price_discussion' }
        ],
        nextStep: 'clarify_needs'
      },
      {
        id: 'product_details',
        type: 'ai_response',
        title: 'Detalles del Producto',
        content: 'Perfecto, te doy más detalles sobre este producto:',
        aiPrompt: 'Proporciona información detallada y persuasiva sobre el producto elegido, incluyendo beneficios específicos para el usuario.',
        nextStep: 'purchase_intent'
      },
      {
        id: 'purchase_intent',
        type: 'question',
        title: 'Intención de Compra',
        content: '¿Te gustaría agregarlo al carrito o necesitas más información?',
        conditions: [
          { field: 'response', operator: 'contains', value: 'carrito|comprar|agregar', nextStep: 'process_order' },
          { field: 'response', operator: 'contains', value: 'información|dudas|preguntas', nextStep: 'provide_info' },
          { field: 'response', operator: 'contains', value: 'pensar|después|tiempo', nextStep: 'follow_up_sequence' }
        ],
        nextStep: 'human_handoff'
      },
      {
        id: 'process_order',
        type: 'action',
        title: 'Procesamiento de Orden',
        content: 'Excelente! Te ayudo a completar tu compra.',
        nextStep: 'order_confirmation'
      }
    ],
    icon: <ShoppingCart className="w-6 h-6" />,
    color: 'bg-blue-500',
    tags: ['IA', 'E-commerce', 'Personalización', 'Ventas'],
    usageCount: 1247,
    rating: 4.8
  },
  {
    id: 'restaurant-ai-orders',
    name: 'Restaurante IA - Pedidos',
    description: 'Sistema inteligente para tomar pedidos, sugerir platos y gestionar reservas con análisis de preferencias',
    category: 'Restaurantes',
    industry: 'Gastronomía',
    complexity: 'intermediate',
    estimatedSetupTime: 30,
    features: ['Recomendaciones de menú con IA', 'Gestión de pedidos', 'Sistema de reservas', 'Alertas de alergias'],
    conversionRate: 42,
    aiFlow: [
      {
        id: 'restaurant_welcome',
        type: 'welcome',
        title: 'Bienvenida al Restaurante',
        content: '¡Bienvenido a [Nombre Restaurante]! Soy tu asistente gastronómico. ¿En qué puedo ayudarte hoy?',
        nextStep: 'service_type'
      },
      {
        id: 'service_type',
        type: 'question',
        title: 'Tipo de Servicio',
        content: '¿Qué necesitas hoy?\n1. Hacer un pedido\n2. Reservar mesa\n3. Ver menú\n4. Información del restaurante',
        conditions: [
          { field: 'response', operator: 'contains', value: '1|pedido|ordenar', nextStep: 'order_preference_analysis' },
          { field: 'response', operator: 'contains', value: '2|reserva|mesa', nextStep: 'reservation_process' },
          { field: 'response', operator: 'contains', value: '3|menú|carta', nextStep: 'menu_display' },
          { field: 'response', operator: 'contains', value: '4|información|horarios', nextStep: 'restaurant_info' }
        ],
        nextStep: 'clarify_service'
      },
      {
        id: 'order_preference_analysis',
        type: 'ai_analysis',
        title: 'Análisis de Preferencias Gastronómicas',
        content: 'Perfecto! Déjame conocerte mejor para sugerirte los mejores platos.',
        aiPrompt: 'Analiza el historial de pedidos, preferencias dietéticas mencionadas, y hora del día para personalizar recomendaciones de menú.',
        learningPoints: ['Preferencias dietéticas', 'Platos favoritos', 'Restricciones alimentarias', 'Presupuesto aproximado'],
        nextStep: 'dietary_questions'
      },
      {
        id: 'dietary_questions',
        type: 'question',
        title: 'Preferencias Dietéticas',
        content: '¿Tienes alguna preferencia dietética o alergias que deba considerar? (vegetariano, vegano, sin gluten, etc.)',
        nextStep: 'ai_menu_recommendations'
      },
      {
        id: 'ai_menu_recommendations',
        type: 'ai_response',
        title: 'Recomendaciones Personalizadas',
        content: 'Basándome en tus preferencias, te recomiendo estos platos especiales:',
        aiPrompt: 'Genera recomendaciones específicas del menú considerando preferencias dietéticas, hora del día, historial y platos populares. Incluye precios y descripciones atractivas.',
        nextStep: 'order_selection'
      },
      {
        id: 'order_selection',
        type: 'question',
        title: 'Selección de Platos',
        content: '¿Qué te gustaría ordenar? Puedes elegir de mis recomendaciones o pedir algo específico del menú.',
        conditions: [
          { field: 'response', operator: 'contains', value: 'recomendación|sugerencia', nextStep: 'process_recommended_order' },
          { field: 'response', operator: 'contains', value: 'otro|diferente|menú', nextStep: 'custom_order' },
          { field: 'response', operator: 'contains', value: 'precio|costo|oferta', nextStep: 'budget_options' }
        ],
        nextStep: 'order_details'
      },
      {
        id: 'process_recommended_order',
        type: 'ai_response',
        title: 'Confirmación de Pedido',
        content: '¡Excelente elección! Confirmo tu pedido:',
        aiPrompt: 'Confirma el pedido seleccionado, calcula tiempo de preparación estimado, costo total y opciones de entrega.',
        nextStep: 'delivery_options'
      }
    ],
    icon: <Coffee className="w-6 h-6" />,
    color: 'bg-orange-500',
    tags: ['IA', 'Restaurantes', 'Pedidos', 'Recomendaciones'],
    usageCount: 856,
    rating: 4.6
  },
  {
    id: 'healthcare-ai-appointment',
    name: 'Salud IA - Citas Médicas',
    description: 'Asistente médico inteligente para agendar citas, triaje inicial y seguimiento de pacientes',
    category: 'Salud',
    industry: 'Medicina',
    complexity: 'advanced',
    estimatedSetupTime: 60,
    features: ['Triaje inteligente', 'Agendamiento automático', 'Recordatorios', 'Seguimiento post-consulta'],
    conversionRate: 67,
    aiFlow: [
      {
        id: 'medical_welcome',
        type: 'welcome',
        title: 'Bienvenida Médica',
        content: 'Hola, soy el asistente virtual de [Clínica]. Estoy aquí para ayudarte con tus necesidades médicas de manera segura y confidencial.',
        aiContext: 'Mantener tono profesional y empático, priorizar privacidad médica',
        nextStep: 'patient_identification'
      },
      {
        id: 'patient_identification',
        type: 'question',
        title: 'Identificación del Paciente',
        content: '¿Eres paciente nuevo o ya tienes historial con nosotros? Por favor, proporciona tu nombre completo.',
        conditions: [
          { field: 'patient_type', operator: 'equals', value: 'existing', nextStep: 'returning_patient_flow' },
          { field: 'patient_type', operator: 'equals', value: 'new', nextStep: 'new_patient_registration' }
        ],
        nextStep: 'verify_patient_status'
      },
      {
        id: 'medical_concern_analysis',
        type: 'ai_analysis',
        title: 'Análisis de Motivo de Consulta',
        content: 'Entiendo tu preocupación. Déjame analizar la mejor manera de ayudarte.',
        aiPrompt: 'Analiza los síntomas o motivos de consulta mencionados para determinar urgencia, especialidad médica requerida y tipo de cita apropiada. IMPORTANTE: No proporcionar diagnósticos médicos.',
        learningPoints: ['Nivel de urgencia', 'Especialidad requerida', 'Tipo de consulta', 'Disponibilidad necesaria'],
        nextStep: 'urgency_assessment'
      },
      {
        id: 'urgency_assessment',
        type: 'ai_response',
        title: 'Evaluación de Urgencia',
        content: 'Basándome en lo que me cuentas, te recomiendo:',
        aiPrompt: 'Evalúa la urgencia del caso y recomienda el tipo de atención apropiada (urgencia, cita regular, telemedicina). Ser claro sobre cuándo buscar atención inmediata.',
        conditions: [
          { field: 'urgency_level', operator: 'equals', value: 'emergency', nextStep: 'emergency_protocol' },
          { field: 'urgency_level', operator: 'equals', value: 'urgent', nextStep: 'urgent_appointment' },
          { field: 'urgency_level', operator: 'equals', value: 'routine', nextStep: 'schedule_routine_appointment' }
        ],
        nextStep: 'appointment_scheduling'
      },
      {
        id: 'schedule_routine_appointment',
        type: 'ai_response',
        title: 'Programación de Cita',
        content: 'Te ayudo a agendar una cita con el especialista apropiado.',
        aiPrompt: 'Identifica la especialidad médica más apropiada y presenta opciones de horarios disponibles considerando la preferencia del paciente.',
        nextStep: 'appointment_confirmation'
      },
      {
        id: 'pre_appointment_instructions',
        type: 'ai_response',
        title: 'Instrucciones Pre-Consulta',
        content: 'Para tu cita, es importante que:',
        aiPrompt: 'Proporciona instrucciones específicas de preparación para la consulta según el tipo de cita agendada (ayuno, documentos, medicamentos, etc.).',
        nextStep: 'appointment_reminder_setup'
      }
    ],
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-red-500',
    tags: ['IA', 'Salud', 'Citas', 'Triaje'],
    usageCount: 643,
    rating: 4.9
  },
  {
    id: 'real-estate-ai-advisor',
    name: 'Inmobiliaria IA - Asesor',
    description: 'Asesor inmobiliario inteligente que analiza necesidades, presupuesto y recomienda propiedades ideales',
    category: 'Inmobiliaria',
    industry: 'Bienes Raíces',
    complexity: 'advanced',
    estimatedSetupTime: 50,
    features: ['Análisis de necesidades', 'Búsqueda inteligente', 'Cálculo de financiamiento', 'Tours virtuales'],
    conversionRate: 28,
    aiFlow: [
      {
        id: 'real_estate_welcome',
        type: 'welcome',
        title: 'Bienvenida Inmobiliaria',
        content: '¡Hola! Soy tu asesor inmobiliario inteligente. Te ayudaré a encontrar la propiedad perfecta para ti.',
        nextStep: 'needs_assessment'
      },
      {
        id: 'needs_assessment',
        type: 'ai_analysis',
        title: 'Análisis de Necesidades',
        content: 'Vamos a conocer exactamente qué buscas en tu próxima propiedad.',
        aiPrompt: 'Analiza las necesidades específicas del cliente: tipo de propiedad, ubicación preferida, presupuesto, tamaño familiar, estilo de vida, y prioridades.',
        learningPoints: ['Tipo de propiedad', 'Presupuesto disponible', 'Zona preferida', 'Características indispensables'],
        nextStep: 'budget_analysis'
      },
      {
        id: 'budget_analysis',
        type: 'question',
        title: 'Análisis de Presupuesto',
        content: 'Para encontrar las mejores opciones, ¿cuál es tu rango de presupuesto aproximado? ¿Será compra de contado o necesitas financiamiento?',
        nextStep: 'financing_consultation'
      },
      {
        id: 'financing_consultation',
        type: 'ai_response',
        title: 'Consultoría Financiera',
        content: 'Te ayudo a entender tus opciones de financiamiento:',
        aiPrompt: 'Calcula opciones de financiamiento, mensualidades aproximadas, enganche requerido y proporciona consejos financieros personalizados.',
        nextStep: 'property_matching'
      },
      {
        id: 'property_matching',
        type: 'ai_response',
        title: 'Búsqueda Inteligente',
        content: 'Encontré estas propiedades que se ajustan perfectamente a lo que buscas:',
        aiPrompt: 'Selecciona y presenta 3-5 propiedades que mejor coincidan con todos los criterios mencionados. Incluye fotos, características destacadas y razones por las que son ideales.',
        nextStep: 'property_interest'
      },
      {
        id: 'property_interest',
        type: 'question',
        title: 'Interés en Propiedades',
        content: '¿Alguna de estas propiedades te llama la atención? ¿Te gustaría ver más detalles o agendar una visita?',
        conditions: [
          { field: 'response', operator: 'contains', value: 'visita|ver|conocer', nextStep: 'schedule_viewing' },
          { field: 'response', operator: 'contains', value: 'detalles|información|características', nextStep: 'property_details' },
          { field: 'response', operator: 'contains', value: 'otras|diferentes|más opciones', nextStep: 'refine_search' }
        ],
        nextStep: 'follow_up_sequence'
      },
      {
        id: 'schedule_viewing',
        type: 'ai_response',
        title: 'Programar Visita',
        content: 'Perfecto! Te ayudo a programar una visita a la propiedad.',
        aiPrompt: 'Coordina horarios disponibles para visitas, prepara información adicional sobre la propiedad y el proceso de compra.',
        nextStep: 'viewing_confirmation'
      }
    ],
    icon: <Home className="w-6 h-6" />,
    color: 'bg-green-500',
    tags: ['IA', 'Inmobiliaria', 'Asesoría', 'Financiamiento'],
    usageCount: 432,
    rating: 4.7
  }
];

export default function AIFlowsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, navigate] = useLocation();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');

  const createChatbotMutation = useMutation({
    mutationFn: async (template: AITemplate) => {
      return apiRequest('POST', '/api/chatbots', {
        name: `${template.name} - Copia`,
        description: template.description,
        type: template.category.toLowerCase(),
        flow: template.aiFlow,
        aiEnabled: true,
        status: 'draft'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
      toast({
        title: "Template aplicado",
        description: "El chatbot con IA se ha creado correctamente. Ahora puedes personalizarlo.",
      });
      navigate(`/chatbots/builder?id=${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el chatbot con este template.",
        variant: "destructive",
      });
    }
  });

  const filteredTemplates = aiTemplates.filter(template => {
    if (selectedCategory !== 'all' && template.category.toLowerCase() !== selectedCategory) return false;
    if (selectedComplexity !== 'all' && template.complexity !== selectedComplexity) return false;
    return true;
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'Básico';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return complexity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates con IA Avanzada</h1>
          <p className="text-gray-600">Flujos inteligentes optimizados por IA para cada industria</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div>
              <label className="text-sm font-medium">Categoría</label>
              <select
                className="w-full p-2 border rounded-md mt-1"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                <option value="ventas">Ventas</option>
                <option value="restaurantes">Restaurantes</option>
                <option value="salud">Salud</option>
                <option value="inmobiliaria">Inmobiliaria</option>
                <option value="educación">Educación</option>
                <option value="turismo">Turismo</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Complejidad</label>
              <select
                className="w-full p-2 border rounded-md mt-1"
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
              >
                <option value="all">Todas las complejidades</option>
                <option value="basic">Básico</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${template.color} text-white`}>
                  {template.icon}
                </div>
                <div className="flex space-x-1">
                  <Badge className={getComplexityColor(template.complexity)}>
                    {getComplexityLabel(template.complexity)}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-800">
                    IA
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="font-bold text-green-600">{template.conversionRate}%</p>
                  <p className="text-gray-600">Conversión</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="font-bold text-blue-600">{template.estimatedSetupTime}min</p>
                  <p className="text-gray-600">Configuración</p>
                </div>
              </div>

              {/* AI Features */}
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-purple-600" />
                  Funciones IA
                </h4>
                <div className="space-y-1">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <Zap className="w-3 h-3 mr-2 text-purple-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Flow Preview */}
              <div>
                <h4 className="font-medium mb-2">Flujo IA ({template.aiFlow.length} pasos)</h4>
                <div className="flex items-center space-x-1 overflow-x-auto">
                  {template.aiFlow.slice(0, 4).map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-1">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-purple-600">{index + 1}</span>
                      </div>
                      {index < 3 && index < template.aiFlow.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  ))}
                  {template.aiFlow.length > 4 && (
                    <span className="text-xs text-gray-500">+{template.aiFlow.length - 4}</span>
                  )}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {template.usageCount.toLocaleString()} usos
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1">{template.rating}</span>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full"
                onClick={() => createChatbotMutation.mutate(template)}
                disabled={createChatbotMutation.isPending}
              >
                <Play className="w-4 h-4 mr-2" />
                Usar Template IA
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron templates</h3>
            <p className="text-gray-600">Ajusta los filtros para ver más opciones de templates con IA.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}