import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Smartphone, QrCode, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface WhatsAppWebIntegrationProps {
  chatbotId: number;
  onConnectionChange?: (connected: boolean) => void;
}

interface SessionStatus {
  connected: boolean;
  status: string;
  phoneNumber?: string;
}

export function WhatsAppWebIntegration({ chatbotId, onConnectionChange }: WhatsAppWebIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    connected: false,
    status: 'not_initialized'
  });
  const [isPolling, setIsPolling] = useState(false);
  const [useRealWhatsApp, setUseRealWhatsApp] = useState(false);
  const { toast } = useToast();

  // Polling para verificar estado de conexión
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const response = await apiRequest('GET', `/api/whatsapp/status/${chatbotId}`);
        if (response.ok) {
          const data = await response.json();
          setSessionStatus({
            connected: data.connected,
            status: data.status,
            phoneNumber: data.phoneNumber
          });
          
          // Si está conectado, detener polling
          if (data.connected) {
            setIsPolling(false);
            setQrCode(null);
            onConnectionChange?.(true);
          }
          
          // Si hay QR code disponible, mostrarlo
          if (data.qrCode && !data.connected) {
            setQrCode(data.qrCode);
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    if (isPolling) {
      pollInterval = setInterval(pollStatus, 2000); // Poll cada 2 segundos
    }

    // Poll inicial
    pollStatus();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [chatbotId, isPolling, qrCode, onConnectionChange]);

  const fetchQRCode = async () => {
    try {
      const response = await apiRequest('GET', `/api/whatsapp/status/${chatbotId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.qrCode) {
          setQrCode(data.qrCode);
        }
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };

  const connectWhatsApp = async () => {
    setIsConnecting(true);
    setQrCode(null);
    
    try {
      const response = await apiRequest('POST', `/api/whatsapp/connect/${chatbotId}`, {});
      
      const result = await response.json();
      
      if (result.success) {
        // Iniciar polling para obtener el QR code y estado
        setIsPolling(true);
        toast({
          title: "Iniciando conexión",
          description: "Generando código QR...",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Error al conectar WhatsApp",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      toast({
        title: "Error",
        description: "Error al conectar con WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      const response = await apiRequest('POST', `/api/whatsapp/disconnect/${chatbotId}`, {});
      const result = await response.json();
      
      if (result.success) {
        setSessionStatus({ connected: false, status: 'disconnected' });
        setQrCode(null);
        setIsPolling(false);
        onConnectionChange?.(false);
        
        toast({
          title: "Desconectado",
          description: "WhatsApp desconectado exitosamente",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Error al desconectar WhatsApp",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      toast({
        title: "Error",
        description: "Error al desconectar WhatsApp",
        variant: "destructive",
      });
    }
  };

  const restartWhatsApp = async () => {
    setIsConnecting(true);
    setQrCode(null);
    
    try {
      const response = await apiRequest('POST', `/api/whatsapp/restart/${chatbotId}`, {});
      const result = await response.json();
      
      if (result.success) {
        if (result.qrCode) {
          setQrCode(result.qrCode);
          setIsPolling(true);
          setSessionStatus({ connected: false, status: 'qr_ready' });
          toast({
            title: "Nuevo código QR",
            description: "Escanea el código QR para conectar",
          });
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al reiniciar WhatsApp",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error restarting WhatsApp:', error);
      toast({
        title: "Error",
        description: "Error al reiniciar WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const checkConnection = async () => {
    try {
      const response = await apiRequest('POST', `/whatsapp/check-connection/${chatbotId}`, {});
      const result = await response.json();
      
      if (result.success) {
        setSessionStatus({ 
          connected: result.connected, 
          status: result.status 
        });
        
        if (result.connected) {
          setQrCode(null);
          setIsPolling(false);
          onConnectionChange?.(true);
          toast({
            title: "¡Conectado!",
            description: "WhatsApp está conectado correctamente",
          });
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const forceConnected = async () => {
    try {
      const response = await apiRequest('POST', `/whatsapp/force-connected/${chatbotId}`, {});
      const result = await response.json();
      
      if (result.success) {
        setSessionStatus({ connected: true, status: 'connected' });
        setQrCode(null);
        setIsPolling(false);
        onConnectionChange?.(true);
        
        toast({
          title: "¡Conectado!",
          description: "WhatsApp marcado como conectado",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Error marcando como conectado",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error forcing connection:', error);
      toast({
        title: "Error",
        description: "Error al marcar como conectado",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    switch (sessionStatus.status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Conectado</Badge>;
      case 'qr_code':
        return <Badge className="bg-yellow-100 text-yellow-800"><QrCode className="w-3 h-3 mr-1" />Esperando QR</Badge>;
      case 'initializing':
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Inicializando</Badge>;
      case 'authenticated':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Autenticado</Badge>;
      case 'disconnected':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Desconectado</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />No inicializado</Badge>;
    }
  };

  return (
    <div className="w-full space-y-4">
        {/* Selector de tipo de WhatsApp */}
        <div className="p-3 border rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tipo de WhatsApp:</span>
            <Button
              onClick={() => setUseRealWhatsApp(!useRealWhatsApp)}
              variant={useRealWhatsApp ? "default" : "outline"}
              size="sm"
            >
              {useRealWhatsApp ? "Real WhatsApp" : "Demo WhatsApp"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {useRealWhatsApp 
              ? "🔴 Modo REAL: Usa whatsapp-web.js para conectar realmente con WhatsApp" 
              : "🟡 Modo DEMO: Simula la conexión de WhatsApp para pruebas"}
          </p>
        </div>

        {/* Estado actual */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado:</span>
          {getStatusBadge()}
        </div>

        {/* Número de teléfono conectado */}
        {sessionStatus.phoneNumber && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Número:</span>
            <span className="text-sm text-muted-foreground">+{sessionStatus.phoneNumber}</span>
          </div>
        )}

        {/* QR Code */}
        {qrCode && (
          <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Escanea este código QR</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Abre WhatsApp en tu teléfono, ve a Configuración → Dispositivos vinculados → Vincular un dispositivo
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <img 
                src={qrCode} 
                alt="QR Code para WhatsApp" 
                className="w-64 h-64 object-contain"
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                El código QR se actualiza automáticamente. No necesitas recargar la página.
              </p>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 flex-wrap">
          {!sessionStatus.connected ? (
            <>
              <Button 
                onClick={connectWhatsApp}
                disabled={isConnecting || isPolling}
                className="flex-1"
              >
                {isConnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isPolling ? 'Esperando conexión...' : 'Conectar WhatsApp'}
              </Button>
              
              {qrCode && (
                <Button 
                  onClick={forceConnected}
                  variant="secondary"
                  className="whitespace-nowrap"
                >
                  Ya escaneé el QR
                </Button>
              )}
            </>
          ) : (
            <>
              <Button 
                onClick={restartWhatsApp}
                disabled={isConnecting}
                className="flex-1"
              >
                {isConnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generar nuevo QR
              </Button>
              <Button 
                onClick={disconnectWhatsApp}
                variant="outline"
                className="flex-1"
              >
                Desconectar WhatsApp
              </Button>
            </>
          )}
          
          <Button 
            onClick={checkConnection}
            variant="ghost"
            size="sm"
            className="whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Verificar
          </Button>
        </div>

        {/* Instrucciones */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Instrucciones:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Haz clic en "Conectar WhatsApp"</li>
            <li>Aparecerá un código QR</li>
            <li>Abre WhatsApp en tu teléfono</li>
            <li>Ve a Configuración → Dispositivos vinculados</li>
            <li>Toca "Vincular un dispositivo"</li>
            <li>Escanea el código QR</li>
            <li>¡Listo! Tu chatbot estará conectado</li>
          </ol>
        </div>
    </div>
  );
}