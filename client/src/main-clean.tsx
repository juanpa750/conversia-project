import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem', 
      fontFamily: 'Inter, Arial, sans-serif',
      backgroundColor: '#f8fafc',
      color: '#0f172a'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}>
          ConversIA
        </h1>
        <h2 style={{ 
          fontSize: '1.25rem', 
          color: '#64748b', 
          marginBottom: '2rem' 
        }}>
          Plataforma SaaS Avanzada de Chatbots para WhatsApp
        </h2>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Estado del Sistema</h3>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#dcfce7', 
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            ✅ Aplicación funcionando correctamente
          </div>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#dbeafe', 
            border: '1px solid #93c5fd',
            borderRadius: '8px'
          }}>
            ℹ️ Nueva arquitectura modular implementada
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Funcionalidades Principales</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
              🤖 Sistema de Chatbots Inteligente
            </li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
              📱 Integración WhatsApp Robusta
            </li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
              📊 CRM Empresarial Completo
            </li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
              🧠 IA Avanzada con Análisis de Sentimientos
            </li>
            <li style={{ padding: '0.5rem 0' }}>
              📈 Analytics y Reportes en Tiempo Real
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}