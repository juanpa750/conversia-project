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
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Filter,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
  deals: Deal[];
}

interface Deal {
  id: string;
  title: string;
  contactName: string;
  contactEmail: string;
  company: string;
  value: number;
  probability: number;
  stage: string;
  expectedCloseDate: string;
  daysInStage: number;
  source: string;
  assignedTo: string;
  lastActivity: string;
  notes: string;
}

export default function SalesPipelinePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeView, setActiveView] = useState<'pipeline' | 'deals' | 'analytics'>('pipeline');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState('all');

  // Fetch pipeline stages with deals
  const { data: pipelineStages = [] } = useQuery({
    queryKey: ['/api/crm/pipeline-stages'],
    initialData: [
      {
        id: 'lead',
        name: 'Lead Inicial',
        order: 1,
        probability: 10,
        color: 'bg-gray-500',
        deals: [
          {
            id: '1',
            title: 'Implementación CRM TechCorp',
            contactName: 'María González',
            contactEmail: 'maria@techcorp.com',
            company: 'TechCorp Solutions',
            value: 15000,
            probability: 15,
            stage: 'lead',
            expectedCloseDate: '2024-03-15',
            daysInStage: 5,
            source: 'whatsapp',
            assignedTo: 'Carlos Vendedor',
            lastActivity: '2024-01-14',
            notes: 'Muy interesados en funcionalidades avanzadas'
          },
          {
            id: '2',
            title: 'Consultoría Digital StartupX',
            contactName: 'Luis Martín',
            contactEmail: 'luis@startupx.com',
            company: 'StartupX',
            value: 8500,
            probability: 12,
            stage: 'lead',
            expectedCloseDate: '2024-02-28',
            daysInStage: 12,
            source: 'web',
            assignedTo: 'Ana Comercial',
            lastActivity: '2024-01-13',
            notes: 'Startup en crecimiento, presupuesto limitado'
          }
        ]
      },
      {
        id: 'qualified',
        name: 'Lead Calificado',
        order: 2,
        probability: 25,
        color: 'bg-blue-500',
        deals: [
          {
            id: '3',
            title: 'Automatización InnovaTech',
            contactName: 'Sofia Herrera',
            contactEmail: 'sofia@innovatech.es',
            company: 'InnovaTech Labs',
            value: 22000,
            probability: 30,
            stage: 'qualified',
            expectedCloseDate: '2024-02-20',
            daysInStage: 8,
            source: 'referral',
            assignedTo: 'Carlos Vendedor',
            lastActivity: '2024-01-15',
            notes: 'Demo programada para la próxima semana'
          }
        ]
      },
      {
        id: 'proposal',
        name: 'Propuesta Enviada',
        order: 3,
        probability: 50,
        color: 'bg-yellow-500',
        deals: [
          {
            id: '4',
            title: 'Solución Enterprise GlobalCorp',
            contactName: 'Roberto Silva',
            contactEmail: 'roberto@globalcorp.com',
            company: 'GlobalCorp Ltd',
            value: 45000,
            probability: 60,
            stage: 'proposal',
            expectedCloseDate: '2024-02-10',
            daysInStage: 15,
            source: 'linkedin',
            assignedTo: 'Ana Comercial',
            lastActivity: '2024-01-12',
            notes: 'Evaluando propuesta, decisión en 2 semanas'
          },
          {
            id: '5',
            title: 'Integración API MediaCorp',
            contactName: 'Carmen López',
            contactEmail: 'carmen@mediacorp.es',
            company: 'MediaCorp España',
            value: 12000,
            probability: 45,
            stage: 'proposal',
            expectedCloseDate: '2024-03-01',
            daysInStage: 7,
            source: 'event',
            assignedTo: 'Carlos Vendedor',
            lastActivity: '2024-01-14',
            notes: 'Requieren integración con sistemas existentes'
          }
        ]
      },
      {
        id: 'negotiation',
        name: 'Negociación',
        order: 4,
        probability: 75,
        color: 'bg-orange-500',
        deals: [
          {
            id: '6',
            title: 'Plataforma E-commerce RetailPlus',
            contactName: 'Diego Morales',
            contactEmail: 'diego@retailplus.com',
            company: 'RetailPlus',
            value: 32000,
            probability: 80,
            stage: 'negotiation',
            expectedCloseDate: '2024-01-25',
            daysInStage: 4,
            source: 'cold_call',
            assignedTo: 'Ana Comercial',
            lastActivity: '2024-01-15',
            notes: 'Negociando términos de pago y soporte'
          }
        ]
      },
      {
        id: 'closed_won',
        name: 'Cerrado Ganado',
        order: 5,
        probability: 100,
        color: 'bg-green-500',
        deals: [
          {
            id: '7',
            title: 'Sistema CRM FinanceFirst',
            contactName: 'Patricia Ruiz',
            contactEmail: 'patricia@financefirst.com',
            company: 'FinanceFirst',
            value: 28000,
            probability: 100,
            stage: 'closed_won',
            expectedCloseDate: '2024-01-10',
            daysInStage: 1,
            source: 'referral',
            assignedTo: 'Carlos Vendedor',
            lastActivity: '2024-01-15',
            notes: 'Contrato firmado, implementación iniciada'
          }
        ]
      },
      {
        id: 'closed_lost',
        name: 'Cerrado Perdido',
        order: 6,
        probability: 0,
        color: 'bg-red-500',
        deals: [
          {
            id: '8',
            title: 'Proyecto CloudServices',
            contactName: 'Manuel García',
            contactEmail: 'manuel@cloudservices.com',
            company: 'CloudServices Pro',
            value: 18000,
            probability: 0,
            stage: 'closed_lost',
            expectedCloseDate: '2024-01-05',
            daysInStage: 2,
            source: 'web',
            assignedTo: 'Ana Comercial',
            lastActivity: '2024-01-13',
            notes: 'Eligieron competidor por precio'
          }
        ]
      }
    ]
  });

  const moveDealMutation = useMutation({
    mutationFn: async ({ dealId, newStage }: { dealId: string; newStage: string }) => {
      return apiRequest('PATCH', `/api/crm/deals/${dealId}`, { stage: newStage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/pipeline-stages'] });
      toast({
        title: "Deal actualizado",
        description: "El deal se ha movido a la nueva etapa.",
      });
    }
  });

  const getAllDeals = () => {
    return pipelineStages.flatMap((stage: PipelineStage) => stage.deals);
  };

  const getTotalPipelineValue = () => {
    return getAllDeals()
      .filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage))
      .reduce((sum, deal) => sum + deal.value, 0);
  };

  const getWeightedPipelineValue = () => {
    return getAllDeals()
      .filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage))
      .reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
  };

  const getWinRate = () => {
    const closedDeals = getAllDeals().filter(deal => 
      ['closed_won', 'closed_lost'].includes(deal.stage)
    );
    const wonDeals = closedDeals.filter(deal => deal.stage === 'closed_won');
    return closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;
  };

  const getAverageDealSize = () => {
    const deals = getAllDeals().filter(deal => deal.stage === 'closed_won');
    return deals.length > 0 ? deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length : 0;
  };

  const getSalesVelocity = () => {
    const activeDeals = getAllDeals().filter(deal => 
      !['closed_won', 'closed_lost'].includes(deal.stage)
    );
    const avgDaysInPipeline = activeDeals.length > 0 
      ? activeDeals.reduce((sum, deal) => sum + deal.daysInStage, 0) / activeDeals.length 
      : 0;
    return avgDaysInPipeline;
  };

  const getStageColor = (color: string) => {
    return color.replace('bg-', 'text-').replace('-500', '-600');
  };

  const filteredDeals = getAllDeals().filter(deal => {
    if (filterBy === 'all') return true;
    if (filterBy === 'high_value') return deal.value >= 20000;
    if (filterBy === 'closing_soon') {
      const closeDate = new Date(deal.expectedCloseDate);
      const today = new Date();
      const daysUntilClose = Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return daysUntilClose <= 30;
    }
    if (filterBy === 'overdue') {
      const closeDate = new Date(deal.expectedCloseDate);
      const today = new Date();
      return closeDate < today && !['closed_won', 'closed_lost'].includes(deal.stage);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Ventas</h1>
          <p className="text-gray-600">Gestiona y optimiza tu proceso de ventas</p>
        </div>
        <div className="flex space-x-2">
          <select
            className="p-2 border rounded-md"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">Todos los deals</option>
            <option value="high_value">Alto valor mayor a 20k euros</option>
            <option value="closing_soon">Cierran pronto (menos de 30 días)</option>
            <option value="overdue">Vencidos</option>
          </select>
          <Button
            variant={activeView === 'pipeline' ? 'default' : 'outline'}
            onClick={() => setActiveView('pipeline')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Pipeline
          </Button>
          <Button
            variant={activeView === 'deals' ? 'default' : 'outline'}
            onClick={() => setActiveView('deals')}
          >
            <Target className="w-4 h-4 mr-2" />
            Deals
          </Button>
          <Button
            variant={activeView === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveView('analytics')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Pipeline</p>
                <p className="text-xl font-bold">€{getTotalPipelineValue().toLocaleString()}</p>
              </div>
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Ponderado</p>
                <p className="text-xl font-bold text-green-600">€{Math.round(getWeightedPipelineValue()).toLocaleString()}</p>
              </div>
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa de Cierre</p>
                <p className="text-xl font-bold text-purple-600">{Math.round(getWinRate())}%</p>
              </div>
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deal Promedio</p>
                <p className="text-xl font-bold text-orange-600">€{Math.round(getAverageDealSize()).toLocaleString()}</p>
              </div>
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Velocidad (días)</p>
                <p className="text-xl font-bold text-red-600">{Math.round(getSalesVelocity())}</p>
              </div>
              <Clock className="w-6 h-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {activeView === 'pipeline' && (
        <div className="space-y-6">
          {/* Pipeline Stages */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {pipelineStages.map((stage: PipelineStage) => (
              <Card key={stage.id} className="min-h-[400px]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-sm font-semibold ${getStageColor(stage.color)}`}>
                      {stage.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {stage.probability}%
                    </Badge>
                  </div>
                  <CardDescription>
                    {stage.deals.length} deals • €{stage.deals.reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stage.deals.map((deal: Deal) => (
                    <div
                      key={deal.id}
                      className="p-3 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedStage(deal.id)}
                    >
                      <h4 className="font-medium text-sm mb-1">{deal.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{deal.contactName}</p>
                      <p className="text-xs text-gray-600 mb-2">{deal.company}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-green-600">
                          €{deal.value.toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {deal.daysInStage}d
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <Progress value={deal.probability} className="h-1" />
                      </div>
                    </div>
                  ))}
                  
                  {stage.deals.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Target className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Sin deals</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeView === 'deals' && (
        <div className="space-y-6">
          {/* Deals List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Deals</CardTitle>
              <CardDescription>
                Gestiona todos los deals en tu pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDeals.map((deal: Deal) => {
                  const stage = pipelineStages.find(s => s.id === deal.stage);
                  return (
                    <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${stage?.color}`}></div>
                        <div>
                          <h3 className="font-medium">{deal.title}</h3>
                          <p className="text-sm text-gray-600">{deal.contactName} - {deal.company}</p>
                          <p className="text-xs text-gray-500">
                            Asignado a: {deal.assignedTo} • Última actividad: {new Date(deal.lastActivity).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-green-600">€{deal.value.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{deal.probability}% probabilidad</p>
                          <p className="text-xs text-gray-500">
                            Cierre: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <Badge className={`${getStageColor(stage?.color || 'bg-gray-500')}`}>
                          {stage?.name}
                        </Badge>
                        
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversión por Etapa</CardTitle>
                <CardDescription>
                  Análisis de conversión entre etapas del pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Gráfico de Conversión</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Ventas</CardTitle>
                <CardDescription>
                  Evolución del pipeline en el tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Gráfico de Tendencias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Performance</CardTitle>
              <CardDescription>
                Métricas clave del pipeline este mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg">Ingresos del Mes</h3>
                  <p className="text-2xl font-bold text-green-600">€28,000</p>
                  <p className="text-sm text-gray-600">+15% vs mes anterior</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg">Deals Cerrados</h3>
                  <p className="text-2xl font-bold text-blue-600">3</p>
                  <p className="text-sm text-gray-600">Meta: 5 deals</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg">Ciclo Promedio</h3>
                  <p className="text-2xl font-bold text-purple-600">42 días</p>
                  <p className="text-sm text-gray-600">-8 días vs promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}