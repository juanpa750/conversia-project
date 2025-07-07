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
    conversationObjective: 'sales'
  });
  
  const [newKeyword, setNewKeyword] = useState('');
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
      
      setFormData({
        name: chatbot.name || '',
        description: chatbot.description || '',
        type: chatbot.type || 'sales',
        status: chatbot.status || 'draft',
        productId: chatbot.productId || null,
        triggerKeywords: Array.isArray(chatbot.triggerKeywords) ? chatbot.triggerKeywords : [],
        aiInstructions: chatbot.aiInstructions || '',
        aiPersonality: personalityToUse,
        welcomeMessage: chatbot.welcomeMessage || '',
        objective: chatbot.objective || 'sales',
        conversationObjective: chatbot.conversationObjective || 'sales'
      });
    }
  }, [chatbot]);

  // Mutación para actualizar chatbot
  const updateChatbot = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/chatbots/${id}`, data);
      if (!response.ok) {
        throw new Error('Error al actualizar chatbot');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chatbots/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
      toast({
        title: "Chatbot actualizado",
        description: "Los cambios se han guardado exitosamente.",
      });
    },
    onError: () => {
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
      setFormData({
        ...formData,
        triggerKeywords: [...formData.triggerKeywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      triggerKeywords: formData.triggerKeywords.filter(k => k !== keyword)
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
    { value: 'professional', label: 'Profesional y Formal', description: 'Tono empresarial, serio y confiable' },
    { value: 'friendly', label: 'Amigable y Cercano', description: 'Conversacional, cálido y empático' },
    { value: 'expert', label: 'Experto Técnico', description: 'Conocimiento especializado y detallado' },
    { value: 'energetic', label: 'Enérgico y Motivador', description: 'Entusiasta, positivo y dinámico' },
    { value: 'consultant', label: 'Consultor Estratégico', description: 'Hace preguntas, analiza y recomienda' },
    { value: 'custom', label: 'Personalidad Personalizada', description: 'Configuración específica según instrucciones' }
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
        <Button onClick={handleSave} disabled={updateChatbot.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateChatbot.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
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
                <Label htmlFor="type">Tipo de Chatbot</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
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
                <p className="text-sm text-gray-500 mt-1">
                  💡 Recomendación: "Ventas" para productos/servicios, "Citas" para consultas médicas/legales, "Soporte" para atención cliente
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
                  onValueChange={(value) => setFormData({ ...formData, conversationObjective: value })}
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
                  onValueChange={(value) => setFormData({ ...formData, aiPersonality: value })}
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
                  💡 Recomendación: "Consultor Estratégico" para ventas, "Profesional y Formal" para servicios médicos/legales
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
                  value={formData.productId?.toString() || ''} 
                  onValueChange={(value) => setFormData({ ...formData, productId: value ? parseInt(value) : null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin producto específico</SelectItem>
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
                        onClick={() => setFormData({ ...formData, objective: obj.value })}
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
              <WhatsAppIntegration chatbotId={parseInt(id)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}