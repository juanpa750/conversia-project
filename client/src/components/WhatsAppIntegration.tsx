import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, QrCode, CheckCircle, XCircle, Copy, Power, PowerOff, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WhatsAppIntegrationProps {
  chatbotId: number;
  chatbotName: string;
}

export default function WhatsAppIntegration({ chatbotId, chatbotName }: WhatsAppIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'not_initialized' | 'waiting_qr' | 'connected' | 'error'>('not_initialized');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  // Verificar estado al cargar el componente
  useEffect(() => {
    checkConnectionStatus();
  }, [chatbotId]);

  const checkConnectionStatus = async () => {
    try {
      const response = await apiRequest('GET', `/api/whatsapp/status/${chatbotId}`);
      const data = await response.json();
      
      setIsConnected(data.connected);
      setStatus(data.connected ? 'connected' : 'not_initialized');
      setSessionId(data.sessionId || null);
      
      console.log('Estado WhatsApp:', data);
    } catch (error) {
      console.error('Error verificando estado:', error);
      setStatus('error');
    }
  };

  const forceCheckConnection = async () => {
    try {
      setIsConnecting(true);
      const response = await apiRequest('POST', `/api/whatsapp/check-connection/${chatbotId}`);
      const data = await response.json();
      
      if (data.connected) {
        setIsConnected(true);
        setStatus('connected');
        toast({
          title: "WhatsApp Conectado",
          description: "Tu WhatsApp esta conectado y funcionando",
        });
      } else {
        toast({
          title: "WhatsApp No Conectado",
          description: "Escanea el codigo QR para conectar",
          variant: "destructive",
        });
      }
      
      // Actualizar estado general
      await checkConnectionStatus();
    } catch (error) {
      console.error('Error forzando verificacion:', error);
      toast({
        title: "Error",
        description: "No se pudo verificar el estado de conexion",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const forceConnected = async () => {
    try {
      setIsConnecting(true);
      const response = await apiRequest('POST', `/api/whatsapp/force-connected/${chatbotId}`);
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(true);
        setStatus('connected');
        toast({
          title: "Conexion Confirmada",
          description: "WhatsApp marcado como conectado exitosamente",
        });
        await checkConnectionStatus();
      }
    } catch (error) {
      console.error('Error forzando conexion:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar como conectado",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setStatus('waiting_qr');
      setQrCode(null);
      
      const response = await apiRequest('POST', `/api/whatsapp/connect/chatbot/${chatbotId}`);
      const data = await response.json();
      
      if (data.success) {
        if (data.connected) {
          setIsConnected(true);
          setStatus('connected');
          setSessionId(data.sessionId);
          toast({
            title: "WhatsApp Conectado",
            description: `${chatbotName} ya esta conectado a WhatsApp`,
          });
        } else if (data.qr) {
          setQrCode(data.qr);
          setStatus('waiting_qr');
          toast({
            title: "Codigo QR Generado",
            description: "Escanea el codigo QR con tu telefono",
          });
        }
      } else {
        setStatus('error');
        toast({
          title: "Error",
          description: data.message || "Error conectando WhatsApp",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error conectando WhatsApp:', error);
      setStatus('error');
      toast({
        title: "Error de Conexion",
        description: "No se pudo conectar WhatsApp. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await apiRequest('POST', `/api/whatsapp/disconnect/${chatbotId}`);
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(false);
        setStatus('not_initialized');
        setQrCode(null);
        setSessionId(null);
        toast({
          title: "WhatsApp Desconectado",
          description: "El chatbot se ha desconectado de WhatsApp",
        });
      }
    } catch (error) {
      console.error('Error desconectando WhatsApp:', error);
      toast({
        title: "Error",
        description: "No se pudo desconectar WhatsApp",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'waiting_qr': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'waiting_qr': return 'Esperando QR';
      case 'error': return 'Error';
      default: return 'No conectado';
    }
  };

  const copyQRCode = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      toast({
        title: "QR Copiado",
        description: "El codigo QR se copio al portapapeles",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Integracion WhatsApp
              </CardTitle>
              <CardDescription>
                Conecta {chatbotName} a WhatsApp para automatizar respuestas
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {getStatusText()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {sessionId && (
            <div className="text-sm text-gray-600">
              ID de Sesion: {sessionId}
            </div>
          )}

          {/* QR Code */}
          {status === 'waiting_qr' && qrCode && (
            <div className="flex flex-col items-center space-y-3">
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <img
                  src={qrCode}
                  alt="Codigo QR WhatsApp"
                  className="w-64 h-64 object-contain"
                />
              </div>
              <Button
                onClick={copyQRCode}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar QR
              </Button>
            </div>
          )}

          {/* Instrucciones */}
          {status === 'waiting_qr' && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Instrucciones:
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 mb-3">
                <li>1. Abre WhatsApp en tu telefono</li>
                <li>2. Ve a Configuracion - Dispositivos vinculados</li>
                <li>3. Toca "Vincular un dispositivo"</li>
                <li>4. Escanea el codigo QR de arriba</li>
              </ol>
              <div className="border-t pt-3">
                <Button
                  onClick={forceConnected}
                  disabled={isConnecting}
                  size="sm"
                  className="w-full"
                  variant="outline"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Ya escanee el QR - Marcar como conectado"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Botones de accion */}
          <div className="flex gap-2">
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex-1"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    Conectar WhatsApp
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleDisconnect}
                variant="destructive"
                className="flex-1"
              >
                <PowerOff className="w-4 h-4 mr-2" />
                Desconectar
              </Button>
            )}
            
            <Button
              onClick={forceCheckConnection}
              disabled={isConnecting}
              variant="outline"
              size="icon"
              title="Verificar conexion manualmente"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Estado conectado */}
          {isConnected && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">
                  WhatsApp Conectado Exitosamente
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Tu chatbot esta listo para recibir y responder mensajes de WhatsApp automaticamente.
              </p>
            </div>
          )}

          {/* Estado de error */}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">
                  Error de Conexion
                </span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Hubo un problema conectando WhatsApp. Intenta nuevamente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}