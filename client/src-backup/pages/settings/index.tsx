import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth-simple";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  RiUser3Line, 
  RiGlobalLine, 
  RiLockLine, 
  RiWhatsappLine, 
  RiMailLine,
  RiNotification3Line,
  RiMoneyDollarBoxLine 
} from "@/lib/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form schemas
const profileSchema = z.object({
  firstName: z.string().min(2, { message: "Nombre debe tener al menos 2 caracteres" }),
  lastName: z.string().min(2, { message: "Apellido debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  company: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, { message: "Contraseña actual requerida" }),
    newPassword: z.string().min(6, { message: "La nueva contraseña debe tener al menos 6 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  newMessage: z.boolean().default(true),
  newConnection: z.boolean().default(true),
  accountUpdates: z.boolean().default(true),
});

const whatsappSchema = z.object({
  phoneNumber: z.string().min(10, { message: "Número de teléfono inválido" }),
  apiKey: z.string().min(1, { message: "API Key requerida" }),
});

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();

  // Forms
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      company: user?.company || "",
      businessEmail: user?.businessEmail || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      marketingEmails: false,
      newMessage: true,
      newConnection: true,
      accountUpdates: true,
    },
  });

  const whatsappForm = useForm<z.infer<typeof whatsappSchema>>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      phoneNumber: "",
      apiKey: "",
    },
  });

  // Queries
  const { data: whatsappIntegration } = useQuery({
    queryKey: ["/api/settings/whatsapp"],
    initialData: {
      isConnected: false,
      phoneNumber: "+57 300 123 4567",
      connectedAt: "2023-11-20T10:00:00Z",
    },
  });

  const { data: preferences } = useQuery({
    queryKey: ["/api/settings/preferences"],
  });

  // Mutations
  const updateProfile = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const res = await apiRequest("PUT", "/api/auth/me", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Perfil actualizado",
        description: "Tus datos de perfil han sido actualizados correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al actualizar el perfil",
        variant: "destructive",
      });
    },
  });

  const updatePassword = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      const res = await apiRequest("PUT", "/api/settings/password", data);
      return res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al cambiar la contraseña",
        variant: "destructive",
      });
    },
  });

  const updateNotifications = useMutation({
    mutationFn: async (data: z.infer<typeof notificationSchema>) => {
      const res = await apiRequest("PUT", "/api/settings/notifications", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferencias actualizadas",
        description: "Tus preferencias de notificación han sido actualizadas",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al actualizar las preferencias",
        variant: "destructive",
      });
    },
  });

  const connectWhatsApp = useMutation({
    mutationFn: async (data: z.infer<typeof whatsappSchema>) => {
      const res = await apiRequest("POST", "/api/settings/whatsapp/connect", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/whatsapp"] });
      toast({
        title: "WhatsApp conectado",
        description: "Tu cuenta de WhatsApp Business ha sido conectada correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al conectar WhatsApp",
        variant: "destructive",
      });
    },
  });

  const disconnectWhatsApp = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/settings/whatsapp/disconnect", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/whatsapp"] });
      toast({
        title: "WhatsApp desconectado",
        description: "Tu cuenta de WhatsApp Business ha sido desconectada",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al desconectar WhatsApp",
        variant: "destructive",
      });
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/settings/preferences", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/preferences"] });
      toast({
        title: "Preferencias actualizadas",
        description: "Tus preferencias han sido guardadas correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al actualizar las preferencias",
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfile.mutate(data);
  };

  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    updatePassword.mutate(data);
  };

  const onNotificationsSubmit = (data: z.infer<typeof notificationSchema>) => {
    updateNotifications.mutate(data);
  };

  const onWhatsAppSubmit = (data: z.infer<typeof whatsappSchema>) => {
    connectWhatsApp.mutate(data);
  };

  // Show loading state while user data is being fetched
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ajustes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra la configuración de tu cuenta y preferencias
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        orientation="vertical"
        className="w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <TabsList className="grid w-full gap-2 h-auto bg-transparent">
              <TabsTrigger
                value="profile"
                className="w-full justify-start gap-3 p-3 border border-gray-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <RiUser3Line className="w-4 h-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="w-full justify-start gap-3 p-3 border border-gray-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <RiGlobalLine className="w-4 h-4" />
                Preferencias
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="w-full justify-start gap-3 p-3 border border-gray-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <RiLockLine className="w-4 h-4" />
                Seguridad
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="w-full justify-start gap-3 p-3 border border-gray-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <RiNotification3Line className="w-4 h-4" />
                Notificaciones
              </TabsTrigger>
              <TabsTrigger
                value="whatsapp"
                className="w-full justify-start gap-3 p-3 border border-gray-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <RiWhatsappLine className="w-4 h-4" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="w-full justify-start gap-3 p-3 border border-gray-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <RiMoneyDollarBoxLine className="w-4 h-4" />
                Facturación
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="lg:col-span-3">
            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RiUser3Line className="w-5 h-5" />
                    Información del perfil
                  </CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y de contacto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="flex items-center gap-6">
                        <Avatar className="w-20 h-20">
                          <AvatarImage 
                            src={user?.profileImageUrl || ""} 
                            alt={`${user?.firstName} ${user?.lastName}`} 
                          />
                          <AvatarFallback className="text-lg">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Button variant="outline" size="sm">
                            Cambiar foto
                          </Button>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, GIF hasta 1MB
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl>
                                <Input placeholder="Tu nombre" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apellidos</FormLabel>
                              <FormControl>
                                <Input placeholder="Tus apellidos" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="tu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="+57 300 123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Biografía</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Cuéntanos un poco sobre ti..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={profileForm.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Empresa</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre de tu empresa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="businessEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email empresarial</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="empresa@email.com" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={updateProfile.isPending}
                        >
                          {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RiGlobalLine className="w-5 h-5" />
                    Preferencias generales
                  </CardTitle>
                  <CardDescription>
                    Configura el idioma, zona horaria y formatos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">Idioma y región</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="language" className="mb-2 text-sm font-medium block">
                          Idioma de la interfaz
                        </label>
                        <Select 
                          defaultValue={preferences?.language || "es"}
                          onValueChange={(value) => updatePreferences.mutate({ language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un idioma" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="pt">Português</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="timezone" className="mb-2 text-sm font-medium block">
                          Zona horaria
                        </label>
                        <Select 
                          defaultValue={preferences?.timezone || "America/Bogota"}
                          onValueChange={(value) => updatePreferences.mutate({ timezone: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una zona horaria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Bogota">Bogotá (UTC-5)</SelectItem>
                            <SelectItem value="America/Mexico_City">Ciudad de México (UTC-6)</SelectItem>
                            <SelectItem value="America/Lima">Lima (UTC-5)</SelectItem>
                            <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires (UTC-3)</SelectItem>
                            <SelectItem value="America/Santiago">Santiago (UTC-3)</SelectItem>
                            <SelectItem value="Europe/Madrid">Madrid (UTC+1)</SelectItem>
                            <SelectItem value="America/New_York">Nueva York (UTC-5)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-medium">Formato de fecha y hora</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label htmlFor="date-format" className="text-sm font-medium">
                            Formato de fecha
                          </label>
                        </div>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue={preferences?.dateFormat || "DD/MM/YYYY"}
                          onChange={(e) => updatePreferences.mutate({ dateFormat: e.target.value })}
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label htmlFor="time-format" className="text-sm font-medium">
                            Formato de hora
                          </label>
                        </div>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue={preferences?.timeFormat || "24h"}
                          onChange={(e) => updatePreferences.mutate({ timeFormat: e.target.value })}
                        >
                          <option value="24h">24 horas (14:30)</option>
                          <option value="12h">12 horas (2:30 PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RiLockLine className="w-5 h-5" />
                    Seguridad de la cuenta
                  </CardTitle>
                  <CardDescription>
                    Actualiza tu contraseña y configura opciones de seguridad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña actual</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Tu contraseña actual" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nueva contraseña</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Nueva contraseña" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar contraseña</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirma la nueva contraseña" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={updatePassword.isPending}
                        >
                          {updatePassword.isPending ? "Actualizando..." : "Cambiar contraseña"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RiNotification3Line className="w-5 h-5" />
                    Preferencias de notificación
                  </CardTitle>
                  <CardDescription>
                    Controla cuándo y cómo recibes notificaciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Notificaciones por email
                                </FormLabel>
                                <FormDescription>
                                  Recibe actualizaciones importantes por correo electrónico
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="marketingEmails"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Emails de marketing
                                </FormLabel>
                                <FormDescription>
                                  Recibe noticias sobre nuevas funciones y promociones
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="newMessage"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Nuevos mensajes
                                </FormLabel>
                                <FormDescription>
                                  Notificaciones cuando recibas nuevos mensajes en WhatsApp
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="newConnection"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Nuevas conexiones
                                </FormLabel>
                                <FormDescription>
                                  Notificaciones cuando se conecten nuevos usuarios
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="accountUpdates"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Actualizaciones de cuenta
                                </FormLabel>
                                <FormDescription>
                                  Notificaciones sobre cambios en tu cuenta y suscripción
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={updateNotifications.isPending}
                        >
                          {updateNotifications.isPending ? "Guardando..." : "Guardar preferencias"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* WhatsApp Tab */}
            <TabsContent value="whatsapp" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RiWhatsappLine className="w-5 h-5" />
                    Integración con WhatsApp
                  </CardTitle>
                  <CardDescription>
                    Conecta tu cuenta de WhatsApp Business para enviar mensajes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {whatsappIntegration?.isConnected ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-green-800">WhatsApp conectado</p>
                          <p className="text-sm text-green-600">
                            Número: {whatsappIntegration.phoneNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => disconnectWhatsApp.mutate()}
                          disabled={disconnectWhatsApp.isPending}
                        >
                          {disconnectWhatsApp.isPending ? "Desconectando..." : "Desconectar"}
                        </Button>
                        <Button variant="outline">
                          Configurar webhook
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Form {...whatsappForm}>
                      <form onSubmit={whatsappForm.handleSubmit(onWhatsAppSubmit)} className="space-y-6">
                        <FormField
                          control={whatsappForm.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de WhatsApp Business</FormLabel>
                              <FormControl>
                                <Input placeholder="+57 300 123 4567" {...field} />
                              </FormControl>
                              <FormDescription>
                                El número debe estar verificado en WhatsApp Business
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={whatsappForm.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key de WhatsApp Business</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Tu API Key" {...field} />
                              </FormControl>
                              <FormDescription>
                                Obtén tu API Key desde el panel de WhatsApp Business
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={connectWhatsApp.isPending}
                          >
                            {connectWhatsApp.isPending ? "Conectando..." : "Conectar WhatsApp"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RiMoneyDollarBoxLine className="w-5 h-5" />
                    Facturación y suscripción
                  </CardTitle>
                  <CardDescription>
                    Administra tu plan de suscripción y métodos de pago
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Plan Actual: Premium</h3>
                    <p className="text-sm text-blue-600">
                      $49.99/mes • Renovación automática el 15 de diciembre
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Métodos de pago</h3>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-6 bg-blue-600 rounded"></div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-500">Visa terminada en 4242</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline">
                      Cambiar plan
                    </Button>
                    <Button variant="outline">
                      Ver historial de pagos
                    </Button>
                    <Button variant="outline">
                      Descargar factura
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </>
  );
}