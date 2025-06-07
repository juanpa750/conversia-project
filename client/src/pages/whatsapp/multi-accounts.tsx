import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  RiWhatsappLine, 
  RiAddLine,
  RiEdit2Line,
  RiDeleteBin6Line,
  RiCheckLine, 
  RiCloseLine, 
  RiErrorWarningLine,
  RiSendPlaneLine,
  RiMessageLine,
  RiSettings3Line,
  RiPhoneLine,
  RiUserLine,
  RiTimeLine,
  RiRefreshLine,
  RiPlayLine,
  RiPauseLine,
  RiEyeLine
} from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface WhatsAppIntegration {
  id: number;
  userId: string;
  productId?: number;
  chatbotId?: number;
  phoneNumber: string;
  displayName: string;
  businessDescription?: string;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  isActive: boolean;
  priority: number;
  autoRespond: boolean;
  operatingHours?: any;
  connectedAt?: string;
  lastError?: string;
  messagesSent: number;
  messagesReceived: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  category?: string;
}

interface Chatbot {
  id: number;
  name: string;
  status: string;
}

const statusColors = {
  connected: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
  disconnected: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  connecting: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
  error: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
};

const statusIcons = {
  connected: <RiCheckLine className="w-4 h-4" />,
  disconnected: <RiCloseLine className="w-4 h-4" />,
  connecting: <RiRefreshLine className="w-4 h-4 animate-spin" />,
  error: <RiErrorWarningLine className="w-4 h-4" />
};

export default function MultiWhatsAppAccounts() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<WhatsAppIntegration | null>(null);
  const [newIntegration, setNewIntegration] = useState({
    phoneNumber: '',
    displayName: '',
    businessDescription: '',
    productId: '',
    chatbotId: '',
    priority: 1,
    autoRespond: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: integrations = [], isLoading: integrationsLoading } = useQuery({
    queryKey: ['/api/whatsapp/integrations']
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products']
  });

  const { data: chatbots = [] } = useQuery({
    queryKey: ['/api/chatbots']
  });

  // Mutations
  const createIntegrationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/whatsapp/integrations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/integrations'] });
      setIsAddDialogOpen(false);
      setNewIntegration({
        phoneNumber: '',
        displayName: '',
        businessDescription: '',
        productId: '',
        chatbotId: '',
        priority: 1,
        autoRespond: true
      });
      toast({
        title: "Éxito",
        description: "Integración de WhatsApp creada correctamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error creando integración",
        variant: "destructive"
      });
    }
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest('PATCH', `/api/whatsapp/integrations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/integrations'] });
      setIsEditDialogOpen(false);
      setEditingIntegration(null);
      toast({
        title: "Éxito",
        description: "Integración actualizada correctamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error actualizando integración",
        variant: "destructive"
      });
    }
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('PATCH', `/api/whatsapp/integrations/${id}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/integrations'] });
      toast({
        title: "Éxito",
        description: "Estado de integración actualizado"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error cambiando estado",
        variant: "destructive"
      });
    }
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/whatsapp/integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/integrations'] });
      toast({
        title: "Éxito",
        description: "Integración eliminada correctamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error eliminando integración",
        variant: "destructive"
      });
    }
  });

  const handleCreateIntegration = () => {
    const data = {
      ...newIntegration,
      productId: newIntegration.productId ? parseInt(newIntegration.productId) : null,
      chatbotId: newIntegration.chatbotId ? parseInt(newIntegration.chatbotId) : null
    };
    createIntegrationMutation.mutate(data);
  };

  const handleEditIntegration = () => {
    if (!editingIntegration) return;
    
    updateIntegrationMutation.mutate({
      id: editingIntegration.id,
      data: editingIntegration
    });
  };

  const openEditDialog = (integration: WhatsAppIntegration) => {
    setEditingIntegration({ ...integration });
    setIsEditDialogOpen(true);
  };

  const getProductName = (productId?: number) => {
    if (!productId) return 'Sin producto asignado';
    const product = products.find((p: Product) => p.id === productId);
    return product?.name || 'Producto no encontrado';
  };

  const getChatbotName = (chatbotId?: number) => {
    if (!chatbotId) return 'Sin chatbot asignado';
    const chatbot = chatbots.find((c: Chatbot) => c.id === chatbotId);
    return chatbot?.name || 'Chatbot no encontrado';
  };

  if (integrationsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <RiWhatsappLine className="text-green-500" />
              Múltiples Cuentas WhatsApp
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Gestiona múltiples números de WhatsApp, uno por producto para respuestas especializadas
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <RiAddLine className="w-5 h-5" />
                Agregar WhatsApp
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Nueva Integración WhatsApp</DialogTitle>
                <DialogDescription>
                  Conecta un nuevo número de WhatsApp y vinculalo a un producto específico
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phoneNumber">Número de WhatsApp</Label>
                    <Input
                      id="phoneNumber"
                      value={newIntegration.phoneNumber}
                      onChange={(e) => setNewIntegration({ ...newIntegration, phoneNumber: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayName">Nombre para mostrar</Label>
                    <Input
                      id="displayName"
                      value={newIntegration.displayName}
                      onChange={(e) => setNewIntegration({ ...newIntegration, displayName: e.target.value })}
                      placeholder="Mi Negocio WhatsApp"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessDescription">Descripción del negocio</Label>
                  <Textarea
                    id="businessDescription"
                    value={newIntegration.businessDescription}
                    onChange={(e) => setNewIntegration({ ...newIntegration, businessDescription: e.target.value })}
                    placeholder="Describe tu negocio..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productId">Producto asociado</Label>
                    <Select
                      value={newIntegration.productId}
                      onValueChange={(value) => setNewIntegration({ ...newIntegration, productId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin producto específico</SelectItem>
                        {products.map((product: Product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="chatbotId">Chatbot asociado</Label>
                    <Select
                      value={newIntegration.chatbotId}
                      onValueChange={(value) => setNewIntegration({ ...newIntegration, chatbotId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar chatbot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin chatbot específico</SelectItem>
                        {chatbots.map((chatbot: Chatbot) => (
                          <SelectItem key={chatbot.id} value={chatbot.id.toString()}>
                            {chatbot.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      max="10"
                      value={newIntegration.priority}
                      onChange={(e) => setNewIntegration({ ...newIntegration, priority: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="autoRespond"
                      checked={newIntegration.autoRespond}
                      onCheckedChange={(checked) => setNewIntegration({ ...newIntegration, autoRespond: checked })}
                    />
                    <Label htmlFor="autoRespond">Respuesta automática</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={createIntegrationMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateIntegration}
                    disabled={createIntegrationMutation.isPending || !newIntegration.phoneNumber || !newIntegration.displayName}
                  >
                    {createIntegrationMutation.isPending ? "Creando..." : "Crear Integración"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Integraciones</CardTitle>
              <RiWhatsappLine className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrations.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conectadas</CardTitle>
              <RiCheckLine className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {integrations.filter((i: WhatsAppIntegration) => i.status === 'connected').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activas</CardTitle>
              <RiPlayLine className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {integrations.filter((i: WhatsAppIntegration) => i.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Productos</CardTitle>
              <RiUserLine className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {integrations.filter((i: WhatsAppIntegration) => i.productId).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Integraciones de WhatsApp</CardTitle>
            <CardDescription>
              Gestiona todas tus integraciones de WhatsApp desde aquí
            </CardDescription>
          </CardHeader>
          <CardContent>
            {integrations.length === 0 ? (
              <div className="text-center py-12">
                <RiWhatsappLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No hay integraciones de WhatsApp
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comienza agregando tu primera integración de WhatsApp
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <RiAddLine className="w-4 h-4 mr-2" />
                  Agregar Primera Integración
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estado</TableHead>
                      <TableHead>Número / Nombre</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Chatbot</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Mensajes</TableHead>
                      <TableHead>Último Mensaje</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrations.map((integration: WhatsAppIntegration) => (
                      <TableRow key={integration.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[integration.status]}>
                              {statusIcons[integration.status]}
                              {integration.status}
                            </Badge>
                            {!integration.isActive && (
                              <Badge variant="outline">
                                <RiPauseLine className="w-3 h-3 mr-1" />
                                Inactiva
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{integration.displayName}</div>
                            <div className="text-sm text-gray-500">{integration.phoneNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {getProductName(integration.productId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {getChatbotName(integration.chatbotId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{integration.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-green-600">↗ {integration.messagesSent || 0}</div>
                            <div className="text-blue-600">↙ {integration.messagesReceived || 0}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {integration.lastMessageAt ? (
                            <div className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(integration.lastMessageAt), {
                                addSuffix: true,
                                locale: es
                              })}
                            </div>
                          ) : (
                            <span className="text-gray-400">Sin mensajes</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleIntegrationMutation.mutate(integration.id)}
                              disabled={toggleIntegrationMutation.isPending}
                            >
                              {integration.isActive ? (
                                <RiPauseLine className="w-4 h-4" />
                              ) : (
                                <RiPlayLine className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(integration)}
                            >
                              <RiEdit2Line className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteIntegrationMutation.mutate(integration.id)}
                              disabled={deleteIntegrationMutation.isPending}
                            >
                              <RiDeleteBin6Line className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Integración WhatsApp</DialogTitle>
              <DialogDescription>
                Modifica la configuración de esta integración
              </DialogDescription>
            </DialogHeader>
            
            {editingIntegration && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-phoneNumber">Número de WhatsApp</Label>
                    <Input
                      id="edit-phoneNumber"
                      value={editingIntegration.phoneNumber}
                      onChange={(e) => setEditingIntegration({ ...editingIntegration, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-displayName">Nombre para mostrar</Label>
                    <Input
                      id="edit-displayName"
                      value={editingIntegration.displayName}
                      onChange={(e) => setEditingIntegration({ ...editingIntegration, displayName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-businessDescription">Descripción del negocio</Label>
                  <Textarea
                    id="edit-businessDescription"
                    value={editingIntegration.businessDescription || ''}
                    onChange={(e) => setEditingIntegration({ ...editingIntegration, businessDescription: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-productId">Producto asociado</Label>
                    <Select
                      value={editingIntegration.productId?.toString() || ''}
                      onValueChange={(value) => setEditingIntegration({ 
                        ...editingIntegration, 
                        productId: value ? parseInt(value) : undefined 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin producto específico</SelectItem>
                        {products.map((product: Product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-chatbotId">Chatbot asociado</Label>
                    <Select
                      value={editingIntegration.chatbotId?.toString() || ''}
                      onValueChange={(value) => setEditingIntegration({ 
                        ...editingIntegration, 
                        chatbotId: value ? parseInt(value) : undefined 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar chatbot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin chatbot específico</SelectItem>
                        {chatbots.map((chatbot: Chatbot) => (
                          <SelectItem key={chatbot.id} value={chatbot.id.toString()}>
                            {chatbot.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-priority">Prioridad</Label>
                    <Input
                      id="edit-priority"
                      type="number"
                      min="1"
                      max="10"
                      value={editingIntegration.priority}
                      onChange={(e) => setEditingIntegration({ 
                        ...editingIntegration, 
                        priority: parseInt(e.target.value) || 1 
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="edit-autoRespond"
                      checked={editingIntegration.autoRespond}
                      onCheckedChange={(checked) => setEditingIntegration({ 
                        ...editingIntegration, 
                        autoRespond: checked 
                      })}
                    />
                    <Label htmlFor="edit-autoRespond">Respuesta automática</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={updateIntegrationMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleEditIntegration}
                    disabled={updateIntegrationMutation.isPending}
                  >
                    {updateIntegrationMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}