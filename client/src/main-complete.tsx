import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import "./index.css";

// Import layout components
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

// Import pages
import Dashboard from "./pages/dashboard";
import Chatbots from "./pages/chatbots";
import Analytics from "./pages/analytics";
import Settings from "./pages/settings";
import CRMDashboard from "./pages/crm";
import NotFound from "./pages/not-found";

// Layout component
function Layout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMobileMenuToggle={toggleMobileNav} />
        
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
            <Route path="/chatbots" component={Chatbots} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/settings" component={Settings} />
            <Route path="/crm" component={CRMDashboard} />
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