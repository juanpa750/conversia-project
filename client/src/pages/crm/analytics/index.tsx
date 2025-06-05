import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function CRMAnalytics() {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState('7d');
  
  // Mock analytics data
  const analyticsData = [
    { date: '2025-01-20', conversations: 45, contacts: 12, responses: 89 },
    { date: '2025-01-21', conversations: 52, contacts: 18, responses: 94 },
    { date: '2025-01-22', conversations: 38, contacts: 9, responses: 76 },
    { date: '2025-01-23', conversations: 61, contacts: 23, responses: 112 },
    { date: '2025-01-24', conversations: 48, contacts: 14, responses: 98 },
    { date: '2025-01-25', conversations: 55, contacts: 19, responses: 105 },
    { date: '2025-01-26', conversations: 42, contacts: 11, responses: 87 }
  ];

  const channelData = [
    { channel: 'WhatsApp', contacts: 2450, percentage: 78 },
    { channel: 'Web Chat', contacts: 680, percentage: 22 },
    { channel: 'Manual', contacts: 120, percentage: 4 }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analíticas CRM</h1>
          <p className="text-gray-600 mt-2">Análisis detallado de tu gestión de clientes</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Contactos</p>
                <p className="text-2xl font-bold text-gray-900">3,250</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% vs mes anterior
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversaciones</p>
                <p className="text-2xl font-bold text-gray-900">341</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% vs semana anterior
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa Respuesta</p>
                <p className="text-2xl font-bold text-gray-900">89.2%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2.1% vs mes anterior
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tiempo Respuesta</p>
                <p className="text-2xl font-bold text-gray-900">2.3min</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  -15% vs mes anterior
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Conversaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                />
                <Line 
                  type="monotone" 
                  dataKey="conversations" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Conversaciones"
                />
                <Line 
                  type="monotone" 
                  dataKey="contacts" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Nuevos Contactos"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="channel" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="contacts" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">76.8%</div>
              <div className="text-sm text-gray-600">Tasa de Conversión</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">4.2min</div>
              <div className="text-sm text-gray-600">Tiempo Promedio de Respuesta</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">92.1%</div>
              <div className="text-sm text-gray-600">Satisfacción del Cliente</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}