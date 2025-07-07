import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Save, 
  Bot, 
  Workflow, 
  MessageCircle, 
  Target, 
  Smartphone,
  Settings,
  Zap,
  Brain,
  ShoppingCart,
  Calendar,
  HelpCircle,
  Users,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from 'wouter';
import WhatsAppIntegration from '@/components/WhatsAppIntegration';

export default function ChatbotEdit() {
  const params = useParams();
  const chatbotId = parseInt(params.id as string);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estado local para todos los campos
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    aiInstructions: '',
    aiPersonality: '',
    welcomeMessage: '',
    objective: 'sales',
    conversationObjective: '',
    productId: null as number | null,
    triggerKeywords: [] as string[],
    whatsappNumber: ''
  });

  const [newKeyword, setNewKeyword] = useState('');

  // Cargar datos del chatbot
  const { data: chatbot, isLoading } = useQuery({
    queryKey: [`/api/chatbots/${chatbotId}`],
    onSuccess: (data) => {
      setFormData({
        name: data.name || '',
        description: data.description || '',
        aiInstructions: data.aiInstructions || '',
        aiPersonality: data.aiPersonality || '',
        welcomeMessage: data.welcomeMessage || '',
        objective: data.objective || 'sales',
        conversationObjective: data.conversationObjective || '',
        productId: data.productId || null,
        triggerKeywords: data.triggerKeywords || [],
        whatsappNumber: data.whatsappNumber || ''
      });
    }
  });

  // Cargar productos disponibles
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products']
  });

  // Cargar información del producto seleccionado
  const { data: selectedProduct } = useQuery({
    queryKey: [`/api/products/${formData.productId}`],
    enabled: !!formData.productId
  });

  // Mutación para guardar cambios
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', `/api/chatbots/${chatbotId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chatbots/${chatbotId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado exitosamente."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudieron guardar los cambios.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
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
        "Provisión de información relevante",
        "Clarificación de dudas adicionales",
        "Oferta de recursos complementarios"
      ]
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/chatbots")}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configuración del Chatbot
            </h1>
            <p className="text-sm text-gray-500">
              {chatbot?.name || `Chatbot ${chatbotId}`}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center space-x-2"
        >
          {saveMutation.isPending ? (
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Guardar Cambios</span>
        </Button>
      </div>

      {/* Tabs de configuración */}
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="edit" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Editar</span>
          </TabsTrigger>
          <TabsTrigger value="flow" className="flex items-center space-x-2">
            <Workflow className="w-4 h-4" />
            <span>Flujo</span>
          </TabsTrigger>
          <TabsTrigger value="instructions" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Instrucción</span>
          </TabsTrigger>
          <TabsTrigger value="objective" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Objetivo</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4" />
            <span>WhatsApp</span>
          </TabsTrigger>
        </TabsList>

        {/* Pestaña Editar */}
        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Configura la información fundamental del chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Chatbot</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Asistente de Ventas María"
                  />
                </div>
                <div>
                  <Label htmlFor="objective-select">Objetivo Principal</Label>
                  <Select 
                    value={formData.objective} 
                    onValueChange={(value) => setFormData({ ...formData, objective: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {objectives.map((obj) => (
                        <SelectItem key={obj.value} value={obj.value}>
                          <div className="flex items-center space-x-2">
                            <obj.icon className={`w-4 h-4 ${obj.color}`} />
                            <span>{obj.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe brevemente las funciones del chatbot"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Selección de Producto */}
          <Card>
            <CardHeader>
              <CardTitle>Producto Vinculado</CardTitle>
              <CardDescription>
                Selecciona el producto que este chatbot va a promocionar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product">Producto</Label>
                  <Select 
                    value={formData.productId?.toString() || ""} 
                    onValueChange={(value) => setFormData({ ...formData, productId: value ? parseInt(value) : null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product: any) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProduct && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Información del Producto Seleccionado:
                      </h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>Nombre:</strong> {selectedProduct.name}</p>
                        <p><strong>Precio:</strong> ${selectedProduct.price}</p>
                        <p><strong>Categoría:</strong> {selectedProduct.category}</p>
                        <p><strong>Descripción:</strong> {selectedProduct.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Flujo */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Flujo de Conversación Recomendado</CardTitle>
              <CardDescription>
                Flujo ideal para {objectives.find(o => o.value === formData.objective)?.label.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">
                    {conversationStructures[formData.objective as keyof typeof conversationStructures]?.title}
                  </h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {conversationStructures[formData.objective as keyof typeof conversationStructures]?.steps.map((step, index) => (
                      <li key={index} className="text-blue-800">{step}</li>
                    ))}
                  </ol>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Nota</h4>
                  <p className="text-yellow-800 text-sm">
                    Este flujo está optimizado por IA y se adapta automáticamente según las respuestas del cliente.
                    Tu chatbot seguirá esta estructura de manera inteligente para maximizar los resultados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Instrucciones */}
        <TabsContent value="instructions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la IA</CardTitle>
              <CardDescription>
                Define la personalidad y comportamiento de tu chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="welcomeMessage">Mensaje de Bienvenida</Label>
                <Textarea
                  id="welcomeMessage"
                  value={formData.welcomeMessage}
                  onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                  placeholder="¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este mensaje se enviará automáticamente cuando alguien inicie una conversación
                </p>
              </div>

              <div>
                <Label htmlFor="aiPersonality">Personalidad de la IA</Label>
                <Input
                  id="aiPersonality"
                  value={formData.aiPersonality}
                  onChange={(e) => setFormData({ ...formData, aiPersonality: e.target.value })}
                  placeholder="Ej: Amigable, profesional y orientado a resultados"
                />
              </div>

              <div>
                <Label htmlFor="aiInstructions">Instrucciones Específicas</Label>
                <Textarea
                  id="aiInstructions"
                  value={formData.aiInstructions}
                  onChange={(e) => setFormData({ ...formData, aiInstructions: e.target.value })}
                  placeholder="Eres un experto en ventas. Tu objetivo es ayudar a los clientes a encontrar el producto perfecto..."
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Define cómo debe comportarse la IA, qué información debe priorizar y cómo debe interactuar
                </p>
              </div>

              <div>
                <Label htmlFor="conversationObjective">Objetivo de Conversación</Label>
                <Input
                  id="conversationObjective"
                  value={formData.conversationObjective}
                  onChange={(e) => setFormData({ ...formData, conversationObjective: e.target.value })}
                  placeholder="Convertir visitantes en clientes usando metodología AIDA"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Objetivo */}
        <TabsContent value="objective" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Objetivo del Chatbot</CardTitle>
              <CardDescription>
                Define el propósito principal y las palabras que activarán el chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Selecciona el Objetivo Principal</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {objectives.map((obj) => (
                    <Card 
                      key={obj.value}
                      className={`cursor-pointer transition-all ${
                        formData.objective === obj.value 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setFormData({ ...formData, objective: obj.value })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <obj.icon className={`w-6 h-6 ${obj.color}`} />
                          <span className="font-medium">{obj.label}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label>Palabras Disparadoras</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Define las palabras o frases que activarán automáticamente el chatbot para responder
                </p>
                
                <div className="flex space-x-2 mb-3">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Agregar palabra clave..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                  <Button onClick={handleAddKeyword} variant="outline">
                    <Zap className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.triggerKeywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="flex items-center space-x-1">
                      <span>{keyword}</span>
                      <button 
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>

                {formData.triggerKeywords.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-2">
                    ⚠️ Sin palabras disparadoras configuradas. El chatbot no se activará automáticamente.
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <Label>Estructura de Conversación</Label>
                <Card className="mt-3 bg-gray-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">
                      {conversationStructures[formData.objective as keyof typeof conversationStructures]?.title}
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      {conversationStructures[formData.objective as keyof typeof conversationStructures]?.steps.map((step, index) => (
                        <li key={index} className="text-gray-700">{step}</li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-6">
          <WhatsAppIntegration 
            chatbotId={chatbotId} 
            chatbotName={formData.name || 'Chatbot'} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}