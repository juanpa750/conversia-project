import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  RiStore2Line, 
  RiShoppingCart2Line, 
  RiMoneyDollarBoxLine,
  RiAddLine, 
  RiImage2Line, 
  RiCheckLine,
  RiCloseLine,
  RiEditLine,
  RiDeleteBinLine,
  RiFileTextLine,
  RiArrowDownSLine,
  RiArrowUpSLine
} from "@/lib/icons";
import { Layout } from "@/components/layout/layout";

// Mock data for products
const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Smartphone Pro X",
    price: 599.99,
    description: "El último modelo con cámara de alta resolución y batería de larga duración",
    imageUrl: "",
    category: "Electrónica",
    inventory: 42,
    sku: "SP-PRO-X-001",
  },
  {
    id: "2",
    name: "Auriculares Inalámbricos",
    price: 89.99,
    description: "Auriculares con cancelación de ruido y 20 horas de batería",
    imageUrl: "",
    category: "Accesorios",
    inventory: 78,
    sku: "AU-INAB-002",
  },
  {
    id: "3",
    name: "Tablet Ultra HD",
    price: 349.99,
    description: "Tablet de 10 pulgadas con pantalla Ultra HD y procesador rápido",
    imageUrl: "",
    category: "Electrónica",
    inventory: 15,
    sku: "TB-UHD-003",
  },
  {
    id: "4",
    name: "Reloj Inteligente",
    price: 129.99,
    description: "Monitorea tu salud y recibe notificaciones directamente en tu muñeca",
    imageUrl: "",
    category: "Wearables",
    inventory: 31,
    sku: "RL-INT-004",
  },
  {
    id: "5",
    name: "Altavoz Bluetooth",
    price: 59.99,
    description: "Altavoz portátil resistente al agua con sonido envolvente",
    imageUrl: "",
    category: "Audio",
    inventory: 64,
    sku: "AL-BT-005",
  }
];

// Mock data for orders
const MOCK_ORDERS = [
  {
    id: "ORD-001",
    customerName: "Ana García",
    customerPhone: "+34612345678",
    date: "2023-12-15T10:30:00Z",
    items: [
      { id: "1", name: "Smartphone Pro X", price: 599.99, quantity: 1 },
      { id: "2", name: "Auriculares Inalámbricos", price: 89.99, quantity: 1 }
    ],
    total: 689.98,
    status: "completed",
    paymentMethod: "stripe"
  },
  {
    id: "ORD-002",
    customerName: "Carlos López",
    customerPhone: "+34623456789",
    date: "2023-12-14T15:45:00Z",
    items: [
      { id: "3", name: "Tablet Ultra HD", price: 349.99, quantity: 1 }
    ],
    total: 349.99,
    status: "processing",
    paymentMethod: "pending"
  },
  {
    id: "ORD-003",
    customerName: "María Rodríguez",
    customerPhone: "+34634567890",
    date: "2023-12-13T09:15:00Z",
    items: [
      { id: "5", name: "Altavoz Bluetooth", price: 59.99, quantity: 2 }
    ],
    total: 119.98,
    status: "completed",
    paymentMethod: "stripe"
  },
  {
    id: "ORD-004",
    customerName: "Javier Martínez",
    customerPhone: "+34645678901",
    date: "2023-12-12T18:20:00Z",
    items: [
      { id: "4", name: "Reloj Inteligente", price: 129.99, quantity: 1 },
      { id: "2", name: "Auriculares Inalámbricos", price: 89.99, quantity: 1 }
    ],
    total: 219.98,
    status: "shipped",
    paymentMethod: "stripe"
  },
  {
    id: "ORD-005",
    customerName: "Laura González",
    customerPhone: "+34656789012",
    date: "2023-12-10T14:10:00Z",
    items: [
      { id: "1", name: "Smartphone Pro X", price: 599.99, quantity: 1 }
    ],
    total: 599.99,
    status: "cancelled",
    paymentMethod: "cancelled"
  }
];

// Mock data for abandoned carts
const MOCK_ABANDONED_CARTS = [
  {
    id: "CART-001",
    customerName: "Pedro Sánchez",
    customerPhone: "+34667890123",
    date: "2023-12-15T11:45:00Z",
    items: [
      { id: "1", name: "Smartphone Pro X", price: 599.99, quantity: 1 }
    ],
    total: 599.99,
    recoveryStatus: "pending"
  },
  {
    id: "CART-002",
    customerName: "Elena Pérez",
    customerPhone: "+34678901234",
    date: "2023-12-14T16:30:00Z",
    items: [
      { id: "3", name: "Tablet Ultra HD", price: 349.99, quantity: 1 },
      { id: "5", name: "Altavoz Bluetooth", price: 59.99, quantity: 1 }
    ],
    total: 409.98,
    recoveryStatus: "message_sent"
  },
  {
    id: "CART-003",
    customerName: "Daniel Fernández",
    customerPhone: "+34689012345",
    date: "2023-12-13T10:20:00Z",
    items: [
      { id: "2", name: "Auriculares Inalámbricos", price: 89.99, quantity: 1 },
      { id: "4", name: "Reloj Inteligente", price: 129.99, quantity: 1 }
    ],
    total: 219.98,
    recoveryStatus: "converted"
  }
];

export default function StorePage() {
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { toast } = useToast();

  // Filter products based on search term
  const filteredProducts = MOCK_PRODUCTS.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter orders based on search term
  const filteredOrders = MOCK_ORDERS.filter(order => 
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle viewing order details
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetailsDialog(true);
  };

  // Status badges for orders
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Procesando</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-800">Enviado</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>;
    }
  };

  // Recovery status badges for abandoned carts
  const getRecoveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'message_sent':
        return <Badge className="bg-blue-100 text-blue-800">Mensaje enviado</Badge>;
      case 'converted':
        return <Badge className="bg-green-100 text-green-800">Convertido</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>;
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tienda</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona tu catálogo de productos y ventas a través de WhatsApp
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Buscar productos, pedidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <RiAddLine className="h-5 w-5" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 gap-4 w-full md:w-2/3">
          <TabsTrigger value="products" className="flex gap-2 items-center">
            <RiStore2Line />
            <span>Productos</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex gap-2 items-center">
            <RiShoppingCart2Line />
            <span>Pedidos</span>
          </TabsTrigger>
          <TabsTrigger value="abandoned" className="flex gap-2 items-center">
            <RiArrowDownSLine />
            <span>Carritos abandonados</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex gap-2 items-center">
            <RiMoneyDollarBoxLine />
            <span>Configuración</span>
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Catálogo de productos</h2>
            <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <RiAddLine />
                  <span>Añadir producto</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Añadir nuevo producto</DialogTitle>
                  <DialogDescription>
                    Completa los detalles del producto. Todos los campos marcados con * son obligatorios.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del producto *</Label>
                      <Input id="name" placeholder="Ej: Smartphone Pro X" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio *</Label>
                      <Input id="price" type="number" step="0.01" placeholder="99.99" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea id="description" placeholder="Describe las características del producto..." rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electrónica</SelectItem>
                          <SelectItem value="accessories">Accesorios</SelectItem>
                          <SelectItem value="wearables">Wearables</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="other">Otra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inventory">Inventario *</Label>
                      <Input id="inventory" type="number" placeholder="10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" placeholder="Ej: PRD-001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Imagen</Label>
                      <div className="border-2 border-dashed border-gray-200 rounded flex items-center justify-center p-4">
                        <Button variant="outline" className="gap-2">
                          <RiImage2Line />
                          <span>Subir imagen</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddProductDialog(false)}>Cancelar</Button>
                  <Button onClick={() => {
                    setShowAddProductDialog(false);
                    toast({
                      title: "Producto añadido",
                      description: "El producto ha sido añadido al catálogo",
                    });
                  }}>Guardar producto</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Inventario</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      <span className={`${
                        product.inventory > 20 
                          ? "text-green-600" 
                          : product.inventory > 5 
                            ? "text-yellow-600" 
                            : "text-red-600"
                      }`}>
                        {product.inventory}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon">
                        <RiEditLine className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <RiDeleteBinLine className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    No se encontraron productos. Añade tu primer producto para empezar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Gestión de pedidos</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <RiFileTextLine />
                <span>Exportar</span>
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    No se encontraron pedidos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Order Details Dialog */}
          <Dialog open={showOrderDetailsDialog} onOpenChange={setShowOrderDetailsDialog}>
            <DialogContent className="sm:max-w-[600px]">
              {selectedOrder && (
                <>
                  <DialogHeader>
                    <div className="flex justify-between items-start">
                      <DialogTitle>Detalles del pedido {selectedOrder.id}</DialogTitle>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <DialogDescription>
                      Realizado el {formatDate(selectedOrder.date)}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Cliente</h4>
                        <p className="text-sm">{selectedOrder.customerName}</p>
                        <p className="text-sm text-gray-500">{selectedOrder.customerPhone}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Método de pago</h4>
                        <p className="text-sm capitalize">{selectedOrder.paymentMethod === "stripe" ? "Tarjeta de crédito (Stripe)" : selectedOrder.paymentMethod}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Productos</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.items.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{formatCurrency(item.price)}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} className="text-right font-medium p-2">Total</td>
                            <td className="text-right font-medium p-2">{formatCurrency(selectedOrder.total)}</td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setShowOrderDetailsDialog(false)}>Cerrar</Button>
                    <Button>Actualizar estado</Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Abandoned Carts Tab */}
        <TabsContent value="abandoned" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Carritos abandonados</h2>
            <Button variant="outline" className="gap-2">
              <RiArrowUpSLine />
              <span>Recuperar todos</span>
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ABANDONED_CARTS.map(cart => (
                <TableRow key={cart.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cart.customerName}</p>
                      <p className="text-xs text-gray-500">{cart.customerPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{cart.items.length} {cart.items.length === 1 ? "producto" : "productos"}</TableCell>
                  <TableCell>{formatDate(cart.date)}</TableCell>
                  <TableCell>{formatCurrency(cart.total)}</TableCell>
                  <TableCell>{getRecoveryStatusBadge(cart.recoveryStatus)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={cart.recoveryStatus === "converted"}
                      onClick={() => {
                        toast({
                          title: "Mensaje enviado",
                          description: `Se ha enviado un mensaje de recuperación a ${cart.customerName}`,
                        });
                      }}
                    >
                      Enviar recordatorio
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la tienda</CardTitle>
              <CardDescription>
                Configura los ajustes de tu tienda y opciones de pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información básica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Nombre de la tienda</Label>
                    <Input id="store-name" placeholder="Mi Tienda Online" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-currency">Moneda</Label>
                    <Select defaultValue="eur">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Métodos de pago</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded">
                        <RiMoneyDollarBoxLine className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Stripe</h4>
                        <p className="text-sm text-gray-500">Acepta pagos con tarjeta directamente en WhatsApp</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <RiCheckLine className="mr-1 h-3 w-3" />
                        Conectado
                      </Badge>
                      <Button variant="outline" size="sm">Configurar</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded">
                        <RiShoppingCart2Line className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Efectivo al recibir</h4>
                        <p className="text-sm text-gray-500">El cliente paga al recibir el producto</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <RiCheckLine className="mr-1 h-3 w-3" />
                        Activado
                      </Badge>
                      <Button variant="outline" size="sm">Configurar</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded">
                        <RiFileTextLine className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Transferencia bancaria</h4>
                        <p className="text-sm text-gray-500">El cliente realiza una transferencia a tu cuenta</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <RiCloseLine className="mr-1 h-3 w-3" />
                        Desactivado
                      </Badge>
                      <Button variant="outline" size="sm">Activar</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Opciones de carrito abandonado</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="recovery-time">Tiempo antes de enviar recordatorio</Label>
                    <Select defaultValue="1h">
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Seleccionar tiempo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30m">30 minutos</SelectItem>
                        <SelectItem value="1h">1 hora</SelectItem>
                        <SelectItem value="3h">3 horas</SelectItem>
                        <SelectItem value="6h">6 horas</SelectItem>
                        <SelectItem value="12h">12 horas</SelectItem>
                        <SelectItem value="24h">24 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recovery-template">Plantilla de mensaje</Label>
                    <Textarea 
                      id="recovery-template" 
                      placeholder="Hola [nombre], vimos que dejaste productos en tu carrito. ¿Quieres completar tu compra? 🛒" 
                      rows={3}
                      defaultValue="Hola [nombre], notamos que has dejado algunos productos en tu carrito de compra. ¿Necesitas ayuda para completar tu pedido o tienes alguna pregunta sobre los productos? Estamos aquí para ayudarte. 😊"
                    />
                    <p className="text-xs text-gray-500">
                      Usa [nombre] para insertar el nombre del cliente y [productos] para listar los productos.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="discount-offer">Ofrecer descuento en recordatorio</Label>
                    <Select defaultValue="none">
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Seleccionar descuento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin descuento</SelectItem>
                        <SelectItem value="5">5% de descuento</SelectItem>
                        <SelectItem value="10">10% de descuento</SelectItem>
                        <SelectItem value="15">15% de descuento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                toast({
                  title: "Configuración guardada",
                  description: "Los ajustes de la tienda se han actualizado correctamente",
                });
              }}>Guardar configuración</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}