import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  RiWhatsappLine, 
  RiCheckLine, 
  RiCloseLine, 
  RiErrorWarningLine,
  RiSendPlaneLine,
  RiMessageLine,
  RiSettings3Line,
  RiPhoneLine,
  RiUserLine,
  RiTimeLine,
  RiRefreshLine
} from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface WhatsAppIntegration {
  id: number;
  phoneNumber: string;
  displayName: string;
  businessDescription?: string;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  connectedAt?: string;
  lastError?: string;
  messagesSent: number;
  messagesReceived: number;
  lastMessageAt?: string;
}

interface WhatsAppMessage {
  id: number;
  messageId: string;
  conversationId: string;
  fromNumber: string;
  toNumber: string;
  messageType: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: string;
  timestamp: string;
}

export default function WhatsAppIntegration() {
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("¡Hola! Este es un mensaje de prueba desde mi chatbot.");
  const [connectionForm, setConnectionForm] = useState({
    phoneNumber: "",
    displayName: "",
    businessDescription: "",
    accessToken: "",
    phoneNumberId: "",
    businessAccountId: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get integration status
  const { data: integration, isLoading } = useQuery<WhatsAppIntegration>({
    queryKey: ["/api/whatsapp/integration"],
  });

  // Get recent messages
  const { data: messages } = useQuery<WhatsAppMessage[]>({
    queryKey: ["/api/whatsapp/messages"],
    enabled: integration?.status === 'connected',
  });

  // Connect WhatsApp
  const connectMutation = useMutation({
    mutationFn: async (data: typeof connectionForm) => {
      const res = await apiRequest("POST", "/api/whatsapp/connect", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/integration"] });
        toast({
          title: "WhatsApp conectado",
          description: "La integración se ha configurado correctamente",
        });
        setConnectionForm({
          phoneNumber: "",
          displayName: "",
          businessDescription: "",
          accessToken: "",
          phoneNumberId: "",
          businessAccountId: ""
        });
      } else {
        toast({
          title: "Error de conexión",
          description: data.message || "No se pudo conectar WhatsApp",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error conectando WhatsApp",
        variant: "destructive",
      });
    },
  });

  // Disconnect WhatsApp
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/settings/whatsapp/disconnect", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/integration"] });
      toast({
        title: "WhatsApp desconectado",
        description: "La integración ha sido desconectada",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error desconectando WhatsApp",
        variant: "destructive",
      });
    },
  });

  // Test connection
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/whatsapp/test-connection", {});
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Conexión verificada",
          description: "WhatsApp está funcionando correctamente",
        });
      } else {
        toast({
          title: "Error de conexión",
          description: data.message,
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/integration"] });
    },
  });

  // Send test message
  const sendTestMutation = useMutation({
    mutationFn: async (data: { to: string; message: string }) => {
      const res = await apiRequest("POST", "/api/whatsapp/send-message", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Mensaje enviado",
          description: "El mensaje de prueba se envió correctamente",
        });
        setTestPhone("");
        setTestMessage("¡Hola! Este es un mensaje de prueba desde mi chatbot.");
        queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/messages"] });
      } else {
        toast({
          title: "Error enviando mensaje",
          description: data.error || "No se pudo enviar el mensaje",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error enviando mensaje",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><RiCheckLine className="w-3 h-3 mr-1" />Conectado</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-800"><RiTimeLine className="w-3 h-3 mr-1" />Conectando</Badge>;
      case 'error':
        return <Badge variant="destructive"><RiErrorWarningLine className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary"><RiCloseLine className="w-3 h-3 mr-1" />Desconectado</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <RiWhatsappLine className="w-8 h-8 text-green-600" />
            Integración WhatsApp
          </h1>
          <p className="text-gray-600 mt-2">
            Conecta tu negocio con WhatsApp Business API para automatizar conversaciones
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Estado General</TabsTrigger>
          <TabsTrigger value="setup">Configuración</TabsTrigger>
          <TabsTrigger value="messages">Mensajes</TabsTrigger>
          <TabsTrigger value="test">Pruebas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RiSettings3Line className="w-5 h-5" />
                  Estado de Conexión
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {integration ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Estado:</span>
                      {getStatusBadge(integration.status)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <RiPhoneLine className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Número:</span>
                      <span className="font-mono">{integration.phoneNumber}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <RiUserLine className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Negocio:</span>
                      <span>{integration.displayName}</span>
                    </div>

                    {integration.connectedAt && (
                      <div className="flex items-center gap-2">
                        <RiTimeLine className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Conectado:</span>
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(integration.connectedAt), {
                            addSuffix: true,
                            locale: es
                          })}
                        </span>
                      </div>
                    )}

                    {integration.lastError && integration.status === 'error' && (
                      <Alert variant="destructive">
                        <RiErrorWarningLine className="h-4 w-4" />
                        <AlertDescription>
                          {integration.lastError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnectionMutation.mutate()}
                        disabled={testConnectionMutation.isPending || integration.status !== 'connected'}
                      >
                        <RiRefreshLine className="w-4 h-4 mr-2" />
                        Verificar Conexión
                      </Button>
                      
                      {integration.status === 'connected' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => disconnectMutation.mutate()}
                          disabled={disconnectMutation.isPending}
                        >
                          <RiCloseLine className="w-4 h-4 mr-2" />
                          Desconectar
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <RiWhatsappLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">WhatsApp no está configurado</p>
                    <p className="text-sm text-gray-500">
                      Ve a la pestaña "Configuración" para conectar tu cuenta de WhatsApp Business
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RiMessageLine className="w-5 h-5" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {integration ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {integration.messagesSent || 0}
                        </div>
                        <div className="text-sm text-blue-600">Enviados</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {integration.messagesReceived || 0}
                        </div>
                        <div className="text-sm text-green-600">Recibidos</div>
                      </div>
                    </div>
                    
                    {integration.lastMessageAt && (
                      <div className="text-center pt-4 border-t">
                        <div className="text-sm text-gray-600">Último mensaje</div>
                        <div className="text-sm font-medium">
                          {formatDistanceToNow(new Date(integration.lastMessageAt), {
                            addSuffix: true,
                            locale: es
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>Conecta WhatsApp para ver estadísticas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurar WhatsApp Business API</CardTitle>
              <CardDescription>
                Conecta tu cuenta de WhatsApp Business para comenzar a enviar y recibir mensajes automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phoneNumber">Número de teléfono</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+57XXXXXXXXXX"
                    value={connectionForm.phoneNumber}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Nombre del negocio</Label>
                  <Input
                    id="displayName"
                    placeholder="Mi Empresa"
                    value={connectionForm.displayName}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessDescription">Descripción del negocio</Label>
                <Textarea
                  id="businessDescription"
                  placeholder="Describe brevemente tu negocio..."
                  value={connectionForm.businessDescription}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, businessDescription: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="Token de acceso de WhatsApp"
                    value={connectionForm.accessToken}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, accessToken: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                  <Input
                    id="phoneNumberId"
                    placeholder="ID del número de teléfono"
                    value={connectionForm.phoneNumberId}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessAccountId">Business Account ID</Label>
                <Input
                  id="businessAccountId"
                  placeholder="ID de la cuenta de negocio"
                  value={connectionForm.businessAccountId}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, businessAccountId: e.target.value }))}
                />
              </div>

              <Button
                onClick={() => connectMutation.mutate(connectionForm)}
                disabled={connectMutation.isPending || !connectionForm.phoneNumber || !connectionForm.displayName}
                className="w-full"
              >
                {connectMutation.isPending ? (
                  "Conectando..."
                ) : (
                  <>
                    <RiWhatsappLine className="w-4 h-4 mr-2" />
                    Conectar WhatsApp
                  </>
                )}
              </Button>

              <Alert>
                <RiErrorWarningLine className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Necesitas una cuenta de WhatsApp Business API válida. 
                  Contacta con WhatsApp Business para obtener las credenciales necesarias.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Mensajes</CardTitle>
              <CardDescription>
                Últimos mensajes enviados y recibidos a través de WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messages && messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg border ${
                        message.direction === 'outbound'
                          ? 'bg-blue-50 border-blue-200 ml-8'
                          : 'bg-gray-50 border-gray-200 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={message.direction === 'outbound' ? 'default' : 'secondary'}>
                            {message.direction === 'outbound' ? 'Enviado' : 'Recibido'}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {message.direction === 'outbound' ? `Para: ${message.toNumber}` : `De: ${message.fromNumber}`}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.timestamp), {
                            addSuffix: true,
                            locale: es
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <div className="flex justify-end mt-2">
                        <Badge variant="outline" className="text-xs">
                          {message.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <RiMessageLine className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No hay mensajes aún</p>
                  <p className="text-sm">Los mensajes aparecerán aquí cuando empieces a usar WhatsApp</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensaje de Prueba</CardTitle>
              <CardDescription>
                Prueba la integración enviando un mensaje a cualquier número de WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testPhone">Número de destino</Label>
                <Input
                  id="testPhone"
                  placeholder="+57XXXXXXXXXX"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="testMessage">Mensaje</Label>
                <Textarea
                  id="testMessage"
                  placeholder="Escribe tu mensaje de prueba..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={() => sendTestMutation.mutate({ to: testPhone, message: testMessage })}
                disabled={
                  sendTestMutation.isPending || 
                  !testPhone || 
                  !testMessage || 
                  integration?.status !== 'connected'
                }
                className="w-full"
              >
                {sendTestMutation.isPending ? (
                  "Enviando..."
                ) : (
                  <>
                    <RiSendPlaneLine className="w-4 h-4 mr-2" />
                    Enviar Mensaje de Prueba
                  </>
                )}
              </Button>

              {integration?.status !== 'connected' && (
                <Alert>
                  <RiErrorWarningLine className="h-4 w-4" />
                  <AlertDescription>
                    WhatsApp debe estar conectado para enviar mensajes de prueba
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}