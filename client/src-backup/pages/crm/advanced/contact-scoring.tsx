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
  Star,
  Settings,
  Plus,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';

interface ScoringRule {
  id: string;
  name: string;
  description: string;
  field: string;
  operator: string;
  value: string;
  points: number;
  weight: number;
  isActive: boolean;
}

interface ContactScore {
  contactId: number;
  name: string;
  email: string;
  totalScore: number;
  scoreBreakdown: Array<{
    ruleName: string;
    points: number;
    weight: number;
    finalScore: number;
  }>;
  classification: 'hot' | 'warm' | 'cold';
  lastUpdated: string;
}

const mockScoringRules: ScoringRule[] = [
  {
    id: '1',
    name: 'Email Engagement',
    description: 'Puntuación basada en interacción con emails',
    field: 'email_opens',
    operator: 'greater_than',
    value: '5',
    points: 25,
    weight: 1.5,
    isActive: true
  },
  {
    id: '2',
    name: 'WhatsApp Activity',
    description: 'Frecuencia de mensajes en WhatsApp',
    field: 'whatsapp_messages',
    operator: 'greater_than',
    value: '10',
    points: 30,
    weight: 2.0,
    isActive: true
  },
  {
    id: '3',
    name: 'Purchase History',
    description: 'Historial de compras previas',
    field: 'total_purchases',
    operator: 'greater_than',
    value: '1',
    points: 50,
    weight: 2.5,
    isActive: true
  },
  {
    id: '4',
    name: 'Profile Completeness',
    description: 'Completitud del perfil del cliente',
    field: 'profile_completion',
    operator: 'greater_than',
    value: '80',
    points: 15,
    weight: 1.0,
    isActive: true
  }
];

const mockContactScores: ContactScore[] = [
  {
    contactId: 1,
    name: 'Ana García',
    email: 'ana@example.com',
    totalScore: 92,
    scoreBreakdown: [
      { ruleName: 'Email Engagement', points: 25, weight: 1.5, finalScore: 37.5 },
      { ruleName: 'WhatsApp Activity', points: 30, weight: 2.0, finalScore: 60 },
      { ruleName: 'Purchase History', points: 0, weight: 2.5, finalScore: 0 },
      { ruleName: 'Profile Completeness', points: 15, weight: 1.0, finalScore: 15 }
    ],
    classification: 'hot',
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    contactId: 2,
    name: 'Carlos Ruiz',
    email: 'carlos@example.com',
    totalScore: 156,
    scoreBreakdown: [
      { ruleName: 'Email Engagement', points: 25, weight: 1.5, finalScore: 37.5 },
      { ruleName: 'WhatsApp Activity', points: 30, weight: 2.0, finalScore: 60 },
      { ruleName: 'Purchase History', points: 50, weight: 2.5, finalScore: 125 },
      { ruleName: 'Profile Completeness', points: 15, weight: 1.0, finalScore: 15 }
    ],
    classification: 'hot',
    lastUpdated: '2024-01-15T09:15:00Z'
  },
  {
    contactId: 3,
    name: 'María López',
    email: 'maria@example.com',
    totalScore: 52,
    scoreBreakdown: [
      { ruleName: 'Email Engagement', points: 0, weight: 1.5, finalScore: 0 },
      { ruleName: 'WhatsApp Activity', points: 30, weight: 2.0, finalScore: 60 },
      { ruleName: 'Purchase History', points: 0, weight: 2.5, finalScore: 0 },
      { ruleName: 'Profile Completeness', points: 15, weight: 1.0, finalScore: 15 }
    ],
    classification: 'warm',
    lastUpdated: '2024-01-15T08:45:00Z'
  }
];

export default function ContactScoringPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'scores' | 'rules' | 'analytics'>('scores');
  const [selectedClassification, setSelectedClassification] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');

  // Simulated API calls
  const { data: contactScores = mockContactScores, isLoading: scoresLoading } = useQuery({
    queryKey: ['/api/contact-scores'],
    queryFn: () => Promise.resolve(mockContactScores)
  });

  const { data: scoringRules = mockScoringRules, isLoading: rulesLoading } = useQuery({
    queryKey: ['/api/scoring-rules'],
    queryFn: () => Promise.resolve(mockScoringRules)
  });

  const recalculateScores = useMutation({
    mutationFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact-scores'] });
      toast({
        title: "Puntuaciones actualizadas",
        description: "Se han recalculado todas las puntuaciones de contactos.",
      });
    }
  });

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClassificationLabel = (classification: string) => {
    switch (classification) {
      case 'hot': return 'Caliente';
      case 'warm': return 'Tibio';
      case 'cold': return 'Frío';
      default: return classification;
    }
  };

  const filteredScores = contactScores.filter(score => 
    selectedClassification === 'all' || score.classification === selectedClassification
  );

  const totalContacts = contactScores.length;
  const hotLeads = contactScores.filter(s => s.classification === 'hot').length;
  const warmLeads = contactScores.filter(s => s.classification === 'warm').length;
  const coldLeads = contactScores.filter(s => s.classification === 'cold').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Puntuación de Contactos</h1>
          <p className="text-gray-600">Sistema inteligente de scoring para leads y clientes</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => recalculateScores.mutate()}
            disabled={recalculateScores.isPending}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {recalculateScores.isPending ? 'Recalculando...' : 'Recalcular'}
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configurar Reglas
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
                <p className="text-sm font-medium text-gray-600">Total Contactos</p>
                <p className="text-2xl font-bold text-gray-900">{totalContacts}</p>
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
                <p className="text-xs text-gray-500">{((hotLeads/totalContacts)*100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leads Tibios</p>
                <p className="text-2xl font-bold text-gray-900">{warmLeads}</p>
                <p className="text-xs text-gray-500">{((warmLeads/totalContacts)*100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leads Fríos</p>
                <p className="text-2xl font-bold text-gray-900">{coldLeads}</p>
                <p className="text-xs text-gray-500">{((coldLeads/totalContacts)*100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'scores', label: 'Puntuaciones' },
            { id: 'rules', label: 'Reglas de Scoring' },
            { id: 'analytics', label: 'Analíticas' }
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
      {activeTab === 'scores' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex space-x-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value as any)}
            >
              <option value="all">Todas las clasificaciones</option>
              <option value="hot">Calientes</option>
              <option value="warm">Tibios</option>
              <option value="cold">Fríos</option>
            </select>
          </div>

          {/* Contact Scores List */}
          <div className="grid grid-cols-1 gap-4">
            {scoresLoading ? (
              <div className="text-center py-8">Cargando puntuaciones...</div>
            ) : (
              filteredScores.map((score) => (
                <Card key={score.contactId}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="text-lg font-semibold">{score.name}</h3>
                            <p className="text-gray-600">{score.email}</p>
                          </div>
                          <Badge className={getClassificationColor(score.classification)}>
                            {getClassificationLabel(score.classification)}
                          </Badge>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Puntuación Total</span>
                            <span className="text-lg font-bold text-blue-600">{score.totalScore}</span>
                          </div>
                          <Progress value={Math.min(score.totalScore / 2, 100)} className="h-2" />
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Desglose por Regla:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {score.scoreBreakdown.map((breakdown, index) => (
                              <div key={index} className="text-xs">
                                <span className="text-gray-600">{breakdown.ruleName}:</span>
                                <span className="font-medium ml-1">{breakdown.finalScore} pts</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Reglas de Puntuación</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Regla
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {rulesLoading ? (
              <div className="text-center py-8">Cargando reglas...</div>
            ) : (
              scoringRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{rule.name}</h3>
                          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                            {rule.isActive ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{rule.description}</p>
                        
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Campo:</span>
                            <span className="ml-1 font-medium">{rule.field}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Puntos:</span>
                            <span className="ml-1 font-medium">{rule.points}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Peso:</span>
                            <span className="ml-1 font-medium">{rule.weight}x</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Analíticas de Scoring</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Clasificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Calientes</span>
                    </div>
                    <span className="font-medium">{hotLeads} ({((hotLeads/totalContacts)*100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Tibios</span>
                    </div>
                    <span className="font-medium">{warmLeads} ({((warmLeads/totalContacts)*100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Fríos</span>
                    </div>
                    <span className="font-medium">{coldLeads} ({((coldLeads/totalContacts)*100).toFixed(1)}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento de Reglas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scoringRules.slice(0, 3).map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between">
                      <span className="text-sm">{rule.name}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={Math.random() * 100} className="w-16 h-2" />
                        <span className="text-xs text-gray-500">{(Math.random() * 100).toFixed(0)}%</span>
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