import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { RiRobotLine, RiUserLine, RiSettingsLine, RiMessageLine, RiPlayLine, RiPauseLine, RiEditLine, RiSendPlaneLine } from "react-icons/ri";

interface Conversation {
  id: number;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageTime: Date;
  aiEnabled: boolean;
  status: 'active' | 'paused' | 'manual';
  messageCount: number;
  chatbotId?: number;
}

interface AIMessage {
  id: number;
  conversationId: number;
  content: string;
  timestamp: Date;
  isAI: boolean;
  status: 'sent' | 'pending' | 'failed';
}

export default function ConversationControl() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [manualMessage, setManualMessage] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const { toast } = useToast();

  // Fetch conversations with AI control status
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/conversations/ai-control"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/conversations/ai-control");
      return res.json();
    },
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/conversations", selectedConversation?.id, "messages"],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const res = await apiRequest("GET", `/api/conversations/${selectedConversation.id}/messages`);
      return res.json();
    },
    enabled: !!selectedConversation,
  });

  // Toggle AI for conversation
  const toggleAI = useMutation({
    mutationFn: async ({ conversationId, enabled }: { conversationId: number; enabled: boolean }) => {
      const res = await apiRequest("PUT", `/api/conversations/${conversationId}/ai-control`, {
        aiEnabled: enabled
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations/ai-control"] });
      toast({
        title: "AI actualizado",
        description: "El control de AI se ha actualizado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el control de AI",
        variant: "destructive",
      });
    },
  });

  // Send manual message
  const sendManualMessage = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: number; message: string }) => {
      const res = await apiRequest("POST", `/api/conversations/${conversationId}/manual-message`, {
        content: message
      });
      return res.json();
    },
    onSuccess: () => {
      setManualMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation?.id, "messages"] });
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje manual se ha enviado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    },
  });

  // Pause/Resume AI for conversation
  const pauseResumeAI = useMutation({
    mutationFn: async ({ conversationId, action }: { conversationId: number; action: 'pause' | 'resume' }) => {
      const res = await apiRequest("PUT", `/api/conversations/${conversationId}/ai-${action}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations/ai-control"] });
      toast({
        title: "AI actualizado",
        description: "El estado del AI se ha actualizado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado del AI",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Control Individual de AI</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona el comportamiento del AI para cada conversación individualmente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de conversaciones */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RiMessageLine className="w-5 h-5 mr-2" />
                Conversaciones Activas
              </CardTitle>
              <CardDescription>
                {conversations.length} conversaciones en total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversations.map((conversation: Conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{conversation.contactName}</h4>
                    <Badge
                      variant={conversation.aiEnabled ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {conversation.aiEnabled ? (
                        <RiRobotLine className="w-3 h-3 mr-1" />
                      ) : (
                        <RiUserLine className="w-3 h-3 mr-1" />
                      )}
                      {conversation.aiEnabled ? 'AI' : 'Manual'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{conversation.lastMessage}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{conversation.contactPhone}</span>
                    <span className="text-xs text-gray-500">{conversation.messageCount} msgs</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Panel de control y mensajes */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Tabs defaultValue="messages" className="space-y-4">
              <TabsList>
                <TabsTrigger value="messages">Mensajes</TabsTrigger>
                <TabsTrigger value="control">Control AI</TabsTrigger>
              </TabsList>

              <TabsContent value="messages">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Conversación con {selectedConversation.contactName}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={selectedConversation.aiEnabled ? "default" : "secondary"}>
                          {selectedConversation.aiEnabled ? 'AI Activo' : 'Manual'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (selectedConversation.status === 'paused') {
                              pauseResumeAI.mutate({ conversationId: selectedConversation.id, action: 'resume' });
                            } else {
                              pauseResumeAI.mutate({ conversationId: selectedConversation.id, action: 'pause' });
                            }
                          }}
                        >
                          {selectedConversation.status === 'paused' ? (
                            <RiPlayLine className="w-4 h-4" />
                          ) : (
                            <RiPauseLine className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Área de mensajes */}
                    <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-gray-50">
                      {messages.map((message: AIMessage) => (
                        <div
                          key={message.id}
                          className={`mb-3 flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                              message.isAI
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-75">
                                {message.isAI ? 'AI' : 'Tú'}
                              </span>
                              <span className="text-xs opacity-75">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Envío de mensaje manual */}
                    <div className="border-t pt-4">
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="Escribe tu mensaje manual aquí..."
                          value={manualMessage}
                          onChange={(e) => setManualMessage(e.target.value)}
                          className="flex-1 min-h-[80px]"
                        />
                        <Button
                          onClick={() => sendManualMessage.mutate({
                            conversationId: selectedConversation.id,
                            message: manualMessage
                          })}
                          disabled={!manualMessage.trim() || sendManualMessage.isPending}
                          className="self-end"
                        >
                          <RiSendPlaneLine className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="control">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <RiSettingsLine className="w-5 h-5 mr-2" />
                      Configuración de AI
                    </CardTitle>
                    <CardDescription>
                      Controla cómo el AI interactúa en esta conversación
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Toggle AI */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">AI Automático</h4>
                        <p className="text-sm text-gray-600">
                          Permite que el AI responda automáticamente
                        </p>
                      </div>
                      <Switch
                        checked={selectedConversation.aiEnabled}
                        onCheckedChange={(enabled) => {
                          toggleAI.mutate({
                            conversationId: selectedConversation.id,
                            enabled
                          });
                        }}
                      />
                    </div>

                    {/* Estado actual */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Estado Actual</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Modo:</span>
                          <span className="ml-2 font-medium">
                            {selectedConversation.aiEnabled ? 'AI Automático' : 'Manual'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Estado:</span>
                          <span className="ml-2 font-medium capitalize">
                            {selectedConversation.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Mensajes:</span>
                          <span className="ml-2 font-medium">
                            {selectedConversation.messageCount}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Chatbot:</span>
                          <span className="ml-2 font-medium">
                            {selectedConversation.chatbotId ? `#${selectedConversation.chatbotId}` : 'Ninguno'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Acciones Rápidas</h4>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (selectedConversation.status === 'paused') {
                              pauseResumeAI.mutate({ conversationId: selectedConversation.id, action: 'resume' });
                            } else {
                              pauseResumeAI.mutate({ conversationId: selectedConversation.id, action: 'pause' });
                            }
                          }}
                        >
                          {selectedConversation.status === 'paused' ? 'Reanudar AI' : 'Pausar AI'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toggleAI.mutate({
                              conversationId: selectedConversation.id,
                              enabled: !selectedConversation.aiEnabled
                            });
                          }}
                        >
                          {selectedConversation.aiEnabled ? 'Desactivar AI' : 'Activar AI'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <RiMessageLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Selecciona una conversación para ver detalles</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}