import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiAddLine, RiMessage3Line, RiSettings3Line, RiPlayLine, RiPauseLine } from "@/lib/icons";

export default function Chatbots() {
  const [chatbots] = useState([
    {
      id: 1,
      name: "Ventas WhatsApp",
      description: "Chatbot para ventas y consultas generales",
      status: "active",
      whatsappNumber: "+1 234 567 8901",
      messagesCount: 1547,
      lastActivity: "Hace 2 minutos"
    },
    {
      id: 2,
      name: "Soporte Técnico",
      description: "Asistente para resolver dudas técnicas",
      status: "inactive",
      whatsappNumber: "+1 234 567 8902",
      messagesCount: 832,
      lastActivity: "Hace 1 hora"
    },
    {
      id: 3,
      name: "Reservas y Citas",
      description: "Gestión automática de reservas",
      status: "active",
      whatsappNumber: "+1 234 567 8903",
      messagesCount: 2103,
      lastActivity: "Hace 5 minutos"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Chatbots</h1>
          <p className="text-gray-600">Administra tus chatbots inteligentes de WhatsApp</p>
        </div>
        <Button>
          <RiAddLine className="mr-2" />
          Crear Chatbot
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RiMessage3Line className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Chatbots</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <RiPlayLine className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <RiPauseLine className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <RiMessage3Line className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mensajes Hoy</p>
                <p className="text-2xl font-bold text-gray-900">4,482</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chatbots List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {chatbots.map((chatbot) => (
          <Card key={chatbot.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                  <CardDescription>{chatbot.description}</CardDescription>
                </div>
                <Badge 
                  variant={chatbot.status === 'active' ? 'default' : 'secondary'}
                  className={chatbot.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {chatbot.status === 'active' ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-600">WhatsApp:</span>
                  <span className="ml-2">{chatbot.whatsappNumber}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Mensajes:</span>
                  <span className="ml-2">{chatbot.messagesCount.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Última actividad:</span>
                  <span className="ml-2">{chatbot.lastActivity}</span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <RiSettings3Line className="mr-2 h-4 w-4" />
                    Configurar
                  </Button>
                  <Button 
                    variant={chatbot.status === 'active' ? 'destructive' : 'default'} 
                    size="sm"
                    className="flex-1"
                  >
                    {chatbot.status === 'active' ? (
                      <>
                        <RiPauseLine className="mr-2 h-4 w-4" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <RiPlayLine className="mr-2 h-4 w-4" />
                        Activar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}