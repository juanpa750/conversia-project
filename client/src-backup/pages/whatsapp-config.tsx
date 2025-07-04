import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { RiSettings3Line, RiSaveLine, RiArrowLeftLine } from "react-icons/ri";
import { Link } from "wouter";

interface WhatsAppConfig {
  id?: number;
  businessName: string;
  businessDescription: string;
  greeting: string;
  fallbackMessage: string;
  workingHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
    message: string;
  };
  responseStyle: 'formal' | 'friendly' | 'professional';
  autoResponse: boolean;
  responseDelay: number;
  maxMessageLength: number;
}

export default function WhatsAppConfigPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current configuration
  const { data: config, isLoading } = useQuery<WhatsAppConfig>({
    queryKey: ['/api/whatsapp/config'],
    retry: false,
  });

  const [formData, setFormData] = useState<WhatsAppConfig>({
    businessName: config?.businessName || '',
    businessDescription: config?.businessDescription || '',
    greeting: config?.greeting || '¡Hola! 👋 Soy el asistente virtual. ¿En qué puedo ayudarte hoy?',
    fallbackMessage: config?.fallbackMessage || 'Disculpa, no entendí tu consulta. ¿Podrías ser más específico?',
    workingHours: config?.workingHours || {
      enabled: false,
      start: '09:00',
      end: '18:00',
      timezone: 'America/Mexico_City',
      message: 'Gracias por contactarnos. Nuestro horario de atención es de {start} a {end}. Te responderemos pronto.'
    },
    responseStyle: config?.responseStyle || 'friendly',
    autoResponse: config?.autoResponse ?? true,
    responseDelay: config?.responseDelay || 2,
    maxMessageLength: config?.maxMessageLength || 1000,
  });

  // Update form when config loads
  useState(() => {
    if (config) {
      setFormData(config);
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: WhatsAppConfig) => {
      return await apiRequest('POST', '/api/whatsapp/config', data);
    },
    onSuccess: () => {
      toast({
        title: 'Configuración guardada',
        description: 'La configuración de WhatsApp se ha actualizado correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/config'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error guardando la configuración',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateWorkingHours = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de WhatsApp</h1>
          <p className="text-gray-600">Personaliza el comportamiento del chatbot genérico de tu empresa</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/integrations/whatsapp-web">
            <RiArrowLeftLine className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Negocio</CardTitle>
          <CardDescription>
            Define la información básica que el chatbot usará para presentar tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="businessName">Nombre del Negocio</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => updateField('businessName', e.target.value)}
              placeholder="Ej: TechStore, Clínica Dental López"
            />
          </div>
          <div>
            <Label htmlFor="businessDescription">Descripción del Negocio</Label>
            <Textarea
              id="businessDescription"
              value={formData.businessDescription}
              onChange={(e) => updateField('businessDescription', e.target.value)}
              placeholder="Describe brevemente tu empresa: qué productos/servicios ofreces"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Message Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Mensajes</CardTitle>
          <CardDescription>
            Personaliza los mensajes que enviará el chatbot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="greeting">Mensaje de Bienvenida</Label>
            <Textarea
              id="greeting"
              value={formData.greeting}
              onChange={(e) => updateField('greeting', e.target.value)}
              placeholder="Mensaje que se envía al iniciar una conversación"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="fallbackMessage">Mensaje de No Comprensión</Label>
            <Textarea
              id="fallbackMessage"
              value={formData.fallbackMessage}
              onChange={(e) => updateField('fallbackMessage', e.target.value)}
              placeholder="Mensaje cuando el chatbot no entiende la consulta"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="responseStyle">Estilo de Respuesta</Label>
            <Select
              value={formData.responseStyle}
              onValueChange={(value: 'formal' | 'friendly' | 'professional') => 
                updateField('responseStyle', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Amigable y cercano</SelectItem>
                <SelectItem value="professional">Profesional</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Horario de Atención</CardTitle>
          <CardDescription>
            Define los horarios de atención y mensaje fuera de horario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="workingHoursEnabled"
              checked={formData.workingHours.enabled}
              onChange={(e) => updateWorkingHours('enabled', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="workingHoursEnabled">Activar horario de atención</Label>
          </div>
          
          {formData.workingHours.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Hora de Inicio</Label>
                  <Input
                    type="time"
                    id="startTime"
                    value={formData.workingHours.start}
                    onChange={(e) => updateWorkingHours('start', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Hora de Fin</Label>
                  <Input
                    type="time"
                    id="endTime"
                    value={formData.workingHours.end}
                    onChange={(e) => updateWorkingHours('end', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="outOfHoursMessage">Mensaje Fuera de Horario</Label>
                <Textarea
                  id="outOfHoursMessage"
                  value={formData.workingHours.message}
                  onChange={(e) => updateWorkingHours('message', e.target.value)}
                  placeholder="Mensaje a enviar fuera del horario de atención"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usa {'{start}'} y {'{end}'} para incluir las horas dinámicamente
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración Avanzada</CardTitle>
          <CardDescription>
            Ajustes técnicos del comportamiento del chatbot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoResponse"
              checked={formData.autoResponse}
              onChange={(e) => updateField('autoResponse', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="autoResponse">Respuesta automática activada</Label>
          </div>
          
          <div>
            <Label htmlFor="responseDelay">Retraso de Respuesta (segundos)</Label>
            <Input
              type="number"
              id="responseDelay"
              min="1"
              max="10"
              value={formData.responseDelay}
              onChange={(e) => updateField('responseDelay', parseInt(e.target.value))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tiempo de espera antes de enviar respuesta (simula escritura humana)
            </p>
          </div>
          
          <div>
            <Label htmlFor="maxMessageLength">Máximo de Caracteres por Mensaje</Label>
            <Input
              type="number"
              id="maxMessageLength"
              min="100"
              max="4000"
              value={formData.maxMessageLength}
              onChange={(e) => updateField('maxMessageLength', parseInt(e.target.value))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Los mensajes más largos se dividirán automáticamente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          className="min-w-[120px]"
        >
          <RiSaveLine className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </div>
  );
}