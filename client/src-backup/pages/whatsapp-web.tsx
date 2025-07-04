import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { 
  RiWhatsappLine, 
  RiCheckLine,
  RiCloseLine,
  RiSettings3Line
} from '@/lib/icons';

interface WhatsAppWebStatus {
  status: 'disconnected' | 'initializing' | 'qr_ready' | 'connecting' | 'connected';
  qrCode?: string;
}

export default function WhatsAppWebPage() {
  const [qrPolling, setQrPolling] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get WhatsApp Web status
  const { data: status, isLoading, refetch } = useQuery<WhatsAppWebStatus>({
    queryKey: ['/api/whatsapp-web/status'],
    refetchInterval: qrPolling ? 3000 : false,
    retry: false,
  });

  // Initialize session mutation
  const initMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/whatsapp-web/init-session', {});
    },
    onSuccess: () => {
      toast({
        title: 'Sesión iniciada',
        description: 'Generando código QR para WhatsApp...',
      });
      setQrPolling(true);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error iniciando sesión de WhatsApp',
        variant: 'destructive',
      });
    },
  });

  // Disconnect session mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/whatsapp-web/disconnect', {});
    },
    onSuccess: () => {
      toast({
        title: 'Desconectado',
        description: 'WhatsApp Web ha sido desconectado',
      });
      setQrPolling(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error desconectando WhatsApp',
        variant: 'destructive',
      });
    },
  });

  // Stop polling when connected
  useEffect(() => {
    if (status?.status === 'connected') {
      setQrPolling(false);
      toast({
        title: '¡Conectado!',
        description: 'WhatsApp Web se ha conectado exitosamente',
      });
    }
  }, [status?.status, toast]);

  const getStatusInfo = () => {
    switch (status?.status) {
      case 'connected':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <RiCheckLine className="w-4 h-4" />,
          text: 'Conectado',
          description: 'WhatsApp Web está activo y funcionando'
        };
      case 'qr_ready':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <RiWhatsappLine className="w-4 h-4" />,
          text: 'Código QR listo',
          description: 'Escanea el código QR con tu WhatsApp'
        };
      case 'connecting':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <RiSettings3Line className="w-4 h-4 animate-spin" />,
          text: 'Conectando...',
          description: 'Estableciendo conexión con WhatsApp'
        };
      case 'initializing':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <RiSettings3Line className="w-4 h-4 animate-spin" />,
          text: 'Inicializando...',
          description: 'Preparando sesión de WhatsApp'
        };
      default:
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <RiCloseLine className="w-4 h-4" />,
          text: 'Desconectado',
          description: 'WhatsApp Web no está conectado'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Web</h1>
        <p className="text-gray-600">
          Conecta tu WhatsApp personal para recibir y responder mensajes con IA automática
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RiWhatsappLine className="text-green-600" />
            <span>Estado de Conexión</span>
          </CardTitle>
          <CardDescription>
            Estado actual de tu sesión de WhatsApp Web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`flex items-center justify-between p-4 border rounded-lg ${statusInfo.color}`}>
            <div className="flex items-center space-x-3">
              {statusInfo.icon}
              <div>
                <p className="font-medium">{statusInfo.text}</p>
                <p className="text-sm opacity-75">{statusInfo.description}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {status?.status === 'connected' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <RiCloseLine className="w-4 h-4 mr-1" />
                  Desconectar
                </Button>
              ) : (
                <Button
                  onClick={() => initMutation.mutate()}
                  disabled={initMutation.isPending || status?.status === 'initializing'}
                  size="sm"
                >
                  <RiWhatsappLine className="w-4 h-4 mr-1" />
                  {initMutation.isPending ? 'Conectando...' : 'Conectar WhatsApp'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RiSettings3Line className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Card */}
      {status?.status === 'qr_ready' && status.qrCode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Escanea el Código QR</CardTitle>
            <CardDescription className="text-center">
              Conecta tu WhatsApp escaneando este código
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-xl border-2 border-green-200 shadow-lg">
                  <QRCode 
                    value={status.qrCode} 
                    size={280}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Instrucciones:</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <p className="text-sm text-gray-700">Abre WhatsApp en tu teléfono</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <p className="text-sm text-gray-700">
                      Ve a <strong>Configuración</strong> → <strong>Dispositivos vinculados</strong>
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <p className="text-sm text-gray-700">
                      Toca <strong>"Vincular un dispositivo"</strong> y escanea este código
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Código QR generado • Esperando escaneo
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected Status */}
      {status?.status === 'connected' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiCheckLine className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">¡WhatsApp Conectado!</h3>
              <p className="text-gray-600 mb-4">
                Tu WhatsApp está conectado y funcionando. Los mensajes serán procesados automáticamente por la IA.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                <RiSettings3Line className="w-4 h-4" />
                <span>Los mensajes entrantes se procesarán automáticamente</span>
              </div>
              
              <div className="flex justify-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                >
                  {disconnectMutation.isPending ? 'Desconectando...' : 'Desconectar WhatsApp'}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/integrations/whatsapp-web/config">
                    <RiSettings3Line className="w-4 h-4 mr-2" />
                    Configuración
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">•</span>
              <p>WhatsApp Web se conecta a tu cuenta personal de WhatsApp</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">•</span>
              <p>Los mensajes entrantes se procesan automáticamente con IA</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">•</span>
              <p>Las respuestas se envían automáticamente según la configuración de tu chatbot</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">•</span>
              <p>Todas las conversaciones se guardan en tu CRM para seguimiento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}