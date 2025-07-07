import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, MessageSquare, BarChart3, Settings, Target, Phone, X, Plus, ShoppingCart, Calendar, HelpCircle, Users, Info, Bot, Zap, Heart } from 'lucide-react';
import { Link } from 'wouter';
import WhatsAppIntegration from '@/components/WhatsAppIntegration';
import { WhatsAppWebIntegration } from '@/components/WhatsAppWebIntegration';

interface ChatbotEditProps {
  id: string;
}

export default function ChatbotEdit({ id }: ChatbotEditProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'sales',
    status: 'draft',
    productId: null,
    triggerKeywords: [],
    aiInstructions: '',
    aiPersonality: '',
    welcomeMessage: '',
    objective: 'sales',
    conversationObjective: 'sales',
    communicationTone: 'balanced',
    responseLength: 'moderate',
    language: 'spanish',
    successMetrics: 'conversions'
  });

  // Desactivamos auto-save temporalmente para arreglar el problema
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  useEffect(() => {
    // Marcar que hay cambios sin guardar cuando se modifica el form
    if (chatbot && formData.name) {
      setHasUnsavedChanges(true);
    }
  }, [formData]);
  
  const [newKeyword, setNewKeyword] = useState('');
  const [autoSaving, setAutoSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editar');

  // Obtener datos del chatbot
  const { data: chatbot, isLoading } = useQuery({
    queryKey: [`/api/chatbots/${id}`],
    enabled: !!id
  });

  // Obtener productos disponibles
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products']
  });

  // Cargar datos cuando se obtiene el chatbot
  useEffect(() => {
    if (chatbot) {
      // Verificar si la personalidad existe en las opciones, si no, usar "custom"
      const validPersonalities = ['professional', 'friendly', 'expert', 'energetic', 'consultant'];
      const currentPersonality = chatbot.aiPersonality;
      const personalityToUse = validPersonalities.includes(currentPersonality) ? currentPersonality : 'custom';
      
      const loadedData = {
        name: chatbot.name || '',
        description: chatbot.description || '',
        type: chatbot.type || 'sales',
        status: chatbot.status || 'draft',
        productId: chatbot.productId || null,
        triggerKeywords: Array.isArray(chatbot.triggerKeywords) 
          ? chatbot.triggerKeywords 
          : (typeof chatbot.triggerKeywords === 'string' && chatbot.triggerKeywords.length > 0)
            ? JSON.parse(chatbot.triggerKeywords)
            : [],
        aiInstructions: chatbot.aiInstructions || '',
        aiPersonality: personalityToUse,
        welcomeMessage: chatbot.welcomeMessage || '',
        objective: chatbot.objective || 'sales',
        conversationObjective: chatbot.conversationObjective || 'sales',
        communicationTone: chatbot.communicationTone || 'balanced',
        responseLength: chatbot.responseLength || 'moderate',
        language: chatbot.language || 'spanish',
        successMetrics: chatbot.successMetrics || 'conversions'
      };
      
      setFormData(loadedData);
      setHasUnsavedChanges(false); // Marcar como guardado
    }
  }, [chatbot]);

  // Mutación para actualizar chatbot
  const updateChatbot = useMutation({
    mutationFn: async (data: any) => {
      setAutoSaving(true);
      const response = await apiRequest('PUT', `/api/chatbots/${id}`, data);
      if (!response.ok) {
        throw new Error('Error al actualizar chatbot');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAutoSaving(false);
      // Actualizar cache inmediatamente con los datos recibidos
      queryClient.setQueryData([`/api/chatbots/${id}`], data);
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
      
      // Marcar que los cambios están guardados
      setHasUnsavedChanges(false);
      
      // Solo mostrar toast para cambios manuales, no auto-guardado
      if (!autoSaving) {
        toast({
          title: "✅ Cambios guardados",
          description: "Actualización completada exitosamente.",
          duration: 1500,
        });
      }
    },
    onError: () => {
      setAutoSaving(false);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateChatbot.mutate(formData);
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.triggerKeywords.includes(newKeyword.trim())) {
      const newFormData = {
        ...formData,
        triggerKeywords: [...formData.triggerKeywords, newKeyword.trim()]
      };
      setFormData(newFormData);
      updateChatbot.mutate(newFormData, {
        onSuccess: () => {
          // Invalidar caché inmediatamente para reflejar cambios
          queryClient.invalidateQueries({ queryKey: [`/api/chatbots/${id}`] });
          toast({
            title: "Palabra clave agregada",
            description: `"${newKeyword.trim()}" se agregó correctamente`,
          });
        }
      });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    const newFormData = {
      ...formData,
      triggerKeywords: formData.triggerKeywords.filter(k => k !== keyword)
    };
    setFormData(newFormData);
    updateChatbot.mutate(newFormData, {
      onSuccess: () => {
        // Invalidar caché inmediatamente para reflejar cambios
        queryClient.invalidateQueries({ queryKey: [`/api/chatbots/${id}`] });
        toast({
          title: "Palabra clave eliminada",
          description: `"${keyword}" se eliminó correctamente`,
        });
      }
    });
  };

  const objectives = [
    { value: 'sales', label: 'Generar Ventas', icon: ShoppingCart, color: 'text-green-600' },
    { value: 'appointment', label: 'Programar Citas', icon: Calendar, color: 'text-blue-600' },
    { value: 'support', label: 'Brindar Soporte', icon: HelpCircle, color: 'text-purple-600' },
    { value: 'leads', label: 'Capturar Leads', icon: Users, color: 'text-orange-600' },
    { value: 'information', label: 'Dar Información', icon: Info, color: 'text-indigo-600' }
  ];

  const conversationStructures = {
    sales: {
      title: "Estructura de Ventas (AIDA)",
      steps: [
        "Atención - Saludo personalizado y captación de interés",
        "Interés - Descubrimiento de necesidades del cliente", 
        "Deseo - Presentación de beneficios y valor",
        "Acción - Cierre y próximos pasos"
      ]
    },
    appointment: {
      title: "Estructura de Citas",
      steps: [
        "Saludo y identificación del motivo",
        "Consulta de disponibilidad del cliente",
        "Propuesta de horarios disponibles",
        "Confirmación y datos de contacto"
      ]
    },
    support: {
      title: "Estructura de Soporte",
      steps: [
        "Saludo y comprensión del problema",
        "Diagnóstico detallado de la situación",
        "Propuesta de solución paso a paso",
        "Verificación y seguimiento"
      ]
    },
    leads: {
      title: "Estructura de Captura",
      steps: [
        "Saludo y oferta de valor",
        "Calificación del prospecto",
        "Recopilación de datos de contacto",
        "Programación de seguimiento"
      ]
    },
    information: {
      title: "Estructura Informativa",
      steps: [
        "Saludo y identificación de consulta",
        "Búsqueda y presentación de información",
        "Aclaración de dudas adicionales",
        "Derivación si es necesario"
      ]
    }
  };

  const personalityOptions = [
    { value: 'professional', label: '👔 Asistente Profesional', description: 'Rol de ejecutivo empresarial - formal y confiable' },
    { value: 'consultant', label: '🎯 Consultor Estratégico', description: 'Rol de asesor - hace preguntas, analiza y recomienda' },
    { value: 'expert', label: '🔬 Especialista Técnico', description: 'Rol de experto - conocimiento profundo y especializado' },
    { value: 'friendly', label: '🤗 Compañero Amigable', description: 'Rol de amigo cercano - empático y comprensivo' },
    { value: 'energetic', label: '⚡ Motivador Dinámico', description: 'Rol de coach - entusiasta, positivo e inspirador' },
    { value: 'custom', label: '🎭 Personalidad Única', description: 'Rol personalizado según tus instrucciones específicas' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/chatbots">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Chatbot</h1>
            <p className="text-gray-600">{formData.name || 'Chatbot sin nombre'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {autoSaving && (
            <div className="flex items-center text-sm text-blue-600">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              Guardando...
            </div>
          )}
          <Button 
            onClick={handleSave} 
            disabled={updateChatbot.isPending}
            variant={hasUnsavedChanges ? "default" : "outline"}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateChatbot.isPending ? 'Guardando...' : hasUnsavedChanges ? 'Guardar Cambios' : 'Guardado'}
          </Button>
        </div>
      </div>

      {/* Tabs de configuración */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="editar" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Editar</span>
          </TabsTrigger>
          <TabsTrigger value="flujo" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Flujo</span>
          </TabsTrigger>
          <TabsTrigger value="instruccion" className="flex items-center space-x-2">
            <Bot className="h-4 w-4" />
            <span>Instrucción</span>
          </TabsTrigger>
          <TabsTrigger value="objetivo" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Objetivo</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>WhatsApp</span>
          </TabsTrigger>
        </TabsList>

        {/* Pestaña Editar */}
        <TabsContent value="editar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Básica</CardTitle>
              <CardDescription>
                Configura la información fundamental de tu chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Chatbot</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Asistente de Ventas"
                />
                <p className="text-sm text-gray-500 mt-1">
                  💡 Recomendación: Usa un nombre descriptivo como "Asistente Vitaminas", "Bot Citas Médicas" o "Soporte Técnico Pro"
                </p>
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el propósito y funcionalidad de tu chatbot"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  💡 Recomendación: "Chatbot especializado en ventas de suplementos vitamínicos con asesoría personalizada y seguimiento post-venta"
                </p>
              </div>
              

              
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  💡 Recomendación: Usa "Borrador" mientras configuras, "Activo" cuando esté listo para recibir mensajes
                </p>
              </div>

              <div>
                <Label htmlFor="conversationStructure">Estructura de Conversación</Label>
                <Select 
                  value={formData.conversationObjective || 'direct'} 
                  onValueChange={(value) => {
                    const newFormData = { ...formData, conversationObjective: value };
                    setFormData(newFormData);
                    updateChatbot.mutate(newFormData);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la estructura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Directa - Respuestas rápidas y al grano</SelectItem>
                    <SelectItem value="educational">Educativa - Explica beneficios y características</SelectItem>
                    <SelectItem value="consultative">Consultiva - Hace preguntas para entender necesidades</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  💡 Recomendación: "Consultiva" para ventas complejas, "Directa" para información rápida, "Educativa" para productos técnicos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Flujo */}
        <TabsContent value="flujo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estructura de Conversación</CardTitle>
              <CardDescription>
                Define cómo tu chatbot guiará las conversaciones según su objetivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.objective && conversationStructures[formData.objective] && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-600">
                    {conversationStructures[formData.objective].title}
                  </h3>
                  <div className="space-y-3">
                    {conversationStructures[formData.objective].steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      💡 Esta estructura se aplica automáticamente según el objetivo seleccionado. 
                      Tu IA seguirá estos pasos para guiar naturalmente las conversaciones.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Instrucción */}
        <TabsContent value="instruccion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de IA</CardTitle>
              <CardDescription>
                Personaliza la personalidad y comportamiento de tu chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="aiPersonality">Personalidad del Bot</Label>
                <Select 
                  value={formData.aiPersonality || 'professional'} 
                  onValueChange={(value) => {
                    const newFormData = { ...formData, aiPersonality: value };
                    setFormData(newFormData);
                    updateChatbot.mutate(newFormData);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una personalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {personalityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  💡 <strong>Personalidad:</strong> Define el ROL que tendrá tu bot. "Consultor" para ventas, "Especialista" para servicios técnicos, "Profesional" para medicina/legal
                </p>
              </div>

              <div>
                <Label htmlFor="communicationTone">Tono de Comunicación</Label>
                <Select 
                  value={formData.communicationTone || 'balanced'} 
                  onValueChange={(value) => {
                    const newFormData = { ...formData, communicationTone: value };
                    setFormData(newFormData);
                    updateChatbot.mutate(newFormData);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tono de voz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">🎩 Formal y Protocolar</SelectItem>
                    <SelectItem value="friendly">😊 Amigable y Cálido</SelectItem>
                    <SelectItem value="balanced">⚖️ Equilibrado - Profesional pero Cercano</SelectItem>
                    <SelectItem value="casual">🤗 Casual y Conversacional</SelectItem>
                    <SelectItem value="persuasive">🎯 Persuasivo y Convincente</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  💡 <strong>Tono:</strong> Define CÓMO habla tu bot. "Equilibrado" para la mayoría, "Persuasivo" para ventas, "Formal" para medicina/legal, "Casual" para jóvenes
                </p>
              </div>

              <div>
                <Label htmlFor="responseLength">Longitud de Respuestas</Label>
                <Select 
                  value={formData.responseLength || 'moderate'} 
                  onValueChange={(value) => {
                    const newFormData = { ...formData, responseLength: value };
                    setFormData(newFormData);
                    updateChatbot.mutate(newFormData);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la longitud" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Conciso - Respuestas cortas y directas</SelectItem>
                    <SelectItem value="moderate">Moderado - Respuestas balanceadas (Recomendado)</SelectItem>
                    <SelectItem value="detailed">Detallado - Respuestas completas y explicativas</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  💡 Recomendación: "Moderado" para equilibrar información y brevedad
                </p>
              </div>

              <div>
                <Label htmlFor="language">Idioma Principal</Label>
                <Select 
                  value={formData.language || 'spanish'} 
                  onValueChange={(value) => {
                    const newFormData = { ...formData, language: value };
                    setFormData(newFormData);
                    updateChatbot.mutate(newFormData);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spanish">Español</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="portuguese">Português</SelectItem>
                    <SelectItem value="french">Français</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  💡 Recomendación: Selecciona el idioma principal de tus clientes
                </p>
              </div>

              <div>
                <Label htmlFor="successMetrics">Métricas de Éxito</Label>
                <Select 
                  value={formData.successMetrics || 'conversions'} 
                  onValueChange={(value) => {
                    const newFormData = { ...formData, successMetrics: value };
                    setFormData(newFormData);
                    updateChatbot.mutate(newFormData);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la métrica principal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversions">Conversiones/Ventas</SelectItem>
                    <SelectItem value="engagement">Engagement/Interacción</SelectItem>
                    <SelectItem value="satisfaction">Satisfacción del Cliente</SelectItem>
                    <SelectItem value="response_time">Tiempo de Respuesta</SelectItem>
                    <SelectItem value="lead_generation">Generación de Leads</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  💡 Recomendación: Define qué quieres medir para optimizar el rendimiento
                </p>
              </div>

              <div>
                <Label htmlFor="welcomeMessage">Mensaje de Bienvenida</Label>
                <Textarea
                  id="welcomeMessage"
                  value={formData.welcomeMessage}
                  onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                  placeholder="Escribe el primer mensaje que verán tus clientes..."
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  💡 Recomendación: "¡Hola! 👋 Soy tu asistente especializado en [producto/servicio]. ¿En qué puedo ayudarte hoy?"
                </p>
              </div>

              <div>
                <Label htmlFor="aiInstructions">Instrucciones Detalladas para la IA</Label>
                <Textarea
                  id="aiInstructions"
                  value={formData.aiInstructions}
                  onChange={(e) => setFormData({ ...formData, aiInstructions: e.target.value })}
                  placeholder="Describe detalladamente cómo debe comportarse tu chatbot..."
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-1">
                  💡 Recomendación: "Eres un experto en [área]. Siempre pregunta necesidades específicas antes de recomendar. Usa un tono [personalidad] y enfócate en [objetivo principal]."
                </p>
              </div>

              <div>
                <Label htmlFor="productId">Producto/Servicio Principal</Label>
                <Select 
                  value={formData.productId?.toString() || 'none'} 
                  onValueChange={(value) => {
                    const newFormData = { ...formData, productId: value === 'none' ? null : parseInt(value) };
                    setFormData(newFormData);
                    updateChatbot.mutate(newFormData);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin producto específico</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  💡 Recomendación: Selecciona el producto principal que promocionará este chatbot para respuestas más precisas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Objetivo */}
        <TabsContent value="objetivo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Objetivo del Chatbot</CardTitle>
              <CardDescription>
                Define el propósito principal y palabras clave que activarán tu chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Objetivo Principal</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {objectives.map((obj) => {
                    const Icon = obj.icon;
                    return (
                      <div
                        key={obj.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.objective === obj.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          const newFormData = { ...formData, objective: obj.value };
                          setFormData(newFormData);
                          updateChatbot.mutate(newFormData);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-6 w-6 ${obj.color}`} />
                          <span className="font-medium">{obj.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  💡 Recomendación: El objetivo define la estrategia de conversación y las métricas de éxito del chatbot
                </p>
              </div>

              <Separator />

              <div>
                <Label htmlFor="triggerKeywords">Palabras Clave de Activación</Label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Ej: hola, información, precio, comprar..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                    />
                    <Button onClick={handleAddKeyword} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.triggerKeywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="flex items-center space-x-1">
                        <span>{keyword}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleRemoveKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  💡 Recomendación: Agrega palabras que tus clientes usarían: "precio", "información", "comprar", "ayuda", nombres de productos, etc.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integración WhatsApp</CardTitle>
              <CardDescription>
                Conecta tu chatbot con WhatsApp Web para empezar a recibir mensajes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WhatsAppWebIntegration chatbotId={parseInt(id)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}