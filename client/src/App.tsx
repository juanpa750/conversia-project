import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/layout";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Chatbots from "@/pages/chatbots";
import ChatbotBuilderPage from "@/pages/chatbots/builder";
import ChatbotTemplates from "@/pages/chatbots/templates";
import ProductConfig from "@/pages/chatbots/product-config";
import Clients from "@/pages/clients";
import Analytics from "@/pages/analytics";
import SubscriptionPlans from "@/pages/subscription/plans";
import SubscriptionCheckout from "@/pages/subscription/checkout";
import Settings from "@/pages/settings";
import Support from "@/pages/support";
import CRMDashboard from "@/pages/crm";
import CRMDashboardNew from "@/pages/crm/dashboard";
import WhatsAppConnect from "@/pages/integrations/whatsapp-connect";
import WhatsAppBotConfig from "@/pages/integrations/whatsapp-bot";
import WhatsAppIntegrationPage from "@/pages/integrations/whatsapp";
import WhatsAppCloudIntegration from "@/pages/integrations/whatsapp-cloud";
import MasterDashboard from "@/pages/master/dashboard";
import MultiWhatsAppAccounts from "@/pages/whatsapp/multi-accounts";
import WhatsAppSimpleConnect from "@/pages/whatsapp/simple-connect";
import WhatsApp from "@/pages/WhatsApp";
import WhatsAppAIDemo from "@/pages/demo/whatsapp-ai-demo";
import WhatsAppWeb from "@/pages/whatsapp-web";
import AIAdvanced from "@/pages/ai-advanced";
import ConversationControl from "@/pages/ai-advanced/conversation-control";
import Marketing from "@/pages/marketing";
import Reports from "@/pages/reports";
import Store from "@/pages/store";
import Multimedia from "@/pages/multimedia";
import Templates from "@/pages/templates";
import CRMAdvanced from "@/pages/crm/advanced";
import ContactScoring from "@/pages/crm/advanced/contact-scoring";
import Automations from "@/pages/crm/advanced/automations";
import RelationshipMapping from "@/pages/crm/advanced/relationship-mapping";
import PredictiveAnalysis from "@/pages/crm/advanced/predictive-analysis";
import SalesPipeline from "@/pages/crm/advanced/sales-pipeline";
import NurtureCampaigns from "@/pages/crm/advanced/nurture-campaigns";
import AIFlows from "@/pages/templates/ai-flows";
import CalendarPage from "@/pages/calendar";
import ChatbotConfig from "@/pages/chatbot-config";
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
    <LanguageProvider>
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
          <Route path="/chatbots/builder">
            <Layout>
              <ChatbotBuilderPage />
            </Layout>
          </Route>
          <Route path="/chatbots/builder/:id">
            {(params) => (
              <Layout>
                <ChatbotBuilderPage id={params.id} />
              </Layout>
            )}
          </Route>
          <Route path="/chatbots/templates">
            <Layout>
              <ChatbotTemplates />
            </Layout>
          </Route>
          <Route path="/chatbots/:id/product-config">
            {(params) => (
              <Layout>
                <ProductConfig chatbotId={params.id} />
              </Layout>
            )}
          </Route>
          <Route path="/chatbot-config">
            <Layout>
              <ChatbotConfig />
            </Layout>
          </Route>
          <Route path="/crm">
            <Layout>
              <CRMDashboardNew />
            </Layout>
          </Route>
          <Route path="/crm/legacy">
            <Layout>
              <CRMDashboard />
            </Layout>
          </Route>
          <Route path="/crm/advanced">
            <Layout>
              <CRMAdvanced />
            </Layout>
          </Route>
          <Route path="/crm/advanced/contact-scoring">
            <Layout>
              <ContactScoring />
            </Layout>
          </Route>
          <Route path="/crm/advanced/automations">
            <Layout>
              <Automations />
            </Layout>
          </Route>
          <Route path="/crm/advanced/relationship-mapping">
            <Layout>
              <RelationshipMapping />
            </Layout>
          </Route>
          <Route path="/crm/advanced/predictive-analysis">
            <Layout>
              <PredictiveAnalysis />
            </Layout>
          </Route>
          <Route path="/crm/advanced/sales-pipeline">
            <Layout>
              <SalesPipeline />
            </Layout>
          </Route>
          <Route path="/crm/advanced/nurture-campaigns">
            <Layout>
              <NurtureCampaigns />
            </Layout>
          </Route>
          <Route path="/calendar">
            <Layout>
              <CalendarPage />
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
          <Route path="/integrations/whatsapp">
            <Layout>
              <WhatsAppIntegrationPage />
            </Layout>
          </Route>
          <Route path="/integrations/whatsapp-cloud">
            <Layout>
              <WhatsAppCloudIntegration />
            </Layout>
          </Route>
          <Route path="/master/dashboard">
            <Layout>
              <MasterDashboard />
            </Layout>
          </Route>
          <Route path="/whatsapp">
            <Layout>
              <WhatsAppIntegrationPage />
            </Layout>
          </Route>
          <Route path="/whatsapp/multi-accounts">
            <Layout>
              <MultiWhatsAppAccounts />
            </Layout>
          </Route>
          <Route path="/whatsapp/simple">
            <Layout>
              <WhatsAppSimpleConnect />
            </Layout>
          </Route>
          <Route path="/whatsapp/setup">
            <Layout>
              <WhatsApp />
            </Layout>
          </Route>
          <Route path="/demo/whatsapp-ai">
            <Layout>
              <WhatsAppAIDemo />
            </Layout>
          </Route>
          <Route path="/whatsapp-web">
            <Layout>
              <WhatsAppWeb />
            </Layout>
          </Route>
          <Route path="/ai-advanced">
            <Layout>
              <AIAdvanced />
            </Layout>
          </Route>
          <Route path="/ai-advanced/conversation-control">
            <Layout>
              <ConversationControl />
            </Layout>
          </Route>
          <Route path="/store">
            <Layout>
              <Store />
            </Layout>
          </Route>
          <Route path="/multimedia">
            <Layout>
              <Multimedia />
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
              <Templates />
            </Layout>
          </Route>
          <Route path="/templates/ai-flows">
            <Layout>
              <AIFlows />
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
    </LanguageProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </LanguageProvider>
  );
}

export default App;
