import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  RiBarChart2Line, 
  RiPieChartLine,
  RiUser3Line,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiShoppingCart2Line,
  RiPercentLine,
  RiListCheck2,
  RiMailLine,
  RiTimeLine,
  RiCalendarLine,
  RiSortAsc,
  RiFilter2Line,
  RiDownload2Line,
  RiRefreshLine
} from "@/lib/icons";
import { Layout } from "@/components/layout/layout";

// Mock data for customer lifetime predictions
const CUSTOMER_PREDICTIONS = [
  {
    id: "1",
    name: "María García López",
    email: "maria.garcia@email.com",
    currentValue: 1580,
    predictedLTV: 3200,
    growthPotential: 102.5,
    churnRisk: 12,
    nextPurchasePrediction: "7-14 días",
    suggestedActions: ["Oferta de fidelización", "Cross-selling productos premium"]
  },
  {
    id: "2",
    name: "Carlos Rodríguez Martínez",
    email: "carlos.rodriguez@email.com",
    currentValue: 450,
    predictedLTV: 1800,
    growthPotential: 300,
    churnRisk: 8,
    nextPurchasePrediction: "15-30 días",
    suggestedActions: ["Programa referidos", "Upselling servicios complementarios"]
  },
  {
    id: "3",
    name: "Laura Fernández Sánchez",
    email: "laura.fernandez@email.com",
    currentValue: 2340,
    predictedLTV: 4100,
    growthPotential: 75.2,
    churnRisk: 28,
    nextPurchasePrediction: "30-60 días",
    suggestedActions: ["Campaña de reactivación", "Encuesta de satisfacción", "Descuento personalizado"]
  },
  {
    id: "4",
    name: "Javier López Torres",
    email: "javier.lopez@email.com",
    currentValue: 3250,
    predictedLTV: 8500,
    growthPotential: 161.5,
    churnRisk: 5,
    nextPurchasePrediction: "1-7 días",
    suggestedActions: ["Programa VIP", "Invitación evento exclusivo"]
  },
  {
    id: "5",
    name: "Ana Martínez Ruiz",
    email: "ana.martinez@email.com",
    currentValue: 720,
    predictedLTV: 2200,
    growthPotential: 205.6,
    churnRisk: 15,
    nextPurchasePrediction: "15-30 días",
    suggestedActions: ["Webinar producto", "Oferta limitada"]
  }
];

// Mock data for conversion funnel
const CONVERSION_FUNNEL = [
  { stage: "Visitantes", value: 2500, conversion: null },
  { stage: "Leads capturados", value: 820, conversion: 32.8 },
  { stage: "Oportunidades calificadas", value: 410, conversion: 50 },
  { stage: "Negociaciones", value: 180, conversion: 43.9 },
  { stage: "Ventas cerradas", value: 85, conversion: 47.2 }
];

// Mock data for acquisition channels
const ACQUISITION_CHANNELS = [
  { channel: "Búsqueda orgánica", value: 32, trend: 2.5 },
  { channel: "Redes sociales", value: 25, trend: 4.8 },
  { channel: "Email marketing", value: 18, trend: -1.2 },
  { channel: "Referidos", value: 12, trend: 5.3 },
  { channel: "Contenido/Blog", value: 8, trend: 1.7 },
  { channel: "Otros", value: 5, trend: -0.5 }
];

// Mock data for customer segmentation
const CUSTOMER_SEGMENTS = [
  { 
    id: "segment1",
    name: "Clientes VIP", 
    count: 32, 
    avgValue: 4350, 
    totalValue: 139200, 
    growthRate: 12,
    characteristics: [
      "Compras frecuentes (>3/mes)",
      "Valor medio alto (>€300)",
      "Baja sensibilidad al precio",
      "Interacciones continuas"
    ]
  },
  { 
    id: "segment2",
    name: "Clientes regulares", 
    count: 158, 
    avgValue: 850, 
    totalValue: 134300, 
    growthRate: 8,
    characteristics: [
      "Compras periódicas (1-2/mes)",
      "Valor medio moderado (€100-300)",
      "Sensibilidad media al precio",
      "Buena respuesta a promociones"
    ]
  },
  { 
    id: "segment3",
    name: "Clientes ocasionales", 
    count: 346, 
    avgValue: 320, 
    totalValue: 110720, 
    growthRate: 3,
    characteristics: [
      "Compras esporádicas (<1/mes)",
      "Valor medio bajo (<€100)",
      "Alta sensibilidad al precio",
      "Responden a grandes descuentos"
    ]
  },
  { 
    id: "segment4",
    name: "Clientes nuevos", 
    count: 104, 
    avgValue: 210, 
    totalValue: 21840, 
    growthRate: 15,
    characteristics: [
      "Primera compra reciente",
      "Valor inicial bajo-medio",
      "Potencial de crecimiento alto",
      "Alta interacción informativa"
    ]
  },
  { 
    id: "segment5",
    name: "Clientes en riesgo", 
    count: 72, 
    avgValue: 780, 
    totalValue: 56160, 
    growthRate: -22,
    characteristics: [
      "Sin compras recientes (>60 días)",
      "Historial de valor medio-alto",
      "Disminución en interacciones",
      "Alto riesgo de pérdida"
    ]
  }
];

// Weekly sales trend mock data
const WEEKLY_TREND = [
  { week: "Semana 1", sales: 42500, transactions: 152 },
  { week: "Semana 2", sales: 38900, transactions: 145 },
  { week: "Semana 3", sales: 45200, transactions: 168 },
  { week: "Semana 4", sales: 51300, transactions: 187 },
  { week: "Semana 5", sales: 48700, transactions: 175 },
  { week: "Semana 6", sales: 52400, transactions: 190 },
  { week: "Semana 7", sales: 58600, transactions: 210 },
  { week: "Semana 8", sales: 56900, transactions: 205 }
];

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
};

// Get trend indicator
const getTrendIndicator = (value: number) => {
  if (value > 0) {
    return (
      <span className="text-green-600 flex items-center">
        <RiArrowUpSLine className="h-3 w-3" />
        <span>+{value}%</span>
      </span>
    );
  } else if (value < 0) {
    return (
      <span className="text-red-600 flex items-center">
        <RiArrowDownSLine className="h-3 w-3" />
        <span>{value}%</span>
      </span>
    );
  } else {
    return (
      <span className="text-gray-600">0%</span>
    );
  }
};

// Get churn risk indicator
const getChurnRiskIndicator = (risk: number) => {
  let color;
  if (risk < 10) {
    color = "bg-green-100 text-green-800";
  } else if (risk < 20) {
    color = "bg-yellow-100 text-yellow-800";
  } else {
    color = "bg-red-100 text-red-800";
  }
  return <Badge className={color}>{risk}%</Badge>;
};

export default function PredictiveAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("predictions");
  const [timeRange, setTimeRange] = useState("last30");
  const { toast } = useToast();
  
  // Handle report export
  const handleExportReport = (format: string) => {
    toast({
      title: "Informe exportado",
      description: `El informe ha sido exportado en formato ${format} correctamente.`,
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Análisis Predictivo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visualiza predicciones sobre el comportamiento futuro de tus clientes y oportunidades de negocio
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7">Últimos 7 días</SelectItem>
              <SelectItem value="last30">Últimos 30 días</SelectItem>
              <SelectItem value="last90">Últimos 90 días</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="gap-2">
            <RiFilter2Line className="h-4 w-4" />
            <span>Filtros</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handleExportReport('excel')}>
            <RiDownload2Line className="h-4 w-4" />
            <span>Exportar informe</span>
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Análisis actualizado", description: "Los datos han sido actualizados correctamente." })}>
            <RiRefreshLine className="h-4 w-4" />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="predictions" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 gap-4 w-full md:w-3/4">
          <TabsTrigger value="predictions" className="flex gap-2 items-center">
            <RiUser3Line />
            <span>Valor del cliente</span>
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex gap-2 items-center">
            <RiSortAsc />
            <span>Embudo de conversión</span>
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex gap-2 items-center">
            <RiPieChartLine />
            <span>Segmentación</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex gap-2 items-center">
            <RiBarChart2Line />
            <span>Tendencias</span>
          </TabsTrigger>
        </TabsList>

        {/* Customer Lifetime Value Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Valor promedio actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(1668)}</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+12.3% vs. período anterior</span>
                    </p>
                  </div>
                  <RiUser3Line className="h-8 w-8 text-blue-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Valor proyectado (LTV)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(3960)}</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+137.4% potencial de crecimiento</span>
                    </p>
                  </div>
                  <RiBarChart2Line className="h-8 w-8 text-purple-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Clientes en riesgo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">72</p>
                    <p className="text-xs text-red-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+5.8% vs. período anterior</span>
                    </p>
                  </div>
                  <RiPercentLine className="h-8 w-8 text-red-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Precisión del modelo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">92.5%</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+2.1% vs. período anterior</span>
                    </p>
                  </div>
                  <RiListCheck2 className="h-8 w-8 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Predicciones de valor del cliente</CardTitle>
              <CardDescription>
                Estimaciones de valor futuro basadas en patrones de comportamiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor actual
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor proyectado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Crecimiento
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Riesgo de pérdida
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Próxima compra
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {CUSTOMER_PREDICTIONS.map((customer) => (
                      <tr key={customer.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                              {customer.name.split(' ')[0][0]}{customer.name.split(' ')[1]?.[0] || ''}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">{formatCurrency(customer.currentValue)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">{formatCurrency(customer.predictedLTV)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTrendIndicator(customer.growthPotential)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getChurnRiskIndicator(customer.churnRisk)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {customer.nextPurchasePrediction}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Acciones recomendadas</CardTitle>
                <CardDescription>
                  Sugerencias basadas en el análisis predictivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {CUSTOMER_PREDICTIONS.map((customer) => (
                    <div key={customer.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                            {customer.name.split(' ')[0][0]}{customer.name.split(' ')[1]?.[0] || ''}
                          </div>
                          <h4 className="font-medium ml-2">{customer.name}</h4>
                        </div>
                        {getChurnRiskIndicator(customer.churnRisk)}
                      </div>
                      <ul className="pl-10 list-disc space-y-1">
                        {customer.suggestedActions.map((action, index) => (
                          <li key={index} className="text-sm">{action}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modelo predictivo</CardTitle>
                <CardDescription>
                  Factores que influyen en las predicciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Historial de compras</span>
                      <span className="text-sm">35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Frecuencia de interacción</span>
                      <span className="text-sm">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Comportamiento de navegación</span>
                      <span className="text-sm">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Respuesta a campañas</span>
                      <span className="text-sm">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Datos demográficos</span>
                      <span className="text-sm">5%</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                  
                  <div className="bg-blue-50 rounded-md p-4 mt-4">
                    <p className="text-sm text-blue-800">
                      El modelo se entrena con datos históricos y actuales para predecir comportamientos futuros con un 92.5% de precisión.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Funnel Tab */}
        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Embudo de conversión</CardTitle>
              <CardDescription>
                Análisis de las etapas del proceso de venta y sus tasas de conversión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <div className="w-full max-w-3xl">
                  {CONVERSION_FUNNEL.map((stage, index) => (
                    <div key={index} className="mb-6">
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center">
                          <span className="font-medium">{stage.stage}</span>
                          {index > 0 && (
                            <span className="ml-2 text-sm text-gray-500">
                              ({stage.conversion}% conversión)
                            </span>
                          )}
                        </div>
                        <span className="font-medium">{stage.value}</span>
                      </div>
                      <div className="relative">
                        <div 
                          className="h-12 bg-blue-500 rounded-md flex items-center justify-center text-white font-medium"
                          style={{ 
                            width: `${(stage.value / CONVERSION_FUNNEL[0].value) * 100}%`,
                            opacity: 1 - (index * 0.15)
                          }}
                        >
                          {Math.round((stage.value / CONVERSION_FUNNEL[0].value) * 100)}%
                        </div>
                        {index < CONVERSION_FUNNEL.length - 1 && (
                          <div className="h-4 w-0 border-l-2 border-dashed border-gray-300 absolute left-1/2 -bottom-4"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de conversión</CardTitle>
                <CardDescription>
                  Análisis detallado del rendimiento del embudo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tasa de conversión total</h4>
                    <div className="flex justify-between items-center p-3 border rounded-md bg-gray-50">
                      <span>Visitantes → Ventas</span>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-blue-600">3.4%</span>
                        <span className="text-xs text-green-600 flex items-center">
                          <RiArrowUpSLine className="h-3 w-3" />
                          <span>+0.3% vs. período anterior</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium mb-2">Conversión por etapa</h4>
                    <table className="min-w-full border rounded-md overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-xs text-left text-gray-500">Etapa</th>
                          <th className="px-4 py-2 text-xs text-center text-gray-500">Tasa</th>
                          <th className="px-4 py-2 text-xs text-center text-gray-500">Tendencia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="px-4 py-2 text-sm">Visitantes → Leads</td>
                          <td className="px-4 py-2 text-sm text-center">32.8%</td>
                          <td className="px-4 py-2 text-center">{getTrendIndicator(1.2)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm">Leads → Oportunidades</td>
                          <td className="px-4 py-2 text-sm text-center">50.0%</td>
                          <td className="px-4 py-2 text-center">{getTrendIndicator(3.5)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm">Oportunidades → Negociaciones</td>
                          <td className="px-4 py-2 text-sm text-center">43.9%</td>
                          <td className="px-4 py-2 text-center">{getTrendIndicator(-1.8)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm">Negociaciones → Ventas</td>
                          <td className="px-4 py-2 text-sm text-center">47.2%</td>
                          <td className="px-4 py-2 text-center">{getTrendIndicator(2.1)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="rounded-md bg-blue-50 p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Oportunidad de mejora</h4>
                    <p className="text-sm text-blue-700">
                      Aumentando la conversión en la etapa "Oportunidades → Negociaciones" en un 5% se podrían generar aproximadamente 20 ventas adicionales.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Canales de adquisición</CardTitle>
                <CardDescription>
                  Distribución de captación por canal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ACQUISITION_CHANNELS.map((channel, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{channel.channel}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{channel.value}%</span>
                          {getTrendIndicator(channel.trend)}
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${channel.value}%`,
                            backgroundColor: `hsl(${210 + index * 30}, 80%, 50%)`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 mt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">Conversión por canal</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border rounded-md p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">Mejor conversión</div>
                        <div className="font-medium">Referidos</div>
                        <div className="text-green-600 text-sm">8.2%</div>
                      </div>
                      <div className="border rounded-md p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">Mayor volumen</div>
                        <div className="font-medium">Búsqueda</div>
                        <div className="text-blue-600 text-sm">820 leads</div>
                      </div>
                      <div className="border rounded-md p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">Mejor ROI</div>
                        <div className="font-medium">Email</div>
                        <div className="text-purple-600 text-sm">350%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Segmentation Tab */}
        <TabsContent value="segments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segmentación de clientes</CardTitle>
              <CardDescription>
                Análisis de los diferentes grupos de clientes por comportamiento y valor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {CUSTOMER_SEGMENTS.map((segment) => (
                  <div 
                    key={segment.id} 
                    className="relative border rounded-md p-4 text-center overflow-hidden"
                    style={{ 
                      boxShadow: segment.growthRate < 0 ? "0 0 0 1px rgba(239, 68, 68, 0.2)" : "none"
                    }}
                  >
                    <h4 className="font-medium">{segment.name}</h4>
                    <div className="text-2xl font-bold my-2">{segment.count}</div>
                    <div className="text-sm text-gray-500 mb-1">Valor medio: {formatCurrency(segment.avgValue)}</div>
                    <div className="text-xs mb-2">{getTrendIndicator(segment.growthRate)}</div>
                    {segment.growthRate < 0 && (
                      <div className="absolute top-0 right-0 transform translate-x-[40%] -translate-y-[40%] bg-red-100 text-red-800 text-xs font-medium w-24 h-24 flex items-center justify-center rotate-45">
                        En riesgo
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h4 className="text-sm font-medium mb-4">Distribución de valor por segmento</h4>
                <div className="relative h-8 bg-gray-100 rounded-md overflow-hidden">
                  {CUSTOMER_SEGMENTS.map((segment, index) => {
                    // Calculate starting position based on previous segments
                    const prevSegments = CUSTOMER_SEGMENTS.slice(0, index);
                    const prevTotal = prevSegments.reduce((acc, seg) => acc + seg.totalValue, 0);
                    const totalValue = CUSTOMER_SEGMENTS.reduce((acc, seg) => acc + seg.totalValue, 0);
                    const startPos = (prevTotal / totalValue) * 100;
                    const width = (segment.totalValue / totalValue) * 100;
                    
                    return (
                      <div 
                        key={segment.id}
                        className="absolute top-0 h-full flex items-center justify-center text-xs text-white font-medium overflow-hidden"
                        style={{ 
                          left: `${startPos}%`,
                          width: `${width}%`,
                          backgroundColor: `hsl(${210 + index * 30}, 80%, 50%)`
                        }}
                      >
                        {width > 10 ? `${Math.round(width)}%` : ""}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2">
                  <div className="text-xs text-gray-500">0€</div>
                  <div className="text-xs text-gray-500">{formatCurrency(CUSTOMER_SEGMENTS.reduce((acc, seg) => acc + seg.totalValue, 0))}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="border rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">Segmentación por frecuencia</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Alta (>3/mes)</span>
                      <span>16%</span>
                    </div>
                    <Progress value={16} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Media (1-3/mes)</span>
                      <span>42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Baja (<1/mes)</span>
                      <span>42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">Segmentación por valor</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Alto (>1000€)</span>
                      <span>22%</span>
                    </div>
                    <Progress value={22} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Medio (300€-1000€)</span>
                      <span>35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Bajo (<300€)</span>
                      <span>43%</span>
                    </div>
                    <Progress value={43} className="h-2" />
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">Segmentación por recencia</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Reciente (<30 días)</span>
                      <span>38%</span>
                    </div>
                    <Progress value={38} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Medio (30-90 días)</span>
                      <span>32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Antiguo (>90 días)</span>
                      <span>30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Características por segmento</CardTitle>
                <CardDescription>
                  Análisis detallado de los perfiles de cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {CUSTOMER_SEGMENTS.map((segment) => (
                    <div key={segment.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{segment.name}</h4>
                        <Badge>
                          {segment.count} clientes
                        </Badge>
                      </div>
                      <ul className="text-sm space-y-1 pl-5 list-disc">
                        {segment.characteristics.map((characteristic, idx) => (
                          <li key={idx}>{characteristic}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estrategias recomendadas</CardTitle>
                <CardDescription>
                  Acciones sugeridas para cada segmento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Clientes VIP</h4>
                    <ul className="text-sm space-y-1 pl-5 list-disc">
                      <li>Programa de fidelización exclusivo</li>
                      <li>Atención personalizada con gestor dedicado</li>
                      <li>Acceso anticipado a nuevos productos/servicios</li>
                      <li>Eventos exclusivos y reconocimiento</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Clientes regulares</h4>
                    <ul className="text-sm space-y-1 pl-5 list-disc">
                      <li>Programa de puntos/recompensas por compras recurrentes</li>
                      <li>Cross-selling de productos complementarios</li>
                      <li>Comunicaciones personalizadas según intereses</li>
                      <li>Incentivos para incrementar frecuencia de compra</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-red-50">
                    <h4 className="font-medium mb-2">Clientes en riesgo</h4>
                    <ul className="text-sm space-y-1 pl-5 list-disc">
                      <li>Campaña de recuperación con descuentos especiales</li>
                      <li>Encuesta de satisfacción para identificar problemas</li>
                      <li>Contacto directo para conocer necesidades</li>
                      <li>Ofertas personalizadas basadas en compras anteriores</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Ventas totales (último mes)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(337600)}</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+12.8% vs. mes anterior</span>
                    </p>
                  </div>
                  <RiShoppingCart2Line className="h-8 w-8 text-blue-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Transacciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">1,232</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+8.5% vs. mes anterior</span>
                    </p>
                  </div>
                  <RiListCheck2 className="h-8 w-8 text-purple-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Ticket promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(274)}</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+4.2% vs. mes anterior</span>
                    </p>
                  </div>
                  <RiBarChart2Line className="h-8 w-8 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Proyección mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(415000)}</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+23% vs. mes actual</span>
                    </p>
                  </div>
                  <RiLineChartLine className="h-8 w-8 text-orange-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tendencia de ventas (8 semanas)</CardTitle>
              <CardDescription>
                Evolución de ventas y transacciones por semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Ventas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">Transacciones</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Ventas totales: {formatCurrency(WEEKLY_TREND.reduce((acc, week) => acc + week.sales, 0))}
                    </div>
                  </div>
                  
                  <div className="relative">
                    {/* Y axis */}
                    <div className="absolute top-0 bottom-0 left-0 w-16 flex flex-col justify-between text-xs text-gray-500">
                      <span>60.000€</span>
                      <span>50.000€</span>
                      <span>40.000€</span>
                      <span>30.000€</span>
                      <span>20.000€</span>
                      <span>10.000€</span>
                      <span>0€</span>
                    </div>
                    
                    {/* Chart area */}
                    <div className="ml-16 h-[300px] relative">
                      {/* Horizontal lines */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gray-200"></div>
                      <div className="absolute top-[20%] left-0 right-0 h-px bg-gray-200"></div>
                      <div className="absolute top-[40%] left-0 right-0 h-px bg-gray-200"></div>
                      <div className="absolute top-[60%] left-0 right-0 h-px bg-gray-200"></div>
                      <div className="absolute top-[80%] left-0 right-0 h-px bg-gray-200"></div>
                      <div className="absolute top-[100%] left-0 right-0 h-px bg-gray-200"></div>
                      
                      {/* Bars */}
                      <div className="flex h-full">
                        {WEEKLY_TREND.map((week, index) => (
                          <div key={index} className="flex-1 flex flex-col justify-end items-center">
                            <div 
                              className="w-8 bg-blue-500 rounded-t-sm relative group"
                              style={{ height: `${(week.sales / 60000) * 100}%` }}
                            >
                              <div className="hidden group-hover:block absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded">
                                {formatCurrency(week.sales)}
                              </div>
                            </div>
                            <div className="mt-2 flex flex-col items-center">
                              <span className="text-xs text-gray-500">{week.week}</span>
                              <span className="text-[10px] text-gray-400">{week.transactions} trans.</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Line chart */}
                      <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                        <svg width="100%" height="100%" viewBox={`0 0 ${WEEKLY_TREND.length * 50} 300`} preserveAspectRatio="none">
                          <polyline
                            points={WEEKLY_TREND.map((week, index) => `${index * 50 + 25} ${300 - (week.transactions / 210) * 300}`).join(',')}
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                          />
                          {WEEKLY_TREND.map((week, index) => (
                            <circle
                              key={index}
                              cx={index * 50 + 25}
                              cy={300 - (week.transactions / 210) * 300}
                              r="4"
                              fill="#8b5cf6"
                            />
                          ))}
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Predicciones a corto plazo</CardTitle>
                <CardDescription>
                  Proyecciones para las próximas 4 semanas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Semana 9</span>
                      <span className="text-sm font-medium">{formatCurrency(61500)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Estimado: +5% vs Semana 8</span>
                      <span>Confianza: Alta (92%)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Semana 10</span>
                      <span className="text-sm font-medium">{formatCurrency(64500)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '89%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Estimado: +5% vs Semana 9</span>
                      <span>Confianza: Alta (88%)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Semana 11</span>
                      <span className="text-sm font-medium">{formatCurrency(67000)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Estimado: +4% vs Semana 10</span>
                      <span>Confianza: Media (76%)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Semana 12</span>
                      <span className="text-sm font-medium">{formatCurrency(70000)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '97%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Estimado: +4% vs Semana 11</span>
                      <span>Confianza: Media (72%)</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-md p-4 mt-4">
                    <p className="text-sm text-blue-800">
                      Se proyecta un crecimiento sostenido del 4-5% semanal para el próximo mes, con una tendencia al aumento en el valor medio del ticket.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Factores de influencia</CardTitle>
                <CardDescription>
                  Elementos que están afectando a las tendencias actuales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                        <RiArrowUpSLine className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Factores positivos</h4>
                        <ul className="text-sm mt-2 space-y-1 pl-5 list-disc">
                          <li>Nueva campaña de marketing (+8% en captación)</li>
                          <li>Lanzamiento de producto premium (+12% en AOV)</li>
                          <li>Mejoras en la experiencia de usuario (+5% en conversión)</li>
                          <li>Ampliación de métodos de pago (+3% en finalización)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                        <RiArrowDownSLine className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Factores negativos</h4>
                        <ul className="text-sm mt-2 space-y-1 pl-5 list-disc">
                          <li>Aumento de competencia directa (-4% en cuota)</li>
                          <li>Problemas técnicos puntuales (-2% en conversión)</li>
                          <li>Cambios en algoritmos de búsqueda (-5% en tráfico)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                        <RiCalendarLine className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Eventos próximos (impacto proyectado)</h4>
                        <ul className="text-sm mt-2 space-y-1 pl-5 list-disc">
                          <li>Campaña estacional (estimado +15% en ventas)</li>
                          <li>Promoción exclusiva (estimado +20% en AOV)</li>
                          <li>Integración nueva plataforma de pago (estimado +3% en conversión)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}