import { useState } from "react";
import { Plus, Trash2, Image, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ProductVariant {
  id?: number;
  variantName: string;
  characteristics: string;
  price: string;
  currency: string;
  variantImage: string;
  priceImages: string[];
  stock: number;
  isDefault: boolean;
  sortOrder: number;
}

interface ProductVariantsProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

export function ProductVariants({ variants, onChange }: ProductVariantsProps) {
  const [expandedVariant, setExpandedVariant] = useState<number | null>(0);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      variantName: `Variante ${variants.length + 1}`,
      characteristics: "",
      price: "",
      currency: "USD",
      variantImage: "",
      priceImages: [],
      stock: 0,
      isDefault: variants.length === 0,
      sortOrder: variants.length
    };
    onChange([...variants, newVariant]);
    setExpandedVariant(variants.length);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = variants.map((variant, i) => {
      if (i === index) {
        // If setting as default, unset others
        if (field === 'isDefault' && value) {
          return { ...variant, [field]: value };
        }
        return { ...variant, [field]: value };
      } else if (field === 'isDefault' && value) {
        return { ...variant, isDefault: false };
      }
      return variant;
    });
    onChange(updatedVariants);
  };

  const removeVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    // If we removed the default variant, make the first one default
    if (variants[index]?.isDefault && updatedVariants.length > 0) {
      updatedVariants[0] = { ...updatedVariants[0], isDefault: true };
    }
    onChange(updatedVariants);
    setExpandedVariant(null);
  };

  const addPriceImage = (variantIndex: number) => {
    const variant = variants[variantIndex];
    const newImages = [...(variant.priceImages || []), ""];
    updateVariant(variantIndex, 'priceImages', newImages);
  };

  const updatePriceImage = (variantIndex: number, imageIndex: number, url: string) => {
    const variant = variants[variantIndex];
    const newImages = [...(variant.priceImages || [])];
    newImages[imageIndex] = url;
    updateVariant(variantIndex, 'priceImages', newImages);
  };

  const removePriceImage = (variantIndex: number, imageIndex: number) => {
    const variant = variants[variantIndex];
    const newImages = (variant.priceImages || []).filter((_, i) => i !== imageIndex);
    updateVariant(variantIndex, 'priceImages', newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Variantes de Producto</h3>
          <p className="text-sm text-muted-foreground">
            Agrega diferentes opciones de precio con características específicas
          </p>
        </div>
        <Button onClick={addVariant} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Variante
        </Button>
      </div>

      {variants.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No hay variantes configuradas</p>
              <p className="text-sm">
                Agrega variantes para productos con diferentes precios, tamaños, colores, etc.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <Card key={index} className="relative">
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpandedVariant(expandedVariant === index ? null : index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">
                    {variant.variantName || `Variante ${index + 1}`}
                  </CardTitle>
                  {variant.isDefault && (
                    <Badge variant="default" className="text-xs">
                      Predeterminada
                    </Badge>
                  )}
                  {variant.price && (
                    <Badge variant="outline" className="text-xs">
                      {variant.currency} {variant.price}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVariant(index);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedVariant === index && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`variant-name-${index}`}>Nombre de la Variante</Label>
                    <Input
                      id={`variant-name-${index}`}
                      value={variant.variantName}
                      onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                      placeholder="ej: Presentación Grande, Color Azul"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`variant-price-${index}`}>Precio</Label>
                    <div className="flex gap-2">
                      <Select
                        value={variant.currency}
                        onValueChange={(value) => updateVariant(index, 'currency', value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="COP">COP</SelectItem>
                          <SelectItem value="MXN">MXN</SelectItem>
                          <SelectItem value="ARS">ARS</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id={`variant-price-${index}`}
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        placeholder="0.00"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`variant-characteristics-${index}`}>Características</Label>
                  <Textarea
                    id={`variant-characteristics-${index}`}
                    value={variant.characteristics}
                    onChange={(e) => updateVariant(index, 'characteristics', e.target.value)}
                    placeholder="Describe las características específicas de esta variante..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`variant-image-${index}`}>Imagen de la Variante</Label>
                    <Input
                      id={`variant-image-${index}`}
                      value={variant.variantImage}
                      onChange={(e) => updateVariant(index, 'variantImage', e.target.value)}
                      placeholder="URL de la imagen específica para esta variante"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`variant-stock-${index}`}>Stock</Label>
                    <Input
                      id={`variant-stock-${index}`}
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Imágenes de Precios</Label>
                      <p className="text-sm text-muted-foreground">
                        Imágenes específicas para mostrar el precio de esta variante
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addPriceImage(index)}
                      disabled={(variant.priceImages || []).length >= 4}
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Agregar Imagen
                    </Button>
                  </div>

                  {(variant.priceImages || []).map((image, imageIndex) => (
                    <div key={imageIndex} className="flex gap-2">
                      <Input
                        value={image}
                        onChange={(e) => updatePriceImage(index, imageIndex, e.target.value)}
                        placeholder={`URL de imagen de precio ${imageIndex + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePriceImage(index, imageIndex)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {(variant.priceImages || []).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay imágenes de precios configuradas para esta variante
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`variant-default-${index}`}
                    checked={variant.isDefault}
                    onCheckedChange={(checked) => updateVariant(index, 'isDefault', checked)}
                  />
                  <Label htmlFor={`variant-default-${index}`} className="text-sm">
                    Establecer como variante predeterminada
                  </Label>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {variants.length > 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Resumen de Variantes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>{variants.length} variante(s) configurada(s)</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>
                Rango: {variants.filter(v => v.price).length > 0 
                  ? `${Math.min(...variants.filter(v => v.price).map(v => parseFloat(v.price) || 0))} - ${Math.max(...variants.filter(v => v.price).map(v => parseFloat(v.price) || 0))}`
                  : 'Sin precios configurados'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-muted-foreground" />
              <span>
                {variants.reduce((acc, v) => acc + (v.priceImages?.length || 0), 0)} imagen(es) de precios
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}