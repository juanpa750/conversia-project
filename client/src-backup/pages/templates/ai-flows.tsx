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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Settings,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Copy
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
  usageCount: number;
  rating: number;
  icon: React.ReactNode;
  flow: {
    trigger: string;
    steps: Array<{
      type: 'message' | 'condition' | 'action' | 'ai_response';
      content: string;
      conditions?: string[];
    }>;
  };
}

interface CustomFlow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggers: string[];
  steps: number;
  lastModified: string;
  performance: {
    completionRate: number;
    avgResponseTime: number;
    userSatisfaction: number;
  };
}

const aiTemplates: AITemplate[] = [
  {
    id: '1',
    name: 'Asistente de Ventas E-commerce',
    description: 'Automatiza el proceso de ventas con recomendaciones inteligentes y seguimiento de carritos abandonados',
    category: 'Ventas',
    industry: 'E-commerce',
    complexity: 'advanced',
    estimatedSetupTime: 15,
    features: ['Recomendaciones IA', 'Carrito abandonado', 'Upselling', 'Cross-selling'],
    usageCount: 1247,
    rating: 4.8,
    icon: <ShoppingCart className="w-6 h-6" />,
    flow: {
      trigger: 'Usuario dice "productos" o "comprar"',
      steps: [
        { type: 'ai_response', content: 'Analizar historial y preferencias del usuario' },
        { type: 'message', content: '¡Hola! Te ayudo a encontrar el producto perfecto' },
        { type: 'condition', content: '¿Qué tipo de producto buscas?', conditions: ['Ropa', 'Electrónicos', 'Hogar'] },
        { type: 'ai_response', content: 'Mostrar productos personalizados según selección' }
      ]
    }
  },
  {
    id: '2',
    name: 'Soporte Técnico Inteligente',
    description: 'Resuelve problemas técnicos comunes con diagnósticos automáticos y escalado inteligente',
    category: 'Soporte',
    industry: 'Tecnología',
    complexity: 'intermediate',
    estimatedSetupTime: 10,
    features: ['Diagnóstico automático', 'Base de conocimiento', 'Escalado inteligente'],
    usageCount: 892,
    rating: 4.6,
    icon: <Settings className="w-6 h-6" />,
    flow: {
      trigger: 'Usuario reporta problema técnico',
      steps: [
        { type: 'message', content: 'Entiendo que tienes un problema técnico. Te ayudo a resolverlo' },
        { type: 'condition', content: '¿Qué tipo de problema tienes?', conditions: ['No funciona', 'Error', 'Lento'] },
        { type: 'ai_response', content: 'Ejecutar diagnóstico automático según el problema' },
        { type: 'action', content: 'Si no se resuelve, escalar a técnico humano' }
      ]
    }
  },
  {
    id: '3',
    name: 'Reservas de Restaurante',
    description: 'Gestiona reservas, consulta disponibilidad y sugiere platos especiales del día',
    category: 'Servicios',
    industry: 'Restauración',
    complexity: 'basic',
    estimatedSetupTime: 8,
    features: ['Gestión de reservas', 'Menu dinámico', 'Ofertas especiales'],
    usageCount: 654,
    rating: 4.7,
    icon: <Coffee className="w-6 h-6" />,
    flow: {
      trigger: 'Usuario quiere hacer reserva',
      steps: [
        { type: 'message', content: '¡Bienvenido! Te ayudo con tu reserva' },
        { type: 'condition', content: '¿Para cuántas personas?', conditions: ['1-2', '3-4', '5+'] },
        { type: 'ai_response', content: 'Verificar disponibilidad y sugerir horarios' },
        { type: 'action', content: 'Confirmar reserva y enviar recordatorio' }
      ]
    }
  },
  {
    id: '4',
    name: 'Consultor de Seguros',
    description: 'Evalúa necesidades de seguros y proporciona cotizaciones personalizadas',
    category: 'Consultoría',
    industry: 'Seguros',
    complexity: 'advanced',
    estimatedSetupTime: 20,
    features: ['Evaluación de riesgos', 'Cotizaciones', 'Comparativas', 'Documentación'],
    usageCount: 423,
    rating: 4.5,
    icon: <Briefcase className="w-6 h-6" />,
    flow: {
      trigger: 'Usuario consulta sobre seguros',
      steps: [
        { type: 'message', content: 'Te ayudo a encontrar el seguro perfecto para ti' },
        { type: 'condition', content: '¿Qué tipo de seguro necesitas?', conditions: ['Auto', 'Hogar', 'Vida', 'Salud'] },
        { type: 'ai_response', content: 'Hacer preguntas específicas según tipo de seguro' },
        { type: 'ai_response', content: 'Calcular cotización personalizada' }
      ]
    }
  }
];

const customFlows: CustomFlow[] = [
  {
    id: 'custom-1',
    name: 'Flujo de Bienvenida Personalizado',
    description: 'Saludo inicial adaptado al horario y perfil del cliente',
    isActive: true,
    triggers: ['hola', 'inicio', 'empezar'],
    steps: 5,
    lastModified: '2024-01-15',
    performance: {
      completionRate: 89,
      avgResponseTime: 1.2,
      userSatisfaction: 4.3
    }
  },
  {
    id: 'custom-2',
    name: 'Proceso de Devoluciones',
    description: 'Automatiza el proceso de devoluciones y reembolsos',
    isActive: true,
    triggers: ['devolver', 'reembolso', 'problema'],
    steps: 8,
    lastModified: '2024-01-14',
    performance: {
      completionRate: 76,
      avgResponseTime: 2.1,
      userSatisfaction: 4.1
    }
  },
  {
    id: 'custom-3',
    name: 'Seguimiento Post-venta',
    description: 'Contacto automático después de una compra para feedback',
    isActive: false,
    triggers: ['compra_completada'],
    steps: 4,
    lastModified: '2024-01-10',
    performance: {
      completionRate: 92,
      avgResponseTime: 0.8,
      userSatisfaction: 4.6
    }
  }
];

export default function AIFlowsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('templates');

  // Fetch templates
  const { data: templates = aiTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/ai-templates'],
    queryFn: () => Promise.resolve(aiTemplates)
  });

  // Fetch custom flows
  const { data: flows = customFlows, isLoading: flowsLoading } = useQuery({
    queryKey: ['/api/custom-flows'],
    queryFn: () => Promise.resolve(customFlows)
  });

  // Activate template mutation
  const activateTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { templateId };
    },
    onSuccess: () => {
      toast({
        title: "Template activado",
        description: "El flujo de IA se ha configurado exitosamente en tu chatbot.",
      });
    }
  });

  // Toggle flow status mutation
  const toggleFlowStatus = useMutation({
    mutationFn: async ({ flowId, isActive }: { flowId: string, isActive: boolean }) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { flowId, isActive };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-flows'] });
      toast({
        title: "Estado actualizado",
        description: "El flujo se ha activado/desactivado correctamente.",
      });
    }
  });

  // Create new flow mutation
  const createFlow = useMutation({
    mutationFn: async (flowData: any) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { id: Date.now().toString(), ...flowData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-flows'] });
      toast({
        title: "Flujo creado",
        description: "Tu nuevo flujo de IA se ha creado exitosamente.",
      });
    }
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

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity;
    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flujos de IA</h1>
          <p className="text-gray-600">Templates inteligentes y flujos personalizados para tu chatbot</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Flujos
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Crear Flujo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Templates Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Flujos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{flows.filter(f => f.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa Completación</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(flows.reduce((sum, f) => sum + f.performance.completionRate, 0) / flows.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Satisfacción</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(flows.reduce((sum, f) => sum + f.performance.userSatisfaction, 0) / flows.length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates de IA</TabsTrigger>
          <TabsTrigger value="custom">Flujos Personalizados</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={selectedComplexity}
              onChange={(e) => setSelectedComplexity(e.target.value)}
            >
              <option value="all">Todas las complejidades</option>
              <option value="basic">Básico</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templatesLoading ? (
              <div className="col-span-2 text-center py-8">Cargando templates...</div>
            ) : (
              filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {template.icon}
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>{template.industry}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getComplexityColor(template.complexity)}>
                        {getComplexityLabel(template.complexity)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{template.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Tiempo setup:</span>
                        <span className="ml-1 font-medium">{template.estimatedSetupTime} min</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Usos:</span>
                        <span className="ml-1 font-medium">{template.usageCount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Rating:</span>
                        <span className="ml-1 font-medium">⭐ {template.rating}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Categoría:</span>
                        <span className="ml-1 font-medium">{template.category}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Características:</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Flujo:</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div><strong>Trigger:</strong> {template.flow.trigger}</div>
                        {template.flow.steps.slice(0, 2).map((step, index) => (
                          <div key={index}>• {step.content}</div>
                        ))}
                        {template.flow.steps.length > 2 && (
                          <div className="text-gray-400">... y {template.flow.steps.length - 2} pasos más</div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => activateTemplate.mutate(template.id)}
                        disabled={activateTemplate.isPending}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {activateTemplate.isPending ? 'Activando...' : 'Activar'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {flowsLoading ? (
              <div className="text-center py-8">Cargando flujos personalizados...</div>
            ) : (
              flows.map((flow) => (
                <Card key={flow.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h3 className="text-lg font-semibold">{flow.name}</h3>
                            <p className="text-gray-600">{flow.description}</p>
                          </div>
                          <Badge variant={flow.isActive ? 'default' : 'secondary'}>
                            {flow.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Triggers:</span>
                            <span className="ml-1 font-medium">{flow.triggers.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Pasos:</span>
                            <span className="ml-1 font-medium">{flow.steps}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Completación:</span>
                            <span className="ml-1 font-medium">{flow.performance.completionRate}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Modificado:</span>
                            <span className="ml-1 font-medium">{flow.lastModified}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Tiempo respuesta</div>
                              <div className="font-medium">{flow.performance.avgResponseTime}s</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Satisfacción</div>
                              <div className="font-medium">⭐ {flow.performance.userSatisfaction}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Completación</div>
                              <Progress value={flow.performance.completionRate} className="h-2 mt-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleFlowStatus.mutate({ 
                            flowId: flow.id, 
                            isActive: !flow.isActive 
                          })}
                          disabled={toggleFlowStatus.isPending}
                        >
                          {flow.isActive ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.slice(1).map((category) => {
                    const categoryTemplates = templates.filter(t => t.category === category);
                    const avgRating = categoryTemplates.reduce((sum, t) => sum + t.rating, 0) / categoryTemplates.length;
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span>{category}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{categoryTemplates.length} templates</span>
                          <span className="font-medium">⭐ {avgRating.toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Templates Más Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates
                    .sort((a, b) => b.usageCount - a.usageCount)
                    .slice(0, 5)
                    .map((template) => (
                      <div key={template.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {template.icon}
                          <span className="text-sm">{template.name}</span>
                        </div>
                        <span className="font-medium">{template.usageCount.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}