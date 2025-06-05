import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Network, 
  Building2, 
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
  Download
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  tags: string[];
  score: number;
  status: 'active' | 'inactive' | 'prospect';
  lastContact: string;
  totalInteractions: number;
  relationships: Relationship[];
}

interface Relationship {
  id: string;
  targetContactId: string;
  targetContactName: string;
  type: 'colleague' | 'manager' | 'subordinate' | 'vendor' | 'client' | 'referral';
  strength: number; // 1-10
  source: 'discovered' | 'manual' | 'ai_detected';
  confidence: number; // 1-100
  notes: string;
  createdAt: string;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  contacts: Contact[];
  revenue: number;
  status: 'client' | 'prospect' | 'partner';
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Ana García',
    email: 'ana.garcia@techcorp.com',
    phone: '+1234567890',
    company: 'TechCorp Solutions',
    position: 'CTO',
    tags: ['decision_maker', 'tech_lead', 'high_value'],
    score: 85,
    status: 'active',
    lastContact: '2024-01-15T10:30:00Z',
    totalInteractions: 23,
    relationships: [
      {
        id: '1',
        targetContactId: '2',
        targetContactName: 'Carlos Ruiz',
        type: 'manager',
        strength: 8,
        source: 'discovered',
        confidence: 95,
        notes: 'Ana reporta directamente a Carlos según LinkedIn',
        createdAt: '2024-01-10T08:00:00Z'
      },
      {
        id: '2',
        targetContactId: '3',
        targetContactName: 'María López',
        type: 'colleague',
        strength: 6,
        source: 'ai_detected',
        confidence: 78,
        notes: 'Ambas participan frecuentemente en reuniones juntas',
        createdAt: '2024-01-12T14:20:00Z'
      }
    ]
  },
  {
    id: '2',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@techcorp.com',
    phone: '+1234567891',
    company: 'TechCorp Solutions',
    position: 'CEO',
    tags: ['decision_maker', 'c_level', 'high_authority'],
    score: 95,
    status: 'active',
    lastContact: '2024-01-14T16:45:00Z',
    totalInteractions: 15,
    relationships: [
      {
        id: '3',
        targetContactId: '1',
        targetContactName: 'Ana García',
        type: 'subordinate',
        strength: 8,
        source: 'manual',
        confidence: 100,
        notes: 'Carlos es el jefe directo de Ana',
        createdAt: '2024-01-10T08:00:00Z'
      }
    ]
  },
  {
    id: '3',
    name: 'María López',
    email: 'maria.lopez@techcorp.com',
    phone: '+1234567892',
    company: 'TechCorp Solutions',
    position: 'Product Manager',
    tags: ['influencer', 'product_focused'],
    score: 72,
    status: 'active',
    lastContact: '2024-01-13T09:15:00Z',
    totalInteractions: 18,
    relationships: [
      {
        id: '4',
        targetContactId: '1',
        targetContactName: 'Ana García',
        type: 'colleague',
        strength: 6,
        source: 'ai_detected',
        confidence: 78,
        notes: 'Colaboran en proyectos de tecnología',
        createdAt: '2024-01-12T14:20:00Z'
      }
    ]
  },
  {
    id: '4',
    name: 'Roberto Silva',
    email: 'roberto.silva@innovatech.com',
    phone: '+1234567893',
    company: 'InnovaTech',
    position: 'Sales Director',
    tags: ['referral_source', 'partner'],
    score: 68,
    status: 'prospect',
    lastContact: '2024-01-11T11:30:00Z',
    totalInteractions: 8,
    relationships: [
      {
        id: '5',
        targetContactId: '2',
        targetContactName: 'Carlos Ruiz',
        type: 'referral',
        strength: 7,
        source: 'manual',
        confidence: 90,
        notes: 'Roberto refirió a Carlos para una oportunidad de negocio',
        createdAt: '2024-01-09T13:45:00Z'
      }
    ]
  }
];

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    industry: 'Technology',
    size: 'Medium (50-200)',
    revenue: 5000000,
    status: 'client',
    contacts: mockContacts.filter(c => c.company === 'TechCorp Solutions')
  },
  {
    id: '2',
    name: 'InnovaTech',
    industry: 'Software',
    size: 'Large (200+)',
    revenue: 15000000,
    status: 'prospect',
    contacts: mockContacts.filter(c => c.company === 'InnovaTech')
  }
];

export default function RelationshipMappingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [viewMode, setViewMode] = useState<'network' | 'companies' | 'individuals'>('network');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const { data: contacts = mockContacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['/api/contacts-relationships'],
    queryFn: () => Promise.resolve(mockContacts)
  });

  const { data: companies = mockCompanies, isLoading: companiesLoading } = useQuery({
    queryKey: ['/api/companies-relationships'],
    queryFn: () => Promise.resolve(mockCompanies)
  });

  const addRelationship = useMutation({
    mutationFn: async (relationship: Partial<Relationship>) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts-relationships'] });
      toast({
        title: "Relación agregada",
        description: "La nueva relación ha sido agregada exitosamente.",
      });
    }
  });

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'manager': return <TrendingUp className="w-4 h-4" />;
      case 'subordinate': return <Users className="w-4 h-4" />;
      case 'colleague': return <Users className="w-4 h-4" />;
      case 'vendor': return <Building2 className="w-4 h-4" />;
      case 'client': return <Building2 className="w-4 h-4" />;
      case 'referral': return <Network className="w-4 h-4" />;
      default: return <Network className="w-4 h-4" />;
    }
  };

  const getRelationshipLabel = (type: string) => {
    switch (type) {
      case 'manager': return 'Jefe';
      case 'subordinate': return 'Subordinado';
      case 'colleague': return 'Colega';
      case 'vendor': return 'Proveedor';
      case 'client': return 'Cliente';
      case 'referral': return 'Referido';
      default: return type;
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 8) return 'text-green-600';
    if (strength >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalContacts = contacts.length;
  const totalRelationships = contacts.reduce((sum, contact) => sum + contact.relationships.length, 0);
  const avgScore = contacts.reduce((sum, contact) => sum + contact.score, 0) / contacts.length;
  const companiesWithMultipleContacts = companies.filter(company => company.contacts.length > 1).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mapeo de Relaciones</h1>
          <p className="text-gray-600">Visualiza y gestiona la red de contactos y relaciones empresariales</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Relación
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Contactos</p>
                <p className="text-2xl font-bold text-gray-900">{totalContacts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Network className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Relaciones Mapeadas</p>
                <p className="text-2xl font-bold text-gray-900">{totalRelationships}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Score Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{avgScore.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Empresas Conectadas</p>
                <p className="text-2xl font-bold text-gray-900">{companiesWithMultipleContacts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'network', label: 'Vista Red' },
            { id: 'companies', label: 'Por Empresas' },
            { id: 'individuals', label: 'Contactos Individuales' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                viewMode === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {viewMode === 'network' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Red de Contactos</CardTitle>
              <CardDescription>
                Visualización interactiva de las relaciones entre contactos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Mapa Interactivo de Relaciones</h3>
                  <p className="text-gray-600 mt-2">
                    Aquí se mostraría una visualización interactiva de la red de contactos
                  </p>
                  <Button className="mt-4">
                    Ver Mapa Completo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conectores Clave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contacts
                    .sort((a, b) => b.relationships.length - a.relationships.length)
                    .slice(0, 3)
                    .map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-gray-600">{contact.position} en {contact.company}</p>
                        </div>
                        <Badge variant="outline">
                          {contact.relationships.length} relaciones
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relaciones Más Fuertes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contacts
                    .flatMap(contact => 
                      contact.relationships.map(rel => ({
                        ...rel,
                        sourceContact: contact
                      }))
                    )
                    .sort((a, b) => b.strength - a.strength)
                    .slice(0, 3)
                    .map((relationship, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {relationship.sourceContact.name} → {relationship.targetContactName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {getRelationshipLabel(relationship.type)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getStrengthColor(relationship.strength)}`}>
                            {relationship.strength}/10
                          </p>
                          <p className="text-xs text-gray-500">{relationship.confidence}% confianza</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {viewMode === 'companies' && (
        <div className="space-y-4">
          {companiesLoading ? (
            <div className="text-center py-8">Cargando empresas...</div>
          ) : (
            companies.map((company) => (
              <Card key={company.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{company.name}</h3>
                      <p className="text-gray-600">{company.industry} • {company.size}</p>
                      <Badge className={getStatusColor(company.status)}>
                        {company.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ${company.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Revenue anual</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Contactos ({company.contacts.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {company.contacts.map((contact) => (
                        <div key={contact.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium">{contact.name}</h5>
                              <p className="text-sm text-gray-600">{contact.position}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{contact.email}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{contact.phone}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-blue-600">{contact.score}</p>
                              <p className="text-xs text-gray-500">Score</p>
                              <Badge className={getStatusColor(contact.status)} variant="outline">
                                {contact.status}
                              </Badge>
                            </div>
                          </div>
                          
                          {contact.relationships.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm font-medium mb-2">
                                Relaciones ({contact.relationships.length})
                              </p>
                              <div className="space-y-1">
                                {contact.relationships.slice(0, 2).map((rel) => (
                                  <div key={rel.id} className="flex items-center text-sm text-gray-600">
                                    {getRelationshipIcon(rel.type)}
                                    <span className="ml-1">
                                      {getRelationshipLabel(rel.type)} con {rel.targetContactName}
                                    </span>
                                  </div>
                                ))}
                                {contact.relationships.length > 2 && (
                                  <p className="text-xs text-gray-500">
                                    +{contact.relationships.length - 2} más
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {viewMode === 'individuals' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar contactos..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {contactsLoading ? (
            <div className="text-center py-8">Cargando contactos...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {contacts.map((contact) => (
                <Card key={contact.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{contact.name}</h3>
                            <p className="text-gray-600">{contact.position} en {contact.company}</p>
                          </div>
                          <Badge className={getStatusColor(contact.status)}>
                            {contact.status}
                          </Badge>
                          <div className="text-right">
                            <p className="text-xl font-bold text-blue-600">{contact.score}</p>
                            <p className="text-xs text-gray-500">Score</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{contact.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MessageSquare className="w-4 h-4" />
                            <span>{contact.totalInteractions} interacciones</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Etiquetas:</h4>
                          <div className="flex flex-wrap gap-2">
                            {contact.tags.map((tag, index) => (
                              <Badge key={index} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {contact.relationships.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">
                              Relaciones ({contact.relationships.length}):
                            </h4>
                            <div className="space-y-2">
                              {contact.relationships.map((relationship) => (
                                <div key={relationship.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                                  <div className="flex items-center space-x-3">
                                    {getRelationshipIcon(relationship.type)}
                                    <div>
                                      <p className="font-medium">{relationship.targetContactName}</p>
                                      <p className="text-sm text-gray-600">
                                        {getRelationshipLabel(relationship.type)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className={`font-bold ${getStrengthColor(relationship.strength)}`}>
                                      {relationship.strength}/10
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {relationship.confidence}% confianza
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}