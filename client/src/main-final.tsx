import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./index.css";

// Import Dashboard directly
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

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);