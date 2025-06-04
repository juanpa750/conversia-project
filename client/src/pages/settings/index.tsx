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
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form setup with proper type casting
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: (user as any)?.firstName || "",
      lastName: (user as any)?.lastName || "",
      email: (user as any)?.email || "",
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <TabsList className="flex flex-col items-start justify-start space-y-2 lg:h-full bg-gray-50 p-2 rounded-lg">
              <TabsTrigger 
                value="profile"
                className="w-full justify-start px-4 py-3 rounded-md text-left hover:bg-white transition-colors"
              >
                <RiUser3Line className="mr-3 w-4 h-4" />
                <span className="font-medium">Perfil</span>
              </TabsTrigger>
              <TabsTrigger 
                value="password"
                className="w-full justify-start px-4 py-3 rounded-md text-left hover:bg-white transition-colors"
              >
                <RiLockLine className="mr-3 w-4 h-4" />
                <span className="font-medium">Contraseña</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="w-full justify-start px-4 py-3 rounded-md text-left hover:bg-white transition-colors"
              >
                <RiNotification3Line className="mr-3 w-4 h-4" />
                <span className="font-medium">Notificaciones</span>
              </TabsTrigger>
              <TabsTrigger 
                value="whatsapp"
                className="w-full justify-start px-4 py-3 rounded-md text-left hover:bg-white transition-colors"
              >
                <RiWhatsappLine className="mr-3 w-4 h-4" />
                <span className="font-medium">Integración WhatsApp</span>
              </TabsTrigger>
              <TabsTrigger 
                value="subscription"
                className="w-full justify-start px-4 py-3 rounded-md text-left hover:bg-white transition-colors"
              >
                <RiMoneyDollarBoxLine className="mr-3 w-4 h-4" />
                <span className="font-medium">Suscripción</span>
              </TabsTrigger>
              <TabsTrigger 
                value="preferences"
                className="w-full justify-start px-4 py-3 rounded-md text-left hover:bg-white transition-colors"
              >
                <RiGlobalLine className="mr-3 w-4 h-4" />
                <span className="font-medium">Preferencias</span>
              </TabsTrigger>
            </TabsList>
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
                      src={(user as any)?.profileImageUrl}
                      alt={(user as any)?.firstName}
                    />
                    <AvatarFallback>
                      {(user as any)?.firstName?.charAt(0) || (user as any)?.email?.charAt(0)}
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
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue={preferences.language}
                        onChange={(e) => updateLanguage.mutate({ language: e.target.value })}
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="pt">Português</option>
                      </select>
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

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Suscripción</CardTitle>
                <CardDescription>
                  Información sobre tu plan actual y detalles de facturación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Plan Profesional</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Acceso completo a todas las funcionalidades
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-900">€29/mes</div>
                      <div className="text-sm text-blue-700">Próxima facturación: 04 Jul 2025</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">Días restantes</h4>
                    <div className="text-3xl font-bold text-green-600">23</div>
                    <p className="text-sm text-gray-600">días hasta la renovación</p>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">Chatbots creados</h4>
                    <div className="text-3xl font-bold text-blue-600">3/10</div>
                    <p className="text-sm text-gray-600">chatbots de tu límite</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Funcionalidades incluidas</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Hasta 10 chatbots</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Conversaciones ilimitadas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Integración WhatsApp Business</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Analytics avanzado</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Soporte prioritario</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">API de integración</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline">
                    Cambiar Plan
                  </Button>
                  <Button variant="outline">
                    Ver Historial de Facturación
                  </Button>
                  <Button variant="destructive">
                    Cancelar Suscripción
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

export default Settings;
