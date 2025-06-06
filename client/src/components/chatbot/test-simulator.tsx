import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RiSendPlane2Fill, RiRobotLine, RiUserLine } from '@/lib/icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface TestSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  chatbotName: string;
  nodes: any[];
  edges: any[];
}

export function TestSimulator({ isOpen, onClose, chatbotName, nodes, edges }: TestSimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Reset conversation and start with welcome message
      setMessages([]);
      setCurrentNodeId(null);
      initializeConversation();
    }
  }, [isOpen, nodes]);

  const initializeConversation = () => {
    // Find the start/welcome node
    const startNode = nodes.find(node => 
      node.type === 'start' || 
      node.id === 'welcome' ||
      node.data?.label?.toLowerCase().includes('bienvenida')
    );

    if (startNode) {
      setCurrentNodeId(startNode.id);
      const welcomeMessage = startNode.data?.message || 
        startNode.data?.label || 
        `¡Hola! Soy ${chatbotName}. ¿En qué puedo ayudarte?`;
      
      addBotMessage(welcomeMessage);
    } else {
      // Fallback welcome message
      addBotMessage(`¡Hola! Soy ${chatbotName}. ¿En qué puedo ayudarte?`);
    }
  };

  const addBotMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const processUserInput = (input: string) => {
    addUserMessage(input);

    // Find current node
    const currentNode = nodes.find(node => node.id === currentNodeId);
    
    if (currentNode) {
      // Find connected nodes (next responses)
      const connectedEdges = edges.filter(edge => edge.source === currentNodeId);
      
      if (connectedEdges.length > 0) {
        // Get next node
        const nextNodeId = connectedEdges[0].target;
        const nextNode = nodes.find(node => node.id === nextNodeId);
        
        if (nextNode) {
          setCurrentNodeId(nextNodeId);
          const response = nextNode.data?.message || 
            nextNode.data?.label || 
            'Gracias por tu mensaje. ¿Hay algo más en lo que pueda ayudarte?';
          
          setTimeout(() => {
            addBotMessage(response);
          }, 1000); // Simulate typing delay
        } else {
          // End of conversation
          setTimeout(() => {
            addBotMessage('Gracias por contactarnos. ¿Hay algo más en lo que pueda ayudarte?');
          }, 1000);
        }
      } else {
        // No more nodes, provide generic response
        setTimeout(() => {
          addBotMessage('Entiendo. ¿Puedes proporcionar más detalles sobre tu consulta?');
        }, 1000);
      }
    } else {
      // Generic response when no flow is defined
      setTimeout(() => {
        addBotMessage('Gracias por tu mensaje. Un agente se pondrá en contacto contigo pronto.');
      }, 1000);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      processUserInput(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <DialogTitle className="flex items-center gap-2">
            <RiRobotLine className="h-5 w-5" />
            Simulador de {chatbotName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 py-2">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className={`w-8 h-8 ${
                  message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-500'
                }`}>
                  <AvatarFallback className="text-white text-xs">
                    {message.sender === 'user' ? (
                      <RiUserLine className="w-4 h-4" />
                    ) : (
                      <RiRobotLine className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="sm">
              <RiSendPlaneFill className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}