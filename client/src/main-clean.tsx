import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useState } from "react";
import "./index.css";

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const pages = [
    { id: 'dashboard', title: 'Dashboard', icon: '📊' },
    { id: 'chatbots', title: 'Chatbots', icon: '🤖' },
    { id: 'whatsapp', title: 'WhatsApp', icon: '📱' },
    { id: 'crm', title: 'CRM', icon: '📋' },
    { id: 'analytics', title: 'Analytics', icon: '📈' }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="mb-4 text-slate-800 font-semibold">Estado del Sistema</h3>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                ✅ Aplicación funcionando correctamente
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                ℹ️ Nueva arquitectura modular implementada
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="mb-4 text-slate-800 font-semibold">Funcionalidades Principales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pages.slice(1).map((page) => (
                  <div key={page.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                       onClick={() => setCurrentPage(page.id)}>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{page.icon}</span>
                      <span className="font-medium">{page.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'chatbots':
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h3 className="mb-4 text-slate-800 font-semibold">Sistema de Chatbots Inteligente</h3>
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-medium mb-2">Builder Visual Avanzado</h4>
                <p className="text-slate-600">Constructor visual con drag & drop fluido para crear flujos conversacionales.</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-medium mb-2">Templates por Industria</h4>
                <p className="text-slate-600">Más de 20 plantillas especializadas por sector empresarial.</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-medium mb-2">IA Conversacional</h4>
                <p className="text-slate-600">Integración con GPT-4 para respuestas inteligentes y contextuales.</p>
              </div>
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="mb-4 text-slate-800 font-semibold">Gestión de Conexiones WhatsApp</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((sessionId) => (
                  <div key={sessionId} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Sesión {sessionId}</h4>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-slate-600">Conectado</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-center h-32">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📱</div>
                        <div className="text-xs text-slate-500">QR Code</div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-600">
                      <p>Número: +1234567890{sessionId}</p>
                      <p>Mensajes hoy: {Math.floor(Math.random() * 100) + 20}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="mb-4 text-slate-800 font-semibold">Características Técnicas</h3>
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-medium mb-2">Multi-Sesión Simultánea</h4>
                  <p className="text-slate-600">Hasta 50 números de WhatsApp conectados simultáneamente.</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-medium mb-2">QR Auto-Renovable</h4>
                  <p className="text-slate-600">Códigos QR que se renuevan automáticamente cada 24 horas.</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-medium mb-2">Failover Automático</h4>
                  <p className="text-slate-600">Reconexión automática en caso de desconexión de red.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'crm':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-blue-600">847</div>
                <div className="text-sm text-slate-600">Contactos Totales</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-green-600">124</div>
                <div className="text-sm text-slate-600">Leads Calificados</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-purple-600">$45,280</div>
                <div className="text-sm text-slate-600">Ventas del Mes</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-orange-600">14.6%</div>
                <div className="text-sm text-slate-600">Tasa Conversión</div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="mb-4 text-slate-800 font-semibold">Pipeline de Ventas</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { stage: 'Interés', count: 45, color: 'blue' },
                  { stage: 'Contactado', count: 32, color: 'yellow' },
                  { stage: 'Propuesta', count: 18, color: 'orange' },
                  { stage: 'Negociación', count: 12, color: 'purple' },
                  { stage: 'Cerrado', count: 8, color: 'green' }
                ].map((stage) => (
                  <div key={stage.stage} className="p-4 border border-slate-200 rounded-lg">
                    <div className="text-center">
                      <div className={`text-xl font-bold text-${stage.color}-600`}>{stage.count}</div>
                      <div className="text-sm text-slate-600">{stage.stage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="mb-4 text-slate-800 font-semibold">Contactos Recientes</h3>
              <div className="space-y-3">
                {[
                  { name: 'Carlos Mendoza', phone: '+52 55 1234 5678', stage: 'Interés', time: '2 min' },
                  { name: 'Ana García', phone: '+52 33 9876 5432', stage: 'Propuesta', time: '15 min' },
                  { name: 'Luis Rodríguez', phone: '+52 81 5555 4444', stage: 'Contactado', time: '1 hora' },
                  { name: 'María López', phone: '+52 222 333 4444', stage: 'Negociación', time: '3 horas' }
                ].map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-slate-500">{contact.phone}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-600">{contact.stage}</div>
                      <div className="text-xs text-slate-500">{contact.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-blue-600">2,847</div>
                <div className="text-sm text-slate-600">Mensajes Enviados</div>
                <div className="text-xs text-green-600">+12.5% vs ayer</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-green-600">68.3%</div>
                <div className="text-sm text-slate-600">Tasa de Respuesta</div>
                <div className="text-xs text-green-600">+5.2% vs ayer</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-purple-600">4.2s</div>
                <div className="text-sm text-slate-600">Tiempo de Respuesta</div>
                <div className="text-xs text-red-600">+0.8s vs ayer</div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="mb-4 text-slate-800 font-semibold">Embudo de Conversión</h3>
              <div className="space-y-4">
                {[
                  { stage: 'Mensaje Recibido', count: 1000, percent: 100, color: 'bg-blue-500' },
                  { stage: 'Chatbot Respondió', count: 950, percent: 95, color: 'bg-green-500' },
                  { stage: 'Usuario Interactuó', count: 720, percent: 72, color: 'bg-yellow-500' },
                  { stage: 'Información Capturada', count: 480, percent: 48, color: 'bg-orange-500' },
                  { stage: 'Lead Generado', count: 180, percent: 18, color: 'bg-purple-500' }
                ].map((stage) => (
                  <div key={stage.stage} className="flex items-center space-x-4">
                    <div className="w-32 text-sm font-medium">{stage.stage}</div>
                    <div className="flex-1 bg-slate-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${stage.color}`}
                        style={{ width: `${stage.percent}%` }}
                      ></div>
                    </div>
                    <div className="w-20 text-right">
                      <div className="font-medium">{stage.count}</div>
                      <div className="text-xs text-slate-500">{stage.percent}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h3 className="mb-4 text-slate-800 font-semibold">Rendimiento por Chatbot</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Soporte Técnico', messages: 1247, conversion: 23.5 },
                    { name: 'Ventas Principal', messages: 856, conversion: 18.2 },
                    { name: 'Atención Cliente', messages: 744, conversion: 15.8 }
                  ].map((bot) => (
                    <div key={bot.name} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                      <div>
                        <div className="font-medium">{bot.name}</div>
                        <div className="text-sm text-slate-500">{bot.messages} mensajes</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">{bot.conversion}%</div>
                        <div className="text-xs text-slate-500">conversión</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h3 className="mb-4 text-slate-800 font-semibold">Horarios de Mayor Actividad</h3>
                <div className="space-y-2">
                  {[
                    { hour: '09:00', activity: 85 },
                    { hour: '10:00', activity: 92 },
                    { hour: '11:00', activity: 78 },
                    { hour: '14:00', activity: 96 },
                    { hour: '15:00', activity: 88 },
                    { hour: '16:00', activity: 72 }
                  ].map((time) => (
                    <div key={time.hour} className="flex items-center space-x-3">
                      <div className="w-12 text-sm font-medium">{time.hour}</div>
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${time.activity}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-right text-sm">{time.activity}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="p-8 pb-4">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            ConversIA
          </h1>
          <h2 className="text-xl text-slate-600">
            Plataforma SaaS Avanzada de Chatbots para WhatsApp
          </h2>
        </div>

        {/* Navigation */}
        <div className="px-8 mb-8">
          <nav className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex space-x-1">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setCurrentPage(page.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    currentPage === page.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="mr-2">{page.icon}</span>
                  {page.title}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {renderPage()}
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