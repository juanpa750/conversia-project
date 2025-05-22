import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RiSearchLine,
  RiUser3Line,
  RiAddLine,
  RiMoreLine,
  RiFileExcel2Line,
  RiWhatsappLine
} from "@/lib/icons";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastContact: string;
  status: "active" | "inactive" | "new";
  source: "whatsapp" | "web" | "manual";
  tags: string[];
  avatarUrl?: string;
}

const DUMMY_CLIENTS: Client[] = [
  {
    id: "1",
    name: "María González",
    phone: "+34 612 345 678",
    email: "maria@example.com",
    lastContact: "2023-12-10T14:30:00Z",
    status: "active",
    source: "whatsapp",
    tags: ["Cliente VIP", "Soporte"],
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  },
  {
    id: "2",
    name: "Carlos Martínez",
    phone: "+34 623 456 789",
    email: "carlos@example.com",
    lastContact: "2023-12-08T09:15:00Z",
    status: "active",
    source: "web",
    tags: ["Ventas", "Lead calificado"],
  },
  {
    id: "3",
    name: "Juan López",
    phone: "+34 634 567 890",
    email: "juan@example.com",
    lastContact: "2023-12-05T11:45:00Z",
    status: "inactive",
    source: "whatsapp",
    tags: ["Soporte"],
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
  },
  {
    id: "4",
    name: "Ana Rodríguez",
    phone: "+34 645 678 901",
    email: "ana@example.com",
    lastContact: "2023-12-12T16:20:00Z",
    status: "new",
    source: "manual",
    tags: ["Información"],
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
  },
  {
    id: "5",
    name: "Pedro Sánchez",
    phone: "+34 656 789 012",
    email: "pedro@example.com",
    lastContact: "2023-12-01T10:00:00Z",
    status: "inactive",
    source: "web",
    tags: ["Ventas"],
  },
];

const STATUS_BADGES = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-yellow-100 text-yellow-800",
  new: "bg-blue-100 text-blue-800",
};

const STATUS_LABELS = {
  active: "Activo",
  inactive: "Inactivo",
  new: "Nuevo",
};

const SOURCE_ICONS = {
  whatsapp: <RiWhatsappLine className="text-green-500" />,
  web: <RiGlobalLine className="text-blue-500" />,
  manual: <RiUser3Line className="text-purple-500" />,
};

export function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // In a real application, we would fetch this data from the API
  const { data: clients } = useQuery({
    queryKey: ["/api/clients", { search: searchQuery, status: statusFilter }],
    initialData: DUMMY_CLIENTS,
  });

  const filteredClients = clients.filter((client) => {
    if (statusFilter && client.status !== statusFilter) {
      return false;
    }
    if (
      searchQuery &&
      !client.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !client.phone.includes(searchQuery) &&
      !client.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <>
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tus contactos y clientes
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <RiFileExcel2Line className="mr-2" />
            Exportar
          </Button>
          <Button>
            <RiAddLine className="mr-2" />
            Añadir Cliente
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="relative w-full md:w-96">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <RiSearchLine />
              </span>
              <Input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={statusFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(null)}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("active")}
              >
                Activos
              </Button>
              <Button
                variant={statusFilter === "inactive" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("inactive")}
              >
                Inactivos
              </Button>
              <Button
                variant={statusFilter === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("new")}
              >
                Nuevos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Etiquetas</TableHead>
                <TableHead>Último Contacto</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="mr-3 h-10 w-10">
                        <AvatarImage 
                          src={client.avatarUrl} 
                          alt={client.name} 
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {client.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.phone}</div>
                        <div className="text-xs text-gray-500">{client.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_BADGES[client.status]}>
                      {STATUS_LABELS[client.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-100">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(client.lastContact).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {SOURCE_ICONS[client.source]}
                      <span className="ml-2 capitalize">{client.source}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <RiMoreLine />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                        <DropdownMenuItem>Editar cliente</DropdownMenuItem>
                        <DropdownMenuItem>Enviar mensaje</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredClients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-6">
                <RiUser3Line className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium">No se encontraron clientes</h3>
              <p className="mb-6 max-w-md text-sm text-gray-500">
                {searchQuery
                  ? `No hay resultados para "${searchQuery}"`
                  : "No hay clientes que coincidan con los filtros seleccionados."}
              </p>
              <Button>
                <RiAddLine className="mr-2" />
                Añadir Cliente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

import { RiGlobalLine } from "@/lib/icons";

export default Clients;
