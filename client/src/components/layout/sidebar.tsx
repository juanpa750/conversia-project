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
  RiGalleryLine
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth-simple";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

function NavItem({ href, icon, children, active }: NavItemProps) {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50",
        active && "border-r-4 border-primary bg-primary-50 text-gray-900"
      )}>
        <span className={cn("mr-3", active && "text-primary")}>{icon}</span>
        <span>{children}</span>
      </a>
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center">
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
            <RiRobotLine className="text-xl" />
          </div>
          <span className="text-xl font-semibold text-gray-900">BotMaster</span>
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
          href="/integrations/whatsapp-connect" 
          icon={<RiWhatsappLine />} 
          active={location.startsWith("/integrations/whatsapp")}
        >
          WhatsApp
        </NavItem>
        
        <NavItem 
          href="/ai-advanced" 
          icon={<RiBrainLine />} 
          active={location.startsWith("/ai-advanced")}
        >
          IA Avanzada
        </NavItem>
        
        <NavItem 
          href="/store" 
          icon={<RiStore2Line />} 
          active={location.startsWith("/store")}
        >
          Tienda
        </NavItem>
        
        <NavItem 
          href="/campaigns" 
          icon={<RiAdvertisementLine />} 
          active={location.startsWith("/campaigns")}
        >
          Campañas
        </NavItem>
        
        <NavItem 
          href="/multimedia" 
          icon={<RiGalleryLine />} 
          active={location.startsWith("/multimedia")}
        >
          Multimedia
        </NavItem>
        
        <NavItem 
          href="/crm" 
          icon={<RiTeamLine />} 
          active={location.startsWith("/crm")}
        >
          CRM Avanzado
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
        
        <div className="mb-3 mt-6 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Avanzado
        </div>
        
        <NavItem 
          href="/multimedia" 
          icon={<RiGalleryLine />} 
          active={location.startsWith("/multimedia")}
        >
          Multimedia
        </NavItem>
        
        <NavItem 
          href="/integrations" 
          icon={<RiApps2Line />} 
          active={location.startsWith("/integrations")}
        >
          Integraciones
        </NavItem>
        
        <NavItem 
          href="/templates" 
          icon={<RiGalleryLine />} 
          active={location.startsWith("/templates")}
        >
          Templates
        </NavItem>
        
        <div className="mb-3 mt-6 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Configuración
        </div>
        
        <NavItem 
          href="/settings" 
          icon={<RiSettings3Line />} 
          active={location.startsWith("/settings")}
        >
          Ajustes
        </NavItem>
        
        <NavItem 
          href="/support" 
          icon={<RiCustomerService2Line />} 
          active={location.startsWith("/support")}
        >
          Soporte
        </NavItem>
      </nav>
      
      {/* User profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 border border-gray-200">
            <AvatarImage 
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5"} 
              alt="Profile photo" 
            />
            <AvatarFallback>
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
            </p>
            <p className="text-xs text-gray-500">Plan Premium</p>
          </div>
          <div className="ml-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-gray-500"
              onClick={logout}
            >
              <RiLogoutBoxRLine />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
