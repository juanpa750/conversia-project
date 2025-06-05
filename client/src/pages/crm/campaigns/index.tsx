import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Send, 
  Plus, 
  Calendar,
  Users,
  BarChart3,
  Play,
  Pause,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CRMCampaigns() {
  const { t } = useLanguage();
  
  // Mock data for campaigns
  const campaigns = [
    {
      id: 1,
      name: 'Campaña de Bienvenida',
      status: 'active',
      type: 'automated',
      recipients: 1250,
      sent: 1180,
      delivered: 1150,
      opened: 890,
      clicked: 124,
      createdAt: '2025-01-15',
      scheduledAt: '2025-01-16 09:00'
    },
    {
      id: 2,
      name: 'Promoción Fin de Mes',
      status: 'scheduled',
      type: 'broadcast',
      recipients: 2500,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      createdAt: '2025-01-10',
      scheduledAt: '2025-01-30 18:00'
    },
    {
      id: 3,
      name: 'Recordatorio de Abandono',
      status: 'paused',
      type: 'automated',
      recipients: 450,
      sent: 280,
      delivered: 275,
      opened: 195,
      clicked: 28,
      createdAt: '2025-01-05',
      scheduledAt: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'scheduled': return 'Programada';
      case 'paused': return 'Pausada';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campañas</h1>
          <p className="text-gray-600 mt-2">Gestiona tus campañas de WhatsApp marketing</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Campaña
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enviados</p>
                <p className="text-2xl font-bold text-gray-900">1,460</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entregados</p>
                <p className="text-2xl font-bold text-gray-900">1,425</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa Apertura</p>
                <p className="text-2xl font-bold text-gray-900">62.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Campañas Activas</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusLabel(campaign.status)}
                    </Badge>
                    <Badge variant="outline">
                      {campaign.type === 'automated' ? 'Automatizada' : 'Difusión'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Destinatarios</p>
                      <p className="font-semibold">{campaign.recipients.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Enviados</p>
                      <p className="font-semibold">{campaign.sent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Entregados</p>
                      <p className="font-semibold">{campaign.delivered.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Abiertos</p>
                      <p className="font-semibold">{campaign.opened.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Clicks</p>
                      <p className="font-semibold">{campaign.clicked.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {campaign.scheduledAt && (
                    <div className="mt-3 flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Programada para: {new Date(campaign.scheduledAt).toLocaleString()}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-6">
                  {campaign.status === 'active' && (
                    <Button variant="outline" size="sm">
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}
                  {campaign.status === 'paused' && (
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Send className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes campañas aún
            </h3>
            <p className="text-gray-600">
              Crea tu primera campaña para comenzar a llegar a tus clientes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}