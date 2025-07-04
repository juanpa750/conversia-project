import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { QrCode, Smartphone, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface WhatsAppSession {
  id: string;
  status: 'disconnected' | 'initializing' | 'qr_ready' | 'connecting' | 'connected';
  phoneNumber?: string;
  qrCode?: string;
  lastActivity?: string;
  connectionTime?: string;
}

interface ConnectionManagerProps {
  sessionId?: string;
  onStatusChange?: (status: string) => void;
}

export function ConnectionManager({ sessionId, onStatusChange }: ConnectionManagerProps) {
  const [isPolling, setIsPolling] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener el estado de la sesión
  const { data: session, isLoading } = useQuery<WhatsAppSession>({
    queryKey: ['/api/whatsapp-web/status', sessionId],
    refetchInterval: isPolling ? 3000 : false,
    retry: false,
  });

  // Mutación para inicializar sesión
  const initSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/whatsapp-web/init-session', { sessionId });
    },
    onSuccess: () => {
      setIsPolling(true);
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-web/status'] });
      toast({
        title: 'Sesión iniciada',
        description: 'Generando código QR para WhatsApp...',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error iniciando sesión de WhatsApp',
        variant: 'destructive',
      });
    },
  });

  // Mutación para desconectar sesión
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/whatsapp-web/disconnect', { sessionId });
    },
    onSuccess: () => {
      setIsPolling(false);
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-web/status'] });
      toast({
        title: 'Desconectado',
        description: 'Sesión de WhatsApp desconectada exitosamente',
      });
    },
  });

  // Efecto para manejar cambios de estado
  useEffect(() => {
    if (session?.status && onStatusChange) {
      onStatusChange(session.status);
    }

    // Detener polling cuando esté conectado
    if (session?.status === 'connected') {
      setIsPolling(false);
    }
  }, [session?.status, onStatusChange]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      disconnected: { color: 'destructive', icon: AlertCircle, text: 'Desconectado' },
      initializing: { color: 'default', icon: RefreshCw, text: 'Inicializando' },
      qr_ready: { color: 'default', icon: QrCode, text: 'Código QR listo' },
      connecting: { color: 'default', icon: RefreshCw, text: 'Conectando' },
      connected: { color: 'default', icon: CheckCircle, text: 'Conectado' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.disconnected;
    const Icon = config.icon;

    return (
      <Badge variant={config.color as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Conexión WhatsApp
        </CardTitle>
        <CardDescription>
          Gestiona la conexión de WhatsApp para este chatbot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="font-medium">Estado:</span>
              {session?.status && getStatusBadge(session.status)}
            </div>

            {session?.phoneNumber && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Número:</span>
                <span className="text-sm text-muted-foreground">{session.phoneNumber}</span>
              </div>
            )}

            {session?.connectionTime && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Conectado desde:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(session.connectionTime).toLocaleString()}
                </span>
              </div>
            )}

            {session?.qrCode && (
              <div className="border rounded-lg p-4 bg-white flex items-center justify-center">
                <img src={session.qrCode} alt="Código QR de WhatsApp" className="max-w-48 max-h-48" />
              </div>
            )}

            {session?.status === 'qr_ready' && (
              <Alert>
                <QrCode className="w-4 h-4" />
                <AlertDescription>
                  Escanea el código QR con WhatsApp desde tu teléfono para conectar la sesión.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {session?.status === 'disconnected' || !session ? (
                <Button
                  onClick={() => initSessionMutation.mutate()}
                  disabled={initSessionMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {initSessionMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <QrCode className="w-4 h-4" />
                  )}
                  Conectar WhatsApp
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {disconnectMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  Desconectar
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-web/status'] })}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}