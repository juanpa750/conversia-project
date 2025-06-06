import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AssistantWizard } from "@/components/chatbot/assistant-wizard";
import {
  RiSearchLine,
  RiUser3Line,
  RiRobotLine,
  RiWhatsappLine,
  RiBarChart2Line,
  RiMenuLine,
  RiAddLine,
} from "@/lib/icons";

interface Chatbot {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft";
  type: "support" | "sales" | "information";
  messages: number;
  contacts: number;
  createdAt: string;
}



const TYPE_BADGES = {
  support: "bg-blue-100 text-blue-800",
  sales: "bg-green-100 text-green-800",
  information: "bg-purple-100 text-purple-800",
};

const TYPE_LABELS = {
  support: "Soporte",
  sales: "Ventas",
  information: "Información",
};

const STATUS_BADGES = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-yellow-100 text-yellow-800",
  draft: "bg-gray-100 text-gray-800",
};

const STATUS_LABELS = {
  active: "Activo",
  inactive: "Inactivo",
  draft: "Borrador",
};

export function Chatbots() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // Fetch chatbots data
  const { data: chatbots = [], isLoading } = useQuery({
    queryKey: ["/api/chatbots"],
  });

  const typedChatbots = (chatbots as any[]) || [];

  // Create chatbot mutation
  const createChatbot = useMutation({
    mutationFn: async (config: any) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        id: Date.now().toString(),
        name: config.name,
        description: config.description,
        status: 'draft' as const,
        type: 'sales' as const,
        messages: 0,
        contacts: 0,
        createdAt: new Date().toISOString().split('T')[0],
        objective: config.objective,
        aiInstructions: config.aiInstructions
      };
    },
    onSuccess: (newChatbot) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbots"] });
      toast({
        title: "Chatbot creado exitosamente",
        description: `${newChatbot.name} está listo para configurar.`,
      });
    }
  });

  const handleAssistantComplete = (config: any) => {
    createChatbot.mutate(config);
  };

  const filteredChatbots = typedChatbots.filter((chatbot: any) => {
    if (filter !== "all" && chatbot.type !== filter) {
      return false;
    }
    if (
      searchQuery &&
      !chatbot.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Chatbots</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona y edita tus chatbots de WhatsApp con asistencia IA
          </p>
        </div>
        <div className="flex space-x-3">
          <AssistantWizard onComplete={handleAssistantComplete} />
          <Button variant="outline" asChild>
            <Link href="/chatbots/builder">
              <RiAddLine className="mr-2" />
              Crear Manual
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <Tabs defaultValue="all" className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilter("all")}>
              Todos
            </TabsTrigger>
            <TabsTrigger value="support" onClick={() => setFilter("support")}>
              Soporte
            </TabsTrigger>
            <TabsTrigger value="sales" onClick={() => setFilter("sales")}>
              Ventas
            </TabsTrigger>
            <TabsTrigger
              value="information"
              onClick={() => setFilter("information")}
            >
              Información
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-64">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <RiSearchLine />
          </span>
          <Input
            type="text"
            placeholder="Buscar chatbot..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredChatbots.map((chatbot) => (
          <Card key={chatbot.id} className="overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <div className="flex justify-between">
                <Badge
                  variant="outline"
                  className={TYPE_BADGES[chatbot.type]}
                >
                  {TYPE_LABELS[chatbot.type]}
                </Badge>
                <Badge
                  variant="outline"
                  className={STATUS_BADGES[chatbot.status]}
                >
                  {STATUS_LABELS[chatbot.status]}
                </Badge>
              </div>
              <CardTitle className="mt-2">{chatbot.name}</CardTitle>
              <CardDescription>{chatbot.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">
                    {chatbot.messages}
                  </div>
                  <div className="text-xs text-gray-500">Mensajes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">
                    {chatbot.contacts}
                  </div>
                  <div className="text-xs text-gray-500">Contactos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">
                    {new Date(chatbot.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                  <div className="text-xs text-gray-500">Creado</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-gray-100 bg-gray-50">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/chatbots/builder/${chatbot.id}`}>Editar</Link>
              </Button>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <RiBarChart2Line />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <RiWhatsappLine />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <RiMenuLine />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Duplicar</DropdownMenuItem>
                    <DropdownMenuItem>Compartir</DropdownMenuItem>
                    <DropdownMenuItem>Desactivar</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredChatbots.length === 0 && (
        <Card className="mt-6 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-6">
              <RiRobotLine className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No se encontraron chatbots</h3>
            <p className="mb-6 max-w-md text-sm text-gray-500">
              {searchQuery
                ? `No hay resultados para "${searchQuery}"`
                : "Parece que aún no has creado ningún chatbot del tipo seleccionado."}
            </p>
            <Button asChild>
              <Link href="/chatbots/builder">
                <RiAddLine className="mr-2" />
                Crear nuevo chatbot
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default Chatbots;
