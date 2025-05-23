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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  RiUser3Line, 
  RiTeamLine,
  RiCalendarLine,
  RiAddLine, 
  RiFileTextLine, 
  RiCheckLine,
  RiCloseLine,
  RiEditLine,
  RiDeleteBinLine,
  RiMailLine,
  RiTimeLine,
  RiPieChartLine,
  RiBarChart2Line,
  RiWhatsappLine,
  RiMessage2Line,
  RiAttachmentLine,
  RiStarLine,
  RiGroupLine,
  RiFilterLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiBubbleChartLine,
  RiHistoryLine,
  RiMapPinLine,
  RiBuilding4Line,
  RiPhoneLine
} from "@/lib/icons";
import { Layout } from "@/components/layout/layout";

// Mock data for customer profiles
const MOCK_CUSTOMERS = [
  {
    id: "1",
    name: "María García López",
    email: "maria.garcia@email.com",
    phone: "+34612345678",
    company: "Innovaciones S.L.",
    position: "Marketing Manager",
    source: "whatsapp",
    status: "active",
    tags: ["cliente fiel", "premium", "interesado en ofertas"],
    created: "2023-02-15",
    lastContact: "2023-06-12",
    lifetime_value: 1580,
    priority: "high"
  },
  {
    id: "2",
    name: "Carlos Rodríguez Martínez",
    email: "carlos.rodriguez@email.com",
    phone: "+34623456789",
    company: "Tech Solutions",
    position: "CEO",
    source: "web",
    status: "active",
    tags: ["nuevo cliente", "empresa"],
    created: "2023-05-03",
    lastContact: "2023-06-10",
    lifetime_value: 450,
    priority: "medium"
  },
  {
    id: "3",
    name: "Laura Fernández Sánchez",
    email: "laura.fernandez@email.com",
    phone: "+34634567890",
    company: "Comercial Express",
    position: "Sales Director",
    source: "referral",
    status: "inactive",
    tags: ["inactivo", "seguimiento"],
    created: "2022-11-20",
    lastContact: "2023-03-05",
    lifetime_value: 2340,
    priority: "low"
  },
  {
    id: "4",
    name: "Javier López Torres",
    email: "javier.lopez@email.com",
    phone: "+34645678901",
    company: "Gestión Integral",
    position: "Operations Manager",
    source: "whatsapp",
    status: "active",
    tags: ["premium", "alto potencial"],
    created: "2023-01-08",
    lastContact: "2023-06-01",
    lifetime_value: 3250,
    priority: "high"
  },
  {
    id: "5",
    name: "Ana Martínez Ruiz",
    email: "ana.martinez@email.com",
    phone: "+34656789012",
    company: "Consultores Asociados",
    position: "Consultant",
    source: "manual",
    status: "active",
    tags: ["nuevo cliente", "interesado en formación"],
    created: "2023-04-22",
    lastContact: "2023-05-28",
    lifetime_value: 720,
    priority: "medium"
  }
];

// Mock data for customer segments
const MOCK_SEGMENTS = [
  {
    id: "segment1",
    name: "Clientes VIP",
    count: 32,
    criteria: "Valor de vida > 1000€",
    description: "Clientes de alto valor con compras recurrentes",
    lastCampaign: "Oferta exclusiva VIP - 20% descuento"
  },
  {
    id: "segment2",
    name: "Clientes inactivos",
    count: 147,
    criteria: "Sin actividad > 60 días",
    description: "Clientes que no han interactuado en los últimos 2 meses",
    lastCampaign: "Recuperación de clientes - Descuento primer pedido"
  },
  {
    id: "segment3",
    name: "Nuevos clientes",
    count: 86,
    criteria: "Registrados < 30 días",
    description: "Clientes registrados en el último mes",
    lastCampaign: "Bienvenida y onboarding"
  },
  {
    id: "segment4",
    name: "Compradores frecuentes",
    count: 59,
    criteria: "> 3 compras en 90 días",
    description: "Clientes con alta frecuencia de compra",
    lastCampaign: "Programa de fidelización - Puntos dobles"
  },
  {
    id: "segment5",
    name: "Alto potencial",
    count: 41,
    criteria: "Navegación de productos premium sin compra",
    description: "Clientes interesados en productos de alto valor",
    lastCampaign: "Consulta personalizada con experto"
  }
];

// Mock data for customer journey stages
const MOCK_JOURNEY_STAGES = [
  {
    id: "stage1",
    name: "Descubrimiento",
    description: "Cliente conoce la marca/producto",
    count: 215,
    conversion: 68,
    tasks: ["Enviar mensaje de bienvenida", "Compartir catálogo", "Responder consultas iniciales"]
  },
  {
    id: "stage2",
    name: "Consideración",
    description: "Cliente evaluando opciones",
    count: 142,
    conversion: 45,
    tasks: ["Enviar información detallada", "Resolver objeciones", "Ofrecer demostración"]
  },
  {
    id: "stage3",
    name: "Decisión",
    description: "Cliente cerca de comprar",
    count: 78,
    conversion: 32,
    tasks: ["Presentar oferta", "Facilitar compra", "Resolver dudas finales"]
  },
  {
    id: "stage4",
    name: "Acción",
    description: "Cliente realiza la compra",
    count: 53,
    conversion: 25,
    tasks: ["Confirmar pedido", "Asistir en el proceso", "Solucionar problemas"]
  },
  {
    id: "stage5",
    name: "Fidelización",
    description: "Cliente recurrente",
    count: 127,
    conversion: null,
    tasks: ["Seguimiento post-venta", "Programa de fidelización", "Ofertas exclusivas"]
  }
];

// Mock data for communication templates
const MOCK_TEMPLATES = [
  {
    id: "template1",
    name: "Bienvenida a nuevos clientes",
    channel: "whatsapp",
    content: "¡Hola [nombre]! Bienvenido/a a [empresa]. Estamos encantados de tenerte con nosotros. ¿En qué podemos ayudarte hoy?",
    tags: ["bienvenida", "nuevos clientes"],
    usageCount: 342
  },
  {
    id: "template2",
    name: "Seguimiento de pedido",
    channel: "whatsapp",
    content: "Hola [nombre], tu pedido #[número] ha sido [estado]. Puedes seguir su estado en este enlace: [enlace]. ¿Necesitas ayuda adicional?",
    tags: ["pedidos", "seguimiento"],
    usageCount: 256
  },
  {
    id: "template3",
    name: "Recordatorio de cita",
    channel: "whatsapp",
    content: "Recordatorio: Tienes una cita programada para el [fecha] a las [hora]. Confirma asistencia respondiendo a este mensaje. Gracias.",
    tags: ["citas", "recordatorio"],
    usageCount: 189
  },
  {
    id: "template4",
    name: "Recuperación de clientes inactivos",
    channel: "whatsapp",
    content: "¡Hola [nombre]! Te echamos de menos. Han pasado [días] desde tu última visita. Tenemos estas novedades que podrían interesarte: [ofertas]",
    tags: ["recuperación", "inactivos"],
    usageCount: 124
  },
  {
    id: "template5",
    name: "Solicitud de valoración",
    channel: "whatsapp",
    content: "Hola [nombre], ¿qué tal tu experiencia con [producto/servicio]? Nos encantaría conocer tu opinión. Responde con un número del 1 al 5.",
    tags: ["valoración", "feedback"],
    usageCount: 215
  }
];

// Mock data for conversations
const MOCK_CONVERSATIONS = [
  {
    id: "conv1",
    customer: MOCK_CUSTOMERS[0],
    lastMessage: "¿Podría ayudarme con mi pedido? No ha llegado todavía",
    date: "2023-06-12T10:30:00",
    status: "unassigned",
    platform: "whatsapp",
    unread: true
  },
  {
    id: "conv2",
    customer: MOCK_CUSTOMERS[1],
    lastMessage: "Gracias por la información. Lo revisaré y te contacto si tengo dudas.",
    date: "2023-06-10T15:45:00",
    status: "resolved",
    platform: "whatsapp", 
    unread: false
  },
  {
    id: "conv3",
    customer: MOCK_CUSTOMERS[3],
    lastMessage: "¿Tienen el modelo en color negro?",
    date: "2023-06-01T09:20:00",
    status: "active",
    platform: "whatsapp",
    unread: false
  },
  {
    id: "conv4",
    customer: MOCK_CUSTOMERS[4],
    lastMessage: "Me gustaría agendar una demostración del producto",
    date: "2023-05-28T16:15:00",
    status: "resolved",
    platform: "web",
    unread: false
  }
];

// Mock data for activities
const MOCK_ACTIVITIES = [
  {
    id: "act1",
    type: "message",
    customer: MOCK_CUSTOMERS[0].name,
    description: "Mensaje recibido sobre consulta de producto",
    date: "2023-06-12T10:30:00"
  },
  {
    id: "act2",
    type: "purchase",
    customer: MOCK_CUSTOMERS[1].name,
    description: "Compra de Smartphone Pro X por €599.99",
    date: "2023-06-10T15:45:00"
  },
  {
    id: "act3",
    type: "message",
    customer: MOCK_CUSTOMERS[3].name,
    description: "Mensaje enviado con catálogo de productos",
    date: "2023-06-01T09:20:00"
  },
  {
    id: "act4",
    type: "note",
    customer: MOCK_CUSTOMERS[2].name,
    description: "Cliente solicitó seguimiento en 2 semanas",
    date: "2023-05-28T16:15:00"
  },
  {
    id: "act5",
    type: "message",
    customer: MOCK_CUSTOMERS[4].name,
    description: "Consulta sobre disponibilidad de producto",
    date: "2023-05-28T12:05:00"
  }
];

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState("contacts");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerDetailsDialog, setShowCustomerDetailsDialog] = useState(false);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const { toast } = useToast();

  // Filter customers based on search term and filters
  const filteredCustomers = MOCK_CUSTOMERS.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    const matchesSource = sourceFilter === "all" || customer.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    
    if (dateString.includes("T")) {
      // Format datetime
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } else {
      // Format date only
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    }
  };

  // Handle viewing customer details
  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowCustomerDetailsDialog(true);
  };

  // Handle adding note
  const handleAddNote = () => {
    setShowAddNoteDialog(false);
    toast({
      title: "Nota añadida",
      description: "La nota ha sido añadida correctamente al cliente",
    });
  };

  // Status badges for customers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>;
      case "lead":
        return <Badge className="bg-blue-100 text-blue-800">Lead</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>;
    }
  };

  // Source badges for customers
  const getSourceBadge = (source: string) => {
    switch (source) {
      case "whatsapp":
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><RiWhatsappLine className="h-3 w-3" /> WhatsApp</Badge>;
      case "web":
        return <Badge className="bg-blue-100 text-blue-800">Web</Badge>;
      case "referral":
        return <Badge className="bg-purple-100 text-purple-800">Referido</Badge>;
      case "manual":
        return <Badge className="bg-gray-100 text-gray-800">Manual</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Otro</Badge>;
    }
  };

  // Priority badges
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">Alta</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Baja</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>;
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CRM Avanzado</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona tus clientes, contactos y relaciones de negocio
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Input
              type="text"
              placeholder="Buscar contactos, empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <RiAddLine className="h-5 w-5" />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
              <SelectItem value="lead">Leads</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Origen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="referral">Referido</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
          <DialogTrigger asChild>
            <Button>
              <RiAddLine className="mr-2 h-4 w-4" />
              Nuevo contacto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Añadir nuevo contacto</DialogTitle>
              <DialogDescription>
                Completa la información del contacto para añadirlo a tu CRM.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Nombre completo</Label>
                  <Input id="contact-name" placeholder="Nombre y apellidos" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" placeholder="ejemplo@email.com" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Teléfono</Label>
                  <Input id="contact-phone" placeholder="+34612345678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-source">Origen</Label>
                  <Select defaultValue="whatsapp">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar origen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="referral">Referido</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-company">Empresa</Label>
                  <Input id="contact-company" placeholder="Nombre de la empresa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-position">Cargo</Label>
                  <Input id="contact-position" placeholder="Ej: Marketing Manager" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact-tags">Etiquetas</Label>
                <Input id="contact-tags" placeholder="Ej: nuevo cliente, premium, interesado" />
                <p className="text-xs text-gray-500">
                  Separa las etiquetas con comas.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact-notes">Notas adicionales</Label>
                <Textarea id="contact-notes" placeholder="Información adicional sobre el contacto" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddCustomerDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowAddCustomerDialog(false);
                toast({
                  title: "Contacto añadido",
                  description: "El contacto ha sido añadido correctamente al CRM",
                });
              }}>
                Guardar contacto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="contacts" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 gap-4 w-full md:w-3/4">
          <TabsTrigger value="contacts" className="flex gap-2 items-center">
            <RiTeamLine />
            <span>Contactos</span>
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex gap-2 items-center">
            <RiTeamLine />
            <span>Segmentos</span>
          </TabsTrigger>
          <TabsTrigger value="journey" className="flex gap-2 items-center">
            <RiBubbleChartLine />
            <span>Journey</span>
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex gap-2 items-center">
            <RiMessage2Line />
            <span>Comunicaciones</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex gap-2 items-center">
            <RiHistoryLine />
            <span>Actividad</span>
          </TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Listado de contactos</CardTitle>
              <CardDescription>
                Gestiona todos tus contactos y su información
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Empresa/Cargo</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(customer => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                            {customer.name.split(' ')[0][0]}{customer.name.split(' ')[1]?.[0] || ''}
                          </div>
                          <div className="flex flex-col">
                            <span>{customer.name}</span>
                            <span className="text-xs text-gray-500">Cliente desde {formatDate(customer.created)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1 text-sm">
                              <RiMailLine className="h-3 w-3 text-gray-400" />
                              {customer.email}
                            </span>
                            <span className="flex items-center gap-1 text-sm">
                              <RiPhoneLine className="h-3 w-3 text-gray-400" />
                              {customer.phone}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1 text-sm">
                              <RiBuilding4Line className="h-3 w-3 text-gray-400" />
                              {customer.company}
                            </span>
                            <span className="text-xs text-gray-500">{customer.position}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getSourceBadge(customer.source)}</TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(customer.lifetime_value)}</span>
                            <span>{getPriorityBadge(customer.priority)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                            Ver detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                        No se encontraron contactos con los filtros seleccionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Customer Details Dialog */}
          <Dialog open={showCustomerDetailsDialog} onOpenChange={setShowCustomerDetailsDialog}>
            <DialogContent className="sm:max-w-[900px]">
              {selectedCustomer && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                        {selectedCustomer.name.split(' ')[0][0]}{selectedCustomer.name.split(' ')[1]?.[0] || ''}
                      </div>
                      <div>
                        <DialogTitle>{selectedCustomer.name}</DialogTitle>
                        <DialogDescription>
                          Cliente desde {formatDate(selectedCustomer.created)} • Último contacto: {formatDate(selectedCustomer.lastContact)}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer details column */}
                    <div className="space-y-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-md">Información personal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Email:</span>
                            <span className="text-sm font-medium">{selectedCustomer.email}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Teléfono:</span>
                            <span className="text-sm font-medium">{selectedCustomer.phone}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Empresa:</span>
                            <span className="text-sm font-medium">{selectedCustomer.company}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Cargo:</span>
                            <span className="text-sm font-medium">{selectedCustomer.position}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Estado:</span>
                            <span>{getStatusBadge(selectedCustomer.status)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Origen:</span>
                            <span>{getSourceBadge(selectedCustomer.source)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Valor total:</span>
                            <span className="text-sm font-medium">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(selectedCustomer.lifetime_value)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Prioridad:</span>
                            <span>{getPriorityBadge(selectedCustomer.priority)}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t pt-4">
                          <Button variant="outline" size="sm">
                            <RiEditLine className="mr-2 h-4 w-4" />
                            Editar información
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-md">Etiquetas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedCustomer.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="bg-blue-50">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t pt-4">
                          <Button variant="outline" size="sm">
                            <RiEditLine className="mr-2 h-4 w-4" />
                            Gestionar etiquetas
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                    
                    {/* Activity and communication column */}
                    <div className="md:col-span-2 space-y-6">
                      <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-md">Conversaciones recientes</CardTitle>
                          </div>
                          <Button variant="outline" size="sm">
                            <RiMessage2Line className="mr-2 h-4 w-4" />
                            Enviar mensaje
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {MOCK_CONVERSATIONS.filter(conv => conv.customer.id === selectedCustomer.id).length > 0 ? (
                            MOCK_CONVERSATIONS
                              .filter(conv => conv.customer.id === selectedCustomer.id)
                              .map(conv => (
                                <div key={conv.id} className="border rounded-lg p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                      <RiWhatsappLine className="h-5 w-5 text-green-500" />
                                      <span className="font-medium">WhatsApp</span>
                                      {conv.unread && (
                                        <Badge className="bg-blue-100 text-blue-800">No leído</Badge>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500">{formatDate(conv.date)}</span>
                                  </div>
                                  <p className="text-gray-600 text-sm">{conv.lastMessage}</p>
                                  <div className="flex justify-end mt-2">
                                    <Button variant="outline" size="sm">
                                      Ver conversación
                                    </Button>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              <p>No hay conversaciones recientes con este cliente.</p>
                              <Button variant="outline" size="sm" className="mt-2">
                                Iniciar conversación
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-md">Notas y actividad</CardTitle>
                          </div>
                          <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <RiAddLine className="mr-2 h-4 w-4" />
                                Añadir nota
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Añadir nota</DialogTitle>
                                <DialogDescription>
                                  Añade una nota sobre este cliente para tu seguimiento interno.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="note-title">Título</Label>
                                  <Input id="note-title" placeholder="Ej: Seguimiento de pedido" />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="note-content">Contenido</Label>
                                  <Textarea 
                                    id="note-content" 
                                    placeholder="Escribe los detalles de la nota..." 
                                    rows={5}
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input type="checkbox" id="note-reminder" className="h-4 w-4" />
                                  <Label htmlFor="note-reminder" className="text-sm">
                                    Añadir recordatorio para seguimiento
                                  </Label>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setShowAddNoteDialog(false)}>
                                  Cancelar
                                </Button>
                                <Button onClick={handleAddNote}>
                                  Guardar nota
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="border-l-4 border-blue-500 pl-4 py-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">Interesado en nuevos modelos</h4>
                                <span className="text-xs text-gray-500">Hace 3 días</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Cliente mostró interés en los nuevos modelos que llegarán el próximo mes. Programar seguimiento.
                              </p>
                            </div>
                            
                            <div className="border-l-4 border-green-500 pl-4 py-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">Compra completada</h4>
                                <span className="text-xs text-gray-500">12/05/2023</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Realizó compra de Smartphone Pro X por €599.99. Envío programado para el 15/05.
                              </p>
                            </div>
                            
                            <div className="border-l-4 border-yellow-500 pl-4 py-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">Consulta técnica</h4>
                                <span className="text-xs text-gray-500">28/04/2023</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Solicitó información técnica detallada sobre características de batería y cámara.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-md">Acciones rápidas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <Button variant="outline" className="h-auto py-2 px-3 flex flex-col items-center justify-center">
                              <RiWhatsappLine className="h-5 w-5 mb-1" />
                              <span className="text-sm">Enviar WhatsApp</span>
                            </Button>
                            
                            <Button variant="outline" className="h-auto py-2 px-3 flex flex-col items-center justify-center">
                              <RiMailLine className="h-5 w-5 mb-1" />
                              <span className="text-sm">Enviar email</span>
                            </Button>
                            
                            <Button variant="outline" className="h-auto py-2 px-3 flex flex-col items-center justify-center">
                              <RiCalendarLine className="h-5 w-5 mb-1" />
                              <span className="text-sm">Agendar cita</span>
                            </Button>
                            
                            <Button variant="outline" className="h-auto py-2 px-3 flex flex-col items-center justify-center">
                              <RiFileTextLine className="h-5 w-5 mb-1" />
                              <span className="text-sm">Crear tarea</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Segmentos de clientes</CardTitle>
                  <CardDescription>
                    Agrupa tus contactos en segmentos para una comunicación más efectiva
                  </CardDescription>
                </div>
                <Button>
                  <RiAddLine className="mr-2 h-4 w-4" />
                  Crear segmento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contactos</TableHead>
                    <TableHead>Criterios</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Última campaña</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_SEGMENTS.map(segment => (
                    <TableRow key={segment.id}>
                      <TableCell className="font-medium">{segment.name}</TableCell>
                      <TableCell>{segment.count}</TableCell>
                      <TableCell>{segment.criteria}</TableCell>
                      <TableCell className="max-w-xs truncate">{segment.description}</TableCell>
                      <TableCell className="max-w-xs truncate">{segment.lastCampaign}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm">Ver contactos</Button>
                        <Button variant="outline" size="sm">Enviar mensaje</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de segmentos</CardTitle>
                <CardDescription>
                  Porcentaje de contactos por segmento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  {/* Placeholder for pie chart */}
                  <div className="w-40 h-40 relative rounded-full bg-gray-100 overflow-hidden">
                    <div className="absolute w-full h-full" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)', background: '#8884d8', transform: 'rotate(0deg)' }}></div>
                    <div className="absolute w-full h-full" style={{ clipPath: 'polygon(50% 50%, 100% 0, 0 0)', background: '#82ca9d', transform: 'rotate(0deg)' }}></div>
                    <div className="absolute w-full h-full" style={{ clipPath: 'polygon(50% 50%, 0 0, 0 100%)', background: '#ffc658', transform: 'rotate(0deg)' }}></div>
                    <div className="absolute w-full h-full" style={{ clipPath: 'polygon(50% 50%, 0 100%, 100% 100%)', background: '#ff8042', transform: 'rotate(0deg)' }}></div>
                    <div className="absolute w-16 h-16 bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 mt-4 gap-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8884d8] mr-2"></div>
                    <span className="text-sm">Clientes VIP</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#82ca9d] mr-2"></div>
                    <span className="text-sm">Clientes inactivos</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#ffc658] mr-2"></div>
                    <span className="text-sm">Nuevos clientes</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#ff8042] mr-2"></div>
                    <span className="text-sm">Compradores frecuentes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento de segmentos</CardTitle>
                <CardDescription>
                  Tasa de respuesta y conversión por segmento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Clientes VIP</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Clientes inactivos</span>
                      <span className="font-medium">21%</span>
                    </div>
                    <Progress value={21} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Nuevos clientes</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Compradores frecuentes</span>
                      <span className="font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Alto potencial</span>
                      <span className="font-medium">52%</span>
                    </div>
                    <Progress value={52} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Journey Tab */}
        <TabsContent value="journey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Journey del cliente</CardTitle>
              <CardDescription>
                Visualiza y gestiona el recorrido del cliente a través de las distintas etapas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="flex gap-4 min-w-max pb-4">
                  {MOCK_JOURNEY_STAGES.map((stage, index) => (
                    <div key={stage.id} className="w-64">
                      <div className="bg-gray-50 border rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">{stage.name}</h3>
                          <Badge>{stage.count}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{stage.description}</p>
                        
                        {index < MOCK_JOURNEY_STAGES.length - 1 && (
                          <div className="flex items-center justify-between text-sm">
                            <span>Conversión:</span>
                            <span className="font-medium">{stage.conversion}%</span>
                          </div>
                        )}
                        
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="w-full">
                            Ver contactos
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        {stage.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="bg-white border rounded-md p-3 text-sm flex items-start gap-2">
                            <input type="checkbox" className="mt-1 h-4 w-4" />
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversión entre etapas</CardTitle>
                <CardDescription>
                  Análisis de la tasa de conversión entre etapas del journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Descubrimiento → Consideración</span>
                      <span className="text-sm">{MOCK_JOURNEY_STAGES[0].conversion}%</span>
                    </div>
                    <Progress value={MOCK_JOURNEY_STAGES[0].conversion!} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>De {MOCK_JOURNEY_STAGES[0].count} a {MOCK_JOURNEY_STAGES[1].count} contactos</span>
                      <span className="text-green-600">+3.5% vs. mes anterior</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Consideración → Decisión</span>
                      <span className="text-sm">{MOCK_JOURNEY_STAGES[1].conversion}%</span>
                    </div>
                    <Progress value={MOCK_JOURNEY_STAGES[1].conversion!} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>De {MOCK_JOURNEY_STAGES[1].count} a {MOCK_JOURNEY_STAGES[2].count} contactos</span>
                      <span className="text-red-600">-2.1% vs. mes anterior</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Decisión → Acción</span>
                      <span className="text-sm">{MOCK_JOURNEY_STAGES[2].conversion}%</span>
                    </div>
                    <Progress value={MOCK_JOURNEY_STAGES[2].conversion!} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>De {MOCK_JOURNEY_STAGES[2].count} a {MOCK_JOURNEY_STAGES[3].count} contactos</span>
                      <span className="text-green-600">+5.2% vs. mes anterior</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Acción → Fidelización</span>
                      <span className="text-sm">{MOCK_JOURNEY_STAGES[3].conversion}%</span>
                    </div>
                    <Progress value={MOCK_JOURNEY_STAGES[3].conversion!} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>De {MOCK_JOURNEY_STAGES[3].count} a {MOCK_JOURNEY_STAGES[4].count} contactos</span>
                      <span className="text-green-600">+1.8% vs. mes anterior</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimización del Journey</CardTitle>
                <CardDescription>
                  Recomendaciones para mejorar la experiencia del cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-yellow-500 pl-4 py-2">
                    <h4 className="font-medium">Mejorar conversión Consideración → Decisión</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      La conversión en esta etapa ha bajado. Considera fortalecer los mensajes de valor y ofrecer testimonios de clientes.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-medium">Buen rendimiento en etapa de Fidelización</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      La tasa de clientes que llegan a fidelización es alta. Mantén las estrategias de post-venta y programas de lealtad.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-medium">Oportunidad en etapa de Decisión</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Hay un número significativo de clientes en esta etapa. Considera acciones para impulsar la conversión a compra.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4 py-2">
                    <h4 className="font-medium">Automatizar tareas en etapa de Descubrimiento</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Las tareas de esta etapa pueden automatizarse para mejorar la eficiencia y personalización.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Plantillas de comunicación</CardTitle>
                    <CardDescription>
                      Gestiona tus plantillas para diferentes canales y situaciones
                    </CardDescription>
                  </div>
                  <Button>
                    <RiAddLine className="mr-2 h-4 w-4" />
                    Crear plantilla
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Etiquetas</TableHead>
                      <TableHead>Uso</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_TEMPLATES.map(template => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          {template.channel === "whatsapp" ? (
                            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                              <RiWhatsappLine className="h-3 w-3" />
                              WhatsApp
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800">
                              Email
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {template.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="bg-gray-50">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{template.usageCount} veces</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm">Ver</Button>
                          <Button variant="ghost" size="sm">Usar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversaciones</CardTitle>
                <CardDescription>
                  Estado actual de tus conversaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>No asignadas</span>
                      <span className="font-medium">5</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Activas</span>
                      <span className="font-medium">12</span>
                    </div>
                    <Progress value={48} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Resueltas (hoy)</span>
                      <span className="font-medium">8</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                  
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">Tiempo de respuesta</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">3.2 min</span>
                      <span className="text-xs text-green-600 flex items-center">
                        <RiArrowDownSLine className="h-3 w-3" />
                        <span>-0.5 min vs. ayer</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">Tasa de resolución</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">94%</span>
                      <span className="text-xs text-green-600 flex items-center">
                        <RiArrowUpSLine className="h-3 w-3" />
                        <span>+2% vs. ayer</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Conversaciones recientes</CardTitle>
              <CardDescription>
                Últimas interacciones con tus clientes a través de distintos canales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_CONVERSATIONS.map(conv => (
                  <div key={conv.id} className="border rounded-lg p-4 flex justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                        {conv.customer.name.split(' ')[0][0]}{conv.customer.name.split(' ')[1]?.[0] || ''}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{conv.customer.name}</h4>
                          {conv.unread && (
                            <Badge className="bg-blue-100 text-blue-800">No leído</Badge>
                          )}
                          {conv.platform === "whatsapp" ? (
                            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                              <RiWhatsappLine className="h-3 w-3" />
                              WhatsApp
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800">Web</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{conv.lastMessage}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(conv.date)}</p>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        <RiMessage2Line className="mr-2 h-4 w-4" />
                        Responder
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad reciente</CardTitle>
              <CardDescription>
                Registro de acciones e interacciones con tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_ACTIVITIES.map(activity => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      activity.type === 'message' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'purchase' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.type === 'message' ? <RiMessage2Line className="h-5 w-5" /> :
                       activity.type === 'purchase' ? <RiShoppingCart2Line className="h-5 w-5" /> :
                       <RiFileTextLine className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{activity.customer}</h4>
                        <span className="text-xs text-gray-500">{formatDate(activity.date)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad por tipo</CardTitle>
                <CardDescription>
                  Distribución de actividades por categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  {/* Placeholder for bar chart */}
                  <div className="w-full h-40 flex items-end space-x-6 justify-around">
                    <div className="flex flex-col items-center">
                      <div className="bg-blue-500 w-12 h-32 rounded-t-md"></div>
                      <span className="text-xs mt-2">Mensajes</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-green-500 w-12 h-20 rounded-t-md"></div>
                      <span className="text-xs mt-2">Compras</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-yellow-500 w-12 h-16 rounded-t-md"></div>
                      <span className="text-xs mt-2">Notas</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-purple-500 w-12 h-24 rounded-t-md"></div>
                      <span className="text-xs mt-2">Llamadas</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-500 w-12 h-12 rounded-t-md"></div>
                      <span className="text-xs mt-2">Otros</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad por agente</CardTitle>
                <CardDescription>
                  Distribución de actividades por miembro del equipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ana Rodríguez</span>
                      <span className="font-medium">32 actividades</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Carlos Martínez</span>
                      <span className="font-medium">28 actividades</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>María López</span>
                      <span className="font-medium">24 actividades</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Juan Sánchez</span>
                      <span className="font-medium">18 actividades</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Laura González</span>
                      <span className="font-medium">14 actividades</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}