import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Bot, Target, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ChatbotConfig {
  id: string;
  customInstructions: string;
  conversationObjective: 'sales' | 'appointment' | 'support' | 'information';
  aiPersonality: string;
  businessType: string;
  welcomeMessage?: string;
}

interface TestMessage {
  text: string;
  isUser: boolean;
  aidaStage?: string;
  confidence?: number;
  objectiveCompleted?: boolean;
}

export default function ChatbotConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testMessage, setTestMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<TestMessage[]>([]);
  const [config, setConfig] = useState<ChatbotConfig>({
    id: '',
    customInstructions: 'Hola! Soy especialista en keratina y tratamientos capilares.',
    conversationObjective: 'sales',
    aiPersonality: 'amigable',
    businessType: 'products',
    welcomeMessage: 'Hola! ¿En qué puedo ayudarte hoy?'
  });

  // Obtener configuración actual
  const { data: currentConfig } = useQuery({
    queryKey: ['/api/chatbot/config'],
    enabled: false // Solo para demostración
  });

  // Mutación para guardar configuración
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: ChatbotConfig) => {
      return apiRequest('POST', '/api/chatbot/config', newConfig);
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración del chatbot se ha actualizado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/chatbot/config'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    }
  });

  // Mutación para probar mensaje
  const testMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('POST', '/api/simple/simulate-message', {
        message,
        phoneNumber: '+1234567890',
        testMode: true,
        chatbotConfig: config
      });
    },
    onSuccess: (response: any) => {
      if (response.autoResponse) {
        setChatHistory(prev => [
          ...prev,
          { text: testMessage, isUser: true },
          { 
            text: response.autoResponse, 
            isUser: false,
            aidaStage: response.aidaStage,
            confidence: response.confidence,
            objectiveCompleted: response.objectiveCompleted
          }
        ]);
        setTestMessage('');
      }
    },
    onError: () => {
      toast({
        title: "Error en prueba",
        description: "No se pudo procesar el mensaje de prueba.",
        variant: "destructive",
      });
    }
  });

  const handleSaveConfig = () => {
    saveConfigMutation.mutate(config);
  };

  const handleTestMessage = () => {
    if (!testMessage.trim()) return;
    testMessageMutation.mutate(testMessage);
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  const getAidaStageColor = (stage?: string) => {
    switch (stage) {
      case 'attention': return 'bg-blue-100 text-blue-800';
      case 'interest': return 'bg-green-100 text-green-800';
      case 'desire': return 'bg-yellow-100 text-yellow-800';
      case 'action': return 'bg-red-100 text-red-800';
      case 'retention': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración de Chatbot</h1>
        <p className="text-muted-foreground">
          Personaliza las instrucciones y comportamiento de tu chatbot con IA inteligente y estructura AIDA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Configuración */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Instrucciones Personalizadas
              </CardTitle>
              <CardDescription>
                Define cómo se presenta tu chatbot a los clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customInstructions">Mensaje de Presentación</Label>
                <Textarea
                  id="customInstructions"
                  placeholder="Ej: Hola! Soy especialista en keratina y tratamientos capilares..."
                  value={config.customInstructions}
                  onChange={(e) => setConfig(prev => ({ ...prev, customInstructions: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="welcomeMessage">Mensaje de Bienvenida</Label>
                <Input
                  id="welcomeMessage"
                  placeholder="Primer mensaje que verán los clientes"
                  value={config.welcomeMessage}
                  onChange={(e) => setConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objetivo de Conversación
              </CardTitle>
              <CardDescription>
                Define el objetivo principal de las conversaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Objetivo Principal</Label>
                <Select
                  value={config.conversationObjective}
                  onValueChange={(value: any) => setConfig(prev => ({ ...prev, conversationObjective: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Ventas</SelectItem>
                    <SelectItem value="appointment">Agendar Citas</SelectItem>
                    <SelectItem value="support">Soporte</SelectItem>
                    <SelectItem value="information">Información</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de Negocio</Label>
                <Select
                  value={config.businessType}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, businessType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="products">Productos</SelectItem>
                    <SelectItem value="services">Servicios</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Personalidad de IA
              </CardTitle>
              <CardDescription>
                Ajusta el tono y estilo de comunicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Personalidad</Label>
                <Select
                  value={config.aiPersonality}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, aiPersonality: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amigable">Amigable</SelectItem>
                    <SelectItem value="profesional">Profesional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSaveConfig} 
            className="w-full"
            disabled={saveConfigMutation.isPending}
          >
            {saveConfigMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>

        {/* Panel de Pruebas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Probar Chatbot con AIDA
              </CardTitle>
              <CardDescription>
                Simula conversaciones para ver cómo responde tu chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe un mensaje de prueba..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
                />
                <Button 
                  onClick={handleTestMessage}
                  disabled={testMessageMutation.isPending || !testMessage.trim()}
                >
                  {testMessageMutation.isPending ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
              
              {chatHistory.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearChat}>
                  Limpiar Chat
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Historial de Chat */}
          <Card>
            <CardHeader>
              <CardTitle>Conversación de Prueba</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Envía un mensaje para comenzar la conversación de prueba
                  </p>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs p-3 rounded-lg ${
                        msg.isUser 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        {!msg.isUser && msg.aidaStage && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            <Badge className={getAidaStageColor(msg.aidaStage)}>
                              AIDA: {msg.aidaStage}
                            </Badge>
                            {msg.confidence && (
                              <Badge variant="outline">
                                {Math.round(msg.confidence * 100)}% confianza
                              </Badge>
                            )}
                            {msg.objectiveCompleted && (
                              <Badge className="bg-green-100 text-green-800">
                                Objetivo completado
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información AIDA */}
          <Card>
            <CardHeader>
              <CardTitle>Estructura AIDA</CardTitle>
              <CardDescription>
                Cómo funciona la comunicación progresiva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-100 text-blue-800">Attention</Badge>
                  <span className="text-sm">Captar la atención inicial</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-800">Interest</Badge>
                  <span className="text-sm">Generar interés en productos/servicios</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-yellow-100 text-yellow-800">Desire</Badge>
                  <span className="text-sm">Crear deseo de compra</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-100 text-red-800">Action</Badge>
                  <span className="text-sm">Motivar acción de compra/cita</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-purple-100 text-purple-800">Retention</Badge>
                  <span className="text-sm">Mantener relación post-venta</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}