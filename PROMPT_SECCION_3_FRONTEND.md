# CONVERSIA - SECCIÓN 3: FRONTEND Y COMPONENTES REACT

## CONTINUACIÓN DE LAS SECCIONES 1 Y 2

Esta es la tercera y última parte del código de ConversIA. Implementa las 3 secciones en orden para tener la aplicación completa.

---

## SECCIÓN 3: FRONTEND Y COMPONENTES REACT

### client/src/components/WhatsAppIntegration.tsx (CORREGIDO - ESTE ES EL PROBLEMA)
```tsx
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

function WhatsAppIntegration({ chatbotId, chatbotName }: WhatsAppIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'not_initialized' | 'waiting_qr' | 'connected' | 'error'>('not_initialized');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

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
                "🔄"
              )}
            </Button>
          </div>

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

// EXPORT DEFAULT CORREGIDO - ESTE ERA EL PROBLEMA
export default WhatsAppIntegration;
```

### client/src/App.tsx
```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import Dashboard from "@/pages/Dashboard";
import ChatbotManagement from "@/pages/ChatbotManagement";
import ProductManager from "@/pages/ProductManager";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/register" component={RegisterPage} />
        <Route path="/*" component={LoginPage} />
      </Switch>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/chatbots" component={ChatbotManagement} />
            <Route path="/products" component={ProductManager} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

### client/src/contexts/AuthContext.tsx
```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth-token');
    const storedUser = localStorage.getItem('auth-user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('auth-user', JSON.stringify(data.user));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('auth-user', JSON.stringify(data.user));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### client/src/lib/queryClient.ts
```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest(method: string, path: string, body?: any) {
  const token = localStorage.getItem('auth-token');
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(path, config);
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`${response.status}: ${errorData}`);
  }

  return response;
}
```

### client/src/pages/ChatbotManagement.tsx
```tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Bot, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import WhatsAppIntegration from '@/components/WhatsAppIntegration';

interface Chatbot {
  id: number;
  name: string;
  description: string;
  status: string;
  type: string;
  aiPersonality: string;
  conversationObjective: string;
  whatsappConnected: boolean;
  createdAt: string;
}

export default function ChatbotManagement() {
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: chatbots = [], isLoading } = useQuery({
    queryKey: ['/api/chatbots'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/chatbots');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/chatbots', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
      setIsCreateDialogOpen(false);
      toast({
        title: 'Chatbot creado',
        description: 'El chatbot se ha creado exitosamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo crear el chatbot.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/chatbots/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
      setIsEditDialogOpen(false);
      setSelectedChatbot(null);
      toast({
        title: 'Chatbot actualizado',
        description: 'El chatbot se ha actualizado exitosamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el chatbot.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/chatbots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
      toast({
        title: 'Chatbot eliminado',
        description: 'El chatbot se ha eliminado exitosamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el chatbot.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      type: formData.get('type'),
      aiPersonality: formData.get('aiPersonality'),
      conversationObjective: formData.get('conversationObjective'),
      status: 'active',
    };

    if (selectedChatbot) {
      updateMutation.mutate({ id: selectedChatbot.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (chatbot: Chatbot) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${chatbot.name}"?`)) {
      deleteMutation.mutate(chatbot.id);
    }
  };

  const handleWhatsAppSetup = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    setIsWhatsAppDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Chatbots</h1>
          <p className="text-gray-600">Crea y gestiona tus chatbots de WhatsApp con IA</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Chatbot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Chatbot</DialogTitle>
              <DialogDescription>
                Configura tu nuevo chatbot de WhatsApp con IA
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Chatbot</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" name="description" />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Ventas</SelectItem>
                    <SelectItem value="support">Soporte</SelectItem>
                    <SelectItem value="appointment">Citas</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="aiPersonality">Personalidad de IA</Label>
                <Input 
                  id="aiPersonality" 
                  name="aiPersonality" 
                  placeholder="Ej: Profesional y amigable"
                />
              </div>
              <div>
                <Label htmlFor="conversationObjective">Objetivo de Conversación</Label>
                <Textarea 
                  id="conversationObjective" 
                  name="conversationObjective"
                  placeholder="Ej: Ayudar a los clientes a encontrar productos y generar ventas"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creando...' : 'Crear Chatbot'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {chatbots.map((chatbot: Chatbot) => (
          <Card key={chatbot.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedChatbot(chatbot);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(chatbot)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{chatbot.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <Badge variant={chatbot.status === 'active' ? 'default' : 'secondary'}>
                    {chatbot.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">WhatsApp:</span>
                  <Badge variant={chatbot.whatsappConnected ? 'default' : 'secondary'}>
                    {chatbot.whatsappConnected ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <span className="text-sm capitalize">{chatbot.type}</span>
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleWhatsAppSetup(chatbot)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Chatbot</DialogTitle>
            <DialogDescription>
              Actualiza la configuración de tu chatbot
            </DialogDescription>
          </DialogHeader>
          {selectedChatbot && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nombre del Chatbot</Label>
                <Input 
                  id="edit-name" 
                  name="name" 
                  defaultValue={selectedChatbot.name}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea 
                  id="edit-description" 
                  name="description"
                  defaultValue={selectedChatbot.description}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Tipo</Label>
                <Select name="type" defaultValue={selectedChatbot.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Ventas</SelectItem>
                    <SelectItem value="support">Soporte</SelectItem>
                    <SelectItem value="appointment">Citas</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-aiPersonality">Personalidad de IA</Label>
                <Input 
                  id="edit-aiPersonality" 
                  name="aiPersonality"
                  defaultValue={selectedChatbot.aiPersonality}
                />
              </div>
              <div>
                <Label htmlFor="edit-conversationObjective">Objetivo de Conversación</Label>
                <Textarea 
                  id="edit-conversationObjective" 
                  name="conversationObjective"
                  defaultValue={selectedChatbot.conversationObjective}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedChatbot(null);
                }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* WhatsApp Setup Dialog */}
      <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configuración de WhatsApp</DialogTitle>
            <DialogDescription>
              Conecta {selectedChatbot?.name} a WhatsApp
            </DialogDescription>
          </DialogHeader>
          {selectedChatbot && (
            <WhatsAppIntegration 
              chatbotId={selectedChatbot.id}
              chatbotName={selectedChatbot.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### client/src/pages/Dashboard.tsx
```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, MessageSquare, Users, BarChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/dashboard');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Chatbots',
      value: dashboardData?.totalChatbots || 0,
      description: 'Chatbots creados',
      icon: Bot,
      color: 'text-blue-600',
    },
    {
      title: 'Chatbots Activos',
      value: dashboardData?.activeChatbots || 0,
      description: 'Funcionando actualmente',
      icon: MessageSquare,
      color: 'text-green-600',
    },
    {
      title: 'WhatsApp Conectados',
      value: dashboardData?.connectedWhatsApp || 0,
      description: 'Conexiones activas',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Productos',
      value: dashboardData?.totalProducts || 0,
      description: 'En catálogo',
      icon: BarChart,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-600">
          Resumen general de tu plataforma ConversIA
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas interacciones de tus chatbots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Sin actividad reciente</p>
                  <p className="text-sm text-gray-600">
                    Conecta tus chatbots a WhatsApp para ver la actividad
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas del Mes</CardTitle>
            <CardDescription>
              Resumen de rendimiento mensual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mensajes</span>
                <span className="text-sm font-medium">
                  {dashboardData?.monthlyStats?.messages || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conversaciones</span>
                <span className="text-sm font-medium">
                  {dashboardData?.monthlyStats?.conversations || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Citas</span>
                <span className="text-sm font-medium">
                  {dashboardData?.monthlyStats?.appointments || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## RESUMEN FINAL

### PROBLEMA IDENTIFICADO Y SOLUCIONADO:
El error era en `client/src/components/WhatsAppIntegration.tsx` - faltaba el `export default` al final del archivo.

### ARCHIVOS CORREGIDOS:
1. **WhatsAppIntegration.tsx** - Agregado `export default WhatsAppIntegration;`
2. **App.tsx** - Estructura principal de la aplicación
3. **AuthContext.tsx** - Contexto de autenticación
4. **queryClient.ts** - Cliente API con tokens
5. **ChatbotManagement.tsx** - Gestión de chatbots
6. **Dashboard.tsx** - Panel principal

### INSTRUCCIONES DE IMPLEMENTACIÓN:
1. Implementar **SECCIÓN 1** (Backend y BD)
2. Implementar **SECCIÓN 2** (WhatsApp y IA)  
3. Implementar **SECCIÓN 3** (Frontend React) - **ESTA SECCIÓN SOLUCIONA EL ERROR**

### CREDENCIALES:
- Email: prueba@botmaster.com
- Password: 123456

**EL ERROR DEL EXPORT DEFAULT ESTÁ SOLUCIONADO EN ESTA SECCIÓN 3**