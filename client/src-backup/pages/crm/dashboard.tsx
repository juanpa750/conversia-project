import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Users, Target, DollarSign, TrendingUp, MessageSquare, Clock, Phone, Mail, Calendar, ChevronRight } from 'lucide-react';

interface CRMMetrics {
  totalContacts: number;
  qualifiedLeads: number;
  monthlySales: number;
  conversionRate: number;
  contactsChange: number;
  leadsChange: number;
  salesChange: number;
  conversionChange: number;
  dailyConversations: Array<{ date: string; count: number; }>;
  leadDistribution: Array<{ name: string; value: number; }>;
  averageResponseTime: number;
  messagesSentToday: number;
  activeConversations: number;
}

interface PipelineItem {
  id: number;
  title: string;
  contact_name: string;
  contact_phone: string;
  estimated_value: number;
  stage: string;
  created_at: string;
  chatbot_name?: string;
  product_name?: string;
  priority: string;
}

interface ContactItem {
  id: number;
  name: string;
  phone: string;
  email?: string;
  lastMessage: string;
  lastMessageAt: string;
  leadStage: string;
  priority: string;
  estimatedValue: number;
  responseTime?: number;
  sentiment?: string;
}

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}> = ({ title, value, change, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change !== undefined && (
        <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change}% vs mes anterior
        </p>
      )}
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

const SalesPipelineKanban: React.FC<{ pipeline: PipelineItem[] }> = ({ pipeline }) => {
  const stages = [
    { id: 'new_contact', name: 'Nuevo Contacto', color: 'bg-gray-100 dark:bg-gray-800' },
    { id: 'engaged', name: 'Interesado', color: 'bg-blue-100 dark:bg-blue-900' },
    { id: 'qualified', name: 'Calificado', color: 'bg-yellow-100 dark:bg-yellow-900' },
    { id: 'proposal_sent', name: 'Propuesta Enviada', color: 'bg-orange-100 dark:bg-orange-900' },
    { id: 'sale_closed', name: 'Venta Cerrada', color: 'bg-green-100 dark:bg-green-900' },
    { id: 'lost', name: 'Perdido', color: 'bg-red-100 dark:bg-red-900' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {stages.map(stage => (
        <div key={stage.id} className={`min-w-80 ${stage.color} p-4 rounded-lg`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{stage.name}</h3>
            <Badge variant="secondary">
              {pipeline.filter(item => item.stage === stage.id).length}
            </Badge>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pipeline
              .filter(item => item.stage === stage.id)
              .map(item => (
                <div key={item.id} className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {item.contact_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {item.contact_phone}
                    </p>
                    {item.chatbot_name && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Chatbot: {item.chatbot_name}
                      </p>
                    )}
                    {item.estimated_value > 0 && (
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(item.estimated_value)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    <Button size="sm" variant="outline" className="h-6 text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 text-xs">
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ContactsTable: React.FC<{ contacts: ContactItem[] }> = ({ contacts }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'new_contact': 'bg-gray-100 text-gray-800',
      'engaged': 'bg-blue-100 text-blue-800',
      'qualified': 'bg-yellow-100 text-yellow-800',
      'proposal_sent': 'bg-orange-100 text-orange-800',
      'sale_closed': 'bg-green-100 text-green-800',
      'lost': 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getStageName = (stage: string) => {
    const names: Record<string, string> = {
      'new_contact': 'Nuevo',
      'engaged': 'Interesado',
      'qualified': 'Calificado',
      'proposal_sent': 'Propuesta',
      'sale_closed': 'Cerrado',
      'lost': 'Perdido'
    };
    return names[stage] || stage;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Contacto</th>
            <th className="text-left p-2">Último Mensaje</th>
            <th className="text-left p-2">Etapa</th>
            <th className="text-left p-2">Valor Est.</th>
            <th className="text-left p-2">Respuesta</th>
            <th className="text-left p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="p-2">
                <div>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {contact.phone}
                  </div>
                  {contact.email && (
                    <div className="text-xs text-gray-500 flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {contact.email}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-2">
                <div className="max-w-xs">
                  <div className="text-sm line-clamp-2">{contact.lastMessage}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(contact.lastMessageAt).toLocaleDateString('es-CO')}
                  </div>
                </div>
              </td>
              <td className="p-2">
                <Badge className={getStageColor(contact.leadStage)}>
                  {getStageName(contact.leadStage)}
                </Badge>
              </td>
              <td className="p-2">
                {contact.estimatedValue > 0 ? (
                  <span className="text-green-600 font-medium">
                    {formatCurrency(contact.estimatedValue)}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="p-2">
                {contact.responseTime ? (
                  <div className="flex items-center text-sm">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.round(contact.responseTime / 60)}min
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="p-2">
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <MessageSquare className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <Calendar className="w-3 h-3" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CRMDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('last_30_days');
  
  const { data: metrics, isLoading: loadingMetrics } = useQuery<CRMMetrics>({
    queryKey: ['crm-metrics', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/crm/metrics?dateRange=${dateRange}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching metrics');
      return response.json();
    }
  });
  
  const { data: contacts, isLoading: loadingContacts } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: async () => {
      const response = await fetch('/api/crm/contacts', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching contacts');
      return response.json();
    }
  });
  
  const { data: salesPipeline, isLoading: loadingPipeline } = useQuery<PipelineItem[]>({
    queryKey: ['crm-pipeline'],
    queryFn: async () => {
      const response = await fetch('/api/crm/pipeline', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching pipeline');
      return response.json();
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loadingMetrics || loadingContacts || loadingPipeline) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

  return (
    <div className="space-y-6">
      {/* Header con selector de rango */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestión completa de contactos y ventas WhatsApp
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7_days">Últimos 7 días</SelectItem>
            <SelectItem value="last_30_days">Últimos 30 días</SelectItem>
            <SelectItem value="last_90_days">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Contactos Totales"
          value={metrics?.totalContacts || 0}
          change={metrics?.contactsChange}
          icon={<Users className="h-4 w-4 text-blue-600" />}
          description={`${contacts?.newToday || 0} nuevos hoy`}
        />
        <MetricCard
          title="Leads Calificados"
          value={metrics?.qualifiedLeads || 0}
          change={metrics?.leadsChange}
          icon={<Target className="h-4 w-4 text-green-600" />}
          description={`${contacts?.qualified || 0} en pipeline`}
        />
        <MetricCard
          title="Ventas del Mes"
          value={formatCurrency(metrics?.monthlySales || 0)}
          change={metrics?.salesChange}
          icon={<DollarSign className="h-4 w-4 text-yellow-600" />}
        />
        <MetricCard
          title="Tasa de Conversión"
          value={`${metrics?.conversionRate || 0}%`}
          change={metrics?.conversionChange}
          icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
        />
      </div>

      {/* Métricas adicionales de WhatsApp */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Mensajes Enviados Hoy"
          value={metrics?.messagesSentToday || 0}
          icon={<MessageSquare className="h-4 w-4 text-blue-600" />}
        />
        <MetricCard
          title="Conversaciones Activas"
          value={metrics?.activeConversations || 0}
          icon={<Users className="h-4 w-4 text-green-600" />}
          description="Últimas 24 horas"
        />
        <MetricCard
          title="Tiempo Promedio Respuesta"
          value={`${metrics?.averageResponseTime || 0} min`}
          icon={<Clock className="h-4 w-4 text-orange-600" />}
        />
      </div>

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline de Ventas</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          <TabsTrigger value="contacts">Contactos</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline de Ventas</CardTitle>
              <CardDescription>
                Seguimiento de oportunidades por etapa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesPipelineKanban pipeline={salesPipeline || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversaciones por Día</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics?.dailyConversations || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('es-CO')}
                      formatter={(value) => [value, 'Conversaciones']}
                    />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics?.leadDistribution || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(metrics?.leadDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contactos Recientes</CardTitle>
              <CardDescription>
                {contacts?.total || 0} contactos totales • {contacts?.newToday || 0} nuevos hoy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactsTable contacts={contacts?.recent || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRMDashboard;