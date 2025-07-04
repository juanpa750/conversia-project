import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import "./index.css";

// Import pages
import Dashboard from "./pages/dashboard";
import NotFound from "./pages/not-found";

// Import layout
import Layout from "@/components/layout/layout";

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