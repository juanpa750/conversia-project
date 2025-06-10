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
  status: 'connected' | 'disconnected';
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

export default function WhatsAppIntegrationPage() {
  const [, setLocation] = useLocation();
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [useExistingConfig, setUseExistingConfig] = useState(false);
  const [selectedExistingId, setSelectedExistingId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get chatbot ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const chatbotId = urlParams.get('chatbot');

  // Get chatbot data
  const { data: chatbot } = useQuery({
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

  // Link existing WhatsApp integration to chatbot
  const linkIntegrationMutation = useMutation({
    mutationFn: async (data: { integrationId: string; chatbotId: string }) => {
      return await apiRequest("PUT", `/api/whatsapp/integrations/${data.integrationId}/link`, {
        chatbotId: data.chatbotId,
      });
    },
    onSuccess: () => {
      toast({
        title: "WhatsApp vinculado",
        description: "El chatbot ha sido vinculado exitosamente a la integración de WhatsApp.",
      });
      setShowConfigDialog(false);
      queryClient.invalidateQueries({ queryKey: [`/api/whatsapp/integrations/chatbot/${chatbotId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/integrations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error de vinculación",
        description: error.message || "Error vinculando WhatsApp",
        variant: "destructive",
      });
    },
  });

  // Disconnect WhatsApp integration
  const disconnectMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      return await apiRequest("DELETE", `/api/whatsapp/integrations/${integrationId}`);
    },
    onSuccess: () => {
      toast({
        title: "WhatsApp desconectado",
        description: "La integración de WhatsApp ha sido desconectada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/whatsapp/integrations/chatbot/${chatbotId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/integrations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error de desconexión",
        description: error.message || "Error desconectando WhatsApp",
        variant: "destructive",
      });
    },
  });

  const availableIntegrations = existingIntegrations.filter(
    integration => integration.chatbotId !== parseInt(chatbotId || "0")
  );

  const handleSaveConfiguration = async () => {
    if (useExistingConfig && selectedExistingId) {
      linkIntegrationMutation.mutate({
        integrationId: selectedExistingId,
        chatbotId: chatbotId!,
      });
    } else {
      // Get form values
      const phoneNumber = (document.getElementById('whatsapp-phone') as HTMLInputElement)?.value;
      const displayName = (document.getElementById('whatsapp-display-name') as HTMLInputElement)?.value;
      const businessDescription = (document.getElementById('whatsapp-business-description') as HTMLTextAreaElement)?.value;
      const businessType = (document.getElementById('whatsapp-business-type') as HTMLSelectElement)?.value;
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
            <WhatsAppConnectionStatus integration={currentIntegration} />
          ) : (

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
            {/* Configuration Type Selection */}
            {availableIntegrations.length > 0 && (
              <div className="space-y-4">
                <Label className="text-base font-medium">Tipo de configuración</Label>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="use-existing"
                    name="config-type"
                    checked={useExistingConfig}
                    onChange={(e) => setUseExistingConfig(e.target.checked)}
                  />
                  <Label htmlFor="use-existing">Usar integración existente</Label>
                </div>

                {useExistingConfig && (
                  <Select value={selectedExistingId} onValueChange={setSelectedExistingId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar integración existente" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableIntegrations.map((integration) => (
                        <SelectItem key={integration.id} value={integration.id.toString()}>
                          {integration.displayName} ({integration.phoneNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="create-new"
                    name="config-type"
                    checked={!useExistingConfig}
                    onChange={(e) => setUseExistingConfig(!e.target.checked)}
                  />
                  <Label htmlFor="create-new">Crear nueva integración</Label>
                </div>
              </div>
            )}

            {/* New Integration Form */}
            {!useExistingConfig && (
              <div className="space-y-4">
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <RiWhatsappLine className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Nueva integración</h3>
                      <div className="mt-2 text-sm text-green-700">
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

                <div className="space-y-2">
                  <Label htmlFor="whatsapp-business-type">Tipo de negocio</Label>
                  <Select defaultValue="retail">
                    <SelectTrigger id="whatsapp-business-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Venta al por menor</SelectItem>
                      <SelectItem value="service">Servicios</SelectItem>
                      <SelectItem value="restaurant">Restaurante</SelectItem>
                      <SelectItem value="health">Salud y bienestar</SelectItem>
                      <SelectItem value="education">Educación</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
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
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveConfiguration}
              disabled={createIntegrationMutation.isPending || linkIntegrationMutation.isPending}
            >
              {createIntegrationMutation.isPending || linkIntegrationMutation.isPending 
                ? "Configurando..." 
                : useExistingConfig 
                  ? "Vincular" 
                  : "Configurar"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}