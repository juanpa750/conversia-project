import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RiQrCodeLine, RiRefreshLine, RiCheckboxCircleLine } from 'react-icons/ri';

interface WhatsAppQRComponentProps {
  chatbotId?: string;
  onConnectionSuccess?: (integrationId: number) => void;
}

interface WhatsAppStatus {
  status: 'disconnected' | 'initializing' | 'qr_ready' | 'connecting' | 'connected';
  qrCode?: string;
  sessionId?: string;
  isSimulated?: boolean;
}

export function WhatsAppQRComponent({ chatbotId, onConnectionSuccess }: WhatsAppQRComponentProps) {
  const [qrPolling, setQrPolling] = useState(false);
  const [integrationId, setIntegrationId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get WhatsApp Web status
  const { data: status, isLoading, refetch } = useQuery<WhatsAppStatus>({
    queryKey: ['/api/whatsapp-web/status'],
    refetchInterval: qrPolling ? 3000 : false,
    retry: false,
  });

  // Initialize session mutation
  const initMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/whatsapp-web/init-session', {});
    },
    onSuccess: (response: any) => {
      toast({
        title: 'Sesión iniciada',
        description: 'Generando código QR para WhatsApp...',
      });
      setQrPolling(true);
      refetch();
      
      if (response.sessionId) {
        // Create integration record
        createIntegrationMutation.mutate({
          sessionId: response.sessionId,
          chatbotId
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error iniciando sesión de WhatsApp',
        variant: 'destructive',
      });
    },
  });

  // Create integration mutation
  const createIntegrationMutation = useMutation({
    mutationFn: async (data: { sessionId: string; chatbotId?: string }) => {
      return await apiRequest('POST', '/api/whatsapp/integrations', {
        sessionId: data.sessionId,
        chatbotId: data.chatbotId
      });
    },
    onSuccess: (response: any) => {
      setIntegrationId(response.id);
      console.log('✅ Integration created:', response);
    },
    onError: (error: any) => {
      console.error('❌ Error creating integration:', error);
    },
  });

  // Monitor status changes
  useEffect(() => {
    if (status?.status === 'connected' && integrationId) {
      setQrPolling(false);
      toast({
        title: '¡WhatsApp conectado!',
        description: 'Tu número de WhatsApp está ahora conectado y listo para usar.',
      });
      
      // Call success callback
      if (onConnectionSuccess) {
        onConnectionSuccess(integrationId);
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/integrations'] });
    }
  }, [status?.status, integrationId, onConnectionSuccess, toast, queryClient]);

  const handleInitialize = () => {
    initMutation.mutate();
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Information */}
      {status?.isSimulated && (
        <Alert className="bg-orange-50 border-orange-200">
          <RiQrCodeLine className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Modo Demo:</strong> Este es un simulador para demostración. 
            En producción se conectará a WhatsApp real.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            status?.status === 'connected' ? 'bg-green-500' : 
            status?.status === 'connecting' ? 'bg-yellow-500' : 
            status?.status === 'qr_ready' ? 'bg-blue-500' : 
            'bg-gray-400'
          }`}></div>
          <span className="text-sm font-medium">
            {status?.status === 'connected' ? 'Conectado' :
             status?.status === 'connecting' ? 'Conectando...' :
             status?.status === 'qr_ready' ? 'Listo para escanear' :
             status?.status === 'initializing' ? 'Iniciando...' :
             'Desconectado'}
          </span>
        </div>
        
        {status?.status === 'qr_ready' && (
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RiRefreshLine className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
        )}
      </div>

      {/* QR Code Display */}
      {status?.status === 'qr_ready' && status.qrCode ? (
        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
          <div className="mb-3">
            <Badge variant="secondary" className="mb-2">
              Código QR Activo
            </Badge>
            <p className="text-sm text-gray-600 mb-3">
              Escanea este código con WhatsApp en tu teléfono
            </p>
          </div>
          
          <div className="flex justify-center mb-3">
            <img 
              src={status.qrCode} 
              alt="WhatsApp QR Code" 
              className="max-w-[200px] h-auto border border-gray-200 rounded"
            />
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>1. Abre WhatsApp en tu teléfono</p>
            <p>2. Ve a Configuración {'>'} Dispositivos vinculados</p>
            <p>3. Toca "Vincular un dispositivo"</p>
            <p>4. Escanea este código QR</p>
          </div>
        </div>
      ) : status?.status === 'connected' ? (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
          <RiCheckboxCircleLine className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="font-medium text-green-800">¡WhatsApp Conectado!</p>
          <p className="text-sm text-green-600">
            Tu número está listo para recibir y responder mensajes automáticamente
          </p>
        </div>
      ) : status?.status === 'connecting' ? (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600 mx-auto mb-2"></div>
          <p className="font-medium text-yellow-800">Conectando...</p>
          <p className="text-sm text-yellow-600">
            Procesando la conexión con WhatsApp
          </p>
        </div>
      ) : (
        <div className="text-center">
          <Button 
            onClick={handleInitialize} 
            disabled={initMutation.isPending}
            className="w-full"
          >
            <RiQrCodeLine className="h-4 w-4 mr-2" />
            {initMutation.isPending ? 'Iniciando...' : 'Generar Código QR'}
          </Button>
          
          <p className="text-xs text-gray-500 mt-2">
            Haz clic para generar un código QR y conectar tu WhatsApp
          </p>
        </div>
      )}
    </div>
  );
}