import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Plus, Settings, User, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch appointments for selected date
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: [`/api/appointments?date=${selectedDate}`],
  });

  // Fetch available slots
  const { data: availableSlots = [] } = useQuery({
    queryKey: [`/api/calendar/available-slots?date=${selectedDate}`],
  });

  // Fetch calendar settings
  const { data: settings } = useQuery({
    queryKey: ['/api/calendar/settings'],
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/appointments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/available-slots'] });
      setIsNewAppointmentOpen(false);
      toast({
        title: "Cita creada",
        description: "La cita ha sido agendada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la cita",
        variant: "destructive",
      });
    },
  });

  // Update appointment status mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest('PUT', `/api/appointments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Cita actualizada",
        description: "El estado de la cita ha sido actualizado",
      });
    },
  });

  const handleCreateAppointment = (formData: FormData) => {
    const data = {
      title: formData.get('title'),
      contactName: formData.get('contactName'),
      contactPhone: formData.get('contactPhone'),
      contactEmail: formData.get('contactEmail'),
      scheduledDate: new Date(`${selectedDate}T${formData.get('time')}`).toISOString(),
      duration: parseInt(formData.get('duration') as string),
      serviceType: formData.get('serviceType'),
      description: formData.get('description'),
    };
    createAppointmentMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Calendario de Citas
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus citas y horarios de disponibilidad
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configuración del Calendario</DialogTitle>
              </DialogHeader>
              <CalendarSettings settings={settings} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nueva Cita</DialogTitle>
              </DialogHeader>
              <AppointmentForm 
                onSubmit={handleCreateAppointment} 
                availableSlots={availableSlots}
                isLoading={createAppointmentMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Date Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Fecha</CardTitle>
            </CardHeader>
            <CardContent>
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
              
              {/* Available slots preview */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Horarios Disponibles</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Array.isArray(availableSlots) && availableSlots.map((slot: string) => (
                    <Badge key={slot} variant="outline" className="justify-center">
                      {slot}
                    </Badge>
                  ))}
                </div>
                {(!Array.isArray(availableSlots) || availableSlots.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No hay horarios disponibles
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Citas del {new Date(selectedDate).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : !Array.isArray(appointments) || appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">
                    No hay citas programadas para esta fecha
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(appointments) && appointments.map((appointment: any) => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment}
                      onUpdateStatus={(status: string) => 
                        updateAppointmentMutation.mutate({ 
                          id: appointment.id, 
                          data: { status } 
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment, onUpdateStatus }: any) {
  const time = new Date(appointment.scheduledDate).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'scheduled': return 'Programada';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{time}</span>
              <Badge className={getStatusColor(appointment.status)}>
                {getStatusText(appointment.status)}
              </Badge>
            </div>
            
            <h3 className="font-semibold mb-1">{appointment.title}</h3>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                {appointment.contactName}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                {appointment.contactPhone}
              </div>
              {appointment.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {appointment.contactEmail}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 ml-4">
            {appointment.status === 'scheduled' && (
              <Button 
                size="sm" 
                onClick={() => onUpdateStatus('confirmed')}
              >
                Confirmar
              </Button>
            )}
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onUpdateStatus('cancelled')}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AppointmentForm({ onSubmit, availableSlots, isLoading }: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título de la cita</Label>
        <Input name="title" placeholder="Ej: Consulta inicial" required />
      </div>

      <div>
        <Label htmlFor="contactName">Nombre del cliente</Label>
        <Input name="contactName" placeholder="Nombre completo" required />
      </div>

      <div>
        <Label htmlFor="contactPhone">Teléfono</Label>
        <Input name="contactPhone" placeholder="+52 55 1234 5678" required />
      </div>

      <div>
        <Label htmlFor="contactEmail">Email (opcional)</Label>
        <Input name="contactEmail" type="email" placeholder="cliente@email.com" />
      </div>

      <div>
        <Label htmlFor="time">Horario</Label>
        <Select name="time" required>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar horario" />
          </SelectTrigger>
          <SelectContent>
            {availableSlots.map((slot: string) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="duration">Duración (minutos)</Label>
        <Select name="duration" defaultValue="60">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 minutos</SelectItem>
            <SelectItem value="60">1 hora</SelectItem>
            <SelectItem value="90">1.5 horas</SelectItem>
            <SelectItem value="120">2 horas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="serviceType">Tipo de servicio</Label>
        <Input name="serviceType" placeholder="Ej: Consulta, Seguimiento" />
      </div>

      <div>
        <Label htmlFor="description">Notas adicionales</Label>
        <Textarea name="description" placeholder="Información adicional sobre la cita" />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creando...' : 'Crear Cita'}
      </Button>
    </form>
  );
}

function CalendarSettings({ settings }: any) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PUT', '/api/calendar/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/settings'] });
      toast({
        title: "Configuración actualizada",
        description: "Los cambios han sido guardados exitosamente",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      workingHours: {
        start: formData.get('startTime'),
        end: formData.get('endTime'),
      },
      appointmentDuration: parseInt(formData.get('duration') as string),
      bufferTime: parseInt(formData.get('buffer') as string),
      autoConfirm: formData.get('autoConfirm') === 'on',
    };
    updateSettingsMutation.mutate(data);
  };

  if (!settings) return <div>Cargando...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Hora de inicio</Label>
          <Input 
            name="startTime" 
            type="time" 
            defaultValue={settings.workingHours?.start || '09:00'}
          />
        </div>
        <div>
          <Label htmlFor="endTime">Hora de fin</Label>
          <Input 
            name="endTime" 
            type="time" 
            defaultValue={settings.workingHours?.end || '17:00'}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="duration">Duración por defecto (minutos)</Label>
        <Input 
          name="duration" 
          type="number" 
          defaultValue={settings.appointmentDuration || 60}
        />
      </div>

      <div>
        <Label htmlFor="buffer">Tiempo entre citas (minutos)</Label>
        <Input 
          name="buffer" 
          type="number" 
          defaultValue={settings.bufferTime || 15}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          name="autoConfirm" 
          defaultChecked={settings.autoConfirm || false}
          className="rounded"
        />
        <Label htmlFor="autoConfirm">Confirmar citas automáticamente</Label>
      </div>

      <Button type="submit" className="w-full" disabled={updateSettingsMutation.isPending}>
        {updateSettingsMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </form>
  );
}