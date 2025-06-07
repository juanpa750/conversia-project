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
      queryClient.invalidateQueries({ queryKey: [`/api/appointments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/calendar/available-slots`] });
      setIsFormOpen(false);
      toast({
        title: "Cita creada",
        description: "La cita ha sido programada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la cita",
        variant: "destructive",
      });
    },
  });

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest('PUT', `/api/appointments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments`] });
      toast({
        title: "Cita actualizada",
        description: "El estado de la cita ha sido actualizado",
      });
    },
  });

  // Calendar navigation functions
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

  // Generate calendar data based on current view
  const getCalendarData = () => {
    const today = new Date(currentDate);
    
    if (currentView === 'month') {
      return generateMonthView(today);
    } else if (currentView === 'week') {
      return generateWeekView(today);
    } else {
      return generateDayView(today);
    }
  };

  const generateMonthView = (date: Date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startOfWeek = new Date(startOfMonth);
    startOfWeek.setDate(startOfMonth.getDate() - startOfMonth.getDay());
    
    const days = [];
    const currentDay = new Date(startOfWeek);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const generateWeekView = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const generateDayView = (date: Date) => {
    return [new Date(date)];
  };

  const formatDateHeader = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };
    
    if (currentView === 'week') {
      const weekDays = generateWeekView(currentDate);
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
    } else if (currentView === 'day') {
      return currentDate.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    return currentDate.toLocaleDateString('es-ES', options);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const handleCreateAppointment = (formData: FormData) => {
    const appointmentData = {
      clientName: formData.get('clientName'),
      clientEmail: formData.get('clientEmail'),
      clientPhone: formData.get('clientPhone'),
      service: formData.get('service'),
      date: formData.get('date'),
      time: formData.get('time'),
      duration: parseInt(formData.get('duration') as string) || 60,
      notes: formData.get('notes'),
      status: 'scheduled'
    };

    createAppointmentMutation.mutate(appointmentData);
  };

  const calendarDays = getCalendarData();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendario de Citas</h1>
          <p className="text-muted-foreground">
            Gestiona tus citas y horarios disponibles
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View selector */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={currentView === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('month')}
            >
              <Grid className="h-4 w-4" />
              Mes
            </Button>
            <Button
              variant={currentView === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('week')}
            >
              <List className="h-4 w-4" />
              Semana
            </Button>
            <Button
              variant={currentView === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('day')}
            >
              <CalendarDays className="h-4 w-4" />
              Día
            </Button>
          </div>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Programar Nueva Cita</DialogTitle>
              </DialogHeader>
              <AppointmentForm 
                onSubmit={handleCreateAppointment}
                availableSlots={Array.isArray(availableSlots) ? availableSlots : []}
                isLoading={createAppointmentMutation.isPending}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configuración del Calendario</DialogTitle>
              </DialogHeader>
              <CalendarSettings settings={settings} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateCalendar('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <h2 className="text-xl font-semibold min-w-[200px] text-center">
                  {formatDateHeader()}
                </h2>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateCalendar('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Button variant="outline" onClick={goToToday}>
                Hoy
              </Button>
            </CardHeader>
            
            <CardContent>
              {currentView === 'month' && (
                <MonthView 
                  days={calendarDays}
                  currentDate={currentDate}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  appointments={Array.isArray(appointments) ? appointments : []}
                />
              )}
              
              {currentView === 'week' && (
                <WeekView 
                  days={calendarDays}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  appointments={Array.isArray(appointments) ? appointments : []}
                />
              )}
              
              {currentView === 'day' && (
                <DayView 
                  date={currentDate}
                  appointments={Array.isArray(appointments) ? appointments : []}
                  availableSlots={Array.isArray(availableSlots) ? availableSlots : []}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Date picker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Seleccionar Fecha</CardTitle>
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

          {/* Today's appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Citas de Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Month View Component
function MonthView({ days, currentDate, selectedDate, onDateSelect, appointments }: any) {
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Week headers */}
      {weekDays.map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {days.map((day: Date, index: number) => {
        const dateStr = day.toISOString().split('T')[0];
        const dayAppointments = appointments.filter((apt: any) => {
          if (!apt.scheduledDate) return false;
          const appointmentDate = new Date(apt.scheduledDate).toISOString().split('T')[0];
          return appointmentDate === dateStr;
        });
        const isSelected = selectedDate === dateStr;
        const isToday = day.toDateString() === new Date().toDateString();
        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
        
        return (
          <div
            key={index}
            className={`
              p-2 min-h-[80px] border rounded cursor-pointer hover:bg-gray-50
              ${isSelected ? 'bg-primary text-primary-foreground' : ''}
              ${isToday ? 'ring-2 ring-primary' : ''}
              ${!isCurrentMonth ? 'text-muted-foreground' : ''}
            `}
            onClick={() => onDateSelect(dateStr)}
          >
            <div className="font-medium">{day.getDate()}</div>
            <div className="space-y-1 mt-1">
              {dayAppointments.slice(0, 2).map((apt: any) => (
                <div
                  key={apt.id}
                  className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate"
                >
                  {new Date(apt.scheduledDate).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})} - {apt.clientName}
                </div>
              ))}
              {dayAppointments.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{dayAppointments.length - 2} más
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Week View Component
function WeekView({ days, selectedDate, onDateSelect, appointments }: any) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
  
  return (
    <div className="space-y-4">
      {/* Week header */}
      <div className="grid grid-cols-8 gap-2">
        <div></div> {/* Empty cell for time column */}
        {days.map((day: Date) => {
          const dateStr = day.toISOString().split('T')[0];
          const isSelected = selectedDate === dateStr;
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={dateStr}
              className={`
                p-2 text-center cursor-pointer rounded
                ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                ${isToday ? 'ring-2 ring-primary' : ''}
              `}
              onClick={() => onDateSelect(dateStr)}
            >
              <div className="text-sm font-medium">
                {day.toLocaleDateString('es-ES', { weekday: 'short' })}
              </div>
              <div className="text-lg font-bold">{day.getDate()}</div>
            </div>
          );
        })}
      </div>
      
      {/* Time grid */}
      <div className="grid grid-cols-8 gap-2">
        <div className="space-y-2">
          {hours.map(hour => (
            <div key={hour} className="h-16 text-sm text-muted-foreground p-2">
              {hour}:00
            </div>
          ))}
        </div>
        
        {days.map((day: Date) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayAppointments = appointments.filter((apt: any) => apt.date === dateStr);
          
          return (
            <div key={dateStr} className="space-y-2">
              {hours.map(hour => {
                const hourAppointments = dayAppointments.filter((apt: any) => 
                  parseInt(apt.time.split(':')[0]) === hour
                );
                
                return (
                  <div key={hour} className="h-16 border rounded p-1">
                    {hourAppointments.map((apt: any) => (
                      <div
                        key={apt.id}
                        className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mb-1"
                      >
                        {apt.time} - {apt.clientName}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Day View Component
function DayView({ date, appointments, availableSlots }: any) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);
  const dateStr = date.toISOString().split('T')[0];
  const dayAppointments = appointments.filter((apt: any) => apt.date === dateStr);
  
  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold">
          {date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Time slots */}
        <div className="space-y-2">
          <h4 className="font-medium">Horarios</h4>
          {hours.map(hour => {
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
            const appointment = dayAppointments.find((apt: any) => apt.time === timeSlot);
            const isAvailable = availableSlots.includes(timeSlot);
            
            return (
              <div
                key={hour}
                className={`
                  p-3 border rounded
                  ${appointment ? 'bg-blue-100 border-blue-300' : ''}
                  ${isAvailable && !appointment ? 'bg-green-50 border-green-300' : ''}
                  ${!isAvailable && !appointment ? 'bg-gray-100 border-gray-300' : ''}
                `}
              >
                <div className="font-medium">{timeSlot}</div>
                {appointment ? (
                  <div className="text-sm">
                    <div className="font-medium">{appointment.clientName}</div>
                    <div className="text-muted-foreground">{appointment.service}</div>
                  </div>
                ) : isAvailable ? (
                  <div className="text-sm text-green-600">Disponible</div>
                ) : (
                  <div className="text-sm text-gray-500">No disponible</div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Appointments list */}
        <div className="space-y-2">
          <h4 className="font-medium">Citas del Día</h4>
          {dayAppointments.length === 0 ? (
            <p className="text-muted-foreground">No hay citas programadas</p>
          ) : (
            <div className="space-y-3">
              {dayAppointments.map((appointment: any) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Appointment Card Component
function AppointmentCard({ appointment, onUpdateStatus }: any) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
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

  return (
    <Card className="p-4 border-l-4 border-l-blue-500">
      <div className="space-y-3">
        {/* Header with name and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-lg">{appointment.clientName}</span>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {getStatusText(appointment.status)}
          </Badge>
        </div>
        
        {/* Date and Time - Prominent Display */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                {formatDate(appointment.scheduledDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-blue-900 text-xl">
                {formatTime(appointment.scheduledDate)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Contact and service details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          {appointment.clientPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{appointment.clientPhone}</span>
            </div>
          )}
          {appointment.clientEmail && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{appointment.clientEmail}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm">🔧</span>
            <span className="font-medium">{appointment.service}</span>
            <span>•</span>
            <span>{appointment.duration} minutos</span>
          </div>
        </div>
        
        {/* Action buttons */}
        {onUpdateStatus && (
          <div className="flex flex-wrap gap-2 pt-2">
            {appointment.status === 'scheduled' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  onClick={() => onUpdateStatus('confirmed')}
                >
                  ✅ Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  onClick={() => onUpdateStatus('cancelled')}
                >
                  ❌ Cancelar
                </Button>
              </>
            )}
            
            {appointment.status === 'confirmed' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={() => onUpdateStatus('completed')}
                >
                  ✅ Completar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  onClick={() => onUpdateStatus('no_show')}
                >
                  ❌ No asistió
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Appointment Form Component
function AppointmentForm({ onSubmit, availableSlots, isLoading }: any) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    console.log('📅 Form submission - Raw form data:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    
    console.log('📅 Date:', date);
    console.log('📅 Time:', time);
    
    if (!date || !time) {
      console.error('📅 Missing date or time');
      return;
    }
    
    // Construir el objeto de datos correctamente
    const appointmentData = {
      clientName: formData.get('clientName') as string,
      clientPhone: formData.get('clientPhone') as string,
      clientEmail: formData.get('clientEmail') as string,
      service: formData.get('service') as string,
      scheduledDate: new Date(`${date}T${time}:00`).toISOString(),
      duration: parseInt(formData.get('duration') as string),
      notes: formData.get('notes') || '',
      status: 'scheduled'
    };
    
    console.log('📅 Final appointment data:', appointmentData);
    
    onSubmit(appointmentData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientName">Nombre del Cliente</Label>
          <Input
            id="clientName"
            name="clientName"
            placeholder="Nombre completo"
            required
          />
        </div>
        <div>
          <Label htmlFor="clientPhone">Teléfono</Label>
          <Input
            id="clientPhone"
            name="clientPhone"
            placeholder="+1234567890"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="clientEmail">Email</Label>
        <Input
          id="clientEmail"
          name="clientEmail"
          type="email"
          placeholder="cliente@email.com"
        />
      </div>

      <div>
        <Label htmlFor="service">Servicio</Label>
        <Input
          id="service"
          name="service"
          placeholder="Tipo de servicio"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Hora</Label>
          <Select name="time" required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar hora" />
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
      </div>

      <div>
        <Label htmlFor="duration">Duración (minutos)</Label>
        <Select name="duration" defaultValue="60">
          <SelectTrigger>
            <SelectValue placeholder="Duración" />
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
        <Label htmlFor="notes">Notas adicionales</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Información adicional sobre la cita..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creando..." : "Programar Cita"}
      </Button>
    </form>
  );
}

// Calendar Settings Component
function CalendarSettings({ settings }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    workingHours: {
      start: settings?.workingHours?.start || "09:00",
      end: settings?.workingHours?.end || "17:00"
    },
    appointmentDuration: settings?.appointmentDuration || 60,
    bufferTime: settings?.bufferTime || 15,
    advanceBookingDays: settings?.advanceBookingDays || 30,
    workingDays: settings?.workingDays || [1, 2, 3, 4, 5],
    autoConfirm: settings?.autoConfirm || false,
    reminderSettings: {
      enabled: settings?.reminderSettings?.enabled !== false,
      beforeHours: settings?.reminderSettings?.beforeHours || [24, 2],
      whatsapp: settings?.reminderSettings?.whatsapp !== false,
      email: settings?.reminderSettings?.email !== false
    },
    emailNotifications: {
      enabled: settings?.emailNotifications?.enabled !== false,
      confirmationTemplate: settings?.emailNotifications?.confirmationTemplate || "",
      reminderTemplate: settings?.emailNotifications?.reminderTemplate || ""
    },
    whatsappNotifications: {
      enabled: settings?.whatsappNotifications?.enabled !== false,
      confirmationTemplate: settings?.whatsappNotifications?.confirmationTemplate || "",
      reminderTemplate: settings?.whatsappNotifications?.reminderTemplate || ""
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PUT', '/api/calendar/settings', data);
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido guardados exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleWorkingDayToggle = (dayIndex: number) => {
    const newWorkingDays = formData.workingDays.includes(dayIndex)
      ? formData.workingDays.filter(d => d !== dayIndex)
      : [...formData.workingDays, dayIndex].sort();
    
    setFormData(prev => ({
      ...prev,
      workingDays: newWorkingDays
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div>
        <h3 className="font-medium mb-3">Horarios de Trabajo</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Hora de inicio</Label>
            <Input
              type="time"
              value={formData.workingHours.start}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, start: e.target.value }
              }))}
            />
          </div>
          <div>
            <Label>Hora de fin</Label>
            <Input
              type="time"
              value={formData.workingHours.end}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, end: e.target.value }
              }))}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Días laborables</Label>
        <div className="flex gap-2">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
            <Button
              key={day}
              type="button"
              variant={formData.workingDays.includes(index + 1) ? 'default' : 'outline'}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => handleWorkingDayToggle(index + 1)}
            >
              {day}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Duración por defecto (min)</Label>
          <Input
            type="number"
            value={formData.appointmentDuration}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              appointmentDuration: parseInt(e.target.value) || 60
            }))}
            min="15"
            step="15"
          />
        </div>
        <div>
          <Label>Buffer entre citas (min)</Label>
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
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoConfirm"
          checked={formData.autoConfirm}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            autoConfirm: e.target.checked
          }))}
        />
        <Label htmlFor="autoConfirm">Confirmar citas automáticamente</Label>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Recordatorios Automáticos</Label>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="remindersEnabled"
            checked={formData.reminderSettings.enabled}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              reminderSettings: { ...prev.reminderSettings, enabled: e.target.checked }
            }))}
          />
          <Label htmlFor="remindersEnabled">Activar recordatorios automáticos</Label>
        </div>

        {formData.reminderSettings.enabled && (
          <div className="ml-6 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="whatsappReminders"
                checked={formData.reminderSettings.whatsapp}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  reminderSettings: { ...prev.reminderSettings, whatsapp: e.target.checked }
                }))}
              />
              <Label htmlFor="whatsappReminders">📱 Recordatorios por WhatsApp</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emailReminders"
                checked={formData.reminderSettings.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  reminderSettings: { ...prev.reminderSettings, email: e.target.checked }
                }))}
              />
              <Label htmlFor="emailReminders">📧 Recordatorios por email</Label>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Notificaciones por Email</Label>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={formData.emailNotifications.enabled}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              emailNotifications: { ...prev.emailNotifications, enabled: e.target.checked }
            }))}
          />
          <Label htmlFor="emailNotifications">Activar notificaciones por email</Label>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Notificaciones por WhatsApp</Label>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="whatsappNotifications"
            checked={formData.whatsappNotifications.enabled}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              whatsappNotifications: { ...prev.whatsappNotifications, enabled: e.target.checked }
            }))}
          />
          <Label htmlFor="whatsappNotifications">Activar notificaciones por WhatsApp</Label>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={updateSettingsMutation.isPending}
      >
        {updateSettingsMutation.isPending ? "Guardando..." : "Guardar Configuración"}
      </Button>
    </form>
  );
}