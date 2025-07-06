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

  // Función para obtener userId del usuario autenticado
  const getAuthData = () => {
    // El sistema usa cookies para autenticación, no necesitamos token manual
    const userId = localStorage.getItem('userId');
    return { userId };
  };

  // Configurar Server-Sent Events
  useEffect(() => {
    const { userId } = getAuthData();
    
    if (!userId) {
      console.warn('No se encontró userId');
      return;
    }

    const es = new EventSource(`/api/whatsapp/events/${userId}`, {
      // Note: EventSource no soporta headers personalizados nativamente
      // Se podría usar un query parameter para el token si fuera necesario
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
      const response = await fetch(`/api/whatsapp/status/${chatbotId}`, {
        credentials: 'include', // Para incluir cookies de autenticación
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
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
      const response = await fetch(`/api/whatsapp/messages/${chatbotId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
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
      const response = await fetch(`/api/whatsapp/messages/${chatbotId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
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
      const response = await fetch(`/api/whatsapp/connect/${chatbotId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'connected') {
          setStatus({ isConnected: true, loading: false });
          setShowQR(false);
          loadMessages();
          loadStats();
        } else if (data.status === 'waiting_qr') {
          setStatus({ 
            isConnected: false, 
            qrCode: data.qr, 
            loading: false 
          });
          setShowQR(true);
        }
      } else {
        const error = await response.json();
        setStatus(prev => ({ 
          ...prev, 
          error: error.error || 'Error conectando', 
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
      const response = await fetch(`/api/whatsapp/disconnect/${chatbotId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
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
          error: error.error || 'Error desconectando', 
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

      {/* Header */}
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
            <Alert className="mt-4">
              <AlertDescription>{status.error}</AlertDescription>
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
              Escanea el código QR
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
              <p className="text-sm text-gray-600 mb-4">
                Abre WhatsApp en tu teléfono, ve a{' '}
                <strong>Dispositivos vinculados</strong> y escanea este código QR
              </p>
              <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
                <img 
                  src={status.qrCode} 
                  alt="QR Code" 
                  className="w-64 h-64 mx-auto"
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• El código QR se actualiza automáticamente cada 30 segundos</p>
              <p>• Una vez conectado, podrás recibir y enviar mensajes automáticamente</p>
              <p>• La conexión se mantiene activa las 24 horas</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      {status.isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Mensajes</p>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Recibidos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.messagesReceived}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Enviados</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.messagesSent}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Contactos</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.activeContacts}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mensajes Recientes */}
      {status.isConnected && messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Mensajes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {messages.slice(-10).map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.isIncoming ? 'justify-start' : 'justify-end'}`}
                >
                  <div 
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.isIncoming 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.messageText}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs opacity-75">
                        {formatDate(message.createdAt)}
                      </p>
                      {message.wasAutoReplied && (
                        <span className="text-xs bg-green-100 text-green-800 px-1 rounded ml-2">
                          IA
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado sin mensajes */}
      {status.isConnected && messages.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No hay mensajes aún. Los mensajes aparecerán aquí cuando lleguen.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppIntegration;