import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  RiGlobalLine,
  RiCheckLine,
} from "@/lib/icons";
import { Layout } from "@/components/layout/layout";

interface WhatsAppStatus {
  success: boolean;
  status: string;
  isConnected: boolean;
  businessName?: string;
  businessType?: string;
  messagesSent?: number;
  messagesReceived?: number;
}

export default function IntegrationsPage() {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get WhatsApp status
  const { data: whatsappStatus } = useQuery<WhatsAppStatus>({
    queryKey: ["/api/simple/status"],
    refetchInterval: 5000,
  });

  // WhatsApp Business configuration mutation
  const whatsappConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/simple/setup-business", data);
    },
    onSuccess: () => {
      toast({
        title: "WhatsApp Business configurado",
        description: "Tu cuenta de WhatsApp Business ha sido configurada exitosamente.",
      });
      setShowConnectDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/simple/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error de configuración",
        description: error.message || "Error configurando WhatsApp Business",
        variant: "destructive",
      });
    },
  });

  const handleWhatsAppSetup = () => {
    setShowConnectDialog(true);
  };

  const handleSaveConfiguration = () => {
    // Get form values
    const businessName = (document.getElementById("whatsapp-business-name") as HTMLInputElement)?.value;
    const businessType = (document.getElementById("whatsapp-business-type") as HTMLSelectElement)?.value;
    const phoneNumber = (document.getElementById("whatsapp-phone") as HTMLInputElement)?.value;
    const businessDescription = (document.getElementById("whatsapp-description") as HTMLTextAreaElement)?.value;

    if (!businessName || !businessType || !phoneNumber || !businessDescription) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    whatsappConfigMutation.mutate({
      businessName,
      businessType,
      businessDescription,
      adminPhoneNumber: phoneNumber,
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integraciones</h1>
        <p className="mt-1 text-sm text-gray-500">
          Conecta tus chatbots con WhatsApp y otras plataformas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* WhatsApp Integration */}
        <Card className="relative">
          {whatsappStatus?.isConnected && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-100 text-green-800">
                <RiCheckLine className="mr-1 h-3 w-3" />
                Conectado
              </Badge>
            </div>
          )}
          <CardHeader>
            <div className="flex items-center gap-3">
              <RiWhatsappLine className="h-6 w-6 text-green-600" />
              <CardTitle>WhatsApp Business</CardTitle>
            </div>
            <CardDescription>
              Principal canal de comunicación. Permite mensajes, imágenes y documentos automáticos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {whatsappStatus?.isConnected ? (
              <div className="space-y-3">
                <div className="rounded-md bg-green-50 p-3 text-green-800">
                  <p className="font-medium">Conexión activa</p>
                  <p className="text-sm">WhatsApp Business funcionando correctamente</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Negocio:</span>
                    <span>{whatsappStatus.businessName || "Mi Empresa"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo:</span>
                    <span>{whatsappStatus.businessType || "Productos"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mensajes enviados:</span>
                    <span>{whatsappStatus.messagesSent || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mensajes recibidos:</span>
                    <span>{whatsappStatus.messagesReceived || 0}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Conecta tu cuenta de WhatsApp Business para comenzar a utilizar chatbots automáticos.
                </p>
                <div className="text-sm">
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Respuestas automáticas con IA</li>
                    <li>Gestión de productos y ventas</li>
                    <li>Agendamiento de citas</li>
                    <li>Análisis de conversaciones</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            {whatsappStatus?.isConnected ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleWhatsAppSetup}>
                  Reconfigurar
                </Button>
              </div>
            ) : (
              <Button onClick={handleWhatsAppSetup}>Conectar WhatsApp</Button>
            )}
          </CardFooter>
        </Card>

        {/* Other Integrations */}
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center gap-3">
              <RiGlobalLine className="h-6 w-6 text-blue-600" />
              <CardTitle>Web Chat</CardTitle>
            </div>
            <CardDescription>
              Widget de chat integrado en tu sitio web.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Próximamente: Widget de chat para tu sitio web.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" disabled>Próximamente</Button>
          </CardFooter>
        </Card>

        <Card className="relative">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-md flex items-center justify-center">
                <div className="h-4 w-4 border-2 border-white rounded-full"></div>
              </div>
              <CardTitle>Instagram</CardTitle>
            </div>
            <CardDescription>
              Comunicación visual a través de DMs de Instagram.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Próximamente: Integración con Instagram Direct Messages.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" disabled>Próximamente</Button>
          </CardFooter>
        </Card>
      </div>

      {/* WhatsApp Configuration Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Configurar WhatsApp Business
            </DialogTitle>
            <DialogDescription>
              Proporciona la información de tu negocio para configurar WhatsApp Business.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-green-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <RiWhatsappLine className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">WhatsApp Business API</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Configura tu cuenta de WhatsApp Business para enviar y recibir mensajes automáticos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-business-name">Nombre del negocio</Label>
              <Input 
                id="whatsapp-business-name" 
                placeholder="Mi Empresa S.A." 
                defaultValue={whatsappStatus?.businessName || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-business-type">Tipo de negocio</Label>
              <select 
                id="whatsapp-business-type" 
                className="w-full border border-gray-300 rounded-md h-9 px-3"
                defaultValue={whatsappStatus?.businessType || "products"}
              >
                <option value="products">Productos</option>
                <option value="services">Servicios</option>
                <option value="both">Productos y Servicios</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-phone">Número de WhatsApp Business</Label>
              <Input id="whatsapp-phone" placeholder="+34612345678" />
              <p className="text-xs text-gray-500">
                Debe ser un número verificado con WhatsApp Business
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-description">Descripción del negocio</Label>
              <Textarea 
                id="whatsapp-description" 
                placeholder="Describe brevemente tu negocio y servicios..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveConfiguration}
              disabled={whatsappConfigMutation.isPending}
            >
              {whatsappConfigMutation.isPending ? "Configurando..." : "Configurar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}