import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  RiWhatsappLine, 
  RiGlobalLine,
  RiLockLine,
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiEdit2Line,
  RiSettings3Line
} from "@/lib/icons";
import { Layout } from "@/components/layout/layout";

// Mock platforms data with icons (we would import actual platform icons in a real app)
const PLATFORMS = [
  { 
    id: "whatsapp", 
    name: "WhatsApp", 
    icon: <RiWhatsappLine className="h-5 w-5 text-green-600" />,
    description: "Principal canal de comunicación. Permite mensajes, imágenes y documentos.",
    status: "connected", 
    features: ["mensajes", "plantillas", "multimedia", "chatbots", "commerce"],
    accountInfo: {
      phone: "+34612345678",
      businessName: "Mi Empresa",
      displayName: "Soporte Mi Empresa",
      expiresAt: "2024-12-31"
    }
  },
  { 
    id: "instagram", 
    name: "Instagram", 
    icon: <div className="h-5 w-5 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-md flex items-center justify-center">
            <div className="h-3 w-3 border-2 border-white rounded-full"></div>
          </div>,
    description: "Comunicación visual a través de DMs de Instagram.",
    status: "disconnected", 
    features: ["mensajes", "multimedia", "stories"],
  },
  { 
    id: "facebook", 
    name: "Facebook Messenger", 
    icon: <div className="h-5 w-5 bg-blue-500 text-white rounded-full flex items-center justify-center">
            <div className="h-3 w-3 translate-y-[1px]">⚡</div>
          </div>,
    description: "Mensajería directa a través de Facebook Messenger.",
    status: "disconnected", 
    features: ["mensajes", "plantillas", "multimedia", "chatbots"],
  },
  { 
    id: "telegram", 
    name: "Telegram", 
    icon: <div className="h-5 w-5 bg-blue-400 text-white rounded-full flex items-center justify-center">
            <div className="h-3 w-3">✈️</div>
          </div>,
    description: "Canal de comunicación rápido y seguro con clientes.",
    status: "disconnected", 
    features: ["mensajes", "multimedia", "grupos", "chatbots"],
  },
  { 
    id: "web", 
    name: "Chat Web", 
    icon: <RiGlobalLine className="h-5 w-5 text-blue-600" />,
    description: "Chat integrado en tu sitio web para atención directa.",
    status: "connected", 
    features: ["mensajes", "plantillas", "multimedia", "chatbots", "historial"],
    accountInfo: {
      domain: "www.miempresa.com",
      widgetLocation: "Esquina inferior derecha",
      theme: "Light - Blue",
      lastActivity: "Hoy a las 12:30"
    }
  },
  { 
    id: "sms", 
    name: "SMS", 
    icon: <div className="h-5 w-5 bg-gray-300 text-gray-600 rounded-md flex items-center justify-center">
            <div className="h-3 w-3">💬</div>
          </div>,
    description: "Comunicación directa por SMS para notificaciones importantes.",
    status: "disconnected", 
    features: ["mensajes", "plantillas", "segmentación"],
  }
];

// Mock integrations data
const INTEGRATIONS = [
  {
    id: "crm",
    name: "Salesforce CRM",
    description: "Sincroniza contactos y conversaciones con Salesforce.",
    icon: <div className="h-6 w-6 bg-blue-600 rounded-md text-white flex items-center justify-center">
            <span className="text-sm font-bold">SF</span>
          </div>,
    status: "connected"
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automatiza flujos de trabajo e integra con +3000 apps.",
    icon: <div className="h-6 w-6 bg-orange-500 rounded-md text-white flex items-center justify-center">
            <span className="text-sm font-bold">Z</span>
          </div>,
    status: "connected"
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Conecta tu tienda online para gestionar pedidos y productos.",
    icon: <div className="h-6 w-6 bg-green-600 rounded-md text-white flex items-center justify-center">
            <span className="text-sm font-bold">S</span>
          </div>,
    status: "disconnected"
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Integra marketing, ventas y soporte en una plataforma.",
    icon: <div className="h-6 w-6 bg-orange-600 rounded-md text-white flex items-center justify-center">
            <span className="text-sm font-bold">H</span>
          </div>,
    status: "disconnected"
  },
  {
    id: "googlesheets",
    name: "Google Sheets",
    description: "Sincroniza datos de clientes y conversaciones con hojas de cálculo.",
    icon: <div className="h-6 w-6 bg-green-500 rounded-md text-white flex items-center justify-center">
            <span className="text-sm font-bold">GS</span>
          </div>,
    status: "connected"
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Gestión de campañas de email marketing y automatizaciones.",
    icon: <div className="h-6 w-6 bg-yellow-400 rounded-md text-black flex items-center justify-center">
            <span className="text-sm font-bold">MC</span>
          </div>,
    status: "disconnected"
  }
];

// Mock webhooks data
const WEBHOOKS = [
  {
    id: "webhook1",
    name: "Notificación de nuevo mensaje",
    endpoint: "https://api.miempresa.com/webhooks/new-message",
    events: ["message.received"],
    active: true,
    created: "2023-05-12"
  },
  {
    id: "webhook2",
    name: "Actualización de estado de mensaje",
    endpoint: "https://api.miempresa.com/webhooks/message-status",
    events: ["message.status.update"],
    active: true,
    created: "2023-06-03"
  },
  {
    id: "webhook3",
    name: "Actualización de contacto",
    endpoint: "https://erp.miempresa.com/api/contact-update",
    events: ["contact.updated", "contact.created"],
    active: false,
    created: "2023-04-21"
  }
];

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("platforms");
  const [showConnectPlatformDialog, setShowConnectPlatformDialog] = useState(false);
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const { toast } = useToast();

  // Handler for connecting a platform
  const handleConnectPlatform = (platformId: string) => {
    setSelectedPlatform(platformId);
    setShowConnectPlatformDialog(true);
  };

  // Handler for saving platform connection
  const handleSavePlatformConnection = () => {
    setShowConnectPlatformDialog(false);
    toast({
      title: "Plataforma conectada",
      description: "La plataforma ha sido conectada exitosamente.",
    });
  };

  // Handler for saving webhook
  const handleSaveWebhook = () => {
    setShowAddWebhookDialog(false);
    toast({
      title: "Webhook añadido",
      description: "El webhook ha sido configurado correctamente.",
    });
  };

  // Handler for toggling webhook status
  const handleToggleWebhook = (webhookId: string, newState: boolean) => {
    toast({
      title: newState ? "Webhook activado" : "Webhook desactivado",
      description: `El webhook ha sido ${newState ? "activado" : "desactivado"} correctamente.`,
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integraciones</h1>
        <p className="mt-1 text-sm text-gray-500">
          Conecta tus chatbots con múltiples plataformas y servicios
        </p>
      </div>

      <Tabs defaultValue="platforms" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 gap-4 w-full md:w-2/3">
          <TabsTrigger value="platforms" className="flex gap-2 items-center">
            <RiGlobalLine />
            <span>Plataformas</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex gap-2 items-center">
            <RiSettings3Line />
            <span>Integraciones</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex gap-2 items-center">
            <RiGlobalLine />
            <span>Webhooks & API</span>
          </TabsTrigger>
        </TabsList>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLATFORMS.map((platform) => (
              <Card key={platform.id} className="relative">
                {platform.status === "connected" && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-100 text-green-800">
                      <RiCheckLine className="mr-1 h-3 w-3" />
                      Conectado
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {platform.icon}
                    <CardTitle>{platform.name}</CardTitle>
                  </div>
                  <CardDescription>
                    {platform.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {platform.status === "connected" && platform.accountInfo ? (
                    <div className="space-y-2 text-sm">
                      {platform.id === "whatsapp" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Teléfono:</span>
                            <span>{platform.accountInfo.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Nombre comercial:</span>
                            <span>{platform.accountInfo.businessName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Nombre visible:</span>
                            <span>{platform.accountInfo.displayName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Expira:</span>
                            <span>{platform.accountInfo.expiresAt}</span>
                          </div>
                        </>
                      )}
                      {platform.id === "web" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Dominio:</span>
                            <span>{platform.accountInfo.domain}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Ubicación:</span>
                            <span>{platform.accountInfo.widgetLocation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tema:</span>
                            <span>{platform.accountInfo.theme}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Última actividad:</span>
                            <span>{platform.accountInfo.lastActivity}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">
                        Conecta tu cuenta para comenzar a utilizar esta plataforma.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  {platform.status === "connected" ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Configurar</Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Desconectar</Button>
                    </div>
                  ) : (
                    <Button onClick={() => handleConnectPlatform(platform.id)}>Conectar</Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Connect Platform Dialog */}
          <Dialog open={showConnectPlatformDialog} onOpenChange={setShowConnectPlatformDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  Conectar {PLATFORMS.find(p => p.id === selectedPlatform)?.name}
                </DialogTitle>
                <DialogDescription>
                  Proporciona las credenciales necesarias para conectar esta plataforma con tu cuenta.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {selectedPlatform === "instagram" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="instagram-username">Nombre de usuario</Label>
                      <Input id="instagram-username" placeholder="@tuempresa" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram-password">Contraseña</Label>
                      <Input id="instagram-password" type="password" />
                    </div>
                    <div className="flex items-center space-x-2 py-2">
                      <input type="checkbox" id="instagram-remember" className="h-4 w-4" />
                      <Label htmlFor="instagram-remember" className="text-sm">
                        Acepto conectar mi cuenta de Instagram Business
                      </Label>
                    </div>
                  </>
                )}

                {selectedPlatform === "facebook" && (
                  <>
                    <div className="rounded-md bg-blue-50 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <RiLockLine className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Conexión segura</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Para conectar con Facebook Messenger, serás redirigido a Facebook para autorizar esta aplicación.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      Continuar con Facebook
                    </Button>
                  </>
                )}

                {selectedPlatform === "telegram" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="telegram-token">Bot Token</Label>
                      <Input id="telegram-token" placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" />
                      <p className="text-xs text-gray-500">
                        Puedes obtener un token creando un nuevo bot a través de BotFather en Telegram.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegram-name">Nombre del Bot</Label>
                      <Input id="telegram-name" placeholder="Mi Empresa Bot" />
                    </div>
                  </>
                )}

                {selectedPlatform === "sms" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="sms-provider">Proveedor de SMS</Label>
                      <select id="sms-provider" className="w-full border border-gray-300 rounded-md h-9 px-3">
                        <option>Twilio</option>
                        <option>MessageBird</option>
                        <option>Vonage</option>
                        <option>Otro</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sms-api-key">API Key</Label>
                      <Input id="sms-api-key" placeholder="sk_live_..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sms-api-secret">API Secret</Label>
                      <Input id="sms-api-secret" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sms-phone">Número de teléfono</Label>
                      <Input id="sms-phone" placeholder="+34612345678" />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConnectPlatformDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSavePlatformConnection}>
                  Conectar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INTEGRATIONS.map((integration) => (
              <Card key={integration.id} className="relative">
                {integration.status === "connected" && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-100 text-green-800">
                      <RiCheckLine className="mr-1 h-3 w-3" />
                      Conectado
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {integration.icon}
                    <CardTitle>{integration.name}</CardTitle>
                  </div>
                  <CardDescription>
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {integration.status === "connected" ? (
                    <div className="text-sm">
                      <div className="rounded-md bg-green-50 p-3 text-green-800">
                        <p>Integración activa y funcionando correctamente.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      <p>Conecta esta integración para sincronizar datos entre servicios.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  {integration.status === "connected" ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Configurar</Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Desconectar</Button>
                    </div>
                  ) : (
                    <Button>Conectar</Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks & API Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>
                    Configura webhooks para recibir notificaciones en tiempo real sobre eventos
                  </CardDescription>
                </div>
                <Dialog open={showAddWebhookDialog} onOpenChange={setShowAddWebhookDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <RiAddLine className="mr-2 h-4 w-4" />
                      Nuevo Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Añadir nuevo webhook</DialogTitle>
                      <DialogDescription>
                        Configura un endpoint para recibir notificaciones de eventos
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="webhook-name">Nombre</Label>
                        <Input id="webhook-name" placeholder="Ej: Actualización de contactos" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webhook-url">URL del endpoint</Label>
                        <Input id="webhook-url" placeholder="https://api.tudominio.com/webhook" />
                      </div>
                      <div className="space-y-2">
                        <Label>Eventos</Label>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="event-message-received" className="h-4 w-4" defaultChecked />
                            <Label htmlFor="event-message-received" className="text-sm font-normal">message.received</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="event-message-sent" className="h-4 w-4" />
                            <Label htmlFor="event-message-sent" className="text-sm font-normal">message.sent</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="event-message-status" className="h-4 w-4" />
                            <Label htmlFor="event-message-status" className="text-sm font-normal">message.status.update</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="event-contact-created" className="h-4 w-4" />
                            <Label htmlFor="event-contact-created" className="text-sm font-normal">contact.created</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="event-contact-updated" className="h-4 w-4" />
                            <Label htmlFor="event-contact-updated" className="text-sm font-normal">contact.updated</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="event-chat-start" className="h-4 w-4" />
                            <Label htmlFor="event-chat-start" className="text-sm font-normal">chat.started</Label>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webhook-secret">Secret (opcional)</Label>
                        <Input id="webhook-secret" type="password" placeholder="Secret para verificar las solicitudes" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddWebhookDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveWebhook}>
                        Guardar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Endpoint
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Eventos
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {WEBHOOKS.map((webhook) => (
                      <tr key={webhook.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {webhook.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {webhook.endpoint}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.map((event, index) => (
                              <Badge key={index} variant="outline" className="bg-blue-50">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Switch 
                              checked={webhook.active} 
                              onCheckedChange={(checked) => handleToggleWebhook(webhook.id, checked)} 
                              className="mr-2"
                            />
                            <span>{webhook.active ? "Activo" : "Inactivo"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <RiEdit2Line className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <RiCloseLine className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Genera y gestiona claves API para acceder a tus datos programáticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-md font-medium">API Key principal</h3>
                      <p className="text-sm text-gray-500">Creada: 12/05/2023</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input className="w-[300px]" type="password" value="sk_live_123456789abcdefghijklmnopqrstuvwxyz" readOnly />
                      <Button variant="ghost" size="sm">
                        Mostrar
                      </Button>
                      <Button variant="outline" size="sm">
                        Copiar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <RiLockLine className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Seguridad importante</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          Tu API key otorga acceso completo a tu cuenta. Nunca compartas tus API keys en
                          código público, URLs, o con personas no autorizadas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <RiAddLine className="mr-2 h-4 w-4" />
                    Generar nueva API Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentación de API</CardTitle>
              <CardDescription>
                Consulta nuestra documentación para aprender a utilizar nuestra API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                  <h3 className="text-md font-medium mb-2">Guía de inicio rápido</h3>
                  <p className="text-sm text-gray-500 mb-4">Aprende los conceptos básicos y comienza en minutos</p>
                  <Button variant="outline" size="sm">
                    Ver guía
                  </Button>
                </div>
                
                <div className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                  <h3 className="text-md font-medium mb-2">Referencia de API</h3>
                  <p className="text-sm text-gray-500 mb-4">Documentación detallada de todos los endpoints</p>
                  <Button variant="outline" size="sm">
                    Ver documentación
                  </Button>
                </div>
                
                <div className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                  <h3 className="text-md font-medium mb-2">Ejemplos de código</h3>
                  <p className="text-sm text-gray-500 mb-4">Snippets en varios lenguajes para acelerar tu desarrollo</p>
                  <Button variant="outline" size="sm">
                    Ver ejemplos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}