import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { 
  RiWhatsappLine, 
  RiQrCodeLine, 
  RiCheckLine, 
  RiRobotLine,
  RiUser3Line,
  RiSendPlaneLine,
  RiSparklingLine,
  RiLightbulbLine,
  RiTimerLine
} from 'react-icons/ri';

interface DemoMessage {
  id: number;
  fromNumber: string;
  message: string;
  response?: string;
  timestamp: Date;
  status: 'sent' | 'responding' | 'responded';
}

export default function WhatsAppAIDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [fromNumber, setFromNumber] = useState('+1234567890');
  const { toast } = useToast();

  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'qr_pending' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string>('');

  const sendTestMessage = useMutation({
    mutationFn: async (data: { fromNumber: string; message: string }) => {
      return apiRequest('POST', '/api/whatsapp-simple/send-test-message', data);
    },
    onSuccess: () => {
      const message: DemoMessage = {
        id: Date.now(),
        fromNumber,
        message: newMessage,
        timestamp: new Date(),
        status: 'sent'
      };
      
      setMessages(prev => [...prev, message]);
      
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: 'responding' as const }
              : msg
          )
        );
      }, 500);

      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { 
                  ...msg, 
                  response: generateAIResponse(newMessage),
                  status: 'responded' as const
                }
              : msg
          )
        );
      }, 2000 + Math.random() * 1000);

      setNewMessage('');
    },
    onError: (error: any) => {
      toast({
        title: "Error en la demostración",
        description: error.message || "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    },
  });

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('hi')) {
      return 'Hola! Bienvenido a nuestro negocio. Soy tu asistente virtual y estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?';
    }
    if (lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
      return 'Te ayudo con información sobre precios. Tenemos promociones especiales este mes. ¿Qué producto te interesa específicamente?';
    }
    if (lowerMessage.includes('disponible') || lowerMessage.includes('stock')) {
      return 'Verifico la disponibilidad del producto inmediatamente. Mantenemos nuestro inventario actualizado en tiempo real.';
    }
    if (lowerMessage.includes('horario') || lowerMessage.includes('hora')) {
      return 'Nuestro horario de atención es de Lunes a Viernes de 9:00 AM a 6:00 PM. Los fines de semana de 10:00 AM a 2:00 PM.';
    }
    if (lowerMessage.includes('información') || lowerMessage.includes('info')) {
      return 'Con gusto te proporciono toda la información que necesites. Contamos con productos de alta calidad y excelente servicio al cliente.';
    }
    return 'Gracias por contactarnos. He registrado tu consulta y te proporcionaré la información que necesitas. ¿Hay algo específico en lo que pueda ayudarte?';
  };

  const startDemo = () => {
    setCurrentStep(2);
    setConnectionStatus('qr_pending');
    
    setTimeout(() => {
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-demo-connection');
    }, 1000);

    setTimeout(() => {
      setConnectionStatus('connected');
      setCurrentStep(3);
      toast({
        title: "WhatsApp Conectado",
        description: "El sistema está listo para recibir mensajes automáticamente",
      });
    }, 5000);
  };

  const predefinedMessages = [
    'Hola, ¿tienen productos disponibles?',
    'Buenos días, quisiera información sobre precios',
    '¿Cuál es el horario de atención?',
    'Me interesa conocer más sobre sus servicios',
    'Necesito soporte técnico'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <RiWhatsappLine className="w-10 h-10 text-green-500" />
            <RiSparklingLine className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            WhatsApp AI Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Descubre cómo funciona nuestro sistema de respuestas automáticas inteligentes para WhatsApp
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6 text-center">
              <RiTimerLine className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                Setup en 3 Minutos
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Solo escanea el código QR y listo. Sin configuraciones complejas.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-6 text-center">
              <RiRobotLine className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                IA Sin Costo Extra
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Respuestas inteligentes incluidas. No necesitas pagar APIs costosas.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
            <CardContent className="p-6 text-center">
              <RiLightbulbLine className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                24/7 Automático
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Responde a tus clientes las 24 horas, incluso cuando duermes.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {currentStep === 1 && (
            <Card className="border-2 border-dashed border-blue-300">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  Paso 1: Iniciar Demostración
                </CardTitle>
                <CardDescription className="text-lg">
                  Haz clic para ver cómo funciona el sistema completo
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  onClick={startDemo}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  <RiWhatsappLine className="w-5 h-5 mr-2" />
                  Comenzar Demo
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep >= 2 && (
            <Card className={`border-2 ${connectionStatus === 'connected' ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-blue-300'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RiQrCodeLine className="w-6 h-6" />
                  Paso 2: Conectar WhatsApp
                  {connectionStatus === 'connected' && (
                    <Badge className="bg-green-100 text-green-800">
                      <RiCheckLine className="w-4 h-4 mr-1" />
                      Conectado
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {connectionStatus === 'qr_pending' && 'Escanea el código QR con tu WhatsApp'}
                  {connectionStatus === 'connected' && 'WhatsApp conectado exitosamente'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connectionStatus === 'qr_pending' && qrCode && (
                  <div className="text-center">
                    <img 
                      src={qrCode} 
                      alt="QR Code" 
                      className="mx-auto mb-4 border-2 border-gray-200 rounded-lg"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Simulando conexión... (automático en 5 segundos)
                    </p>
                  </div>
                )}
                {connectionStatus === 'connected' && (
                  <div className="text-center text-green-700 dark:text-green-300">
                    <RiCheckLine className="w-16 h-16 mx-auto mb-2 text-green-500" />
                    <p className="font-semibold">Conectado exitosamente!</p>
                    <p className="text-sm">Número: +1234567890 • Perfil: Demo Business</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep >= 3 && (
            <Card className="border-2 border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RiRobotLine className="w-6 h-6 text-purple-500" />
                  Paso 3: Prueba las Respuestas Automáticas
                </CardTitle>
                <CardDescription>
                  Simula mensajes de clientes y observa las respuestas instantáneas de la IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phoneNumber">Número de cliente (simulado)</Label>
                      <Input
                        id="phoneNumber"
                        value={fromNumber}
                        onChange={(e) => setFromNumber(e.target.value)}
                        placeholder="+1234567890"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Mensaje del cliente</Label>
                      <Textarea
                        id="message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje como si fueras un cliente..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Mensajes de ejemplo:</Label>
                      <div className="flex flex-wrap gap-2">
                        {predefinedMessages.map((msg, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setNewMessage(msg)}
                            className="text-xs"
                          >
                            {msg}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => sendTestMessage.mutate({ fromNumber, message: newMessage })}
                      disabled={sendTestMessage.isPending || !newMessage.trim()}
                      className="w-full"
                    >
                      <RiSendPlaneLine className="w-4 h-4 mr-2" />
                      {sendTestMessage.isPending ? 'Enviando...' : 'Enviar Mensaje'}
                    </Button>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">Conversación en Tiempo Real</Label>
                    <Card className="mt-2 h-96 overflow-y-auto">
                      <CardContent className="p-4 space-y-4">
                        {messages.length === 0 && (
                          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            <RiWhatsappLine className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Envía un mensaje para ver la magia en acción</p>
                          </div>
                        )}
                        
                        {messages.map((msg) => (
                          <div key={msg.id} className="space-y-2">
                            <div className="flex items-start gap-2">
                              <RiUser3Line className="w-5 h-5 text-blue-500 mt-1" />
                              <div className="flex-1">
                                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 max-w-xs">
                                  <p className="text-sm">{msg.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {msg.fromNumber} • {msg.timestamp.toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {msg.status === 'responding' && (
                              <div className="flex items-start gap-2 ml-6">
                                <RiRobotLine className="w-5 h-5 text-green-500 mt-1" />
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-xs">
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <span className="text-xs text-gray-500 ml-2">Escribiendo...</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {msg.status === 'responded' && msg.response && (
                              <div className="flex items-start gap-2 ml-6">
                                <RiRobotLine className="w-5 h-5 text-green-500 mt-1" />
                                <div className="flex-1">
                                  <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 max-w-xs">
                                    <p className="text-sm">{msg.response}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Asistente IA • Respuesta automática
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {currentStep >= 3 && (
          <Card className="border-2 border-gradient-to-r from-green-500 to-blue-500 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 mt-8">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">¿Listo para automatizar tu negocio?</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Implementa este sistema en tu WhatsApp real en menos de 5 minutos
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-green-500 hover:bg-green-600">
                  <RiWhatsappLine className="w-5 h-5 mr-2" />
                  Conectar Mi WhatsApp
                </Button>
                <Button size="lg" variant="outline">
                  Ver Planes y Precios
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}