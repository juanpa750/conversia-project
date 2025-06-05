import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock, 
  Star,
  Settings,
  Save
} from 'lucide-react';

export default function LeadScoringConfig() {
  const [config, setConfig] = useState({
    enabled: true,
    demographicWeight: [30],
    behaviorWeight: [40],
    engagementWeight: [30],
    autoAssignment: true,
    hotLeadThreshold: [80],
    warmLeadThreshold: [60],
    coldLeadThreshold: [40]
  });

  const scoringCriteria = [
    {
      category: 'Datos Demográficos',
      icon: <Users className="w-5 h-5" />,
      weight: config.demographicWeight[0],
      factors: [
        { name: 'Localización geográfica', points: 10, enabled: true },
        { name: 'Tamaño de empresa', points: 15, enabled: true },
        { name: 'Industria objetivo', points: 20, enabled: true },
        { name: 'Cargo/Posición', points: 15, enabled: false }
      ]
    },
    {
      category: 'Comportamiento',
      icon: <TrendingUp className="w-5 h-5" />,
      weight: config.behaviorWeight[0],
      factors: [
        { name: 'Páginas visitadas', points: 5, enabled: true },
        { name: 'Tiempo en sitio web', points: 10, enabled: true },
        { name: 'Descarga de contenido', points: 25, enabled: true },
        { name: 'Formularios completados', points: 30, enabled: true }
      ]
    },
    {
      category: 'Engagement',
      icon: <MessageSquare className="w-5 h-5" />,
      weight: config.engagementWeight[0],
      factors: [
        { name: 'Respuesta a emails', points: 15, enabled: true },
        { name: 'Interacción en WhatsApp', points: 20, enabled: true },
        { name: 'Asistencia a webinars', points: 25, enabled: false },
        { name: 'Solicitud de demo', points: 40, enabled: true }
      ]
    }
  ];

  const leadExamples = [
    {
      name: 'María González',
      company: 'TechCorp S.A.',
      score: 85,
      status: 'hot',
      factors: ['Descargó 3 recursos', 'Visitó pricing 5 veces', 'Completó formulario'],
      assignedTo: 'Carlos Ruiz'
    },
    {
      name: 'Juan Pérez',
      company: 'Startup Digital',
      score: 65,
      status: 'warm',
      factors: ['Abrió 4 emails', 'Tiempo en sitio: 8 min', 'Industria objetivo'],
      assignedTo: 'Ana López'
    },
    {
      name: 'Laura Martín',
      company: 'Empresa Local',
      score: 35,
      status: 'cold',
      factors: ['Una visita al sitio', 'No respondió emails'],
      assignedTo: 'Sin asignar'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-yellow-500';
      case 'cold': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'hot': return 'Caliente';
      case 'warm': return 'Tibio';
      case 'cold': return 'Frío';
      default: return 'Sin clasificar';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuración de Lead Scoring
        </h1>
        <p className="text-gray-600">
          Define criterios automáticos para calificar y priorizar leads
        </p>
      </div>

      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Vista Previa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lead-scoring-enabled">Activar Lead Scoring</Label>
                  <p className="text-sm text-gray-600">
                    Habilita la calificación automática de leads
                  </p>
                </div>
                <Switch
                  id="lead-scoring-enabled"
                  checked={config.enabled}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-assignment">Asignación Automática</Label>
                  <p className="text-sm text-gray-600">
                    Asigna leads automáticamente según el score
                  </p>
                </div>
                <Switch
                  id="auto-assignment"
                  checked={config.autoAssignment}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, autoAssignment: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Scoring Weights */}
          <Card>
            <CardHeader>
              <CardTitle>Pesos de Categorías</CardTitle>
              <p className="text-sm text-gray-600">
                Ajusta la importancia de cada categoría en el score final
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Datos Demográficos</Label>
                    <span className="text-sm font-medium">{config.demographicWeight[0]}%</span>
                  </div>
                  <Slider
                    value={config.demographicWeight}
                    onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, demographicWeight: value }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Comportamiento</Label>
                    <span className="text-sm font-medium">{config.behaviorWeight[0]}%</span>
                  </div>
                  <Slider
                    value={config.behaviorWeight}
                    onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, behaviorWeight: value }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Engagement</Label>
                    <span className="text-sm font-medium">{config.engagementWeight[0]}%</span>
                  </div>
                  <Slider
                    value={config.engagementWeight}
                    onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, engagementWeight: value }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                Total: {config.demographicWeight[0] + config.behaviorWeight[0] + config.engagementWeight[0]}%
                {config.demographicWeight[0] + config.behaviorWeight[0] + config.engagementWeight[0] !== 100 && (
                  <span className="text-orange-600 ml-2">
                    (Ajusta para que sume 100%)
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lead Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle>Umbrales de Clasificación</CardTitle>
              <p className="text-sm text-gray-600">
                Define los rangos de score para cada tipo de lead
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      Leads Calientes
                    </Label>
                    <span className="text-sm font-medium">{config.hotLeadThreshold[0]}+ puntos</span>
                  </div>
                  <Slider
                    value={config.hotLeadThreshold}
                    onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, hotLeadThreshold: value }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      Leads Tibios
                    </Label>
                    <span className="text-sm font-medium">
                      {config.warmLeadThreshold[0]} - {config.hotLeadThreshold[0]-1} puntos
                    </span>
                  </div>
                  <Slider
                    value={config.warmLeadThreshold}
                    onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, warmLeadThreshold: value }))
                    }
                    max={config.hotLeadThreshold[0] - 5}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      Leads Fríos
                    </Label>
                    <span className="text-sm font-medium">
                      0 - {config.warmLeadThreshold[0]-1} puntos
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Criteria Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {scoringCriteria.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {category.icon}
                    {category.category}
                    <Badge variant="outline">{category.weight}%</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.factors.map((factor, factorIndex) => (
                      <div key={factorIndex} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={factor.enabled}
                            onCheckedChange={() => {}}
                            size="sm"
                          />
                          <span className="text-sm">{factor.name}</span>
                        </div>
                        <Badge variant={factor.enabled ? 'default' : 'secondary'}>
                          +{factor.points}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Guardar Configuración
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Ejemplo de Leads Calificados
              </CardTitle>
              <p className="text-sm text-gray-600">
                Vista previa de cómo se verían los leads con la configuración actual
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leadExamples.map((lead, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{lead.name}</span>
                          <span className="text-sm text-gray-600">{lead.company}</span>
                        </div>
                        <Badge className={`${getStatusColor(lead.status)} text-white`}>
                          {getStatusLabel(lead.status)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{lead.score}</div>
                        <div className="text-sm text-gray-600">puntos</div>
                      </div>
                    </div>
                    
                    <Progress value={lead.score} className="mb-3" />
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Factores:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {lead.factors.map((factor, factorIndex) => (
                            <Badge key={factorIndex} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Asignado a:</span>
                        <span className="ml-2 text-gray-600">{lead.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}