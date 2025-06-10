import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageCircle, 
  Phone, 
  Settings,
  ExternalLink,
  Copy,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  verifyToken: string;
  monthlyFreeMessagesUsed: number;
  freeMessagesLimit: number;
}

interface ConnectionStatus {
  connected: boolean;
  phoneNumber?: string;
  error?: string;
}

export default function WhatsAppCloudIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<WhatsAppConfig>({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    verifyToken: '',
    monthlyFreeMessagesUsed: 0,
    freeMessagesLimit: 1000
  });
  
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('¡Hola! Este es un mensaje de prueba desde WhatsApp Business API.');

  // Get current configuration
  const { data: currentConfig, isLoading: configLoading } = useQuery({
    queryKey: ['/api/auth/me']
  });

  // Get connection status
  const { data: status, refetch: refetchStatus } = useQuery<ConnectionStatus>({
    queryKey: ['/api/whatsapp/cloud/status'],
    refetchInterval: 5000
  });

  // Get config validation
  const { data: validation, refetch: refetchValidation } = useQuery({
    queryKey: ['/api/whatsapp/cloud/config'],
    refetchInterval: 10000
  });

  useEffect(() => {
    if (currentConfig) {
      setConfig({
        accessToken: currentConfig.whatsappAccessToken || '',
        phoneNumberId: currentConfig.whatsappPhoneNumberId || '',
        businessAccountId: currentConfig.whatsappBusinessAccountId || '',
        verifyToken: currentConfig.whatsappVerifyToken || '',
        monthlyFreeMessagesUsed: currentConfig.monthlyFreeMessagesUsed || 0,
        freeMessagesLimit: 1000
      });
    }
  }, [currentConfig]);

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: Partial<WhatsAppConfig>) => {
      const response = await fetch('/api/auth/update-whatsapp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración de WhatsApp se guardó correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      refetchValidation();
      refetchStatus();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Test message mutation
  const testMessageMutation = useMutation({
    mutationFn: async ({ phoneNumber }: { phoneNumber: string }) => {
      const response = await fetch('/api/whatsapp/cloud/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send test message');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Mensaje enviado",
          description: "El mensaje de prueba se envió correctamente.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo enviar el mensaje",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSaveConfig = () => {
    saveConfigMutation.mutate(config);
  };

  const handleTestMessage = () => {
    if (!testPhone) {
      toast({
        title: "Error", 
        description: "Ingresa un número de teléfono",
        variant: "destructive"
      });
      return;
    }
    testMessageMutation.mutate({ phoneNumber: testPhone });
  };

  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/webhook/whatsapp`;
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL copiada",
      description: "La URL del webhook se copió al portapapeles.",
    });
  };

  const remainingMessages = config.freeMessagesLimit - config.monthlyFreeMessagesUsed;
  const usagePercentage = (config.monthlyFreeMessagesUsed / config.freeMessagesLimit) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Business Cloud API</h1>
          <p className="text-gray-600 mt-2">
            Integración oficial con Meta Cloud API - 1000 conversaciones gratuitas mensuales
          </p>
        </div>
        {status?.connected && (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-4 h-4 mr-2" />
            Conectado: {status.phoneNumber}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Configuración</TabsTrigger>
          <TabsTrigger value="status">Estado</TabsTrigger>
          <TabsTrigger value="test">Pruebas</TabsTrigger>
          <TabsTrigger value="docs">Documentación</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración de la API
              </CardTitle>
              <CardDescription>
                Configura las credenciales de WhatsApp Business Cloud API de Meta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="EAAxxxxxx"
                    value={config.accessToken}
                    onChange={(e) => setConfig({...config, accessToken: e.target.value})}
                  />
                  <p className="text-sm text-gray-500">
                    Token de acceso de Facebook App
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                  <Input
                    id="phoneNumberId"
                    placeholder="123456789"
                    value={config.phoneNumberId}
                    onChange={(e) => setConfig({...config, phoneNumberId: e.target.value})}
                  />
                  <p className="text-sm text-gray-500">
                    ID del número verificado en WhatsApp Business
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessAccountId">Business Account ID</Label>
                  <Input
                    id="businessAccountId"
                    placeholder="Opcional"
                    value={config.businessAccountId}
                    onChange={(e) => setConfig({...config, businessAccountId: e.target.value})}
                  />
                  <p className="text-sm text-gray-500">
                    ID de la cuenta comercial (opcional)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="verifyToken">Verify Token</Label>
                  <Input
                    id="verifyToken"
                    placeholder="mi_token_secreto"
                    value={config.verifyToken}
                    onChange={(e) => setConfig({...config, verifyToken: e.target.value})}
                  />
                  <p className="text-sm text-gray-500">
                    Token para verificar webhook
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">URL del Webhook</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {window.location.origin}/webhook/whatsapp
                    </code>
                    <Button size="sm" variant="outline" onClick={copyWebhookUrl}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSaveConfig} 
                  disabled={saveConfigMutation.isPending}
                >
                  {saveConfigMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Mensajes Gratuitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usados este mes</span>
                    <span>{config.monthlyFreeMessagesUsed} / {config.freeMessagesLimit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {remainingMessages} mensajes restantes
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Estado de Conexión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {status?.connected ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Conectado</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span>Desconectado</span>
                    </div>
                  )}
                  
                  {status?.phoneNumber && (
                    <p className="text-sm text-gray-600">
                      Número: {status.phoneNumber}
                    </p>
                  )}
                  
                  {status?.error && (
                    <p className="text-sm text-red-600">
                      Error: {status.error}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Validación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validation?.isValid ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Configuración válida</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span>Configuración incompleta</span>
                      </div>
                      {validation?.errors?.map((error: string, index: number) => (
                        <p key={index} className="text-xs text-red-600">
                          • {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Enviar Mensaje de Prueba
              </CardTitle>
              <CardDescription>
                Prueba la integración enviando un mensaje de prueba
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testPhone">Número de teléfono</Label>
                  <Input
                    id="testPhone"
                    placeholder="+521234567890"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Incluye código de país (ej: +52 para México)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="testMessage">Mensaje</Label>
                  <Textarea
                    id="testMessage"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleTestMessage}
                disabled={testMessageMutation.isPending || !status?.connected}
                className="w-full md:w-auto"
              >
                {testMessageMutation.isPending ? 'Enviando...' : 'Enviar Mensaje de Prueba'}
              </Button>
              
              {!status?.connected && (
                <Alert>
                  <AlertDescription>
                    La API debe estar conectada para enviar mensajes de prueba.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guía de Configuración</CardTitle>
              <CardDescription>
                Pasos para configurar WhatsApp Business Cloud API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">1. Crear App en Facebook Developers</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm ml-4">
                    <li>Ve a <a href="https://developers.facebook.com" target="_blank" className="text-blue-600 hover:underline">developers.facebook.com</a></li>
                    <li>Crea una nueva App → Tipo: Business</li>
                    <li>Agrega el producto "WhatsApp Business API"</li>
                    <li>Configura el webhook con la URL mostrada arriba</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">2. Configurar Webhook</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm ml-4">
                    <li>En Facebook Developers, ve a WhatsApp → Configuration</li>
                    <li>Agrega la URL del webhook: <code className="bg-gray-100 px-1 rounded">{window.location.origin}/webhook/whatsapp</code></li>
                    <li>Usa el verify token que configuraste arriba</li>
                    <li>Suscríbete a los eventos: messages</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">3. Verificar Número de Teléfono</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm ml-4">
                    <li>En WhatsApp → API Setup, agrega tu número comercial</li>
                    <li>Completa el proceso de verificación por SMS</li>
                    <li>Copia el Phone Number ID y pégalo en la configuración</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">4. Obtener Access Token</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm ml-4">
                    <li>En WhatsApp → API Setup, genera un token temporal</li>
                    <li>Para producción, crea un token permanente en System Users</li>
                    <li>Copia el token y pégalo en la configuración</li>
                  </ol>
                </div>
                
                <Alert>
                  <AlertDescription>
                    <strong>Importante:</strong> Meta te da 1000 conversaciones gratuitas por mes. 
                    Las conversaciones iniciadas por el cliente son completamente gratuitas dentro de la ventana de 24 horas.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}