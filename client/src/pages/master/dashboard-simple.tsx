import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  MessageCircle, 
  Phone, 
  Users,
  Smartphone,
  Activity
} from "lucide-react";

interface ClientMetrics {
  clientId: string;
  clientName: string;
  phoneNumber: string;
  conversationsToday: number;
  totalConversations: number;
  lastActivity: Date | null;
  isConnected: boolean;
}

export default function MasterDashboard() {
  // Simular datos de clientes conectados
  const mockClients: ClientMetrics[] = [
    {
      clientId: "1",
      clientName: "Cliente Demo",
      phoneNumber: "+1234567890",
      conversationsToday: 25,
      totalConversations: 150,
      lastActivity: new Date(),
      isConnected: true
    }
  ];

  const { data: clientsData = mockClients, isLoading } = useQuery({
    queryKey: ['/api/master/clients'],
    queryFn: async () => {
      // En producción, esto se conectaría a la API real
      return mockClients;
    }
  });

  const totalClients = clientsData.length;
  const connectedClients = clientsData.filter(c => c.isConnected).length;
  const totalConversations = clientsData.reduce((sum, c) => sum + c.conversationsToday, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Master
        </h1>
        <p className="text-gray-600">
          Gestiona múltiples cuentas de WhatsApp y monitorea el rendimiento
        </p>
      </div>

      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Smartphone className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>WhatsApp Web Integration:</strong> Conecta múltiples números de WhatsApp usando códigos QR. 
          Cada cliente puede conectar su propio número sin necesidad de APIs de Meta.
        </AlertDescription>
      </Alert>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalClients}</div>
                <div className="text-sm text-gray-500">Registrados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clientes Conectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{connectedClients}</div>
                <div className="text-sm text-gray-500">Activos ahora</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Conversaciones Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalConversations}</div>
                <div className="text-sm text-gray-500">Mensajes procesados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Clientes Activos
          </CardTitle>
          <CardDescription>
            Monitorea el estado de conexión y actividad de cada cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientsData.map((client) => (
              <div key={client.clientId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{client.clientName}</div>
                    <div className="text-sm text-gray-500">{client.phoneNumber}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {client.conversationsToday} conversaciones hoy
                    </div>
                    <div className="text-xs text-gray-500">
                      {client.totalConversations} total
                    </div>
                  </div>
                  
                  <Badge variant={client.isConnected ? "default" : "secondary"}>
                    {client.isConnected ? "Conectado" : "Desconectado"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instrucciones */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-semibold text-xs">1</span>
              </div>
              <div>
                <strong>Conectar WhatsApp:</strong> Cada cliente va a "Conectar WhatsApp" y escanea un código QR único
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-semibold text-xs">2</span>
              </div>
              <div>
                <strong>Configurar Chatbots:</strong> Cada cliente puede crear y personalizar sus propios chatbots
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-semibold text-xs">3</span>
              </div>
              <div>
                <strong>Monitorear:</strong> Desde aquí puedes ver el rendimiento de todos los clientes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}