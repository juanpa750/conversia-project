import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  FileText, 
  Download,
  Calendar,
  Filter,
  Eye,
  Share2,
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function CRMReports() {
  const { t } = useLanguage();
  const [reportType, setReportType] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');
  
  // Mock reports data
  const reports = [
    {
      id: 1,
      name: 'Reporte de Conversiones Mensual',
      type: 'conversion',
      description: 'Análisis detallado de conversiones y ventas del último mes',
      generatedAt: '2025-01-26',
      status: 'ready',
      size: '2.4 MB',
      format: 'PDF'
    },
    {
      id: 2,
      name: 'Análisis de Contactos por Canal',
      type: 'contacts',
      description: 'Distribución y análisis de contactos por canal de adquisición',
      generatedAt: '2025-01-25',
      status: 'ready',
      size: '1.8 MB',
      format: 'Excel'
    },
    {
      id: 3,
      name: 'Rendimiento de Campañas Q1',
      type: 'campaigns',
      description: 'Resumen de rendimiento de todas las campañas del primer trimestre',
      generatedAt: '2025-01-24',
      status: 'generating',
      size: '-',
      format: 'PDF'
    },
    {
      id: 4,
      name: 'Métricas de Satisfacción',
      type: 'satisfaction',
      description: 'Encuestas de satisfacción y feedback de clientes',
      generatedAt: '2025-01-23',
      status: 'ready',
      size: '980 KB',
      format: 'PDF'
    }
  ];

  const quickStats = [
    {
      title: 'Reportes Generados',
      value: '24',
      change: '+12%',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Descargas Este Mes',
      value: '156',
      change: '+8%',
      icon: Download,
      color: 'text-green-600'
    },
    {
      title: 'Reportes Programados',
      value: '8',
      change: '+2',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      title: 'Tamaño Promedio',
      value: '1.8 MB',
      change: '-5%',
      icon: Target,
      color: 'text-orange-600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return 'Listo';
      case 'generating': return 'Generando';
      case 'error': return 'Error';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'conversion': return 'Conversiones';
      case 'contacts': return 'Contactos';
      case 'campaigns': return 'Campañas';
      case 'satisfaction': return 'Satisfacción';
      default: return type;
    }
  };

  const filteredReports = reports.filter(report => {
    return reportType === 'all' || report.type === reportType;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes CRM</h1>
          <p className="text-gray-600 mt-2">Genera y gestiona reportes detallados de tu CRM</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <FileText className="w-4 h-4 mr-2" />
          Nuevo Reporte
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="conversion">Conversiones</SelectItem>
                  <SelectItem value="contacts">Contactos</SelectItem>
                  <SelectItem value="campaigns">Campañas</SelectItem>
                  <SelectItem value="satisfaction">Satisfacción</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="90d">Últimos 90 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusLabel(report.status)}
                    </Badge>
                    <Badge variant="outline">
                      {getTypeLabel(report.type)}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{report.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Generado: {new Date(report.generatedAt).toLocaleDateString()}
                    </div>
                    <div>Formato: {report.format}</div>
                    <div>Tamaño: {report.size}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-6">
                  {report.status === 'ready' && (
                    <>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {report.status === 'generating' && (
                    <div className="flex items-center space-x-2 text-yellow-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                      <span className="text-sm">Generando...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron reportes
            </h3>
            <p className="text-gray-600">
              {reportType !== 'all' 
                ? 'No hay reportes de este tipo disponibles'
                : 'Genera tu primer reporte para comenzar'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Reportes Programados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Reporte Semanal de Conversiones</p>
                <p className="text-sm text-gray-600">Cada lunes a las 9:00 AM</p>
              </div>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Análisis Mensual de Contactos</p>
                <p className="text-sm text-gray-600">Primer día del mes a las 8:00 AM</p>
              </div>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="text-center py-4">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Programar Nuevo Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}