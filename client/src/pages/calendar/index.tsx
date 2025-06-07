import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
                  defaultDuration={settings?.slotDuration || 60}
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
              {currentView === 'month' && (
                <>
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
                </>
              )}

              {currentView === 'week' && (
                <WeekView 
                  currentDate={currentDate} 
                  appointments={appointments || []} 
                  onDateSelect={setSelectedDate}
                />
              )}

              {currentView === 'day' && (
                <DayView 
                  selectedDate={selectedDate} 
                  appointments={appointments || []} 
                  onUpdateStatus={handleUpdateStatus}
                />
              )}
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
// Week View Component
function WeekView({ currentDate, appointments, onDateSelect }: any) {
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    weekDays.push(day);
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          // Usar fecha local para evitar problemas de zona horaria
          const year = day.getFullYear();
          const month = String(day.getMonth() + 1).padStart(2, '0');
          const dayNum = String(day.getDate()).padStart(2, '0');
          const dayStr = `${year}-${month}-${dayNum}`;
          
          const dayAppointments = appointments.filter((apt: any) => {
            if (!apt.scheduledDate) return false;
            const aptDate = new Date(apt.scheduledDate);
            const aptYear = aptDate.getFullYear();
            const aptMonth = String(aptDate.getMonth() + 1).padStart(2, '0');
            const aptDay = String(aptDate.getDate()).padStart(2, '0');
            const aptDateStr = `${aptYear}-${aptMonth}-${aptDay}`;
            return aptDateStr === dayStr;
          });
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <div 
              key={index} 
              className={`border rounded-lg p-3 min-h-[120px] cursor-pointer hover:bg-muted/50 ${
                isToday ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onDateSelect(dayStr)}
            >
              <div className="font-medium text-sm mb-2">
                {day.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
              </div>
              <div className="space-y-1">
                {dayAppointments.map((apt: any) => (
                  <div 
                    key={apt.id}
                    className={`text-xs p-1 rounded truncate ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {new Date(apt.scheduledDate).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', minute: '2-digit' 
                    })} {apt.clientName}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Day View Component
function DayView({ selectedDate, appointments, onUpdateStatus }: any) {
  const dayAppointments = appointments.filter((apt: any) => 
    apt.scheduledDate?.startsWith(selectedDate)
  ).sort((a: any, b: any) => 
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );
  
  // Arreglar problema de fecha - usar la fecha local correcta
  const [year, month, day] = selectedDate.split('-').map(Number);
  const selectedDateObj = new Date(year, month - 1, day);
  
  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">
        {selectedDateObj.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
      
      {dayAppointments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay citas programadas para este día
        </div>
      ) : (
        <div className="space-y-3">
          {dayAppointments.map((appointment: any) => (
            <AppointmentCard 
              key={appointment.id} 
              appointment={appointment} 
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
function AppointmentForm({ onSubmit, availableSlots, isLoading, selectedDate, defaultDuration }: any) {
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
              placeholder={defaultDuration?.toString() || "60"}
              defaultValue={defaultDuration?.toString() || "60"}
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
  // Usar un ref para controlar si ya se inicializó desde el servidor
  const hasInitializedRef = useRef(false);
  
  // Función para crear el estado inicial basado en settings
  const createInitialState = (serverSettings: any) => ({
    workingHours: serverSettings?.workingHours || { start: '09:00', end: '17:00' },
    workingDays: serverSettings?.workingDays || [1, 2, 3, 4, 5],
    slotDuration: serverSettings?.slotDuration !== undefined ? serverSettings.slotDuration : 60,
    bufferTime: serverSettings?.bufferTime !== undefined ? serverSettings.bufferTime : 15,
    maxAdvanceBooking: serverSettings?.maxAdvanceBooking !== undefined ? serverSettings.maxAdvanceBooking : 30,
    autoConfirm: serverSettings?.autoConfirm !== undefined ? serverSettings.autoConfirm : false,
    reminderEnabled: serverSettings?.reminderEnabled !== undefined ? serverSettings.reminderEnabled : true,
    reminderTime: serverSettings?.reminderTime !== undefined ? serverSettings.reminderTime : 24
  });

  // Inicializar formData con los datos del servidor si están disponibles
  const [formData, setFormData] = useState(() => createInitialState(settings));
  
  // Solo actualizar cuando lleguen los settings por primera vez
  useEffect(() => {
    if (settings && !hasInitializedRef.current) {
      console.log('📅 Inicializando configuración con datos del servidor:', settings);
      console.log('📅 SlotDuration específico del servidor:', settings.slotDuration);
      const newFormData = createInitialState(settings);
      console.log('📅 Nuevo formData configurado:', newFormData);
      setFormData(newFormData);
      hasInitializedRef.current = true;
    }
  }, [settings]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('📅 Enviando datos al servidor:', data);
      const response = await apiRequest('PUT', '/api/calendar/settings', data);
      return response;
    },
    onSuccess: (data) => {
      console.log('📅 Respuesta del servidor:', data);
      toast({
        title: "Configuración guardada",
        description: "Las configuraciones del calendario se han actualizado correctamente."
      });
      // NO invalidar la query para evitar que se resetee el formulario
      // queryClient.invalidateQueries({ queryKey: ["/api/calendar/settings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones.",
        variant: "destructive"
      });
    }
  });
  
  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };
  const weekDayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const toggleWorkingDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(dayIndex) 
        ? prev.workingDays.filter(d => d !== dayIndex)
        : [...prev.workingDays, dayIndex].sort()
    }));
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Configuración Básica */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">⚙️ Configuración Básica</h3>
          <p className="text-sm text-gray-600">
            Horarios y duraciones de las citas
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              🕐 Horario de Trabajo
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label className="text-xs text-gray-500">Inicio</Label>
                <Input 
                  type="time" 
                  value={formData.workingHours.start}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, start: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Fin</Label>
                <Input 
                  type="time" 
                  value={formData.workingHours.end}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, end: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                ⏱️ Duración por defecto
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  type="number" 
                  value={formData.slotDuration}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    slotDuration: parseInt(e.target.value) || 60
                  }))}
                  min="15" 
                  step="15" 
                  className="flex-1"
                />
                <span className="text-xs text-gray-500">min</span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                🔄 Tiempo de buffer
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  type="number" 
                  value={formData.bufferTime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bufferTime: parseInt(e.target.value) || 15
                  }))}
                  min="0" 
                  step="5" 
                />
                <span className="text-xs text-gray-500">min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Días Laborables */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">📅 Días Laborables</h3>
          <p className="text-sm text-gray-600">
            Selecciona los días en que atiendes citas
          </p>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {weekDayNames.map((dayName, index) => (
            <Button
              key={index}
              variant={formData.workingDays.includes(index) ? "default" : "outline"}
              size="sm"
              className={`h-auto p-2 text-xs flex flex-col items-center ${
                formData.workingDays.includes(index) 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => toggleWorkingDay(index)}
            >
              <span className="font-medium">{dayName.slice(0, 3)}</span>
              <span className="text-[10px] opacity-75">{dayName.slice(3)}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Configuración Avanzada */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">🚀 Configuración Avanzada</h3>
          <p className="text-sm text-gray-600">
            Opciones adicionales para la gestión de citas
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              📊 Días de reserva anticipada
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input 
                type="number" 
                value={formData.maxAdvanceBooking}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxAdvanceBooking: parseInt(e.target.value) || 30
                }))}
                min="1" 
                max="365"
                className="flex-1"
              />
              <span className="text-xs text-gray-500">días</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Máximo de días en el futuro para reservar citas
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                ✅ Confirmación automática
              </Label>
              <p className="text-xs text-gray-500">
                Las citas se confirman automáticamente al crearlas
              </p>
            </div>
            <Button
              variant={formData.autoConfirm ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData(prev => ({
                ...prev,
                autoConfirm: !prev.autoConfirm
              }))}
              className={formData.autoConfirm ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {formData.autoConfirm ? 'Activado' : 'Desactivado'}
            </Button>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">🔔 Recordatorios</h3>
          <p className="text-sm text-gray-600">
            Configuración de notificaciones automáticas
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Recordatorios habilitados</Label>
              <p className="text-xs text-gray-500">
                Enviar recordatorios automáticos por WhatsApp
              </p>
            </div>
            <Button
              variant={formData.reminderEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData(prev => ({
                ...prev,
                reminderEnabled: !prev.reminderEnabled
              }))}
              className={formData.reminderEnabled ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {formData.reminderEnabled ? 'Activado' : 'Desactivado'}
            </Button>
          </div>

          {formData.reminderEnabled && (
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                ⏰ Recordatorio antes de la cita
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  type="number" 
                  value={formData.reminderTime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reminderTime: parseInt(e.target.value) || 24
                  }))}
                  min="1" 
                  max="168"
                  className="flex-1"
                />
                <span className="text-xs text-gray-500">horas</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tiempo antes de la cita para enviar recordatorio
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3" 
        onClick={handleSave}
        disabled={updateSettingsMutation.isPending}
      >
        {updateSettingsMutation.isPending ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Guardando...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            💾 Guardar Configuración
          </div>
        )}
      </Button>
    </div>
  );
}