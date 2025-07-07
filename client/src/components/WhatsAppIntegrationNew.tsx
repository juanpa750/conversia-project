import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, QrCode, CheckCircle, XCircle, Copy, Power, PowerOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WhatsAppIntegrationProps {
  chatbotId: number;
  chatbotName: string;
}

export function WhatsAppIntegrationNew({ chatbotId, chatbotName }: WhatsAppIntegrationProps) {
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

  const connectWhatsApp = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setQrCode(null);
    setStatus('waiting_qr');

    try {
      console.log(`Conectando WhatsApp para chatbot ${chatbotId}...`);
      
      const response = await apiRequest('POST', `/api/whatsapp/connect/chatbot/${chatbotId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Respuesta de conexión:', data);
        
        if (data.success) {
          if (data.status === 'connected') {
            setIsConnected(true);
            setStatus('connected');
            setSessionId(data.sessionId);
            toast({
              title: "✅ WhatsApp Conectado",
              description: `${chatbotName} ya está conectado a WhatsApp`,
            });
          } else if (data.qr) {
            setQrCode(data.qr);
            setSessionId(data.sessionId);
            setStatus('waiting_qr');
            toast({
              title: "📱 Código QR Generado",
              description: "Escanea el código QR con WhatsApp",
            });
          }
        }
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error conectando WhatsApp:', error);
      setStatus('error');
      toast({
        title: "❌ Error de Conexión",
        description: "No se pudo conectar WhatsApp. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      const response = await apiRequest('POST', `/api/whatsapp/disconnect/${chatbotId}`);
      
      if (response.ok) {
        setIsConnected(false);
        setQrCode(null);
        setStatus('not_initialized');
        setSessionId(null);
        
        toast({
          title: "🔌 WhatsApp Desconectado",
          description: `${chatbotName} ha sido desconectado de WhatsApp`,
        });
      }
    } catch (error) {
      console.error('Error desconectando WhatsApp:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo desconectar WhatsApp",
        variant: "destructive",
      });
    }
  };

  const copySessionId = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
      toast({
        title: "📋 Copiado",
        description: "ID de sesión copiado al portapapeles",
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
      default: return 'Desconectado';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          WhatsApp Integration
        </CardTitle>
        <CardDescription>
          {chatbotName} - {getStatusText()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estado actual */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado:</span>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Conectado
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-1" />
                Desconectado
              </>
            )}
          </Badge>
        </div>

        {/* ID de sesión */}
        {sessionId && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sesión:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={copySessionId}
              className="text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              {sessionId.substring(0, 12)}...
            </Button>
          </div>
        )}

        {/* Código QR */}
        {qrCode && status === 'waiting_qr' && (
          <div className="space-y-2">
            <div className="text-center">
              <QrCode className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 mb-3">
                Escanea este código QR con WhatsApp
              </p>
            </div>
            <div className="flex justify-center">
              <img 
                src={qrCode} 
                alt="QR Code para WhatsApp" 
                className="max-w-full h-auto border rounded-lg shadow-sm"
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
            </div>
          </div>
        )}

        {/* Instrucciones */}
        {status === 'waiting_qr' && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">
              Instrucciones:
            </h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Abre WhatsApp en tu teléfono</li>
              <li>2. Ve a Configuración → Dispositivos vinculados</li>
              <li>3. Toca "Vincular un dispositivo"</li>
              <li>4. Escanea el código QR de arriba</li>
            </ol>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button
              onClick={connectWhatsApp}
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
              onClick={disconnectWhatsApp}
              variant="outline"
              className="flex-1"
            >
              <PowerOff className="w-4 h-4 mr-2" />
              Desconectar
            </Button>
          )}
          
          <Button
            onClick={checkConnectionStatus}
            variant="outline"
            size="sm"
          >
            🔄
          </Button>
        </div>

        {/* Mensaje de éxito */}
        {isConnected && (
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              ¡WhatsApp conectado exitosamente!
            </p>
            <p className="text-xs text-green-600 mt-1">
              Tu chatbot ya puede recibir y enviar mensajes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}