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
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  RiUser3Line, 
  RiGlobalLine, 
  RiLockLine, 
  RiWhatsappLine, 
  RiMailLine,
  RiNotification3Line 
} from "@/lib/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form schemas
const profileSchema = z.object({
  firstName: z.string().min(2, { message: "Nombre debe tener al menos 2 caracteres" }),
  lastName: z.string().min(2, { message: "Apellido debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  company: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8, { message: "La contraseña actual es requerida" }),
  newPassword: z.string().min(8, { message: "La nueva contraseña debe tener al menos 8 caracteres" }),
  confirmPassword: z.string().min(8, { message: "La confirmación de contraseña es requerida" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  newMessage: z.boolean(),
  newConnection: z.boolean(),
  accountUpdates: z.boolean(),
});

const whatsappSchema = z.object({
  phoneNumber: z.string().min(10, { message: "Número de teléfono inválido" }),
  displayName: z.string().min(3, { message: "Nombre de visualización requerido" }),
  businessDescription: z.string().optional(),
});

interface WhatsAppIntegration {
  phoneNumber: string;
  displayName: string;
  businessDescription: string;
  status: "connected" | "disconnected" | "pending";
  connectedAt?: string;
}

export function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form setup
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      company: "",
      phone: "",
      bio: "",
    },
  });

  // Password form setup
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification preferences form setup
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

  // WhatsApp integration form setup
  const whatsappForm = useForm<z.infer<typeof whatsappSchema>>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      phoneNumber: "",
      displayName: "",
      businessDescription: "",
    },
  });

  // In a real application, we would fetch this data from the API
  const { data: whatsappIntegration } = useQuery<WhatsAppIntegration>({
    queryKey: ["/api/settings/whatsapp"],
    initialData: {
      phoneNumber: "+34600000000",
      displayName: "Mi Negocio",
      businessDescription: "Descripción de mi negocio",
      status: "connected",
      connectedAt: "2023-11-20T10:00:00Z",
    },
  });

  const { data: preferences } = useQuery({
    queryKey: ["/api/settings/preferences"],
    initialData: {
      language: "es",
      timezone: "Europe/Madrid",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
    },
  });

  // Mutations
  const updateProfile = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const res = await apiRequest("PUT", "/api/settings/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente",
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

  const updateLanguage = useMutation({
    mutationFn: async (data: { language: string }) => {
      const res = await apiRequest("PUT", "/api/settings/preferences", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/preferences"] });
      toast({
        title: "Idioma actualizado",
        description: "El idioma de la plataforma ha sido cambiado",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al cambiar el idioma",
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

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ajustes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra la configuración de tu cuenta y preferencias
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            orientation="vertical"
            className="w-full"
          >
            <TabsList className="flex flex-col items-start justify-start space-y-1 lg:h-full">
              <TabsTrigger 
                value="profile"
                className="w-full justify-start px-3"
              >
                <RiUser3Line className="mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger 
                value="password"
                className="w-full justify-start px-3"
              >
                <RiLockLine className="mr-2" />
                Contraseña
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="w-full justify-start px-3"
              >
                <RiNotification3Line className="mr-2" />
                Notificaciones
              </TabsTrigger>
              <TabsTrigger 
                value="whatsapp"
                className="w-full justify-start px-3"
              >
                <RiWhatsappLine className="mr-2" />
                Integración WhatsApp
              </TabsTrigger>
              <TabsTrigger 
                value="preferences"
                className="w-full justify-start px-3"
              >
                <RiGlobalLine className="mr-2" />
                Preferencias
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="lg:col-span-9">
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información de Perfil</CardTitle>
                <CardDescription>
                  Actualiza tu información personal y datos de contacto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={user?.profileImageUrl}
                      alt={user?.firstName}
                    />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      Cambiar foto
                    </Button>
                    <p className="mt-2 text-xs text-gray-500">
                      JPG, GIF o PNG. Máximo 1MB.
                    </p>
                  </div>
                </div>

                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Apellido</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                              rows={4}
                              placeholder="Cuéntanos sobre ti o tu negocio..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>
                  Actualiza tu contraseña para mantener segura tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña actual</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nueva contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            La contraseña debe tener al menos 8 caracteres
                          </FormDescription>
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
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={updatePassword.isPending}
                    >
                      {updatePassword.isPending ? "Actualizando..." : "Actualizar contraseña"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Notificación</CardTitle>
                <CardDescription>
                  Configura cómo y cuándo quieres recibir notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form
                    onSubmit={notificationForm.handleSubmit(onNotificationsSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notificaciones por Email</h3>
                      
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                              <FormLabel className="text-base">
                                Notificaciones por email
                              </FormLabel>
                              <FormDescription>
                                Recibe actualizaciones y alertas por email
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
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                              <FormLabel className="text-base">
                                Emails de marketing
                              </FormLabel>
                              <FormDescription>
                                Recibe noticias, ofertas y actualizaciones de productos
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

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notificaciones de la Plataforma</h3>
                      
                      <FormField
                        control={notificationForm.control}
                        name="newMessage"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                              <FormLabel className="text-base">
                                Nuevos mensajes
                              </FormLabel>
                              <FormDescription>
                                Cuando recibas un nuevo mensaje de un cliente
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
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                              <FormLabel className="text-base">
                                Nuevas conexiones
                              </FormLabel>
                              <FormDescription>
                                Cuando un nuevo cliente se conecta con un chatbot
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
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                              <FormLabel className="text-base">
                                Actualizaciones de cuenta
                              </FormLabel>
                              <FormDescription>
                                Cambios importantes en tu cuenta o plan
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

                    <Button
                      type="submit"
                      disabled={updateNotifications.isPending}
                    >
                      {updateNotifications.isPending ? "Guardando..." : "Guardar preferencias"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle>Integración con WhatsApp Business</CardTitle>
                <CardDescription>
                  Conecta tu cuenta de WhatsApp Business para empezar a automatizar tus conversaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {whatsappIntegration.status === "connected" ? (
                  <div className="space-y-6">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center">
                        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <RiWhatsappLine className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-green-800">
                            WhatsApp conectado
                          </h3>
                          <p className="text-xs text-green-600">
                            Conectado desde {new Date(whatsappIntegration.connectedAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Número de teléfono</h4>
                          <p className="text-gray-900">{whatsappIntegration.phoneNumber}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Nombre del negocio</h4>
                          <p className="text-gray-900">{whatsappIntegration.displayName}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Descripción del negocio</h4>
                        <p className="text-gray-900">{whatsappIntegration.businessDescription}</p>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button variant="outline" asChild>
                        <a href="https://business.whatsapp.com/" target="_blank" rel="noopener noreferrer">
                          Administrar en WhatsApp
                        </a>
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => disconnectWhatsApp.mutate()}
                        disabled={disconnectWhatsApp.isPending}
                      >
                        {disconnectWhatsApp.isPending ? "Desconectando..." : "Desconectar WhatsApp"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Form {...whatsappForm}>
                    <form
                      onSubmit={whatsappForm.handleSubmit(onWhatsAppSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={whatsappForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="+34600000000" {...field} />
                            </FormControl>
                            <FormDescription>
                              Introduce el número de teléfono con el código de país
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={whatsappForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del negocio</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={whatsappForm.control}
                        name="businessDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción del negocio</FormLabel>
                            <FormControl>
                              <Textarea rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="text-sm font-medium">Instrucciones de conexión</h3>
                        <ol className="mt-2 space-y-2 text-sm text-gray-600">
                          <li>1. Introduce los datos de tu cuenta de WhatsApp Business</li>
                          <li>2. Haz clic en "Conectar WhatsApp"</li>
                          <li>3. Escanea el código QR que aparecerá con tu aplicación WhatsApp Business</li>
                          <li>4. Confirma la conexión en tu teléfono</li>
                        </ol>
                      </div>

                      <Button
                        type="submit"
                        disabled={connectWhatsApp.isPending}
                      >
                        {connectWhatsApp.isPending ? "Conectando..." : "Conectar WhatsApp"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de la Plataforma</CardTitle>
                <CardDescription>
                  Personaliza tu experiencia en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 text-lg font-medium">Idioma</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label htmlFor="language" className="text-sm font-medium">
                          Idioma de la plataforma
                        </label>
                      </div>
                      <Select
                        defaultValue={preferences.language}
                        onValueChange={(value) => updateLanguage.mutate({ language: value })}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Seleccionar idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="pt">Português</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label htmlFor="timezone" className="text-sm font-medium">
                          Zona horaria
                        </label>
                      </div>
                      <Select defaultValue={preferences.timezone}>
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Seleccionar zona horaria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Madrid">
                            Madrid (GMT+1)
                          </SelectItem>
                          <SelectItem value="America/Mexico_City">
                            Ciudad de México (GMT-6)
                          </SelectItem>
                          <SelectItem value="America/Bogota">
                            Bogotá (GMT-5)
                          </SelectItem>
                          <SelectItem value="America/Buenos_Aires">
                            Buenos Aires (GMT-3)
                          </SelectItem>
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
                      <Select defaultValue={preferences.dateFormat}>
                        <SelectTrigger id="date-format">
                          <SelectValue placeholder="Seleccionar formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label htmlFor="time-format" className="text-sm font-medium">
                          Formato de hora
                        </label>
                      </div>
                      <Select defaultValue={preferences.timeFormat}>
                        <SelectTrigger id="time-format">
                          <SelectValue placeholder="Seleccionar formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                          <SelectItem value="24h">24 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button>Guardar cambios</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </>
  );
}

export default Settings;
