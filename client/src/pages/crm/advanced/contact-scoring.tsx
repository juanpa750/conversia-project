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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Calendar,
  Settings,
  Save,
  Plus,
  Trash2
} from 'lucide-react';

interface ScoringRule {
  id: string;
  name: string;
  field: string;
  operator: string;
  value: string;
  points: number;
  active: boolean;
}

interface ContactScore {
  id: number;
  name: string;
  email: string;
  phone: string;
  score: number;
  level: 'cold' | 'warm' | 'hot' | 'qualified';
  lastInteraction: string;
  interactions: number;
  source: string;
}

export default function ContactScoringPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'rules' | 'scores'>('rules');
  const [newRule, setNewRule] = useState<Partial<ScoringRule>>({
    name: '',
    field: 'interactions',
    operator: 'greater_than',
    value: '',
    points: 10,
    active: true
  });

  // Fetch scoring rules
  const { data: scoringRules = [] } = useQuery({
    queryKey: ['/api/crm/scoring-rules'],
    initialData: [
      {
        id: '1',
        name: 'Interacciones Frecuentes',
        field: 'interactions',
        operator: 'greater_than',
        value: '5',
        points: 20,
        active: true
      },
      {
        id: '2',
        name: 'Respuesta Rápida',
        field: 'response_time',
        operator: 'less_than',
        value: '300',
        points: 15,
        active: true
      },
      {
        id: '3',
        name: 'Origen WhatsApp',
        field: 'source',
        operator: 'equals',
        value: 'whatsapp',
        points: 10,
        active: true
      }
    ]
  });

  // Fetch contact scores
  const { data: contactScores = [] } = useQuery({
    queryKey: ['/api/crm/contact-scores'],
    initialData: [
      {
        id: 1,
        name: 'María González',
        email: 'maria@ejemplo.com',
        phone: '+34666777888',
        score: 85,
        level: 'hot' as const,
        lastInteraction: '2024-01-15',
        interactions: 12,
        source: 'whatsapp'
      },
      {
        id: 2,
        name: 'Carlos Ruiz',
        email: 'carlos@empresa.com',
        phone: '+34666999111',
        score: 65,
        level: 'warm' as const,
        lastInteraction: '2024-01-14',
        interactions: 8,
        source: 'web'
      },
      {
        id: 3,
        name: 'Ana López',
        email: 'ana@consultora.es',
        phone: '+34666444555',
        score: 45,
        level: 'qualified' as const,
        lastInteraction: '2024-01-13',
        interactions: 15,
        source: 'whatsapp'
      }
    ]
  });

  const createRuleMutation = useMutation({
    mutationFn: async (rule: Partial<ScoringRule>) => {
      return apiRequest('POST', '/api/crm/scoring-rules', rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/scoring-rules'] });
      toast({
        title: "Regla creada",
        description: "La regla de puntuación se ha creado correctamente.",
      });
      setNewRule({
        name: '',
        field: 'interactions',
        operator: 'greater_than',
        value: '',
        points: 10,
        active: true
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la regla de puntuación.",
        variant: "destructive",
      });
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      return apiRequest('DELETE', `/api/crm/scoring-rules/${ruleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/scoring-rules'] });
      toast({
        title: "Regla eliminada",
        description: "La regla de puntuación se ha eliminado.",
      });
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-orange-100 text-orange-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const handleCreateRule = () => {
    if (!newRule.name || !newRule.value) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }
    createRuleMutation.mutate(newRule);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Puntuación de Contactos</h1>
          <p className="text-gray-600">Configura reglas automáticas para evaluar y priorizar contactos</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'rules' ? 'default' : 'outline'}
            onClick={() => setActiveTab('rules')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Reglas
          </Button>
          <Button
            variant={activeTab === 'scores' ? 'default' : 'outline'}
            onClick={() => setActiveTab('scores')}
          >
            <Star className="w-4 h-4 mr-2" />
            Puntuaciones
          </Button>
        </div>
      </div>

      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Create New Rule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Nueva Regla de Puntuación
              </CardTitle>
              <CardDescription>
                Define criterios para asignar puntos automáticamente a los contactos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-name">Nombre de la Regla</Label>
                  <Input
                    id="rule-name"
                    placeholder="Ej: Contactos activos"
                    value={newRule.name || ''}
                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="rule-field">Campo</Label>
                  <select
                    id="rule-field"
                    className="w-full p-2 border rounded-md"
                    value={newRule.field}
                    onChange={(e) => setNewRule({...newRule, field: e.target.value})}
                  >
                    <option value="interactions">Número de Interacciones</option>
                    <option value="response_time">Tiempo de Respuesta</option>
                    <option value="source">Fuente del Contacto</option>
                    <option value="last_interaction">Última Interacción</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rule-operator">Operador</Label>
                  <select
                    id="rule-operator"
                    className="w-full p-2 border rounded-md"
                    value={newRule.operator}
                    onChange={(e) => setNewRule({...newRule, operator: e.target.value})}
                  >
                    <option value="greater_than">Mayor que</option>
                    <option value="less_than">Menor que</option>
                    <option value="equals">Igual a</option>
                    <option value="contains">Contiene</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="rule-value">Valor</Label>
                  <Input
                    id="rule-value"
                    placeholder="Valor de comparación"
                    value={newRule.value || ''}
                    onChange={(e) => setNewRule({...newRule, value: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="rule-points">Puntos ({newRule.points})</Label>
                  <Slider
                    value={[newRule.points || 10]}
                    onValueChange={(value) => setNewRule({...newRule, points: value[0]})}
                    max={100}
                    min={1}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newRule.active}
                    onCheckedChange={(checked) => setNewRule({...newRule, active: checked})}
                  />
                  <Label>Regla activa</Label>
                </div>
                <Button 
                  onClick={handleCreateRule}
                  disabled={createRuleMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Crear Regla
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Reglas Configuradas</CardTitle>
              <CardDescription>
                Gestiona las reglas de puntuación existentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scoringRules.map((rule: ScoringRule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge variant={rule.active ? 'default' : 'secondary'}>
                          {rule.active ? 'Activa' : 'Inactiva'}
                        </Badge>
                        <Badge variant="outline">+{rule.points} pts</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {rule.field} {rule.operator} {rule.value}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRuleMutation.mutate(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'scores' && (
        <div className="space-y-6">
          {/* Score Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Contactos Fríos</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {contactScores.filter(c => c.score < 40).length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Contactos Tibios</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {contactScores.filter(c => c.score >= 40 && c.score < 60).length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Contactos Calientes</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {contactScores.filter(c => c.score >= 60 && c.score < 80).length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Contactos Calificados</p>
                    <p className="text-2xl font-bold text-red-600">
                      {contactScores.filter(c => c.score >= 80).length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Scores List */}
          <Card>
            <CardHeader>
              <CardTitle>Puntuaciones de Contactos</CardTitle>
              <CardDescription>
                Lista de contactos ordenados por puntuación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contactScores
                  .sort((a, b) => b.score - a.score)
                  .map((contact: ContactScore) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreColor(contact.score)}`}>
                        <span className="font-bold text-lg">{contact.score}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getLevelBadgeColor(contact.level)}>
                          {contact.level.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {contact.interactions} interacciones
                        </p>
                        <p className="text-xs text-gray-500">
                          Última: {contact.lastInteraction}
                        </p>
                      </div>
                      
                      <div className="w-24">
                        <Progress value={contact.score} className="h-2" />
                        <p className="text-xs text-center text-gray-600 mt-1">
                          {contact.score}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}