import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RiWhatsappLine, 
  RiQrCodeLine, 
  RiRobotLine, 
  RiArrowRightLine,
  RiSparklingLine,
  RiLightbulbLine,
  RiShieldCheckLine
} from 'react-icons/ri';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header de bienvenida */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            ¡Bienvenido a BotMaster!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            La plataforma más simple para crear chatbots de WhatsApp con IA. 
            Conecta tu WhatsApp en segundos y comienza a automatizar tus conversaciones.
          </p>
        </div>

        {/* Resumen de Actividad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <CardHeader className="text-center">
              <RiRobotLine className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-xl text-gray-900 dark:text-white">Chatbots Activos</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">3</div>
              <p className="text-gray-600 dark:text-gray-300">bots funcionando</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardHeader className="text-center">
              <RiWhatsappLine className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-xl text-gray-900 dark:text-white">WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">Listo para usar</div>
              <p className="text-gray-600 dark:text-gray-300">3 pasos simples</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardHeader className="text-center">
              <RiSparklingLine className="w-10 h-10 text-purple-500 mx-auto mb-2" />
              <CardTitle className="text-xl text-gray-900 dark:text-white">Citas Programadas</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">3</div>
              <p className="text-gray-600 dark:text-gray-300">próximas citas</p>
            </CardContent>
          </Card>
        </div>

        {/* Acceso Rápido */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white">Acceso Rápido</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Accede directamente a las funciones principales de BotMaster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2 text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <RiWhatsappLine className="w-8 h-8 text-green-500 mx-auto" />
                <h3 className="font-semibold text-gray-900 dark:text-white">WhatsApp Chatbot</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Conecta en 3 pasos simples
                </p>
              </div>
              <div className="space-y-2 text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <RiRobotLine className="w-8 h-8 text-blue-500 mx-auto" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Gestionar Chatbots</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Ver y configurar tus bots
                </p>
              </div>
              <div className="space-y-2 text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <RiSparklingLine className="w-8 h-8 text-purple-500 mx-auto" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Calendario</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Revisar citas programadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opciones adicionales */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Múltiples cuentas */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RiWhatsappLine className="w-5 h-5 text-green-500" />
                Múltiples Cuentas WhatsApp
              </CardTitle>
              <CardDescription>
                Para negocios que necesitan múltiples números de WhatsApp especializados por producto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <RiShieldCheckLine className="w-4 h-4 text-green-500" />
                  Un número por producto o servicio
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <RiShieldCheckLine className="w-4 h-4 text-green-500" />
                  Respuestas especializadas según el contexto
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <RiShieldCheckLine className="w-4 h-4 text-green-500" />
                  Sistema de prioridades para gestión avanzada
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/whatsapp/multi-accounts'}
              >
                Gestionar Múltiples Cuentas
              </Button>
            </CardContent>
          </Card>

          {/* Configuración avanzada */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RiLightbulbLine className="w-5 h-5 text-blue-500" />
                Configuración Avanzada
              </CardTitle>
              <CardDescription>
                Para usuarios que necesitan integración completa con WhatsApp Business API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <RiShieldCheckLine className="w-4 h-4 text-blue-500" />
                  Integración con WhatsApp Business API
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <RiShieldCheckLine className="w-4 h-4 text-blue-500" />
                  Webhooks y configuración personalizada
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <RiShieldCheckLine className="w-4 h-4 text-blue-500" />
                  Para desarrolladores y usuarios técnicos
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/whatsapp'}
              >
                Configuración Avanzada
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas rápidas o próximas funcionalidades */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-gray-900 dark:text-white">
              ¿Por qué elegir BotMaster?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">30 seg</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tiempo promedio de configuración
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">99%</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Disponibilidad del servicio
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tu chatbot siempre activo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}