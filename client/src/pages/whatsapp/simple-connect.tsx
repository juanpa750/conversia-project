import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  RiWhatsappLine, 
  RiQrCodeLine, 
  RiCheckLine, 
  RiRefreshLine,
  RiWifiOffLine,
  RiErrorWarningLine,
  RiSendPlaneLine,
  RiSettingsLine,
  RiChat1Line,
  RiRobotLine
} from 'react-icons/ri';

interface WhatsAppStatus {
  status: 'disconnected' | 'qr_pending' | 'authenticating' | 'connected' | 'error';
  qrCode?: string;
  phoneNumber?: string;
  profileName?: string;
  connectedAt?: string;
  lastError?: string;
}

const statusConfig = {
  disconnected: {
    icon: <RiWifiOffLine className="w-5 h-5" />,
    color: 'bg-gray-500',
    text: 'Desconectado',
    description: 'WhatsApp no está conectado'
  },
  qr_pending: {
    icon: <RiQrCodeLine className="w-5 h-5" />,
    color: 'bg-yellow-500',
    text: 'Escanea el QR',
    description: 'Escanea el código QR con WhatsApp'
  },
  authenticating: {
    icon: <RiRefreshLine className="w-5 h-5 animate-spin" />,
    color: 'bg-blue-500',
    text: 'Conectando...',
    description: 'Autenticando con WhatsApp'
  },
  connected: {
    icon: <RiCheckLine className="w-5 h-5" />,
    color: 'bg-green-500',
    text: 'Conectado',
    description: 'WhatsApp conectado y funcionando'
  },
  error: {
    icon: <RiErrorWarningLine className="w-5 h-5" />,
    color: 'bg-red-500',
    text: 'Error',
    description: 'Error en la conexión'
  }
};

export default function WhatsAppSimpleConnect() {
  const [showQR, setShowQR] = useState(false);
  const [testMessage, setTestMessage] = useState({
    to: '',
    message: 'Hola! Este es un mensaje de prueba desde mi chatbot 🤖'
  });
  const [aiConfig, setAiConfig] = useState({
    personality: 'Amigable y profesional',
    instructions: 'Ayuda a los clientes con sus consultas de manera útil y cortés',
    objective: 'Brindar excelente servicio al cliente'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener estado
  const { data: status, isLoading } = useQuery<WhatsAppStatus>({
    queryKey: ['/api/whatsapp-simple/status'],
    refetchInterval: 2000, // Actualizar cada 2 segundos
    retry: false
  });

  // Query para obtener QR cuando está pendiente
  const { data: qrData } = useQuery({
    queryKey: ['/api/whatsapp-simple/qr'],
    enabled: status?.status === 'qr_pending',
    refetchInterval: 1000
  });

  // Query para configuración de IA
  const { data: chatbots } = useQuery({
    queryKey: ['/api/whatsapp-simple/auto-response-config']
  });

  // Mutaciones
  const initializeMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/whatsapp-simple/initialize'),
    onSuccess: () => {
      setShowQR(true);
      toast({
        title: 'WhatsApp Inicializado',
        description: 'Escanea el código QR que aparecerá para conectar tu WhatsApp',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-simple/status'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo inicializar WhatsApp',
        variant: 'destructive'
      });
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/whatsapp-simple/disconnect'),
    onSuccess: () => {
      setShowQR(false);
      toast({
        title: 'WhatsApp Desconectado',
        description: 'Tu WhatsApp se ha desconectado correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-simple/status'] });
    }
  });

  const restartMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/whatsapp-simple/restart'),
    onSuccess: () => {
      setShowQR(true);
      toast({
        title: 'WhatsApp Reiniciado',
        description: 'Escanea el nuevo código QR para reconectar',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-simple/status'] });
    }
  });

  const sendTestMutation = useMutation({
    mutationFn: (data: { to: string; message: string }) => 
      apiRequest('POST', '/api/whatsapp-simple/send-message', data),
    onSuccess: () => {
      toast({
        title: 'Mensaje Enviado',
        description: 'El mensaje de prueba se envió correctamente',
      });
      setTestMessage(prev => ({ ...prev, to: '', message: 'Hola! Este es un mensaje de prueba desde mi chatbot 🤖' }));
    },
    onError: (error: any) => {
      toast({
        title: 'Error al Enviar',
        description: error.message || 'No se pudo enviar el mensaje',
        variant: 'destructive'
      });
    }
  });

  const updateAiConfigMutation = useMutation({
    mutationFn: (data: any) => {
      const activeChatbot = chatbots?.chatbots?.find(bot => bot.status === 'active');
      if (!activeChatbot) throw new Error('No hay chatbot activo');
      
      return apiRequest('PATCH', `/api/whatsapp-simple/auto-response-config/${activeChatbot.id}`, {
        aiPersonality: data.personality,
        aiInstructions: data.instructions,
        conversationObjective: data.objective
      });
    },
    onSuccess: () => {
      toast({
        title: 'Configuración Actualizada',
        description: 'La configuración de IA se actualizó correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-simple/auto-response-config'] });
    }
  });

  // Efecto para mostrar QR automáticamente cuando esté listo
  useEffect(() => {
    if (status?.status === 'qr_pending') {
      setShowQR(true);
    } else if (status?.status === 'connected') {
      setShowQR(false);
    }
  }, [status?.status]);

  const currentStatus = status?.status || 'disconnected';
  const statusInfo = statusConfig[currentStatus];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <RiWhatsappLine className="w-12 h-12 text-green-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              WhatsApp Simple
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Conecta tu WhatsApp en 30 segundos y comienza a recibir respuestas automáticas con IA.
            Sin APIs complicadas, solo escanea un código QR.
          </p>
        </div>

        {/* Estado y Conexión */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={`${statusInfo.color} text-white`}>
                  {statusInfo.icon}
                  {statusInfo.text}
                </Badge>
                <div>
                  <CardTitle className="text-lg">{statusInfo.description}</CardTitle>
                  {status?.phoneNumber && (
                    <CardDescription>
                      {status.profileName} ({status.phoneNumber})
                    </CardDescription>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {currentStatus === 'disconnected' && (
                  <Button 
                    onClick={() => initializeMutation.mutate()}
                    disabled={initializeMutation.isPending}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {initializeMutation.isPending ? (
                      <RiRefreshLine className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <RiQrCodeLine className="w-5 h-5 mr-2" />
                    )}
                    Conectar WhatsApp
                  </Button>
                )}
                
                {currentStatus === 'connected' && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => restartMutation.mutate()}
                      disabled={restartMutation.isPending}
                    >
                      <RiRefreshLine className="w-4 h-4 mr-2" />
                      Reiniciar
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => disconnectMutation.mutate()}
                      disabled={disconnectMutation.isPending}
                    >
                      <RiWifiOffLine className="w-4 h-4 mr-2" />
                      Desconectar
                    </Button>
                  </>
                )}
                
                {(currentStatus === 'qr_pending' || currentStatus === 'error') && (
                  <Button 
                    variant="outline"
                    onClick={() => restartMutation.mutate()}
                    disabled={restartMutation.isPending}
                  >
                    <RiRefreshLine className="w-4 h-4 mr-2" />
                    Generar Nuevo QR
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          {/* Código QR */}
          {showQR && currentStatus === 'qr_pending' && (
            <CardContent>
              <div className="text-center space-y-4">
                <div className="bg-white p-6 rounded-lg inline-block shadow-lg">
                  {qrData?.qrCode ? (
                    <img 
                      src={qrData.qrCode} 
                      alt="Código QR de WhatsApp" 
                      className="w-64 h-64 mx-auto"
                    />
                  ) : (
                    <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
                      <RiRefreshLine className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    ¡Casi listo!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    1. Abre WhatsApp en tu teléfono<br/>
                    2. Ve a Configuración → Dispositivos Vinculados<br/>
                    3. Toca "Vincular un dispositivo"<br/>
                    4. Escanea este código QR
                  </p>
                </div>
              </div>
            </CardContent>
          )}

          {/* Error */}
          {currentStatus === 'error' && status?.lastError && (
            <CardContent>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <RiErrorWarningLine className="w-5 h-5" />
                  <span className="font-medium">Error:</span>
                  <span>{status.lastError}</span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Configuración de IA */}
        {currentStatus === 'connected' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RiRobotLine className="w-5 h-5 text-blue-500" />
                  Configuración de IA
                </CardTitle>
                <CardDescription>
                  Personaliza cómo responderá tu asistente automático
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="personality">Personalidad del Bot</Label>
                  <Input
                    id="personality"
                    value={aiConfig.personality}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, personality: e.target.value }))}
                    placeholder="Ej: Amigable y profesional"
                  />
                </div>
                
                <div>
                  <Label htmlFor="instructions">Instrucciones</Label>
                  <Textarea
                    id="instructions"
                    value={aiConfig.instructions}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Describe cómo debe comportarse tu bot"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="objective">Objetivo Principal</Label>
                  <Input
                    id="objective"
                    value={aiConfig.objective}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, objective: e.target.value }))}
                    placeholder="Ej: Vender productos, dar soporte, etc."
                  />
                </div>
                
                <Button 
                  onClick={() => updateAiConfigMutation.mutate(aiConfig)}
                  disabled={updateAiConfigMutation.isPending}
                  className="w-full"
                >
                  <RiSettingsLine className="w-4 h-4 mr-2" />
                  Actualizar Configuración
                </Button>
              </CardContent>
            </Card>

            {/* Enviar Mensaje de Prueba */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RiSendPlaneLine className="w-5 h-5 text-green-500" />
                  Mensaje de Prueba
                </CardTitle>
                <CardDescription>
                  Envía un mensaje para probar que todo funciona
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testTo">Número de destino (con código de país)</Label>
                  <Input
                    id="testTo"
                    value={testMessage.to}
                    onChange={(e) => setTestMessage(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="Ej: 5491123456789"
                  />
                </div>
                
                <div>
                  <Label htmlFor="testMessage">Mensaje</Label>
                  <Textarea
                    id="testMessage"
                    value={testMessage.message}
                    onChange={(e) => setTestMessage(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={() => sendTestMutation.mutate(testMessage)}
                  disabled={sendTestMutation.isPending || !testMessage.to || !testMessage.message}
                  className="w-full"
                >
                  <RiSendPlaneLine className="w-4 h-4 mr-2" />
                  Enviar Mensaje
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Información de ayuda */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <RiQrCodeLine className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  1. Conecta Fácil
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Solo escanea el código QR con tu WhatsApp. Sin APIs ni configuraciones complicadas.
                </p>
              </div>
              <div>
                <RiRobotLine className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  2. IA Automática
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tu asistente responderá automáticamente con inteligencia artificial personalizada.
                </p>
              </div>
              <div>
                <RiChatLine className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  3. Comienza Ya
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Empezarás a recibir y responder mensajes inmediatamente. ¡Es así de simple!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}