import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  RiWhatsappLine, 
  RiQrCodeLine, 
  RiCheckLine, 
  RiRobotLine,
  RiUser3Line,
  RiShoppingBagLine,
  RiCalendarLine,
  RiSettings3Line
} from 'react-icons/ri';

export default function WhatsAppUnified() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    businessType: '',
    businessDescription: '',
    adminPhoneNumber: '',
    welcomeMessage: ''
  });

  // Obtener estado de conexión
  const { data: connectionStatus, isLoading } = useQuery({
    queryKey: ['/api/whatsapp-unified/status'],
    refetchInterval: 2000
  });

  // Configurar negocio (Paso 1)
  const setupBusinessMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/whatsapp-unified/setup-business', data);
    },
    onSuccess: () => {
      toast({
        title: "¡Perfecto!",
        description: "Negocio configurado correctamente. Ahora conecte WhatsApp.",
      });
      setCurrentStep(2);
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-unified/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error configurando el negocio",
        variant: "destructive",
      });
    },
  });

  // Conectar WhatsApp (Paso 2)
  const connectWhatsAppMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/whatsapp-unified/connect');
    },
    onSuccess: () => {
      toast({
        title: "Generando QR",
        description: "Escanee el código QR con su WhatsApp",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-unified/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error conectando WhatsApp",
        variant: "destructive",
      });
    },
  });

  // Desconectar WhatsApp
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/whatsapp-unified/disconnect');
    },
    onSuccess: () => {
      toast({
        title: "Desconectado",
        description: "WhatsApp desconectado correctamente",
      });
      setCurrentStep(2);
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-unified/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error desconectando WhatsApp",
        variant: "destructive",
      });
    },
  });

  // Actualizar pasos según estado
  useEffect(() => {
    if (connectionStatus?.success) {
      if (connectionStatus.status === 'not_configured') {
        setCurrentStep(1);
      } else if (connectionStatus.isConnected) {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    }
  }, [connectionStatus]);

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setupBusinessMutation.mutate(businessForm);
  };

  const handleConnectWhatsApp = () => {
    connectWhatsAppMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'pending';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          WhatsApp para tu Negocio
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Solo 3 pasos: Configura → Conecta → ¡Funciona!
        </p>
      </div>

      {/* Indicador de pasos */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                getStepStatus(step) === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : getStepStatus(step) === 'current'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {getStepStatus(step) === 'completed' ? <RiCheckLine /> : step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  getStepStatus(step) === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Paso 1: Configurar Negocio */}
      {currentStep === 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiUser3Line className="w-5 h-5" />
              Paso 1: Configure su Negocio
            </CardTitle>
            <CardDescription>
              Cuéntenos sobre su negocio para personalizar las respuestas automáticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBusinessSubmit} className="space-y-4">
              <div>
                <Label htmlFor="businessName">Nombre del Negocio *</Label>
                <Input
                  id="businessName"
                  value={businessForm.businessName}
                  onChange={(e) => setBusinessForm({...businessForm, businessName: e.target.value})}
                  placeholder="Ej: Restaurante El Buen Sabor"
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessType">Tipo de Negocio *</Label>
                <Select 
                  value={businessForm.businessType}
                  onValueChange={(value) => setBusinessForm({...businessForm, businessType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo de negocio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="products">
                      <div className="flex items-center gap-2">
                        <RiShoppingBagLine className="w-4 h-4" />
                        Vendo Productos
                      </div>
                    </SelectItem>
                    <SelectItem value="services">
                      <div className="flex items-center gap-2">
                        <RiCalendarLine className="w-4 h-4" />
                        Ofrezco Servicios/Citas
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="businessDescription">Descripción del Negocio</Label>
                <Textarea
                  id="businessDescription"
                  value={businessForm.businessDescription}
                  onChange={(e) => setBusinessForm({...businessForm, businessDescription: e.target.value})}
                  placeholder="Describa qué hace su negocio, productos/servicios que ofrece..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="adminPhoneNumber">WhatsApp Administrativo (Opcional)</Label>
                <Input
                  id="adminPhoneNumber"
                  value={businessForm.adminPhoneNumber}
                  onChange={(e) => setBusinessForm({...businessForm, adminPhoneNumber: e.target.value})}
                  placeholder="Ej: +57 300 123 4567"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {businessForm.businessType === 'products' 
                    ? 'Aquí recibirá notificaciones de ventas'
                    : 'Aquí recibirá notificaciones de citas agendadas'
                  }
                </p>
              </div>

              <div>
                <Label htmlFor="welcomeMessage">Mensaje de Bienvenida</Label>
                <Textarea
                  id="welcomeMessage"
                  value={businessForm.welcomeMessage}
                  onChange={(e) => setBusinessForm({...businessForm, welcomeMessage: e.target.value})}
                  placeholder={`¡Hola! Bienvenido a ${businessForm.businessName || 'nuestro negocio'}. ¿En qué puedo ayudarte?`}
                  rows={2}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={setupBusinessMutation.isPending || !businessForm.businessName || !businessForm.businessType}
              >
                {setupBusinessMutation.isPending ? 'Configurando...' : 'Continuar →'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Paso 2: Conectar WhatsApp */}
      {currentStep === 2 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiWhatsappLine className="w-5 h-5 text-green-500" />
              Paso 2: Conectar WhatsApp
            </CardTitle>
            <CardDescription>
              Escanee el código QR con su WhatsApp Business para conectar
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {!connectionStatus?.qrCode ? (
              <div className="space-y-4">
                <RiQrCodeLine className="w-16 h-16 mx-auto text-gray-400" />
                <p className="text-gray-600">Haga clic para generar el código QR</p>
                <Button 
                  onClick={handleConnectWhatsApp}
                  disabled={connectWhatsAppMutation.isPending}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {connectWhatsAppMutation.isPending ? 'Generando...' : 'Generar Código QR'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">
                  Escanee este código con su WhatsApp Business
                </p>
                <div className="flex justify-center">
                  <img 
                    src={connectionStatus.qrCode} 
                    alt="Código QR WhatsApp" 
                    className="w-64 h-64 border rounded-lg"
                  />
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>1. Abra WhatsApp Business en su teléfono</p>
                  <p>2. Toque Menú → Dispositivos vinculados</p>
                  <p>3. Toque "Vincular un dispositivo"</p>
                  <p>4. Escanee este código QR</p>
                </div>
                <Button 
                  onClick={handleConnectWhatsApp}
                  variant="outline"
                  size="sm"
                >
                  Generar Nuevo QR
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Paso 3: ¡Funcionando! */}
      {currentStep === 3 && connectionStatus?.isConnected && (
        <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <RiCheckLine className="w-5 h-5" />
              ¡WhatsApp Conectado y Funcionando!
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Su chatbot ya está respondiendo mensajes automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <RiRobotLine className="w-4 h-4" />
                  Estado del Chatbot
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Negocio:</span>
                    <Badge variant="secondary">{connectionStatus.businessName}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tipo:</span>
                    <Badge variant="outline">
                      {connectionStatus.businessType === 'products' ? 'Productos' : 'Servicios'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mensajes enviados:</span>
                    <Badge variant="default">{connectionStatus.messagesSent || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mensajes recibidos:</span>
                    <Badge variant="default">{connectionStatus.messagesReceived || 0}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <RiSettings3Line className="w-4 h-4" />
                  Acciones
                </h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/whatsapp-unified/products'}
                  >
                    {connectionStatus.businessType === 'products' ? 'Gestionar Productos' : 'Gestionar Servicios'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/whatsapp-unified/messages'}
                  >
                    Ver Conversaciones
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/whatsapp-unified/config'}
                  >
                    Configurar Respuestas
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={handleDisconnect}
                    disabled={disconnectMutation.isPending}
                  >
                    {disconnectMutation.isPending ? 'Desconectando...' : 'Desconectar WhatsApp'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información del proceso */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Proceso Simplificado de 3 Pasos
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p><strong>Paso 1:</strong> Configure la información básica de su negocio</p>
            <p><strong>Paso 2:</strong> Conecte su WhatsApp Business escaneando el QR</p>
            <p><strong>Paso 3:</strong> ¡Listo! Su chatbot ya responde automáticamente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}