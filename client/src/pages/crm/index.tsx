import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RiTeamLine, 
  RiUser3Line, 
  RiBarChart2Line, 
  RiSettings3Line,
  RiMailLine,
  RiDashboardLine
} from "@/lib/icons";

export default function CRMDashboard() {
  const features = [
    {
      id: "scoring",
      title: "Puntuación de Contactos",
      description: "Sistema avanzado de puntuación para identificar los contactos con mayor potencial de conversión",
      icon: <RiUser3Line className="h-6 w-6 text-blue-600" />,
      path: "/crm/scoring"
    },
    {
      id: "automation",
      title: "Automatizaciones Avanzadas",
      description: "Crea flujos automáticos de seguimiento y cultivo de leads con acciones condicionadas",
      icon: <RiSettings3Line className="h-6 w-6 text-green-600" />,
      path: "/crm/automation"
    },
    {
      id: "relationships",
      title: "Mapeo de Relaciones",
      description: "Visualiza y gestiona las conexiones entre contactos, empresas y oportunidades",
      icon: <RiTeamLine className="h-6 w-6 text-purple-600" />,
      path: "/crm/relationships"
    },
    {
      id: "analytics",
      title: "Análisis Predictivo",
      description: "Pronóstico de ventas y recomendaciones basadas en IA para optimizar la gestión de clientes",
      icon: <RiBarChart2Line className="h-6 w-6 text-orange-600" />,
      path: "/crm/analytics"
    },
    {
      id: "pipeline",
      title: "Pipeline de Ventas",
      description: "Gestiona oportunidades de venta con un pipeline personalizable y seguimiento de conversiones",
      icon: <RiDashboardLine className="h-6 w-6 text-red-600" />,
      path: "/crm/pipeline"
    },
    {
      id: "campaigns",
      title: "Campañas de Cultivo",
      description: "Crea y administra campañas multicanal para nutrir leads y convertir clientes",
      icon: <RiMailLine className="h-6 w-6 text-cyan-600" />,
      path: "/crm/campaigns"
    }
  ];

  return (
    <>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CRM Avanzado</h1>
            <p className="text-gray-600">Gestión avanzada de clientes y oportunidades de venta</p>
          </div>
          <Button>
            <RiSettings3Line className="mr-2 h-4 w-4" />
            Configurar
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.id} href={feature.path}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Explorar
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-blue-50 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-gray-900">Optimiza tu gestión de clientes</h2>
              <p className="text-gray-600">
                Descubre todas las herramientas avanzadas para mejorar tus resultados comerciales
              </p>
            </div>
            <Button>Ver tutorial</Button>
          </div>
        </div>
      </div>
    </>
  );
}