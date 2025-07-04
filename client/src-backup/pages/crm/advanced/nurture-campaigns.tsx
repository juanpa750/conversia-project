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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Send, 
  Users, 
  Calendar, 
  Target,
  TrendingUp,
  Clock,
  MessageSquare,
  Mail,
  Zap,
  Settings,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react';

interface NurtureCampaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  type: 'email' | 'whatsapp' | 'mixed';
  audience: {
    totalContacts: number;
    segments: string[];
    criteria: any;
  };
  sequence: CampaignStep[];
  performance: {
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
  schedule: {
    startDate: string;
    endDate?: string;
    frequency: string;
  };
  createdAt: string;
  lastModified: string;
}

interface CampaignStep {
  id: string;
  order: number;
  type: 'message' | 'email' | 'wait' | 'condition';
  delay: number; // in days
  delayUnit: 'minutes' | 'hours' | 'days';
  content: {
    subject?: string;
    message: string;
    template?: string;
  };
  conditions?: {
    field: string;
    operator: string;
    value: string;
  }[];
  performance: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
}

export default function NurtureCampaignsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'campaigns' | 'create' | 'analytics'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<NurtureCampaign | null>(null);
  const [newCampaign, setNewCampaign] = useState<Partial<NurtureCampaign>>({
    name: '',
    description: '',
    type: 'whatsapp',
    status: 'draft'
  });

  // Fetch nurture campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ['/api/crm/nurture-campaigns'],
    initialData: [
      {
        id: '1',
        name: 'Bienvenida Nuevos Clientes',
        description: 'Serie de mensajes para educar y convertir nuevos contactos',
        status: 'active' as const,
        type: 'whatsapp' as const,
        audience: {
          totalContacts: 247,
          segments: ['nuevos_contactos', 'leads_whatsapp'],
          criteria: { source: 'whatsapp', days_since_signup: '<= 7' }
        },
        sequence: [
          {
            id: 's1',
            order: 1,
            type: 'message' as const,
            delay: 0,
            delayUnit: 'minutes' as const,
            content: {
              message: '¡Hola! Bienvenido a BotMaster. Estamos aquí para ayudarte a automatizar tu negocio 🚀'
            },
            performance: { sent: 247, delivered: 245, opened: 201, clicked: 87 }
          },
          {
            id: 's2',
            order: 2,
            type: 'wait' as const,
            delay: 2,
            delayUnit: 'days' as const,
            content: { message: '' },
            performance: { sent: 0, delivered: 0, opened: 0, clicked: 0 }
          },
          {
            id: 's3',
            order: 3,
            type: 'message' as const,
            delay: 0,
            delayUnit: 'minutes' as const,
            content: {
              message: 'Te compartimos algunos consejos para crear tu primer chatbot exitoso: [enlace a guía]'
            },
            performance: { sent: 189, delivered: 187, opened: 156, clicked: 73 }
          }
        ],
        performance: {
          delivered: 432,
          opened: 357,
          clicked: 160,
          converted: 23,
          revenue: 28750
        },
        schedule: {
          startDate: '2024-01-01',
          frequency: 'continuous'
        },
        createdAt: '2024-01-01',
        lastModified: '2024-01-10'
      },
      {
        id: '2',
        name: 'Reactivación Contactos Inactivos',
        description: 'Campaña para reconectar con contactos que no han interactuado recientemente',
        status: 'active' as const,
        type: 'mixed' as const,
        audience: {
          totalContacts: 89,
          segments: ['inactivos_30_dias'],
          criteria: { last_interaction: '> 30 days', status: 'active' }
        },
        sequence: [
          {
            id: 's4',
            order: 1,
            type: 'email' as const,
            delay: 0,
            delayUnit: 'minutes' as const,
            content: {
              subject: '¿Sigues interesado en automatizar tu negocio?',
              message: 'Hemos notado que no hemos hablado en un tiempo. ¿Podemos ayudarte con algo específico?'
            },
            performance: { sent: 89, delivered: 86, opened: 34, clicked: 12 }
          },
          {
            id: 's5',
            order: 2,
            type: 'wait' as const,
            delay: 3,
            delayUnit: 'days' as const,
            content: { message: '' },
            performance: { sent: 0, delivered: 0, opened: 0, clicked: 0 }
          }
        ],
        performance: {
          delivered: 86,
          opened: 34,
          clicked: 12,
          converted: 3,
          revenue: 4200
        },
        schedule: {
          startDate: '2024-01-05',
          frequency: 'weekly'
        },
        createdAt: '2024-01-05',
        lastModified: '2024-01-12'
      }
    ]
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaign: Partial<NurtureCampaign>) => {
      return apiRequest('POST', '/api/crm/nurture-campaigns', campaign);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/nurture-campaigns'] });
      toast({
        title: "Campaña creada",
        description: "La campaña de cultivo se ha creado correctamente.",
      });
      setActiveTab('campaigns');
      setNewCampaign({ name: '', description: '', type: 'whatsapp', status: 'draft' });
    }
  });

  const toggleCampaignMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/crm/nurture-campaigns/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/nurture-campaigns'] });
      toast({
        title: "Campaña actualizada",
        description: "El estado de la campaña se ha actualizado.",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'mixed': return <Zap className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'wait': return <Clock className="w-4 h-4" />;
      case 'condition': return <Settings className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const calculateEngagementRate = (campaign: NurtureCampaign) => {
    const { delivered, opened } = campaign.performance;
    return delivered > 0 ? Math.round((opened / delivered) * 100) : 0;
  };

  const calculateConversionRate = (campaign: NurtureCampaign) => {
    const { delivered, converted } = campaign.performance;
    return delivered > 0 ? Math.round((converted / delivered) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campañas de Cultivo</h1>
          <p className="text-gray-600">Automatiza secuencias de mensajes para nutrir y convertir leads</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'campaigns' ? 'default' : 'outline'}
            onClick={() => setActiveTab('campaigns')}
          >
            <Send className="w-4 h-4 mr-2" />
            Campañas
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setActiveTab('create')}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Campaña
          </Button>
        </div>
      </div>

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Campaign Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Campañas Activas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {campaigns.filter(c => c.status === 'active').length}
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
                    <p className="text-sm text-gray-600">Contactos en Campaña</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {campaigns.reduce((sum, c) => sum + c.audience.totalContacts, 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tasa de Conversión</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {campaigns.length > 0 ? Math.round(
                        campaigns.reduce((sum, c) => sum + calculateConversionRate(c), 0) / campaigns.length
                      ) : 0}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ingresos Generados</p>
                    <p className="text-2xl font-bold text-orange-600">
                      €{campaigns.reduce((sum, c) => sum + c.performance.revenue, 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns List */}
          <div className="space-y-4">
            {campaigns.map((campaign: NurtureCampaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(campaign.type)}
                        <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status === 'active' ? 'Activa' : 
                         campaign.status === 'paused' ? 'Pausada' : 
                         campaign.status === 'draft' ? 'Borrador' : 'Completada'}
                      </Badge>
                      <Badge variant="outline">
                        {campaign.audience.totalContacts} contactos
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCampaign(campaign)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCampaignMutation.mutate({
                          id: campaign.id,
                          status: campaign.status === 'active' ? 'paused' : 'active'
                        })}
                      >
                        {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{campaign.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Entregados</p>
                      <p className="text-xl font-bold">{campaign.performance.delivered}</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Engagement</p>
                      <p className="text-xl font-bold text-blue-600">{calculateEngagementRate(campaign)}%</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Conversiones</p>
                      <p className="text-xl font-bold text-green-600">{campaign.performance.converted}</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Ingresos</p>
                      <p className="text-xl font-bold text-purple-600">€{campaign.performance.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {/* Campaign Sequence Preview */}
                  <div>
                    <h4 className="font-medium mb-2">Secuencia ({campaign.sequence.length} pasos)</h4>
                    <div className="flex space-x-2 overflow-x-auto">
                      {campaign.sequence.slice(0, 5).map((step, index) => (
                        <div key={step.id} className="flex-shrink-0 flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            {getStepTypeIcon(step.type)}
                          </div>
                          {index < campaign.sequence.length - 1 && index < 4 && (
                            <div className="w-4 h-px bg-gray-300"></div>
                          )}
                        </div>
                      ))}
                      {campaign.sequence.length > 5 && (
                        <div className="flex items-center text-sm text-gray-500">
                          +{campaign.sequence.length - 5} más
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nueva Campaña de Cultivo</CardTitle>
              <CardDescription>
                Crea una secuencia automatizada de mensajes para nutrir tus leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign-name">Nombre de la Campaña</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Ej: Bienvenida nuevos usuarios"
                    value={newCampaign.name || ''}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-type">Tipo de Campaña</Label>
                  <select
                    id="campaign-type"
                    className="w-full p-2 border rounded-md"
                    value={newCampaign.type}
                    onChange={(e) => setNewCampaign({...newCampaign, type: e.target.value as any})}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="mixed">Mixta</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="campaign-description">Descripción</Label>
                <Textarea
                  id="campaign-description"
                  placeholder="Describe el objetivo y contenido de esta campaña"
                  value={newCampaign.description || ''}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setActiveTab('campaigns')}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => createCampaignMutation.mutate(newCampaign)}
                  disabled={createCampaignMutation.isPending}
                >
                  Crear Campaña
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Performance Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Campaña</CardTitle>
                <CardDescription>
                  Comparación de métricas entre campañas activas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Gráfico de Rendimiento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Embudo de Conversión</CardTitle>
                <CardDescription>
                  Análisis del journey completo de los contactos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Embudo de Conversión</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado</CardTitle>
              <CardDescription>
                Métricas avanzadas de todas las campañas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign: NurtureCampaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{campaign.name}</h3>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tasa de Entrega</p>
                        <p className="text-lg font-bold">
                          {campaign.performance.delivered > 0 ? 
                            Math.round((campaign.performance.delivered / campaign.audience.totalContacts) * 100) : 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tasa de Apertura</p>
                        <p className="text-lg font-bold text-blue-600">
                          {calculateEngagementRate(campaign)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tasa de Conversión</p>
                        <p className="text-lg font-bold text-green-600">
                          {calculateConversionRate(campaign)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">ROI</p>
                        <p className="text-lg font-bold text-purple-600">
                          {campaign.performance.revenue > 1000 ? 
                            Math.round((campaign.performance.revenue / 1000) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}