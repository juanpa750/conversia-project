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
import { Slider } from "@/components/ui/slider";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import { 
  RiUser3Line, 
  RiAddLine, 
  RiPieChartLine,
  RiBarChart2Line,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiStarLine,
  RiSettings3Line,
  RiHistoryLine,
  RiFileSettingsLine,
  RiFilterLine
} from "@/lib/icons";
import { Layout } from "@/components/layout/layout";

// Mock data for scored leads
const MOCK_SCORED_LEADS = [
  {
    id: "1",
    name: "María García López",
    email: "maria.garcia@email.com",
    score: 92,
    scoreChange: 5,
    lastActivity: "2023-06-12T14:30:00",
    category: "hot",
    factors: {
      engagement: 95,
      recency: 90,
      demographic: 85,
      behavior: 88,
      product_interest: 95
    }
  },
  {
    id: "2",
    name: "Carlos Rodríguez Martínez",
    email: "carlos.rodriguez@email.com",
    score: 78,
    scoreChange: 2,
    lastActivity: "2023-06-10T09:15:00",
    category: "warm",
    factors: {
      engagement: 75,
      recency: 82,
      demographic: 80,
      behavior: 75,
      product_interest: 78
    }
  },
  {
    id: "3",
    name: "Laura Fernández Sánchez",
    email: "laura.fernandez@email.com",
    score: 45,
    scoreChange: -3,
    lastActivity: "2023-03-05T11:20:00",
    category: "cold",
    factors: {
      engagement: 40,
      recency: 30,
      demographic: 65,
      behavior: 50,
      product_interest: 55
    }
  },
  {
    id: "4",
    name: "Javier López Torres",
    email: "javier.lopez@email.com",
    score: 89,
    scoreChange: 7,
    lastActivity: "2023-06-01T16:45:00",
    category: "hot",
    factors: {
      engagement: 85,
      recency: 90,
      demographic: 92,
      behavior: 88,
      product_interest: 92
    }
  },
  {
    id: "5",
    name: "Ana Martínez Ruiz",
    email: "ana.martinez@email.com",
    score: 68,
    scoreChange: 4,
    lastActivity: "2023-05-28T13:10:00",
    category: "warm",
    factors: {
      engagement: 65,
      recency: 75,
      demographic: 70,
      behavior: 62,
      product_interest: 65
    }
  },
  {
    id: "6",
    name: "Miguel Fernández Gómez",
    email: "miguel.fernandez@email.com",
    score: 82,
    scoreChange: -1,
    lastActivity: "2023-06-08T10:30:00",
    category: "warm",
    factors: {
      engagement: 80,
      recency: 85,
      demographic: 78,
      behavior: 84,
      product_interest: 82
    }
  },
  {
    id: "7",
    name: "Carmen Jiménez Soto",
    email: "carmen.jimenez@email.com",
    score: 32,
    scoreChange: -5,
    lastActivity: "2023-01-15T09:45:00",
    category: "cold",
    factors: {
      engagement: 25,
      recency: 20,
      demographic: 60,
      behavior: 30,
      product_interest: 40
    }
  },
  {
    id: "8",
    name: "Francisco Moreno García",
    email: "francisco.moreno@email.com",
    score: 95,
    scoreChange: 3,
    lastActivity: "2023-06-14T11:20:00",
    category: "hot",
    factors: {
      engagement: 98,
      recency: 95,
      demographic: 90,
      behavior: 92,
      product_interest: 97
    }
  }
];

// Mock data for scoring models
const MOCK_SCORING_MODELS = [
  {
    id: "model1",
    name: "Modelo general",
    description: "Modelo de puntuación general basado en engagement y comportamiento",
    isActive: true,
    factors: [
      { name: "Interacción con mensajes", weight: 30, description: "Apertura, clics y respuestas a mensajes" },
      { name: "Recencia de actividad", weight: 25, description: "Qué tan reciente es la última interacción" },
      { name: "Datos demográficos", weight: 15, description: "Coincidencia con perfil demográfico ideal" },
      { name: "Comportamiento de navegación", weight: 15, description: "Interacción con sitio web y aplicación" },
      { name: "Interés en productos", weight: 15, description: "Consultas y visualizaciones de productos" }
    ],
    thresholds: {
      hot: 80,
      warm: 50,
      cold: 0
    },
    createdAt: "2023-01-10",
    lastModified: "2023-06-01"
  },
  {
    id: "model2",
    name: "Productos premium",
    description: "Calificación específica para clientes de productos de alta gama",
    isActive: false,
    factors: [
      { name: "Historial de compras", weight: 35, description: "Valor y frecuencia de compras anteriores" },
      { name: "Tiempo de consideración", weight: 25, description: "Tiempo dedicado a evaluar productos premium" },
      { name: "Capacidad adquisitiva", weight: 20, description: "Estimación basada en datos disponibles" },
      { name: "Interacciones con soporte", weight: 10, description: "Calidad y frecuencia de interacciones" },
      { name: "Influencia social", weight: 10, description: "Potencial como referente o influenciador" }
    ],
    thresholds: {
      hot: 85,
      warm: 65,
      cold: 0
    },
    createdAt: "2023-03-15",
    lastModified: "2023-05-20"
  },
  {
    id: "model3",
    name: "Recuperación de clientes",
    description: "Modelo para identificar clientes inactivos con potencial de recuperación",
    isActive: false,
    factors: [
      { name: "Historial de valor", weight: 30, description: "Valor histórico como cliente activo" },
      { name: "Razón de inactividad", weight: 25, description: "Factores que llevaron a la inactividad" },
      { name: "Respuesta a campañas", weight: 20, description: "Interacción con intentos de recuperación" },
      { name: "Competencia", weight: 15, description: "Actividad conocida con competidores" },
      { name: "Cambios en circunstancias", weight: 10, description: "Cambios detectados en situación" }
    ],
    thresholds: {
      hot: 75,
      warm: 45,
      cold: 0
    },
    createdAt: "2023-04-22",
    lastModified: "2023-06-05"
  }
];

// Mock data for scoring history
const MOCK_SCORING_HISTORY = [
  { date: "2023-06-14", avgScore: 68, hotLeads: 120, warmLeads: 350, coldLeads: 180 },
  { date: "2023-06-07", avgScore: 65, hotLeads: 110, warmLeads: 340, coldLeads: 200 },
  { date: "2023-05-31", avgScore: 63, hotLeads: 105, warmLeads: 330, coldLeads: 215 },
  { date: "2023-05-24", avgScore: 61, hotLeads: 95, warmLeads: 310, coldLeads: 240 },
  { date: "2023-05-17", avgScore: 62, hotLeads: 100, warmLeads: 300, coldLeads: 250 },
  { date: "2023-05-10", avgScore: 59, hotLeads: 90, warmLeads: 295, coldLeads: 265 },
  { date: "2023-05-03", avgScore: 57, hotLeads: 85, warmLeads: 280, coldLeads: 285 },
  { date: "2023-04-26", avgScore: 56, hotLeads: 80, warmLeads: 275, coldLeads: 295 }
];

// Function to format date 
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

// Get badge for lead category
const getCategoryBadge = (category: string) => {
  switch (category) {
    case "hot":
      return <Badge className="bg-red-100 text-red-800">Caliente</Badge>;
    case "warm":
      return <Badge className="bg-yellow-100 text-yellow-800">Tibio</Badge>;
    case "cold":
      return <Badge className="bg-blue-100 text-blue-800">Frío</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Sin clasificar</Badge>;
  }
};

// Get score presentation with color coding
const getScoreDisplay = (score: number) => {
  let colorClass = "";
  if (score >= 80) colorClass = "text-red-600";
  else if (score >= 50) colorClass = "text-yellow-600";
  else colorClass = "text-blue-600";

  return <span className={`font-bold ${colorClass}`}>{score}</span>;
};

// Get change indicator
const getChangeIndicator = (change: number) => {
  if (change > 0) {
    return (
      <span className="text-green-600 flex items-center">
        <RiArrowUpSLine className="h-4 w-4" />
        <span>+{change}</span>
      </span>
    );
  } else if (change < 0) {
    return (
      <span className="text-red-600 flex items-center">
        <RiArrowDownSLine className="h-4 w-4" />
        <span>{change}</span>
      </span>
    );
  } else {
    return (
      <span className="text-gray-600">0</span>
    );
  }
};

export default function LeadScoringPage() {
  const [activeTab, setActiveTab] = useState("leads");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showLeadDetailsDialog, setShowLeadDetailsDialog] = useState(false);
  const [showModelDetailsDialog, setShowModelDetailsDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [showAddModelDialog, setShowAddModelDialog] = useState(false);
  const { toast } = useToast();

  // Filter leads based on search term and category filter
  const filteredLeads = MOCK_SCORED_LEADS.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || lead.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Handle viewing lead details
  const handleViewLead = (lead: any) => {
    setSelectedLead(lead);
    setShowLeadDetailsDialog(true);
  };

  // Handle viewing model details
  const handleViewModel = (model: any) => {
    setSelectedModel(model);
    setShowModelDetailsDialog(true);
  };

  // Handle model activation toggle
  const handleToggleModelActive = (modelId: string, newState: boolean) => {
    toast({
      title: newState ? "Modelo activado" : "Modelo desactivado",
      description: `El modelo de puntuación ha sido ${newState ? "activado" : "desactivado"} correctamente.`,
    });
  };

  // Handle adding a new model
  const handleAddModel = () => {
    setShowAddModelDialog(false);
    toast({
      title: "Modelo creado",
      description: "El nuevo modelo de puntuación ha sido creado correctamente.",
    });
  };

  // Handle manual scoring
  const handleManualScoring = () => {
    toast({
      title: "Puntuación actualizada",
      description: "La puntuación del lead ha sido actualizada manualmente.",
    });
    setShowLeadDetailsDialog(false);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scoring de Leads</h1>
        <p className="mt-1 text-sm text-gray-500">
          Puntúa y califica automáticamente a tus leads basándose en su comportamiento e interacción
        </p>
      </div>

      <Tabs defaultValue="leads" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 gap-4 w-full md:w-2/3">
          <TabsTrigger value="leads" className="flex gap-2 items-center">
            <RiUser3Line />
            <span>Leads Puntuados</span>
          </TabsTrigger>
          <TabsTrigger value="models" className="flex gap-2 items-center">
            <RiSettings3Line />
            <span>Modelos de Scoring</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex gap-2 items-center">
            <RiBarChart2Line />
            <span>Análisis y Tendencias</span>
          </TabsTrigger>
        </TabsList>

        {/* Scored Leads Tab */}
        <TabsContent value="leads" className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Input
                  type="text"
                  placeholder="Buscar leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <RiUser3Line className="h-5 w-5" />
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="hot">Caliente</SelectItem>
                  <SelectItem value="warm">Tibio</SelectItem>
                  <SelectItem value="cold">Frío</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="gap-2">
                <RiFilterLine className="h-4 w-4" />
                <span>Más filtros</span>
              </Button>
            </div>
            
            <Button>
              <RiHistoryLine className="mr-2 h-4 w-4" />
              Ejecutar scoring
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Leads calificados</CardTitle>
              <CardDescription>
                Leads calificados automáticamente según su comportamiento e interacción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Cambio</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Última actividad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map(lead => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                              {lead.name.split(' ')[0][0]}{lead.name.split(' ')[1]?.[0] || ''}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{lead.name}</span>
                              <span className="text-xs text-gray-500">{lead.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getScoreDisplay(lead.score)}</TableCell>
                        <TableCell>{getChangeIndicator(lead.scoreChange)}</TableCell>
                        <TableCell>{getCategoryBadge(lead.category)}</TableCell>
                        <TableCell>{formatDate(lead.lastActivity)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewLead(lead)}>
                            Ver detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                        No se encontraron leads con los filtros seleccionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Lead Details Dialog */}
          <Dialog open={showLeadDetailsDialog} onOpenChange={setShowLeadDetailsDialog}>
            <DialogContent className="sm:max-w-[800px]">
              {selectedLead && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                        {selectedLead.name.split(' ')[0][0]}{selectedLead.name.split(' ')[1]?.[0] || ''}
                      </div>
                      <div>
                        <DialogTitle className="flex items-center gap-2">
                          {selectedLead.name}
                          <span className="ml-2">{getCategoryBadge(selectedLead.category)}</span>
                        </DialogTitle>
                        <DialogDescription>
                          {selectedLead.email} • Última actividad: {formatDate(selectedLead.lastActivity)}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-none">
                      <CardHeader className="pb-2 px-0">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>Puntuación global</span>
                          <div className="flex items-center gap-2">
                            {getScoreDisplay(selectedLead.score)}
                            {getChangeIndicator(selectedLead.scoreChange)}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-0">
                        <div className="flex flex-col gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label>Interacción con mensajes</Label>
                              <span className="text-sm font-medium">{selectedLead.factors.engagement}%</span>
                            </div>
                            <Progress 
                              value={selectedLead.factors.engagement} 
                              className="h-2" 
                              indicatorClassName={selectedLead.factors.engagement >= 80 ? "bg-red-500" : selectedLead.factors.engagement >= 50 ? "bg-yellow-500" : "bg-blue-500"}
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label>Recencia de actividad</Label>
                              <span className="text-sm font-medium">{selectedLead.factors.recency}%</span>
                            </div>
                            <Progress 
                              value={selectedLead.factors.recency} 
                              className="h-2" 
                              indicatorClassName={selectedLead.factors.recency >= 80 ? "bg-red-500" : selectedLead.factors.recency >= 50 ? "bg-yellow-500" : "bg-blue-500"}
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label>Datos demográficos</Label>
                              <span className="text-sm font-medium">{selectedLead.factors.demographic}%</span>
                            </div>
                            <Progress 
                              value={selectedLead.factors.demographic} 
                              className="h-2" 
                              indicatorClassName={selectedLead.factors.demographic >= 80 ? "bg-red-500" : selectedLead.factors.demographic >= 50 ? "bg-yellow-500" : "bg-blue-500"}
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label>Comportamiento de navegación</Label>
                              <span className="text-sm font-medium">{selectedLead.factors.behavior}%</span>
                            </div>
                            <Progress 
                              value={selectedLead.factors.behavior} 
                              className="h-2" 
                              indicatorClassName={selectedLead.factors.behavior >= 80 ? "bg-red-500" : selectedLead.factors.behavior >= 50 ? "bg-yellow-500" : "bg-blue-500"}
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label>Interés en productos</Label>
                              <span className="text-sm font-medium">{selectedLead.factors.product_interest}%</span>
                            </div>
                            <Progress 
                              value={selectedLead.factors.product_interest} 
                              className="h-2" 
                              indicatorClassName={selectedLead.factors.product_interest >= 80 ? "bg-red-500" : selectedLead.factors.product_interest >= 50 ? "bg-yellow-500" : "bg-blue-500"}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-6">
                      <Card className="border-0 shadow-none">
                        <CardHeader className="pb-2 px-0">
                          <CardTitle className="text-lg">Ajuste manual</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 space-y-4">
                          <div className="space-y-2">
                            <Label>Puntuación manual</Label>
                            <div className="flex items-center gap-4">
                              <Slider defaultValue={[selectedLead.score]} min={0} max={100} step={1} className="flex-1" />
                              <span className="font-medium w-8 text-right">{selectedLead.score}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select defaultValue={selectedLead.category}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hot">Caliente</SelectItem>
                                <SelectItem value="warm">Tibio</SelectItem>
                                <SelectItem value="cold">Frío</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Notas</Label>
                            <textarea 
                              className="w-full border rounded-md p-2 h-[100px]" 
                              placeholder="Añade notas adicionales sobre este lead..."
                            ></textarea>
                          </div>
                          
                          <Button className="w-full" onClick={handleManualScoring}>
                            Guardar cambios
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" className="flex-1">Ver historial completo</Button>
                        <Button variant="outline" className="flex-1">Ver perfil de contacto</Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Scoring Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <div className="flex justify-end mb-6">
            <Dialog open={showAddModelDialog} onOpenChange={setShowAddModelDialog}>
              <DialogTrigger asChild>
                <Button>
                  <RiAddLine className="mr-2 h-4 w-4" />
                  Nuevo modelo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Crear nuevo modelo de scoring</DialogTitle>
                  <DialogDescription>
                    Configura un nuevo modelo para calificar leads según criterios específicos
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="model-name">Nombre del modelo</Label>
                      <Input id="model-name" placeholder="Ej: Modelo para productos B2B" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model-description">Descripción</Label>
                      <Input id="model-description" placeholder="Breve descripción del propósito..." />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Factores de puntuación</Label>
                    <div className="space-y-4">
                      <div className="border rounded-md p-3">
                        <div className="grid grid-cols-[1fr,auto] gap-3 mb-2">
                          <Input placeholder="Nombre del factor" defaultValue="Interacción con mensajes" />
                          <div className="flex items-center gap-2">
                            <Input className="w-20" type="number" min="0" max="100" defaultValue="30" />
                            <span>%</span>
                          </div>
                        </div>
                        <Input placeholder="Descripción del factor" defaultValue="Apertura, clics y respuestas a mensajes" />
                      </div>
                      
                      <div className="border rounded-md p-3">
                        <div className="grid grid-cols-[1fr,auto] gap-3 mb-2">
                          <Input placeholder="Nombre del factor" defaultValue="Recencia de actividad" />
                          <div className="flex items-center gap-2">
                            <Input className="w-20" type="number" min="0" max="100" defaultValue="25" />
                            <span>%</span>
                          </div>
                        </div>
                        <Input placeholder="Descripción del factor" defaultValue="Qué tan reciente es la última interacción" />
                      </div>
                      
                      <div className="border rounded-md p-3">
                        <div className="grid grid-cols-[1fr,auto] gap-3 mb-2">
                          <Input placeholder="Nombre del factor" defaultValue="Datos demográficos" />
                          <div className="flex items-center gap-2">
                            <Input className="w-20" type="number" min="0" max="100" defaultValue="15" />
                            <span>%</span>
                          </div>
                        </div>
                        <Input placeholder="Descripción del factor" defaultValue="Coincidencia con perfil demográfico ideal" />
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <RiAddLine className="mr-2 h-4 w-4" />
                        Añadir factor
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Umbrales de categorías</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-red-600">Caliente (Hot)</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" min="0" max="100" defaultValue="80" />
                          <span>+</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-yellow-600">Tibio (Warm)</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" min="0" max="100" defaultValue="50" />
                          <span>+</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-blue-600">Frío (Cold)</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" min="0" max="100" defaultValue="0" />
                          <span>+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="model-active" defaultChecked />
                    <Label htmlFor="model-active">Activar modelo inmediatamente</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddModelDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddModel}>
                    Crear modelo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {MOCK_SCORING_MODELS.map(model => (
              <Card key={model.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CardTitle>{model.name}</CardTitle>
                      {model.isActive && (
                        <Badge className="bg-green-100 text-green-800">
                          <RiCheckLine className="mr-1 h-3 w-3" />
                          Activo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id={`model-active-${model.id}`} 
                          checked={model.isActive} 
                          onCheckedChange={(checked) => handleToggleModelActive(model.id, checked)}
                        />
                        <Label htmlFor={`model-active-${model.id}`} className="text-sm">Activo</Label>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleViewModel(model)}>
                        <RiEditLine className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {model.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Factores de puntuación</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {model.factors.map((factor, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{factor.name}</span>
                            <span className="text-sm font-medium">{factor.weight}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Umbrales de categorías</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center p-2 rounded-md bg-red-50">
                          <span className="text-sm text-red-600">Caliente</span>
                          <span className="font-bold">{model.thresholds.hot}+</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-md bg-yellow-50">
                          <span className="text-sm text-yellow-600">Tibio</span>
                          <span className="font-bold">{model.thresholds.warm}+</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-md bg-blue-50">
                          <span className="text-sm text-blue-600">Frío</span>
                          <span className="font-bold">{model.thresholds.cold}+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex justify-between items-center w-full text-sm text-gray-500">
                    <span>Creado: {formatDate(model.createdAt)}</span>
                    <span>Última modificación: {formatDate(model.lastModified)}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Model Details Dialog */}
          <Dialog open={showModelDetailsDialog} onOpenChange={setShowModelDetailsDialog}>
            <DialogContent className="sm:max-w-[700px]">
              {selectedModel && (
                <>
                  <DialogHeader>
                    <DialogTitle>Editar modelo de scoring</DialogTitle>
                    <DialogDescription>
                      Modifica la configuración del modelo "{selectedModel.name}"
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-model-name">Nombre del modelo</Label>
                        <Input id="edit-model-name" defaultValue={selectedModel.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-model-description">Descripción</Label>
                        <Input id="edit-model-description" defaultValue={selectedModel.description} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Factores de puntuación</Label>
                      <div className="space-y-4">
                        {selectedModel.factors.map((factor: any, index: number) => (
                          <div key={index} className="border rounded-md p-3">
                            <div className="grid grid-cols-[1fr,auto] gap-3 mb-2">
                              <Input placeholder="Nombre del factor" defaultValue={factor.name} />
                              <div className="flex items-center gap-2">
                                <Input className="w-20" type="number" min="0" max="100" defaultValue={factor.weight} />
                                <span>%</span>
                              </div>
                            </div>
                            <Input placeholder="Descripción del factor" defaultValue={factor.description} />
                          </div>
                        ))}
                        
                        <Button variant="outline" className="w-full">
                          <RiAddLine className="mr-2 h-4 w-4" />
                          Añadir factor
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Umbrales de categorías</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-red-600">Caliente (Hot)</Label>
                          <div className="flex items-center gap-2">
                            <Input type="number" min="0" max="100" defaultValue={selectedModel.thresholds.hot} />
                            <span>+</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-yellow-600">Tibio (Warm)</Label>
                          <div className="flex items-center gap-2">
                            <Input type="number" min="0" max="100" defaultValue={selectedModel.thresholds.warm} />
                            <span>+</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-blue-600">Frío (Cold)</Label>
                          <div className="flex items-center gap-2">
                            <Input type="number" min="0" max="100" defaultValue={selectedModel.thresholds.cold} />
                            <span>+</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="edit-model-active" 
                        checked={selectedModel.isActive} 
                        onCheckedChange={(checked) => handleToggleModelActive(selectedModel.id, checked)}
                      />
                      <Label htmlFor="edit-model-active">
                        {selectedModel.isActive ? "Modelo activo" : "Activar modelo"}
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        setShowModelDetailsDialog(false);
                        toast({
                          title: "Modelo eliminado",
                          description: "El modelo ha sido eliminado correctamente.",
                        });
                      }}
                    >
                      <RiDeleteBinLine className="mr-2 h-4 w-4" />
                      Eliminar
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowModelDetailsDialog(false);
                        toast({
                          title: "Cambios guardados",
                          description: "Los cambios han sido guardados correctamente.",
                        });
                      }}
                    >
                      Guardar cambios
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Score medio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">68</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+3 pts vs. período anterior</span>
                    </p>
                  </div>
                  <RiBarChart2Line className="h-8 w-8 text-blue-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Leads calientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">120</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+9.1% vs. período anterior</span>
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <RiStarLine className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Leads tibios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">350</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <RiArrowUpSLine className="h-3 w-3" />
                      <span>+2.9% vs. período anterior</span>
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <RiStarLine className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Leads fríos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">180</p>
                    <p className="text-xs text-red-600 flex items-center">
                      <RiArrowDownSLine className="h-3 w-3" />
                      <span>-10% vs. período anterior</span>
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <RiStarLine className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tendencia de scoring</CardTitle>
              <CardDescription>
                Evolución de la puntuación media y distribución de leads por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {/* Placeholder for chart - would use a real chart library like recharts in production */}
                <div className="w-full h-full bg-gray-50 rounded-md flex items-center justify-center relative">
                  <div className="absolute inset-0 flex flex-col">
                    <div className="flex-1 flex items-end">
                      <div className="w-full flex justify-between px-8">
                        {MOCK_SCORING_HISTORY.map((entry, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div className="relative h-[200px] w-12 mb-1">
                              <div className="absolute bottom-0 w-full bg-blue-400" style={{ height: `${(entry.coldLeads / 650) * 100}%` }}></div>
                              <div className="absolute bottom-0 w-full bg-yellow-400" style={{ height: `${(entry.warmLeads / 650) * 100}%`, transform: `translateY(-${(entry.coldLeads / 650) * 200}px)` }}></div>
                              <div className="absolute bottom-0 w-full bg-red-400" style={{ height: `${(entry.hotLeads / 650) * 100}%`, transform: `translateY(-${((entry.coldLeads + entry.warmLeads) / 650) * 200}px)` }}></div>
                              <div className="absolute top-0 w-full h-1 border-t border-dashed border-gray-300" style={{ top: `${100 - (entry.avgScore)}%` }}></div>
                            </div>
                            <span className="text-xs mt-2">{entry.date.split('-')[2]}/{entry.date.split('-')[1]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="h-8"></div>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <span className="text-xs">Hot</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <span className="text-xs">Warm</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                      <span className="text-xs">Cold</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 border border-dashed border-gray-500 mr-2"></div>
                      <span className="text-xs">Avg. Score</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de leads</CardTitle>
                <CardDescription>
                  Distribución actual de leads por categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  {/* Placeholder for pie chart */}
                  <div className="w-40 h-40 relative rounded-full overflow-hidden">
                    <div className="absolute w-full h-full bg-red-400" style={{ clipPath: "polygon(50% 50%, 0 0, 35% 0, 50% 50%)", transform: "rotate(0deg)" }}></div>
                    <div className="absolute w-full h-full bg-yellow-400" style={{ clipPath: "polygon(50% 50%, 35% 0, 100% 0, 100% 35%, 50% 50%)", transform: "rotate(0deg)" }}></div>
                    <div className="absolute w-full h-full bg-blue-400" style={{ clipPath: "polygon(50% 50%, 100% 35%, 100% 100%, 0 100%, 0 0, 50% 50%)", transform: "rotate(0deg)" }}></div>
                    <div className="absolute w-16 h-16 bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center mt-4">
                  <div>
                    <div className="text-sm text-gray-500">Hot</div>
                    <div className="text-xl font-bold text-red-600">18%</div>
                    <div className="text-xs text-green-600">+2.1%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Warm</div>
                    <div className="text-xl font-bold text-yellow-600">54%</div>
                    <div className="text-xs text-green-600">+1.5%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Cold</div>
                    <div className="text-xl font-bold text-blue-600">28%</div>
                    <div className="text-xs text-red-600">-3.6%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efectividad de scoring</CardTitle>
                <CardDescription>
                  Análisis de conversión por categoría de lead
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Hot → Venta</span>
                      <span className="text-sm">28%</span>
                    </div>
                    <Progress value={28} className="h-2 bg-gray-100">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "28%" }}></div>
                    </Progress>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Warm → Venta</span>
                      <span className="text-sm">12%</span>
                    </div>
                    <Progress value={12} className="h-2 bg-gray-100">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: "12%" }}></div>
                    </Progress>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Cold → Venta</span>
                      <span className="text-sm">3%</span>
                    </div>
                    <Progress value={3} className="h-2 bg-gray-100">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "3%" }}></div>
                    </Progress>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-gray-50 mt-4">
                    <h4 className="font-medium mb-2">Retorno de inversión</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-gray-500">Hot</div>
                        <div className="text-xl font-bold">5.2x</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Warm</div>
                        <div className="text-xl font-bold">2.3x</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Cold</div>
                        <div className="text-xl font-bold">0.8x</div>
                      </div>
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