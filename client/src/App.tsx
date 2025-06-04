import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/layout";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Chatbots from "@/pages/chatbots";
import ChatbotBuilder from "@/pages/chatbots/builder";
import ChatbotTemplates from "@/pages/chatbots/templates";
import Clients from "@/pages/clients";
import Analytics from "@/pages/analytics";
import SubscriptionPlans from "@/pages/subscription/plans";
import SubscriptionCheckout from "@/pages/subscription/checkout";
import Settings from "@/pages/settings";
import Support from "@/pages/support";
import CRMDashboard from "@/pages/crm";
import WhatsAppConnect from "@/pages/integrations/whatsapp-connect";
import WhatsAppBotConfig from "@/pages/integrations/whatsapp-bot";
import AIAdvanced from "@/pages/ai-advanced";
import Marketing from "@/pages/marketing";
import Reports from "@/pages/reports";
import Store from "@/pages/store";
import { useAuth } from "@/hooks/use-auth-simple";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="*">
            <Login />
          </Route>
        </>
      ) : (
        <>
          <Route path="/">
            <Layout>
              <Dashboard />
            </Layout>
          </Route>
          <Route path="/chatbots">
            <Layout>
              <Chatbots />
            </Layout>
          </Route>
          <Route path="/chatbots/builder/:id">
            {(params) => (
              <Layout>
                <ChatbotBuilder id={params.id} />
              </Layout>
            )}
          </Route>
          <Route path="/chatbots/builder">
            <Layout>
              <ChatbotBuilder />
            </Layout>
          </Route>
          <Route path="/chatbots/templates">
            <Layout>
              <ChatbotTemplates />
            </Layout>
          </Route>
          <Route path="/crm">
            <Layout>
              <CRMDashboard />
            </Layout>
          </Route>
          <Route path="/clients">
            <Layout>
              <Clients />
            </Layout>
          </Route>
          <Route path="/analytics">
            <Layout>
              <Analytics />
            </Layout>
          </Route>
          <Route path="/subscription/plans">
            <Layout>
              <SubscriptionPlans />
            </Layout>
          </Route>
          <Route path="/subscription/checkout/:planId">
            {(params) => (
              <Layout>
                <SubscriptionCheckout planId={params.planId} />
              </Layout>
            )}
          </Route>
          <Route path="/settings">
            <Layout>
              <Settings />
            </Layout>
          </Route>
          <Route path="/support">
            <Layout>
              <Support />
            </Layout>
          </Route>
          <Route path="/integrations/whatsapp-connect">
            <Layout>
              <WhatsAppConnect />
            </Layout>
          </Route>
          <Route path="/integrations/whatsapp-bot">
            <Layout>
              <WhatsAppBotConfig />
            </Layout>
          </Route>
          <Route path="/ai-advanced">
            <Layout>
              <AIAdvanced />
            </Layout>
          </Route>
          <Route path="/store">
            <Layout>
              <Store />
            </Layout>
          </Route>
          <Route path="/campaigns">
            <Layout>
              <Marketing />
            </Layout>
          </Route>
          <Route path="/multimedia">
            <Layout>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Multimedia</h1>
                <p>Gestión de archivos multimedia para tus chatbots</p>
              </div>
            </Layout>
          </Route>
          <Route path="/integrations">
            <Layout>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Integraciones</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">WhatsApp Business</h3>
                    <p className="text-sm text-gray-600 mb-4">Conecta tu WhatsApp Business</p>
                    <a href="/integrations/whatsapp-connect" className="text-blue-600 hover:underline">Configurar</a>
                  </div>
                </div>
              </div>
            </Layout>
          </Route>
          <Route path="/templates">
            <Layout>
              <ChatbotTemplates />
            </Layout>
          </Route>
          <Route path="/reports">
            <Layout>
              <Reports />
            </Layout>
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
