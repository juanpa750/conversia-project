import { Link, useLocation } from "wouter";

const menuItems = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/chatbots", label: "Chatbots", icon: "🤖" },
  { path: "/whatsapp", label: "WhatsApp", icon: "📱" },
  { path: "/crm", label: "CRM", icon: "👥" },
  { path: "/analytics", label: "Analytics", icon: "📈" },
  { path: "/settings", label: "Configuración", icon: "⚙️" }
];

export default function SimpleSidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">ConversIA</h1>
        <p className="text-sm text-gray-500">Chatbots WhatsApp</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path} className={`flex items-center p-3 rounded-lg transition-colors ${
                location === item.path 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">U</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Usuario</p>
            <p className="text-xs text-gray-500">Plan Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
}