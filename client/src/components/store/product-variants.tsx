import { useState, useRef } from "react";
import { Plus, Trash2, DollarSign, Package, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ProductVariant {
  id?: number;
  image: string;
  specification: string;
  variant: string;
  price: string;
  currency: string;
  stock: number;
  available: boolean;
  category: string;
  sku: string;
}

interface BasicProduct {
  price: string;
  currency: string;
  stock: number;
  category: string;
  sku: string;
}

interface ProductVariantsProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  basicProduct?: BasicProduct;
  onBasicProductChange?: (field: string, value: any) => void;
}

export function ProductVariants({ variants, onChange, basicProduct, onBasicProductChange }: ProductVariantsProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const priceImageRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      callback(result);
    };
    reader.readAsDataURL(file);
  };

  const handleVariantImageUpload = (index: number, file: File) => {
    handleFileUpload(file, (url) => {
      updateVariant(index, 'image', url);
    });
  };

  const addVariant = () => {
    // Si es la primera variante y hay información básica, crear la primera variante con esos datos
    if (variants.length === 0 && basicProduct) {
      const firstVariant: ProductVariant = {
        image: "",
        specification: "Producto estándar",
        variant: "Estándar",
        price: basicProduct.price,
        currency: basicProduct.currency,
        stock: basicProduct.stock,
        available: true,
        category: basicProduct.category,
        sku: basicProduct.sku,
      };
      onChange([firstVariant]);
    } else {
      // Agregar nueva variante vacía
      const newVariant: ProductVariant = {
        image: "",
        specification: "",
        variant: "",
        price: "",
        currency: basicProduct?.currency || "USD",
        stock: 0,
        available: true,
        category: basicProduct?.category || "",
        sku: "",
      };
      onChange([...variants, newVariant]);
    }
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    onChange(updatedVariants);
  };

  const removeVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    onChange(updatedVariants);
  };

  const updateBasicProduct = (field: string, value: any) => {
    if (onBasicProductChange) {
      onBasicProductChange(field, value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Precio y Variantes
          </h3>
          <p className="text-sm text-muted-foreground">
            {variants.length === 0 
              ? "Configura el precio básico del producto"
              : "Gestiona las diferentes opciones de precio"
            }
          </p>
        </div>
        <Button type="button" onClick={addVariant} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {variants.length === 0 ? "Agregar variante de precio" : "Nueva variante de precio +"}
        </Button>
      </div>

      {variants.length === 0 && basicProduct ? (
        // Mostrar formulario básico de precio cuando no hay variantes
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Información de Precio</h4>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={priceImageRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, (url) => {
                      // Aquí podrías agregar la imagen a un campo específico si fuera necesario
                      console.log('Foto de precio subida:', url);
                    });
                  }
                }}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => priceImageRef.current?.click()}
              >
                <Image className="h-4 w-4 mr-2" />
                Foto de precio
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Precio</label>
              <Input
                value={basicProduct.price}
                onChange={(e) => updateBasicProduct('price', e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Moneda</label>
              <Select
                value={basicProduct.currency}
                onValueChange={(value) => updateBasicProduct('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="MXN">MXN</SelectItem>
                  <SelectItem value="COP">COP</SelectItem>
                  <SelectItem value="ARS">ARS</SelectItem>
                  <SelectItem value="CLP">CLP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Stock</label>
              <Input
                value={basicProduct.stock}
                onChange={(e) => updateBasicProduct('stock', parseInt(e.target.value) || 0)}
                placeholder="0"
                type="number"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Categoría</label>
              <Input
                value={basicProduct.category}
                onChange={(e) => updateBasicProduct('category', e.target.value)}
                placeholder="Categoría"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">SKU</label>
              <Input
                value={basicProduct.sku}
                onChange={(e) => updateBasicProduct('sku', e.target.value)}
                placeholder="SKU"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Si tu producto tiene diferentes precios o características, haz clic en "Agregar variante de precio" para crear opciones múltiples.
          </p>
        </div>
      ) : variants.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Configurar Precio
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            Configura el precio y detalles de tu producto
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Especificación</TableHead>
                <TableHead>Característica/Variante</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="w-20">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={(el) => (fileInputRefs.current[index] = el)}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleVariantImageUpload(index, file);
                          }
                        }}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.current[index]?.click()}
                        className="flex-shrink-0"
                      >
                        <Upload className="h-3 w-3" />
                      </Button>
                      {variant.image && (
                        <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={variant.image}
                            alt="Variante"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={variant.specification}
                      onChange={(e) => updateVariant(index, 'specification', e.target.value)}
                      placeholder="Especificación"
                      className="min-w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={variant.variant}
                      onChange={(e) => updateVariant(index, 'variant', e.target.value)}
                      placeholder="Variante"
                      className="min-w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className="min-w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={variant.currency}
                      onValueChange={(value) => updateVariant(index, 'currency', value)}
                    >
                      <SelectTrigger className="min-w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="MXN">MXN</SelectItem>
                        <SelectItem value="COP">COP</SelectItem>
                        <SelectItem value="ARS">ARS</SelectItem>
                        <SelectItem value="CLP">CLP</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      type="number"
                      min="0"
                      className="min-w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={variant.available}
                      onCheckedChange={(checked) => updateVariant(index, 'available', checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={variant.category}
                      onChange={(e) => updateVariant(index, 'category', e.target.value)}
                      placeholder="Categoría"
                      className="min-w-28"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      placeholder="SKU"
                      className="min-w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVariant(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}