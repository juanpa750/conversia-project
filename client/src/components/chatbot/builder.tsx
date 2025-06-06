import { useCallback, useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [chatbotName, setChatbotName] = useState('Nuevo Chatbot');
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Fetch chatbot data if editing existing chatbot
  const { data: chatbot, isLoading } = useQuery({
    queryKey: ["/api/chatbots", chatbotId],
    enabled: !!chatbotId,
  });

  // Load chatbot flow when data is available
  useEffect(() => {
    if (chatbot && chatbot.flow) {
      setChatbotName(chatbot.name);
      if (chatbot.flow.nodes) {
        setNodes(chatbot.flow.nodes);
      }
      if (chatbot.flow.edges) {
        setEdges(chatbot.flow.edges);
      }
    }
  }, [chatbot, setNodes, setEdges]);

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
    // In a real app, we would save the chatbot configuration to the backend
    console.log('Saving chatbot:', { name: chatbotName, nodes, edges });
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
          <Button variant="outline" size="sm">
            <RiTestTubeLine className="mr-2" />
            Probar
          </Button>
          <Button variant="outline" size="sm">
            <RiWhatsappLine className="mr-2" />
            Publicar
          </Button>
          <Button size="sm" onClick={handleSave}>
            <RiSave3Line className="mr-2" />
            Guardar
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
              <div className="p-4">
                <h3 className="mb-4 text-lg font-medium">Configuración del Chatbot</h3>
                <p>Configura los ajustes generales de tu chatbot.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="integrations">
              <div className="p-4">
                <h3 className="mb-4 text-lg font-medium">Integraciones</h3>
                <p>Conecta tu chatbot con otras aplicaciones y servicios.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ChatbotBuilder;
