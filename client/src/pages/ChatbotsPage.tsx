export default function ChatbotsPage() {
  const chatbots = [
    { id: 1, name: "Soporte Técnico", status: "Activo", mensajes: 247, conversion: "23.5%" },
    { id: 2, name: "Ventas Principal", status: "Activo", mensajes: 156, conversion: "18.2%" },
    { id: 3, name: "Atención Cliente", status: "Pausado", mensajes: 89, conversion: "15.8%" }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Chatbots</h1>
        <p className="text-gray-600">Administra tus chatbots inteligentes de WhatsApp</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">8</div>
          <div className="text-gray-600">Chatbots Activos</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">492</div>
          <div className="text-gray-600">Mensajes Hoy</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">19.2%</div>
          <div className="text-gray-600">Tasa Conversión</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">4.2s</div>
          <div className="text-gray-600">Tiempo Respuesta</div>
        </div>
      </div>

      {/* Chatbots List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Mis Chatbots</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              + Nuevo Chatbot
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {chatbots.map((bot) => (
              <div key={bot.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{bot.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bot.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bot.status}
                      </span>
                      <span>{bot.mensajes} mensajes</span>
                      <span>{bot.conversion} conversión</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    ⚙️ Configurar
                  </button>
                  <button className="text-green-600 hover:text-green-800">
                    📊 Analytics
                  </button>
                  <button className="text-gray-600 hover:text-gray-800">
                    ⋮
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}