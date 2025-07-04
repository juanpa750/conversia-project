import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  TrendingDown, 
  Target, 
  Brain, 
  BarChart3,
  PieChart,
  Calendar,
  Users,
  DollarSign,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PredictiveInsight {
  id: string;
  type: 'conversion' | 'churn' | 'revenue' | 'engagement';
  title: string;
  prediction: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeline: string;
  actions: string[];
  data: any;
}

interface ContactPrediction {
  contactId: number;
  name: string;
  email: string;
  conversionProbability: number;
  churnRisk: number;
  expectedRevenue: number;
  nextBestAction: string;
  riskFactors: string[];
  opportunities: string[];
}

export default function PredictiveAnalysisPage() {
  const [activeTab, setActiveTab] = useState<'insights' | 'contacts' | 'forecasts'>('insights');
  const [timeframe, setTimeframe] = useState('30d');

  // Fetch predictive insights
  const { data: insights = [] } = useQuery({
    queryKey: ['/api/crm/predictive-insights', timeframe],
    initialData: [
      {
        id: '1',
        type: 'conversion' as const,
        title: 'Incremento en Conversiones',
        prediction: 'Se espera un aumento del 23% en conversiones en los próximos 30 días',
        confidence: 87,
        impact: 'high' as const,
        timeline: '30 días',
        actions: [
          'Enfocar esfuerzos en contactos con score >70',
          'Implementar seguimiento automático',
          'Optimizar mensajes de bienvenida'
        ],
        data: { current: 156, predicted: 192, increase: 23 }
      },
      {
        id: '2',
        type: 'churn' as const,
        title: 'Riesgo de Abandono',
        prediction: '12 contactos tienen alto riesgo de abandono esta semana',
        confidence: 92,
        impact: 'high' as const,
        timeline: '7 días',
        actions: [
          'Contacto personalizado inmediato',
          'Ofrecer incentivos especiales',
          'Revisar experiencia del cliente'
        ],
        data: { atRisk: 12, totalContacts: 847, percentage: 1.4 }
      },
      {
        id: '3',
        type: 'revenue' as const,
        title: 'Proyección de Ingresos',
        prediction: 'Ingresos potenciales de €45,230 en el próximo trimestre',
        confidence: 78,
        impact: 'medium' as const,
        timeline: '90 días',
        actions: [
          'Priorizar leads calificados',
          'Acelerar ciclos de venta',
          'Expandir ofertas de servicios'
        ],
        data: { projected: 45230, current: 38950, growth: 16.1 }
      },
      {
        id: '4',
        type: 'engagement' as const,
        title: 'Engagement de Contactos',
        prediction: 'El engagement aumentará 15% con optimizaciones de horarios',
        confidence: 83,
        impact: 'medium' as const,
        timeline: '14 días',
        actions: [
          'Ajustar horarios de envío',
          'Personalizar contenido',
          'Segmentar audiencias'
        ],
        data: { currentRate: 34, optimizedRate: 39, improvement: 15 }
      }
    ]
  });

  // Fetch contact predictions
  const { data: contactPredictions = [] } = useQuery({
    queryKey: ['/api/crm/contact-predictions'],
    initialData: [
      {
        contactId: 1,
        name: 'María González',
        email: 'maria@techcorp.com',
        conversionProbability: 89,
        churnRisk: 15,
        expectedRevenue: 12500,
        nextBestAction: 'Programar demo personalizada',
        riskFactors: ['Baja actividad reciente', 'No respondió último follow-up'],
        opportunities: ['Alto score de engagement', 'Empresa en crecimiento', 'Budget confirmado']
      },
      {
        contactId: 2,
        name: 'Carlos Ruiz',
        email: 'carlos@innovatech.es',
        conversionProbability: 72,
        churnRisk: 8,
        expectedRevenue: 8750,
        nextBestAction: 'Enviar propuesta comercial',
        riskFactors: ['Competencia activa'],
        opportunities: ['Decisor principal', 'Timeline definido', 'Referencias positivas']
      },
      {
        contactId: 3,
        name: 'Ana López',
        email: 'ana@startup.com',
        conversionProbability: 45,
        churnRisk: 62,
        expectedRevenue: 3200,
        nextBestAction: 'Llamada de retención urgente',
        riskFactors: ['No responde mensajes', 'Reducción de actividad', 'Menciones de alternativas'],
        opportunities: ['Histórico positivo', 'Referido por cliente']
      }
    ]
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'conversion': return <Target className="w-5 h-5" />;
      case 'churn': return <AlertTriangle className="w-5 h-5" />;
      case 'revenue': return <DollarSign className="w-5 h-5" />;
      case 'engagement': return <Users className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'conversion': return 'bg-green-100 text-green-800 border-green-200';
      case 'churn': return 'bg-red-100 text-red-800 border-red-200';
      case 'revenue': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'engagement': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-600 bg-red-50';
    if (risk >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis Predictivo</h1>
          <p className="text-gray-600">Insights impulsados por IA para optimizar tu estrategia CRM</p>
        </div>
        <div className="flex space-x-2">
          <select
            className="p-2 border rounded-md"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
          <Button
            variant={activeTab === 'insights' ? 'default' : 'outline'}
            onClick={() => setActiveTab('insights')}
          >
            <Brain className="w-4 h-4 mr-2" />
            Insights
          </Button>
          <Button
            variant={activeTab === 'contacts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('contacts')}
          >
            <Users className="w-4 h-4 mr-2" />
            Contactos
          </Button>
          <Button
            variant={activeTab === 'forecasts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('forecasts')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Pronósticos
          </Button>
        </div>
      </div>

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Precisión IA</p>
                    <p className="text-2xl font-bold text-green-600">94.2%</p>
                  </div>
                  <Brain className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Insights Activos</p>
                    <p className="text-2xl font-bold">{insights.length}</p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Alto Impacto</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {insights.filter(i => i.impact === 'high').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Acciones Pendientes</p>
                    <p className="text-2xl font-bold text-purple-600">12</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Predictive Insights */}
          <div className="space-y-4">
            {insights.map((insight: PredictiveInsight) => (
              <Card key={insight.id} className={`border-l-4 ${getInsightColor(insight.type)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{insight.title}</h3>
                        <p className="text-gray-600">{insight.prediction}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact === 'high' ? 'Alto Impacto' : 
                         insight.impact === 'medium' ? 'Impacto Medio' : 'Bajo Impacto'}
                      </Badge>
                      <Badge variant="outline">{insight.timeline}</Badge>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Confianza</span>
                      <span className={`text-sm font-bold ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}%
                      </span>
                    </div>
                    <Progress value={insight.confidence} className="h-2" />
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Acciones Recomendadas:</h4>
                    <ul className="space-y-1">
                      {insight.actions.map((action, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-6">
          {/* Contact Predictions */}
          <Card>
            <CardHeader>
              <CardTitle>Predicciones por Contacto</CardTitle>
              <CardDescription>
                Análisis predictivo individual para cada contacto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {contactPredictions.map((contact: ContactPrediction) => (
                  <div key={contact.contactId} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{contact.name}</h3>
                        <p className="text-gray-600">{contact.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Ingresos Esperados</p>
                        <p className="text-xl font-bold text-green-600">
                          €{contact.expectedRevenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Probabilidad de Conversión</span>
                          <span className="text-sm font-bold text-green-600">
                            {contact.conversionProbability}%
                          </span>
                        </div>
                        <Progress value={contact.conversionProbability} className="h-3 mb-4" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Riesgo de Abandono</span>
                          <span className={`text-sm font-bold ${getRiskColor(contact.churnRisk).split(' ')[0]}`}>
                            {contact.churnRisk}%
                          </span>
                        </div>
                        <Progress 
                          value={contact.churnRisk} 
                          className="h-3 mb-4"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Próxima Mejor Acción
                      </h4>
                      <p className="text-sm bg-blue-50 text-blue-800 p-3 rounded-lg">
                        {contact.nextBestAction}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Factores de Riesgo
                        </h4>
                        <ul className="space-y-1">
                          {contact.riskFactors.map((factor, index) => (
                            <li key={index} className="text-sm text-red-600 flex items-center">
                              <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-green-600 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Oportunidades
                        </h4>
                        <ul className="space-y-1">
                          {contact.opportunities.map((opportunity, index) => (
                            <li key={index} className="text-sm text-green-600 flex items-center">
                              <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                              {opportunity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'forecasts' && (
        <div className="space-y-6">
          {/* Revenue Forecast */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pronóstico de Ingresos
                </CardTitle>
                <CardDescription>
                  Proyección de ingresos para los próximos meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Gráfico de Pronóstico de Ingresos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Distribución de Conversiones
                </CardTitle>
                <CardDescription>
                  Predicción de conversiones por canal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Gráfico de Distribución</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Forecast Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Pronósticos</CardTitle>
              <CardDescription>
                Métricas clave proyectadas para el próximo trimestre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg">Crecimiento Esperado</h3>
                  <p className="text-2xl font-bold text-green-600">+24.5%</p>
                  <p className="text-sm text-gray-600">vs trimestre anterior</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg">Nuevos Clientes</h3>
                  <p className="text-2xl font-bold text-blue-600">127</p>
                  <p className="text-sm text-gray-600">conversiones proyectadas</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg">Valor Promedio</h3>
                  <p className="text-2xl font-bold text-purple-600">€2,840</p>
                  <p className="text-sm text-gray-600">por cliente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}