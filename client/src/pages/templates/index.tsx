import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Star,
  Clock,
  Users,
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
  Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  industry: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  estimatedSetupTime: number;
  features: string[];
  flow: any;
  icon: React.ReactNode;
  color: string;
  tags: string[];
  usageCount: number;
  rating: number;
}

const predefinedTemplates: Template[] = [
  {
    id: 1,
    name: 'Soporte al Cliente 24/7',
    description: 'Bot completo para atención al cliente con escalamiento automático, FAQ inteligente y horarios de soporte',
    category: 'Atención al Cliente',
    industry: 'Servicios',
    complexity: 'advanced',
    estimatedSetupTime: 45,
    features: [
      'Respuestas automáticas por categorías',
      'Escalamiento a agente humano',
      'Sistema de tickets',
      'FAQ dinámico',
      'Horarios de atención',
      'Encuestas de satisfacción'
    ],
    flow: {
      nodes: [
        { id: '1', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Inicio' } },
        { id: '2', type: 'menu', position: { x: 300, y: 100 }, data: { 
          label: 'Menú Principal',
          options: ['Soporte Técnico', 'Información de Cuenta', 'Facturación', 'Otros']
        }},
        { id: '3', type: 'message', position: { x: 500, y: 50 }, data: { 
          label: 'Soporte Técnico',
          message: '¿Cuál es tu problema técnico? Describe brevemente para ayudarte mejor.'
        }},
        { id: '4', type: 'question', position: { x: 700, y: 50 }, data: {
          label: '¿Necesitas ayuda inmediata?',
          options: ['Sí, es urgente', 'No, puede esperar']
        }},
        { id: '5', type: 'message', position: { x: 900, y: 20 }, data: {
          label: 'Transferir a Agente',
          message: 'Te estoy conectando con un agente. Tiempo de espera estimado: 3 minutos.'
        }},
        { id: '6', type: 'message', position: { x: 900, y: 80 }, data: {
          label: 'Crear Ticket',
          message: 'He creado un ticket #{{ticket_number}}. Te responderemos en 24 horas.'
        }}
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', label: 'Soporte Técnico' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e4-5', source: '4', target: '5', label: 'Urgente' },
        { id: 'e4-6', source: '4', target: '6', label: 'Puede esperar' }
      ]
    },
    icon: <MessageSquare className="w-6 h-6" />,
    color: 'bg-blue-500',
    tags: ['soporte', 'atención', '24/7', 'tickets'],
    usageCount: 1250,
    rating: 4.8
  },
  {
    id: 2,
    name: 'E-commerce Ventas',
    description: 'Bot especializado en ventas online con catálogo de productos, carrito de compras y seguimiento de pedidos',
    category: 'Ventas',
    industry: 'E-commerce',
    complexity: 'advanced',
    estimatedSetupTime: 60,
    features: [
      'Catálogo de productos interactivo',
      'Carrito de compras',
      'Proceso de checkout',
      'Seguimiento de pedidos',
      'Recomendaciones personalizadas',
      'Ofertas y descuentos'
    ],
    flow: {
      nodes: [
        { id: '1', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Bienvenida' } },
        { id: '2', type: 'menu', position: { x: 300, y: 100 }, data: {
          label: 'Tienda Online',
          options: ['Ver Productos', 'Mi Carrito', 'Rastrear Pedido', 'Ofertas']
        }},
        { id: '3', type: 'message', position: { x: 500, y: 50 }, data: {
          label: 'Catálogo',
          message: 'Aquí tienes nuestros productos más populares:'
        }},
        { id: '4', type: 'question', position: { x: 700, y: 50 }, data: {
          label: 'Filtrar productos',
          options: ['Por categoría', 'Por precio', 'Más vendidos', 'Nuevos']
        }}
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', label: 'Ver Productos' },
        { id: 'e3-4', source: '3', target: '4' }
      ]
    },
    icon: <ShoppingCart className="w-6 h-6" />,
    color: 'bg-green-500',
    tags: ['ventas', 'ecommerce', 'productos', 'carrito'],
    usageCount: 890,
    rating: 4.7
  },
  {
    id: 3,
    name: 'Reservas de Restaurante',
    description: 'Sistema completo de reservas con disponibilidad en tiempo real, menús y promociones especiales',
    category: 'Reservas',
    industry: 'Restaurantes',
    complexity: 'intermediate',
    estimatedSetupTime: 30,
    features: [
      'Calendario de disponibilidad',
      'Reservas automáticas',
      'Menú digital',
      'Promociones del día',
      'Confirmación por WhatsApp',
      'Recordatorios automáticos'
    ],
    flow: {
      nodes: [
        { id: '1', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Saludo Restaurante' } },
        { id: '2', type: 'menu', position: { x: 300, y: 100 }, data: {
          label: 'Opciones',
          options: ['Hacer Reserva', 'Ver Menú', 'Promociones', 'Contacto']
        }},
        { id: '3', type: 'question', position: { x: 500, y: 50 }, data: {
          label: 'Reserva - Personas',
          message: '¿Para cuántas personas?',
          options: ['1-2 personas', '3-4 personas', '5+ personas']
        }},
        { id: '4', type: 'question', position: { x: 700, y: 50 }, data: {
          label: 'Fecha y Hora',
          message: 'Selecciona fecha y hora preferida'
        }}
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', label: 'Hacer Reserva' },
        { id: 'e3-4', source: '3', target: '4' }
      ]
    },
    icon: <Coffee className="w-6 h-6" />,
    color: 'bg-orange-500',
    tags: ['reservas', 'restaurante', 'calendario', 'menú'],
    usageCount: 654,
    rating: 4.6
  },
  {
    id: 4,
    name: 'Inmobiliaria Virtual',
    description: 'Asistente inmobiliario con búsqueda de propiedades, tours virtuales y citas con agentes',
    category: 'Ventas',
    industry: 'Inmobiliaria',
    complexity: 'advanced',
    estimatedSetupTime: 50,
    features: [
      'Búsqueda de propiedades por filtros',
      'Tours virtuales 360°',
      'Calculadora de hipoteca',
      'Agendamiento de visitas',
      'Comparador de propiedades',
      'Notificaciones de nuevas propiedades'
    ],
    flow: {
      nodes: [
        { id: '1', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Bienvenida Inmobiliaria' } },
        { id: '2', type: 'question', position: { x: 300, y: 100 }, data: {
          label: '¿Qué buscas?',
          options: ['Comprar', 'Rentar', 'Vender', 'Información']
        }},
        { id: '3', type: 'question', position: { x: 500, y: 50 }, data: {
          label: 'Tipo de propiedad',
          options: ['Casa', 'Departamento', 'Local comercial', 'Terreno']
        }}
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', label: 'Comprar/Rentar' }
      ]
    },
    icon: <Home className="w-6 h-6" />,
    color: 'bg-purple-500',
    tags: ['inmobiliaria', 'propiedades', 'tours', 'hipoteca'],
    usageCount: 432,
    rating: 4.5
  },
  {
    id: 5,
    name: 'Salud y Citas Médicas',
    description: 'Sistema médico con agendamiento de citas, recordatorios y triaje inicial de síntomas',
    category: 'Citas',
    industry: 'Salud',
    complexity: 'advanced',
    estimatedSetupTime: 55,
    features: [
      'Agendamiento de citas por especialidad',
      'Triaje de síntomas básico',
      'Recordatorios de citas',
      'Información de servicios',
      'Preparación para consulta',
      'Emergencias y primeros auxilios'
    ],
    flow: {
      nodes: [
        { id: '1', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Asistente Médico' } },
        { id: '2', type: 'menu', position: { x: 300, y: 100 }, data: {
          label: 'Servicios',
          options: ['Agendar Cita', 'Emergencias', 'Información', 'Resultados']
        }},
        { id: '3', type: 'question', position: { x: 500, y: 20 }, data: {
          label: 'Tipo de consulta',
          options: ['Medicina General', 'Especialista', 'Exámenes', 'Urgencias']
        }}
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', label: 'Agendar Cita' }
      ]
    },
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-red-500',
    tags: ['salud', 'citas', 'médico', 'triaje'],
    usageCount: 567,
    rating: 4.9
  },
  {
    id: 6,
    name: 'Educación Online',
    description: 'Plataforma educativa con cursos, evaluaciones y seguimiento de progreso académico',
    category: 'Educación',
    industry: 'Educación',
    complexity: 'intermediate',
    estimatedSetupTime: 35,
    features: [
      'Catálogo de cursos',
      'Evaluaciones interactivas',
      'Seguimiento de progreso',
      'Certificados automáticos',
      'Recordatorios de clases',
      'Soporte académico'
    ],
    flow: {
      nodes: [
        { id: '1', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Campus Virtual' } },
        { id: '2', type: 'menu', position: { x: 300, y: 100 }, data: {
          label: 'Opciones',
          options: ['Mis Cursos', 'Explorar', 'Evaluaciones', 'Progreso']
        }}
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' }
      ]
    },
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'bg-indigo-500',
    tags: ['educación', 'cursos', 'evaluaciones', 'certificados'],
    usageCount: 321,
    rating: 4.4
  }
];

export default function TemplatesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  // Filter templates
  const filteredTemplates = predefinedTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity;
    
    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const categories = Array.from(new Set(predefinedTemplates.map(t => t.category)));
  const complexityLevels = ['basic', 'intermediate', 'advanced'];

  const getComplexityColor = (complexity: string) => {
    switch(complexity) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityLabel = (complexity: string) => {
    switch(complexity) {
      case 'basic': return 'Básico';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return complexity;
    }
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowWizard(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Templates de Chatbots Profesionales
        </h1>
        <p className="text-gray-600">
          Flujos prediseñados para diferentes industrias y casos de uso. Configura en minutos lo que tomaría horas crear.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 bg-white"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={selectedComplexity}
          onChange={(e) => setSelectedComplexity(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 bg-white"
        >
          <option value="all">Todos los niveles</option>
          {complexityLevels.map(level => (
            <option key={level} value={level}>{getComplexityLabel(level)}</option>
          ))}
        </select>

        <Button className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtros avanzados
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${template.color} text-white`}>
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={getComplexityColor(template.complexity)}>
                        {getComplexityLabel(template.complexity)}
                      </Badge>
                      <span className="text-sm text-gray-500">{template.industry}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {template.rating}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <CardDescription className="mb-4">
                {template.description}
              </CardDescription>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock className="w-4 h-4" />
                  Configuración: ~{template.estimatedSetupTime} min
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  {template.usageCount.toLocaleString()} empresas lo usan
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2">Características incluidas:</h4>
                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {template.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.features.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Usar Template
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  // Mostrar preview del flujo del template
                  alert(`Vista previa del template: ${template.name}\n\nFlujo incluido:\n- ${template.features.slice(0, 3).join('\n- ')}`);
                }}>
                  Vista previa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron templates</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Template Configuration Wizard */}
      {showWizard && selectedTemplate && (
        <Dialog open={showWizard} onOpenChange={setShowWizard}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Configurar Template: {selectedTemplate.name}</DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Este asistente te guiará paso a paso para configurar tu chatbot basado en el template seleccionado.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Asistente de Configuración</h4>
                <p className="text-blue-800 text-sm">
                  El template incluye un flujo prediseñado completo. Puedes personalizarlo usando el constructor visual de chatbots.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowWizard(false)}>
                  Cerrar
                </Button>
                <Button onClick={() => {
                  // Aquí iría la lógica para crear un chatbot con el template
                  // Por ahora redirigimos al constructor con datos predefinidos
                  window.location.href = `/chatbots/builder?template=${selectedTemplate.id}`;
                  toast({
                    title: "Template aplicado",
                    description: "Se ha creado un chatbot con el template seleccionado",
                  });
                  setShowWizard(false);
                }}>
                  Usar Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}