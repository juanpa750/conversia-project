import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Switch, Route } from "wouter";
import Layout from "@/components/layout/layout";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Dashboard from "@/pages/dashboard";
import Chatbots from "@/pages/chatbots";
import ChatbotBuilderPage from "@/pages/chatbots/builder";
import Clients from "@/pages/clients";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Support from "@/pages/support";
import CRMDashboard from "@/pages/crm";
import WhatsAppConnect from "@/pages/integrations/whatsapp-connect";
import MasterDashboard from "@/pages/master/dashboard-simple";
import WhatsApp from "@/pages/WhatsApp";
import NotFound from "@/pages/not-found";
import "./index.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="conversiaui-theme">
      <TooltipProvider delayDuration={100}>
        <LanguageProvider>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/">
              {(params) => (
                <Layout>
                  <Switch>
                    <Route path="/" component={Dashboard} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/chatbots" component={Chatbots} />
                    <Route path="/chatbots/builder/:id?" component={({ id }: { id?: string }) => <ChatbotBuilderPage id={id} />} />
                    <Route path="/clients" component={Clients} />
                    <Route path="/analytics" component={Analytics} />
                    <Route path="/settings" component={Settings} />
                    <Route path="/support" component={Support} />
                    <Route path="/crm" component={CRMDashboard} />
                    <Route path="/integrations/whatsapp-connect" component={WhatsAppConnect} />
                    <Route path="/master/dashboard" component={MasterDashboard} />
                    <Route path="/whatsapp" component={WhatsApp} />
                    <Route component={NotFound} />
                  </Switch>
                </Layout>
              )}
            </Route>
          </Switch>
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);