import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiEyeLine } from "@/lib/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  client: {
    name: string;
    phone: string;
    avatarUrl: string;
  };
  lastMessage: {
    text: string;
    time: string;
  };
  status: "answered" | "pending" | "unanswered";
  chatbot: string;
}

const DUMMY_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    client: {
      name: "María González",
      phone: "+34 612 345 678",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    },
    lastMessage: {
      text: "¿Cuál es el horario de atención?",
      time: "Hace 5 minutos"
    },
    status: "answered",
    chatbot: "Soporte"
  },
  {
    id: "2",
    client: {
      name: "Carlos Martínez",
      phone: "+34 623 456 789",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    },
    lastMessage: {
      text: "Necesito información sobre precios",
      time: "Hace 15 minutos"
    },
    status: "pending",
    chatbot: "Ventas"
  },
  {
    id: "3",
    client: {
      name: "Juan López",
      phone: "+34 634 567 890",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    },
    lastMessage: {
      text: "Gracias por la ayuda",
      time: "Hace 30 minutos"
    },
    status: "answered",
    chatbot: "Soporte"
  },
  {
    id: "4",
    client: {
      name: "Ana Rodríguez",
      phone: "+34 645 678 901",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
    },
    lastMessage: {
      text: "¿Cómo puedo hacer un reclamo?",
      time: "Hace 1 hora"
    },
    status: "unanswered",
    chatbot: "Información"
  }
];

const STATUS_STYLES = {
  answered: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  unanswered: "bg-red-100 text-red-800"
};

const STATUS_LABELS = {
  answered: "Respondido",
  pending: "Pendiente",
  unanswered: "Sin respuesta"
};

export function RecentConversations() {
  const [page, setPage] = useState(1);
  const pageSize = 4;
  
  // In a real application, we would fetch this data from the API
  const { data } = useQuery({
    queryKey: ["/api/conversations", { page, pageSize }],
    initialData: {
      conversations: DUMMY_CONVERSATIONS,
      total: 24
    }
  });
  
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Conversaciones Recientes</CardTitle>
          <Button variant="link" className="text-primary hover:text-primary-700">
            Ver todas
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Último mensaje
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Chatbot
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.conversations.map((conversation) => (
                <tr key={conversation.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage 
                          src={conversation.client.avatarUrl} 
                          alt={conversation.client.name} 
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {conversation.client.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {conversation.client.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {conversation.client.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">{conversation.lastMessage.text}</div>
                    <div className="text-xs text-gray-500">{conversation.lastMessage.time}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant="outline" className={cn(
                      "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                      STATUS_STYLES[conversation.status]
                    )}>
                      {STATUS_LABELS[conversation.status]}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {conversation.chatbot}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary-900">
                      <RiEyeLine />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
        <Button 
          variant="outline" 
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </Button>
        <div className="text-sm text-gray-500">
          Mostrando <span className="font-medium">1-4</span> de <span className="font-medium">{data.total}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          disabled={page * pageSize >= data.total}
          onClick={() => setPage(page + 1)}
        >
          Siguiente
        </Button>
      </CardFooter>
    </Card>
  );
}

export default RecentConversations;
