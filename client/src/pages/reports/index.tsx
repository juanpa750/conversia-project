import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import {
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  RiBarChart2Line, 
  RiLineChartLine,
  RiPieChartLine,
  RiDownload2Line, 
  RiFileExcel2Line, 
  RiCalendarLine,
  RiFilterLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiRobotLine,
  RiMessage2Line,
  RiTimeLine,
  RiTeamLine,
  RiUserLine,
  RiShoppingCart2Line
} from "@/lib/icons";
import { Layout } from "@/components/layout/layout";

// Mock data for conversion funnel
const FUNNEL_DATA = [
  { name: 'Audiencia Total', value: 5200 },
  { name: 'Mensajes Recibidos', value: 3800 },
  { name: 'Interacciones', value: 2400 },
  { name: 'Leads Calificados', value: 1200 },
  { name: 'Ventas', value: 450 },
];

// Mock data for daily interactions
const DAILY_INTERACTIONS = [
  { date: '01/06', messages: 145, responses: 132 },
  { date: '02/06', messages: 156, responses: 140 },
  { date: '03/06', messages: 123, responses: 110 },
  { date: '04/06', messages: 167, responses: 150 },
  { date: '05/06', messages: 189, responses: 170 },
  { date: '06/06', messages: 176, responses: 158 },
  { date: '07/06', messages: 212, responses: 195 },
  { date: '08/06', messages: 198, responses: 180 },
  { date: '09/06', messages: 220, responses: 200 },
  { date: '10/06', messages: 241, responses: 215 },
  { date: '11/06', messages: 236, responses: 210 },
  { date: '12/06', messages: 258, responses: 230 },
  { date: '13/06', messages: 275, responses: 250 },
  { date: '14/06', messages: 290, responses: 260 },
];

// Mock data for chatbot performance
const CHATBOT_PERFORMANCE = [
  { name: 'Soporte Técnico', messages: 1520, conversions: 380, satisfaction: 4.2 },
  { name: 'Ventas', messages: 2340, conversions: 560, satisfaction: 4.5 },
  { name: 'Consultas FAQs', messages: 980, conversions: 190, satisfaction: 4.3 },
  { name: 'Agenda de Citas', messages: 750, conversions: 310, satisfaction: 4.7 },
  { name: 'Atención al Cliente', messages: 1890, conversions: 420, satisfaction: 4.4 },
];

// Mock data for customer demographics
const CUSTOMER_DEMOGRAPHICS = [
  { name: '18-24', value: 15 },
  { name: '25-34', value: 30 },
  { name: '35-44', value: 25 },
  { name: '45-54', value: 18 },
  { name: '55+', value: 12 },
];

// Mock data for geographic data
const GEOGRAPHIC_DATA = [
  { name: 'Madrid', value: 35 },
  { name: 'Barcelona', value: 28 },
  { name: 'Valencia', value: 15 },
  { name: 'Sevilla', value: 12 },
  { name: 'Otras', value: 10 },
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Mock data for time of day data
const TIME_OF_DAY_DATA = [
  { hour: '00:00', interactions: 45 },
  { hour: '02:00', interactions: 30 },
  { hour: '04:00', interactions: 15 },
  { hour: '06:00', interactions: 25 },
  { hour: '08:00', interactions: 90 },
  { hour: '10:00', interactions: 150 },
  { hour: '12:00', interactions: 180 },
  { hour: '14:00', interactions: 165 },
  { hour: '16:00', interactions: 190 },
  { hour: '18:00', interactions: 210 },
  { hour: '20:00', interactions: 170 },
  { hour: '22:00', interactions: 95 },
];

// Mock data for product performance (for e-commerce)
const PRODUCT_PERFORMANCE = [
  { name: 'Smartphone Pro X', views: 2500, inquiries: 890, purchases: 340 },
  { name: 'Auriculares Wireless', views: 1800, inquiries: 720, purchases: 280 },
  { name: 'Tablet Ultra HD', views: 1200, inquiries: 450, purchases: 180 },
  { name: 'Reloj Inteligente', views: 1500, inquiries: 680, purchases: 250 },
  { name: 'Altavoz Bluetooth', views: 950, inquiries: 320, purchases: 120 },
];

// Custom TickFormatter for Y axis to display k format
const formatYAxis = (tickItem: number) => {
  return tickItem >= 1000 ? `${Math.round(tickItem / 1000)}k` : tickItem;
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("last30");
  const { toast } = useToast();
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  // Format number with commas
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-ES').format(value);
  };

  // Handle report export
  const handleExportReport = (format: 'excel' | 'pdf') => {
    toast({
      title: "Reporte exportado",
      description: `El reporte ha sido exportado en formato ${format === 'excel' ? 'Excel' : 'PDF'} correctamente.`,
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
        <p className="mt-1 text-sm text-gray-500">
          Analiza el rendimiento de tus chatbots, campañas y ventas con datos detallados
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
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
            <RiFilterLine className="h-4 w-4" />
            <span>Filtros</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handleExportReport('excel')}>
            <RiFileExcel2Line className="h-4 w-4" />
            <span>Excel</span>
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleExportReport('pdf')}>
            <RiDownload2Line className="h-4 w-4" />
            <span>PDF</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 gap-4 w-full md:w-3/4">
          <TabsTrigger value="overview" className="flex gap-2 items-center">
            <RiBarChart2Line />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="chatbots" className="flex gap-2 items-center">
            <RiRobotLine />
            <span>Chatbots</span>
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex gap-2 items-center">
            <RiLineChartLine />
            <span>Marketing</span>
          </TabsTrigger>
          <TabsTrigger value="commerce" className="flex gap-2 items-center">
            <RiShoppingCart2Line />
            <span>E-commerce</span>
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex gap-2 items-center">
            <RiTeamLine />
            <span>Audiencia</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Total mensajes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">7,483</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+12.5% vs. período anterior</span>
                    </p>
                  </div>
                  <RiMessage2Line className="h-8 w-8 text-blue-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Tasa de respuesta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">89.4%</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+3.2% vs. período anterior</span>
                    </p>
                  </div>
                  <RiTimeLine className="h-8 w-8 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Nuevos contactos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">1,257</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+8.7% vs. período anterior</span>
                    </p>
                  </div>
                  <RiUserLine className="h-8 w-8 text-purple-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Conversiones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">450</p>
                    <p className="text-xs text-red-600 flex items-center">
                      <RiArrowDownSLine className="h-3 w-3" />
                      <span>-2.1% vs. período anterior</span>
                    </p>
                  </div>
                  <RiShoppingCart2Line className="h-8 w-8 text-orange-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Interacciones Diarias</CardTitle>
                <CardDescription>
                  Mensajes recibidos y respuestas enviadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={DAILY_INTERACTIONS}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={formatYAxis} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="messages"
                        name="Mensajes recibidos"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="responses"
                        name="Respuestas enviadas"
                        stroke="#82ca9d"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Embudo de Conversión</CardTitle>
                <CardDescription>
                  Etapas del proceso de conversión
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={FUNNEL_DATA.slice().reverse()}
                      margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 6000]} tickFormatter={formatYAxis} />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip formatter={(value) => formatNumber(value as number)} />
                      <Bar dataKey="value" name="Cantidad" fill="#8884d8">
                        {FUNNEL_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Demografía de Clientes</CardTitle>
                <CardDescription>
                  Distribución por edad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CUSTOMER_DEMOGRAPHICS}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {CUSTOMER_DEMOGRAPHICS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución Geográfica</CardTitle>
                <CardDescription>
                  Principales ubicaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={GEOGRAPHIC_DATA}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {GEOGRAPHIC_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hora del Día</CardTitle>
                <CardDescription>
                  Interacciones por hora
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={TIME_OF_DAY_DATA}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="interactions" name="Interacciones" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Chatbots Tab */}
        <TabsContent value="chatbots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Chatbots</CardTitle>
              <CardDescription>
                Comparación del desempeño de tus chatbots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={CHATBOT_PERFORMANCE}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tickFormatter={formatYAxis} />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="messages" name="Mensajes" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="conversions" name="Conversiones" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Satisfacción del Usuario</CardTitle>
                <CardDescription>
                  Puntuación promedio de satisfacción por chatbot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chatbot</TableHead>
                      <TableHead>Puntuación</TableHead>
                      <TableHead>Mensajes</TableHead>
                      <TableHead>Conversiones</TableHead>
                      <TableHead>Tasa de conversión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CHATBOT_PERFORMANCE.map((chatbot) => (
                      <TableRow key={chatbot.name}>
                        <TableCell className="font-medium">{chatbot.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="font-medium">{chatbot.satisfaction}</div>
                            <div className="ml-2 flex">
                              {[...Array(Math.floor(chatbot.satisfaction))].map((_, i) => (
                                <span key={i} className="text-yellow-400">★</span>
                              ))}
                              {chatbot.satisfaction % 1 > 0 && (
                                <span className="text-yellow-400">★</span>
                              )}
                              {[...Array(5 - Math.ceil(chatbot.satisfaction))].map((_, i) => (
                                <span key={i} className="text-gray-300">★</span>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{chatbot.messages}</TableCell>
                        <TableCell>{chatbot.conversions}</TableCell>
                        <TableCell>{((chatbot.conversions / chatbot.messages) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flujos de Conversación</CardTitle>
                <CardDescription>
                  Análisis de recorridos de conversación más comunes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Bienvenida → Productos → Precios</span>
                      <span className="text-sm">32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Bienvenida → Soporte → Contacto</span>
                      <span className="text-sm">28%</span>
                    </div>
                    <Progress value={28} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Bienvenida → Promociones → Compra</span>
                      <span className="text-sm">18%</span>
                    </div>
                    <Progress value={18} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Bienvenida → FAQs</span>
                      <span className="text-sm">12%</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Otros flujos</span>
                      <span className="text-sm">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalles de Rendimiento</CardTitle>
                <CardDescription>
                  Métricas adicionales por chatbot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Soporte Técnico</span>
                      <span>Tiempo de respuesta promedio</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">45 seg</span>
                      <span className="text-xs text-green-600 flex items-center">
                        <RiArrowDownSLine className="h-3 w-3" />
                        <span>-12% vs. período anterior</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Ventas</span>
                      <span>Valor promedio de venta</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">€89.50</span>
                      <span className="text-xs text-green-600 flex items-center">
                        <RiArrowUpSLine className="h-3 w-3" />
                        <span>+8% vs. período anterior</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Consultas FAQs</span>
                      <span>Tasa de resolución</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">87%</span>
                      <span className="text-xs text-green-600 flex items-center">
                        <RiArrowUpSLine className="h-3 w-3" />
                        <span>+5% vs. período anterior</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Marketing Tab */}
        <TabsContent value="marketing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Campañas activas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold">12</p>
                  <RiBarChart2Line className="h-8 w-8 text-blue-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Tasa de apertura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">68.3%</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+5.4% vs. período anterior</span>
                    </p>
                  </div>
                  <RiLineChartLine className="h-8 w-8 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Tasa de conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">12.5%</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+2.1% vs. período anterior</span>
                    </p>
                  </div>
                  <RiPieChartLine className="h-8 w-8 text-purple-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Campañas</CardTitle>
              <CardDescription>
                Resultados de las últimas campañas de marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaña</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Audiencia</TableHead>
                    <TableHead>Apertura</TableHead>
                    <TableHead>Interacción</TableHead>
                    <TableHead>Conversiones</TableHead>
                    <TableHead>ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Oferta de Verano</TableCell>
                    <TableCell>15/06/2023</TableCell>
                    <TableCell>1,250</TableCell>
                    <TableCell>68%</TableCell>
                    <TableCell>32%</TableCell>
                    <TableCell>89</TableCell>
                    <TableCell className="text-green-600">342%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Nuevos Productos</TableCell>
                    <TableCell>25/06/2023</TableCell>
                    <TableCell>750</TableCell>
                    <TableCell>72%</TableCell>
                    <TableCell>38%</TableCell>
                    <TableCell>64</TableCell>
                    <TableCell className="text-green-600">285%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Recordatorio de Carrito</TableCell>
                    <TableCell>Recurrente</TableCell>
                    <TableCell>342</TableCell>
                    <TableCell>72%</TableCell>
                    <TableCell>45%</TableCell>
                    <TableCell>67</TableCell>
                    <TableCell className="text-green-600">410%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Feedback Post-Compra</TableCell>
                    <TableCell>10/06/2023</TableCell>
                    <TableCell>523</TableCell>
                    <TableCell>81%</TableCell>
                    <TableCell>59%</TableCell>
                    <TableCell>112</TableCell>
                    <TableCell className="text-green-600">308%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Descuento Clientes Fieles</TableCell>
                    <TableCell>05/07/2023</TableCell>
                    <TableCell>189</TableCell>
                    <TableCell>84%</TableCell>
                    <TableCell>62%</TableCell>
                    <TableCell>78</TableCell>
                    <TableCell className="text-green-600">390%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Segmento</CardTitle>
                <CardDescription>
                  Tasa de respuesta por segmento de audiencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Clientes Nuevos", rate: 65 },
                        { name: "Clientes Frecuentes", rate: 82 },
                        { name: "Carritos Abandonados", rate: 72 },
                        { name: "Sin Compras Recientes", rate: 45 },
                        { name: "Interesados en Electrónica", rate: 68 }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="rate" name="Tasa de respuesta (%)" fill="#8884d8">
                        {[...Array(5)].map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efectividad de Plantillas</CardTitle>
                <CardDescription>
                  Tasa de conversión por plantilla de mensaje
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Bienvenida", rate: 5 },
                        { name: "Oferta Especial", rate: 15 },
                        { name: "Carrito Abandonado", rate: 22 },
                        { name: "Seguimiento Post-Compra", rate: 8 },
                        { name: "Solicitud de Feedback", rate: 12 }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 25]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="rate" name="Tasa de conversión (%)" fill="#82ca9d">
                        {[...Array(5)].map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* E-commerce Tab */}
        <TabsContent value="commerce" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Ventas totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">€24,530</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+18.3% vs. período anterior</span>
                    </p>
                  </div>
                  <RiShoppingCart2Line className="h-8 w-8 text-blue-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">312</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+12.1% vs. período anterior</span>
                    </p>
                  </div>
                  <RiShoppingCart2Line className="h-8 w-8 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Valor medio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">€78.62</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+5.5% vs. período anterior</span>
                    </p>
                  </div>
                  <RiBarChart2Line className="h-8 w-8 text-purple-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Tasa de abandono</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">18.4%</p>
                    <p className="text-xs text-red-600 flex items-center">
                      <RiArrowDownSLine className="h-3 w-3" />
                      <span>-3.2% vs. período anterior</span>
                    </p>
                  </div>
                  <RiArrowDownSLine className="h-8 w-8 text-orange-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Productos</CardTitle>
              <CardDescription>
                Estadísticas de los productos más populares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={PRODUCT_PERFORMANCE}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatYAxis} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" name="Visualizaciones" fill="#8884d8" />
                    <Bar dataKey="inquiries" name="Consultas" fill="#82ca9d" />
                    <Bar dataKey="purchases" name="Compras" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recuperación de Carritos</CardTitle>
                <CardDescription>
                  Efectividad de las campañas de recuperación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Total carritos abandonados</span>
                    <span>342</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Mensajes enviados</span>
                    <span>328 (95.9%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Mensajes vistos</span>
                    <span>298 (90.9%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Carritos recuperados</span>
                    <span>67 (20.4%)</span>
                  </div>
                  
                  <div className="pt-4">
                    <div className="text-sm font-medium mb-2">Tasa de recuperación por tiempo de recordatorio</div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>30 minutos</span>
                          <span>32%</span>
                        </div>
                        <Progress value={32} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>1 hora</span>
                          <span>26%</span>
                        </div>
                        <Progress value={26} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>3 horas</span>
                          <span>18%</span>
                        </div>
                        <Progress value={18} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>24 horas</span>
                          <span>12%</span>
                        </div>
                        <Progress value={12} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pago</CardTitle>
                <CardDescription>
                  Distribución de métodos de pago utilizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Tarjeta de crédito', value: 55 },
                          { name: 'Efectivo al recibir', value: 25 },
                          { name: 'Transferencia bancaria', value: 15 },
                          { name: 'Otros', value: 5 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[...Array(4)].map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium mb-2">Tendencia de conversión por método de pago</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded-lg p-3">
                      <div className="text-sm font-medium">Tarjeta de crédito</div>
                      <div className="flex items-center mt-1">
                        <span className="text-lg font-bold">82%</span>
                        <span className="text-xs text-green-600 ml-2 flex items-center">
                          <RiArrowUpSLine className="h-3 w-3" />
                          <span>+2.5%</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <div className="text-sm font-medium">Efectivo al recibir</div>
                      <div className="flex items-center mt-1">
                        <span className="text-lg font-bold">68%</span>
                        <span className="text-xs text-red-600 ml-2 flex items-center">
                          <RiArrowDownSLine className="h-3 w-3" />
                          <span>-1.3%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crecimiento de Audiencia</CardTitle>
              <CardDescription>
                Evolución de nuevos contactos y audiencia total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { month: 'Ene', total: 3200, new: 320 },
                      { month: 'Feb', total: 3450, new: 250 },
                      { month: 'Mar', total: 3780, new: 330 },
                      { month: 'Abr', total: 4100, new: 320 },
                      { month: 'May', total: 4350, new: 250 },
                      { month: 'Jun', total: 4750, new: 400 },
                      { month: 'Jul', total: 5200, new: 450 }
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatYAxis} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip formatter={(value) => formatNumber(value as number)} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      name="Audiencia total" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="new" 
                      name="Nuevos contactos" 
                      stroke="#82ca9d" 
                      fillOpacity={1} 
                      fill="url(#colorNew)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Segmentos de Audiencia</CardTitle>
                <CardDescription>
                  Distribución de contactos por segmento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Segmento</TableHead>
                      <TableHead>Contactos</TableHead>
                      <TableHead>% Total</TableHead>
                      <TableHead>Tasa de respuesta</TableHead>
                      <TableHead>Tasa de conversión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Clientes Nuevos</TableCell>
                      <TableCell>356</TableCell>
                      <TableCell>16.8%</TableCell>
                      <TableCell>65%</TableCell>
                      <TableCell>8.4%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Clientes Frecuentes</TableCell>
                      <TableCell>189</TableCell>
                      <TableCell>8.9%</TableCell>
                      <TableCell>82%</TableCell>
                      <TableCell>18.5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Carritos Abandonados</TableCell>
                      <TableCell>342</TableCell>
                      <TableCell>16.1%</TableCell>
                      <TableCell>72%</TableCell>
                      <TableCell>20.4%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Sin Compras Recientes</TableCell>
                      <TableCell>876</TableCell>
                      <TableCell>41.3%</TableCell>
                      <TableCell>45%</TableCell>
                      <TableCell>5.2%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Interesados en Electrónica</TableCell>
                      <TableCell>523</TableCell>
                      <TableCell>24.7%</TableCell>
                      <TableCell>68%</TableCell>
                      <TableCell>12.8%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fuentes de Contactos</CardTitle>
                <CardDescription>
                  Origen de los contactos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'WhatsApp directo', value: 45 },
                          { name: 'Sitio web', value: 30 },
                          { name: 'Campañas', value: 15 },
                          { name: 'Referidos', value: 8 },
                          { name: 'Otros', value: 2 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[...Array(5)].map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Actividad de Audiencia</CardTitle>
              <CardDescription>
                Análisis de frecuencia de interacción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6 justify-around">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-800 text-xl font-bold mb-2">
                    42%
                  </div>
                  <div className="text-sm font-medium">Activos (últimos 7 días)</div>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 text-green-800 text-xl font-bold mb-2">
                    28%
                  </div>
                  <div className="text-sm font-medium">Activos (últimos 30 días)</div>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 text-yellow-800 text-xl font-bold mb-2">
                    18%
                  </div>
                  <div className="text-sm font-medium">Activos intermitentes</div>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-100 text-red-800 text-xl font-bold mb-2">
                    12%
                  </div>
                  <div className="text-sm font-medium">Inactivos (90+ días)</div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-sm font-medium mb-2">Frecuencia de interacción</h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Diaria</span>
                      <span>8%</span>
                    </div>
                    <Progress value={8} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Semanal</span>
                      <span>34%</span>
                    </div>
                    <Progress value={34} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Mensual</span>
                      <span>46%</span>
                    </div>
                    <Progress value={46} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Trimestral</span>
                      <span>12%</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}