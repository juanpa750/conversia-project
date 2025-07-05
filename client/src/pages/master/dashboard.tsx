import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  Phone, 
  Users,
  Smartphone,
  ArrowRight,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface WhatsAppWebSession {
  id: string;
  clientName: string;
  status: 'connected' | 'disconnected' | 'connecting';
  lastActivity: Date | null;
  messagesCount: number;
}

export default function MasterDashboard() {
  
  // Mock data for WhatsApp Web sessions (will be replaced with real data)
  const [whatsappSessions] = useState<WhatsAppWebSession[]>([
    {
      id: '1',
      clientName: 'Cliente Demo',
      status: 'disconnected',
      lastActivity: null,
      messagesCount: 0
    }
  ]);

  const connectedSessions = whatsappSessions.filter(s => s.status === 'connected');
  const totalMessages = whatsappSessions.reduce((sum, s) => sum + s.messagesCount, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Principal</h1>
          <p className="text-gray-600 mt-2">
            Control y gestión de WhatsApp Web con IA avanzada
          </p>
        </div>
        
        <Badge variant="default" className="bg-green-500">
          <Zap className="w-4 h-4 mr-2" />
          WhatsApp Web Activo
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{connectedSessions.length}</div>
            <p className="text-xs text-muted-foreground">WhatsApp Web conectados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes Procesados</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalMessages}</div>
            <p className="text-xs text-muted-foreground">Total procesados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IA Activa</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">3</div>
            <p className="text-xs text-muted-foreground">Servicios de IA</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <p className="text-xs text-muted-foreground">Disponibilidad</p>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Web Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Sesiones WhatsApp Web
          </CardTitle>
          <CardDescription>
            Estado actual de las conexiones WhatsApp Web
          </CardDescription>
        </CardHeader>
        <CardContent>
          {whatsappSessions.length > 0 ? (
            <div className="space-y-4">
              {whatsappSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{session.clientName}</h3>
                      <p className="text-sm text-gray-600">
                        {session.status === 'connected' ? 'Conectado' : 'Desconectado'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.status === 'connected' ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactivo
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Mensajes: {session.messagesCount}</span>
                    <span>
                      {session.lastActivity 
                        ? `Última actividad: ${session.lastActivity.toLocaleString()}`
                        : 'Sin actividad'
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No hay sesiones WhatsApp Web activas</p>
              <Link href="/whatsapp">
                <Button>
                  Conectar WhatsApp Web
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/whatsapp">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-500" />
                Conectar WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Configura tu número WhatsApp Web con código QR
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/chatbots">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Configurar IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Personaliza respuestas automáticas inteligentes
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/analytics">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                Ver Analíticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Revisa métricas y estadísticas de conversaciones
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}