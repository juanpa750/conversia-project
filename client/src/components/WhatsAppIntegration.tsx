// WhatsAppIntegration.tsx - Componente para integrar WhatsApp
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Wifi, WifiOff, QrCode, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";

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
  createdAt: Date;
  isIncoming: boolean;
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
  const [status, setStatus] = useState<ConnectionStatus>({ isConnected: false });
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    messagesReceived: 0,
    messagesSent: 0,
    activeContacts: 0
  });
  const [showQR, setShowQR] = useState(false);

  // Configurar Server-Sent Events
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!userId || !token) return;

    const eventSource = new EventSource(`/api/whatsapp/events/${userId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'qr':
          if (data.chatbotId === chatbotId) {
            setStatus(prev => ({ ...prev, qrCode: data.qr, loading: false }));
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
          if (data.message.chatbotId === chatbotId) {
            setMessages(prev => [...prev, data.message]);
            loadStats();
          }
          break;
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      setStatus(prev => ({ ...prev, error: 'Error de conexión en tiempo real' }));
    };

    return () => {
      eventSource.close();
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
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/whatsapp/status/${chatbotId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error loading status:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/whatsapp/messages/${chatbotId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/whatsapp/messages/${chatbotId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const messages = data.messages || [];
        
        const stats = {
          totalMessages: messages.length,
          messagesReceived: messages.filter((m: Message) => m.isIncoming).length,
          messagesSent: messages.filter((m: Message) => !m.isIncoming).length,
          activeContacts: new Set(messages.map((m: Message) => m.isIncoming ? m.fromNumber : m.toNumber)).size
        };
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleConnect = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/whatsapp/connect/${chatbotId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'connected') {
          setStatus({ isConnected: true, loading: false });
          loadMessages();
          loadStats();
        } else if (data.status === 'waiting_qr') {
          setStatus({ isConnected: false, qrCode: data.qr, loading: false });
          setShowQR(true);
        }
      } else {
        const error = await response.json();
        setStatus(prev => ({ ...prev, error: error.error || 'Error conectando', loading: false }));
      }
    } catch (error) {
      console.error('Error connecting:', error);
      setStatus(prev => ({ ...prev, error: 'Error de conexión', loading: false }));
    }
  };

  const handleDisconnect = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/whatsapp/disconnect/${chatbotId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setStatus({ isConnected: false, loading: false });
        setShowQR(false);
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      setStatus(prev => ({ ...prev, error: 'Error desconectando', loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Integración WhatsApp - {chatbotName}
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
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
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
                  <QrCode className="w-4 h-4 mr-2" />
                  Conectar WhatsApp
                </Button>
              ) : (
                <Button 
                  onClick={handleDisconnect}
                  disabled={status.loading}
                  variant="outline"
                >
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
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Abre WhatsApp en tu teléfono, ve a <strong>Dispositivos vinculados</strong> y escanea este código QR
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
              {messages.slice(-5).map((message) => (
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
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppIntegration;