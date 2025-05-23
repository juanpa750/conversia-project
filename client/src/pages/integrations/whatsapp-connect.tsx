import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RiWhatsappLine, RiCheckLine, RiUser3Line, RiArrowUpSLine } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function WhatsAppConnect() {
  const { toast } = useToast();
  const [connectionStep, setConnectionStep] = useState<'start' | 'scanning' | 'connected'>('start');
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  // Simulación de código QR - en la implementación real esto vendría de la API de WhatsApp
  const qrCodeUrl = "data:image/png;base64,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";

  // Mutación para conectar WhatsApp
  const connectWhatsApp = useMutation({
    mutationFn: async (data: any) => {
      // En implementación real aquí se haría la petición a la API
      return await new Promise(resolve => setTimeout(() => resolve(data), 1500));
    },
    onSuccess: () => {
      setConnectionStep('connected');
      toast({
        title: "WhatsApp conectado exitosamente",
        description: "Tu número de WhatsApp ha sido vinculado correctamente con la plataforma.",
      });
    },
    onError: () => {
      toast({
        title: "Error al conectar WhatsApp",
        description: "No se pudo establecer la conexión. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const handleStartConnection = () => {
    setConnectionStep('scanning');
  };

  const handleManualConnection = () => {
    // En implementación real este código se conectaría a la API de WhatsApp
    connectWhatsApp.mutate({ phoneNumber });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conectar WhatsApp</h1>
        <p className="mt-1 text-sm text-gray-500">
          Escanea el código QR para vincular tu WhatsApp Business con la plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RiWhatsappLine className="h-6 w-6 text-green-600" />
                <span>Vincular WhatsApp Business</span>
              </CardTitle>
              <CardDescription>
                Conéctate en segundos escaneando el código QR con tu teléfono
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6">
              {connectionStep === 'start' && (
                <div className="flex flex-col items-center space-y-6 p-6">
                  <div className="rounded-full bg-green-100 p-6">
                    <RiWhatsappLine className="h-16 w-16 text-green-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-medium text-lg">Conecta tu WhatsApp Business</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      Vincular tu WhatsApp es muy simple. Solo haz clic en el botón para generar 
                      un código QR y escanearlo con tu teléfono.
                    </p>
                  </div>
                  <Button onClick={handleStartConnection} className="bg-green-600 hover:bg-green-700">
                    Generar código QR
                  </Button>
                </div>
              )}
              
              {connectionStep === 'scanning' && (
                <div className="flex flex-col items-center space-y-6 p-6">
                  <div className="p-4 border-2 border-green-500 rounded-lg">
                    <img src={qrCodeUrl} alt="Código QR WhatsApp" className="h-64 w-64" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-medium text-lg">Escanea este código QR</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      Abre WhatsApp en tu teléfono, ve a Configuración &gt; Dispositivos vinculados &gt; 
                      Vincular un dispositivo, y escanea este código QR.
                    </p>
                  </div>
                  <div className="w-full max-w-xs space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">¿Problemas con el escaneo?</p>
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                      <input
                        type="text"
                        placeholder="+1234567890"
                        className="flex-1 p-2 text-sm outline-none"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                      <Button 
                        variant="ghost" 
                        className="h-full" 
                        onClick={handleManualConnection}
                        disabled={!phoneNumber || connectWhatsApp.isPending}
                      >
                        <RiArrowUpSLine className="h-5 w-5 transform rotate-90" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {connectionStep === 'connected' && (
                <div className="flex flex-col items-center space-y-6 p-6">
                  <div className="rounded-full bg-green-100 p-6">
                    <RiCheckLine className="h-16 w-16 text-green-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-medium text-lg">¡WhatsApp conectado exitosamente!</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      Tu WhatsApp Business ya está vinculado con la plataforma. 
                      Ahora puedes configurar tu chatbot y empezar a automatizar conversaciones.
                    </p>
                  </div>
                  <Button asChild>
                    <a href="/integrations/whatsapp-bot">Configurar Chatbot</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Instrucciones</CardTitle>
              <CardDescription>
                Sigue estos pasos para conectar WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className={`flex items-center gap-3 ${connectionStep !== 'start' ? 'text-green-600' : ''}`}>
                  <div className={`rounded-full h-6 w-6 flex items-center justify-center text-white ${
                    connectionStep !== 'start' ? 'bg-green-600' : 'bg-gray-300'
                  }`}>
                    {connectionStep !== 'start' ? <RiCheckLine className="h-4 w-4" /> : <span>1</span>}
                  </div>
                  <p className="font-medium">Preparar el teléfono</p>
                </div>
                <p className="text-sm text-gray-500 ml-9">
                  Asegúrate de tener instalado WhatsApp Business y una conexión estable a Internet.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className={`flex items-center gap-3 ${connectionStep === 'connected' ? 'text-green-600' : ''}`}>
                  <div className={`rounded-full h-6 w-6 flex items-center justify-center text-white ${
                    connectionStep === 'connected' ? 'bg-green-600' : connectionStep === 'scanning' ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    {connectionStep === 'connected' ? <RiCheckLine className="h-4 w-4" /> : <span>2</span>}
                  </div>
                  <p className="font-medium">Escanear el código QR</p>
                </div>
                <p className="text-sm text-gray-500 ml-9">
                  Abre WhatsApp Business, ve a Configuración &gt; Dispositivos vinculados y escanea el código QR.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className={`flex items-center gap-3 ${connectionStep === 'connected' ? 'text-green-600' : ''}`}>
                  <div className={`rounded-full h-6 w-6 flex items-center justify-center text-white ${
                    connectionStep === 'connected' ? 'bg-green-600' : 'bg-gray-300'
                  }`}>
                    {connectionStep === 'connected' ? <RiCheckLine className="h-4 w-4" /> : <span>3</span>}
                  </div>
                  <p className="font-medium">Confirmar conexión</p>
                </div>
                <p className="text-sm text-gray-500 ml-9">
                  Confirma la vinculación en tu teléfono cuando se te solicite y espera el mensaje de confirmación.
                </p>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-sm mb-2">Beneficios</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-start gap-2">
                    <RiCheckLine className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Conexión segura y simple con escaneo de código QR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckLine className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Sin necesidad de complicadas configuraciones técnicas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckLine className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Permite automatizar respuestas y atención al cliente 24/7</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}