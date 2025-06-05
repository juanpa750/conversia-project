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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Edit,
  Eye,
  Filter,
  BarChart3,
  Percent
} from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  position: number;
  probability: number;
  deals: Deal[];
  totalValue: number;
  color: string;
}

interface Deal {
  id: string;
  title: string;
  company: string;
  contact: string;
  value: number;
  probability: number;
  createdAt: string;
  expectedCloseDate: string;
  daysInStage: number;
  source: string;
  priority: 'high' | 'medium' | 'low';
}

const mockPipelineStages: PipelineStage[] = [
  {
    id: '1',
    name: 'Prospecto',
    position: 1,
    probability: 10,
    color: 'bg-gray-500',
    totalValue: 45000,
    deals: [
      {
        id: '1',
        title: 'Sistema CRM Empresa ABC',
        company: 'ABC Corp',
        contact: 'Juan Pérez',
        value: 25000,
        probability: 10,
        createdAt: '2024-01-10',
        expectedCloseDate: '2024-03-15',
        daysInStage: 5,
        source: 'WhatsApp',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Chatbot E-commerce XYZ',
        company: 'XYZ Store',
        contact: 'María García',
        value: 20000,
        probability: 15,
        createdAt: '2024-01-12',
        expectedCloseDate: '2024-02-28',
        daysInStage: 3,
        source: 'Web',
        priority: 'medium'
      }
    ]
  },
  {
    id: '2',
    name: 'Calificado',
    position: 2,
    probability: 25,
    color: 'bg-blue-500',
    totalValue: 67000,
    deals: [
      {
        id: '3',
        title: 'Automatización Restaurante',
        company: 'Restaurante Bella Vista',
        contact: 'Carlos Ruiz',
        value: 35000,
        probability: 25,
        createdAt: '2024-01-08',
        expectedCloseDate: '2024-02-20',
        daysInStage: 7,
        source: 'Referido',
        priority: 'high'
      },
      {
        id: '4',
        title: 'Bot Servicio al Cliente',
        company: 'TechSolutions',
        contact: 'Ana López',
        value: 32000,
        probability: 30,
        createdAt: '2024-01-05',
        expectedCloseDate: '2024-03-01',
        daysInStage: 10,
        source: 'LinkedIn',
        priority: 'medium'
      }
    ]
  },
  {
    id: '3',
    name: 'Propuesta',
    position: 3,
    probability: 50,
    color: 'bg-yellow-500',
    totalValue: 89000,
    deals: [
      {
        id: '5',
        title: 'Sistema Integral Clínica',
        company: 'Clínica San José',
        contact: 'Dr. Fernández',
        value: 50000,
        probability: 60,
        createdAt: '2023-12-28',
        expectedCloseDate: '2024-01-25',
        daysInStage: 18,
        source: 'WhatsApp',
        priority: 'high'
      },
      {
        id: '6',
        title: 'Bot Inmobiliaria',
        company: 'Inmuebles Premium',
        contact: 'Laura Martín',
        value: 39000,
        probability: 45,
        createdAt: '2023-12-30',
        expectedCloseDate: '2024-02-10',
        daysInStage: 16,
        source: 'Web',
        priority: 'medium'
      }
    ]
  },
  {
    id: '4',
    name: 'Negociación',
    position: 4,
    probability: 75,
    color: 'bg-orange-500',
    totalValue: 72000,
    deals: [
      {
        id: '7',
        title: 'Chatbot Banco Regional',
        company: 'Banco Regional',
        contact: 'Roberto Silva',
        value: 72000,
        probability: 80,
        createdAt: '2023-12-15',
        expectedCloseDate: '2024-01-30',
        daysInStage: 31,
        source: 'Cold Call',
        priority: 'high'
      }
    ]
  },
  {
    id: '5',
    name: 'Ganado',
    position: 5,
    probability: 100,
    color: 'bg-green-500',
    totalValue: 128000,
    deals: [
      {
        id: '8',
        title: 'Sistema Hotel Boutique',
        company: 'Hotel Boutique Plaza',
        contact: 'Carmen Vega',
        value: 45000,
        probability: 100,
        createdAt: '2023-11-20',
        expectedCloseDate: '2024-01-15',
        daysInStage: 0,
        source: 'Referido',
        priority: 'high'
      },
      {
        id: '9',
        title: 'E-commerce Automatización',
        company: 'ShopOnline',
        contact: 'Miguel Torres',
        value: 83000,
        probability: 100,
        createdAt: '2023-12-01',
        expectedCloseDate: '2024-01-12',
        daysInStage: 0,
        source: 'WhatsApp',
        priority: 'high'
      }
    ]
  }
];

export default function SalesPipelinePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'pipeline' | 'list' | 'analytics'>('pipeline');

  // Simulated API calls
  const { data: pipelineStages = mockPipelineStages, isLoading } = useQuery({
    queryKey: ['/api/sales-pipeline'],
    queryFn: () => Promise.resolve(mockPipelineStages)
  });

  const moveDeal = useMutation({
    mutationFn: async ({ dealId, newStageId }: { dealId: string; newStageId: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-pipeline'] });
      toast({
        title: "Deal movido exitosamente",
        description: "El deal ha sido movido a la nueva etapa.",
      });
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPipelineValue = pipelineStages.reduce((sum, stage) => sum + stage.totalValue, 0);
  const totalDeals = pipelineStages.reduce((sum, stage) => sum + stage.deals.length, 0);
  const averageDealValue = totalDeals > 0 ? totalPipelineValue / totalDeals : 0;
  const weightedPipelineValue = pipelineStages.reduce((sum, stage) => 
    sum + (stage.totalValue * stage.probability / 100), 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Ventas</h1>
          <p className="text-gray-600">Gestión avanzada del embudo de ventas con métricas en tiempo real</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Deal
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">${totalPipelineValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Ponderado</p>
                <p className="text-2xl font-bold text-gray-900">${weightedPipelineValue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Por probabilidad</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold text-gray-900">{totalDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Promedio</p>
                <p className="text-2xl font-bold text-gray-900">${averageDealValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'pipeline', label: 'Vista Pipeline' },
            { id: 'list', label: 'Vista Lista' },
            { id: 'analytics', label: 'Analíticas' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                viewMode === tab.id
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
      {viewMode === 'pipeline' && (
        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-4" style={{ minWidth: '1200px' }}>
            {pipelineStages.map((stage) => (
              <div key={stage.id} className="flex-1 min-w-72">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                        <CardTitle className="text-lg">{stage.name}</CardTitle>
                      </div>
                      <Badge variant="outline">{stage.deals.length}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>${stage.totalValue.toLocaleString()} • {stage.probability}% prob.</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stage.deals.map((deal) => (
                      <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{deal.title}</h4>
                              <Badge className={getPriorityColor(deal.priority)} variant="outline">
                                {deal.priority}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-gray-600">{deal.company}</p>
                            <p className="text-xs text-gray-600">{deal.contact}</p>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-green-600">${deal.value.toLocaleString()}</span>
                              <span className="text-xs text-gray-500">{deal.daysInStage}d</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{deal.source}</span>
                              <span>{deal.expectedCloseDate}</span>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                              <Progress value={deal.probability} className="flex-1 h-1.5" />
                              <span className="text-xs text-gray-500 ml-2">{deal.probability}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etapa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Probabilidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días en Etapa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pipelineStages.flatMap(stage => 
                  stage.deals.map(deal => (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                          <div className="text-sm text-gray-500">{deal.contact}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deal.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${deal.value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${pipelineStages.find(s => s.deals.some(d => d.id === deal.id))?.color.replace('bg-', 'bg-opacity-20 bg-')} text-gray-800`}>
                          {pipelineStages.find(s => s.deals.some(d => d.id === deal.id))?.name}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Progress value={deal.probability} className="w-16 h-2 mr-2" />
                          <span className="text-sm text-gray-600">{deal.probability}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deal.daysInStage} días
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversión por Etapa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineStages.map((stage, index) => {
                    const prevStage = index > 0 ? pipelineStages[index - 1] : null;
                    const conversionRate = prevStage ? 
                      ((stage.deals.length / prevStage.deals.length) * 100) : 100;
                    
                    return (
                      <div key={stage.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stage.name}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={conversionRate} className="w-24 h-2" />
                          <span className="text-sm text-gray-600">{conversionRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tiempo Promedio por Etapa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineStages.map((stage) => {
                    const avgDays = stage.deals.length > 0 ? 
                      stage.deals.reduce((sum, deal) => sum + deal.daysInStage, 0) / stage.deals.length : 0;
                    
                    return (
                      <div key={stage.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stage.name}</span>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{avgDays.toFixed(1)} días</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}