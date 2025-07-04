import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route } from "wouter";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./index.css";

// Import the dashboard page that already exists
import Dashboard from "./pages/dashboard";

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route>
            <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-700 mb-4">ConversIA</h1>
                <p className="text-slate-600">Página no encontrada</p>
              </div>
            </div>
          </Route>
        </Switch>
      </div>
    </LanguageProvider>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}