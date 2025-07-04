import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Megaphone, 
  Target, 
  ShoppingCart, 
  Users, 
  Calendar, 
  Heart,
  Building, 
  GraduationCap,
  Trophy,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Gift,
  Percent,
  Clock
} from 'lucide-react';

interface CampaignObjective {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  features: string[];
  recommendations: {
    tone: string;
    messageStructure: string[];
    keyElements: string[];
    timing: string;
    followUpStrategy: string[];
  };
  templates: {
    subject: string;
    opening: string;
    body: string;
    cta: string;
  }[];
}

const campaignObjectives: CampaignObjective[] = [
  {
    id: 'product_launch',
    name: 'Lanzamiento de Producto',
    description: 'Promocionar y generar expectativa por un nuevo producto o servicio',
    icon: <Trophy className="w-6 h-6" />,
    category: 'Ventas',
    features: ['Teaser campaigns', 'Product showcase', 'Early access', 'Reviews collection'],
    recommendations: {
      tone: 'Emocionante, innovador y exclusivo',
      messageStructure: [
        'Despertar curiosidad',
        'Revelar características únicas',
        'Crear urgencia/exclusividad',
        'Llamada a la acción clara',
        'Ofrecer incentivos tempranos'
      ],
      keyElements: [
        'Destacar innovación',
        'Mostrar beneficios únicos',
        'Crear sensación de exclusividad',
        'Usar testimonios tempranos'
      ],
      timing: 'Serie de 3-5 mensajes durante 2 semanas',
      followUpStrategy: [
        'Secuencia de teaser (3 días antes)',
        'Anuncio oficial',
        'Recordatorio con incentivo',
        'Última oportunidad',
        'Seguimiento post-lanzamiento'
      ]
    },
    templates: [
      {
        subject: 'Algo increíble viene...',
        opening: 'Hola! Tenemos una sorpresa especial para ti.',
        body: 'Hemos estado trabajando en algo revolucionario que cambiará tu forma de [beneficio]. En 3 días revelaremos todos los detalles, pero queremos darte un adelanto exclusivo...',
        cta: 'Quiero ser el primero en saberlo'
      }
    ]
  },
  {
    id: 'promotional_discount',
    name: 'Promoción con Descuento',
    description: 'Impulsar ventas con ofertas especiales y descuentos limitados',
    icon: <Percent className="w-6 h-6" />,
    category: 'Ventas',
    features: ['Discount codes', 'Limited time offers', 'Bundle deals', 'Flash sales'],
    recommendations: {
      tone: 'Urgente, atractivo y orientado al valor',
      messageStructure: [
        'Captar atención con oferta',
        'Explicar valor del descuento',
        'Crear urgencia temporal',
        'Facilitar proceso de compra',
        'Reforzar beneficios'
      ],
      keyElements: [
        'Porcentaje/monto del descuento',
        'Tiempo límite específico',
        'Valor original vs. precio con descuento',
        'Facilidad de redención'
      ],
      timing: 'Campaña intensiva de 3-7 días',
      followUpStrategy: [
        'Anuncio inicial de oferta',
        'Recordatorio a mitad de campaña',
        'Últimas 24 horas',
        'Último llamado (2 horas antes)',
        'Follow-up para no compradores'
      ]
    },
    templates: [
      {
        subject: 'Solo hoy! 30% OFF en todo',
        opening: 'Oferta especial solo para ti!',
        body: 'Por tiempo limitado, obtén 30% de descuento en toda nuestra colección. Esta es la oportunidad perfecta para conseguir [producto] que has estado viendo a un precio increíble.',
        cta: 'Comprar con descuento'
      }
    ]
  },
  {
    id: 'customer_retention',
    name: 'Retención de Clientes',
    description: 'Mantener y fortalecer la relación con clientes existentes',
    icon: <Heart className="w-6 h-6" />,
    category: 'Retención',
    features: ['Loyalty programs', 'Exclusive offers', 'Personalized content', 'Feedback collection'],
    recommendations: {
      tone: 'Apreciativo, personal y orientado a la relación',
      messageStructure: [
        'Agradecer lealtad',
        'Reconocer su relación',
        'Ofrecer valor exclusivo',
        'Solicitar feedback',
        'Reforzar compromiso futuro'
      ],
      keyElements: [
        'Personalización basada en historial',
        'Ofertas exclusivas para clientes',
        'Reconocimiento de su valor',
        'Solicitud de feedback'
      ],
      timing: 'Mensual o según comportamiento',
      followUpStrategy: [
        'Mensaje de agradecimiento',
        'Oferta exclusiva',
        'Solicitud de review/testimonio',
        'Invitación a programa VIP',
        'Check-in personalizado'
      ]
    },
    templates: [
      {
        subject: 'Especial para ti, [Nombre]',
        opening: 'Queremos agradecerte por ser parte de nuestra familia.',
        body: 'Durante [tiempo] has sido un cliente increíble, y queremos reconocerlo con algo especial. Como muestra de nuestro agradecimiento, tienes acceso exclusivo a [beneficio] solo disponible para nuestros mejores clientes.',
        cta: 'Reclamar mi beneficio exclusivo'
      }
    ]
  }
];

interface CampaignAssistantProps {
  onComplete: (config: any) => void;
}

export function CampaignAssistant({ onComplete }: CampaignAssistantProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedObjective, setSelectedObjective] = useState<CampaignObjective | null>(null);
  const [campaignConfig, setCampaignConfig] = useState({
    name: '',
    description: '',
    targetAudience: '',
    duration: '',
    budget: '',
    customInstructions: ''
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleObjectiveSelect = (objective: CampaignObjective) => {
    setSelectedObjective(objective);
    setCurrentStep(2);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (!selectedObjective) return;

    const finalConfig = {
      ...campaignConfig,
      objective: selectedObjective,
      aiInstructions: generateCampaignInstructions(),
      recommendedTemplates: selectedObjective.templates,
      suggestedFeatures: selectedObjective.features
    };

    onComplete(finalConfig);
    setIsOpen(false);
    
    toast({
      title: "Campaña configurada",
      description: `Tu campaña de ${selectedObjective.name.toLowerCase()} está lista.`,
    });
  };

  const generateCampaignInstructions = () => {
    if (!selectedObjective) return '';
    
    return `
OBJETIVO DE CAMPAÑA: ${selectedObjective.name}
TONO DE COMUNICACIÓN: ${selectedObjective.recommendations.tone}

ESTRUCTURA DE MENSAJES:
${selectedObjective.recommendations.messageStructure.map((step, index) => `${index + 1}. ${step}`).join('\n')}

ELEMENTOS CLAVE A INCLUIR:
${selectedObjective.recommendations.keyElements.map(element => `• ${element}`).join('\n')}

ESTRATEGIA DE SEGUIMIENTO:
${selectedObjective.recommendations.followUpStrategy.map(strategy => `• ${strategy}`).join('\n')}

TIMING RECOMENDADO: ${selectedObjective.recommendations.timing}

AUDIENCIA OBJETIVO: ${campaignConfig.targetAudience}
DURACIÓN: ${campaignConfig.duration}

INSTRUCCIONES PERSONALIZADAS:
${campaignConfig.customInstructions}

Cada mensaje debe estar optimizado para maximizar el ${selectedObjective.name.toLowerCase()} y mantener coherencia con el objetivo principal de la campaña.
    `.trim();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Megaphone className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">¿Cuál es el objetivo de tu campaña?</h3>
              <p className="text-gray-600">Selecciona el propósito principal para recibir recomendaciones específicas</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaignObjectives.map((objective) => (
                <Card 
                  key={objective.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedObjective?.id === objective.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleObjectiveSelect(objective)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      {objective.icon}
                      <h4 className="font-semibold">{objective.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{objective.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {objective.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-2">Configuración de Campaña</h3>
              <p className="text-gray-600">Define los detalles básicos de tu campaña</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Nombre de la Campaña</Label>
                <Input
                  id="campaign-name"
                  placeholder="Ej: Lanzamiento Producto Verano 2024"
                  value={campaignConfig.name}
                  onChange={(e) => setCampaignConfig({...campaignConfig, name: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="campaign-description">Descripción</Label>
                <Textarea
                  id="campaign-description"
                  placeholder="Describe el propósito y contexto de tu campaña"
                  value={campaignConfig.description}
                  onChange={(e) => setCampaignConfig({...campaignConfig, description: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="target-audience">Audiencia Objetivo</Label>
                <Input
                  id="target-audience"
                  placeholder="Ej: Mujeres 25-40 años, profesionales urbanas"
                  value={campaignConfig.targetAudience}
                  onChange={(e) => setCampaignConfig({...campaignConfig, targetAudience: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duración</Label>
                  <Input
                    id="duration"
                    placeholder="Ej: 2 semanas"
                    value={campaignConfig.duration}
                    onChange={(e) => setCampaignConfig({...campaignConfig, duration: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Presupuesto</Label>
                  <Input
                    id="budget"
                    placeholder="Ej: $5,000"
                    value={campaignConfig.budget}
                    onChange={(e) => setCampaignConfig({...campaignConfig, budget: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
              <h3 className="text-xl font-semibold mb-2">Recomendaciones IA</h3>
              <p className="text-gray-600">Estrategia personalizada para: {selectedObjective?.name}</p>
            </div>

            {selectedObjective && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tono Recomendado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedObjective.recommendations.tone}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estructura de Mensajes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-1">
                      {selectedObjective.recommendations.messageStructure.map((step, index) => (
                        <li key={index} className="text-gray-700">{step}</li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estrategia de Timing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">{selectedObjective.recommendations.timing}</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedObjective.recommendations.followUpStrategy.map((strategy, index) => (
                        <li key={index} className="text-gray-700">{strategy}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="custom-instructions">Instrucciones Adicionales</Label>
                  <Textarea
                    id="custom-instructions"
                    placeholder="Agrega especificaciones adicionales para tu campaña..."
                    value={campaignConfig.customInstructions}
                    onChange={(e) => setCampaignConfig({...campaignConfig, customInstructions: e.target.value})}
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-2">Campaña Lista</h3>
              <p className="text-gray-600">Tu estrategia de campaña está configurada</p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Campaña</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <strong>Nombre:</strong> {campaignConfig.name}
                  </div>
                  <div>
                    <strong>Objetivo:</strong> {selectedObjective?.name}
                  </div>
                  <div>
                    <strong>Audiencia:</strong> {campaignConfig.targetAudience}
                  </div>
                  <div>
                    <strong>Duración:</strong> {campaignConfig.duration}
                  </div>
                  {selectedObjective && (
                    <div>
                      <strong>Templates incluidos:</strong>
                      <div className="text-sm text-gray-600 mt-1">
                        {selectedObjective.templates.length} plantillas optimizadas
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
          <Megaphone className="w-5 h-5 mr-2" />
          Asistente IA para Campañas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Megaphone className="w-6 h-6" />
            <span>Asistente Virtual para Campañas</span>
          </DialogTitle>
          <DialogDescription>
            Te ayudo a crear campañas efectivas con objetivos claros y estrategias personalizadas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Paso {currentStep} de {totalSteps}</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {renderStep()}

          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={currentStep === 1 && !selectedObjective}
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Crear Campaña
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}