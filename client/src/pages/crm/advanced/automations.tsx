import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap, 
  Clock, 
  Users, 
  MessageSquare, 
  Mail,
  Phone,
  Calendar,
  Filter,
  Play,
  Pause,
  Settings,
  Plus,
  Trash2,
  ChevronRight
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: string;
    conditions: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
  };
  actions: Array<{
    type: string;
    config: any;
  }>;
  active: boolean;
  executionCount: number;
  lastExecuted?: string;
}

interface AutomationExecution {
  id: string;
  automationId: string;
  contactId: number;
  contactName: string;
  status: 'success' | 'failed' | 'pending';
  executedAt: string;
  result: string;
}

export default function AutomationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'rules' | 'executions'>('rules');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAutomation, setNewAutomation] = useState<Partial<AutomationRule>>({
    name: '',
    description: '',
    trigger: {
      type: 'contact_created',
      conditions: []
    },
    actions: [],
    active: true
  });

  // Fetch automation rules
  const { data: automationRules = [] } = useQuery({
    queryKey: ['/api/crm/automations'],
    initialData: [
      {
        id: '1',
        name: 'Bienvenida Nuevos Contactos',
        description: 'Envía mensaje de bienvenida automático a nuevos contactos de WhatsApp',
        trigger: {
          type: 'contact_created',
          conditions: [
            { field: 'source', operator: 'equals', value: 'whatsapp' }
          ]
        },
        actions: [
          {
            type: 'send_message',
            config: {
              template: 'welcome_message',
              message: '¡Hola! Gracias por contactarnos. Un especialista te atenderá pronto.'
            }
          }
        ],
        active: true,
        executionCount: 127,
        lastExecuted: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Seguimiento Contactos Inactivos',
        description: 'Envía recordatorio a contactos sin actividad en 7 días',
        trigger: {
          type: 'scheduled',
          conditions: [
            { field: 'last_interaction', operator: 'older_than', value: '7_days' }
          ]
        },
        actions: [
          {
            type: 'send_message',
            config: {
              message: 'Hola, queríamos saber si aún estás interesado en nuestros servicios. ¿Podemos ayudarte?'
            }
          },
          {
            type: 'update_status',
            config: {
              status: 'follow_up_sent'
            }
          }
        ],
        active: true,
        executionCount: 89,
        lastExecuted: '2024-01-14T15:00:00Z'
      },
      {
        id: '3',
        name: 'Asignación Automática Agentes',
        description: 'Asigna contactos automáticamente según criterios definidos',
        trigger: {
          type: 'contact_updated',
          conditions: [
            { field: 'score', operator: 'greater_than', value: '80' }
          ]
        },
        actions: [
          {
            type: 'assign_agent',
            config: {
              agent: 'senior_sales'
            }
          },
          {
            type: 'send_notification',
            config: {
              message: 'Contacto de alto valor asignado'
            }
          }
        ],
        active: true,
        executionCount: 34,
        lastExecuted: '2024-01-15T09:15:00Z'
      }
    ]
  });

  // Fetch automation executions
  const { data: automationExecutions = [] } = useQuery({
    queryKey: ['/api/crm/automation-executions'],
    initialData: [
      {
        id: '1',
        automationId: '1',
        contactId: 123,
        contactName: 'María González',
        status: 'success' as const,
        executedAt: '2024-01-15T10:30:00Z',
        result: 'Mensaje de bienvenida enviado correctamente'
      },
      {
        id: '2',
        automationId: '2',
        contactId: 124,
        contactName: 'Carlos Ruiz',
        status: 'success' as const,
        executedAt: '2024-01-15T09:45:00Z',
        result: 'Mensaje de seguimiento enviado'
      },
      {
        id: '3',
        automationId: '3',
        contactId: 125,
        contactName: 'Ana López',
        status: 'failed' as const,
        executedAt: '2024-01-15T08:20:00Z',
        result: 'Error: Agente no disponible'
      }
    ]
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      return apiRequest('PATCH', `/api/crm/automations/${id}`, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/automations'] });
      toast({
        title: "Automatización actualizada",
        description: "El estado se ha cambiado correctamente.",
      });
    }
  });

  const deleteAutomationMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/crm/automations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/automations'] });
      toast({
        title: "Automatización eliminada",
        description: "La automatización se ha eliminado correctamente.",
      });
    }
  });

  const createAutomationMutation = useMutation({
    mutationFn: async (automation: Partial<AutomationRule>) => {
      return apiRequest('POST', '/api/crm/automations', automation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/automations'] });
      setShowCreateModal(false);
      setNewAutomation({
        name: '',
        description: '',
        trigger: { type: 'contact_created', conditions: [] },
        actions: [],
        active: true
      });
      toast({
        title: "Automatización creada",
        description: "La nueva automatización se ha configurado correctamente.",
      });
    }
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    switch (type) {
      case 'contact_created': return 'Contacto Creado';
      case 'contact_updated': return 'Contacto Actualizado';
      case 'message_received': return 'Mensaje Recibido';
      case 'scheduled': return 'Programado';
      default: return type;
    }
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'send_message': return <MessageSquare className="w-4 h-4" />;
      case 'send_email': return <Mail className="w-4 h-4" />;
      case 'assign_agent': return <Users className="w-4 h-4" />;
      case 'update_status': return <Settings className="w-4 h-4" />;
      case 'send_notification': return <Zap className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automatizaciones Avanzadas</h1>
          <p className="text-gray-600">Configura flujos automáticos para optimizar tu CRM</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'rules' ? 'default' : 'outline'}
            onClick={() => setActiveTab('rules')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Reglas
          </Button>
          <Button
            variant={activeTab === 'executions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('executions')}
          >
            <Clock className="w-4 h-4 mr-2" />
            Ejecuciones
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Automatización
          </Button>
        </div>
      </div>

      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Automatizaciones</p>
                    <p className="text-2xl font-bold">{automationRules.length}</p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Activas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {automationRules.filter((r: AutomationRule) => r.active).length}
                    </p>
                  </div>
                  <Play className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ejecuciones Hoy</p>
                    <p className="text-2xl font-bold text-orange-600">247</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tasa de Éxito</p>
                    <p className="text-2xl font-bold text-purple-600">94%</p>
                  </div>
                  <Settings className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Automation Rules */}
          <div className="space-y-4">
            {automationRules.map((rule: AutomationRule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{rule.name}</h3>
                      <Badge variant={rule.active ? 'default' : 'secondary'}>
                        {rule.active ? 'Activa' : 'Inactiva'}
                      </Badge>
                      <Badge variant="outline">
                        {rule.executionCount} ejecuciones
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.active}
                        onCheckedChange={(checked) => 
                          toggleAutomationMutation.mutate({ id: rule.id, active: checked })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAutomationMutation.mutate(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{rule.description}</p>
                  
                  <div className="flex items-center space-x-6">
                    {/* Trigger */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Filter className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Activador</p>
                        <p className="text-xs text-gray-600">
                          {getTriggerTypeLabel(rule.trigger.type)}
                        </p>
                      </div>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm font-medium">Acciones ({rule.actions.length})</p>
                        <div className="flex space-x-1 mt-1">
                          {rule.actions.map((action, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"
                            >
                              {getActionTypeIcon(action.type)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {rule.lastExecuted && (
                      <>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Última ejecución</p>
                          <p className="text-xs text-gray-600">
                            {new Date(rule.lastExecuted).toLocaleString()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'executions' && (
        <div className="space-y-6">
          {/* Execution History */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Ejecuciones</CardTitle>
              <CardDescription>
                Registro detallado de todas las automatizaciones ejecutadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationExecutions.map((execution: AutomationExecution) => {
                  const rule = automationRules.find((r: AutomationRule) => r.id === execution.automationId);
                  return (
                    <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{rule?.name}</h4>
                          <p className="text-sm text-gray-600">
                            Contacto: {execution.contactName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(execution.executedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getStatusBadgeColor(execution.status)}>
                          {execution.status === 'success' ? 'Éxito' : 
                           execution.status === 'failed' ? 'Error' : 'Pendiente'}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1 max-w-xs">
                          {execution.result}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Automation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Nueva Automatización</CardTitle>
              <CardDescription>
                Configura una nueva regla de automatización para tu CRM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="automation-name">Nombre</Label>
                  <Input
                    id="automation-name"
                    placeholder="Nombre de la automatización"
                    value={newAutomation.name || ''}
                    onChange={(e) => setNewAutomation({...newAutomation, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="trigger-type">Tipo de Activador</Label>
                  <select
                    id="trigger-type"
                    className="w-full p-2 border rounded-md"
                    value={newAutomation.trigger?.type}
                    onChange={(e) => setNewAutomation({
                      ...newAutomation,
                      trigger: { ...newAutomation.trigger!, type: e.target.value }
                    })}
                  >
                    <option value="contact_created">Contacto Creado</option>
                    <option value="contact_updated">Contacto Actualizado</option>
                    <option value="message_received">Mensaje Recibido</option>
                    <option value="scheduled">Programado</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="automation-description">Descripción</Label>
                <Textarea
                  id="automation-description"
                  placeholder="Describe qué hace esta automatización"
                  value={newAutomation.description || ''}
                  onChange={(e) => setNewAutomation({...newAutomation, description: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newAutomation.active}
                  onCheckedChange={(checked) => setNewAutomation({...newAutomation, active: checked})}
                />
                <Label>Activar automatización</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => createAutomationMutation.mutate(newAutomation)}
                  disabled={createAutomationMutation.isPending}
                >
                  Crear Automatización
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}