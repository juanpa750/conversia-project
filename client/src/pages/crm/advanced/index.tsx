import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Workflow,
  BarChart3,
  Settings,
  Database,
  Filter,
  Search,
  Download,
  Upload,
  ArrowRight,
  Star,
  Calendar,
  Clock,
  DollarSign,
  Phone,
  Mail,
  MessageSquare,
  Activity,
  Zap,
  Brain,
  PieChart,
  LineChart
} from 'lucide-react';

interface CRMModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'beta' | 'coming_soon';
  features: string[];
  configPath: string;
  explorePath: string;
  color: string;
  metrics?: {
    value: number;
    label: string;
    change?: number;
  }[];
}

const crmModules: CRMModule[] = [
  {
    id: 'contact-scoring',
    title: 'Puntuación de Contactos',
    description: 'Sistema inteligente de puntuación automática basado en comportamiento, demografía y engagement',
    icon: <TrendingUp className="w-6 h-6" />,
    status: 'active',
    features: [
      'Algoritmo de machine learning adaptativo',
      'Puntuación en tiempo real',
      'Reglas personalizables por industria',
      'Integración con WhatsApp Business',
      'Alertas automáticas de leads calientes',
      'Historial de puntuación completo'
    ],
    configPath: '/crm/advanced/contact-scoring',
    explorePath: '/crm/advanced/contact-scoring',
    color: 'bg-blue-500',
    metrics: [
      { value: 234, label: 'Leads Calificados', change: 12 },
      { value: 89, label: 'Score Promedio', change: 5 },
      { value: 23, label: 'Conversiones Hot', change: 18 }
    ]
  },
  {
    id: 'sales-pipeline',
    title: 'Pipeline de Ventas',
    description: 'Gestión avanzada del embudo de ventas con automatización y predicciones de cierre',
    icon: <Target className="w-6 h-6" />,
    status: 'active',
    features: [
      'Etapas personalizables del pipeline',
      'Predicción de probabilidad de cierre',
      'Automatización de seguimientos',
      'Análisis de tiempo en cada etapa',
      'Reportes de velocidad de ventas',
      'Integración con CRM externo'
    ],
    configPath: '/crm/advanced/sales-pipeline',
    explorePath: '/crm/advanced/sales-pipeline',
    color: 'bg-green-500',
    metrics: [
      { value: 156, label: 'Oportunidades Activas', change: 8 },
      { value: 67, label: 'Tasa de Conversión %', change: 3 },
      { value: 45, label: 'Días Promedio Cierre', change: -7 }
    ]
  },
  {
    id: 'customer-segmentation',
    title: 'Segmentación de Clientes',
    description: 'Segmentación inteligente basada en RFM, comportamiento y valor de vida del cliente',
    icon: <Users className="w-6 h-6" />,
    status: 'active',
    features: [
      'Análisis RFM automatizado',
      'Segmentos dinámicos por comportamiento',
      'Cálculo de Customer Lifetime Value',
      'Predicción de churn',
      'Campañas dirigidas por segmento',
      'Análisis de cohortes'
    ],
    configPath: '/crm/advanced/relationship-mapping',
    explorePath: '/crm/advanced/relationship-mapping',
    color: 'bg-purple-500',
    metrics: [
      { value: 12, label: 'Segmentos Activos', change: 2 },
      { value: 1847, label: 'CLV Promedio $', change: 15 },
      { value: 5.2, label: 'Riesgo Churn %', change: -1.3 }
    ]
  },
  {
    id: 'automation-workflows',
    title: 'Flujos de Automatización',
    description: 'Workflows inteligentes para nurturing, seguimiento y engagement automatizado',
    icon: <Workflow className="w-6 h-6" />,
    status: 'active',
    features: [
      'Constructor visual de workflows',
      'Triggers basados en eventos',
      'Acciones multi-canal (WhatsApp, Email, SMS)',
      'Condiciones lógicas avanzadas',
      'A/B testing de workflows',
      'Métricas de performance detalladas'
    ],
    configPath: '/crm/advanced/automations',
    explorePath: '/crm/advanced/automations',
    color: 'bg-orange-500',
    metrics: [
      { value: 23, label: 'Workflows Activos', change: 4 },
      { value: 87, label: 'Tasa de Éxito %', change: 6 },
      { value: 1289, label: 'Acciones Ejecutadas', change: 22 }
    ]
  },
  {
    id: 'advanced-reports',
    title: 'Reportes Avanzados',
    description: 'Business Intelligence con dashboards interactivos y análisis predictivo',
    icon: <BarChart3 className="w-6 h-6" />,
    status: 'beta',
    features: [
      'Dashboards personalizables',
      'Análisis predictivo con ML',
      'Reportes programados automáticos',
      'Comparativas período sobre período',
      'Exportación multi-formato',
      'Alertas inteligentes'
    ],
    configPath: '/crm/advanced/advanced-reports/config',
    explorePath: '/crm/advanced/advanced-reports/dashboard',
    color: 'bg-indigo-500',
    metrics: [
      { value: 47, label: 'Reportes Configurados', change: 8 },
      { value: 93, label: 'Precisión Predicciones %', change: 2 },
      { value: 156, label: 'Insights Generados', change: 31 }
    ]
  },
  {
    id: 'api-integrations',
    title: 'Integraciones API',
    description: 'Conectores avanzados con CRMs externos, ERPs y herramientas de marketing',
    icon: <Database className="w-6 h-6" />,
    status: 'active',
    features: [
      'API REST y webhooks',
      'Conectores pre-construidos (Salesforce, HubSpot, Pipedrive)',
      'Sincronización bidireccional',
      'Mapeo de campos personalizable',
      'Logs de sincronización detallados',
      'Manejo de errores robusto'
    ],
    configPath: '/crm/advanced/api-integrations/config',
    explorePath: '/crm/advanced/api-integrations/dashboard',
    color: 'bg-teal-500',
    metrics: [
      { value: 8, label: 'Integraciones Activas', change: 2 },
      { value: 99.7, label: 'Uptime %', change: 0.1 },
      { value: 12450, label: 'Registros Sincronizados', change: 18 }
    ]
  }
];

export default function CRMAdvanced() {
  const [selectedModule, setSelectedModule] = useState<CRMModule>(crmModules[0]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case 'beta':
        return <Badge className="bg-yellow-100 text-yellow-800">Beta</Badge>;
      case 'coming_soon':
        return <Badge className="bg-gray-100 text-gray-800">Próximamente</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CRM Avanzado
        </h1>
        <p className="text-gray-600">
          Herramientas profesionales de Customer Relationship Management con IA y automatización avanzada
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-xs text-green-600">+12% vs mes anterior</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Pipeline</p>
                <p className="text-2xl font-bold">$89,450</p>
                <p className="text-xs text-green-600">+8% vs mes anterior</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa Conversión</p>
                <p className="text-2xl font-bold">23.4%</p>
                <p className="text-xs text-green-600">+3.2% vs mes anterior</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Workflows Activos</p>
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-green-600">+4 nuevos</p>
              </div>
              <Workflow className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {crmModules.map((module) => (
          <Card key={module.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${module.color} text-white`}>
                    {module.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(module.status)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <CardDescription className="text-sm">
                {module.description}
              </CardDescription>

              {/* Metrics */}
              {module.metrics && (
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                  {module.metrics.map((metric, index) => (
                    <div key={index} className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      <p className="text-xs text-gray-600">{metric.label}</p>
                      {metric.change && (
                        <p className={`text-xs ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Features */}
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-2">Características principales:</h4>
                <div className="space-y-1">
                  {module.features.slice(0, 3).map((feature, index) => (
                    <p key={index} className="text-xs text-gray-600 flex items-center gap-2">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {feature}
                    </p>
                  ))}
                  {module.features.length > 3 && (
                    <p className="text-xs text-gray-500">+{module.features.length - 3} características más</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Link href={module.explorePath} className="flex-1">
                  <Button className="w-full">
                    <Activity className="w-4 h-4 mr-2" />
                    Explorar
                  </Button>
                </Link>
                <Link href={module.configPath}>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Brain className="w-8 h-8 text-blue-500" />
              <div className="text-center">
                <p className="font-medium">Análisis IA</p>
                <p className="text-xs text-gray-600">Generar insights automáticos</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Download className="w-8 h-8 text-green-500" />
              <div className="text-center">
                <p className="font-medium">Exportar Datos</p>
                <p className="text-xs text-gray-600">Descargar reportes completos</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-purple-500" />
              <div className="text-center">
                <p className="font-medium">Importar Leads</p>
                <p className="text-xs text-gray-600">Subir datos desde CSV/Excel</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}