import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Clock, Settings, Plus, User, Phone, Mail, ChevronLeft, ChevronRight, Grid, List, CalendarDays } from "lucide-react";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch appointments for selected date
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments', selectedDate],
    refetchInterval: 30000,
  });

  // Fetch available slots for selected date
  const { data: availableSlots = [] } = useQuery({
    queryKey: ['/api/calendar/available-slots', selectedDate],
    refetchInterval: 30000,
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
      setIsFormOpen(false);
      toast({
        title: "Cita creada",
        description: "La cita ha sido programada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear la cita",
        variant: "destructive",
      });
    },
  });

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest('PUT', `/api/appointments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Cita actualizada",
        description: "El estado de la cita ha sido actualizado",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la cita",
        variant: "destructive",
      });
    },
  });

  // Handle appointment status updates
  const handleUpdateStatus = (appointmentId: number, status: string) => {
    updateAppointmentMutation.mutate({ 
      id: appointmentId, 
      status 
    });
  };

  // Calendar navigation
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (currentView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Handle form submission
  const handleCreateAppointment = (formData: FormData) => {
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    
    if (!date || !time) {
      toast({
        title: "Error",
        description: "Por favor selecciona fecha y hora",
        variant: "destructive",
      });
      return;
    }

    const scheduledDate = new Date(`${date}T${time}`);
    
    const appointmentData = {
      clientName: formData.get('clientName'),
      clientPhone: formData.get('clientPhone'),
      clientEmail: formData.get('clientEmail'),
      service: formData.get('service'),
      duration: parseInt(formData.get('duration') as string) || 60,
      scheduledDate: scheduledDate.toISOString(),
      description: formData.get('description'),
      notes: formData.get('notes'),
      status: 'scheduled'
    };

    createAppointmentMutation.mutate(appointmentData);
  };

  // Generate calendar month view
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      days.push(currentDay);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendario de Citas</h1>
            <p className="text-gray-600 mt-1">
              Gestiona tus citas y horarios disponibles
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Cita
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Programar Nueva Cita</DialogTitle>
                </DialogHeader>
                <AppointmentForm 
                  onSubmit={handleCreateAppointment}
                  availableSlots={availableSlots}
                  isLoading={createAppointmentMutation.isPending}
                  selectedDate={selectedDate}
                />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Configuración del Calendario</DialogTitle>
                </DialogHeader>
                <CalendarSettings settings={settings} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateCalendar('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg sm:text-xl font-semibold min-w-0">
                    {currentDate.toLocaleDateString('es-ES', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => navigateCalendar('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
                    <TabsList>
                      <TabsTrigger value="month">
                        <Grid className="h-4 w-4 mr-1" />
                        Mes
                      </TabsTrigger>
                      <TabsTrigger value="week">
                        <List className="h-4 w-4 mr-1" />
                        Semana
                      </TabsTrigger>
                      <TabsTrigger value="day">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        Día
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Hoy
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dayStr = day.toISOString().split('T')[0];
                  const isSelected = dayStr === selectedDate;
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const hasAppointments = Array.isArray(appointments) && 
                    appointments.some((apt: any) => apt.scheduledDate?.startsWith(dayStr));
                  
                  return (
                    <Button
                      key={index}
                      variant={isSelected ? 'default' : 'ghost'}
                      className={`
                        h-10 sm:h-12 p-1 relative text-xs sm:text-sm
                        ${isToday ? 'ring-2 ring-blue-500' : ''}
                        ${!isCurrentMonth ? 'text-gray-400' : ''}
                        ${hasAppointments ? 'bg-blue-50 hover:bg-blue-100' : ''}
                        ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                      `}
                      onClick={() => setSelectedDate(dayStr)}
                    >
                      <span>{day.getDate()}</span>
                      {hasAppointments && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Date selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fecha Seleccionada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
              
              <div>
                <h4 className="font-medium text-sm mb-2">Horarios Disponibles</h4>
                <div className="grid grid-cols-2 gap-1">
                  {Array.isArray(availableSlots) && availableSlots.length > 0 ? (
                    availableSlots.map((slot: string) => (
                      <Badge key={slot} variant="outline" className="justify-center text-xs py-1">
                        {slot}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 col-span-2">
                      No hay horarios disponibles
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's appointments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Citas del Día</CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : !Array.isArray(appointments) || appointments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay citas programadas
                </p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment: any) => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment}
                      onUpdateStatus={handleUpdateStatus}
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

// Appointment Card Component - MOBILE OPTIMIZED
function AppointmentCard({ appointment, onUpdateStatus }: any) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'confirmed': return 'Confirmada';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      case 'no_show': return 'No asistió';
      default: return status;
    }
  };

  const { date, time } = formatDateTime(appointment.scheduledDate);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-3 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
            <span className="font-medium text-sm truncate">{appointment.clientName}</span>
          </div>
          <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </Badge>
        </div>
        
        {/* Date and Time */}
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-600" />
              <span className="text-sm font-bold text-blue-900">{time}</span>
            </div>
          </div>
        </div>
        
        {/* Contact details */}
        <div className="space-y-1">
          {appointment.clientPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">{appointment.clientPhone}</span>
            </div>
          )}
          {appointment.clientEmail && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600 truncate">{appointment.clientEmail}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs">🔧</span>
            <span className="text-xs font-medium">{appointment.service || 'Consulta General'}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-600">{appointment.duration || 60} min</span>
          </div>
        </div>
        
        {/* Action buttons - MOBILE OPTIMIZED */}
        {onUpdateStatus && (
          <div className="pt-2 border-t border-gray-100">
            {appointment.status === 'scheduled' && (
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                >
                  ✅ Confirmar Cita
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                >
                  ❌ Cancelar Cita
                </Button>
              </div>
            )}
            
            {appointment.status === 'confirmed' && (
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={() => onUpdateStatus(appointment.id, 'completed')}
                >
                  ✅ Marcar Completada
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-xs bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  onClick={() => onUpdateStatus(appointment.id, 'no_show')}
                >
                  ❌ No Asistió
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Appointment Form Component
function AppointmentForm({ onSubmit, availableSlots, isLoading, selectedDate }: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="clientName" className="text-sm font-medium">Nombre del Cliente *</Label>
          <Input
            id="clientName"
            name="clientName"
            placeholder="Nombre completo"
            required
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="clientPhone" className="text-sm font-medium">Teléfono *</Label>
          <Input
            id="clientPhone"
            name="clientPhone"
            placeholder="+57 300 123 4567"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="clientEmail" className="text-sm font-medium">Email</Label>
          <Input
            id="clientEmail"
            name="clientEmail"
            type="email"
            placeholder="cliente@email.com"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="date" className="text-sm font-medium">Fecha *</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={selectedDate}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="time" className="text-sm font-medium">Hora *</Label>
            <Select name="time" required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(availableSlots) && availableSlots.map((slot: string) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="service" className="text-sm font-medium">Servicio</Label>
            <Input
              id="service"
              name="service"
              placeholder="Tipo de servicio"
              defaultValue="Consulta General"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="duration" className="text-sm font-medium">Duración (min)</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              placeholder="60"
              defaultValue="60"
              min="15"
              step="15"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Detalles adicionales sobre la cita"
            rows={3}
            className="mt-1"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creando..." : "Crear Cita"}
      </Button>
    </form>
  );
}

// Calendar Settings Component
function CalendarSettings({ settings }: any) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Configuración Básica</h3>
        <p className="text-sm text-gray-600">
          Personaliza las opciones de tu calendario.
        </p>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium">Horario de Trabajo</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Input type="time" defaultValue="09:00" />
            <Input type="time" defaultValue="18:00" />
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium">Duración por defecto (minutos)</Label>
          <Input type="number" defaultValue="60" min="15" step="15" className="mt-1" />
        </div>
      </div>
      
      <Button className="w-full">
        Guardar Configuración
      </Button>
    </div>
  );
}