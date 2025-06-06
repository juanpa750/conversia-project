import { useState } from "react";
import { Plus, Trash2, DollarSign, Package } from "lucide-react";
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

interface ProductVariantsProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

export function ProductVariants({ variants, onChange }: ProductVariantsProps) {
  const addVariant = () => {
    const newVariant: ProductVariant = {
      image: "",
      specification: "",
      variant: "",
      price: "",
      currency: "USD",
      stock: 0,
      available: true,
      category: "",
      sku: "",
    };
    onChange([...variants, newVariant]);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Precios
          </h3>
          <p className="text-sm text-muted-foreground">
            Gestiona las variantes de precio de tu producto
          </p>
        </div>
        <Button type="button" onClick={addVariant} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva variante de precio +
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Sin variantes de precio
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            Agrega diferentes opciones de precio para tu producto
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
                    <Input
                      value={variant.image}
                      onChange={(e) => updateVariant(index, 'image', e.target.value)}
                      placeholder="URL de imagen"
                      className="min-w-32"
                    />
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