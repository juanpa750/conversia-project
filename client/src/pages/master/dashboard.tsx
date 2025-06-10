import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageCircle, 
  Phone, 
  Users,
  Plus,
  Eye,
  Smartphone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientMetrics {
  clientId: string;
  clientName: string;
  phoneNumber: string;
  freeMessagesRemaining: number;
  monthlyFreeUsed: number;
  conversationsToday: number;
  totalConversations: number;
  lastActivity: Date | null;
}

interface MasterConfig {
  isValid: boolean;
  errors?: string[];
}

export default function MasterDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    businessName: ''
  });
  
  const [addPhone, setAddPhone] = useState({
    setupCode: '',
    phoneNumber: '',
    displayName: ''
  });

  // Get all clients metrics
  const { data: clientsMetrics, isLoading: metricsLoading } = useQuery<ClientMetrics[]>({
    queryKey: ['/api/master/metrics'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Get master configuration status
  const { data: masterConfig } = useQuery<MasterConfig>({
    queryKey: ['/api/master/config/validate'],
    refetchInterval: 60000 // Check config every minute
  });

  // Register new client mutation
  const registerClientMutation = useMutation({
    mutationFn: async (clientData: typeof newClient) => {
      const response = await fetch('/api/master/register-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to register client');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Cliente registrado",
        description: `Código de configuración: ${data.setupCode}`,
      });
      setNewClient({ name: '', email: '', businessName: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/master/metrics'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Add WhatsApp number mutation
  const addPhoneMutation = useMutation({
    mutationFn: async (phoneData: typeof addPhone) => {
      const response = await fetch('/api/master/add-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phoneData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add WhatsApp number');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Número agregado",
        description: "WhatsApp conectado exitosamente con 1000 mensajes gratis",
      });
      setAddPhone({ setupCode: '', phoneNumber: '', displayName: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/master/metrics'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleRegisterClient = () => {
    if (!newClient.name || !newClient.email || !newClient.businessName) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        variant: "destructive"
      });
      return;
    }
    registerClientMutation.mutate(newClient);
  };

  const handleAddPhone = () => {
    if (!addPhone.setupCode || !addPhone.phoneNumber || !addPhone.displayName) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        variant: "destructive"
      });
      return;
    }
    addPhoneMutation.mutate(addPhone);
  };

  // Calculate total metrics
  const totalMetrics = clientsMetrics ? {
    totalClients: clientsMetrics.length,
    totalFreeRemaining: clientsMetrics.reduce((sum, client) => sum + client.freeMessagesRemaining, 0),
    totalUsed: clientsMetrics.reduce((sum, client) => sum + client.monthlyFreeUsed, 0),
    totalConversations: clientsMetrics.reduce((sum, client) => sum + client.totalConversations, 0)
  } : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Control total de múltiples números WhatsApp con API Master
          </p>
        </div>
        
        {masterConfig?.isValid ? (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-4 h-4 mr-2" />
            Configuración Master OK
          </Badge>
        ) : (
          <Badge variant="destructive">
            <XCircle className="w-4 h-4 mr-2" />
            Configuración Incompleta
          </Badge>
        )}
      </div>

      {/* Master Metrics Overview */}
      {totalMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMetrics.totalClients}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensajes Gratis Restantes</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalMetrics.totalFreeRemaining}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensajes Usados</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalMetrics.totalUsed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversaciones Totales</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMetrics.totalConversations}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients">Clientes Conectados</TabsTrigger>
          <TabsTrigger value="register">Registrar Cliente</TabsTrigger>
          <TabsTrigger value="addphone">Agregar WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Clientes Conectados
              </CardTitle>
              <CardDescription>
                Lista de todos los clientes con sus números WhatsApp configurados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : clientsMetrics && clientsMetrics.length > 0 ? (
                <div className="space-y-4">
                  {clientsMetrics.map((client) => (
                    <div key={client.clientId} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{client.clientName}</h3>
                          <p className="text-sm text-gray-600">{client.phoneNumber}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {client.freeMessagesRemaining} gratis restantes
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.monthlyFreeUsed}/1000 usados
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(client.monthlyFreeUsed / 1000) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Conversaciones hoy: {client.conversationsToday}</span>
                        <span>Total conversaciones: {client.totalConversations}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay clientes conectados aún</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Registrar Nuevo Cliente
              </CardTitle>
              <CardDescription>
                Registra un nuevo cliente y genera su código de configuración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nombre del Cliente</Label>
                  <Input
                    id="clientName"
                    placeholder="Juan Pérez"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="juan@empresa.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="businessName">Nombre del Negocio</Label>
                  <Input
                    id="businessName"
                    placeholder="Empresa ABC"
                    value={newClient.businessName}
                    onChange={(e) => setNewClient({...newClient, businessName: e.target.value})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleRegisterClient} 
                disabled={registerClientMutation.isPending}
                className="w-full md:w-auto"
              >
                {registerClientMutation.isPending ? 'Registrando...' : 'Registrar Cliente'}
              </Button>
              
              <Alert>
                <AlertDescription>
                  Al registrar un cliente, recibirá un código único para configurar su WhatsApp.
                  El cliente podrá usar 1000 mensajes gratuitos mensuales.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addphone" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Agregar Número WhatsApp
              </CardTitle>
              <CardDescription>
                Conecta el número WhatsApp Business de un cliente ya registrado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setupCode">Código de Configuración</Label>
                  <Input
                    id="setupCode"
                    placeholder="WA123456789ABC"
                    value={addPhone.setupCode}
                    onChange={(e) => setAddPhone({...addPhone, setupCode: e.target.value})}
                  />
                  <p className="text-sm text-gray-500">
                    Código generado al registrar el cliente
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Número WhatsApp</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+573001234567"
                    value={addPhone.phoneNumber}
                    onChange={(e) => setAddPhone({...addPhone, phoneNumber: e.target.value})}
                  />
                  <p className="text-sm text-gray-500">
                    Incluye código de país
                  </p>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="displayName">Nombre del Negocio (Display)</Label>
                  <Input
                    id="displayName"
                    placeholder="Empresa ABC - Ventas"
                    value={addPhone.displayName}
                    onChange={(e) => setAddPhone({...addPhone, displayName: e.target.value})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleAddPhone} 
                disabled={addPhoneMutation.isPending}
                className="w-full md:w-auto"
              >
                {addPhoneMutation.isPending ? 'Agregando...' : 'Agregar Número WhatsApp'}
              </Button>
              
              <Alert>
                <AlertDescription>
                  Una vez agregado, el número quedará conectado automáticamente y listo para recibir mensajes con respuestas de IA personalizadas.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Status */}
      {masterConfig && !masterConfig.isValid && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Configuración Master Incompleta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {masterConfig.errors?.map((error, index) => (
                <p key={index} className="text-sm text-red-600">• {error}</p>
              ))}
            </div>
            <Alert className="mt-4">
              <AlertDescription>
                Configura las variables de entorno WHATSAPP_MASTER_TOKEN, WHATSAPP_VERIFY_TOKEN y WHATSAPP_APP_ID para habilitar el sistema.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}