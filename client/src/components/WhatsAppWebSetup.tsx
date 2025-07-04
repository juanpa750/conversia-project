import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Smartphone, Wifi, WifiOff, QrCode, MessageCircle, CheckCircle } from 'lucide-react';

interface WhatsAppWebSetupProps {
  chatbotId?: number;
  onConnectionChange?: (connected: boolean) => void;
}

const WhatsAppWebSetup: React.FC<WhatsAppWebSetupProps> = ({ 
  chatbotId, 
  onConnectionChange 
}) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [status, setStatus] = useState<'disconnected' | 'initializing' | 'qr_ready' | 'connecting' | 'connected' | 'error'>('disconnected');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get current connection status
  const { data: statusData } = useQuery({
    queryKey: ['/api/whatsapp-web/status'],
    refetchInterval: 5000, // Check status every 5 seconds
    retry: false
  });

  useEffect(() => {
    if (statusData?.status) {
      setStatus(statusData.status);
      onConnectionChange?.(statusData.status === 'connected');
    }
  }, [statusData, onConnectionChange]);

  // Initialize WhatsApp Web session
  const initSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/whatsapp-web/init-session', { chatbotId });
    },
    onSuccess: (data) => {
      if (data.success && data.qrCode) {
        setQrCode(data.qrCode);
        setStatus('qr_ready');
        toast({
          title: "Código QR Generado",
          description: "Escanea el código QR con tu WhatsApp para conectar.",
          duration: 5000,
        });
      }
    },
    onError: (error: any) => {
      console.error('Error iniciando sesión:', error);
      setStatus('error');
      toast({
        title: "Error de Conexión",
        description: error.message || "No se pudo iniciar la sesión de WhatsApp Web",
        variant: "destructive",
      });
    }
  });

  // Disconnect WhatsApp Web session
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/whatsapp-web/disconnect', {});
    },
    onSuccess: () => {
      setStatus('disconnected');
      setQrCode('');
      toast({
        title: "Desconectado",
        description: "WhatsApp Web ha sido desconectado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo desconectar WhatsApp Web",
        variant: "destructive",
      });
    }
  });

  const handleConnect = () => {
    setStatus('initializing');
    initSessionMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Conectado</Badge>;
      case 'connecting':
      case 'qr_ready':
        return <Badge className="bg-yellow-500 text-white"><QrCode className="w-3 h-3 mr-1" />Esperando QR</Badge>;
      case 'initializing':
        return <Badge className="bg-blue-500 text-white"><Wifi className="w-3 h-3 mr-1" />Iniciando...</Badge>;
      case 'error':
        return <Badge variant="destructive"><WifiOff className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary"><WifiOff className="w-3 h-3 mr-1" />Desconectado</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Smartphone className="h-6 w-6 text-green-500" />
          <CardTitle>WhatsApp Web</CardTitle>
        </div>
        <CardDescription>
          Conecta tu número de WhatsApp para activar la IA
        </CardDescription>
        <div className="flex justify-center mt-2">
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status === 'disconnected' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Para activar la IA en WhatsApp, necesitas conectar tu cuenta usando WhatsApp Web.
            </p>
            <Button 
              onClick={handleConnect}
              disabled={initSessionMutation.isPending}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              {initSessionMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Conectar WhatsApp
                </>
              )}
            </Button>
          </div>
        )}

        {status === 'initializing' && (
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32 w-32 mx-auto"></div>
            </div>
            <p className="text-sm text-gray-600">
              Generando código QR...
            </p>
          </div>
        )}

        {(status === 'qr_ready' || status === 'connecting') && qrCode && (
          <div className="text-center space-y-4">
            <p className="text-sm font-medium">Escanea este código QR con tu WhatsApp:</p>
            <div className="flex justify-center bg-white p-4 rounded-lg border">
              <img 
                src={qrCode} 
                alt="Código QR de WhatsApp" 
                className="w-48 h-48"
              />
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>1.</strong> Abre WhatsApp en tu teléfono</p>
              <p><strong>2.</strong> Ve a Configuración → Dispositivos vinculados</p>
              <p><strong>3.</strong> Toca "Vincular un dispositivo"</p>
              <p><strong>4.</strong> Escanea este código QR</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleConnect}
              disabled={initSessionMutation.isPending}
              size="sm"
            >
              Generar nuevo QR
            </Button>
          </div>
        )}

        {status === 'connected' && (
          <div className="text-center space-y-4">
            <div className="text-green-500 text-4xl mb-4">
              <CheckCircle className="w-16 h-16 mx-auto" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-700 mb-2">¡Conectado!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Tu WhatsApp está conectado. La IA comenzará a responder automáticamente a los mensajes.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
              disabled={disconnectMutation.isPending}
              className="w-full"
            >
              {disconnectMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                  Desconectando...
                </>
              ) : (
                'Desconectar'
              )}
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4">
            <div className="text-red-500 text-4xl mb-4">
              <WifiOff className="w-16 h-16 mx-auto" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">Error de Conexión</h3>
              <p className="text-sm text-gray-600 mb-4">
                No se pudo establecer la conexión con WhatsApp Web. Intenta nuevamente.
              </p>
            </div>
            <Button 
              onClick={handleConnect}
              disabled={initSessionMutation.isPending}
              className="w-full"
            >
              Reintentar Conexión
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppWebSetup;