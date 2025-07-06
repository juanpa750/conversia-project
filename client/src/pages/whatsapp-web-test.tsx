import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import WhatsAppIntegration from '@/components/WhatsAppIntegration';

export default function WhatsAppWebTest() {
  const [location, setLocation] = useLocation();
  const [selectedChatbot, setSelectedChatbot] = useState<any>(null);

  // Get available chatbots
  const { data: chatbots } = useQuery({
    queryKey: ['/api/chatbots'],
  });

  // Use first chatbot for testing
  useEffect(() => {
    if (chatbots && Array.isArray(chatbots) && chatbots.length > 0 && !selectedChatbot) {
      setSelectedChatbot(chatbots[0]);
    }
  }, [chatbots, selectedChatbot]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setLocation('/chatbots')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Smartphone className="w-8 h-8 text-green-600" />
            WhatsApp Web Integration
          </h1>
          <p className="text-gray-600 mt-2">
            Conecta tu chatbot directamente con WhatsApp Web usando QR
          </p>
        </div>
      </div>

      {/* Chatbot Selection */}
      {chatbots && Array.isArray(chatbots) && chatbots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Chatbot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(chatbots) && chatbots.map((chatbot: any) => (
                <Card 
                  key={chatbot.id} 
                  className={`cursor-pointer transition-all ${
                    selectedChatbot?.id === chatbot.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedChatbot(chatbot)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{chatbot.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {chatbot.description}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        chatbot.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {chatbot.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                      {selectedChatbot?.id === chatbot.id && (
                        <span className="text-blue-600 text-sm font-medium">
                          Seleccionado
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Integration Component */}
      {selectedChatbot && (
        <WhatsAppIntegration 
          chatbotId={selectedChatbot.id.toString()} 
          chatbotName={selectedChatbot.name} 
        />
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Pasos para conectar:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Selecciona el chatbot que quieres conectar</li>
                <li>Haz clic en "Conectar WhatsApp"</li>
                <li>Escanea el código QR con tu WhatsApp</li>
                <li>¡Listo! Los mensajes se procesarán automáticamente</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Características:</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Conexión segura a través de WhatsApp Web</li>
                <li>Respuestas automáticas con IA</li>
                <li>Sesiones persistentes (24/7)</li>
                <li>Estadísticas en tiempo real</li>
                <li>Historial completo de mensajes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}