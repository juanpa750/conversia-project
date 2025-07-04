import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./index.css";

import Dashboard from "./pages/dashboard";

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Dashboard />
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