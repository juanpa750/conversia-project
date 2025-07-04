import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
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
import { useToast } from "@/hooks/use-toast";
import { 
  RiFileSettingsLine, 
  RiAddLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiPauseLine,
  RiSettings3Line,
  RiCalendarLine,
  RiTimeLine,
  RiEditLine,
  RiMailLine,
  RiWhatsappLine,
  RiMessage2Line,
  RiUser3Line,
} from "@/lib/icons";
import { Layout } from "@/components/layout/layout";

// Mock data for automated workflows
const MOCK_WORKFLOWS = [
  {
    id: "workflow1",
    name: "Bienvenida a nuevos contactos",
    description: "Envía mensaje automático de bienvenida a nuevos contactos",
    trigger: "contact.created",
    status: "active",
    created: "2023-05-10",
    lastRun: "2023-06-14",
    stats: {
      totalRuns: 257,
      successRate: 98,
      averageTime: "2s"
    },
    steps: [
      { type: "wait", time: "5m", description: "Esperar 5 minutos" },
      { type: "message", channel: "whatsapp", template: "Bienvenida a nuevos clientes" },
      { type: "wait", time: "2d", description: "Esperar 2 días" },
      { type: "message", channel: "whatsapp", template: "Seguimiento de bienvenida" }
    ]
  },
  {
    id: "workflow2",
    name: "Recuperación de carrito abandonado",
    description: "Envía recordatorios a clientes que han abandonado su carrito de compra",
    trigger: "cart.abandoned",
    status: "active",
    created: "2023-04-22",
    lastRun: "2023-06-14",
    stats: {
      totalRuns: 189,
      successRate: 95,
      averageTime: "3s"
    },
    steps: [
      { type: "wait", time: "30m", description: "Esperar 30 minutos" },
      { type: "message", channel: "whatsapp", template: "Recordatorio de carrito 1" },
      { type: "condition", description: "Si no ha completado compra", success: true },
      { type: "wait", time: "1d", description: "Esperar 1 día" },
      { type: "message", channel: "whatsapp", template: "Recordatorio de carrito 2" }
    ]
  },
  {
    id: "workflow3",
    name: "Felicitación de cumpleaños",
    description: "Envía mensaje de felicitación y cupón de descuento en el cumpleaños del cliente",
    trigger: "contact.birthday",
    status: "inactive",
    created: "2023-02-15",
    lastRun: "2023-06-12",
    stats: {
      totalRuns: 78,
      successRate: 100,
      averageTime: "1s"
    },
    steps: [
      { type: "message", channel: "whatsapp", template: "Felicitación de cumpleaños" },
      { type: "action", description: "Generar cupón de descuento de 15%" },
      { type: "message", channel: "whatsapp", template: "Envío de cupón" }
    ]
  },
  {
    id: "workflow4",
    name: "Seguimiento post-compra",
    description: "Envía encuesta de satisfacción después de una compra",
    trigger: "order.completed",
    status: "active",
    created: "2023-03-08",
    lastRun: "2023-06-13",
    stats: {
      totalRuns: 312,
      successRate: 97,
      averageTime: "2s"
    },
    steps: [
      { type: "wait", time: "3d", description: "Esperar 3 días" },
      { type: "message", channel: "whatsapp", template: "Encuesta de satisfacción" },
      { type: "condition", description: "Si responde a la encuesta", success: true },
      { type: "message", channel: "whatsapp", template: "Agradecimiento por feedback" }
    ]
  },
  {
    id: "workflow5",
    name: "Reactivación de clientes inactivos",
    description: "Intenta recuperar clientes sin actividad en los últimos 30 días",
    trigger: "contact.inactive",
    status: "active",
    created: "2023-05-20",
    lastRun: "2023-06-14",
    stats: {
      totalRuns: 215,
      successRate: 92,
      averageTime: "2s"
    },
    steps: [
      { type: "message", channel: "whatsapp", template: "Recordatorio de inactividad" },
      { type: "condition", description: "Si abre el mensaje", success: true },
      { type: "wait", time: "2d", description: "Esperar 2 días" },
      { type: "message", channel: "whatsapp", template: "Oferta especial reactivación" }
    ]
  }
];

// Mock data for scheduled events
const MOCK_SCHEDULED_EVENTS = [
  {
    id: "event1",
    name: "Campaña de descuento verano",
    type: "scheduled_message",
    status: "pending",
    scheduledFor: "2023-06-20T10:00:00",
    audience: "Todos los clientes activos",
    audienceCount: 872,
    message: "Oferta especial verano",
    channel: "whatsapp"
  },
  {
    id: "event2",
    name: "Recordatorio de evento",
    type: "scheduled_message",
    status: "pending",
    scheduledFor: "2023-06-16T14:30:00",
    audience: "Clientes premium",
    audienceCount: 134,
    message: "Recordatorio evento exclusivo",
    channel: "whatsapp"
  },
  {
    id: "event3",
    name: "Newsletter junio",
    type: "scheduled_message",
    status: "completed",
    scheduledFor: "2023-06-02T09:00:00",
    audience: "Todos los contactos",
    audienceCount: 1240,
    message: "Newsletter mensual",
    channel: "email"
  },
  {
    id: "event4",
    name: "Notificación nuevo producto",
    type: "scheduled_message",
    status: "pending",
    scheduledFor: "2023-06-22T12:00:00",
    audience: "Compradores recientes",
    audienceCount: 358,
    message: "Lanzamiento de producto",
    channel: "whatsapp"
  }
];

// Mock data for automation triggers
const MOCK_TRIGGERS = [
  { id: "contact.created", name: "Nuevo contacto creado", description: "Se activa cuando se añade un nuevo contacto" },
  { id: "contact.updated", name: "Contacto actualizado", description: "Se activa cuando se modifican datos de un contacto" },
  { id: "contact.stage_changed", name: "Cambio de etapa", description: "Se activa cuando un contacto cambia de etapa en el journey" },
  { id: "contact.birthday", name: "Cumpleaños de contacto", description: "Se activa en la fecha de cumpleaños del contacto" },
  { id: "contact.inactive", name: "Contacto inactivo", description: "Se activa cuando un contacto no ha interactuado en X días" },
  { id: "message.received", name: "Mensaje recibido", description: "Se activa cuando se recibe un mensaje de un contacto" },
  { id: "message.link_clicked", name: "Enlace clicado", description: "Se activa cuando un contacto hace clic en un enlace" },
  { id: "cart.created", name: "Carrito creado", description: "Se activa cuando un contacto crea un carrito" },
  { id: "cart.updated", name: "Carrito actualizado", description: "Se activa cuando se añaden/eliminan productos del carrito" },
  { id: "cart.abandoned", name: "Carrito abandonado", description: "Se activa cuando un carrito se deja sin completar la compra" },
  { id: "order.created", name: "Pedido creado", description: "Se activa cuando se crea un nuevo pedido" },
  { id: "order.completed", name: "Pedido completado", description: "Se activa cuando se completa el pago de un pedido" },
  { id: "order.delivered", name: "Pedido entregado", description: "Se activa cuando un pedido es entregado al cliente" }
];

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

// Get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
    case "inactive":
      return <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    case "completed":
      return <Badge className="bg-blue-100 text-blue-800">Completado</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>;
  }
};

// Get step icon
const getStepIcon = (type: string) => {
  switch (type) {
    case "wait":
      return <RiTimeLine className="h-5 w-5 text-yellow-500" />;
    case "message":
      return <RiMessage2Line className="h-5 w-5 text-blue-500" />;
    case "condition":
      return <RiFileSettingsLine className="h-5 w-5 text-purple-500" />;
    case "action":
      return <RiSettings3Line className="h-5 w-5 text-green-500" />;
    default:
      return <RiFileSettingsLine className="h-5 w-5 text-gray-500" />;
  }
};

// Get trigger display
const getTriggerDisplay = (triggerId: string) => {
  const trigger = MOCK_TRIGGERS.find(t => t.id === triggerId);
  return trigger ? trigger.name : triggerId;
};

// Get channel icon
const getChannelIcon = (channel: string) => {
  switch (channel) {
    case "whatsapp":
      return <RiWhatsappLine className="h-4 w-4 text-green-500" />;
    case "email":
      return <RiMailLine className="h-4 w-4 text-blue-500" />;
    default:
      return <RiMessage2Line className="h-4 w-4 text-gray-500" />;
  }
};

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState("workflows");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [showWorkflowDetailsDialog, setShowWorkflowDetailsDialog] = useState(false);
  const [showAddWorkflowDialog, setShowAddWorkflowDialog] = useState(false);
  const [showScheduleEventDialog, setShowScheduleEventDialog] = useState(false);
  const { toast } = useToast();

  // Filter workflows based on search term and status filter
  const filteredWorkflows = MOCK_WORKFLOWS.filter(workflow => {
    const matchesSearch = 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || workflow.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle viewing workflow details
  const handleViewWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setShowWorkflowDetailsDialog(true);
  };

  // Handle toggling workflow status
  const handleToggleWorkflowStatus = (workflowId: string, newStatus: boolean) => {
    toast({
      title: newStatus ? "Automatización activada" : "Automatización desactivada",
      description: `La automatización ha sido ${newStatus ? "activada" : "desactivada"} correctamente.`,
    });
  };

  // Handle adding a new workflow
  const handleAddWorkflow = () => {
    setShowAddWorkflowDialog(false);
    toast({
      title: "Automatización creada",
      description: "La nueva automatización ha sido creada correctamente.",
    });
  };

  // Handle scheduling an event
  const handleScheduleEvent = () => {
    setShowScheduleEventDialog(false);
    toast({
      title: "Evento programado",
      description: "El evento ha sido programado correctamente.",
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Automatización de Seguimiento</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configura flujos de trabajo automatizados y envía mensajes programados a tus contactos
        </p>
      </div>

      <Tabs defaultValue="workflows" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 gap-4 w-full md:w-1/2">
          <TabsTrigger value="workflows" className="flex gap-2 items-center">
            <RiFileSettingsLine />
            <span>Flujos automatizados</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex gap-2 items-center">
            <RiCalendarLine />
            <span>Mensajes programados</span>
          </TabsTrigger>
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Input
                  type="text"
                  placeholder="Buscar automatizaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <RiFileSettingsLine className="h-5 w-5" />
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
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={showAddWorkflowDialog} onOpenChange={setShowAddWorkflowDialog}>
              <DialogTrigger asChild>
                <Button>
                  <RiAddLine className="mr-2 h-4 w-4" />
                  Nueva automatización
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Crear nueva automatización</DialogTitle>
                  <DialogDescription>
                    Configura un flujo de trabajo que se ejecutará automáticamente cuando se cumplan ciertas condiciones.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workflow-name">Nombre</Label>
                      <Input id="workflow-name" placeholder="Ej: Bienvenida a nuevos clientes" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workflow-trigger">Disparador</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar evento disparador" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_TRIGGERS.map(trigger => (
                            <SelectItem key={trigger.id} value={trigger.id}>{trigger.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workflow-description">Descripción</Label>
                    <Input id="workflow-description" placeholder="Describe el propósito de esta automatización..." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Pasos del flujo</Label>
                    <div className="space-y-4">
                      <div className="border rounded-md p-3 relative pl-14">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <RiTimeLine className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Esperar</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <RiDeleteBinLine className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Select defaultValue="minutes">
                            <SelectTrigger>
                              <SelectValue placeholder="Unidad de tiempo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minutes">Minutos</SelectItem>
                              <SelectItem value="hours">Horas</SelectItem>
                              <SelectItem value="days">Días</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input type="number" min="1" defaultValue="5" placeholder="Cantidad" />
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 relative pl-14">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <RiMessage2Line className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Enviar mensaje</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <RiDeleteBinLine className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <Select defaultValue="template1">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar plantilla" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="template1">Bienvenida a nuevos clientes</SelectItem>
                              <SelectItem value="template2">Seguimiento de pedido</SelectItem>
                              <SelectItem value="template3">Recordatorio de cita</SelectItem>
                              <SelectItem value="template4">Recuperación de clientes inactivos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <RiAddLine className="mr-2 h-4 w-4" />
                        Añadir paso
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch id="workflow-active" defaultChecked />
                    <Label htmlFor="workflow-active">Activar automatización inmediatamente</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddWorkflowDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddWorkflow}>
                    Crear automatización
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredWorkflows.length > 0 ? (
              filteredWorkflows.map(workflow => (
                <Card key={workflow.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {workflow.name}
                          {getStatusBadge(workflow.status)}
                        </CardTitle>
                        <CardDescription>
                          {workflow.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`workflow-active-${workflow.id}`} 
                            checked={workflow.status === "active"} 
                            onCheckedChange={(checked) => handleToggleWorkflowStatus(workflow.id, checked)}
                          />
                          <Label htmlFor={`workflow-active-${workflow.id}`} className="text-sm">Activo</Label>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewWorkflow(workflow)}>
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Evento disparador</h4>
                        <div className="border rounded-md p-3 bg-gray-50">
                          <div className="flex items-center gap-2">
                            <RiFileSettingsLine className="h-5 w-5 text-blue-500" />
                            <span>{getTriggerDisplay(workflow.trigger)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Estadísticas</h4>
                        <div className="border rounded-md p-3 bg-gray-50">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="text-sm text-gray-500">Ejecuciones</div>
                              <div className="text-lg font-bold">{workflow.stats.totalRuns}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Éxito</div>
                              <div className="text-lg font-bold">{workflow.stats.successRate}%</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Tiempo medio</div>
                              <div className="text-lg font-bold">{workflow.stats.averageTime}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Información</h4>
                        <div className="border rounded-md p-3 bg-gray-50">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Creado:</span>
                            <span>{formatDate(workflow.created)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Última ejecución:</span>
                            <span>{formatDate(workflow.lastRun)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">Pasos del flujo</h4>
                      <div className="border rounded-md p-3">
                        <div className="flex flex-wrap gap-2">
                          {workflow.steps.map((step: any, index: number) => (
                            <div key={index} className="flex items-center">
                              {index > 0 && (
                                <div className="h-px w-4 bg-gray-300 mx-1"></div>
                              )}
                              <div className="border rounded-md py-1 px-2 flex items-center gap-1 bg-gray-50">
                                {getStepIcon(step.type)}
                                <span className="text-sm">{step.description || step.type}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 border rounded-md bg-gray-50">
                <RiFileSettingsLine className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron automatizaciones</h3>
                <p className="text-sm text-gray-500 mb-4">No hay automatizaciones que coincidan con los filtros seleccionados.</p>
                <Button onClick={() => setShowAddWorkflowDialog(true)}>
                  <RiAddLine className="mr-2 h-4 w-4" />
                  Crear automatización
                </Button>
              </div>
            )}
          </div>

          {/* Workflow Details Dialog */}
          <Dialog open={showWorkflowDetailsDialog} onOpenChange={setShowWorkflowDetailsDialog}>
            <DialogContent className="sm:max-w-[800px]">
              {selectedWorkflow && (
                <>
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <DialogTitle className="flex items-center gap-2">
                        {selectedWorkflow.name}
                        {getStatusBadge(selectedWorkflow.status)}
                      </DialogTitle>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="detail-workflow-active" 
                          checked={selectedWorkflow.status === "active"} 
                          onCheckedChange={(checked) => handleToggleWorkflowStatus(selectedWorkflow.id, checked)}
                        />
                        <Label htmlFor="detail-workflow-active" className="text-sm">Activo</Label>
                      </div>
                    </div>
                    <DialogDescription>
                      {selectedWorkflow.description}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border rounded-md p-3 bg-gray-50">
                        <h3 className="text-sm font-medium mb-2">Disparador</h3>
                        <div className="flex items-center gap-2">
                          <RiFileSettingsLine className="h-5 w-5 text-blue-500" />
                          <span>{getTriggerDisplay(selectedWorkflow.trigger)}</span>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-gray-50">
                        <h3 className="text-sm font-medium mb-2">Estadísticas</h3>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Ejecuciones:</span>
                          <span className="font-medium">{selectedWorkflow.stats.totalRuns}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tasa de éxito:</span>
                          <span className="font-medium">{selectedWorkflow.stats.successRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tiempo medio:</span>
                          <span className="font-medium">{selectedWorkflow.stats.averageTime}</span>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-gray-50">
                        <h3 className="text-sm font-medium mb-2">Información</h3>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Creado:</span>
                          <span>{formatDate(selectedWorkflow.created)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Última ejecución:</span>
                          <span>{formatDate(selectedWorkflow.lastRun)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-3">Pasos del flujo</h3>
                      <div className="space-y-3">
                        {selectedWorkflow.steps.map((step: any, index: number) => (
                          <div key={index} className="border rounded-md p-3 relative pl-14">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                              {getStepIcon(step.type)}
                            </div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium capitalize">
                                {step.type === "wait" ? "Esperar" : 
                                 step.type === "message" ? "Enviar mensaje" :
                                 step.type === "condition" ? "Condición" :
                                 step.type === "action" ? "Acción" : step.type}
                              </span>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <RiEditLine className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-sm text-gray-600">
                              {step.description}
                              {step.channel && (
                                <div className="mt-1 flex items-center gap-1">
                                  <span className="text-gray-500">Canal:</span>
                                  <span className="flex items-center gap-1">
                                    {getChannelIcon(step.channel)}
                                    <span>{step.channel === "whatsapp" ? "WhatsApp" : step.channel === "email" ? "Email" : step.channel}</span>
                                  </span>
                                </div>
                              )}
                              {step.template && (
                                <div className="mt-1 flex items-center gap-1">
                                  <span className="text-gray-500">Plantilla:</span>
                                  <span>{step.template}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="destructive">
                      <RiDeleteBinLine className="mr-2 h-4 w-4" />
                      Eliminar automatización
                    </Button>
                    <Button variant="outline">
                      <RiEditLine className="mr-2 h-4 w-4" />
                      Editar automatización
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Scheduled Events Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={showScheduleEventDialog} onOpenChange={setShowScheduleEventDialog}>
              <DialogTrigger asChild>
                <Button>
                  <RiAddLine className="mr-2 h-4 w-4" />
                  Programar mensaje
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Programar mensaje</DialogTitle>
                  <DialogDescription>
                    Programa un mensaje para ser enviado a un grupo de contactos en una fecha específica.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-name">Nombre del evento</Label>
                      <Input id="event-name" placeholder="Ej: Campaña de verano" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-date">Fecha y hora</Label>
                      <Input id="event-date" type="datetime-local" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-audience">Audiencia</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar audiencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los contactos</SelectItem>
                        <SelectItem value="active">Clientes activos</SelectItem>
                        <SelectItem value="premium">Clientes premium</SelectItem>
                        <SelectItem value="recent">Compradores recientes</SelectItem>
                        <SelectItem value="inactive">Clientes inactivos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-channel">Canal</Label>
                    <Select defaultValue="whatsapp">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar canal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-template">Plantilla de mensaje</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="template1">Oferta especial verano</SelectItem>
                        <SelectItem value="template2">Recordatorio evento exclusivo</SelectItem>
                        <SelectItem value="template3">Newsletter mensual</SelectItem>
                        <SelectItem value="template4">Lanzamiento de producto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="border rounded-md p-3 bg-gray-50">
                    <h4 className="text-sm font-medium mb-2">Vista previa del mensaje</h4>
                    <div className="border-l-4 border-blue-400 pl-3 py-1">
                      <p className="text-sm">
                        Hola [nombre], nos complace anunciarte nuestra nueva campaña de verano con descuentos de hasta el 40% en productos seleccionados. ¡No te lo pierdas!
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowScheduleEventDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleScheduleEvent}>
                    Programar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mensajes programados</CardTitle>
              <CardDescription>
                Listado de mensajes programados para envío automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Fecha programada</TableHead>
                    <TableHead>Audiencia</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_SCHEDULED_EVENTS.length > 0 ? (
                    MOCK_SCHEDULED_EVENTS.map(event => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell>{formatDate(event.scheduledFor)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{event.audience}</span>
                            <span className="text-xs text-gray-500">{event.audienceCount} contactos</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getChannelIcon(event.channel)}
                            <span>{event.channel === "whatsapp" ? "WhatsApp" : event.channel === "email" ? "Email" : event.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {event.status === "pending" && (
                              <>
                                <Button variant="outline" size="sm">
                                  <RiEditLine className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <RiDeleteBinLine className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {event.status === "completed" && (
                              <Button variant="outline" size="sm">
                                Ver resultados
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                        No hay mensajes programados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mensajes por fecha</CardTitle>
                <CardDescription>
                  Distribución de mensajes programados por fecha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 bg-gray-50 rounded-md flex items-center justify-center">
                  {/* Placeholder for calendar chart */}
                  <div className="text-center">
                    <RiCalendarLine className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Vista de calendario con mensajes programados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audiencia por canal</CardTitle>
                <CardDescription>
                  Distribución de la audiencia por canal de comunicación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RiWhatsappLine className="h-5 w-5 text-green-500" />
                        <span>WhatsApp</span>
                      </div>
                      <span className="font-medium">1,364 contactos</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>85% de cobertura</span>
                      <span>1,364 / 1,604 contactos</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RiMailLine className="h-5 w-5 text-blue-500" />
                        <span>Email</span>
                      </div>
                      <span className="font-medium">1,240 contactos</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>78% de cobertura</span>
                      <span>1,240 / 1,604 contactos</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total de contactos</span>
                      <span className="font-bold">1,604</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      98% de los contactos tienen al menos un canal disponible
                    </div>
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