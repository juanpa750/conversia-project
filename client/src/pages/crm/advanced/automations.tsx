import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Workflow, 
  Play, 
  Pause, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Copy,
  Activity,
  Clock,
  Users,
  MessageSquare,
  Mail,
  Zap,
  BarChart3
} from 'lucide-react';

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: {
    type: 'contact_created' | 'message_received' | 'tag_added' | 'time_based';
    conditions: string;
  };
  actions: WorkflowAction[];
  statistics: {
    totalExecutions: number;
    successRate: number;
    avgExecutionTime: number;
    lastExecuted: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface WorkflowAction {
  id: string;
  type: 'send_message' | 'add_tag' | 'create_task' | 'send_email' | 'wait' | 'update_contact';
  config: any;
  position: number;
}

const mockAutomations: AutomationWorkflow[] = [
  {
    id: '1',
    name: 'Bienvenida Nuevos Contactos',
    description: 'Secuencia de bienvenida automática para nuevos contactos de WhatsApp',
    isActive: true,
    trigger: {
      type: 'contact_created',
      conditions: 'source = "whatsapp"'
    },
    actions: [
      {
        id: '1',
        type: 'send_message',
        config: {
          message: '¡Hola! Bienvenido a BotMaster. Te ayudaremos con todas tus consultas.',
          delay: 0
        },
        position: 1
      },
      {
        id: '2',
        type: 'wait',
        config: {
          duration: 300,
          unit: 'seconds'
        },
        position: 2
      },
      {
        id: '3',
        type: 'send_message',
        config: {
          message: '¿En qué puedo ayudarte hoy? Escribe "menu" para ver nuestras opciones.',
          delay: 0
        },
        position: 3
      }
    ],
    statistics: {
      totalExecutions: 234,
      successRate: 98.5,
      avgExecutionTime: 45,
      lastExecuted: '2024-01-15T14:30:00Z'
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Seguimiento Leads Calientes',
    description: 'Automatización para seguimiento de leads con alta puntuación',
    isActive: true,
    trigger: {
      type: 'tag_added',
      conditions: 'tag = "lead_caliente"'
    },
    actions: [
      {
        id: '1',
        type: 'send_message',
        config: {
          message: 'Hemos notado tu interés en nuestros servicios. ¿Te gustaría agendar una llamada?',
          delay: 0
        },
        position: 1
      },
      {
        id: '2',
        type: 'create_task',
        config: {
          title: 'Contactar lead caliente',
          assignee: 'sales_team',
          priority: 'high'
        },
        position: 2
      }
    ],
    statistics: {
      totalExecutions: 67,
      successRate: 94.2,
      avgExecutionTime: 12,
      lastExecuted: '2024-01-15T16:45:00Z'
    },
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-15T16:45:00Z'
  },
  {
    id: '3',
    name: 'Recordatorio Carritos Abandonados',
    description: 'Recuperación automática de carritos abandonados en e-commerce',
    isActive: false,
    trigger: {
      type: 'time_based',
      conditions: 'cart_abandoned_hours > 24'
    },
    actions: [
      {
        id: '1',
        type: 'send_message',
        config: {
          message: '¡No olvides completar tu compra! Tienes productos esperándote en tu carrito.',
          delay: 0
        },
        position: 1
      },
      {
        id: '2',
        type: 'wait',
        config: {
          duration: 24,
          unit: 'hours'
        },
        position: 2
      },
      {
        id: '3',
        type: 'send_message',
        config: {
          message: 'Última oportunidad: 10% de descuento en tu carrito. Usa código: VUELVE10',
          delay: 0
        },
        position: 3
      }
    ],
    statistics: {
      totalExecutions: 189,
      successRate: 87.3,
      avgExecutionTime: 156,
      lastExecuted: '2024-01-14T20:15:00Z'
    },
    createdAt: '2024-01-03T11:30:00Z',
    updatedAt: '2024-01-14T20:15:00Z'
  }
];

export default function AutomationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'workflows' | 'templates' | 'analytics'>('workflows');

  const { data: automations = mockAutomations, isLoading } = useQuery({
    queryKey: ['/api/automations'],
    queryFn: () => Promise.resolve(mockAutomations)
  });

  const toggleAutomation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automations'] });
      toast({
        title: "Automatización actualizada",
        description: "El estado de la automatización ha sido actualizado.",
      });
    }
  });

  const duplicateAutomation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automations'] });
      toast({
        title: "Automatización duplicada",
        description: "Se ha creado una copia de la automatización.",
      });
    }
  });

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_message': return <MessageSquare className="w-4 h-4" />;
      case 'send_email': return <Mail className="w-4 h-4" />;
      case 'wait': return <Clock className="w-4 h-4" />;
      case 'add_tag': return <Plus className="w-4 h-4" />;
      case 'create_task': return <Activity className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'send_message': return 'Enviar Mensaje';
      case 'send_email': return 'Enviar Email';
      case 'wait': return 'Esperar';
      case 'add_tag': return 'Agregar Etiqueta';
      case 'create_task': return 'Crear Tarea';
      case 'update_contact': return 'Actualizar Contacto';
      default: return type;
    }
  };

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'contact_created': return 'Contacto Creado';
      case 'message_received': return 'Mensaje Recibido';
      case 'tag_added': return 'Etiqueta Agregada';
      case 'time_based': return 'Basado en Tiempo';
      default: return type;
    }
  };

  const totalExecutions = automations.reduce((sum, auto) => sum + auto.statistics.totalExecutions, 0);
  const activeAutomations = automations.filter(auto => auto.isActive).length;
  const avgSuccessRate = automations.reduce((sum, auto) => sum + auto.statistics.successRate, 0) / automations.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automatizaciones</h1>
          <p className="text-gray-600">Workflows inteligentes para automatizar tu comunicación</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Automatización
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Workflow className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Automatizaciones</p>
                <p className="text-2xl font-bold text-gray-900">{automations.length}</p>
                <p className="text-xs text-green-600">{activeAutomations} activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ejecuciones Totales</p>
                <p className="text-2xl font-bold text-gray-900">{totalExecutions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-gray-900">{avgSuccessRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contactos Impactados</p>
                <p className="text-2xl font-bold text-gray-900">2,847</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'workflows', label: 'Automatizaciones' },
            { id: 'templates', label: 'Plantillas' },
            { id: 'analytics', label: 'Analíticas' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Cargando automatizaciones...</div>
          ) : (
            automations.map((automation) => (
              <Card key={automation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={automation.isActive}
                            onCheckedChange={(checked) => 
                              toggleAutomation.mutate({ id: automation.id, isActive: checked })
                            }
                          />
                          <h3 className="text-lg font-semibold">{automation.name}</h3>
                        </div>
                        <Badge variant={automation.isActive ? 'default' : 'secondary'}>
                          {automation.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{automation.description}</p>
                      
                      {/* Trigger */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Trigger:</h4>
                        <div className="flex items-center space-x-2 text-sm">
                          <Badge variant="outline">
                            {getTriggerLabel(automation.trigger.type)}
                          </Badge>
                          <span className="text-gray-600">{automation.trigger.conditions}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Acciones ({automation.actions.length}):</h4>
                        <div className="flex flex-wrap gap-2">
                          {automation.actions.slice(0, 3).map((action) => (
                            <div key={action.id} className="flex items-center space-x-1 bg-gray-100 rounded px-2 py-1">
                              {getActionIcon(action.type)}
                              <span className="text-xs">{getActionLabel(action.type)}</span>
                            </div>
                          ))}
                          {automation.actions.length > 3 && (
                            <span className="text-xs text-gray-500">+{automation.actions.length - 3} más</span>
                          )}
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{automation.statistics.totalExecutions}</p>
                          <p className="text-xs text-gray-600">Ejecuciones</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{automation.statistics.successRate}%</p>
                          <p className="text-xs text-gray-600">Éxito</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{automation.statistics.avgExecutionTime}s</p>
                          <p className="text-xs text-gray-600">Tiempo Prom.</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">
                            {new Date(automation.statistics.lastExecuted).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-600">Última Ejecución</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => duplicateAutomation.mutate(automation.id)}
                      >
                        <Copy className="w-4 h-4" />
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
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Plantillas de Automatización</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Onboarding de Clientes',
                description: 'Secuencia completa de bienvenida para nuevos clientes',
                actions: 5,
                category: 'Bienvenida'
              },
              {
                name: 'Recuperación de Carritos',
                description: 'Serie de mensajes para recuperar carritos abandonados',
                actions: 3,
                category: 'E-commerce'
              },
              {
                name: 'Seguimiento Post-Venta',
                description: 'Automatización para seguimiento después de una compra',
                actions: 4,
                category: 'Retención'
              },
              {
                name: 'Calificación de Leads',
                description: 'Flujo para calificar y segmentar nuevos leads',
                actions: 6,
                category: 'Ventas'
              }
            ].map((template, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">{template.category}</Badge>
                    <span className="text-xs text-gray-500">{template.actions} acciones</span>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    Usar Plantilla
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Analíticas de Automatización</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Automatización</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automations.map((automation) => (
                    <div key={automation.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{automation.name}</p>
                        <p className="text-xs text-gray-600">{automation.statistics.totalExecutions} ejecuciones</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{automation.statistics.successRate}%</p>
                        <p className="text-xs text-gray-600">éxito</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impacto en Conversiones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Leads generados</span>
                    <span className="font-bold">+156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ventas completadas</span>
                    <span className="font-bold">+23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tiempo de respuesta</span>
                    <span className="font-bold text-green-600">-85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Satisfacción cliente</span>
                    <span className="font-bold text-green-600">+42%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}