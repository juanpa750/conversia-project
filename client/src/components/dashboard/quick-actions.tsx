import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RiRobotLine, 
  RiWhatsappLine, 
  RiUserAddLine, 
  RiSettings3Line 
} from "@/lib/icons";

interface QuickActionItemProps {
  href: string;
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
}

function QuickActionItem({ href, icon, iconColor, title, description }: QuickActionItemProps) {
  return (
    <Link href={href} className="flex items-center rounded-lg bg-gray-50 p-3 transition duration-150 hover:bg-gray-100">
      <div 
        className={`flex h-10 w-10 items-center justify-center rounded-md ${iconColor}`}
      >
        {icon}
      </div>
      <div className="ml-3">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

export function QuickActions() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <QuickActionItem 
          href="/chatbots/builder"
          icon={<RiRobotLine className="text-xl" />}
          iconColor="bg-primary-100 text-primary-600"
          title="Crear nuevo chatbot"
          description="Configura un asistente para tu negocio"
        />
        
        <QuickActionItem 
          href="/whatsapp"
          icon={<RiWhatsappLine className="text-xl" />}
          iconColor="bg-green-100 text-green-600"
          title="Conectar WhatsApp"
          description="Integra la API de WhatsApp Business"
        />
        
        <QuickActionItem 
          href="/clients"
          icon={<RiUserAddLine className="text-xl" />}
          iconColor="bg-yellow-100 text-yellow-600"
          title="Invitar usuarios"
          description="Añade colaboradores a tu cuenta"
        />
        
        <QuickActionItem 
          href="/settings"
          icon={<RiSettings3Line className="text-xl" />}
          iconColor="bg-purple-100 text-purple-600"
          title="Configuración"
          description="Personaliza tus preferencias"
        />
      </CardContent>
    </Card>
  );
}

export default QuickActions;
