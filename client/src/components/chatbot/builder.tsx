import { useCallback, useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { TestSimulator } from './test-simulator';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from './node-types';
import { SidebarPalette } from './sidebar-palette';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RiSave3Line, RiTestTubeLine, RiWhatsappLine, RiSettings3Line, RiBrainLine, RiFlagLine } from 'react-icons/ri';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'start',
    data: { label: 'Bienvenida' },
    position: { x: 250, y: 5 },
  },
];

interface ChatbotBuilderProps {
  chatbotId?: string;
}

export function ChatbotBuilder({ chatbotId }: ChatbotBuilderProps = {}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [chatbotName, setChatbotName] = useState(chatbotId ? '' : 'Nuevo Chatbot');
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  
  // Estados para la nueva estructura de pestañas
  const [selectedProductId, setSelectedProductId] = useState<string>('none');
  const [triggerKeywords, setTriggerKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiPersonality, setAiPersonality] = useState('');
  const [conversationObjective, setConversationObjective] = useState('');

  const { toast } = useToast();

  // Obtener datos del chatbot si existe
  const { data: chatbot, isLoading: isChatbotLoading } = useQuery({
    queryKey: ['/api/chatbots', chatbotId],
    enabled: !!chatbotId,
  });

  // Obtener productos disponibles
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  useEffect(() => {
    if (chatbot && !isInitialized) {
      setChatbotName(chatbot.name || 'Chatbot');
      setSelectedProductId(chatbot.productId?.toString() || 'none');
      setTriggerKeywords(chatbot.triggerKeywords || []);
      setAiInstructions(chatbot.aiInstructions || '');
      setAiPersonality(chatbot.aiPersonality || '');
      setConversationObjective(chatbot.conversationObjective || '');
      
      if (chatbot.configuration) {
        try {
          const config = typeof chatbot.configuration === 'string' 
            ? JSON.parse(chatbot.configuration) 
            : chatbot.configuration;
          setNodes(config.nodes || initialNodes);
          setEdges(config.edges || []);
        } catch (error) {
          console.error('Error parsing chatbot configuration:', error);
          setNodes(initialNodes);
          setEdges([]);
        }
      } else {
        setNodes(initialNodes);
        setEdges([]);
      }
      setIsInitialized(true);
    } else if (!chatbotId && !isInitialized) {
      setNodes(initialNodes);
      setEdges([]);
      setIsInitialized(true);
    }
  }, [chatbot, chatbotId, isInitialized]);

  const saveChatbotMutation = useMutation({
    mutationFn: async (data: { productId?: number | null; triggerKeywords?: string[]; aiInstructions?: string }) => {
      const chatbotData = {
        name: chatbotName,
        type: 'sales' as const,
        configuration: JSON.stringify({ nodes, edges }),
        productId: data.productId,
        triggerKeywords: data.triggerKeywords || triggerKeywords,
        aiInstructions: data.aiInstructions || aiInstructions,
        aiPersonality,
        conversationObjective,
      };

      if (chatbotId) {
        return apiRequest('PATCH', `/api/chatbots/${chatbotId}`, chatbotData);
      } else {
        return apiRequest('POST', '/api/chatbots', chatbotData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Chatbot guardado",
        description: "Los cambios se han guardado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el chatbot",
        variant: "destructive",
      });
    },
  });

  const publishChatbotMutation = useMutation({
    mutationFn: async () => {
      const chatbotData = {
        name: chatbotName,
        type: 'sales' as const,
        status: 'active' as const,
        configuration: JSON.stringify({ nodes, edges }),
        productId: selectedProductId && selectedProductId !== 'none' ? parseInt(selectedProductId) : null,
        triggerKeywords,
        aiInstructions,
        aiPersonality,
        conversationObjective,
      };

      if (chatbotId) {
        return apiRequest('PATCH', `/api/chatbots/${chatbotId}`, chatbotData);
      } else {
        return apiRequest('POST', '/api/chatbots', chatbotData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Chatbot publicado",
        description: "El chatbot está ahora activo y funcionando",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo publicar el chatbot",
        variant: "destructive",
      });
    },
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${Date.now()}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const handleSave = () => {
    console.log('💾 Saving chatbot with product data:', {
      selectedProductId,
      triggerKeywords,
      aiInstructions
    });
    
    saveChatbotMutation.mutate({
      productId: selectedProductId && selectedProductId !== 'none' ? parseInt(selectedProductId) : null,
      triggerKeywords,
      aiInstructions
    });
  };

  const handleTest = () => {
    if (nodes.length === 0) {
      toast({
        title: "Error",
        description: "Agregue al menos un nodo antes de probar",
        variant: "destructive",
      });
      return;
    }
    setIsTestModalOpen(true);
  };

  const handlePublish = () => {
    if (nodes.length === 0) {
      toast({
        title: "Error",
        description: "Agregue al menos un nodo antes de publicar",
        variant: "destructive",
      });
      return;
    }
    publishChatbotMutation.mutate();
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !triggerKeywords.includes(newKeyword.trim())) {
      setTriggerKeywords([...triggerKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setTriggerKeywords(triggerKeywords.filter(k => k !== keyword));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addKeyword();
    }
  };

  if (isChatbotLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">{chatbotName}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleTest} disabled={nodes.length === 0}>
            <RiTestTubeLine className="mr-2" />
            {nodes.length === 0 ? 'Agregar nodos' : 'Probar'}
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={publishChatbotMutation.isPending || nodes.length === 0}>
            <RiWhatsappLine className="mr-2" />
            {publishChatbotMutation.isPending ? 'Publicando...' : 'Publicar'}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saveChatbotMutation.isPending}>
            <RiSave3Line className="mr-2" />
            {saveChatbotMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-md border border-gray-200 bg-white">
        <SidebarPalette />
        
        <div className="flex-1">
          <Tabs defaultValue="flow">
            <div className="border-b border-gray-200">
              <TabsList className="ml-4 mt-1">
                <TabsTrigger value="flow">Flujo</TabsTrigger>
                <TabsTrigger value="instruction">Instrucción</TabsTrigger>
                <TabsTrigger value="objective">Objetivo</TabsTrigger>
                <TabsTrigger value="settings">Configuración</TabsTrigger>
                <TabsTrigger value="integrations">Integraciones</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="flow" className="m-0 flex-1 p-0 outline-none">
              <div className="h-[calc(100vh-10rem)]">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={setReactFlowInstance}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  nodeTypes={nodeTypes}
                  fitView
                >
                  <Background />
                  <Controls />
                  <MiniMap />
                </ReactFlow>
              </div>
            </TabsContent>
            
            <TabsContent value="instruction" className="m-0 flex-1 outline-none overflow-hidden">
              <div className="h-full overflow-y-auto p-4">
                <div className="space-y-6 pb-8">
                  <div className="flex items-center gap-2">
                    <RiBrainLine className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Instrucciones del Chatbot</h3>
                  </div>
                
                  {/* Personalidad del AI */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Personalidad del Asistente Virtual</CardTitle>
                      <p className="text-sm text-gray-600">Define cómo se comportará y comunicará tu chatbot</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="ai-personality">Personalidad y tono de comunicación</Label>
                        <Textarea
                          id="ai-personality"
                          placeholder="Ej: Soy un asistente amigable y profesional. Hablo de manera clara y directa, siempre dispuesto a ayudar..."
                          value={aiPersonality}
                          onChange={(e) => setAiPersonality(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tone">Estilo de comunicación</Label>
                          <Select defaultValue="profesional">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estilo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="profesional">Profesional</SelectItem>
                              <SelectItem value="amigable">Amigable</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="formal">Formal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="response-length">Longitud de respuestas</Label>
                          <Select defaultValue="moderado">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar longitud" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conciso">Conciso</SelectItem>
                              <SelectItem value="moderado">Moderado</SelectItem>
                              <SelectItem value="detallado">Detallado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Instrucciones Específicas */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Instrucciones Específicas</CardTitle>
                      <p className="text-sm text-gray-600">Instrucciones detalladas sobre cómo debe actuar el chatbot</p>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="ai-instructions">Instrucciones para el AI</Label>
                        <Textarea
                          id="ai-instructions"
                          placeholder="Ej: Cuando un cliente pregunte por precios, siempre menciona las promociones actuales. Si preguntan por disponibilidad..."
                          value={aiInstructions}
                          onChange={(e) => setAiInstructions(e.target.value)}
                          className="min-h-[150px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="objective" className="m-0 flex-1 outline-none overflow-hidden">
              <div className="h-full overflow-y-auto p-4">
                <div className="space-y-6 pb-8">
                  <div className="flex items-center gap-2">
                    <RiFlagLine className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Objetivo de la Conversación</h3>
                  </div>
                
                  {/* Objetivo Principal */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Objetivo Principal del Chatbot</CardTitle>
                      <p className="text-sm text-gray-600">Define el propósito principal de las conversaciones</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="conversation-objective">¿Cuál es el objetivo principal?</Label>
                        <Textarea
                          id="conversation-objective"
                          placeholder="Ej: Generar ventas de productos, programar citas, brindar soporte técnico, capturar leads..."
                          value={conversationObjective}
                          onChange={(e) => setConversationObjective(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="objective-type">Tipo de objetivo</Label>
                          <Select defaultValue="ventas">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ventas">Generar Ventas</SelectItem>
                              <SelectItem value="citas">Programar Citas</SelectItem>
                              <SelectItem value="soporte">Brindar Soporte</SelectItem>
                              <SelectItem value="leads">Capturar Leads</SelectItem>
                              <SelectItem value="informacion">Dar Información</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="success-metric">Métrica de éxito</Label>
                          <Select defaultValue="conversion">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar métrica" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conversion">Tasa de Conversión</SelectItem>
                              <SelectItem value="satisfaction">Satisfacción del Cliente</SelectItem>
                              <SelectItem value="resolution">Resolución de Problemas</SelectItem>
                              <SelectItem value="engagement">Tiempo de Interacción</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Estrategia de Conversación */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Estrategia de Conversación</CardTitle>
                      <p className="text-sm text-gray-600">Cómo debe abordar las conversaciones para lograr el objetivo</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-3">
                          <Label>Enfoque de la conversación</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input type="radio" id="consultative" name="approach" value="consultative" defaultChecked />
                              <Label htmlFor="consultative">Consultivo - Hacer preguntas para entender necesidades</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="radio" id="direct" name="approach" value="direct" />
                              <Label htmlFor="direct">Directo - Ir al punto rápidamente</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="radio" id="educational" name="approach" value="educational" />
                              <Label htmlFor="educational">Educativo - Informar antes de vender</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="m-0 flex-1 outline-none overflow-hidden">
              <div className="h-full overflow-y-auto p-4">
                <div className="space-y-6 pb-8">
                  <div className="flex items-center gap-2">
                    <RiSettings3Line className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Configuración del Chatbot</h3>
                  </div>
                
                  {/* Configuración Básica */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Información Básica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="chatbot-name">Nombre del Chatbot</Label>
                          <Input 
                            id="chatbot-name"
                            value={chatbotName}
                            onChange={(e) => setChatbotName(e.target.value)}
                            placeholder="Ej: Asistente de Ventas"
                          />
                        </div>
                        <div>
                          <Label htmlFor="language">Idioma Principal</Label>
                          <Select defaultValue="es">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar idioma" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="en">Inglés</SelectItem>
                              <SelectItem value="pt">Portugués</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Palabras Clave Activadoras */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Palabras Clave Activadoras</CardTitle>
                      <p className="text-sm text-gray-600">Define qué palabras o frases activan este chatbot específico</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Palabras que activan este chatbot</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Agregar palabra clave..."
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyPress={handleKeyPress}
                          />
                          <Button onClick={addKeyword} variant="outline">
                            Agregar
                          </Button>
                        </div>
                      </div>
                      
                      {triggerKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {triggerKeywords.map((keyword) => (
                            <Badge 
                              key={keyword} 
                              variant="secondary" 
                              className="flex items-center gap-1"
                            >
                              {keyword}
                              <button
                                onClick={() => removeKeyword(keyword)}
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Configuración Avanzada */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración Avanzada</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tone">Tono de Comunicación</Label>
                          <Select defaultValue="profesional">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tono" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="profesional">Profesional</SelectItem>
                              <SelectItem value="amigable">Amigable</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="formal">Formal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="response-style">Estilo de Respuesta</Label>
                          <Select defaultValue="conciso">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estilo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conciso">Conciso</SelectItem>
                              <SelectItem value="detallado">Detallado</SelectItem>
                              <SelectItem value="conversacional">Conversacional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="integrations" className="m-0 flex-1 outline-none overflow-hidden">
              <div className="h-full overflow-y-auto p-4">
                <div className="space-y-6 pb-8">
                  <div className="flex items-center gap-2">
                    <RiWhatsappLine className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Integraciones</h3>
                  </div>
                
                  {/* WhatsApp Integration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>WhatsApp Business</CardTitle>
                      <p className="text-sm text-gray-600">Conecta con la API oficial de WhatsApp</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">W</span>
                          </div>
                          <div>
                            <h4 className="font-medium">WhatsApp Business API</h4>
                            <p className="text-sm text-gray-600">Estado de conexión</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-600">● Conectado</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="phone-number">Número de teléfono</Label>
                          <Input id="phone-number" placeholder="+1234567890" defaultValue="+573001234567" />
                        </div>
                        <div>
                          <Label htmlFor="business-name">Nombre del negocio</Label>
                          <Input id="business-name" placeholder="Mi Empresa" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Otras Integraciones */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Otras Integraciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                              <span className="text-white text-sm font-bold">CRM</span>
                            </div>
                            <div>
                              <p className="font-medium">Sistema CRM</p>
                              <p className="text-sm text-gray-600">Integración con CRM externo</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Configurar</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                              <span className="text-white text-sm font-bold">AI</span>
                            </div>
                            <div>
                              <p className="font-medium">IA Personalizada</p>
                              <p className="text-sm text-gray-600">Configuración avanzada de IA</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Configurar</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Test Simulator Modal */}
      <TestSimulator
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        chatbotName={chatbotName}
        nodes={nodes}
        edges={edges}
      />
    </div>
  );
}

export default ChatbotBuilder;