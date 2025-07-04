export default function WhatsAppPage() {
  const sessions = [
    { id: 1, numero: "+52 55 1234 5678", estado: "Conectado", mensajes: 45, qr: "📱" },
    { id: 2, numero: "+52 33 9876 5432", estado: "Conectado", mensajes: 32, qr: "📱" },
    { id: 3, numero: "+52 81 5555 4444", estado: "Desconectado", mensajes: 0, qr: "🔗" }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión WhatsApp</h1>
        <p className="text-gray-600">Administra múltiples conexiones de WhatsApp simultáneamente</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">3</div>
          <div className="text-gray-600">Sesiones Activas</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">2,847</div>
          <div className="text-gray-600">Mensajes Enviados</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">68.3%</div>
          <div className="text-gray-600">Tasa Respuesta</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">50</div>
          <div className="text-gray-600">Límite Sesiones</div>
        </div>
      </div>

      {/* Conexiones WhatsApp */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Conexiones WhatsApp</h2>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              + Nueva Conexión
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Sesión {session.id}</h3>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      session.estado === 'Conectado' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm ${
                      session.estado === 'Conectado' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {session.estado}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-4xl">{session.qr}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.estado === 'Conectado' ? 'Conectado' : 'Escanea QR'}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número:</span>
                    <span className="font-medium">{session.numero}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mensajes hoy:</span>
                    <span className="font-medium">{session.mensajes}</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700">
                    Configurar
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50">
                    Desconectar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Características */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Características Avanzadas</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-semibold mb-2">Auto-Reconexión</h3>
              <p className="text-gray-600 text-sm">Reconexión automática en caso de desconexión de red</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-2">Monitoreo 24/7</h3>
              <p className="text-gray-600 text-sm">Supervisión continua del estado de las conexiones</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">Respuesta Instantánea</h3>
              <p className="text-gray-600 text-sm">Tiempo de respuesta promedio menor a 2 segundos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}