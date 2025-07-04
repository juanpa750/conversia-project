import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Demo data for preview mode
const DEMO_USER = {
  id: "demo-user",
  email: "demo@example.com",
  firstName: "Usuario",
  lastName: "Demo",
  role: "user",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Demo mode flag - can be controlled via environment variable
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || false;

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);

  // Check for token in localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setAuthChecked(true);
    }
  }, []);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: Infinity,
    enabled: !!localStorage.getItem('auth_token') && !authChecked,
    onSettled: () => {
      setAuthChecked(true);
    }
  });

  const isAuthenticated = !!user && !!localStorage.getItem('auth_token');
  
  // Use the demo user when in demo mode
  const userData = isDemoMode ? DEMO_USER : user;

  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      if (isDemoMode) {
        // Simulate successful login in demo mode
        return DEMO_USER;
      }
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data);
      toast({
        title: "Login exitoso",
        description: "Has iniciado sesión correctamente",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Error al iniciar sesión",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const register = useMutation({
    mutationFn: async (userData: RegisterData) => {
      if (isDemoMode) {
        // Simulate successful registration in demo mode
        return DEMO_USER;
      }
      const res = await apiRequest("POST", "/api/auth/register", userData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data);
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Error al registrarse",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const logout = async () => {
    try {
      if (!isDemoMode) {
        await apiRequest("POST", "/api/auth/logout", {});
      }
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return {
    user: userData,
    isLoading: isDemoMode ? false : isLoading,
    isAuthenticated,
    login: login.mutate,
    register: register.mutate,
    logout,
    isLoginPending: login.isPending,
    isRegisterPending: register.isPending,
  };
}
