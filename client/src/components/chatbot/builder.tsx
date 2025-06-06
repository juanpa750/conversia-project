import { useCallback, useState, useEffect } from 'react';
import { useParams } from 'wouter';
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
import { RiSave3Line, RiTestTubeLine, RiWhatsappLine } from '@/lib/icons';

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
  const { toast } = useToast();

  // Fetch chatbot data if editing existing chatbot
  const { data: chatbot, isLoading } = useQuery({
    queryKey: ["/api/chatbots", chatbotId],
    queryFn: () => {
      console.log('🔍 Making API request for chatbot ID:', chatbotId);
      console.log('🔍 Request URL:', `/api/chatbots/${chatbotId}`);
      return apiRequest('GET', `/api/chatbots/${chatbotId}`);
    },
    enabled: !!chatbotId,
    staleTime: 0, // Force fresh data
    gcTime: 0, // Don't cache (React Query v5)
  });

  // Save chatbot mutation
  const saveChatbotMutation = useMutation({
    mutationFn: async (data: any) => {
      const flowData = {
        name: chatbotName,
        flow: { nodes, edges },
        updatedAt: new Date().toISOString()
      };
      
      if (chatbotId) {
        return apiRequest('PATCH', `/api/chatbots/${chatbotId}`, flowData);
      } else {
        return apiRequest('POST', '/api/chatbots', {
          ...flowData,
          type: 'support',
          status: 'draft'
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Chatbot guardado",
        description: "Los cambios se han guardado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chatbots"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    }
  });

  // Publish chatbot mutation
  const publishChatbotMutation = useMutation({
    mutationFn: async () => {
      if (!chatbotId) {
        throw new Error('Debe guardar el chatbot antes de publicarlo');
      }
      return apiRequest('PATCH', `/api/chatbots/${chatbotId}`, {
        status: 'active',
        flow: { nodes, edges }
      });
    },
    onSuccess: () => {
      toast({
        title: "Chatbot publicado",
        description: "El chatbot está ahora activo y funcionando",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chatbots"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo publicar el chatbot",
        variant: "destructive",
      });
    }
  });

  // Reset state when chatbotId changes
  useEffect(() => {
    if (chatbotId) {
      setChatbotName(''); // Clear name while loading
      setIsInitialized(false);
    } else {
      setChatbotName('Nuevo Chatbot');
      setIsInitialized(false);
    }
  }, [chatbotId]);

  // Load chatbot flow when data is available
  useEffect(() => {
    if (chatbot && !isInitialized) {
      console.log('🔄 Loading chatbot data:', chatbot);
      
      // Handle case where API returns array instead of single object
      let chatbotData = chatbot as any;
      if (Array.isArray(chatbot) && chatbot.length > 0) {
        chatbotData = chatbot[0];
        console.log('🔄 Extracted chatbot from array:', chatbotData);
      }
      
      console.log('🔄 Final chatbot data:', chatbotData);
      console.log('🔄 Chatbot name from data:', chatbotData?.name);
      
      // Set the chatbot name directly from the API response
      if (chatbotData?.name) {
        setChatbotName(chatbotData.name);
        console.log('✅ Set chatbot name to:', chatbotData.name);
      } else {
        console.log('❌ No name found in chatbot data');
        console.log('❌ Available keys:', Object.keys(chatbotData || {}));
      }
      
      // Handle different possible data structures
      let flow = chatbotData?.flow;
      
      // If flow is a string, try to parse it as JSON
      if (typeof flow === 'string') {
        try {
          flow = JSON.parse(flow);
          console.log('Parsed flow from string:', flow);
        } catch (e) {
          console.error('Failed to parse flow JSON:', e);
          flow = null;
        }
      }
      
      console.log('Final flow object:', flow);
      console.log('Flow type:', typeof flow);
      console.log('Flow nodes:', flow?.nodes);
      console.log('Nodes is array:', Array.isArray(flow?.nodes));
      console.log('Nodes length:', flow?.nodes?.length);
      
      if (flow && flow.nodes && Array.isArray(flow.nodes) && flow.nodes.length > 0) {
        console.log('✅ Loading AI-generated flow with', flow.nodes.length, 'nodes');
        setNodes(flow.nodes);
        if (flow.edges && Array.isArray(flow.edges)) {
          setEdges(flow.edges);
          console.log('✅ Loading', flow.edges.length, 'edges');
        }
        setIsInitialized(true);
      } else {
        console.log('❌ No valid flow found, using default nodes');
        setNodes(initialNodes);
        setIsInitialized(true);
      }
    } else if (!chatbotId && !isInitialized) {
      // New chatbot - use default nodes
      setNodes(initialNodes);
      setIsInitialized(true);
    }
  }, [chatbot, chatbotId, isInitialized, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      
      // Check if the dropped element is valid
      if (!type) {
        return;
      }

      // Get the position where the element is dropped
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: Date.now().toString(),
        type,
        position,
        data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const handleSave = () => {
    saveChatbotMutation.mutate({});
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

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            value={chatbotName}
            onChange={(e) => setChatbotName(e.target.value)}
            className="max-w-sm border-gray-300 text-lg font-semibold"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleTest}>
            <RiTestTubeLine className="mr-2" />
            Probar
          </Button>
          <Button variant="outline" size="sm" onClick={handlePublish} disabled={publishChatbotMutation.isPending}>
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
            
            <TabsContent value="settings">
              <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
                <h3 className="mb-4 text-lg font-medium">Configuración del Chatbot</h3>
                
                {/* Configuración Básica */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-600">Información Básica</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre del Chatbot</label>
                      <Input 
                        value={chatbotName}
                        onChange={(e) => setChatbotName(e.target.value)}
                        placeholder="Ej: Asistente de Ventas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Idioma Principal</label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="es">Español</option>
                        <option value="en">Inglés</option>
                        <option value="pt">Portugués</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Personalidad del Chatbot */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-600">Personalidad</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tono de Comunicación</label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="profesional">Profesional</option>
                        <option value="amigable">Amigable</option>
                        <option value="casual">Casual</option>
                        <option value="formal">Formal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Estilo de Respuesta</label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="conciso">Conciso</option>
                        <option value="detallado">Detallado</option>
                        <option value="conversacional">Conversacional</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Configuración de Multimedia */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-600">Elementos Multimedia</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="enableImages" className="rounded" defaultChecked />
                      <label htmlFor="enableImages" className="text-sm">Habilitar envío de imágenes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="enableVideos" className="rounded" defaultChecked />
                      <label htmlFor="enableVideos" className="text-sm">Habilitar envío de videos</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="enableAudios" className="rounded" defaultChecked />
                      <label htmlFor="enableAudios" className="text-sm">Habilitar mensajes de audio</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="enableDocuments" className="rounded" />
                      <label htmlFor="enableDocuments" className="text-sm">Habilitar envío de documentos</label>
                    </div>
                  </div>
                </div>

                {/* Configuración Avanzada */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-600">Configuración Avanzada</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tiempo de espera antes de escalamiento (minutos)</label>
                      <Input type="number" defaultValue="5" className="w-32" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Máximo de intentos por conversación</label>
                      <Input type="number" defaultValue="3" className="w-32" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="enableFallback" className="rounded" defaultChecked />
                      <label htmlFor="enableFallback" className="text-sm">Habilitar respuesta de respaldo cuando no entienda</label>
                    </div>
                  </div>
                </div>

                {/* Horarios de Funcionamiento */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-600">Horarios de Funcionamiento</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Hora de inicio</label>
                      <Input type="time" defaultValue="08:00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Hora de fin</label>
                      <Input type="time" defaultValue="18:00" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Días activos</label>
                    <div className="flex flex-wrap gap-2">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                        <label key={day} className="flex items-center space-x-1">
                          <input type="checkbox" className="rounded" defaultChecked={day !== 'Sáb' && day !== 'Dom'} />
                          <span className="text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mensajes Automáticos */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-600">Mensajes Automáticos</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Mensaje de bienvenida</label>
                      <textarea 
                        className="w-full p-2 border rounded-md h-20" 
                        placeholder="Ej: ¡Hola! Bienvenido a nuestro servicio..."
                        defaultValue="¡Hola! 👋 Bienvenido, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Mensaje fuera de horario</label>
                      <textarea 
                        className="w-full p-2 border rounded-md h-20" 
                        placeholder="Mensaje cuando esté fuera del horario de atención..."
                        defaultValue="Gracias por contactarnos. Nuestro horario de atención es de 8:00 AM a 6:00 PM. Te responderemos tan pronto como sea posible."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={() => {
                    toast({
                      title: "Configuración guardada",
                      description: "Los cambios se han aplicado correctamente",
                    });
                  }} className="w-full">
                    Guardar Configuración
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="integrations">
              <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
                <h3 className="mb-4 text-lg font-medium">Integraciones</h3>
                
                {/* WhatsApp Integration */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">W</span>
                      </div>
                      <div>
                        <h4 className="font-medium">WhatsApp Business</h4>
                        <p className="text-sm text-gray-600">Conecta con la API oficial de WhatsApp</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">● Conectado</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Número de teléfono</label>
                      <Input placeholder="+1234567890" defaultValue="+573001234567" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Token de verificación</label>
                      <Input type="password" placeholder="Ingresa tu token de WhatsApp" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="enableWebhooks" className="rounded" defaultChecked />
                      <label htmlFor="enableWebhooks" className="text-sm">Habilitar webhooks para mensajes entrantes</label>
                    </div>
                  </div>
                </div>

                {/* CRM Integration */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">C</span>
                      </div>
                      <div>
                        <h4 className="font-medium">CRM Interno</h4>
                        <p className="text-sm text-gray-600">Sincroniza contactos y conversaciones</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">● Activo</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="autoCreateContacts" className="rounded" defaultChecked />
                      <label htmlFor="autoCreateContacts" className="text-sm">Crear contactos automáticamente</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="syncConversations" className="rounded" defaultChecked />
                      <label htmlFor="syncConversations" className="text-sm">Sincronizar historial de conversaciones</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="enableTags" className="rounded" />
                      <label htmlFor="enableTags" className="text-sm">Etiquetar contactos automáticamente</label>
                    </div>
                  </div>
                </div>

                {/* Analytics Integration */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">A</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Analytics Avanzado</h4>
                        <p className="text-sm text-gray-600">Seguimiento detallado de métricas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">● Activo</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="trackConversions" className="rounded" defaultChecked />
                      <label htmlFor="trackConversions" className="text-sm">Rastrear conversiones</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="trackEngagement" className="rounded" defaultChecked />
                      <label htmlFor="trackEngagement" className="text-sm">Métricas de engagement</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="exportData" className="rounded" />
                      <label htmlFor="exportData" className="text-sm">Exportación automática de datos</label>
                    </div>
                  </div>
                </div>

                {/* External Integrations */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-600">Integraciones Externas</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Zapier */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Z</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Zapier</p>
                          <p className="text-xs text-gray-600">Automatizaciones</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Conectar
                      </Button>
                    </div>

                    {/* Slack */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">S</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Slack</p>
                          <p className="text-xs text-gray-600">Notificaciones</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Conectar
                      </Button>
                    </div>

                    {/* Google Sheets */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">G</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Google Sheets</p>
                          <p className="text-xs text-gray-600">Exportar datos</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Conectar
                      </Button>
                    </div>

                    {/* Email */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">@</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Email</p>
                          <p className="text-xs text-gray-600">Notificaciones</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Configurar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={() => {
                    toast({
                      title: "Integraciones actualizadas",
                      description: "Las configuraciones de integración se han guardado",
                    });
                  }} className="w-full">
                    Guardar Integraciones
                  </Button>
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
