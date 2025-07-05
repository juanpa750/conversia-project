import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { RiSettings4Line, RiWhatsappLine, RiRobotLine, RiSaveLine, RiQrCodeLine, RiPhoneLine, RiCheckboxCircleLine, RiLoader4Line } from "react-icons/ri";

export function ChatbotSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [connectingNew, setConnectingNew] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    type: "sales",
    aiInstructions: "",
    aiPersonality: "",
    conversationObjective: "",
    triggerKeywords: [] as string[]
  });

  // Fetch chatbot data
  const { data: chatbot, isLoading: loadingChatbot } = useQuery({
    queryKey: ['/api/chatbots', id],
    enabled: !!id,
  });

  // Fetch WhatsApp integration
  const { data: whatsappIntegration, isLoading: loadingWhatsApp } = useQuery({
    queryKey: ['/api/whatsapp/integrations/chatbot', id],
    enabled: !!id,
  });

  // Fetch available WhatsApp numbers
  const { data: availableNumbers } = useQuery({
    queryKey: ['/api/whatsapp/integrations'],
  });

  // Update form data when chatbot data loads
  useEffect(() => {
    if (chatbot) {
      setFormData({
        name: chatbot.name || "",
        description: chatbot.description || "",
        status: chatbot.status || "active",
        type: chatbot.type || "sales",
        aiInstructions: chatbot.aiInstructions || "",
        aiPersonality: chatbot.aiPersonality || "",
        conversationObjective: chatbot.conversationObjective || "",
        triggerKeywords: chatbot.triggerKeywords || []
      });
    }
  }, [chatbot]);

  // Save general settings mutation
  const saveGeneralSettings = useMutation({
    mutationFn: async (settings: any) => {
      return apiRequest("PUT", `/api/chatbots/${id}`, settings);
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "Los ajustes generales se han actualizado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots', id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Connect WhatsApp mutation
  const connectWhatsApp = useMutation({
    mutationFn: async (phoneNumber?: string) => {
      if (phoneNumber) {
        // Use existing number
        return apiRequest("POST", `/api/whatsapp/assign`, {
          chatbotId: id,
          phoneNumber,
        });
      } else {
        // Connect new number
        return apiRequest("POST", `/api/whatsapp/connect/chatbot/${id}`);
      }
    },
    onSuccess: () => {
      setConnectingNew(false);
      toast({
        title: "WhatsApp conectado",
        description: "El número de WhatsApp se ha conectado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/integrations/chatbot', id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error en conexión",
        description: error.message,
        variant: "destructive",
      });
      setConnectingNew(false);
    },
  });

  if (loadingChatbot) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Chatbot no encontrado</h2>
        <p className="text-gray-600 mt-2">El chatbot que buscas no existe o no tienes permisos para acceder a él.</p>
      </div>
    );
  }

  const handleSaveGeneral = () => {
    saveGeneralSettings.mutate({
      name: formData.name,
      description: formData.description,
      status: formData.status,
      type: formData.type,
      aiInstructions: formData.aiInstructions,
      aiPersonality: formData.aiPersonality,
      conversationObjective: formData.conversationObjective,
      triggerKeywords: formData.triggerKeywords,
    });
  };

  const handleConnectNew = () => {
    setConnectingNew(true);
    connectWhatsApp.mutate();
  };

  const handleUseExisting = (phoneNumber: string) => {
    connectWhatsApp.mutate(phoneNumber);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración del Chatbot</h1>
        <p className="text-gray-600 mt-1">{chatbot.name}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <RiSettings4Line className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <RiRobotLine className="w-4 h-4" />
            IA Personalizada
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <RiWhatsappLine className="w-4 h-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Ajusta la información básica de tu chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Chatbot</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Chatbot</Label>
                  <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Ventas</SelectItem>
                      <SelectItem value="support">Soporte</SelectItem>
                      <SelectItem value="information">Información</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="keywords">Palabras Clave (separadas por comas)</Label>
                <Input
                  id="keywords"
                  value={formData.triggerKeywords.join(', ')}
                  onChange={(e) => updateFormData('triggerKeywords', e.target.value.split(',').map(k => k.trim()))}
                  placeholder="producto, servicio, consulta"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveGeneral}
                  disabled={saveGeneralSettings.isPending}
                >
                  {saveGeneralSettings.isPending ? (
                    <RiLoader4Line className="animate-spin mr-2 w-4 h-4" />
                  ) : (
                    <RiSaveLine className="mr-2 w-4 h-4" />
                  )}
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de IA</CardTitle>
              <CardDescription>
                Personaliza el comportamiento y respuestas de la IA para este chatbot específico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ai-instructions">Instrucciones de IA</Label>
                <Textarea
                  id="ai-instructions"
                  value={formData.aiInstructions}
                  onChange={(e) => updateFormData('aiInstructions', e.target.value)}
                  rows={8}
                  placeholder="Eres un especialista en [tu área]. Tu objetivo es ayudar a los clientes con..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Define cómo debe comportarse la IA, qué información debe proporcionar y qué tono usar
                </p>
              </div>

              <div>
                <Label htmlFor="ai-personality">Personalidad de la IA</Label>
                <Input
                  id="ai-personality"
                  value={formData.aiPersonality}
                  onChange={(e) => updateFormData('aiPersonality', e.target.value)}
                  placeholder="Experto, amigable, profesional"
                />
              </div>

              <div>
                <Label htmlFor="conversation-objective">Objetivo de la Conversación</Label>
                <Input
                  id="conversation-objective"
                  value={formData.conversationObjective}
                  onChange={(e) => updateFormData('conversationObjective', e.target.value)}
                  placeholder="Generar leads, resolver dudas, cerrar ventas"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveGeneral}
                  disabled={saveGeneralSettings.isPending}
                >
                  {saveGeneralSettings.isPending ? (
                    <RiLoader4Line className="animate-spin mr-2 w-4 h-4" />
                  ) : (
                    <RiSaveLine className="mr-2 w-4 h-4" />
                  )}
                  Guardar Configuración IA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de WhatsApp</CardTitle>
              <CardDescription>
                Conecta un número de WhatsApp específico para este chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {whatsappIntegration ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <RiCheckboxCircleLine className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Número Conectado</p>
                        <p className="text-sm text-green-600">{whatsappIntegration.phoneNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {whatsappIntegration.status === 'connected' ? 'Conectado' : 'Conectando...'}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                      // Disconnect current number
                      // TODO: Implement disconnect functionality
                    }}>
                      <RiPhoneLine className="mr-2 w-4 h-4" />
                      Desconectar
                    </Button>
                    <Button variant="outline" onClick={() => {
                      // Show QR for reconnection
                      // TODO: Show QR modal
                    }}>
                      <RiQrCodeLine className="mr-2 w-4 h-4" />
                      Ver QR
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-800 mb-2">Selecciona una opción</h3>
                    <p className="text-sm text-blue-600">
                      Puedes usar un número existente o conectar uno nuevo específicamente para este chatbot
                    </p>
                  </div>

                  {availableNumbers && Array.isArray(availableNumbers) && availableNumbers.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Números Disponibles</h4>
                      <div className="space-y-2">
                        {availableNumbers.map((number: any) => (
                          <div key={number.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <RiPhoneLine className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="font-medium">{number.phoneNumber}</p>
                                <p className="text-sm text-gray-500">
                                  {number.chatbotId ? `Usado por: ${number.chatbotName}` : 'Disponible'}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!!number.chatbotId || connectWhatsApp.isPending}
                              onClick={() => handleUseExisting(number.phoneNumber)}
                            >
                              {connectWhatsApp.isPending ? 'Asignando...' : 'Usar'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Conectar Nuevo Número</h4>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Conecta un número de WhatsApp exclusivo para este chatbot
                      </p>
                      <Button
                        onClick={handleConnectNew}
                        disabled={connectWhatsApp.isPending || connectingNew}
                        className="w-full"
                      >
                        {connectingNew ? (
                          <RiLoader4Line className="animate-spin mr-2 w-4 h-4" />
                        ) : (
                          <RiQrCodeLine className="mr-2 w-4 h-4" />
                        )}
                        {connectingNew ? 'Generando QR...' : 'Generar Código QR'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ChatbotSettingsPage;