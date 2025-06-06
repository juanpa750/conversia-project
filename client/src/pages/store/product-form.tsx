import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Plus, X, Upload, Image as ImageIcon, FileText, Truck, CreditCard } from 'lucide-react';
import type { Product } from '@shared/schema';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(10, 'Describe detalladamente el producto (mínimo 10 caracteres)'),
  price: z.string().optional(),
  currency: z.string().default('USD'),
  category: z.string().optional(),
  productImage: z.string().optional(),
  testimonialImages: z.array(z.string()).max(4, 'Máximo 4 imágenes de testimonio').default([]),
  priceImages: z.array(z.string()).max(4, 'Máximo 4 imágenes de precio').default([]),
  availability: z.boolean().default(true),
  stock: z.number().min(0).default(0),
  sku: z.string().optional(),
  tags: z.array(z.string()).default([]),
  freeShipping: z.boolean().default(false),
  cashOnDelivery: z.enum(['yes', 'no', 'not_applicable']).default('no'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [newTag, setNewTag] = useState('');
  const [newTestimonialImage, setNewTestimonialImage] = useState('');
  const [newPriceImage, setNewPriceImage] = useState('');
  
  // File upload refs
  const productImageRef = useRef<HTMLInputElement>(null);
  const testimonialImageRef = useRef<HTMLInputElement>(null);
  const priceImageRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || '',
      currency: product?.currency || 'USD',
      category: product?.category || '',
      productImage: product?.productImage || '',
      testimonialImages: product?.testimonialImages || [],
      priceImages: product?.priceImages || [],
      availability: product?.availability ?? true,
      stock: product?.stock || 0,
      sku: product?.sku || '',
      tags: product?.tags || [],
      freeShipping: product?.freeShipping ?? false,
      cashOnDelivery: product?.cashOnDelivery || 'no',
    },
  });

  const watchedTags = form.watch('tags');
  const watchedTestimonialImages = form.watch('testimonialImages');
  const watchedPriceImages = form.watch('priceImages');
  const watchedProductImage = form.watch('productImage');

  // Convert file to base64 or URL (simplified for demo)
  const handleFileUpload = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      callback(result);
    };
    reader.readAsDataURL(file);
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, (url) => {
        form.setValue('productImage', url);
      });
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = form.getValues('tags');
      form.setValue('tags', [...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter((_, i) => i !== index));
  };

  const addTestimonialImage = () => {
    if (newTestimonialImage.trim() && watchedTestimonialImages.length < 4) {
      const currentImages = form.getValues('testimonialImages');
      form.setValue('testimonialImages', [...currentImages, newTestimonialImage.trim()]);
      setNewTestimonialImage('');
    }
  };

  const removeTestimonialImage = (index: number) => {
    const currentImages = form.getValues('testimonialImages');
    form.setValue('testimonialImages', currentImages.filter((_, i) => i !== index));
  };

  const handleTestimonialImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && watchedTestimonialImages.length < 4) {
      handleFileUpload(file, (url) => {
        const currentImages = form.getValues('testimonialImages');
        form.setValue('testimonialImages', [...currentImages, url]);
      });
    }
  };

  const addPriceImage = () => {
    if (newPriceImage.trim() && watchedPriceImages.length < 4) {
      const currentImages = form.getValues('priceImages');
      form.setValue('priceImages', [...currentImages, newPriceImage.trim()]);
      setNewPriceImage('');
    }
  };

  const removePriceImage = (index: number) => {
    const currentImages = form.getValues('priceImages');
    form.setValue('priceImages', currentImages.filter((_, i) => i !== index));
  };

  const handlePriceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && watchedPriceImages.length < 4) {
      handleFileUpload(file, (url) => {
        const currentImages = form.getValues('priceImages');
        form.setValue('priceImages', [...currentImages, url]);
      });
    }
  };

  const handleSubmit = (data: ProductFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Detalles principales del producto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: iPhone 15 Pro Max" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción Completa *</FormLabel>
                  <FormDescription>
                    Incluye todo lo necesario para que la IA conozca el producto: características, beneficios, preguntas frecuentes, modo de uso, especificaciones técnicas, garantía, etc.
                  </FormDescription>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe detalladamente el producto. Incluye características, beneficios, preguntas frecuentes, modo de uso, especificaciones técnicas, garantía, etc..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input placeholder="999.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="COP">COP ($)</SelectItem>
                        <SelectItem value="MXN">MXN ($)</SelectItem>
                        <SelectItem value="ARS">ARS ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Tecnología, Ropa, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: IPH15-PM-256" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Disponible</FormLabel>
                    <FormDescription>
                      El producto está disponible para la venta
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Product Image */}
        <Card>
          <CardHeader>
            <CardTitle>Imagen del Producto</CardTitle>
            <CardDescription>
              Imagen principal del producto (1 imagen)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <input
                  type="file"
                  ref={productImageRef}
                  onChange={handleProductImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => productImageRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Imagen desde Archivo
                </Button>
              </div>

              {/* URL Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="O ingresa la URL de la imagen"
                  value={watchedProductImage}
                  onChange={(e) => form.setValue('productImage', e.target.value)}
                />
              </div>

              {/* Image Preview */}
              {watchedProductImage && (
                <div className="relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden max-w-xs">
                    <img
                      src={watchedProductImage}
                      alt="Vista previa del producto"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5LjggMTYgOCAxNC4yIDggMTJDOCA5LjggOS44IDggMTIgOEMxNC4yIDggMTYgOS44IDE2IDEyQzE2IDE0LjIgMTQuMiAxNiAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => form.setValue('productImage', '')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Testimonial Images */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes de Testimonios</CardTitle>
            <CardDescription>
              Imágenes de testimonios, reseñas o casos de éxito (máximo 4)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <input
                  type="file"
                  ref={testimonialImageRef}
                  onChange={handleTestimonialImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testimonialImageRef.current?.click()}
                  disabled={watchedTestimonialImages.length >= 4}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Imagen de Testimonio ({watchedTestimonialImages.length}/4)
                </Button>
              </div>

              {/* URL Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="O ingresa URL de imagen de testimonio"
                  value={newTestimonialImage}
                  onChange={(e) => setNewTestimonialImage(e.target.value)}
                  disabled={watchedTestimonialImages.length >= 4}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTestimonialImage();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addTestimonialImage} 
                  variant="outline"
                  disabled={watchedTestimonialImages.length >= 4}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Images Grid */}
              {watchedTestimonialImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {watchedTestimonialImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Testimonio ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5LjggMTYgOCAxNC4yIDggMTJDOCA5LjggOS44IDggMTIgOEMxNC4yIDggMTYgOS44IDE2IDEyQzE2IDE0LjIgMTQuMiAxNiAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeTestimonialImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Price Images */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes de Precios</CardTitle>
            <CardDescription>
              Imágenes con información de precios, ofertas o promociones (máximo 4)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <input
                  type="file"
                  ref={priceImageRef}
                  onChange={handlePriceImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => priceImageRef.current?.click()}
                  disabled={watchedPriceImages.length >= 4}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Imagen de Precio ({watchedPriceImages.length}/4)
                </Button>
              </div>

              {/* URL Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="O ingresa URL de imagen de precio"
                  value={newPriceImage}
                  onChange={(e) => setNewPriceImage(e.target.value)}
                  disabled={watchedPriceImages.length >= 4}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addPriceImage();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addPriceImage} 
                  variant="outline"
                  disabled={watchedPriceImages.length >= 4}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Images Grid */}
              {watchedPriceImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {watchedPriceImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Precio ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5LjggMTYgOCAxNC4yIDggMTJDOCA5LjggOS44IDggMTIgOEMxNC4yIDggMTYgOS44IDE2IDEyQzE2IDE0LjIgMTQuMiAxNiAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePriceImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Payment Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Opciones de Envío y Pago
            </CardTitle>
            <CardDescription>
              Configura las opciones de entrega y formas de pago disponibles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="freeShipping"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Envío Gratis
                    </FormLabel>
                    <FormDescription>
                      ¿Este producto incluye envío gratuito?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cashOnDelivery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Pago Contra Entrega
                  </FormLabel>
                  <FormDescription>
                    ¿Se acepta pago contra entrega para este producto?
                  </FormDescription>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Etiquetas</CardTitle>
            <CardDescription>
              Palabras clave para búsqueda y categorización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ej: smartphone, premium, nuevo, etc."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeTag(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : product ? "Actualizar" : "Crear"} Producto
          </Button>
        </div>
      </form>
    </Form>
  );
}