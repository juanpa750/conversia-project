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
import { WhatsAppQRComponent } from '@/components/whatsapp/qr-component';

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
  
  // Estados para WhatsApp
  const [whatsappOption, setWhatsappOption] = useState<'existing' | 'new'>('existing');
  const [selectedWhatsappId, setSelectedWhatsappId] = useState<string>('');
  const [whatsappStatus, setWhatsappStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const { toast } = useToast();

  // Simple debounce utility
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  };

  // Auto-save functions for different fields
  const handleSaveField = (field: string, value: any) => {
    if (!chatbotId) return; // Only save if editing existing chatbot
    
    const data = { [field]: value };
    console.log(`💾 Auto-saving ${field}:`, value);
    
    // Create a complete data object with current values
    const completeData = {
      name: chatbotName,
      productId: selectedProductId && selectedProductId !== 'none' ? parseInt(selectedProductId) : null,
      triggerKeywords,
      aiInstructions,
      aiPersonality,
      conversationObjective,
      flow: JSON.stringify({ nodes, edges }),
      ...data // Override with the specific field being updated
    };
    
    saveChatbotMutation.mutate(completeData);
  };

  // Debounced save functions
  const debouncedSaveInstructions = useCallback(
    debounce((value: string) => handleSaveField('aiInstructions', value), 1000),
    [chatbotId, handleSaveField]
  );

  const debouncedSavePersonality = useCallback(
    debounce((value: string) => handleSaveField('aiPersonality', value), 1000),
    [chatbotId, handleSaveField]
  );

  const debouncedSaveObjective = useCallback(
    debounce((value: string) => handleSaveField('conversationObjective', value), 1000),
    [chatbotId, handleSaveField]
  );

  // Obtener datos del chatbot si existe
  const { data: chatbot, isLoading: isChatbotLoading } = useQuery({
    queryKey: [`/api/chatbots/${chatbotId}`],
    enabled: !!chatbotId,
  });

  console.log('🎯 Builder - chatbotId:', chatbotId);
  console.log('🎯 Builder - chatbot data:', chatbot);

  // Obtener productos disponibles
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  // Obtener integraciones de WhatsApp disponibles
  const { data: whatsappIntegrations = [] } = useQuery<any[]>({
    queryKey: ['/api/whatsapp/integrations'],
  });

  // Reset initialization when chatbot ID changes
  useEffect(() => {
    setIsInitialized(false);
  }, [chatbotId]);

  useEffect(() => {
    if (chatbot) {
      console.log('🎯 Loading chatbot data:', chatbot);
      const chatbotData = chatbot as any;
      
      console.log('🎯 Field values from DB:', {
        name: chatbotData.name,
        productId: chatbotData.productId,
        triggerKeywords: chatbotData.triggerKeywords,
        aiInstructions: chatbotData.aiInstructions,
        aiPersonality: chatbotData.aiPersonality,
        conversationObjective: chatbotData.conversationObjective
      });
      
      setChatbotName(chatbotData.name || 'Chatbot');
      setSelectedProductId(chatbotData.productId ? chatbotData.productId.toString() : 'none');
      setTriggerKeywords(Array.isArray(chatbotData.triggerKeywords) ? chatbotData.triggerKeywords : []);
      setAiInstructions(chatbotData.aiInstructions || '');
      setAiPersonality(chatbotData.aiPersonality || '');
      setConversationObjective(chatbotData.conversationObjective || '');
      
      if (chatbotData.flow) {
        try {
          const config = typeof chatbotData.flow === 'string' 
            ? JSON.parse(chatbotData.flow) 
            : chatbotData.flow;
          console.log('🎯 Parsed flow config:', config);
          setNodes(config.nodes || initialNodes);
          setEdges(config.edges || []);
        } catch (error) {
          console.error('Error parsing chatbot flow:', error);
          setNodes(initialNodes);
          setEdges([]);
        }
      } else {
        setNodes(initialNodes);
        setEdges([]);
      }
      setIsInitialized(true);
    } else if (!chatbotId) {
      setNodes(initialNodes);
      setEdges([]);
      setIsInitialized(true);
    }
  }, [chatbot, chatbotId]);

  const saveChatbotMutation = useMutation({
    mutationFn: async (data: { 
      name?: string;
      productId?: number | null; 
      triggerKeywords?: string[]; 
      aiInstructions?: string;
      aiPersonality?: string;
      conversationObjective?: string;
      flow?: string;
    }) => {
      const chatbotData = {
        name: data.name || chatbotName,
        type: 'sales' as const,
        flow: data.flow || JSON.stringify({ nodes, edges }),
        productId: data.productId !== undefined ? data.productId : (selectedProductId && selectedProductId !== 'none' ? parseInt(selectedProductId) : null),
        triggerKeywords: data.triggerKeywords || triggerKeywords,
        aiInstructions: data.aiInstructions || aiInstructions,
        aiPersonality: data.aiPersonality || aiPersonality,
        conversationObjective: data.conversationObjective || conversationObjective,
      };

      console.log('💾 Saving chatbot data:', chatbotData);

      if (chatbotId) {
        return apiRequest('PATCH', `/api/chatbots/${chatbotId}`, chatbotData);
      } else {
        return apiRequest('POST', '/api/chatbots', chatbotData);
      }
    },
    onSuccess: (result: any) => {
      console.log('💾 Save successful', result);
      toast({
        title: "Guardado exitoso",
        description: "Todos los cambios se han guardado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots'] });
      queryClient.invalidateQueries({ queryKey: [`/api/chatbots/${chatbotId}`] });
      
      // If this was a new chatbot creation, redirect to edit page
      if (!chatbotId && result?.id) {
        window.location.href = `/chatbots/builder/${result.id}`;
      }
    },
    onError: (error: any) => {
      console.error('💾 Save error:', error);
      toast({
        title: "Error al guardar",
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
        flow: JSON.stringify({ nodes, edges }),
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
    console.log('💾 Saving complete chatbot data:', {
      name: chatbotName,
      selectedProductId,
      triggerKeywords,
      aiInstructions,
      aiPersonality,
      conversationObjective,
      flow: { nodes, edges }
    });
    
    saveChatbotMutation.mutate({
      name: chatbotName,
      productId: selectedProductId && selectedProductId !== 'none' ? parseInt(selectedProductId) : null,
      triggerKeywords,
      aiInstructions,
      aiPersonality,
      conversationObjective,
      flow: JSON.stringify({ nodes, edges })
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
      const updatedKeywords = [...triggerKeywords, newKeyword.trim()];
      setTriggerKeywords(updatedKeywords);
      setNewKeyword('');
      if (chatbotId) {
        handleSaveField('triggerKeywords', updatedKeywords);
      }
    }
  };

  const removeKeyword = (keyword: string) => {
    const updatedKeywords = triggerKeywords.filter(k => k !== keyword);
    setTriggerKeywords(updatedKeywords);
    if (chatbotId) {
      handleSaveField('triggerKeywords', updatedKeywords);
    }
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

      <div className="flex flex-1 rounded-md border border-gray-200 bg-white">
        <SidebarPalette />
        
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="flow" className="flex flex-col flex-1">
            <div className="border-b border-gray-200">
              <TabsList className="ml-4 mt-1">
                <TabsTrigger value="flow">Flujo</TabsTrigger>
                <TabsTrigger value="instruction">Instrucción</TabsTrigger>
                <TabsTrigger value="objective">Objetivo</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
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
            
            <TabsContent value="instruction" className="m-0 flex-1 outline-none">
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4">
                <div className="space-y-6 pb-96">
                  <div className="flex items-center gap-2">
                    <RiBrainLine className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Configuración de IA</h3>
                  </div>

                  {/* Configuración Básica del Chatbot */}
                  <Card>
                    <CardHeader>
                      <CardTitle>⚙️ Configuración Básica</CardTitle>
                      <p className="text-sm text-gray-600">Configuración esencial del chatbot</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="chatbot-name">Nombre del Chatbot</Label>
                          <Input
                            id="chatbot-name"
                            value={chatbotName}
                            onChange={(e) => {
                              setChatbotName(e.target.value);
                              handleSaveField('name', e.target.value);
                            }}
                            placeholder="Mi Chatbot de Ventas"
                          />
                        </div>
                        <div>
                          <Label htmlFor="language">Idioma</Label>
                          <Select defaultValue="es">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar idioma" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="pt">Português</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                
                  {/* Selección de Producto */}
                  <Card>
                    <CardHeader>
                      <CardTitle>📦 Producto que Venderá el Chatbot</CardTitle>
                      <p className="text-sm text-gray-600">Selecciona el producto específico. La IA leerá automáticamente toda la información detallada del producto para saber qué vender.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="product-selection">Producto a Vender</Label>
                        <Select 
                          value={selectedProductId} 
                          onValueChange={(value) => {
                            setSelectedProductId(value);
                            handleSaveField('productId', value === 'none' ? null : parseInt(value));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un producto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin producto específico</SelectItem>
                            {Array.isArray(products) && products.map((product: any) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} - {product.price || 'Sin precio'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedProductId !== 'none' && (
                          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-700">
                              ✅ La IA leerá automáticamente toda la información de este producto (descripción, características, precio, etc.)
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Personalidad del AI */}
                  <Card>
                    <CardHeader>
                      <CardTitle>🤖 Personalidad del Asistente Virtual</CardTitle>
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
                      <CardTitle>🎯 Instrucciones de Venta</CardTitle>
                      <p className="text-sm text-gray-600">Define CÓMO debe vender el producto. La IA ya conoce QUÉ vender (lee del producto seleccionado).</p>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="ai-instructions">Instrucciones Específicas de Venta</Label>
                        <Textarea
                          id="ai-instructions"
                          placeholder="Ej: Siempre pregunta sobre necesidades específicas antes de recomendar. Menciona garantía en cada respuesta. Si preguntan precio, destaca el valor vs. competencia. Usa testimonios de clientes..."
                          value={aiInstructions}
                          onChange={(e) => {
                            setAiInstructions(e.target.value);
                            debouncedSaveInstructions(e.target.value);
                          }}
                          className="min-h-[150px]"
                        />
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-700">
                            💡 <strong>Cómo funciona:</strong> La IA automáticamente lee toda la información del producto (descripción, precio, características) + estas instrucciones de venta para crear respuestas inteligentes.
                          </p>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="objective" className="m-0 flex-1 outline-none">
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4">
                <div className="space-y-6 pb-96">
                  <div className="flex items-center gap-2">
                    <RiFlagLine className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Disparadores y Objetivos</h3>
                  </div>

                  {/* Disparadores Automáticos */}
                  <Card>
                    <CardHeader>
                      <CardTitle>⚡ Disparadores Automáticos</CardTitle>
                      <p className="text-sm text-gray-600">Define palabras clave que activarán automáticamente este chatbot</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="trigger-keywords">Palabras Clave de Activación</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Ej: keratina, cabello, tratamiento..."
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newKeyword.trim() && !triggerKeywords.includes(newKeyword.trim())) {
                                  const updatedKeywords = [...triggerKeywords, newKeyword.trim()];
                                  setTriggerKeywords(updatedKeywords);
                                  handleSaveField('triggerKeywords', updatedKeywords);
                                  setNewKeyword('');
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              if (newKeyword.trim() && !triggerKeywords.includes(newKeyword.trim())) {
                                const updatedKeywords = [...triggerKeywords, newKeyword.trim()];
                                setTriggerKeywords(updatedKeywords);
                                handleSaveField('triggerKeywords', updatedKeywords);
                                setNewKeyword('');
                              }
                            }}
                          >
                            Agregar
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {triggerKeywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {keyword}
                              <button
                                onClick={() => {
                                  const updatedKeywords = triggerKeywords.filter((_, i) => i !== index);
                                  setTriggerKeywords(updatedKeywords);
                                  handleSaveField('triggerKeywords', updatedKeywords);
                                }}
                                className="ml-1 text-gray-500 hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-700">
                            🔥 <strong>Activación Automática:</strong> Cuando un cliente escriba cualquiera de estas palabras, este chatbot se activará automáticamente y usará la información del producto + las instrucciones de venta.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                
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
                          onChange={(e) => {
                            setConversationObjective(e.target.value);
                            debouncedSaveObjective(e.target.value);
                          }}
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
            
            <TabsContent value="settings" className="m-0 flex-1 outline-none">
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4">
                <div className="space-y-6 pb-96">
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
                            onChange={(e) => {
                              setChatbotName(e.target.value);
                              if (chatbotId) {
                                handleSaveField('name', e.target.value);
                              }
                            }}
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

                  {/* Vinculación de Producto */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Producto Vinculado</CardTitle>
                      <p className="text-sm text-gray-600">Selecciona un producto para configuraciones automáticas</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="product-select">Producto</Label>
                        <Select 
                          value={selectedProductId} 
                          onValueChange={(value) => {
                            setSelectedProductId(value);
                            if (chatbotId) {
                              handleSaveField('productId', value === 'none' ? null : parseInt(value));
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin producto vinculado</SelectItem>
                            {Array.isArray(products) && products.map((product: any) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} - {product.currency} {product.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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


                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="whatsapp" className="m-0 flex-1 outline-none">
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4">
                <div className="space-y-6 pb-96">
                  <div className="flex items-center gap-2">
                    <RiWhatsappLine className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Configuración de WhatsApp</h3>
                  </div>

                  {/* Selección de Número de WhatsApp */}
                  <Card>
                    <CardHeader>
                      <CardTitle>📱 Número de WhatsApp</CardTitle>
                      <p className="text-sm text-gray-600">
                        Cada chatbot puede usar un número de WhatsApp específico para respuestas personalizadas
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="existing-whatsapp"
                            name="whatsapp-option"
                            value="existing"
                            checked={whatsappOption === 'existing'}
                            onChange={(e) => setWhatsappOption(e.target.value as 'existing' | 'new')}
                            className="h-4 w-4 text-blue-600"
                          />
                          <Label htmlFor="existing-whatsapp" className="font-medium">
                            Usar número existente
                          </Label>
                        </div>
                        
                        {whatsappOption === 'existing' && (
                          <div className="ml-6 space-y-3">
                            <Select value={selectedWhatsappId} onValueChange={setSelectedWhatsappId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar número de WhatsApp" />
                              </SelectTrigger>
                              <SelectContent>
                                {whatsappIntegrations.length === 0 ? (
                                  <SelectItem value="" disabled>
                                    No hay números configurados
                                  </SelectItem>
                                ) : (
                                  whatsappIntegrations.map((integration: any) => (
                                    <SelectItem key={integration.id} value={integration.id.toString()}>
                                      {integration.phoneNumber || `Número ${integration.id}`}
                                      {integration.isConnected && (
                                        <Badge variant="default" className="ml-2 text-xs">
                                          Conectado
                                        </Badge>
                                      )}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            
                            {selectedWhatsappId && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                  <span className="text-sm font-medium text-green-800">
                                    Número seleccionado correctamente
                                  </span>
                                </div>
                                <p className="text-xs text-green-600 mt-1">
                                  Este chatbot usará las respuestas personalizadas para este número
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="new-whatsapp"
                            name="whatsapp-option"
                            value="new"
                            checked={whatsappOption === 'new'}
                            onChange={(e) => setWhatsappOption(e.target.value as 'existing' | 'new')}
                            className="h-4 w-4 text-blue-600"
                          />
                          <Label htmlFor="new-whatsapp" className="font-medium">
                            Conectar nuevo número
                          </Label>
                        </div>
                        
                        {whatsappOption === 'new' && (
                          <div className="ml-6 space-y-3">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h4 className="font-medium text-blue-900 mb-2">
                                Conectar Nuevo Número de WhatsApp
                              </h4>
                              <p className="text-sm text-blue-700 mb-3">
                                Escanea el código QR con tu WhatsApp para conectar un número dedicado a este chatbot
                              </p>
                              
                              <div className="space-y-3">
                                <WhatsAppQRComponent 
                                  chatbotId={chatbotId}
                                  onConnectionSuccess={(integrationId: number) => {
                                    setSelectedWhatsappId(integrationId.toString());
                                    setWhatsappOption('existing');
                                    setWhatsappStatus('connected');
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información del Número Conectado */}
                  {selectedWhatsappId && (
                    <Card>
                      <CardHeader>
                        <CardTitle>✅ Estado de Conexión</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium">Número asignado</div>
                              <div className="text-sm text-gray-600">
                                {whatsappIntegrations.find((i: any) => i.id.toString() === selectedWhatsappId)?.phoneNumber || 'Número configurado'}
                              </div>
                            </div>
                            <Badge variant="default">
                              Activo
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <strong>Funcionamiento:</strong> Este chatbot responderá automáticamente a los mensajes 
                            recibidos en este número usando las configuraciones de IA personalizadas que has definido.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Instrucciones */}
                  <Card>
                    <CardHeader>
                      <CardTitle>📋 Cómo Funciona</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 font-semibold text-xs">1</span>
                          </div>
                          <div>
                            <strong>Número Dedicado:</strong> Cada chatbot puede tener su propio número de WhatsApp
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 font-semibold text-xs">2</span>
                          </div>
                          <div>
                            <strong>Respuestas Personalizadas:</strong> La IA se adapta al objetivo específico del chatbot
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 font-semibold text-xs">3</span>
                          </div>
                          <div>
                            <strong>Automático:</strong> Los mensajes se procesan automáticamente según la configuración
                          </div>
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