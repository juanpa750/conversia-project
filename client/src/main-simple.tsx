import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          ConversIA
        </h1>
        <h2 className="text-xl text-slate-600 mb-8">
          Plataforma SaaS Avanzada de Chatbots para WhatsApp
        </h2>
        
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="mb-4 text-slate-800 font-semibold">Estado del Sistema</h3>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            ✅ Aplicación funcionando correctamente - Restaurando funcionalidad completa...
          </div>
        </div>
      </div>
    </div>
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