import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  QrCode, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface WhatsAppIntegrationProps {
  chatbotId: string;
  chatbotName: string;
}

interface ConnectionStatus {
  isConnected: boolean;
  qrCode?: string;
  loading?: boolean;
  error?: string;
}

interface Message {
  id: string;
  fromNumber: string;
  toNumber: string;
  messageText: string;
  createdAt: string;
  isIncoming: boolean;
  wasAutoReplied?: boolean;
}

interface Stats {
  totalMessages: number;
  messagesReceived: number;
  messagesSent: number;
  activeContacts: number;
}

const WhatsAppIntegration: React.FC<WhatsAppIntegrationProps> = ({ 
  chatbotId, 
  chatbotName 
}) => {
  const [status, setStatus] = useState<ConnectionStatus>({ 
    isConnected: false, 
    loading: false 
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    messagesReceived: 0,
    messagesSent: 0,
    activeContacts: 0
  });
  const [showQR, setShowQR] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // Función para obtener credenciales (autenticación por cookies)
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      credentials: 'include', // Incluir cookies automáticamente
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });
  };

  // Configurar Server-Sent Events
  useEffect(() => {
    const es = new EventSource(`/api/whatsapp/events/${chatbotId}`, {
      withCredentials: true // Incluir cookies para autenticación
    });

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'qr':
            if (data.chatbotId === chatbotId) {
              setStatus(prev => ({ 
                ...prev, 
                qrCode: data.qr, 
                loading: false 
              }));
              setShowQR(true);
            }
            break;
          case 'connected':
            if (data.chatbotId === chatbotId) {
              setStatus({ isConnected: true, loading: false });
              setShowQR(false);
              loadMessages();
              loadStats();
            }
            break;
          case 'disconnected':
            if (data.chatbotId === chatbotId) {
              setStatus({ isConnected: false, loading: false });
              setShowQR(false);
            }
            break;
          case 'message':
            if (data.message && data.message.chatbotId === chatbotId) {
              setMessages(prev => [...prev, data.message]);
              loadStats();
            }
            break;
          default:
            console.log('Evento SSE no manejado:', data.type);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    es.onerror = (error) => {
      console.error('SSE Error:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: 'Error de conexión en tiempo real' 
      }));
    };

    setEventSource(es);

    return () => {
      if (es) {
        es.close();
      }
    };
  }, [chatbotId]);

  // Cargar estado inicial
  useEffect(() => {
    loadConnectionStatus();
    loadMessages();
    loadStats();
  }, [chatbotId]);

  const loadConnectionStatus = async () => {
    try {
      const response = await makeAuthenticatedRequest(`/api/whatsapp/status/${chatbotId}`);
      
      if (response.ok) {
        const data = await response.json();
        setStatus(prev => ({ ...prev, ...data }));
      } else {
        console.error('Error loading connection status:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading status:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: 'Error cargando estado de conexión' 
      }));
    }
  };

  const loadMessages = async () => {
    try {
      const response = await makeAuthenticatedRequest(`/api/whatsapp/messages/${chatbotId}`);
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.error('Error loading messages:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await makeAuthenticatedRequest(`/api/whatsapp/messages/${chatbotId}`);
      
      if (response.ok) {
        const data = await response.json();
        const messages = data.messages || [];
        
        const uniqueContacts = new Set();
        messages.forEach((m: Message) => {
          if (m.isIncoming) {
            uniqueContacts.add(m.fromNumber);
          } else {
            uniqueContacts.add(m.toNumber);
          }
        });
        
        const newStats = {
          totalMessages: messages.length,
          messagesReceived: messages.filter((m: Message) => m.isIncoming).length,
          messagesSent: messages.filter((m: Message) => !m.isIncoming).length,
          activeContacts: uniqueContacts.size
        };
        
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleConnect = async () => {
    setStatus(prev => ({ 
      ...prev, 
      loading: true, 
      error: undefined 
    }));
    
    try {
      const response = await makeAuthenticatedRequest(`/api/whatsapp/connect/${chatbotId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // La conexión se iniciará, esperamos eventos SSE para QR o conexión directa
          setStatus(prev => ({ ...prev, loading: false }));
        }
      } else {
        const error = await response.json();
        setStatus(prev => ({ 
          ...prev, 
          error: error.message || 'Error conectando', 
          loading: false 
        }));
      }
    } catch (error) {
      console.error('Error connecting:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: 'Error de conexión', 
        loading: false 
      }));
    }
  };

  const handleDisconnect = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await makeAuthenticatedRequest(`/api/whatsapp/disconnect/${chatbotId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setStatus({ isConnected: false, loading: false });
        setShowQR(false);
        setMessages([]);
        setStats({
          totalMessages: 0,
          messagesReceived: 0,
          messagesSent: 0,
          activeContacts: 0
        });
      } else {
        const error = await response.json();
        setStatus(prev => ({ 
          ...prev, 
          error: error.message || 'Error desconectando', 
          loading: false 
        }));
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: 'Error desconectando', 
        loading: false 
      }));
    }
  };

  const handleRefreshQR = async () => {
    if (status.loading) return;
    
    setStatus(prev => ({ ...prev, loading: true }));
    
    // Desconectar primero y luego reconectar
    try {
      await handleDisconnect();
      // Esperar un poco antes de reconectar
      setTimeout(() => {
        handleConnect();
      }, 1000);
    } catch (error) {
      console.error('Error refreshing QR:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: 'Error actualizando QR', 
        loading: false 
      }));
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'Hora inválida';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return (
    <div className="space-y-6">
      {/* Instrucciones de configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Instrucciones de Configuración WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                <p><strong>Haz clic en "Conectar WhatsApp"</strong> para generar el código QR</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                <p><strong>Abre WhatsApp</strong> en tu teléfono móvil</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                <p>Ve a: <strong>Configuración → Dispositivos vinculados → Vincular dispositivo</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                <p><strong>Escanea el código QR</strong> que aparecerá abajo</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">✓</span>
                <p><strong>¡Listo!</strong> Tu chatbot podrá recibir y enviar mensajes automáticamente</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700">
                <strong>Importante:</strong> La conexión es 100% gratuita usando WhatsApp Web. No necesitas API keys ni tokens de Meta/Facebook.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de Conexión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Estado de Conexión - {chatbotName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {status.isConnected ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <Badge variant={status.isConnected ? "default" : "secondary"}>
                  {status.isConnected ? "Conectado" : "Desconectado"}
                </Badge>
              </div>
              
              {status.loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!status.isConnected ? (
                <Button 
                  onClick={handleConnect}
                  disabled={status.loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {status.loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <QrCode className="w-4 h-4 mr-2" />
                  )}
                  Conectar WhatsApp
                </Button>
              ) : (
                <Button 
                  onClick={handleDisconnect}
                  disabled={status.loading}
                  variant="outline"
                >
                  {status.loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Desconectar
                </Button>
              )}
            </div>
          </div>
          
          {status.error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                ❌ <strong>Error:</strong> {status.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Código QR */}
      {showQR && status.qrCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              📱 Escanea el código QR
              <Button
                onClick={handleRefreshQR}
                disabled={status.loading}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Actualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4">
              <p className="text-sm text-green-700 font-medium mb-4">
                ✅ Código QR generado correctamente
              </p>
              <div className="inline-block p-4 bg-white rounded-lg shadow-lg border-2 border-green-200">
                <img 
                  src={status.qrCode} 
                  alt="Código QR WhatsApp" 
                  className="w-64 h-64 mx-auto"
                />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-green-600">
                  Abre WhatsApp → Configuración → Dispositivos vinculados → Vincular dispositivo
                </p>
                <p className="text-xs text-green-500">
                  El código se actualiza automáticamente cada 20 segundos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de carga del QR */}
      {status.loading && !status.qrCode && (
        <Card>
          <CardContent className="text-center p-6">
            <div className="border-2 border-blue-200 rounded-lg bg-blue-50 p-6">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Iniciando WhatsApp Web...</h3>
              <p className="text-sm text-blue-600">
                Por favor espera mientras se genera el código QR
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas de mensajes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="text-center p-4">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <div className="text-sm text-gray-600">Total Mensajes</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="text-center p-4">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{stats.messagesReceived}</div>
            <div className="text-sm text-gray-600">Recibidos</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="text-center p-4">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{stats.messagesSent}</div>
            <div className="text-sm text-gray-600">Enviados</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="text-center p-4">
            <Users className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{stats.activeContacts}</div>
            <div className="text-sm text-gray-600">Contactos Activos</div>
          </CardContent>
        </Card>
      </div>

      {/* Mensajes recientes */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💬 Mensajes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {messages.slice(-5).map((message) => (
                <div 
                  key={message.id} 
                  className={`p-3 rounded-lg ${
                    message.isIncoming 
                      ? 'bg-gray-100 text-left' 
                      : 'bg-blue-100 text-right'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {message.isIncoming ? message.fromNumber : 'Bot'}
                    {message.wasAutoReplied && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Auto-respuesta
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm">{message.messageText}</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(message.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      <Card>
        <CardContent className="bg-gray-50 p-4">
          <h4 className="font-semibold text-gray-800 mb-2">ℹ️ Información Importante</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• La conexión es 100% gratuita usando WhatsApp Web</li>
            <li>• No necesitas API keys ni tokens de Meta/Facebook</li>
            <li>• Tu teléfono debe estar conectado a internet para funcionar</li>
            <li>• Puedes vincular hasta 4 dispositivos por cuenta de WhatsApp</li>
            <li>• Los mensajes se procesan automáticamente con IA avanzada</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppIntegration;