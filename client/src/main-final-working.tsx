import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import "./index.css";

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Page Components
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">ConversIA</CardTitle>
          <CardDescription>
            Plataforma SaaS de Chatbots Inteligentes para WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-600 hover:underline text-sm"
            >
              {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard ConversIA</h1>
          <p className="text-gray-600">Gestiona tus chatbots inteligentes de WhatsApp</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Crear Nuevo Chatbot
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chatbots Activos</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-green-600">+2 esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mensajes Enviados</p>
                <p className="text-2xl font-bold text-gray-900">8,459</p>
                <p className="text-xs text-green-600">+24% vs mes anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contactos Nuevos</p>
                <p className="text-2xl font-bold text-gray-900">342</p>
                <p className="text-xs text-green-600">+8% esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa de Respuesta</p>
                <p className="text-2xl font-bold text-gray-900">94%</p>
                <p className="text-xs text-green-600">Excelente rendimiento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas interacciones con chatbots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1,2,3].map((item) => (
                <div key={item} className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>U{item}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Usuario {item}</p>
                    <p className="text-xs text-gray-500">Conversación iniciada hace {item} minutos</p>
                  </div>
                  <Badge variant={item === 1 ? "default" : "secondary"}>
                    {item === 1 ? "Activa" : "Finalizada"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Gestiona tu plataforma fácilmente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              Crear Chatbot Inteligente
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              Conectar Nuevo WhatsApp
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              Ver Analytics Detallados
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
        "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 transition-colors rounded-lg mx-2",
        active && "bg-blue-50 text-blue-900 border-r-4 border-blue-600"
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
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900">ConversIA</span>
            <p className="text-xs text-gray-500">SaaS Platform</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="mb-3 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Principal
        </div>
        
        <NavItem href="/dashboard" icon="📊" active={location === "/dashboard"}>
          Dashboard
        </NavItem>
        
        <NavItem href="/chatbots" icon="🤖" active={location.startsWith("/chatbots")}>
          Chatbots
        </NavItem>
        
        <NavItem href="/whatsapp" icon="📱" active={location.startsWith("/whatsapp")}>
          WhatsApp
        </NavItem>
        
        <NavItem href="/analytics" icon="📈" active={location.startsWith("/analytics")}>
          Analytics
        </NavItem>
        
        <NavItem href="/crm" icon="👥" active={location.startsWith("/crm")}>
          CRM
        </NavItem>
        
        <div className="mb-3 mt-6 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Configuración
        </div>
        
        <NavItem href="/settings" icon="⚙️" active={location.startsWith("/settings")}>
          Ajustes
        </NavItem>
        
        <NavItem href="/support" icon="🎧" active={location.startsWith("/support")}>
          Soporte
        </NavItem>
      </nav>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 border border-gray-200">
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">Plan Premium</p>
          </div>
          <div className="ml-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-gray-500"
              onClick={() => window.location.href = "/"}
            >
              ↗️
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Panel de Control ConversIA</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            📱 Conectar WhatsApp
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            + Nuevo Chatbot
          </Button>
        </div>
      </div>
    </header>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
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
      <Switch>
        <Route path="/" component={LoginPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/dashboard">
          <Layout>
            <DashboardPage />
          </Layout>
        </Route>
        <Route>
          <Layout>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Página en desarrollo</h2>
              <p className="text-gray-600 mt-2">Esta funcionalidad estará disponible pronto.</p>
              <Link href="/dashboard">
                <a className="text-blue-600 hover:underline mt-4 inline-block">
                  Volver al Dashboard
                </a>
              </Link>
            </div>
          </Layout>
        </Route>
      </Switch>
      <Toaster />
    </LanguageProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);