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
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CampaignAssistant } from "@/components/campaign/campaign-assistant";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { 
  RiAdvertisementLine, 
  RiBarChart2Line,
  RiAddLine, 
  RiFileTextLine, 
  RiCheckLine,
  RiCloseLine,
  RiEditLine,
  RiDeleteBinLine,
  RiMailLine,
  RiTimeLine,
  RiGlobalLine,
  RiUserLine,
  RiTeamLine,
  RiPieChartLine,
  RiCalendarLine,
  RiUploadLine
} from "@/lib/icons";
import { Layout } from "@/components/layout/layout";
import { format } from "date-fns";

// Mock data for campaigns
const MOCK_CAMPAIGNS = [
  {
    id: "1",
    name: "Oferta de Verano",
    status: "active",
    schedule: "2023-06-15T10:00:00Z",
    audience: "all",
    audienceSize: 1250,
    openRate: 68,
    clickRate: 32,
    conversions: 89,
    message: "¡Hola [nombre]! 🌞 Este verano tenemos ofertas especiales para ti. 20% de descuento en todos nuestros productos durante esta semana. ¡No te lo pierdas! Responde SI para más información."
  },
  {
    id: "2",
    name: "Nuevos Productos",
    status: "scheduled",
    schedule: "2023-06-25T15:30:00Z",
    audience: "segments",
    audienceSize: 750,
    openRate: 0,
    clickRate: 0,
    conversions: 0,
    message: "¡Hola [nombre]! 🆕 Acabamos de recibir los nuevos modelos que tanto esperabas. Echa un vistazo a nuestra colección exclusiva. Responde CATALOGO para ver las novedades."
  },
  {
    id: "3",
    name: "Recordatorio de Carrito",
    status: "active",
    schedule: "running",
    audience: "abandoned",
    audienceSize: 342,
    openRate: 72,
    clickRate: 45,
    conversions: 67,
    message: "¡Hola [nombre]! 🛒 Notamos que dejaste productos en tu carrito. ¿Necesitas ayuda para completar tu compra? Estamos aquí para asistirte. Responde AYUDA si tienes alguna pregunta."
  },
  {
    id: "4",
    name: "Feedback Post-Compra",
    status: "completed",
    schedule: "2023-06-10T09:00:00Z",
    audience: "customers",
    audienceSize: 523,
    openRate: 81,
    clickRate: 59,
    conversions: 112,
    message: "¡Hola ${nombre}! 🌟 Esperamos que estés disfrutando de tu reciente compra. Nos encantaría conocer tu opinión. Responde con un número del 1 al 5 para valorar tu experiencia de compra. Tu opinión nos ayuda a mejorar."
  },
  {
    id: "5",
    name: "Descuento Clientes Fieles",
    status: "draft",
    schedule: null,
    audience: "loyal",
    audienceSize: 189,
    openRate: 0,
    clickRate: 0,
    conversions: 0,
    message: "¡Hola ${nombre}! 💎 Como cliente fiel, queremos ofrecerte un descuento especial del 25% en tu próxima compra. Usa el código FIEL25 al realizar tu pedido. ¡Gracias por confiar en nosotros!"
  }
];

// Mock data for audience segments
const MOCK_SEGMENTS = [
  {
    id: "1",
    name: "Clientes Nuevos",
    count: 356,
    criteria: "Primera compra en los últimos 30 días"
  },
  {
    id: "2",
    name: "Clientes Frecuentes",
    count: 189,
    criteria: "Más de 3 compras en los últimos 90 días"
  },
  {
    id: "3",
    name: "Carritos Abandonados",
    count: 342,
    criteria: "Carrito abandonado en los últimos 7 días"
  },
  {
    id: "4",
    name: "Sin Compras Recientes",
    count: 876,
    criteria: "Sin compras en los últimos 60 días"
  },
  {
    id: "5",
    name: "Interesados en Electrónica",
    count: 523,
    criteria: "Han visto productos de electrónica"
  }
];

// Mock data for templates
const MOCK_TEMPLATES = [
  {
    id: "1",
    name: "Bienvenida",
    content: "¡Hola ${nombre}! 👋 Bienvenido/a a nuestra tienda. Estamos encantados de tenerte aquí. Si necesitas ayuda, no dudes en preguntar."
  },
  {
    id: "2",
    name: "Oferta Especial",
    content: "¡Hola ${nombre}! 🎁 Tenemos una oferta especial para ti: ${descuento}% de descuento en ${producto}. Válido hasta ${fecha}. ¡No te lo pierdas!"
  },
  {
    id: "3",
    name: "Carrito Abandonado",
    content: "¡Hola ${nombre}! 🛒 Notamos que dejaste ${producto} en tu carrito. ¿Necesitas ayuda para completar tu compra o tienes alguna pregunta?"
  },
  {
    id: "4",
    name: "Seguimiento Post-Compra",
    content: "¡Hola ${nombre}! 📦 Tu pedido está en camino. Número de seguimiento: ${tracking}. Gracias por tu compra. ¿Alguna pregunta?"
  },
  {
    id: "5",
    name: "Solicitud de Feedback",
    content: "¡Hola ${nombre}! 🌟 ¿Qué te pareció tu experiencia de compra con nosotros? Responde del 1 al 5 (siendo 5 lo mejor). Tu opinión nos ayuda a mejorar."
  }
];

// Mock data for broadcasts
const MOCK_BROADCASTS = [
  {
    id: "1",
    name: "Anuncio de rebajas",
    date: "2023-06-12T10:30:00Z",
    status: "completed",
    audience: 1250,
    delivered: 1180,
    read: 876,
    responded: 342
  },
  {
    id: "2",
    name: "Lanzamiento nueva colección",
    date: "2023-06-15T15:45:00Z",
    status: "completed",
    audience: 950,
    delivered: 920,
    read: 765,
    responded: 298
  },
  {
    id: "3",
    name: "Recordatorio evento especial",
    date: "2023-06-18T09:00:00Z",
    status: "in_progress",
    audience: 750,
    delivered: 580,
    read: 320,
    responded: 85
  },
  {
    id: "4",
    name: "Oferta flash 24h",
    date: "2023-06-20T12:00:00Z",
    status: "scheduled",
    audience: 1500,
    delivered: 0,
    read: 0,
    responded: 0
  }
];

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCampaignDialog, setShowAddCampaignDialog] = useState(false);
  const [showCampaignDetailsDialog, setShowCampaignDetailsDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddBroadcastDialog, setShowAddBroadcastDialog] = useState(false);
  const [showCampaignAssistant, setShowCampaignAssistant] = useState(false);
  const { toast } = useToast();

  // Filter campaigns based on search term
  const filteredCampaigns = MOCK_CAMPAIGNS.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    campaign.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter segments based on search term
  const filteredSegments = MOCK_SEGMENTS.filter(segment => 
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    segment.criteria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle viewing campaign details
  const handleViewCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetailsDialog(true);
  };

  // Status badges for campaigns
  const getCampaignStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activa</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Programada</Badge>;
      case 'completed':
        return <Badge className="bg-purple-100 text-purple-800">Completada</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Borrador</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>;
    }
  };

  // Status badges for broadcasts
  const getBroadcastStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">En progreso</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800">Programado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>;
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona tus campañas, segmentos de audiencia y mensajes personalizados
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Buscar campañas, segmentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <RiAddLine className="h-5 w-5" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 gap-4 w-full md:w-2/3">
          <TabsTrigger value="campaigns" className="flex gap-2 items-center">
            <RiAdvertisementLine />
            <span>Campañas</span>
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="flex gap-2 items-center">
            <RiMailLine />
            <span>Difusiones</span>
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex gap-2 items-center">
            <RiTeamLine />
            <span>Segmentos</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex gap-2 items-center">
            <RiFileTextLine />
            <span>Plantillas</span>
          </TabsTrigger>
        </TabsList>

        {/* Campañas Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Gestión de campañas</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowCampaignAssistant(true)}
              >
                <RiUserLine />
                <span>Asistente IA para Campañas</span>
              </Button>
              <Dialog open={showAddCampaignDialog} onOpenChange={setShowAddCampaignDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <RiAddLine />
                    <span>Nueva campaña</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                  <DialogTitle>Crear nueva campaña</DialogTitle>
                  <DialogDescription>
                    Define los detalles de tu campaña de marketing. Todos los campos marcados con * son obligatorios.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="campaign-name">Nombre de la campaña *</Label>
                      <Input id="campaign-name" placeholder="Ej: Oferta de Verano" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campaign-status">Estado *</Label>
                      <Select defaultValue="draft">
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="scheduled">Programada</SelectItem>
                          <SelectItem value="active">Activa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="campaign-audience">Audiencia *</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar audiencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los contactos</SelectItem>
                        <SelectItem value="segments">Segmentos específicos</SelectItem>
                        <SelectItem value="abandoned">Carritos abandonados</SelectItem>
                        <SelectItem value="customers">Clientes recientes</SelectItem>
                        <SelectItem value="loyal">Clientes fieles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Programación *</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="justify-start text-left font-normal"
                          >
                            <RiCalendarLine className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Selecciona una fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Select defaultValue="10:00">
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar hora" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">09:00</SelectItem>
                          <SelectItem value="10:00">10:00</SelectItem>
                          <SelectItem value="11:00">11:00</SelectItem>
                          <SelectItem value="12:00">12:00</SelectItem>
                          <SelectItem value="15:00">15:00</SelectItem>
                          <SelectItem value="16:00">16:00</SelectItem>
                          <SelectItem value="17:00">17:00</SelectItem>
                          <SelectItem value="18:00">18:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="campaign-message">Mensaje *</Label>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        Usar plantilla
                      </Button>
                    </div>
                    <Textarea 
                      id="campaign-message" 
                      placeholder="Escribe el mensaje que recibirán tus contactos..." 
                      rows={6}
                      defaultValue="¡Hola [nombre]! 👋 Tenemos novedades que podrían interesarte. Responde a este mensaje para más información."
                    />
                    <p className="text-xs text-gray-500">
                      Usa [nombre] para insertar el nombre del contacto y otros campos dinámicos como [producto], [descuento], etc.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddCampaignDialog(false)}>Cancelar</Button>
                  <Button onClick={() => {
                    setShowAddCampaignDialog(false);
                    toast({
                      title: "Campaña creada",
                      description: "La campaña ha sido creada con éxito",
                    });
                  }}>Guardar campaña</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Programación</TableHead>
                <TableHead>Audiencia</TableHead>
                <TableHead>Rendimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map(campaign => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{getCampaignStatusBadge(campaign.status)}</TableCell>
                    <TableCell>
                      {campaign.schedule === "running" ? 
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                          <RiTimeLine className="mr-1 h-3 w-3" />
                          En ejecución
                        </Badge> : 
                        formatDate(campaign.schedule)
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="capitalize">{
                          campaign.audience === "all" ? "Todos" :
                          campaign.audience === "segments" ? "Segmentos" :
                          campaign.audience === "abandoned" ? "Carritos abandonados" :
                          campaign.audience === "customers" ? "Clientes recientes" :
                          campaign.audience === "loyal" ? "Clientes fieles" : campaign.audience
                        }</span>
                        <span className="text-xs text-gray-500">{campaign.audienceSize} contactos</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {campaign.status === "draft" || campaign.status === "scheduled" ? (
                        <span className="text-sm text-gray-500">-</span>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Apertura: {campaign.openRate}%</span>
                            <span>Interacción: {campaign.clickRate}%</span>
                          </div>
                          <Progress 
                            value={campaign.clickRate} 
                            className="h-2" 
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewCampaign(campaign)}>
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    No se encontraron campañas. Crea tu primera campaña para empezar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Campaign Details Dialog */}
          <Dialog open={showCampaignDetailsDialog} onOpenChange={setShowCampaignDetailsDialog}>
            <DialogContent className="sm:max-w-[700px]">
              {selectedCampaign && (
                <>
                  <DialogHeader>
                    <div className="flex justify-between items-center">
                      <DialogTitle>Campaña: {selectedCampaign.name}</DialogTitle>
                      {getCampaignStatusBadge(selectedCampaign.status)}
                    </div>
                    <DialogDescription>
                      {selectedCampaign.status === "scheduled" ? 
                        `Programada para ${formatDate(selectedCampaign.schedule)}` : 
                        selectedCampaign.status === "active" && selectedCampaign.schedule === "running" ?
                        "En ejecución actualmente" :
                        selectedCampaign.status === "completed" ?
                        `Completada el ${formatDate(selectedCampaign.schedule)}` :
                        "Borrador - No programada"
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Audiencia</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                              <RiTeamLine className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium capitalize">{
                                selectedCampaign.audience === "all" ? "Todos los contactos" :
                                selectedCampaign.audience === "segments" ? "Segmentos específicos" :
                                selectedCampaign.audience === "abandoned" ? "Carritos abandonados" :
                                selectedCampaign.audience === "customers" ? "Clientes recientes" :
                                selectedCampaign.audience === "loyal" ? "Clientes fieles" : selectedCampaign.audience
                              }</p>
                              <p className="text-sm text-gray-500">{selectedCampaign.audienceSize} contactos</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Rendimiento</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedCampaign.status === "draft" || selectedCampaign.status === "scheduled" ? (
                            <div className="flex items-center justify-center h-[72px] text-gray-400">
                              <p className="text-center text-sm">
                                Datos disponibles cuando<br />la campaña esté activa
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-2xl font-bold text-blue-600">{selectedCampaign.openRate}%</p>
                                <p className="text-xs text-gray-500">Tasa de apertura</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-green-600">{selectedCampaign.clickRate}%</p>
                                <p className="text-xs text-gray-500">Tasa de interacción</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-purple-600">{selectedCampaign.conversions}</p>
                                <p className="text-xs text-gray-500">Conversiones</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Mensaje</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <p className="whitespace-pre-line">{selectedCampaign.message}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {selectedCampaign.status !== "draft" && selectedCampaign.status !== "scheduled" && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Estadísticas detalladas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Tasa de apertura</span>
                                <span className="font-medium">{selectedCampaign.openRate}%</span>
                              </div>
                              <Progress value={selectedCampaign.openRate} className="h-2" />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Tasa de interacción</span>
                                <span className="font-medium">{selectedCampaign.clickRate}%</span>
                              </div>
                              <Progress value={selectedCampaign.clickRate} className="h-2" />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Tasa de conversión</span>
                                <span className="font-medium">{(selectedCampaign.conversions / selectedCampaign.audienceSize * 100).toFixed(1)}%</span>
                              </div>
                              <Progress value={(selectedCampaign.conversions / selectedCampaign.audienceSize * 100)} className="h-2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setShowCampaignDetailsDialog(false)}>Cerrar</Button>
                    {selectedCampaign.status === "draft" && (
                      <Button onClick={() => {
                        setShowCampaignDetailsDialog(false);
                        toast({
                          title: "Campaña activada",
                          description: "La campaña ha sido programada con éxito",
                        });
                      }}>Programar campaña</Button>
                    )}
                    {selectedCampaign.status === "scheduled" && (
                      <Button onClick={() => {
                        setShowCampaignDetailsDialog(false);
                        toast({
                          title: "Campaña iniciada",
                          description: "La campaña ha sido iniciada manualmente",
                        });
                      }}>Iniciar ahora</Button>
                    )}
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
            </div>
        </TabsContent>

        {/* Broadcasts Tab */}
        <TabsContent value="broadcasts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Mensajes de difusión</h2>
            <Dialog open={showAddBroadcastDialog} onOpenChange={setShowAddBroadcastDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <RiAddLine />
                  <span>Nueva difusión</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Crear nuevo mensaje de difusión</DialogTitle>
                  <DialogDescription>
                    Los mensajes de difusión se envían a múltiples contactos a la vez, pero cada destinatario lo recibe como un mensaje individual.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="broadcast-name">Nombre de la difusión *</Label>
                    <Input id="broadcast-name" placeholder="Ej: Anuncio de rebajas" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="broadcast-audience">Audiencia *</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar audiencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los contactos</SelectItem>
                        <SelectItem value="segments">Seleccionar segmentos</SelectItem>
                        <SelectItem value="manual">Selección manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Programación</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="justify-start text-left font-normal"
                          >
                            <RiCalendarLine className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Selecciona una fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Select defaultValue="10:00">
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar hora" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">09:00</SelectItem>
                          <SelectItem value="10:00">10:00</SelectItem>
                          <SelectItem value="11:00">11:00</SelectItem>
                          <SelectItem value="12:00">12:00</SelectItem>
                          <SelectItem value="15:00">15:00</SelectItem>
                          <SelectItem value="16:00">16:00</SelectItem>
                          <SelectItem value="17:00">17:00</SelectItem>
                          <SelectItem value="18:00">18:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center mt-2 space-x-2">
                      <input type="checkbox" id="send-now" className="h-4 w-4" />
                      <Label htmlFor="send-now" className="text-sm cursor-pointer">Enviar inmediatamente</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="broadcast-message">Mensaje *</Label>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        Usar plantilla
                      </Button>
                    </div>
                    <Textarea 
                      id="broadcast-message" 
                      placeholder="Escribe el mensaje que recibirán tus contactos..." 
                      rows={6}
                    />
                    <p className="text-xs text-gray-500">
                      Puedes incluir archivos adjuntos como imágenes, documentos o vídeos.
                    </p>
                  </div>

                  <div className="flex items-center py-2 border-t">
                    <Button variant="outline" className="gap-2">
                      <RiUploadLine className="h-4 w-4" />
                      <span>Adjuntar archivo</span>
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddBroadcastDialog(false)}>Cancelar</Button>
                  <Button onClick={() => {
                    setShowAddBroadcastDialog(false);
                    toast({
                      title: "Difusión programada",
                      description: "El mensaje de difusión ha sido programado con éxito",
                    });
                  }}>Programar difusión</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Audiencia</TableHead>
                <TableHead>Rendimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_BROADCASTS.map(broadcast => (
                <TableRow key={broadcast.id}>
                  <TableCell className="font-medium">{broadcast.name}</TableCell>
                  <TableCell>{formatDate(broadcast.date)}</TableCell>
                  <TableCell>{getBroadcastStatusBadge(broadcast.status)}</TableCell>
                  <TableCell>{broadcast.audience} contactos</TableCell>
                  <TableCell>
                    {broadcast.status === "scheduled" ? (
                      <span className="text-sm text-gray-500">Pendiente</span>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Entregados: {Math.round(broadcast.delivered / broadcast.audience * 100)}%</span>
                          <span>Leídos: {Math.round(broadcast.read / broadcast.audience * 100)}%</span>
                        </div>
                        <Progress 
                          value={broadcast.read / broadcast.audience * 100} 
                          className="h-2" 
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ver detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Segmentos de audiencia</h2>
            <Button className="gap-2">
              <RiAddLine />
              <span>Nuevo segmento</span>
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contactos</TableHead>
                <TableHead>Criterios</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSegments.length > 0 ? (
                filteredSegments.map(segment => (
                  <TableRow key={segment.id}>
                    <TableCell className="font-medium">{segment.name}</TableCell>
                    <TableCell>{segment.count}</TableCell>
                    <TableCell className="max-w-sm truncate">{segment.criteria}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon">
                        <RiEditLine className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <RiDeleteBinLine className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                    No se encontraron segmentos. Crea tu primer segmento para organizar tus contactos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Plantillas de mensajes</h2>
            <Button className="gap-2">
              <RiAddLine />
              <span>Nueva plantilla</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_TEMPLATES.map(template => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{template.content}</p>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button size="sm">Usar</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Campaign Assistant Dialog */}
      {showCampaignAssistant && (
        <CampaignAssistant 
          onComplete={(config) => {
            setShowCampaignAssistant(false);
            toast({
              title: "Configuración completada",
              description: "La campaña se ha configurado según las recomendaciones del asistente IA.",
            });
          }}
        />
      )}
    </>
  );
}