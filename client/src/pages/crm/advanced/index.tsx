import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
  LineChart,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Link } from 'wouter';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  score: number;
  status: 'hot' | 'warm' | 'cold';
  source: string;
  lastContact: string;
  value: number;
  tags: string[];
}

interface Pipeline {
  id: number;
  name: string;
  stage: string;
  value: number;
  probability: number;
  expectedClose: string;
  contact: string;
}

const mockLeads: Lead[] = [
  {
    id: 1,
    name: 'Ana García',
    email: 'ana@empresa.com',
    phone: '+34 600 123 456',
    score: 85,
    status: 'hot',
    source: 'WhatsApp',
    lastContact: '2024-01-15',
    value: 2500,
    tags: ['Premium', 'Urgente']
  },
  {
    id: 2,
    name: 'Carlos Ruiz',
    email: 'carlos@negocio.com',
    phone: '+34 600 789 012',
    score: 72,
    status: 'warm',
    source: 'Web',
    lastContact: '2024-01-14',
    value: 1800,
    tags: ['Seguimiento']
  },
  {
    id: 3,
    name: 'María López',
    email: 'maria@startup.com',
    phone: '+34 600 345 678',
    score: 45,
    status: 'cold',
    source: 'Referido',
    lastContact: '2024-01-12',
    value: 900,
    tags: ['Nuevo']
  }
];

const mockPipeline: Pipeline[] = [
  {
    id: 1,
    name: 'Proyecto E-commerce',
    stage: 'Propuesta',
    value: 5000,
    probability: 70,
    expectedClose: '2024-02-15',
    contact: 'Ana García'
  },
  {
    id: 2,
    name: 'Implementación CRM',
    stage: 'Negociación',
    value: 3500,
    probability: 85,
    expectedClose: '2024-02-01',
    contact: 'Carlos Ruiz'
  },
  {
    id: 3,
    name: 'Consultoría Digital',
    stage: 'Calificación',
    value: 2000,
    probability: 40,
    expectedClose: '2024-03-01',
    contact: 'María López'
  }
];

export default function CRMAdvancedPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [activeTab, setActiveTab] = useState('leads');

  // Fetch leads data
  const { data: leads = mockLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ['/api/crm/leads'],
    queryFn: () => Promise.resolve(mockLeads)
  });

  // Fetch pipeline data
  const { data: pipeline = mockPipeline, isLoading: pipelineLoading } = useQuery({
    queryKey: ['/api/crm/pipeline'],
    queryFn: () => Promise.resolve(mockPipeline)
  });

  // Create new lead mutation
  const createLead = useMutation({
    mutationFn: async (leadData: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: Date.now(), ...leadData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      toast({
        title: "Lead creado",
        description: "El nuevo lead se ha agregado exitosamente.",
      });
    }
  });

  // Update lead status mutation
  const updateLeadStatus = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: number, status: string }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { leadId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      toast({
        title: "Estado actualizado",
        description: "El estado del lead se ha actualizado.",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'hot': return 'Caliente';
      case 'warm': return 'Tibio';
      case 'cold': return 'Frío';
      default: return status;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.status === 'hot').length;
  const totalValue = pipeline.reduce((sum, p) => sum + p.value, 0);
  const avgScore = Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Avanzado</h1>
          <p className="text-gray-600">Gestión avanzada de leads y pipeline de ventas</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leads Calientes</p>
                <p className="text-2xl font-bold text-gray-900">{hotLeads}</p>
                <p className="text-xs text-gray-500">{((hotLeads/totalLeads)*100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">€{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Score Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{avgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leads">Gestión de Leads</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline de Ventas</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          {/* Filters */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
            >
              <option value="all">Todos los estados</option>
              <option value="hot">Calientes</option>
              <option value="warm">Tibios</option>
              <option value="cold">Fríos</option>
            </select>
          </div>

          {/* Leads List */}
          <div className="grid grid-cols-1 gap-4">
            {leadsLoading ? (
              <div className="text-center py-8">Cargando leads...</div>
            ) : (
              filteredLeads.map((lead) => (
                <Card key={lead.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="text-lg font-semibold">{lead.name}</h3>
                            <p className="text-gray-600">{lead.email}</p>
                            <p className="text-sm text-gray-500">{lead.phone}</p>
                          </div>
                          <Badge className={getStatusColor(lead.status)}>
                            {getStatusLabel(lead.status)}
                          </Badge>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Score:</span>
                            <span className="ml-1 font-medium">{lead.score}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Fuente:</span>
                            <span className="ml-1 font-medium">{lead.source}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Valor:</span>
                            <span className="ml-1 font-medium">€{lead.value}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Último contacto:</span>
                            <span className="ml-1 font-medium">{lead.lastContact}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex space-x-2">
                          {lead.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateLeadStatus.mutate({ 
                            leadId: lead.id, 
                            status: lead.status === 'hot' ? 'warm' : 'hot' 
                          })}
                          disabled={updateLeadStatus.isPending}
                        >
                          <TrendingUp className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {pipelineLoading ? (
              <div className="text-center py-8">Cargando pipeline...</div>
            ) : (
              pipeline.map((deal) => (
                <Card key={deal.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{deal.name}</h3>
                        <p className="text-gray-600">{deal.contact}</p>
                        
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Etapa:</span>
                            <span className="ml-1 font-medium">{deal.stage}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Valor:</span>
                            <span className="ml-1 font-medium">€{deal.value.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Probabilidad:</span>
                            <span className="ml-1 font-medium">{deal.probability}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Cierre esperado:</span>
                            <span className="ml-1 font-medium">{deal.expectedClose}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progreso</span>
                            <span className="text-sm text-gray-500">{deal.probability}%</span>
                          </div>
                          <Progress value={deal.probability} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Calientes</span>
                    </div>
                    <span className="font-medium">{hotLeads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Tibios</span>
                    </div>
                    <span className="font-medium">{leads.filter(l => l.status === 'warm').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Fríos</span>
                    </div>
                    <span className="font-medium">{leads.filter(l => l.status === 'cold').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fuentes de Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['WhatsApp', 'Web', 'Referido'].map((source) => {
                    const count = leads.filter(l => l.source === source).length;
                    return (
                      <div key={source} className="flex items-center justify-between">
                        <span>{source}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}