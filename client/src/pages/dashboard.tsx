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

        {/* Opción Principal - WhatsApp Simple */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <RiWhatsappLine className="w-12 h-12 text-green-500" />
              <Badge className="bg-green-500 text-white px-4 py-1 text-sm">
                ¡RECOMENDADO!
              </Badge>
            </div>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">
              WhatsApp Simple - Conexión Instantánea
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
              La forma más rápida de conectar tu WhatsApp. Sin APIs complicadas, solo escanea un código QR.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <RiQrCodeLine className="w-8 h-8 text-green-500 mx-auto" />
                <h3 className="font-semibold text-gray-900 dark:text-white">1. Escanea QR</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Solo abre WhatsApp y escanea el código que aparece
                </p>
              </div>
              <div className="space-y-2">
                <RiRobotLine className="w-8 h-8 text-green-500 mx-auto" />
                <h3 className="font-semibold text-gray-900 dark:text-white">2. Configura IA</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Personaliza las respuestas automáticas de tu asistente
                </p>
              </div>
              <div className="space-y-2">
                <RiSparklingLine className="w-8 h-8 text-green-500 mx-auto" />
                <h3 className="font-semibold text-gray-900 dark:text-white">3. ¡Listo!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tu chatbot ya está funcionando y respondiendo mensajes
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                onClick={() => window.location.href = '/whatsapp/simple'}
              >
                <RiQrCodeLine className="w-5 h-5 mr-2" />
                Comenzar Ahora - WhatsApp Simple
                <RiArrowRightLine className="w-5 h-5 ml-2" />
              </Button>
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