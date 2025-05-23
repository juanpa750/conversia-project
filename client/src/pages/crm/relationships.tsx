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
  RiTeamLine,
  RiSettings3Line,
  RiEditLine,
  RiSearchLine,
  RiStarLine,
  RiAddLine,
  RiDeleteBinLine,
  RiLinkM,
  RiSortAsc,
  RiFilter2Line,
  RiArrowLeftRightLine,
  RiBuilding3Line,
  RiGlobalLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPin2Line
} from "@/lib/icons";
import { Layout } from "@/components/layout/layout";

// Mock data for organizations
const MOCK_ORGANIZATIONS = [
  {
    id: "org1",
    name: "Innovaciones Técnicas S.L.",
    industry: "Tecnología",
    size: "50-100",
    website: "www.innovacionestecnicas.es",
    contacts: 12,
    location: "Madrid, España",
    deals: 4,
    totalValue: 45800,
    notes: "Cliente corporativo con múltiples departamentos.",
    lastActivity: "2023-06-10T14:25:00"
  },
  {
    id: "org2",
    name: "Constructora Hermanos García",
    industry: "Construcción",
    size: "10-50",
    website: "www.constructorahg.es",
    contacts: 5,
    location: "Barcelona, España",
    deals: 2,
    totalValue: 85000,
    notes: "Especializada en reformas comerciales. Potencial para expansión.",
    lastActivity: "2023-05-28T09:15:00"
  },
  {
    id: "org3",
    name: "Distribuciones Alimentarias Rápidas",
    industry: "Alimentación",
    size: "100-250",
    website: "www.distribucionar.com",
    contacts: 8,
    location: "Valencia, España",
    deals: 1,
    totalValue: 12500,
    notes: "Distribuidora regional con planes de expansión nacional.",
    lastActivity: "2023-06-12T11:45:00"
  },
  {
    id: "org4",
    name: "Clínica Dental Sonrisas",
    industry: "Salud",
    size: "1-10",
    website: "www.clinicasonrisas.es",
    contacts: 3,
    location: "Sevilla, España",
    deals: 1,
    totalValue: 3200,
    notes: "Pequeña clínica familiar con potencial para digitalización.",
    lastActivity: "2023-06-01T16:30:00"
  },
  {
    id: "org5",
    name: "Editorial Páginas de Oro",
    industry: "Editorial",
    size: "10-50",
    website: "www.paginasdeoro.es",
    contacts: 6,
    location: "Barcelona, España",
    deals: 0,
    totalValue: 0,
    notes: "Editorial con múltiples sellos. En fase inicial de conversaciones.",
    lastActivity: "2023-06-08T10:20:00"
  }
];

// Mock data for relationship mapping
const MOCK_RELATIONSHIPS = [
  {
    id: "rel1",
    sourceId: "1",
    sourceName: "María García López",
    sourceType: "contact",
    targetId: "org1",
    targetName: "Innovaciones Técnicas S.L.",
    targetType: "organization",
    relationshipType: "employee",
    strength: "strong",
    notes: "Contacto principal de la empresa. Tiene poder de decisión.",
    lastActivity: "2023-06-10T14:25:00"
  },
  {
    id: "rel2",
    sourceId: "1",
    sourceName: "María García López",
    sourceType: "contact",
    targetId: "2",
    targetName: "Carlos Rodríguez Martínez",
    targetType: "contact",
    relationshipType: "colleague",
    strength: "medium",
    notes: "Compañeros de trabajo en el departamento de marketing.",
    lastActivity: "2023-06-05T09:30:00"
  },
  {
    id: "rel3",
    sourceId: "4",
    sourceName: "Javier López Torres",
    sourceType: "contact",
    targetId: "org2",
    targetName: "Constructora Hermanos García",
    targetType: "organization",
    relationshipType: "owner",
    strength: "strong",
    notes: "Socio fundador de la empresa y principal tomador de decisiones.",
    lastActivity: "2023-05-28T09:15:00"
  },
  {
    id: "rel4",
    sourceId: "3",
    sourceName: "Laura Fernández Sánchez",
    sourceType: "contact",
    targetId: "org3",
    targetName: "Distribuciones Alimentarias Rápidas",
    targetType: "organization",
    relationshipType: "employee",
    strength: "strong",
    notes: "Directora de ventas con amplia red de contactos en la industria.",
    lastActivity: "2023-06-12T11:45:00"
  },
  {
    id: "rel5",
    sourceId: "2",
    sourceName: "Carlos Rodríguez Martínez",
    sourceType: "contact",
    targetId: "5",
    targetName: "Ana Martínez Ruiz",
    targetType: "contact",
    relationshipType: "referral",
    strength: "weak",
    notes: "Ana fue referida por Carlos para consultoría de marketing.",
    lastActivity: "2023-04-15T16:45:00"
  }
];

// Mock data for interaction history
const MOCK_INTERACTIONS = [
  {
    id: "int1",
    date: "2023-06-12T11:45:00",
    contactName: "Laura Fernández Sánchez",
    organizationName: "Distribuciones Alimentarias Rápidas",
    type: "meeting",
    summary: "Reunión sobre expansión de línea de productos. Interesados en incorporar nuevos proveedores.",
    outcome: "positive",
    nextSteps: "Preparar propuesta de colaboración para la próxima semana."
  },
  {
    id: "int2",
    date: "2023-06-10T14:25:00",
    contactName: "María García López",
    organizationName: "Innovaciones Técnicas S.L.",
    type: "call",
    summary: "Llamada de seguimiento sobre implementación de sistema CRM. Solicitan más información sobre integraciones.",
    outcome: "neutral",
    nextSteps: "Enviar documentación técnica y agendar demostración."
  },
  {
    id: "int3",
    date: "2023-06-08T10:20:00",
    contactName: "Miguel Torres Vega",
    organizationName: "Editorial Páginas de Oro",
    type: "email",
    summary: "Intercambio de correos sobre posibilidades de digitalización de catálogo. Tienen interés pero presupuesto limitado.",
    outcome: "positive",
    nextSteps: "Preparar propuesta escalonada con diferentes niveles de inversión."
  },
  {
    id: "int4",
    date: "2023-06-01T16:30:00",
    contactName: "Carmen Ruiz Navarro",
    organizationName: "Clínica Dental Sonrisas",
    type: "meeting",
    summary: "Presentación inicial de servicios. Muestran especial interés en sistema de gestión de citas y recordatorios automáticos.",
    outcome: "positive",
    nextSteps: "Enviar presupuesto detallado y casos de éxito similares."
  },
  {
    id: "int5",
    date: "2023-05-28T09:15:00",
    contactName: "Javier López Torres",
    organizationName: "Constructora Hermanos García",
    type: "call",
    summary: "Llamada para discutir ampliación de contrato actual. Satisfechos con resultados iniciales.",
    outcome: "positive",
    nextSteps: "Preparar propuesta de servicios adicionales."
  }
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

// Get relationship type badge
const getRelationshipTypeBadge = (type: string) => {
  switch (type) {
    case "employee":
      return <Badge className="bg-blue-100 text-blue-800">Empleado</Badge>;
    case "owner":
      return <Badge className="bg-purple-100 text-purple-800">Propietario</Badge>;
    case "colleague":
      return <Badge className="bg-green-100 text-green-800">Colega</Badge>;
    case "referral":
      return <Badge className="bg-yellow-100 text-yellow-800">Referido</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
  }
};

// Get relationship strength badge
const getRelationshipStrengthBadge = (strength: string) => {
  switch (strength) {
    case "strong":
      return <Badge className="bg-green-100 text-green-800">Fuerte</Badge>;
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>;
    case "weak":
      return <Badge className="bg-red-100 text-red-800">Débil</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{strength}</Badge>;
  }
};

// Get interaction outcome badge
const getInteractionOutcomeBadge = (outcome: string) => {
  switch (outcome) {
    case "positive":
      return <Badge className="bg-green-100 text-green-800">Positivo</Badge>;
    case "neutral":
      return <Badge className="bg-yellow-100 text-yellow-800">Neutral</Badge>;
    case "negative":
      return <Badge className="bg-red-100 text-red-800">Negativo</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{outcome}</Badge>;
  }
};

// Get interaction type icon
const getInteractionTypeIcon = (type: string) => {
  switch (type) {
    case "meeting":
      return <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
        <RiTeamLine className="h-4 w-4" />
      </div>;
    case "call":
      return <div className="h-8 w-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center">
        <RiPhoneLine className="h-4 w-4" />
      </div>;
    case "email":
      return <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
        <RiMailLine className="h-4 w-4" />
      </div>;
    default:
      return <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center">
        <RiUser3Line className="h-4 w-4" />
      </div>;
  }
};

export default function RelationshipsPage() {
  const [activeTab, setActiveTab] = useState("organizations");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [showOrganizationDetailsDialog, setShowOrganizationDetailsDialog] = useState(false);
  const [showAddOrganizationDialog, setShowAddOrganizationDialog] = useState(false);
  const [showAddRelationshipDialog, setShowAddRelationshipDialog] = useState(false);
  const [showMapViewDialog, setShowMapViewDialog] = useState(false);
  const { toast } = useToast();

  // Filter organizations based on search term
  const filteredOrganizations = MOCK_ORGANIZATIONS.filter(organization => {
    return (
      organization.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organization.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organization.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle viewing organization details
  const handleViewOrganization = (organization: any) => {
    setSelectedOrganization(organization);
    setShowOrganizationDetailsDialog(true);
  };

  // Handle adding a new organization
  const handleAddOrganization = () => {
    setShowAddOrganizationDialog(false);
    toast({
      title: "Organización añadida",
      description: "La organización ha sido añadida correctamente.",
    });
  };

  // Handle adding a new relationship
  const handleAddRelationship = () => {
    setShowAddRelationshipDialog(false);
    toast({
      title: "Relación añadida",
      description: "La relación ha sido registrada correctamente.",
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mapeo de Relaciones</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visualiza y gestiona organizaciones, contactos y sus interrelaciones
        </p>
      </div>

      <Tabs defaultValue="organizations" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 gap-4 w-full md:w-2/3">
          <TabsTrigger value="organizations" className="flex gap-2 items-center">
            <RiBuilding3Line />
            <span>Organizaciones</span>
          </TabsTrigger>
          <TabsTrigger value="relationships" className="flex gap-2 items-center">
            <RiArrowLeftRightLine />
            <span>Relaciones</span>
          </TabsTrigger>
          <TabsTrigger value="interactions" className="flex gap-2 items-center">
            <RiTeamLine />
            <span>Interacciones</span>
          </TabsTrigger>
        </TabsList>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Input
                  type="text"
                  placeholder="Buscar organizaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <RiSearchLine className="h-5 w-5" />
                </div>
              </div>
              
              <Button variant="outline" className="gap-2">
                <RiFilter2Line className="h-4 w-4" />
                <span>Filtros</span>
              </Button>
              
              <Button variant="outline" className="gap-2">
                <RiSortAsc className="h-4 w-4" />
                <span>Ordenar</span>
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Dialog open={showMapViewDialog} onOpenChange={setShowMapViewDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <RiGlobalLine className="h-4 w-4" />
                    <span>Vista de mapa</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[900px] sm:h-[600px]">
                  <DialogHeader>
                    <DialogTitle>Distribución geográfica</DialogTitle>
                    <DialogDescription>
                      Visualización de organizaciones por ubicación geográfica
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex-1 h-[500px] bg-gray-100 rounded-md flex items-center justify-center">
                    {/* Map visualization placeholder */}
                    <div className="text-center">
                      <RiMapPin2Line className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Mapa de organizaciones</p>
                      <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {MOCK_ORGANIZATIONS.map(org => (
                          <Badge key={org.id} className="bg-blue-100 text-blue-800 px-3 py-1">
                            {org.location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showAddOrganizationDialog} onOpenChange={setShowAddOrganizationDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <RiAddLine className="h-4 w-4" />
                    <span>Añadir organización</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Añadir organización</DialogTitle>
                    <DialogDescription>
                      Introduce la información de la nueva organización
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="org-name">Nombre de la organización</Label>
                        <Input id="org-name" placeholder="Ej: Empresa Ejemplo S.L." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org-industry">Industria</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar industria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Tecnología</SelectItem>
                            <SelectItem value="healthcare">Salud</SelectItem>
                            <SelectItem value="education">Educación</SelectItem>
                            <SelectItem value="finance">Finanzas</SelectItem>
                            <SelectItem value="manufacturing">Manufactura</SelectItem>
                            <SelectItem value="retail">Comercio</SelectItem>
                            <SelectItem value="construction">Construcción</SelectItem>
                            <SelectItem value="food">Alimentación</SelectItem>
                            <SelectItem value="other">Otra</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="org-size">Tamaño</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tamaño" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 empleados</SelectItem>
                            <SelectItem value="10-50">10-50 empleados</SelectItem>
                            <SelectItem value="50-100">50-100 empleados</SelectItem>
                            <SelectItem value="100-250">100-250 empleados</SelectItem>
                            <SelectItem value="250-1000">250-1000 empleados</SelectItem>
                            <SelectItem value="1000+">Más de 1000 empleados</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org-website">Sitio web</Label>
                        <Input id="org-website" placeholder="www.ejemplo.com" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="org-location">Ubicación</Label>
                      <Input id="org-location" placeholder="Ciudad, País" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="org-notes">Notas</Label>
                      <textarea 
                        id="org-notes" 
                        className="w-full border rounded-md p-2 h-20" 
                        placeholder="Información adicional sobre la organización..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddOrganizationDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddOrganization}>
                      Guardar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Listado de organizaciones</CardTitle>
              <CardDescription>
                Organizaciones y empresas relacionadas con tus contactos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organización</TableHead>
                    <TableHead>Industria</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Contactos</TableHead>
                    <TableHead>Valor de oportunidades</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganizations.length > 0 ? (
                    filteredOrganizations.map(organization => (
                      <TableRow key={organization.id}>
                        <TableCell className="font-medium">{organization.name}</TableCell>
                        <TableCell>{organization.industry}</TableCell>
                        <TableCell>{organization.location}</TableCell>
                        <TableCell>{organization.contacts}</TableCell>
                        <TableCell>
                          {organization.totalValue > 0 ? (
                            <span className="text-green-600 font-medium">
                              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(organization.totalValue)}
                            </span>
                          ) : (
                            <span className="text-gray-400">Sin oportunidades</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewOrganization(organization)}>
                            Ver detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                        No se encontraron organizaciones con los filtros seleccionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Organization Details Dialog */}
          <Dialog open={showOrganizationDetailsDialog} onOpenChange={setShowOrganizationDetailsDialog}>
            <DialogContent className="sm:max-w-[900px]">
              {selectedOrganization && (
                <>
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <DialogTitle className="text-xl">{selectedOrganization.name}</DialogTitle>
                        <DialogDescription>
                          {selectedOrganization.industry} • {selectedOrganization.location}
                        </DialogDescription>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" className="gap-1">
                          <RiEditLine className="h-4 w-4" />
                          <span>Editar</span>
                        </Button>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-6">
                      <Card className="border-0 shadow-none">
                        <CardHeader className="pb-2 px-0">
                          <CardTitle className="text-md">Información de contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Sitio web:</span>
                            <a 
                              href={`https://${selectedOrganization.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:underline"
                            >
                              {selectedOrganization.website}
                            </a>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Tamaño:</span>
                            <span className="text-sm font-medium">{selectedOrganization.size} empleados</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Contactos:</span>
                            <span className="text-sm font-medium">{selectedOrganization.contacts}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Última actividad:</span>
                            <span className="text-sm font-medium">{formatDate(selectedOrganization.lastActivity)}</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-none">
                        <CardHeader className="pb-2 px-0">
                          <CardTitle className="text-md">Notas</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                          <p className="text-sm text-gray-600">{selectedOrganization.notes}</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-none">
                        <CardHeader className="pb-2 px-0">
                          <CardTitle className="text-md">Oportunidades</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                          {selectedOrganization.deals > 0 ? (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Oportunidades activas:</span>
                                <span className="text-sm font-medium">{selectedOrganization.deals}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Valor total:</span>
                                <span className="text-sm font-medium text-green-600">
                                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(selectedOrganization.totalValue)}
                                </span>
                              </div>
                              <Button className="w-full mt-2" variant="outline" size="sm">
                                Ver oportunidades
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center py-3">
                              <p className="text-sm text-gray-500 mb-2">No hay oportunidades activas</p>
                              <Button variant="outline" size="sm">
                                <RiAddLine className="mr-2 h-4 w-4" />
                                Crear oportunidad
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="md:col-span-2 space-y-6">
                      <Card className="border-0 shadow-none">
                        <CardHeader className="pb-2 px-0 flex flex-row items-center justify-between">
                          <CardTitle className="text-md">Contactos relacionados</CardTitle>
                          <Button variant="outline" size="sm">
                            <RiAddLine className="mr-2 h-4 w-4" />
                            Añadir contacto
                          </Button>
                        </CardHeader>
                        <CardContent className="px-0">
                          <div className="rounded-md border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nombre</TableHead>
                                  <TableHead>Cargo</TableHead>
                                  <TableHead>Relación</TableHead>
                                  <TableHead>Fortaleza</TableHead>
                                  <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {MOCK_RELATIONSHIPS
                                  .filter(rel => 
                                    (rel.targetType === "organization" && rel.targetId === selectedOrganization.id) || 
                                    (rel.sourceType === "organization" && rel.sourceId === selectedOrganization.id)
                                  )
                                  .map(rel => {
                                    const isSource = rel.sourceType === "organization";
                                    const contactName = isSource ? rel.targetName : rel.sourceName;
                                    return (
                                      <TableRow key={rel.id}>
                                        <TableCell className="font-medium">{contactName}</TableCell>
                                        <TableCell>Cargo ejemplo</TableCell>
                                        <TableCell>{getRelationshipTypeBadge(rel.relationshipType)}</TableCell>
                                        <TableCell>{getRelationshipStrengthBadge(rel.strength)}</TableCell>
                                        <TableCell className="text-right">
                                          <Button variant="ghost" size="sm">Ver perfil</Button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                {MOCK_RELATIONSHIPS.filter(rel => 
                                  (rel.targetType === "organization" && rel.targetId === selectedOrganization.id) || 
                                  (rel.sourceType === "organization" && rel.sourceId === selectedOrganization.id)
                                ).length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                                      No hay contactos relacionados registrados.
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-none">
                        <CardHeader className="pb-2 px-0">
                          <CardTitle className="text-md">Actividad reciente</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                          <div className="space-y-4">
                            {MOCK_INTERACTIONS
                              .filter(int => int.organizationName === selectedOrganization.name)
                              .map(interaction => (
                                <div key={interaction.id} className="flex items-start gap-3 pb-4 border-b">
                                  {getInteractionTypeIcon(interaction.type)}
                                  <div className="flex-1">
                                    <div className="flex justify-between">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium">{interaction.contactName}</h4>
                                        <span className="text-xs text-gray-500">({interaction.type})</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{formatDate(interaction.date)}</span>
                                        {getInteractionOutcomeBadge(interaction.outcome)}
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{interaction.summary}</p>
                                    <p className="text-xs text-gray-500 mt-1">Próximos pasos: {interaction.nextSteps}</p>
                                  </div>
                                </div>
                              ))}
                            {MOCK_INTERACTIONS.filter(int => int.organizationName === selectedOrganization.name).length === 0 && (
                              <div className="text-center py-6 text-gray-500">
                                <p>No hay actividades recientes registradas.</p>
                              </div>
                            )}
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

        {/* Relationships Tab */}
        <TabsContent value="relationships" className="space-y-6">
          <div className="flex justify-end mb-6">
            <Dialog open={showAddRelationshipDialog} onOpenChange={setShowAddRelationshipDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <RiAddLine className="h-4 w-4" />
                  <span>Añadir relación</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Añadir relación</DialogTitle>
                  <DialogDescription>
                    Registra una nueva relación entre contactos y/o organizaciones
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rel-source-type">Tipo de origen</Label>
                      <Select defaultValue="contact">
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contact">Contacto</SelectItem>
                          <SelectItem value="organization">Organización</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rel-source">Origen</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar origen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">María García López</SelectItem>
                          <SelectItem value="2">Carlos Rodríguez Martínez</SelectItem>
                          <SelectItem value="3">Laura Fernández Sánchez</SelectItem>
                          <SelectItem value="4">Javier López Torres</SelectItem>
                          <SelectItem value="5">Ana Martínez Ruiz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rel-target-type">Tipo de destino</Label>
                      <Select defaultValue="organization">
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contact">Contacto</SelectItem>
                          <SelectItem value="organization">Organización</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rel-target">Destino</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar destino" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="org1">Innovaciones Técnicas S.L.</SelectItem>
                          <SelectItem value="org2">Constructora Hermanos García</SelectItem>
                          <SelectItem value="org3">Distribuciones Alimentarias Rápidas</SelectItem>
                          <SelectItem value="org4">Clínica Dental Sonrisas</SelectItem>
                          <SelectItem value="org5">Editorial Páginas de Oro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rel-type">Tipo de relación</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Empleado</SelectItem>
                          <SelectItem value="owner">Propietario</SelectItem>
                          <SelectItem value="colleague">Colega</SelectItem>
                          <SelectItem value="referral">Referido</SelectItem>
                          <SelectItem value="supplier">Proveedor</SelectItem>
                          <SelectItem value="customer">Cliente</SelectItem>
                          <SelectItem value="partner">Socio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rel-strength">Fortaleza</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar fortaleza" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strong">Fuerte</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="weak">Débil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rel-notes">Notas</Label>
                    <textarea 
                      id="rel-notes" 
                      className="w-full border rounded-md p-2 h-20" 
                      placeholder="Información adicional sobre esta relación..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddRelationshipDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddRelationship}>
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mapa de relaciones</CardTitle>
              <CardDescription>
                Visualiza las conexiones entre contactos y organizaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-50 rounded-md p-4 flex items-center justify-center">
                {/* Relationship network visualization placeholder */}
                <div className="relative w-full h-full">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 border-2 border-purple-300">
                      <span className="text-sm font-medium">Organizaciones</span>
                    </div>
                  </div>
                  
                  {MOCK_ORGANIZATIONS.map((org, index) => {
                    const angle = (index / MOCK_ORGANIZATIONS.length) * Math.PI * 2;
                    const x = Math.cos(angle) * 150 + 50; // % width
                    const y = Math.sin(angle) * 150 + 50; // % height
                    
                    return (
                      <div 
                        key={org.id} 
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 border-2 border-blue-300 text-xs"
                        style={{ 
                          left: `${x}px`, 
                          top: `${y}px`,
                          maxWidth: '200px'
                        }}
                      >
                        <span className="text-center px-1 truncate">{org.name}</span>
                        
                        {/* Lines connecting to center */}
                        <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: -1 }}>
                          <line 
                            x1="50%" 
                            y1="50%" 
                            x2="50%" 
                            y2="0%" 
                            stroke="#d1d5db" 
                            strokeWidth="2" 
                            strokeDasharray="5,5" 
                          />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Listado de relaciones</CardTitle>
              <CardDescription>
                Registro detallado de todas las relaciones identificadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origen</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Fortaleza</TableHead>
                    <TableHead>Última actividad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_RELATIONSHIPS.map(relationship => (
                    <TableRow key={relationship.id}>
                      <TableCell className="font-medium">{relationship.sourceName}</TableCell>
                      <TableCell>{getRelationshipTypeBadge(relationship.relationshipType)}</TableCell>
                      <TableCell>{relationship.targetName}</TableCell>
                      <TableCell>{getRelationshipStrengthBadge(relationship.strength)}</TableCell>
                      <TableCell>{formatDate(relationship.lastActivity)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <RiEditLine className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <RiDeleteBinLine className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interactions Tab */}
        <TabsContent value="interactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de interacciones</CardTitle>
              <CardDescription>
                Registro de todas las interacciones con contactos y organizaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {MOCK_INTERACTIONS.map(interaction => (
                  <div key={interaction.id} className="flex items-start gap-4 border-b pb-6">
                    {getInteractionTypeIcon(interaction.type)}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{interaction.contactName}</h4>
                          <p className="text-sm text-gray-500">
                            {interaction.organizationName} • {formatDate(interaction.date)}
                          </p>
                        </div>
                        <div>
                          {getInteractionOutcomeBadge(interaction.outcome)}
                        </div>
                      </div>
                      <p className="text-sm mt-2">{interaction.summary}</p>
                      <div className="mt-2">
                        <span className="text-sm font-medium">Próximos pasos: </span>
                        <span className="text-sm">{interaction.nextSteps}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de interacciones</CardTitle>
                <CardDescription>
                  Estadísticas de interacciones por tipo y resultado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-2">Por tipo</div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Reuniones</span>
                          <span className="font-medium">{MOCK_INTERACTIONS.filter(int => int.type === "meeting").length}</span>
                        </div>
                        <Progress 
                          value={MOCK_INTERACTIONS.filter(int => int.type === "meeting").length / MOCK_INTERACTIONS.length * 100} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Llamadas</span>
                          <span className="font-medium">{MOCK_INTERACTIONS.filter(int => int.type === "call").length}</span>
                        </div>
                        <Progress 
                          value={MOCK_INTERACTIONS.filter(int => int.type === "call").length / MOCK_INTERACTIONS.length * 100} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Emails</span>
                          <span className="font-medium">{MOCK_INTERACTIONS.filter(int => int.type === "email").length}</span>
                        </div>
                        <Progress 
                          value={MOCK_INTERACTIONS.filter(int => int.type === "email").length / MOCK_INTERACTIONS.length * 100} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-2">Por resultado</div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Positivo</span>
                          </span>
                          <span className="font-medium">{MOCK_INTERACTIONS.filter(int => int.outcome === "positive").length}</span>
                        </div>
                        <Progress 
                          value={MOCK_INTERACTIONS.filter(int => int.outcome === "positive").length / MOCK_INTERACTIONS.length * 100} 
                          className="h-2 bg-gray-100"
                        >
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${MOCK_INTERACTIONS.filter(int => int.outcome === "positive").length / MOCK_INTERACTIONS.length * 100}%` }}></div>
                        </Progress>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span>Neutral</span>
                          </span>
                          <span className="font-medium">{MOCK_INTERACTIONS.filter(int => int.outcome === "neutral").length}</span>
                        </div>
                        <Progress 
                          value={MOCK_INTERACTIONS.filter(int => int.outcome === "neutral").length / MOCK_INTERACTIONS.length * 100} 
                          className="h-2 bg-gray-100"
                        >
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${MOCK_INTERACTIONS.filter(int => int.outcome === "neutral").length / MOCK_INTERACTIONS.length * 100}%` }}></div>
                        </Progress>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>Negativo</span>
                          </span>
                          <span className="font-medium">{MOCK_INTERACTIONS.filter(int => int.outcome === "negative").length || 0}</span>
                        </div>
                        <Progress 
                          value={(MOCK_INTERACTIONS.filter(int => int.outcome === "negative").length || 0) / MOCK_INTERACTIONS.length * 100} 
                          className="h-2 bg-gray-100"
                        >
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${(MOCK_INTERACTIONS.filter(int => int.outcome === "negative").length || 0) / MOCK_INTERACTIONS.length * 100}%` }}></div>
                        </Progress>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximas interacciones</CardTitle>
                <CardDescription>
                  Seguimientos pendientes y próximas actividades programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Preparar propuesta de colaboración</h4>
                        <p className="text-sm text-gray-500">Laura Fernández - Distribuciones Alimentarias Rápidas</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Hoy</Badge>
                    </div>
                    <p className="text-sm">Elaborar propuesta detallada en base a la reunión del 12/06.</p>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Enviar documentación técnica</h4>
                        <p className="text-sm text-gray-500">María García - Innovaciones Técnicas S.L.</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Mañana</Badge>
                    </div>
                    <p className="text-sm">Compartir especificaciones sobre integraciones disponibles en el CRM.</p>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Presentación de propuesta</h4>
                        <p className="text-sm text-gray-500">Carmen Ruiz - Clínica Dental Sonrisas</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">18/06/2023</Badge>
                    </div>
                    <p className="text-sm">Reunión virtual para presentar sistema de gestión de citas.</p>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Propuesta escalonada</h4>
                        <p className="text-sm text-gray-500">Miguel Torres - Editorial Páginas de Oro</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">20/06/2023</Badge>
                    </div>
                    <p className="text-sm">Enviar opciones de digitalización con diferentes niveles de inversión.</p>
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