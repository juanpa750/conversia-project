import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Mail, Building, Phone, Save } from "lucide-react";

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch user profile
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PUT', '/api/auth/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido guardada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const profileData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      businessEmail: formData.get('businessEmail'),
      company: formData.get('company'),
      phone: formData.get('phone'),
      bio: formData.get('bio'),
    };

    updateProfileMutation.mutate(profileData);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y configuración de la cuenta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={user?.firstName || ""}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={user?.lastName || ""}
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Personal</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={user?.phone || ""}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={user?.bio || ""}
                placeholder="Cuéntanos sobre ti..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Información Empresarial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company">Nombre de la Empresa</Label>
              <Input
                id="company"
                name="company"
                defaultValue={user?.company || ""}
                placeholder="Tu empresa"
              />
            </div>

            <div>
              <Label htmlFor="businessEmail">
                <Mail className="h-4 w-4 inline mr-2" />
                Email Empresarial
              </Label>
              <Input
                id="businessEmail"
                name="businessEmail"
                type="email"
                defaultValue={user?.businessEmail || ""}
                placeholder="empresa@dominio.com"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Este email se usará para enviar confirmaciones y recordatorios de citas
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={updateProfileMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {updateProfileMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}