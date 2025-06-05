import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/stats-card";
import ChartSection from "@/components/dashboard/chart-section";
import RecentConversations from "@/components/dashboard/recent-conversations";
import QuickActions from "@/components/dashboard/quick-actions";
import PlanCard from "@/components/dashboard/plan-card";
import { useLanguage } from "@/contexts/LanguageContext";
import { RiDownload2Line, RiCalendarLine, RiArrowDownSLine } from "@/lib/icons";

export function Dashboard() {
  const { t } = useLanguage();
  
  // In a real application, we would fetch this data from the API
  const { data: statsData } = useQuery({
    queryKey: ["/api/stats/dashboard"],
    initialData: {
      activeChatbots: {
        value: 12,
        total: 15,
        percentage: 12,
        progress: 80
      },
      messagesSent: {
        value: 2867,
        label: "este mes",
        percentage: 24,
        progress: 75
      },
      newContacts: {
        value: 149,
        label: "últimos 7 días",
        percentage: 8,
        progress: 65
      },
      responseRate: {
        value: "92%",
        label: "promedio",
        percentage: -3,
        progress: 92
      }
    }
  });

  return (
    <>
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex flex-col justify-between md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
            <p className="mt-1 text-sm text-gray-500">
              Resumen general de tu plataforma de chatbots
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0">
            <div className="inline-flex rounded-md shadow-sm">
              <Button variant="outline" className="rounded-r-none px-4 py-2 text-sm">
                <RiCalendarLine className="mr-2" />
                Últimos 7 días
              </Button>
              <Button variant="outline" className="rounded-l-none border-l-0 px-2 py-2 text-sm">
                <RiArrowDownSLine />
              </Button>
            </div>
            <Button variant="default" className="px-4 py-2 text-sm">
              <RiDownload2Line className="mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Chatbots Activos"
          value={statsData.activeChatbots.value}
          subtext={`de ${statsData.activeChatbots.total} disponibles`}
          percentage={statsData.activeChatbots.percentage}
          progress={statsData.activeChatbots.progress}
        />
        <StatsCard
          title="Mensajes Enviados"
          value={statsData.messagesSent.value}
          subtext={statsData.messagesSent.label}
          percentage={statsData.messagesSent.percentage}
          progress={statsData.messagesSent.progress}
          progressColor="bg-indigo-500"
        />
        <StatsCard
          title="Nuevos Contactos"
          value={statsData.newContacts.value}
          subtext={statsData.newContacts.label}
          percentage={statsData.newContacts.percentage}
          progress={statsData.newContacts.progress}
          progressColor="bg-yellow-500"
        />
        <StatsCard
          title="Tasa de Respuesta"
          value={statsData.responseRate.value}
          subtext={statsData.responseRate.label}
          percentage={statsData.responseRate.percentage}
          progress={statsData.responseRate.progress}
          progressColor="bg-green-500"
        />
      </div>

      {/* Charts Section */}
      <ChartSection />

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentConversations />
        
        <div className="space-y-6">
          <QuickActions />
          <PlanCard />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
