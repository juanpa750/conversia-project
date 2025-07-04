import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import "./index.css";

// Sidebar Component
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import Pages
import Dashboard from "./pages/dashboard";
import NotFound from "./pages/not-found";

interface NavItemProps {
  href: string;
  icon: string;
  children: React.ReactNode;
  active?: boolean;
}

function NavItem({ href, icon, children, active }: NavItemProps) {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 transition-colors",
        active && "border-r-4 border-blue-600 bg-blue-50 text-blue-900"
      )}>
        <span className={cn("mr-3 text-lg", active && "text-blue-600")}>{icon}</span>
        <span className="font-medium">{children}</span>
      </a>
    </Link>
  );
}

function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-full w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900">ConversIA</span>
            <p className="text-xs text-gray-500">SaaS ChatBot Platform</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="mb-3 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Principal
        </div>
        
        <NavItem href="/" icon="📊" active={location === "/"}>
          Dashboard
        </NavItem>
        
        <NavItem 
          href="/chatbots" 
          icon="🤖" 
          active={location.startsWith("/chatbots")}
        >
          Chatbots
        </NavItem>
        
        <NavItem 
          href="/store" 
          icon="🏪" 
          active={location.startsWith("/store")}
        >
          Productos
        </NavItem>
        
        <NavItem 
          href="/clients" 
          icon="👥" 
          active={location.startsWith("/clients")}
        >
          Clientes
        </NavItem>
        
        <NavItem 
          href="/analytics" 
          icon="📈" 
          active={location.startsWith("/analytics")}
        >
          Analytics
        </NavItem>
        
        <div className="mb-3 mt-6 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
          WhatsApp
        </div>
        
        <NavItem 
          href="/whatsapp-web" 
          icon="📱" 
          active={location.startsWith("/whatsapp-web")}
        >
          Conectar WhatsApp
        </NavItem>
        
        <NavItem 
          href="/master/dashboard" 
          icon="👑" 
          active={location.startsWith("/master")}
        >
          Dashboard Master
        </NavItem>
        
        <div className="mb-3 mt-6 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Configuracion
        </div>
        
        <NavItem 
          href="/settings" 
          icon="⚙️" 
          active={location.startsWith("/settings")}
        >
          Ajustes
        </NavItem>
        
        <NavItem 
          href="/support" 
          icon="🎧" 
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
              src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5" 
              alt="Profile photo" 
            />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Usuario</p>
            <p className="text-xs text-gray-500">Plan Premium</p>
          </div>
          <div className="ml-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-gray-500"
            >
              ↗️
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Header Component
function Header({ onMobileMenuToggle }: { onMobileMenuToggle: () => void }) {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={onMobileMenuToggle}
          >
            ☰
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Panel de Control</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            📱 Conectar WhatsApp
          </Button>
        </div>
      </div>
    </header>
  );
}

// Layout Component
function Layout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMobileMenuToggle={() => setMobileNavOpen(!mobileNavOpen)} />
        
        {/* Main Scrollable Container */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
        <Toaster />
      </div>
    </LanguageProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);