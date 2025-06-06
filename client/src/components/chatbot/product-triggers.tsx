import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Edit, 
  AlertCircle,
  Zap,
  Target,
  Brain,
  MessageSquare,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Product, ProductTrigger, ProductAiConfig } from '@shared/schema';

interface ProductTriggersProps {
  chatbotId: number;
}

export function ProductTriggers({ chatbotId }: ProductTriggersProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<ProductTrigger | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newPhrase, setNewPhrase] = useState('');

  // Fetch products and triggers
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    select: (data: Product[]) => data
  });

  const { data: triggers = [], isLoading } = useQuery({
    queryKey: ['/api/chatbots', chatbotId, 'triggers'],
    enabled: !!chatbotId,
  });

  // Create trigger mutation
  const createTriggerMutation = useMutation({
    mutationFn: async (triggerData: any) => {
      return await apiRequest('POST', '/api/triggers', triggerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots', chatbotId, 'triggers'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Disparador creado",
        description: "El disparador se ha configurado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear disparador",
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update trigger mutation
  const updateTriggerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest('PUT', `/api/triggers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots', chatbotId, 'triggers'] });
      setIsEditDialogOpen(false);
      setSelectedTrigger(null);
      toast({
        title: "Disparador actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar disparador",
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete trigger mutation
  const deleteTriggerMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/triggers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots', chatbotId, 'triggers'] });
      toast({
        title: "Disparador eliminado",
        description: "El disparador se ha eliminado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar disparador",
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Producto no encontrado';
  };

  const getProductsWithoutTriggers = () => {
    const triggeredProductIds = triggers.map(t => t.productId);
    return products.filter(p => !triggeredProductIds.includes(p.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Disparadores de Productos</h3>
          <p className="text-sm text-gray-600">
            Configura palabras clave para que la IA reconozca de qué productos están hablando los clientes
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={getProductsWithoutTriggers().length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Disparador
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          Los disparadores permiten que la IA identifique automáticamente de qué producto está preguntando el cliente 
          y responda con información específica usando la metodología AIDA.
        </AlertDescription>
      </Alert>

      {/* Triggers List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="flex gap-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-6 w-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : triggers.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay disparadores configurados
          </h3>
          <p className="text-gray-500 mb-4">
            Crea disparadores para que la IA pueda reconocer productos específicos en las conversaciones
          </p>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={getProductsWithoutTriggers().length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Disparador
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {triggers.map((trigger) => (
            <Card key={trigger.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      {getProductName(trigger.productId)}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={trigger.isActive ? "default" : "secondary"}>
                        {trigger.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant="outline">
                        Prioridad: {trigger.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTrigger(trigger);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTriggerMutation.mutate(trigger.id)}
                      disabled={deleteTriggerMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Keywords */}
                  {trigger.keywords && trigger.keywords.length > 0 && (
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Palabras Clave:</Label>
                      <div className="flex flex-wrap gap-1">
                        {trigger.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phrases */}
                  {trigger.phrases && trigger.phrases.length > 0 && (
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Frases:</Label>
                      <div className="flex flex-wrap gap-1">
                        {trigger.phrases.map((phrase, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            "{phrase}"
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Trigger Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Disparador</DialogTitle>
            <DialogDescription>
              Configura las palabras clave y frases que activarán la respuesta específica del producto
            </DialogDescription>
          </DialogHeader>
          <TriggerForm
            products={getProductsWithoutTriggers()}
            chatbotId={chatbotId}
            onSubmit={(data) => createTriggerMutation.mutate(data)}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createTriggerMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Trigger Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Disparador</DialogTitle>
            <DialogDescription>
              Modifica las configuraciones del disparador
            </DialogDescription>
          </DialogHeader>
          {selectedTrigger && (
            <TriggerForm
              products={products}
              chatbotId={chatbotId}
              trigger={selectedTrigger}
              onSubmit={(data) => updateTriggerMutation.mutate({ 
                id: selectedTrigger.id, 
                data 
              })}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedTrigger(null);
              }}
              isLoading={updateTriggerMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TriggerFormProps {
  products: Product[];
  chatbotId: number;
  trigger?: ProductTrigger;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function TriggerForm({ products, chatbotId, trigger, onSubmit, onCancel, isLoading }: TriggerFormProps) {
  const [selectedProductId, setSelectedProductId] = useState(trigger?.productId?.toString() || '');
  const [keywords, setKeywords] = useState<string[]>(trigger?.keywords || []);
  const [phrases, setPhrases] = useState<string[]>(trigger?.phrases || []);
  const [priority, setPriority] = useState(trigger?.priority || 1);
  const [isActive, setIsActive] = useState(trigger?.isActive ?? true);
  const [newKeyword, setNewKeyword] = useState('');
  const [newPhrase, setNewPhrase] = useState('');

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim().toLowerCase())) {
      setKeywords([...keywords, newKeyword.trim().toLowerCase()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const addPhrase = () => {
    if (newPhrase.trim() && !phrases.includes(newPhrase.trim().toLowerCase())) {
      setPhrases([...phrases, newPhrase.trim().toLowerCase()]);
      setNewPhrase('');
    }
  };

  const removePhrase = (index: number) => {
    setPhrases(phrases.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!selectedProductId) {
      return;
    }

    const data = {
      productId: parseInt(selectedProductId),
      chatbotId,
      keywords,
      phrases,
      priority,
      isActive,
    };

    onSubmit(data);
  };

  const generateSuggestedTriggers = () => {
    if (!selectedProduct) return;

    const suggestions = {
      keywords: [
        selectedProduct.name.toLowerCase(),
        ...(selectedProduct.tags || []).map(tag => tag.toLowerCase()),
        selectedProduct.category?.toLowerCase(),
        selectedProduct.sku?.toLowerCase(),
      ].filter(Boolean),
      phrases: [
        `información sobre ${selectedProduct.name.toLowerCase()}`,
        `quiero comprar ${selectedProduct.name.toLowerCase()}`,
        `precio de ${selectedProduct.name.toLowerCase()}`,
        `características de ${selectedProduct.name.toLowerCase()}`,
        `disponibilidad de ${selectedProduct.name.toLowerCase()}`,
      ]
    };

    // Add suggested keywords that aren't already present
    const newKeywords = suggestions.keywords.filter(k => k && !keywords.includes(k));
    if (newKeywords.length > 0) {
      setKeywords([...keywords, ...newKeywords]);
    }

    // Add suggested phrases that aren't already present
    const newPhrases = suggestions.phrases.filter(p => p && !phrases.includes(p));
    if (newPhrases.length > 0) {
      setPhrases([...phrases, ...newPhrases]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Selection */}
      <div className="space-y-2">
        <Label>Producto *</Label>
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un producto" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedProduct && (
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateSuggestedTriggers}
            >
              <Brain className="h-4 w-4 mr-2" />
              Generar Sugerencias Automáticas
            </Button>
          </div>
        )}
      </div>

      {/* Keywords */}
      <div className="space-y-3">
        <Label>Palabras Clave</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ej: iphone, smartphone, móvil..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addKeyword();
              }
            }}
          />
          <Button type="button" onClick={addKeyword} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {keyword}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => removeKeyword(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Phrases */}
      <div className="space-y-3">
        <Label>Frases Específicas</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ej: quiero información del iPhone 15..."
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addPhrase();
              }
            }}
          />
          <Button type="button" onClick={addPhrase} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {phrases.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {phrases.map((phrase, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                "{phrase}"
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => removePhrase(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Prioridad</Label>
          <Select value={priority.toString()} onValueChange={(value) => setPriority(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Más alta</SelectItem>
              <SelectItem value="2">2 - Alta</SelectItem>
              <SelectItem value="3">3 - Media</SelectItem>
              <SelectItem value="4">4 - Baja</SelectItem>
              <SelectItem value="5">5 - Más baja</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <span className="text-sm">
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !selectedProductId || (keywords.length === 0 && phrases.length === 0)}
        >
          {isLoading ? "Guardando..." : trigger ? "Actualizar" : "Crear"} Disparador
        </Button>
      </DialogFooter>
    </div>
  );
}