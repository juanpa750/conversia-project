import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { RiCalendarLine, RiArrowDownSLine, RiDownload2Line } from "@/lib/icons";

// Analytics dashboard data interfaces
interface StatSummary {
  title: string;
  value: string | number;
  change: number;
  timeframe: string;
}

interface ConversionData {
  name: string;
  rate: number;
  previous: number;
}

interface ChatbotPerformance {
  id: string;
  name: string;
  messages: number;
  responses: number;
  conversions: number;
  avgResponseTime: string;
}

interface MessageData {
  date: string;
  messages: number;
  responses: number;
}

interface ChatbotDistribution {
  name: string;
  value: number;
  color: string;
}

export function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedChatbot, setSelectedChatbot] = useState("all");

  // In a real application, we would fetch this data from the API with the proper filters
  const { data: analyticsData } = useQuery({
    queryKey: ["/api/analytics", { timeRange, chatbot: selectedChatbot }],
    initialData: {
      stats: [
        { title: "Total Mensajes", value: 12567, change: 24, timeframe: "vs periodo anterior" },
        { title: "Tasa de Respuesta", value: "92%", change: -3, timeframe: "vs periodo anterior" },
        { title: "Nuevos Contactos", value: 867, change: 12, timeframe: "vs periodo anterior" },
        { title: "Tiempo de Respuesta", value: "1.5 min", change: -18, timeframe: "vs periodo anterior" }
      ],
      messageData: [
        { date: "Lun", messages: 312, responses: 298 },
        { date: "Mar", messages: 220, responses: 210 },
        { date: "Mié", messages: 375, responses: 350 },
        { date: "Jue", messages: 450, responses: 410 },
        { date: "Vie", messages: 325, responses: 305 },
        { date: "Sáb", messages: 400, responses: 378 },
        { date: "Dom", messages: 425, responses: 400 }
      ],
      chatbotPerformance: [
        { 
          id: "1", 
          name: "Soporte Técnico", 
          messages: 4523, 
          responses: 4320, 
          conversions: 145, 
          avgResponseTime: "0:45" 
        },
        { 
          id: "2", 
          name: "Ventas", 
          messages: 3214, 
          responses: 2980, 
          conversions: 256, 
          avgResponseTime: "1:20" 
        },
        { 
          id: "3", 
          name: "Información", 
          messages: 2830, 
          responses: 2740, 
          conversions: 92, 
          avgResponseTime: "0:55" 
        }
      ],
      conversionRates: [
        { name: "Contactos", rate: 35, previous: 32 },
        { name: "Consultas", rate: 58, previous: 55 },
        { name: "Ventas", rate: 18, previous: 16 }
      ],
      distribution: [
        { name: "Soporte", value: 45, color: "hsl(var(--chart-1))" },
        { name: "Ventas", value: 30, color: "hsl(var(--chart-2))" },
        { name: "Información", value: 25, color: "hsl(var(--chart-3))" }
      ]
    }
  });

  return (
    <>
      <div className="mb-6 flex flex-col justify-between md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analiza el rendimiento de tus chatbots y conversaciones
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <RiCalendarLine className="mr-2" />
                <SelectValue placeholder="Seleccionar periodo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="default">
            <RiDownload2Line className="mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {analyticsData.stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <span className={`rounded-full px-2 py-1 text-xs ${stat.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {stat.change >= 0 ? '+' : ''}{stat.change}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-semibold text-gray-900">{stat.value}</span>
                <span className="ml-2 text-sm text-gray-600">{stat.timeframe}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="messages" className="mb-6">
        <TabsList className="mb-6">
          <TabsTrigger value="messages">Mensajes</TabsTrigger>
          <TabsTrigger value="conversions">Conversiones</TabsTrigger>
          <TabsTrigger value="chatbots">Chatbots</TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes y Respuestas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.messageData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#374151',
                        border: 'none',
                        borderRadius: '0.375rem',
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                      itemStyle={{ color: 'white' }}
                      labelStyle={{ fontWeight: 'bold', color: 'white' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="messages"
                      name="Mensajes"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="responses"
                      name="Respuestas"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions">
          <Card>
            <CardHeader>
              <CardTitle>Tasas de Conversión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.conversionRates}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Tasa actual']}
                      contentStyle={{
                        backgroundColor: '#374151',
                        border: 'none',
                        borderRadius: '0.375rem',
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                      itemStyle={{ color: 'white' }}
                      labelStyle={{ fontWeight: 'bold', color: 'white' }}
                    />
                    <Legend />
                    <Bar
                      dataKey="rate"
                      name="Tasa actual"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                    <Bar
                      dataKey="previous"
                      name="Tasa anterior"
                      fill="hsl(var(--chart-3))"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chatbots">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Rendimiento por Chatbot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-3 text-left font-medium">Chatbot</th>
                        <th className="pb-3 text-right font-medium">Mensajes</th>
                        <th className="pb-3 text-right font-medium">Respuestas</th>
                        <th className="pb-3 text-right font-medium">Conversiones</th>
                        <th className="pb-3 text-right font-medium">Tiempo Resp.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.chatbotPerformance.map((bot) => (
                        <tr key={bot.id} className="border-b">
                          <td className="py-4 font-medium">{bot.name}</td>
                          <td className="py-4 text-right">{bot.messages.toLocaleString()}</td>
                          <td className="py-4 text-right">{bot.responses.toLocaleString()}</td>
                          <td className="py-4 text-right">{bot.conversions}</td>
                          <td className="py-4 text-right">{bot.avgResponseTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {analyticsData.distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Porcentaje']}
                        contentStyle={{
                          backgroundColor: '#374151',
                          border: 'none',
                          borderRadius: '0.375rem',
                          color: 'white',
                          fontSize: '0.75rem',
                        }}
                        itemStyle={{ color: 'white' }}
                        labelStyle={{ fontWeight: 'bold', color: 'white' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recomendaciones de Optimización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="font-medium text-blue-800">Mejora el tiempo de respuesta</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    El chatbot de Ventas tiene un tiempo de respuesta de 1:20 min, considerablemente mayor que los demás. Optimiza sus flujos de conversación para mejorar la experiencia del usuario.
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="font-medium text-green-800">Excelente desempeño en Soporte</h3>
                  <div className="mt-2 text-sm text-green-700">
                    El chatbot de Soporte Técnico muestra una tasa de respuesta del 95.5%, lo que indica un excelente desempeño. Considera aplicar estrategias similares a los demás chatbots.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default Analytics;
