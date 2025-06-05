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
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Users,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';

interface Prediction {
  id: string;
  type: 'churn_risk' | 'conversion_probability' | 'revenue_forecast' | 'lifetime_value';
  title: string;
  description: string;
  probability: number;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  factors: PredictionFactor[];
  recommendations: string[];
  createdAt: string;
}

interface PredictionFactor {
  name: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  value: string;
}

interface ModelMetrics {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  status: 'active' | 'training' | 'outdated';
}

const mockPredictions: Prediction[] = [
  {
    id: '1',
    type: 'churn_risk',
    title: 'Riesgo de Abandono - TechCorp Solutions',
    description: 'Cliente con alta probabilidad de cancelar servicios en los próximos 30 días',
    probability: 78,
    confidence: 85,
    impact: 'high',
    timeframe: '30 días',
    factors: [
      { name: 'Reducción en engagement', weight: 0.35, impact: 'negative', value: '-45% vs mes anterior' },
      { name: 'Tickets de soporte aumentados', weight: 0.25, impact: 'negative', value: '+67% vs promedio' },
      { name: 'Tiempo sin contacto', weight: 0.20, impact: 'negative', value: '15 días sin interacción' },
      { name: 'Satisfacción reportada', weight: 0.20, impact: 'negative', value: '2.3/5 última encuesta' }
    ],
    recommendations: [
      'Contactar inmediatamente al cliente para entender sus preocupaciones',
      'Ofrecer sesión de consultoría gratuita para optimizar uso del servicio',
      'Asignar account manager dedicado para próximos 60 días',
      'Proporcionar descuento temporal para retener cliente'
    ],
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'conversion_probability',
    title: 'Probabilidad de Conversión - InnovaTech',
    description: 'Prospecto con alta probabilidad de convertirse en cliente',
    probability: 82,
    confidence: 92,
    impact: 'high',
    timeframe: '14 días',
    factors: [
      { name: 'Engagement con contenido', weight: 0.30, impact: 'positive', value: '15 recursos descargados' },
      { name: 'Tiempo en sitio web', weight: 0.25, impact: 'positive', value: '23 minutos promedio' },
      { name: 'Interacciones WhatsApp', weight: 0.25, impact: 'positive', value: '8 conversaciones activas' },
      { name: 'Perfil de empresa objetivo', weight: 0.20, impact: 'positive', value: 'Match 95% ICP' }
    ],
    recommendations: [
      'Enviar propuesta personalizada en próximas 48 horas',
      'Agendar demo del producto específico para su industria',
      'Incluir case study de cliente similar en propuesta',
      'Ofrecer prueba gratuita de 30 días'
    ],
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    type: 'lifetime_value',
    title: 'Valor de Vida Proyectado - Restaurante Bella Vista',
    description: 'Cliente con potencial de alto valor a largo plazo',
    probability: 91,
    confidence: 88,
    impact: 'medium',
    timeframe: '24 meses',
    factors: [
      { name: 'Crecimiento de negocio', weight: 0.35, impact: 'positive', value: '+30% revenue anual' },
      { name: 'Adopción de servicios', weight: 0.30, impact: 'positive', value: '85% features utilizadas' },
      { name: 'Satisfacción del cliente', weight: 0.20, impact: 'positive', value: '4.8/5 rating promedio' },
      { name: 'Referidos generados', weight: 0.15, impact: 'positive', value: '3 nuevos clientes' }
    ],
    recommendations: [
      'Proponer upgrade a plan premium con descuento',
      'Ofrecer servicios adicionales de consultoría',
      'Invitar a programa de referidos con incentivos',
      'Considerar para programa de clientes VIP'
    ],
    createdAt: '2024-01-15T08:45:00Z'
  }
];

const mockModelMetrics: ModelMetrics[] = [
  {
    id: '1',
    name: 'Churn Prediction Model',
    type: 'Classification',
    accuracy: 89.5,
    precision: 87.2,
    recall: 91.8,
    f1Score: 89.4,
    lastTrained: '2024-01-10T14:30:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Lead Scoring Model',
    type: 'Regression',
    accuracy: 92.1,
    precision: 90.5,
    recall: 93.7,
    f1Score: 92.1,
    lastTrained: '2024-01-12T09:15:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Revenue Forecasting Model',
    type: 'Time Series',
    accuracy: 85.3,
    precision: 83.9,
    recall: 87.1,
    f1Score: 85.5,
    lastTrained: '2024-01-08T16:45:00Z',
    status: 'outdated'
  }
];

export default function PredictiveAnalysisPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'predictions' | 'models' | 'insights'>('predictions');
  const [selectedPredictionType, setSelectedPredictionType] = useState<string>('all');

  const { data: predictions = mockPredictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ['/api/predictions'],
    queryFn: () => Promise.resolve(mockPredictions)
  });

  const { data: modelMetrics = mockModelMetrics, isLoading: modelsLoading } = useQuery({
    queryKey: ['/api/ml-models'],
    queryFn: () => Promise.resolve(mockModelMetrics)
  });

  const refreshPredictions = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/predictions'] });
      toast({
        title: "Predicciones actualizadas",
        description: "Se han recalculado todas las predicciones con los datos más recientes.",
      });
    }
  });

  const retrainModel = useMutation({
    mutationFn: async (modelId: string) => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ml-models'] });
      toast({
        title: "Modelo reentrenado",
        description: "El modelo ha sido reentrenado con los datos más recientes.",
      });
    }
  });

  const getPredictionTypeIcon = (type: string) => {
    switch (type) {
      case 'churn_risk': return <AlertTriangle className="w-5 h-5" />;
      case 'conversion_probability': return <Target className="w-5 h-5" />;
      case 'revenue_forecast': return <DollarSign className="w-5 h-5" />;
      case 'lifetime_value': return <TrendingUp className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getPredictionTypeLabel = (type: string) => {
    switch (type) {
      case 'churn_risk': return 'Riesgo de Abandono';
      case 'conversion_probability': return 'Probabilidad de Conversión';
      case 'revenue_forecast': return 'Proyección de Revenue';
      case 'lifetime_value': return 'Valor de Vida';
      default: return type;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFactorImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'outdated': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPredictions = predictions.filter(pred => 
    selectedPredictionType === 'all' || pred.type === selectedPredictionType
  );

  const totalPredictions = predictions.length;
  const highImpactPredictions = predictions.filter(p => p.impact === 'high').length;
  const avgConfidence = predictions.reduce((sum, pred) => sum + pred.confidence, 0) / predictions.length;
  const activeModels = modelMetrics.filter(m => m.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis Predictivo</h1>
          <p className="text-gray-600">Insights y predicciones basadas en IA para optimizar tu CRM</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => refreshPredictions.mutate()}
            disabled={refreshPredictions.isPending}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {refreshPredictions.isPending ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configurar Modelos
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Predicciones Activas</p>
                <p className="text-2xl font-bold text-gray-900">{totalPredictions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alto Impacto</p>
                <p className="text-2xl font-bold text-gray-900">{highImpactPredictions}</p>
                <p className="text-xs text-red-600">Requieren atención</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confianza Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{avgConfidence.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Modelos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeModels}</p>
                <p className="text-xs text-green-600">de {modelMetrics.length} total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'predictions', label: 'Predicciones' },
            { id: 'models', label: 'Modelos ML' },
            { id: 'insights', label: 'Insights' }
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
      {activeTab === 'predictions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex space-x-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={selectedPredictionType}
              onChange={(e) => setSelectedPredictionType(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="churn_risk">Riesgo de Abandono</option>
              <option value="conversion_probability">Probabilidad de Conversión</option>
              <option value="revenue_forecast">Proyección de Revenue</option>
              <option value="lifetime_value">Valor de Vida</option>
            </select>
          </div>

          {/* Predictions List */}
          <div className="space-y-4">
            {predictionsLoading ? (
              <div className="text-center py-8">Cargando predicciones...</div>
            ) : (
              filteredPredictions.map((prediction) => (
                <Card key={prediction.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getPredictionTypeIcon(prediction.type)}
                        <div>
                          <h3 className="text-lg font-semibold">{prediction.title}</h3>
                          <p className="text-gray-600">{prediction.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getImpactColor(prediction.impact)}>
                          {prediction.impact} impacto
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">{prediction.timeframe}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {/* Probability */}
                      <div>
                        <h4 className="font-medium mb-2">Probabilidad</h4>
                        <div className="flex items-center space-x-2">
                          <Progress value={prediction.probability} className="flex-1" />
                          <span className="text-lg font-bold text-blue-600">{prediction.probability}%</span>
                        </div>
                      </div>

                      {/* Confidence */}
                      <div>
                        <h4 className="font-medium mb-2">Confianza</h4>
                        <div className="flex items-center space-x-2">
                          <Progress value={prediction.confidence} className="flex-1" />
                          <span className="text-lg font-bold text-green-600">{prediction.confidence}%</span>
                        </div>
                      </div>

                      {/* Type */}
                      <div>
                        <h4 className="font-medium mb-2">Tipo</h4>
                        <Badge variant="outline">
                          {getPredictionTypeLabel(prediction.type)}
                        </Badge>
                      </div>
                    </div>

                    {/* Factors */}
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Factores Principales:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prediction.factors.map((factor, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-3">
                            <div>
                              <p className="font-medium">{factor.name}</p>
                              <p className={`text-sm ${getFactorImpactColor(factor.impact)}`}>
                                {factor.value}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Peso: {(factor.weight * 100).toFixed(0)}%</p>
                              <div className={`w-2 h-2 rounded-full ${
                                factor.impact === 'positive' ? 'bg-green-500' : 
                                factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                              }`}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium mb-3">Recomendaciones:</h4>
                      <ul className="space-y-2">
                        {prediction.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="space-y-4">
          {modelsLoading ? (
            <div className="text-center py-8">Cargando modelos...</div>
          ) : (
            modelMetrics.map((model) => (
              <Card key={model.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{model.name}</h3>
                      <p className="text-gray-600">{model.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getModelStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                      {model.status === 'outdated' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => retrainModel.mutate(model.id)}
                          disabled={retrainModel.isPending}
                        >
                          {retrainModel.isPending ? 'Reentrenando...' : 'Reentrenar'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{model.accuracy}%</p>
                      <p className="text-xs text-gray-600">Precisión</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{model.precision}%</p>
                      <p className="text-xs text-gray-600">Precision</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{model.recall}%</p>
                      <p className="text-xs text-gray-600">Recall</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{model.f1Score}%</p>
                      <p className="text-xs text-gray-600">F1 Score</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Último entrenamiento: {new Date(model.lastTrained).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Insights Generales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Predicciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Riesgo de Abandono</span>
                    <span className="font-bold text-red-600">↑ +15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversiones Esperadas</span>
                    <span className="font-bold text-green-600">↑ +8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenue Proyectado</span>
                    <span className="font-bold text-blue-600">↑ +12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Valor de Vida Promedio</span>
                    <span className="font-bold text-purple-600">↑ +5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento de Modelos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modelMetrics.map((model) => (
                    <div key={model.id} className="flex items-center justify-between">
                      <span className="text-sm">{model.name}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={model.accuracy} className="w-16 h-2" />
                        <span className="text-sm font-medium">{model.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}