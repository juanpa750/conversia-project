import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { RiSendPlaneLine, RiRobotLine, RiUser3Line } from 'react-icons/ri';

interface TestMessage {
  id: number;
  fromNumber: string;
  message: string;
  response?: string;
  timestamp: Date;
  status: 'sent' | 'responded';
}

export default function TestMessageForm() {
  const [fromNumber, setFromNumber] = useState('+1234567890');
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<TestMessage[]>([]);
  const { toast } = useToast();

  const sendTestMessage = useMutation({
    mutationFn: async (data: { fromNumber: string; message: string }) => {
      return apiRequest('POST', '/api/whatsapp-simple/send-test-message', data);
    },
    onSuccess: () => {
      const newMessage: TestMessage = {
        id: Date.now(),
        fromNumber,
        message,
        timestamp: new Date(),
        status: 'sent'
      };
      
      setConversations(prev => [...prev, newMessage]);
      
      // Simular respuesta después de 2-3 segundos
      setTimeout(() => {
        setConversations(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { 
                  ...msg, 
                  response: generateMockResponse(message),
                  status: 'responded' as const
                }
              : msg
          )
        );
      }, 2000 + Math.random() * 1000);

      setMessage('');
      toast({
        title: "Mensaje enviado",
        description: "Esperando respuesta automática...",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    },
  });

  const generateMockResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('hi')) {
      return '¡Hola! 👋 Gracias por contactarnos. ¿En qué podemos ayudarte hoy?';
    }
    if (lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
      return 'Para información sobre precios y promociones especiales, déjame conectarte con un asesor especializado.';
    }
    if (lowerMessage.includes('disponible') || lowerMessage.includes('stock')) {
      return 'Verifico la disponibilidad del producto. Un momento por favor...';
    }
    if (lowerMessage.includes('información') || lowerMessage.includes('info')) {
      return 'Te ayudo con información sobre nuestros productos y servicios. ¿Qué te interesa conocer?';
    }
    return 'Gracias por tu mensaje. Un asesor te responderá pronto para brindarte la mejor atención.';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendTestMessage.mutate({ fromNumber, message });
  };

  const predefinedMessages = [
    'Hola, ¿tienen productos disponibles?',
    'Buenos días, quisiera información sobre precios',
    '¿Cuál es el horario de atención?',
    'Me interesa conocer más sobre sus servicios'
  ];

  return (
    <div className="space-y-6">
      {/* Formulario de mensaje de prueba */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fromNumber">Número de teléfono (simulado)</Label>
            <Input
              id="fromNumber"
              value={fromNumber}
              onChange={(e) => setFromNumber(e.target.value)}
              placeholder="+1234567890"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="message">Mensaje de prueba</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje para probar las respuestas automáticas..."
            rows={3}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {predefinedMessages.map((msg, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMessage(msg)}
              className="text-xs"
            >
              {msg}
            </Button>
          ))}
        </div>

        <Button 
          type="submit" 
          disabled={sendTestMessage.isPending || !message.trim()}
          className="w-full"
        >
          <RiSendPlaneLine className="w-4 h-4 mr-2" />
          {sendTestMessage.isPending ? 'Enviando...' : 'Enviar Mensaje de Prueba'}
        </Button>
      </form>

      {/* Conversaciones en tiempo real */}
      {conversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Conversaciones en Tiempo Real</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {conversations.map((conv) => (
              <div key={conv.id} className="space-y-2">
                {/* Mensaje del usuario */}
                <div className="flex items-start space-x-2">
                  <RiUser3Line className="w-5 h-5 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-sm">{conv.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {conv.fromNumber} • {conv.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Respuesta automática */}
                {conv.status === 'responded' && conv.response && (
                  <div className="flex items-start space-x-2 ml-8">
                    <RiRobotLine className="w-5 h-5 text-green-500 mt-1" />
                    <div className="flex-1">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <p className="text-sm">{conv.response}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Bot • Respuesta automática
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Indicador de typing */}
                {conv.status === 'sent' && (
                  <div className="flex items-start space-x-2 ml-8">
                    <RiRobotLine className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}