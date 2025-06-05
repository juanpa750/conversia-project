import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  Users, 
  Building, 
  Phone, 
  Mail,
  Calendar,
  MapPin,
  Link,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  source: string;
  tags: string[];
  relationships: Relationship[];
}

interface Relationship {
  id: string;
  fromContactId: number;
  toContactId: number;
  type: 'colleague' | 'manager' | 'client' | 'vendor' | 'partner' | 'family' | 'friend';
  strength: 'weak' | 'medium' | 'strong';
  description: string;
  createdAt: string;
}

interface Company {
  id: number;
  name: string;
  industry: string;
  size: string;
  location: string;
  employees: Contact[];
}

export default function RelationshipMappingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeView, setActiveView] = useState<'network' | 'companies' | 'relationships'>('network');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch contacts with relationships
  const { data: contacts = [] } = useQuery({
    queryKey: ['/api/crm/contacts-with-relationships'],
    initialData: [
      {
        id: 1,
        name: 'María González',
        email: 'maria@techcorp.com',
        phone: '+34666777888',
        company: 'TechCorp Solutions',
        position: 'Directora de Ventas',
        source: 'whatsapp',
        tags: ['cliente', 'vip'],
        relationships: [
          {
            id: '1',
            fromContactId: 1,
            toContactId: 2,
            type: 'colleague' as const,
            strength: 'strong' as const,
            description: 'Trabajan en el mismo departamento',
            createdAt: '2024-01-10'
          },
          {
            id: '2',
            fromContactId: 1,
            toContactId: 3,
            type: 'manager' as const,
            strength: 'strong' as const,
            description: 'Carlos es su jefe directo',
            createdAt: '2024-01-05'
          }
        ]
      },
      {
        id: 2,
        name: 'Ana López',
        email: 'ana@techcorp.com',
        phone: '+34666444555',
        company: 'TechCorp Solutions',
        position: 'Especialista en Marketing',
        source: 'web',
        tags: ['prospecto', 'marketing'],
        relationships: [
          {
            id: '3',
            fromContactId: 2,
            toContactId: 1,
            type: 'colleague' as const,
            strength: 'strong' as const,
            description: 'Colaboran frecuentemente',
            createdAt: '2024-01-10'
          }
        ]
      },
      {
        id: 3,
        name: 'Carlos Ruiz',
        email: 'carlos@techcorp.com',
        phone: '+34666999111',
        company: 'TechCorp Solutions',
        position: 'Gerente General',
        source: 'referral',
        tags: ['cliente', 'decisor'],
        relationships: [
          {
            id: '4',
            fromContactId: 3,
            toContactId: 1,
            type: 'manager' as const,
            strength: 'strong' as const,
            description: 'Supervisa el departamento de ventas',
            createdAt: '2024-01-05'
          }
        ]
      },
      {
        id: 4,
        name: 'Luis Martín',
        email: 'luis@innovatech.es',
        phone: '+34666333222',
        company: 'InnovaTech Labs',
        position: 'CTO',
        source: 'linkedin',
        tags: ['prospecto', 'tech'],
        relationships: [
          {
            id: '5',
            fromContactId: 4,
            toContactId: 5,
            type: 'partner' as const,
            strength: 'medium' as const,
            description: 'Colaboración tecnológica',
            createdAt: '2024-01-12'
          }
        ]
      },
      {
        id: 5,
        name: 'Sofia Herrera',
        email: 'sofia@innovatech.es',
        phone: '+34666555444',
        company: 'InnovaTech Labs',
        position: 'Product Manager',
        source: 'event',
        tags: ['cliente', 'producto'],
        relationships: []
      }
    ]
  });

  // Fetch companies
  const { data: companies = [] } = useQuery({
    queryKey: ['/api/crm/companies'],
    initialData: [
      {
        id: 1,
        name: 'TechCorp Solutions',
        industry: 'Tecnología',
        size: '50-200 empleados',
        location: 'Madrid, España',
        employees: contacts.filter((c: Contact) => c.company === 'TechCorp Solutions')
      },
      {
        id: 2,
        name: 'InnovaTech Labs',
        industry: 'Software',
        size: '10-50 empleados',
        location: 'Barcelona, España',
        employees: contacts.filter((c: Contact) => c.company === 'InnovaTech Labs')
      }
    ]
  });

  const createRelationshipMutation = useMutation({
    mutationFn: async (relationship: Omit<Relationship, 'id' | 'createdAt'>) => {
      return apiRequest('POST', '/api/crm/relationships', relationship);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/contacts-with-relationships'] });
      toast({
        title: "Relación creada",
        description: "La nueva relación se ha agregado correctamente.",
      });
    }
  });

  const deleteRelationshipMutation = useMutation({
    mutationFn: async (relationshipId: string) => {
      return apiRequest('DELETE', `/api/crm/relationships/${relationshipId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/contacts-with-relationships'] });
      toast({
        title: "Relación eliminada",
        description: "La relación se ha eliminado correctamente.",
      });
    }
  });

  const getRelationshipTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      colleague: 'Colega',
      manager: 'Jefe',
      client: 'Cliente',
      vendor: 'Proveedor',
      partner: 'Socio',
      family: 'Familia',
      friend: 'Amigo'
    };
    return labels[type] || type;
  };

  const getRelationshipTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      colleague: 'bg-blue-100 text-blue-800',
      manager: 'bg-purple-100 text-purple-800',
      client: 'bg-green-100 text-green-800',
      vendor: 'bg-orange-100 text-orange-800',
      partner: 'bg-yellow-100 text-yellow-800',
      family: 'bg-pink-100 text-pink-800',
      friend: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'weak': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredContacts = contacts.filter((contact: Contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    
    const hasRelationshipType = contact.relationships.some(r => r.type === filterType);
    return matchesSearch && hasRelationshipType;
  });

  const getAllRelationships = () => {
    const allRelationships: Array<Relationship & { fromContact: Contact; toContact: Contact }> = [];
    
    contacts.forEach((contact: Contact) => {
      contact.relationships.forEach((relationship: Relationship) => {
        const toContact = contacts.find((c: Contact) => c.id === relationship.toContactId);
        if (toContact) {
          allRelationships.push({
            ...relationship,
            fromContact: contact,
            toContact
          });
        }
      });
    });
    
    return allRelationships;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mapeo de Relaciones</h1>
          <p className="text-gray-600">Visualiza y gestiona las conexiones entre contactos y empresas</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeView === 'network' ? 'default' : 'outline'}
            onClick={() => setActiveView('network')}
          >
            <Network className="w-4 h-4 mr-2" />
            Red de Contactos
          </Button>
          <Button
            variant={activeView === 'companies' ? 'default' : 'outline'}
            onClick={() => setActiveView('companies')}
          >
            <Building className="w-4 h-4 mr-2" />
            Empresas
          </Button>
          <Button
            variant={activeView === 'relationships' ? 'default' : 'outline'}
            onClick={() => setActiveView('relationships')}
          >
            <Link className="w-4 h-4 mr-2" />
            Relaciones
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar contactos, empresas o relaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                className="p-2 border rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="colleague">Colegas</option>
                <option value="manager">Jefes</option>
                <option value="client">Clientes</option>
                <option value="vendor">Proveedores</option>
                <option value="partner">Socios</option>
                <option value="family">Familia</option>
                <option value="friend">Amigos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeView === 'network' && (
        <div className="space-y-6">
          {/* Network Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Contactos</p>
                    <p className="text-2xl font-bold">{contacts.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Relaciones Activas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {getAllRelationships().length}
                    </p>
                  </div>
                  <Link className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Empresas Conectadas</p>
                    <p className="text-2xl font-bold text-purple-600">{companies.length}</p>
                  </div>
                  <Building className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Conexiones Fuertes</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {getAllRelationships().filter(r => r.strength === 'strong').length}
                    </p>
                  </div>
                  <Network className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Network */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Red de Contactos</CardTitle>
                  <CardDescription>
                    Mapa visual de las conexiones entre contactos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Visualización interactiva de la red</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Conecta con herramientas de visualización avanzadas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Contactos Clave</CardTitle>
                  <CardDescription>
                    Contactos con más conexiones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredContacts
                    .sort((a, b) => b.relationships.length - a.relationships.length)
                    .slice(0, 5)
                    .map((contact: Contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{contact.name}</h4>
                        <p className="text-sm text-gray-600">{contact.position}</p>
                        <p className="text-xs text-gray-500">{contact.company}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {contact.relationships.length} conexiones
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeView === 'companies' && (
        <div className="space-y-6">
          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company: Company) => (
              <Card key={company.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Building className="w-5 h-5 mr-2" />
                        {company.name}
                      </CardTitle>
                      <CardDescription>{company.industry}</CardDescription>
                    </div>
                    <Badge variant="outline">{company.size}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {company.location}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Contactos ({company.employees.length})</h4>
                    <div className="space-y-2">
                      {company.employees.slice(0, 3).map((employee: Contact) => (
                        <div key={employee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{employee.name}</p>
                            <p className="text-xs text-gray-600">{employee.position}</p>
                          </div>
                          <div className="flex space-x-1">
                            {employee.email && <Mail className="w-3 h-3 text-gray-400" />}
                            {employee.phone && <Phone className="w-3 h-3 text-gray-400" />}
                          </div>
                        </div>
                      ))}
                      {company.employees.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{company.employees.length - 3} más
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeView === 'relationships' && (
        <div className="space-y-6">
          {/* All Relationships */}
          <Card>
            <CardHeader>
              <CardTitle>Todas las Relaciones</CardTitle>
              <CardDescription>
                Gestiona las conexiones entre contactos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getAllRelationships().map((relationship) => (
                  <div key={relationship.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{relationship.fromContact.name}</p>
                          <p className="text-sm text-gray-600">{relationship.fromContact.position}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-px bg-gray-300"></div>
                        <Badge className={getRelationshipTypeColor(relationship.type)}>
                          {getRelationshipTypeLabel(relationship.type)}
                        </Badge>
                        <div className="w-6 h-px bg-gray-300"></div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{relationship.toContact.name}</p>
                          <p className="text-sm text-gray-600">{relationship.toContact.position}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getStrengthColor(relationship.strength)}`}>
                          {relationship.strength === 'strong' ? 'Fuerte' : 
                           relationship.strength === 'medium' ? 'Media' : 'Débil'}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(relationship.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRelationshipMutation.mutate(relationship.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}