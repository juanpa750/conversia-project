import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { RiRobotLine } from "@/lib/icons";

interface Template {
  id: string;
  name: string;
  description: string;
  category: "support" | "sales" | "information" | "other";
  difficulty: "basic" | "intermediate" | "advanced";
  popularity: number;
  imageUrl: string;
}

const DUMMY_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Soporte Básico",
    description: "Chatbot para resolver problemas comunes y preguntas frecuentes",
    category: "support",
    difficulty: "basic",
    popularity: 95,
    imageUrl: "",
  },
  {
    id: "2",
    name: "Asistente de Ventas",
    description: "Chatbot para promocionar productos y generar leads de ventas",
    category: "sales",
    difficulty: "intermediate",
    popularity: 87,
    imageUrl: "",
  },
  {
    id: "3",
    name: "FAQ Empresarial",
    description: "Responde preguntas frecuentes sobre tu empresa y servicios",
    category: "information",
    difficulty: "basic",
    popularity: 92,
    imageUrl: "",
  },
  {
    id: "4",
    name: "Reserva de Citas",
    description: "Permite a los clientes reservar citas automáticamente",
    category: "other",
    difficulty: "advanced",
    popularity: 78,
    imageUrl: "",
  },
  {
    id: "5",
    name: "Encuestas de Satisfacción",
    description: "Recopila feedback de tus clientes de forma automatizada",
    category: "support",
    difficulty: "intermediate",
    popularity: 82,
    imageUrl: "",
  },
  {
    id: "6",
    name: "Generador de Leads",
    description: "Captura datos de clientes potenciales con incentivos",
    category: "sales",
    difficulty: "intermediate",
    popularity: 89,
    imageUrl: "",
  },
];

const CATEGORY_BADGES = {
  support: "bg-blue-100 text-blue-800",
  sales: "bg-green-100 text-green-800",
  information: "bg-purple-100 text-purple-800",
  other: "bg-gray-100 text-gray-800",
};

const CATEGORY_LABELS = {
  support: "Soporte",
  sales: "Ventas",
  information: "Información",
  other: "Otros",
};

const DIFFICULTY_BADGES = {
  basic: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800",
};

const DIFFICULTY_LABELS = {
  basic: "Básico",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export function ChatbotTemplates() {
  // In a real application, we would fetch this data from the API
  const { data: templates } = useQuery({
    queryKey: ["/api/chatbot-templates"],
    initialData: DUMMY_TEMPLATES,
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Plantillas de Chatbot</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ahorra tiempo utilizando estas plantillas predefinidas para tu negocio
        </p>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="support">Soporte</TabsTrigger>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="information">Información</TabsTrigger>
          <TabsTrigger value="other">Otros</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>

        {["support", "sales", "information", "other"].map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates
                .filter((t) => t.category === category)
                .map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

function TemplateCard({ template }: { template: Template }) {
  return (
    <Card>
      <CardHeader className="relative border-b border-gray-100 pb-2">
        <div className="flex justify-between">
          <Badge variant="outline" className={CATEGORY_BADGES[template.category]}>
            {CATEGORY_LABELS[template.category]}
          </Badge>
          <Badge variant="outline" className={DIFFICULTY_BADGES[template.difficulty]}>
            {DIFFICULTY_LABELS[template.difficulty]}
          </Badge>
        </div>
        <CardTitle className="mt-2">{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-center">
          {template.imageUrl ? (
            <img 
              src={template.imageUrl} 
              alt={template.name} 
              className="h-32 w-full rounded-md object-cover"
            />
          ) : (
            <div className="flex h-32 w-full items-center justify-center rounded-md bg-gray-100">
              <RiRobotLine className="h-16 w-16 text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Popularidad: <span className="font-medium">{template.popularity}%</span>
          </div>
          <div className="h-2 w-32 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${template.popularity}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-100 bg-gray-50">
        <div className="flex w-full space-x-2">
          <Button variant="outline" className="flex-1">
            Ver detalles
          </Button>
          <Button className="flex-1" asChild>
            <Link href={`/chatbots/builder?template=${template.id}`}>
              Utilizar
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ChatbotTemplates;
