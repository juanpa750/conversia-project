import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Smartphone, MessageCircle, CheckCircle, Clock, AlertCircle, QrCode } from "lucide-react";

interface ConnectionStatus {
  success: boolean;
  status: string;
  isConnected: boolean;
  qrCode?: string;
  businessName?: string;
  businessType?: string;
  messagesSent: number;
  messagesReceived: number;
}

export default function WhatsApp() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [businessForm, setBusinessForm] = useState({
    businessName: "",
    businessType: "",
    businessDescription: "",
  });
  const [testMessage, setTestMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{
    id: number;
    message: string;
    response?: string;
    timestamp: Date;
    isUser: boolean;
  }>>([]);

  // Obtener estado de conexión
  const { data: status, isLoading } = useQuery<ConnectionStatus>({
    queryKey: ["/api/simple/status"],
    refetchInterval: 2000, // Actualizar cada 2 segundos
  });

  // Configurar negocio
  const setupMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/simple/setup-business", data);
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Negocio configurado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/simple/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error configurando el negocio",
        variant: "destructive",
      });
    },
  });

  // Conectar WhatsApp
  const connectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/simple/connect-whatsapp", {});
    },
    onSuccess: () => {
      toast({
        title: "Conectando",
        description: "Código QR generado. Escanea con WhatsApp.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/simple/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al conectar WhatsApp",
        variant: "destructive",
      });
    },
  });

  // Desconectar WhatsApp
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/simple/disconnect", {});
    },
    onSuccess: () => {
      toast({
        title: "Desconectado",
        description: "WhatsApp desconectado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/simple/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al desconectar WhatsApp",
        variant: "destructive",
      });
    },
  });

  // Simular mensaje
  const testMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Enviando mensaje:', data);
      const response = await apiRequest("POST", "/api/simple/simulate-message", data);
      console.log('Respuesta del servidor:', response);
      return response;
    },
    onSuccess: (data: any) => {
      console.log('onSuccess ejecutado con data:', data);
      
      // Agregar el mensaje del usuario
      const userMessage = {
        id: Date.now(),
        message: testMessage,
        timestamp: new Date(),
        isUser: true
      };
      
      // Agregar la respuesta de la IA
      const aiResponse = {
        id: Date.now() + 1,
        message: data.response || data.message || "Error: respuesta vacía",
        timestamp: new Date(),
        isUser: false
      };
      
      console.log('Agregando mensajes al chat:', { userMessage, aiResponse });
      console.log('Estado actual de chatMessages:', chatMessages);
      
      setChatMessages(prev => {
        const newMessages = [...prev, userMessage, aiResponse];
        console.log('Nuevos mensajes a establecer:', newMessages);
        return newMessages;
      });
      
      setTestMessage(""); // Limpiar el campo de entrada
      
      toast({
        title: "Respuesta de IA generada",
        description: data.response ? `IA: ${data.response.substring(0, 50)}...` : "Respuesta procesada",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/simple/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error simulando mensaje",
        variant: "destructive",
      });
    },
  });

  const handleSetupBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessForm.businessName || !businessForm.businessType) {
      toast({
        title: "Error",
        description: "Nombre del negocio y tipo son requeridos",
        variant: "destructive",
      });
      return;
    }
    setupMutation.mutate(businessForm);
  };

  const handleConnect = () => {
    connectMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const handleTestMessage = () => {
    if (!testMessage.trim()) {
      toast({
        title: "Error",
        description: "Escribe un mensaje para probar",
        variant: "destructive",
      });
      return;
    }
    testMutation.mutate({
      message: testMessage,
      phoneNumber: "+1234567890"
    });
  };

  const getStatusIcon = () => {
    if (!status) return <Clock className="h-4 w-4" />;
    
    switch (status.status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "connecting":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "configured":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!status) return "Cargando...";
    
    switch (status.status) {
      case "connected":
        return "Conectado";
      case "connecting":
        return "Conectando...";
      case "configured":
        return "Configurado";
      case "not_configured":
        return "No configurado";
      default:
        return "Desconectado";
    }
  };

  const getStatusColor = () => {
    if (!status) return "secondary";
    
    switch (status.status) {
      case "connected":
        return "default";
      case "connecting":
        return "secondary";
      case "configured":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Smartphone className="h-8 w-8" />
            WhatsApp Business
          </h1>
          <p className="text-muted-foreground">
            Configura tu chatbot en 3 simples pasos
          </p>
        </div>
        <Badge variant={getStatusColor() as any} className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Paso 1: Configurar Negocio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Configurar Negocio
            </CardTitle>
            <CardDescription>
              Define la información básica de tu negocio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetupBusiness} className="space-y-4">
              <div>
                <Label htmlFor="businessName">Nombre del Negocio</Label>
                <Input
                  id="businessName"
                  value={businessForm.businessName}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Mi Empresa"
                  disabled={status?.status === "connected"}
                />
              </div>
              
              <div>
                <Label htmlFor="businessType">Tipo de Negocio</Label>
                <Select
                  value={businessForm.businessType}
                  onValueChange={(value) => setBusinessForm(prev => ({ ...prev, businessType: value }))}
                  disabled={status?.status === "connected"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="products">Venta de Productos</SelectItem>
                    <SelectItem value="services">Servicios y Citas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="businessDescription">Descripción</Label>
                <Textarea
                  id="businessDescription"
                  value={businessForm.businessDescription}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, businessDescription: e.target.value }))}
                  placeholder="Describe tu negocio..."
                  disabled={status?.status === "connected"}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={setupMutation.isPending || status?.status === "connected"}
              >
                {setupMutation.isPending ? "Configurando..." : "Configurar Negocio"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Paso 2: Conectar WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Conectar WhatsApp
            </CardTitle>
            <CardDescription>
              Escanea el código QR con tu WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.status === "not_configured" && (
              <p className="text-sm text-muted-foreground">
                Primero configura tu negocio
              </p>
            )}

            {status?.qrCode && (
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={status.qrCode}
                  alt="Código QR"
                  className="w-48 h-48 border rounded-lg"
                />
                <p className="text-sm text-center text-muted-foreground">
                  Escanea este código con WhatsApp
                </p>
              </div>
            )}

            {status?.status === "connected" ? (
              <div className="space-y-2">
                <Button
                  onClick={handleDisconnect}
                  variant="destructive"
                  className="w-full"
                  disabled={disconnectMutation.isPending}
                >
                  {disconnectMutation.isPending ? "Desconectando..." : "Desconectar WhatsApp"}
                </Button>
                <p className="text-sm text-green-600 text-center">
                  ¡WhatsApp conectado exitosamente!
                </p>
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                className="w-full"
                disabled={
                  connectMutation.isPending || 
                  status?.status === "not_configured" ||
                  status?.status === "connecting"
                }
              >
                {connectMutation.isPending || status?.status === "connecting" 
                  ? "Generando código..." 
                  : "Conectar WhatsApp"
                }
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Paso 3: Probar IA */}
      {status?.status === "connected" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Probar Respuestas IA
            </CardTitle>
            <CardDescription>
              Tu chatbot está listo. Prueba cómo responde la IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chat Interface */}
            {chatMessages.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Conversación con IA
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.isUser
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-700 border'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <span className="text-xs opacity-70">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatMessages([])}
                  className="mt-2"
                >
                  Limpiar chat
                </Button>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="testMessage">Mensaje de prueba</Label>
                <Textarea
                  id="testMessage"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder={
                    status.businessType === "products" 
                      ? "Ej: Hola, ¿cuál es el precio de...?"
                      : "Ej: Hola, quiero agendar una cita"
                  }
                />
                <Button
                  onClick={handleTestMessage}
                  className="w-full mt-2"
                  disabled={testMutation.isPending}
                >
                  {testMutation.isPending ? "Generando respuesta..." : "Probar IA"}
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Estadísticas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mensajes enviados:</span>
                    <span className="font-medium">{status.messagesSent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Mensajes recibidos:</span>
                    <span className="font-medium">{status.messagesReceived}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Negocio:</span>
                    <span className="font-medium">{status.businessName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tipo:</span>
                    <span className="font-medium">
                      {status.businessType === "products" ? "Productos" : "Servicios"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}