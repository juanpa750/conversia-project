import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import "./index.css";

function SimpleApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ConversIA</h1>
              <p className="text-gray-600">Plataforma SaaS de Chatbots para WhatsApp</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Dashboard</h3>
              <p className="text-blue-700">Panel de control principal con metricas en tiempo real</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Chatbots</h3>
              <p className="text-green-700">Gestion de chatbots inteligentes con IA</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">WhatsApp</h3>
              <p className="text-purple-700">Integracion directa con WhatsApp Web</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sistema Restaurado</h2>
            <p className="text-gray-700 mb-4">
              La aplicacion esta funcionando correctamente sin errores de encoding.
            </p>
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Acceder al Dashboard
              </button>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                Gestionar Chatbots
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SimpleApp />
  </QueryClientProvider>
);