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

  // Link existing WhatsApp integration
  const linkIntegrationMutation = useMutation({
    mutationFn: async ({ integrationId, chatbotId }: { integrationId: string; chatbotId: string }) => {
      return await apiRequest("POST", `/api/whatsapp/integrations/${integrationId}/link-chatbot`, {
        chatbotId: parseInt(chatbotId),
      });
    },
    onSuccess: () => {
      toast({
        title: "WhatsApp vinculado",
        description: "El chatbot ha sido vinculado a la integración de WhatsApp existente.",
      });
      setShowConfigDialog(false);
      queryClient.invalidateQueries({ queryKey: [`/api/whatsapp/integrations/chatbot/${chatbotId}`] });
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
        description: "La integración de WhatsApp ha sido desconectada.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/whatsapp/integrations/chatbot/${chatbotId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/integrations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error desconectando WhatsApp",
        variant: "destructive",
      });
    },
  });

  const handleConfigureWhatsApp = () => {
    setShowConfigDialog(true);
  };

  const handleSaveConfiguration = () => {
    if (useExistingConfig && selectedExistingId) {
      // Link to existing integration
      linkIntegrationMutation.mutate({
        integrationId: selectedExistingId,
        chatbotId: chatbotId!,
      });
    } else {
      // Create new integration
      const phoneNumber = (document.getElementById("whatsapp-phone") as HTMLInputElement)?.value;
      const displayName = (document.getElementById("whatsapp-display-name") as HTMLInputElement)?.value;
      const businessDescription = (document.getElementById("whatsapp-description") as HTMLTextAreaElement)?.value;
      const businessType = (document.getElementById("whatsapp-business-type") as HTMLSelectElement)?.value;
      const autoRespond = (document.getElementById("whatsapp-auto-respond") as HTMLInputElement)?.checked;

      if (!phoneNumber || !displayName || !businessDescription) {
        toast({
          title: "Campos requeridos",
          description: "Por favor completa todos los campos requeridos.",
          variant: "destructive",
        });
        return;
      }

      createIntegrationMutation.mutate({
        phoneNumber,
        displayName,
        businessDescription,
        businessType: businessType || "products",
        autoRespond: autoRespond ?? true,
        operatingHours: {
          enabled: false,
          timezone: "America/Mexico_City",
          schedule: {}
        },
        chatbotId: chatbotId!,
        productId: (chatbot as any)?.productId,
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
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">No se especificó el chatbot</p>
          <Button onClick={() => setLocation("/chatbots")} className="mt-4">
            Volver a Chatbots
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/chatbots")}
          >
            <RiArrowLeftSLine className="mr-2" />
            Volver
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Integración WhatsApp</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configura WhatsApp para: {(chatbot as any)?.name || `Chatbot ${chatbotId}`}
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Current Integration Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <RiWhatsappLine className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle>Estado de WhatsApp</CardTitle>
                <CardDescription>
                  Configuración actual de WhatsApp para este chatbot
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentIntegration ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <RiCheckLine className="mr-1 h-3 w-3" />
                    Conectado
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {currentIntegration.status === 'connected' ? 'Funcionando' : 'Pendiente'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Número:</span>
                    <p className="text-gray-600">{currentIntegration.phoneNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Nombre:</span>
                    <p className="text-gray-600">{currentIntegration.displayName}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Descripción:</span>
                    <p className="text-gray-600">{currentIntegration.businessDescription}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <RiWhatsappLine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  WhatsApp no configurado
                </h3>
                <p className="text-gray-500 mb-4">
                  Este chatbot no tiene una integración de WhatsApp configurada
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {currentIntegration ? (
              <>
                <Button variant="outline" onClick={handleConfigureWhatsApp}>
                  <RiSettings3Line className="mr-2 h-4 w-4" />
                  Reconfigurar
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
              <Button onClick={handleConfigureWhatsApp}>
                <RiAddLine className="mr-2 h-4 w-4" />
                Configurar WhatsApp
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Existing Integrations Summary */}
        {existingIntegrations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Otras integraciones de WhatsApp</CardTitle>
              <CardDescription>
                Integraciones existentes que puedes reutilizar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {existingIntegrations.map((integration) => (
                  <div 
                    key={integration.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{integration.displayName}</p>
                      <p className="text-sm text-gray-500">{integration.phoneNumber}</p>
                    </div>
                    <Badge 
                      className={integration.status === 'connected' 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {integration.status === 'connected' ? 'Conectado' : 'Pendiente'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configurar WhatsApp Business</DialogTitle>
            <DialogDescription>
              Configura o vincula una integración de WhatsApp para este chatbot
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Option to use existing or create new */}
            {existingIntegrations.length > 0 && (
              <div className="space-y-4">
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
                      <SelectValue placeholder="Selecciona una integración existente" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingIntegrations.map((integration) => (
                        <SelectItem key={integration.id} value={integration.id.toString()}>
                          {integration.displayName} - {integration.phoneNumber}
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
                  <Label htmlFor="whatsapp-business-type">Tipo de negocio</Label>
                  <select 
                    id="whatsapp-business-type" 
                    className="w-full border border-gray-300 rounded-md h-9 px-3"
                  >
                    <option value="products">Productos</option>
                    <option value="services">Servicios</option>
                    <option value="both">Productos y Servicios</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp-description">Descripción del negocio</Label>
                  <Textarea 
                    id="whatsapp-description" 
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
    </Layout>
  );
}