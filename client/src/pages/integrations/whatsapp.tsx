import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  RiWhatsappLine, 
  RiCheckLine,
  RiArrowLeftSLine,
  RiAddLine,
  RiSettings3Line,
} from "@/lib/icons";

interface WhatsAppIntegration {
  id: number;
  phoneNumber: string;
  displayName: string;
  businessDescription: string;
  status: 'connected' | 'disconnected' | 'initializing' | 'qr_ready' | 'connecting';
  isActive: boolean;
  chatbotId: number;
  productId?: number;
  priority: number;
  autoRespond: boolean;
  operatingHours?: any;
  createdAt: string;
}

interface WhatsAppConfig {
  phoneNumber: string;
  displayName: string;
  businessDescription: string;
  businessType: string;
  autoRespond: boolean;
  operatingHours: {
    enabled: boolean;
    timezone: string;
    schedule: any;
  };
}

interface QRStatus {
  status: string;
  qrCode?: string;
  isConnected: boolean;
  error?: string;
}

export default function WhatsAppIntegrationPage() {
  const [, setLocation] = useLocation();
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [useExistingConfig, setUseExistingConfig] = useState(false);
  const [selectedExistingId, setSelectedExistingId] = useState<string>("");
  const [qrData, setQrData] = useState<QRStatus | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get chatbot ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const chatbotId = urlParams.get('chatbot');

  // Get chatbot data
  const { data: chatbot } = useQuery<{ id: number; name: string; productId?: number }>({
    queryKey: [`/api/chatbots/${chatbotId}`],
    enabled: !!chatbotId,
  });

  // Get existing WhatsApp integrations for this user
  const { data: existingIntegrations = [] } = useQuery<WhatsAppIntegration[]>({
    queryKey: ["/api/whatsapp/integrations"],
  });

  // Get current WhatsApp integration for this chatbot
  const { data: currentIntegration } = useQuery<WhatsAppIntegration>({
    queryKey: [`/api/whatsapp/integrations/chatbot/${chatbotId}`],
    enabled: !!chatbotId,
  });

  // Create new WhatsApp integration
  const createIntegrationMutation = useMutation({
    mutationFn: async (data: WhatsAppConfig & { chatbotId: string; productId?: number }) => {
      return await apiRequest("POST", "/api/whatsapp/integrations", data);
    },
    onSuccess: () => {
      toast({
        title: "WhatsApp configurado",
        description: "La integración de WhatsApp ha sido configurada exitosamente.",
      });
      setShowConfigDialog(false);
      queryClient.invalidateQueries({ queryKey: [`/api/whatsapp/integrations/chatbot/${chatbotId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/integrations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error de configuración",
        description: error.message || "Error configurando WhatsApp",
        variant: "destructive",
      });
    },
  });

  // Connect WhatsApp with QR
  const connectMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      return await apiRequest("POST", `/api/whatsapp/connect/${integrationId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Iniciando conexión",
        description: "Generando código QR para conexión de WhatsApp",
      });
      setShowQRDialog(true);
      // Start polling for QR code
      pollQRStatus();
    },
    onError: (error: any) => {
      toast({
        title: "Error de conexión",
        description: error.message || "Error iniciando conexión WhatsApp",
        variant: "destructive",
      });
    },
  });

  // Disconnect WhatsApp
  const disconnectMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      return await apiRequest("POST", `/api/whatsapp/disconnect/${integrationId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "WhatsApp desconectado",
        description: "La conexión de WhatsApp ha sido desconectada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/whatsapp/integrations/chatbot/${chatbotId}`] });
      setQrData(null);
      setShowQRDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error de desconexión",
        description: error.message || "Error desconectando WhatsApp",
        variant: "destructive",
      });
    },
  });

  // Poll QR status
  const pollQRStatus = async () => {
    if (!currentIntegration) return;
    
    try {
      const response = await apiRequest("GET", `/api/whatsapp/qr/${currentIntegration.id}`, {});
      const qrStatus = response as unknown as QRStatus;
      setQrData(qrStatus);
      
      if (qrStatus.status === 'connected') {
        toast({
          title: "WhatsApp conectado",
          description: "¡WhatsApp se ha conectado exitosamente!",
        });
        setShowQRDialog(false);
        queryClient.invalidateQueries({ queryKey: [`/api/whatsapp/integrations/chatbot/${chatbotId}`] });
      } else if (qrStatus.status === 'qr_ready' || qrStatus.status === 'connecting') {
        // Continue polling
        setTimeout(pollQRStatus, 2000);
      }
    } catch (error) {
      console.error('Error polling QR status:', error);
    }
  };

  const availableIntegrations = existingIntegrations.filter(
    integration => integration.chatbotId !== parseInt(chatbotId || "0")
  );

  const handleSaveConfiguration = async () => {
    if (useExistingConfig && selectedExistingId) {
      // Link existing integration logic would go here
      toast({
        title: "Función en desarrollo",
        description: "La vinculación de integraciones existentes estará disponible pronto.",
        variant: "destructive",
      });
    } else {
      // Get form values
      const phoneNumber = (document.getElementById('whatsapp-phone') as HTMLInputElement)?.value;
      const displayName = (document.getElementById('whatsapp-display-name') as HTMLInputElement)?.value;
      const businessDescription = (document.getElementById('whatsapp-business-description') as HTMLTextAreaElement)?.value;
      const businessType = "retail";
      const autoRespond = (document.getElementById('whatsapp-auto-respond') as HTMLInputElement)?.checked;

      if (!phoneNumber || !displayName || !businessDescription) {
        toast({
          title: "Campos requeridos",
          description: "Por favor completa todos los campos obligatorios.",
          variant: "destructive",
        });
        return;
      }

      createIntegrationMutation.mutate({
        phoneNumber,
        displayName,
        businessDescription,
        businessType: businessType || "retail",
        autoRespond: autoRespond || true,
        chatbotId: chatbotId!,
        productId: chatbot?.productId,
        operatingHours: {
          enabled: false,
          timezone: "America/Mexico_City",
          schedule: {},
        },
      });
    }
  };

  const handleConnect = () => {
    if (currentIntegration) {
      connectMutation.mutate(currentIntegration.id);
    }
  };

  const handleDisconnect = () => {
    if (currentIntegration && confirm('¿Estás seguro de que quieres desconectar WhatsApp de este chatbot?')) {
      disconnectMutation.mutate(currentIntegration.id);
    }
  };

  if (!chatbotId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se especificó el chatbot</p>
        <Button onClick={() => setLocation("/chatbots")} className="mt-4">
          Volver a Chatbots
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/chatbots")}
            className="flex items-center space-x-2"
          >
            <RiArrowLeftSLine />
            <span>Volver</span>
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de WhatsApp</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configura WhatsApp para el chatbot: <span className="font-medium">{chatbot?.name}</span>
          </p>
        </div>
      </div>

      {/* Current Integration Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RiWhatsappLine className="text-green-600" />
            <span>Estado de la Integración</span>
          </CardTitle>
          <CardDescription>
            Estado actual de WhatsApp para este chatbot
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentIntegration ? (
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 border rounded-lg ${
                currentIntegration.status === 'connected' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    currentIntegration.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <p className={`font-medium ${
                      currentIntegration.status === 'connected' ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {currentIntegration.status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </p>
                    <p className={`text-sm ${
                      currentIntegration.status === 'connected' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {currentIntegration.status === 'connected' 
                        ? 'WhatsApp está configurado y activo' 
                        : 'Necesita conectarse escaneando código QR'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={
                  currentIntegration.status === 'connected' 
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                }>
                  {currentIntegration.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Número</Label>
                  <p className="mt-1 text-sm text-gray-900">{currentIntegration.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Nombre</Label>
                  <p className="mt-1 text-sm text-gray-900">{currentIntegration.displayName}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Descripción</Label>
                <p className="mt-1 text-sm text-gray-900">{currentIntegration.businessDescription}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-700">Respuesta automática</p>
                  <p className="text-sm text-gray-500">
                    {currentIntegration.autoRespond ? "Activada" : "Desactivada"}
                  </p>
                </div>
                <Badge variant={currentIntegration.autoRespond ? "default" : "secondary"}>
                  {currentIntegration.autoRespond ? "ON" : "OFF"}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <RiWhatsappLine className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin configurar</h3>
              <p className="mt-1 text-sm text-gray-500">
                Este chatbot no tiene WhatsApp configurado
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {currentIntegration ? (
            <>
              {currentIntegration.status === 'connected' ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConfigDialog(true)}
                    className="flex items-center space-x-2"
                  >
                    <RiSettings3Line />
                    <span>Reconfigurar</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDisconnect}
                    disabled={disconnectMutation.isPending}
                  >
                    {disconnectMutation.isPending ? "Desconectando..." : "Desconectar"}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConfigDialog(true)}
                    className="flex items-center space-x-2"
                  >
                    <RiSettings3Line />
                    <span>Reconfigurar</span>
                  </Button>
                  <Button 
                    onClick={handleConnect}
                    disabled={connectMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    <RiWhatsappLine />
                    <span>{connectMutation.isPending ? "Conectando..." : "Conectar con QR"}</span>
                  </Button>
                </>
              )}
            </>
          ) : (
            <Button 
              onClick={() => setShowConfigDialog(true)}
              className="flex items-center space-x-2"
            >
              <RiAddLine />
              <span>Configurar WhatsApp</span>
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar WhatsApp</DialogTitle>
            <DialogDescription>
              Configura la integración de WhatsApp para tu chatbot {chatbot?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <RiWhatsappLine className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Nueva integración</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Crea una nueva configuración de WhatsApp para este chatbot</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-phone">Número de WhatsApp</Label>
                  <Input 
                    id="whatsapp-phone" 
                    placeholder="+52 55 1234 5678"
                    defaultValue={currentIntegration?.phoneNumber || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-display-name">Nombre para mostrar</Label>
                  <Input 
                    id="whatsapp-display-name" 
                    placeholder="Mi Negocio"
                    defaultValue={currentIntegration?.displayName || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-business-description">Descripción del negocio</Label>
                <Textarea 
                  id="whatsapp-business-description" 
                  placeholder="Describe tu negocio..."
                  defaultValue={currentIntegration?.businessDescription || ""}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="whatsapp-auto-respond"
                  defaultChecked={currentIntegration?.autoRespond ?? true}
                />
                <Label htmlFor="whatsapp-auto-respond">
                  Responder automáticamente con IA
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveConfiguration}
              disabled={createIntegrationMutation.isPending}
            >
              {createIntegrationMutation.isPending ? "Configurando..." : "Configurar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Escanea el código QR con tu WhatsApp para conectar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              {qrData?.qrCode ? (
                <div className="space-y-4">
                  <img 
                    src={qrData.qrCode} 
                    alt="QR Code" 
                    className="mx-auto w-64 h-64 border rounded-lg"
                  />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      1. Abre WhatsApp en tu teléfono
                    </p>
                    <p className="text-sm text-gray-600">
                      2. Ve a Configuración - Dispositivos vinculados
                    </p>
                    <p className="text-sm text-gray-600">
                      3. Toca "Vincular un dispositivo" y escanea este código
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Estado: {qrData.status}
                  </Badge>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  <p className="text-sm text-gray-600">Generando código QR...</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQRDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={pollQRStatus}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RiCheckLine />
              <span>Actualizar</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}