import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  RiArrowLeftLine,
  RiSettings3Line,
  RiShoppingBag3Line,
  RiKeyLine,
  RiRobotLine,
  RiSaveLine,
  RiAddLine,
  RiDeleteBinLine,
} from "react-icons/ri";

interface ProductConfigProps {
  chatbotId: string;
}

export default function ProductConfig({ chatbotId }: ProductConfigProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [triggerKeywords, setTriggerKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");

  // Fetch chatbot details
  const { data: chatbot, isLoading: chatbotLoading } = useQuery({
    queryKey: ["/api/chatbots", chatbotId],
    enabled: !!chatbotId,
  });

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  // Load existing configuration
  const { data: existingConfig } = useQuery({
    queryKey: ["/api/chatbots", chatbotId, "product-config"],
    enabled: !!chatbotId,
  });

  // Save configuration mutation
  const saveConfig = useMutation({
    mutationFn: async (config: any) => {
      return apiRequest("POST", `/api/chatbots/${chatbotId}/product-config`, config);
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración del producto ha sido actualizada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chatbots"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !triggerKeywords.includes(newKeyword.trim())) {
      setTriggerKeywords([...triggerKeywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setTriggerKeywords(triggerKeywords.filter(k => k !== keyword));
  };

  const handleSave = () => {
    if (!selectedProductId) {
      toast({
        title: "Producto requerido",
        description: "Debes seleccionar un producto para vincular al chatbot.",
        variant: "destructive",
      });
      return;
    }

    saveConfig.mutate({
      productId: selectedProductId,
      triggerKeywords,
      aiInstructions,
    });
  };

  if (chatbotLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/chatbots")}
          >
            <RiArrowLeftLine className="mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configuración de Producto
            </h1>
            <p className="text-sm text-gray-500">
              {chatbot?.name || `Chatbot ${chatbotId}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <RiSettings3Line className="text-primary" />
          <span className="text-sm font-medium">Configuración Específica</span>
        </div>
      </div>

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RiShoppingBag3Line className="mr-2 text-primary" />
            Producto Vinculado
          </CardTitle>
          <CardDescription>
            Selecciona el producto específico que este chatbot representará
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="product-select">Producto</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un producto..." />
              </SelectTrigger>
              <SelectContent>
                {(products as any[])?.map((product: any) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{product.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {product.category}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedProductId && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                ✓ Producto seleccionado: <strong>
                  {(products as any[])?.find(p => p.id.toString() === selectedProductId)?.name}
                </strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trigger Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RiKeyLine className="mr-2 text-primary" />
            Palabras Clave de Activación
          </CardTitle>
          <CardDescription>
            Define las palabras que activarán específicamente este chatbot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Agregar palabra clave..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
            />
            <Button onClick={handleAddKeyword} size="sm">
              <RiAddLine className="mr-1" />
              Agregar
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {triggerKeywords.map((keyword, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center space-x-1 px-3 py-1"
              >
                <span>{keyword}</span>
                <button
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  <RiDeleteBinLine className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          {triggerKeywords.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No hay palabras clave configuradas
            </p>
          )}
        </CardContent>
      </Card>

      {/* AI Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RiRobotLine className="mr-2 text-primary" />
            Instrucciones de IA
          </CardTitle>
          <CardDescription>
            Personaliza cómo responderá la IA para este producto específico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Eres un especialista en ventas de [producto]. Tu objetivo es..."
            value={aiInstructions}
            onChange={(e) => setAiInstructions(e.target.value)}
            rows={8}
            className="resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            Define el comportamiento y personalidad específica del chatbot para este producto
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={() => setLocation("/chatbots")}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          disabled={saveConfig.isPending}
        >
          {saveConfig.isPending ? (
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
          ) : (
            <RiSaveLine className="mr-2" />
          )}
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}