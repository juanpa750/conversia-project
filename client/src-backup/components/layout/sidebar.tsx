import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  RiDashboardLine, 
  RiMessage3Line, 
  RiWhatsappLine, 
  RiUser3Line, 
  RiBarChart2Line, 
  RiSettings3Line, 
  RiCustomerService2Line,
  RiRobotLine,
  RiLogoutBoxRLine,
  RiBrainLine,
  RiStore2Line,
  RiAdvertisementLine,
  RiTeamLine,
  RiApps2Line,
  RiGalleryLine,
  RiCalendarLine
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

function NavItem({ href, icon, children, active = false }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        )}
      >
        <span className="mr-3 flex-shrink-0">{icon}</span>
        {children}
      </a>
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-full w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center">
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
            <RiRobotLine className="text-xl" />
          </div>
          <span className="text-xl font-semibold text-gray-900">ConversIA</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Principal
        </div>
        
        <NavItem href="/" icon={<RiDashboardLine />} active={location === "/"}>
          Dashboard
        </NavItem>
        
        <NavItem 
          href="/chatbots" 
          icon={<RiMessage3Line />} 
          active={location.startsWith("/chatbots")}
        >
          Chatbots
        </NavItem>
        
        <NavItem 
          href="/store" 
          icon={<RiStore2Line />} 
          active={location.startsWith("/store")}
        >
          Productos
        </NavItem>
        
        <NavItem 
          href="/clients" 
          icon={<RiUser3Line />} 
          active={location.startsWith("/clients")}
        >
          Clientes
        </NavItem>
        
        <NavItem 
          href="/analytics" 
          icon={<RiBarChart2Line />}
          active={location.startsWith("/analytics")}
        >
          Analytics
        </NavItem>

        <div className="mt-6 mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Herramientas
        </div>

        <NavItem 
          href="/whatsapp" 
          icon={<RiWhatsappLine />}
          active={location.startsWith("/whatsapp")}
        >
          WhatsApp
        </NavItem>

        <NavItem 
          href="/ai-flows" 
          icon={<RiBrainLine />}
          active={location.startsWith("/ai-flows")}
        >
          Flujos IA
        </NavItem>

        <NavItem 
          href="/templates" 
          icon={<RiGalleryLine />}
          active={location.startsWith("/templates")}
        >
          Plantillas
        </NavItem>

        <NavItem 
          href="/appointments" 
          icon={<RiCalendarLine />}
          active={location.startsWith("/appointments")}
        >
          Citas
        </NavItem>

        <div className="mt-6 mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Configuracion
        </div>

        <NavItem 
          href="/settings" 
          icon={<RiSettings3Line />}
          active={location.startsWith("/settings")}
        >
          Configuracion
        </NavItem>
      </nav>
      
      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatar.jpg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">Usuario</p>
            <p className="text-xs text-gray-500">Plan Basico</p>
          </div>
          <Button variant="ghost" size="sm">
            <RiLogoutBoxRLine className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}