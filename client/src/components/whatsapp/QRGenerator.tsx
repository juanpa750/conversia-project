import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QrCode, RefreshCw, CheckCircle, Smartphone, Clock } from 'lucide-react';

interface QRGeneratorProps {
  chatbotId?: string;
  sessionId?: string;
  onConnectionSuccess?: (data: any) => void;
  onStatusChange?: (status: string) => void;
}

interface QRStatus {
  status: 'disconnected' | 'initializing' | 'qr_ready' | 'connecting' | 'connected';
  qrCode?: string;
  sessionId?: string;
  expiresAt?: string;
  phoneNumber?: string;
  lastUpdate?: string;
}

export function QRGenerator({ chatbotId, sessionId, onConnectionSuccess, onStatusChange }: QRGeneratorProps) {
  const [qrPolling, setQrPolling] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const { toast } = useToast();

  // Obtener estado del QR
  const { data: qrStatus, isLoading, refetch } = useQuery<QRStatus>({
    queryKey: ['/api/whatsapp-web/qr-status', sessionId || chatbotId],
    refetchInterval: qrPolling ? 2000 : false,
    retry: false,
  });

  // Generar nuevo QR
  const generateQRMutation = useMutation({
    mutationFn: async () => {
      const payload = sessionId ? { sessionId } : { chatbotId };
      return await apiRequest('POST', '/api/whatsapp-web/generate-qr', payload);
    },
    onSuccess: (response: any) => {
      setQrPolling(true);
      toast({
        title: 'QR Generado',
        description: 'Código QR listo para escanear',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error generando código QR',
        variant: 'destructive',
      });
    },
  });

  // Refrescar QR
  const refreshQRMutation = useMutation({
    mutationFn: async () => {
      const payload = sessionId ? { sessionId } : { chatbotId };
      return await apiRequest('POST', '/api/whatsapp-web/refresh-qr', payload);
    },
    onSuccess: () => {
      setQrPolling(true);
      refetch();
      toast({
        title: 'QR Actualizado',
        description: 'Nuevo código QR generado',
      });
    },
  });

  // Efecto para countdown de expiración
  useEffect(() => {
    if (qrStatus?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(qrStatus.expiresAt!).getTime();
        const difference = expiry - now;

        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000));
        } else {
          setTimeLeft(0);
          setQrPolling(false);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [qrStatus?.expiresAt]);

  // Efecto para manejar cambios de estado
  useEffect(() => {
    if (qrStatus?.status) {
      onStatusChange?.(qrStatus.status);

      // Detener polling cuando esté conectado
      if (qrStatus.status === 'connected') {
        setQrPolling(false);
        onConnectionSuccess?.(qrStatus);
        toast({
          title: 'Conectado',
          description: `WhatsApp conectado: ${qrStatus.phoneNumber}`,
        });
      }
    }
  }, [qrStatus?.status, qrStatus?.phoneNumber, onConnectionSuccess, onStatusChange]);

  const getStatusInfo = (status: string) => {
    const statusMap = {
      disconnected: {
        color: 'destructive',
        text: 'Desconectado',
        description: 'Genere un código QR para conectar WhatsApp',
      },
      initializing: {
        color: 'default',
        text: 'Inicializando',
        description: 'Preparando la sesión de WhatsApp...',
      },
      qr_ready: {
        color: 'default',
        text: 'QR Listo',
        description: 'Escanee el código QR con su teléfono',
      },
      connecting: {
        color: 'default',
        text: 'Conectando',
        description: 'Estableciendo conexión con WhatsApp...',
      },
      connected: {
        color: 'default',
        text: 'Conectado',
        description: 'WhatsApp conectado exitosamente',
      },
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.disconnected;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const statusInfo = getStatusInfo(qrStatus?.status || 'disconnected');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Código QR WhatsApp
        </CardTitle>
        <CardDescription>
          Conecte su número de WhatsApp escaneando el código QR
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estado actual */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado:</span>
          <Badge variant={statusInfo.color as any}>
            {qrStatus?.status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
            {qrStatus?.status === 'connecting' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
            {statusInfo.text}
          </Badge>
        </div>

        {/* Número conectado */}
        {qrStatus?.phoneNumber && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Número:</span>
            <div className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              <span className="text-sm">{qrStatus.phoneNumber}</span>
            </div>
          </div>
        )}

        {/* Tiempo de expiración */}
        {timeLeft !== null && timeLeft > 0 && qrStatus?.status === 'qr_ready' && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Expira en:</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>
        )}

        {/* Código QR */}
        {qrStatus?.qrCode && qrStatus.status === 'qr_ready' && (
          <div className="border rounded-lg p-4 bg-white flex items-center justify-center">
            <img
              src={qrStatus.qrCode}
              alt="Código QR de WhatsApp"
              className="w-48 h-48 max-w-full"
            />
          </div>
        )}

        {/* Estado de carga */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        )}

        {/* Mensaje de estado */}
        <Alert>
          <AlertDescription>{statusInfo.description}</AlertDescription>
        </Alert>

        {/* QR expirado */}
        {timeLeft === 0 && qrStatus?.status === 'qr_ready' && (
          <Alert variant="destructive">
            <AlertDescription>
              El código QR ha expirado. Genere uno nuevo para continuar.
            </AlertDescription>
          </Alert>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          {(qrStatus?.status === 'disconnected' || !qrStatus?.status) && (
            <Button
              onClick={() => generateQRMutation.mutate()}
              disabled={generateQRMutation.isPending}
              className="flex-1"
            >
              {generateQRMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4 mr-2" />
              )}
              Generar QR
            </Button>
          )}

          {qrStatus?.status === 'qr_ready' && (
            <Button
              variant="outline"
              onClick={() => refreshQRMutation.mutate()}
              disabled={refreshQRMutation.isPending}
              className="flex-1"
            >
              {refreshQRMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Renovar QR
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            size="icon"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}