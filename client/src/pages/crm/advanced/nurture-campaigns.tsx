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
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Target, 
  Users, 
  Mail, 
  MessageSquare,
  Calendar,
  TrendingUp,
  Clock,
  Eye,
  Edit,
  Plus,
  Play,
  Pause,
  Copy,
  Trash2,
  BarChart3,
  Send,
  Filter
} from 'lucide-react';

interface NurtureCampaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  type: 'email' | 'whatsapp' | 'sms' | 'multi_channel';
  targetSegment: string;
  totalContacts: number;
  sequence: CampaignStep[];
  metrics: CampaignMetrics;
  schedule: CampaignSchedule;
  createdAt: string;
  updatedAt: string;
}

interface CampaignStep {
  id: string;
  position: number;
  type: 'email' | 'whatsapp' | 'sms' | 'wait' | 'condition';
  subject: string;
  content: string;
  delay: number;
  delayUnit: 'minutes' | 'hours' | 'days';
  conditions?: StepCondition[];
}

interface StepCondition {
  field: string;
  operator: string;
  value: string;
}

interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  converted: number;
  unsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface CampaignSchedule {
  startDate: string;
  endDate?: string;
  timezone: string;
  sendDays: string[];
  sendTimeStart: string;
  sendTimeEnd: string;
}

const mockCampaigns: NurtureCampaign[] = [
  {
    id: '1',
    name: 'Onboarding Nuevos Leads',
    description: 'Secuencia de bienvenida y educación para leads recién captados',
    status: 'active',
    type: 'multi_channel',
    targetSegment: 'new_leads',
    totalContacts: 234,
    sequence: [
      {
        id: '1',
        position: 1,
        type: 'whatsapp',
        subject: 'Bienvenido a BotMaster',
        content: '¡Hola! Gracias por tu interés en BotMaster. Te ayudaremos a automatizar tu negocio.',
        delay: 0,
        delayUnit: 'minutes'
      },
      {
        id: '2',
        position: 2,
        type: 'wait',
        subject: 'Esperar 2 días',
        content: '',
        delay: 2,
        delayUnit: 'days'
      },
      {
        id: '3',
        position: 3,
        type: 'email',
        subject: 'Guía: Primeros pasos con chatbots',
        content: 'Te enviamos una guía completa para comenzar con tu primer chatbot...',
        delay: 0,
        delayUnit: 'minutes'
      },
      {
        id: '4',
        position: 4,
        type: 'wait',
        subject: 'Esperar 3 días',
        content: '',
        delay: 3,
        delayUnit: 'days'
      },
      {
        id: '5',
        position: 5,
        type: 'whatsapp',
        subject: 'Casos de éxito en tu industria',
        content: 'Mira cómo empresas como la tuya han aumentado sus ventas con BotMaster...',
        delay: 0,
        delayUnit: 'minutes'
      }
    ],
    metrics: {
      sent: 234,
      delivered: 231,
      opened: 189,
      clicked: 67,
      replied: 23,
      converted: 12,
      unsubscribed: 2,
      deliveryRate: 98.7,
      openRate: 81.8,
      clickRate: 35.4,
      conversionRate: 5.1
    },
    schedule: {
      startDate: '2024-01-01T09:00:00Z',
      timezone: 'America/Mexico_City',
      sendDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      sendTimeStart: '09:00',
      sendTimeEnd: '18:00'
    },
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Reactivación Clientes Inactivos',
    description: 'Campaña para reactivar clientes que no han usado el servicio recientemente',
    status: 'active',
    type: 'email',
    targetSegment: 'inactive_customers',
    totalContacts: 89,
    sequence: [
      {
        id: '1',
        position: 1,
        type: 'email',
        subject: 'Te extrañamos - Regresa a BotMaster',
        content: 'Hemos notado que no has usado BotMaster recientemente. ¿Hay algo en lo que podamos ayudarte?',
        delay: 0,
        delayUnit: 'minutes'
      },
      {
        id: '2',
        position: 2,
        type: 'wait',
        subject: 'Esperar 5 días',
        content: '',
        delay: 5,
        delayUnit: 'days'
      },
      {
        id: '3',
        position: 3,
        type: 'email',
        subject: 'Oferta especial para tu regreso',
        content: 'Queremos que regreses. Disfruta de 30% de descuento en tu próximo mes...',
        delay: 0,
        delayUnit: 'minutes'
      }
    ],
    metrics: {
      sent: 89,
      delivered: 87,
      opened: 52,
      clicked: 18,
      replied: 8,
      converted: 5,
      unsubscribed: 3,
      deliveryRate: 97.8,
      openRate: 59.8,
      clickRate: 34.6,
      conversionRate: 9.6
    },
    schedule: {
      startDate: '2024-01-10T10:00:00Z',
      timezone: 'America/Mexico_City',
      sendDays: ['tuesday', 'thursday', 'saturday'],
      sendTimeStart: '10:00',
      sendTimeEnd: '16:00'
    },
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-15T11:20:00Z'
  },
  {
    id: '3',
    name: 'Cross-sell Servicios Premium',
    description: 'Promocionar servicios premium a clientes actuales',
    status: 'paused',
    type: 'whatsapp',
    targetSegment: 'active_customers',
    totalContacts: 156,
    sequence: [
      {
        id: '1',
        position: 1,
        type: 'whatsapp',
        subject: 'Nuevas funciones disponibles',
        content: 'Hemos agregado nuevas funciones premium que podrían interesarte...',
        delay: 0,
        delayUnit: 'minutes'
      },
      {
        id: '2',
        position: 2,
        type: 'wait',
        subject: 'Esperar 1 semana',
        content: '',
        delay: 7,
        delayUnit: 'days'
      },
      {
        id: '3',
        position: 3,
        type: 'whatsapp',
        subject: 'Demo personalizada gratis',
        content: '¿Te gustaría ver una demo personalizada de nuestras funciones premium?',
        delay: 0,
        delayUnit: 'minutes'
      }
    ],
    metrics: {
      sent: 67,
      delivered: 65,
      opened: 58,
      clicked: 24,
      replied: 15,
      converted: 8,
      unsubscribed: 1,
      deliveryRate: 97.0,
      openRate: 89.2,
      clickRate: 41.4,
      conversionRate: 11.9
    },
    schedule: {
      startDate: '2024-01-08T14:00:00Z',
      timezone: 'America/Mexico_City',
      sendDays: ['monday', 'wednesday', 'friday'],
      sendTimeStart: '14:00',
      sendTimeEnd: '17:00'
    },
    createdAt: '2024-01-03T11:30:00Z',
    updatedAt: '2024-01-12T16:45:00Z'
  }
];

export default function NurtureCampaignsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'analytics'>('campaigns');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: campaigns = mockCampaigns, isLoading } = useQuery({
    queryKey: ['/api/nurture-campaigns'],
    queryFn: () => Promise.resolve(mockCampaigns)
  });

  const toggleCampaign = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'paused' }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nurture-campaigns'] });
      toast({
        title: "Campaña actualizada",
        description: "El estado de la campaña ha sido actualizado.",
      });
    }
  });

  const duplicateCampaign = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nurture-campaigns'] });
      toast({
        title: "Campaña duplicada",
        description: "Se ha creado una copia de la campaña.",
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
      case 'sms': return <Send className="w-4 h-4" />;
      case 'multi_channel': return <Target className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'email': return 'Email';
      case 'whatsapp': return 'WhatsApp';
      case 'sms': return 'SMS';
      case 'multi_channel': return 'Multi-canal';
      default: return type;
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'sms': return <Send className="w-4 h-4" />;
      case 'wait': return <Clock className="w-4 h-4" />;
      case 'condition': return <Filter className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    selectedStatus === 'all' || campaign.status === selectedStatus
  );

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalContacts = campaigns.reduce((sum, campaign) => sum + campaign.totalContacts, 0);
  const avgConversionRate = campaigns.reduce((sum, campaign) => sum + campaign.metrics.conversionRate, 0) / campaigns.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campañas de Nurturing</h1>
          <p className="text-gray-600">Automatiza secuencias de comunicación para nutrir leads y clientes</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analíticas
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Campaña
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Campañas</p>
                <p className="text-2xl font-bold text-gray-900">{totalCampaigns}</p>
                <p className="text-xs text-green-600">{activeCampaigns} activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contactos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{totalContacts.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversión Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{avgConversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mensajes Enviados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((sum, c) => sum + c.metrics.sent, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'campaigns', label: 'Campañas' },
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
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex space-x-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="paused">Pausadas</option>
              <option value="draft">Borrador</option>
              <option value="completed">Completadas</option>
            </select>
          </div>

          {/* Campaigns List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Cargando campañas...</div>
            ) : (
              filteredCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={campaign.status === 'active'}
                            onCheckedChange={(checked) => 
                              toggleCampaign.mutate({ 
                                id: campaign.id, 
                                status: checked ? 'active' : 'paused' 
                              })
                            }
                          />
                          {getTypeIcon(campaign.type)}
                          <div>
                            <h3 className="text-lg font-semibold">{campaign.name}</h3>
                            <p className="text-gray-600">{campaign.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(campaign.type)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{campaign.totalContacts}</p>
                        <p className="text-xs text-gray-600">Contactos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{campaign.metrics.deliveryRate}%</p>
                        <p className="text-xs text-gray-600">Entrega</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{campaign.metrics.openRate}%</p>
                        <p className="text-xs text-gray-600">Apertura</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">{campaign.metrics.clickRate}%</p>
                        <p className="text-xs text-gray-600">Clicks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{campaign.metrics.conversionRate}%</p>
                        <p className="text-xs text-gray-600">Conversión</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Secuencia ({campaign.sequence.length} pasos):</h4>
                      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                        {campaign.sequence.map((step, index) => (
                          <div key={step.id} className="flex items-center space-x-2 flex-shrink-0">
                            <div className="flex items-center space-x-1 bg-gray-100 rounded px-2 py-1">
                              {getStepIcon(step.type)}
                              <span className="text-xs">{step.position}</span>
                            </div>
                            {index < campaign.sequence.length - 1 && (
                              <div className="w-4 h-px bg-gray-300"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Creada: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>Segmento: {campaign.targetSegment}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => duplicateCampaign.mutate(campaign.id)}
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
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Plantillas de Campañas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Bienvenida Lead',
                description: 'Secuencia de bienvenida para nuevos leads',
                steps: 4,
                type: 'multi_channel'
              },
              {
                name: 'Reactivación Cliente',
                description: 'Recuperar clientes inactivos',
                steps: 3,
                type: 'email'
              },
              {
                name: 'Cross-sell Premium',
                description: 'Promocionar servicios premium',
                steps: 5,
                type: 'whatsapp'
              },
              {
                name: 'Post-Compra',
                description: 'Seguimiento después de compra',
                steps: 6,
                type: 'multi_channel'
              }
            ].map((template, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    {getTypeIcon(template.type)}
                    <h3 className="font-semibold">{template.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">{getTypeLabel(template.type)}</Badge>
                    <span className="text-xs text-gray-500">{template.steps} pasos</span>
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
          <h2 className="text-lg font-semibold">Analíticas de Campañas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Campaña</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{campaign.name}</p>
                        <p className="text-xs text-gray-600">{campaign.metrics.sent} enviados</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{campaign.metrics.conversionRate}%</p>
                        <p className="text-xs text-gray-600">conversión</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas Generales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tasa de entrega promedio</span>
                    <span className="font-bold text-green-600">98.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tasa de apertura promedio</span>
                    <span className="font-bold text-blue-600">76.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tasa de click promedio</span>
                    <span className="font-bold text-purple-600">37.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ROI promedio</span>
                    <span className="font-bold text-orange-600">+287%</span>
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