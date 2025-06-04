import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  RiWhatsappLine, 
  RiBrainLine, 
  RiImage2Line, 
  RiMessage2Line,
  RiArrowDownSLine,
  RiCheckLine,
  RiUploadLine,
  RiSave3Line
} from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function WhatsAppBotConfig() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [prompt, setPrompt] = useState("");
  const [greeting, setGreeting] = useState("");
  const [imageRecognition, setImageRecognition] = useState(true);
  const [audioTranscription, setAudioTranscription] = useState(true);
  const [greetingType, setGreetingType] = useState("dynamic");
  
  // Estados para manejar el reconocimiento de productos
  const [products, setProducts] = useState([
    { id: 1, name: "Camiseta Casual", category: "Ropa", keywords: "camiseta, remera, polera", image: "" },
    { id: 2, name: "Zapatillas Deportivas", category: "Calzado", keywords: "zapatillas, tenis, zapatos deportivos", image: "" }
  ]);
  
  // Estado para subida de archivos
  const [mediaFiles, setMediaFiles] = useState([
    { id: 1, type: "image", name: "producto_premium.jpg", size: "1.2 MB", url: "" },
    { id: 2, type: "audio", name: "bienvenida.mp3", size: "0.8 MB", url: "" },
    { id: 3, type: "video", name: "tutorial.mp4", size: "4.5 MB", url: "" }
  ]);

  // Mutación para guardar la configuración
  const saveConfig = useMutation({
    mutationFn: async (data: any) => {
      // En implementación real aquí se haría la petición a la API
      return await new Promise(resolve => setTimeout(() => resolve(data), 1000));
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración del chatbot ha sido actualizada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la configuración. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = () => {
    const config = {
      prompt,
      greeting,
      greetingType,
      imageRecognition,
      audioTranscription,
      products,
      mediaFiles
    };
    
    saveConfig.mutate(config);
  };
  
  const handleAddProduct = () => {
    const newProduct = {
      id: products.length + 1,
      name: "",
      category: "",
      keywords: "",
      image: ""
    };
    setProducts([...products, newProduct]);
  };
  
  const handleProductChange = (id: number, field: string, value: string) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ));
  };
  
  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // En un caso real, aquí se subirían los archivos a un servidor
      const newFiles = Array.from(files).map((file, index) => ({
        id: mediaFiles.length + index + 1,
        type: file.type.split('/')[0] as 'image' | 'audio' | 'video',
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        url: URL.createObjectURL(file)
      }));
      
      setMediaFiles([...mediaFiles, ...newFiles]);
      
      toast({
        title: "Archivos subidos",
        description: `${newFiles.length} archivo(s) subido(s) correctamente.`,
      });
    }
  };
  
  const handleDeleteFile = (id: number) => {
    setMediaFiles(mediaFiles.filter(file => file.id !== id));
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de Chatbot WhatsApp</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configura tu chatbot de IA para WhatsApp de forma sencilla
          </p>
        </div>
        <Button 
          onClick={handleSaveConfig} 
          disabled={saveConfig.isPending}
          className="flex items-center gap-2"
        >
          <RiSave3Line className="h-4 w-4" />
          {saveConfig.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="general" className="flex gap-2 items-center">
            <RiBrainLine className="h-4 w-4" />
            <span>Configuración General</span>
          </TabsTrigger>
          <TabsTrigger value="productos" className="flex gap-2 items-center">
            <RiMessage2Line className="h-4 w-4" />
            <span>Reconocimiento de Productos</span>
          </TabsTrigger>
          <TabsTrigger value="multimedia" className="flex gap-2 items-center">
            <RiImage2Line className="h-4 w-4" />
            <span>Multimedia</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la IA</CardTitle>
                <CardDescription>
                  Define cómo debe comportarse tu asistente virtual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Instrucción de la IA (Prompt)</Label>
                  <Textarea 
                    id="prompt" 
                    placeholder="Actúa como un asistente amable y profesional de la tienda [Nombre]. Siempre saluda al cliente, preséntate como el asistente virtual, y pregunta en qué puedes ayudarle..."
                    rows={6}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Define cómo debe comportarse tu chatbot. Sé específico sobre el tono, personalidad y conocimientos que debe tener.
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="image-recognition" 
                    checked={imageRecognition}
                    onCheckedChange={setImageRecognition}
                  />
                  <Label htmlFor="image-recognition">Reconocimiento de imágenes</Label>
                </div>
                <p className="text-xs text-gray-500 ml-7">
                  Permite que la IA identifique objetos y contenido en las imágenes que envíen los clientes.
                </p>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="audio-transcription" 
                    checked={audioTranscription}
                    onCheckedChange={setAudioTranscription}
                  />
                  <Label htmlFor="audio-transcription">Transcripción de audio</Label>
                </div>
                <p className="text-xs text-gray-500 ml-7">
                  Convierte mensajes de voz en texto para que la IA pueda responder adecuadamente.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Saludos y Bienvenida</CardTitle>
                <CardDescription>
                  Configura cómo el chatbot saludará a tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="greeting-type">Tipo de saludo</Label>
                  <Select 
                    value={greetingType} 
                    onValueChange={setGreetingType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de saludo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">Mensaje fijo</SelectItem>
                      <SelectItem value="dynamic">Personalizado por contexto</SelectItem>
                      <SelectItem value="time">Según hora del día</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {greetingType === "static" && (
                  <div className="space-y-2">
                    <Label htmlFor="greeting">Mensaje de bienvenida</Label>
                    <Textarea 
                      id="greeting" 
                      placeholder="¡Hola! Soy el asistente virtual de [Nombre]. ¿En qué puedo ayudarte hoy?"
                      rows={4}
                      value={greeting}
                      onChange={(e) => setGreeting(e.target.value)}
                    />
                  </div>
                )}
                
                {greetingType === "dynamic" && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Saludo dinámico:</span> El chatbot personalizará el saludo basado en:
                      </p>
                      <ul className="mt-2 text-xs text-blue-700 space-y-1 list-disc pl-5">
                        <li>Si es un cliente nuevo o recurrente</li>
                        <li>Si hay conversaciones previas</li>
                        <li>El nombre del cliente si está disponible</li>
                        <li>La hora del día (mañana, tarde, noche)</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dynamic-example">Ejemplo de saludo dinámico:</Label>
                      <div className="p-3 rounded-lg bg-gray-50 text-sm text-gray-700">
                        "¡Hola de nuevo, María! Un gusto verte otra vez por aquí. Veo que la última vez estabas interesada en nuestras zapatillas deportivas. ¿Necesitas más información o puedo ayudarte con algo diferente hoy?"
                      </div>
                    </div>
                  </div>
                )}
                
                {greetingType === "time" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="morning">Saludo - Mañana (6:00 - 12:00)</Label>
                      <Input 
                        id="morning" 
                        placeholder="¡Buenos días! ¿En qué puedo ayudarte hoy?"
                        defaultValue="¡Buenos días! ¿En qué puedo ayudarte hoy?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="afternoon">Saludo - Tarde (12:00 - 18:00)</Label>
                      <Input 
                        id="afternoon" 
                        placeholder="¡Buenas tardes! ¿En qué puedo ayudarte hoy?"
                        defaultValue="¡Buenas tardes! ¿En qué puedo ayudarte hoy?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="evening">Saludo - Noche (18:00 - 6:00)</Label>
                      <Input 
                        id="evening" 
                        placeholder="¡Buenas noches! ¿En qué puedo ayudarte hoy?"
                        defaultValue="¡Buenas noches! ¿En qué puedo ayudarte hoy?"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="productos">
          <Card>
            <CardHeader>
              <CardTitle>Reconocimiento de Productos</CardTitle>
              <CardDescription>
                Configura productos para que la IA pueda reconocerlos y dar información específica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm">
                  El chatbot reconocerá estos productos cuando los clientes pregunten por ellos o envíen fotos similares.
                </p>
                <Button onClick={handleAddProduct} variant="outline">Añadir producto</Button>
              </div>
              
              <div className="space-y-4">
                {products.map(product => (
                  <div key={product.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Producto #{product.id}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        ×
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`product-name-${product.id}`}>Nombre del producto</Label>
                        <Input 
                          id={`product-name-${product.id}`} 
                          value={product.name}
                          onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`product-category-${product.id}`}>Categoría</Label>
                        <Input 
                          id={`product-category-${product.id}`} 
                          value={product.category}
                          onChange={(e) => handleProductChange(product.id, 'category', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`product-keywords-${product.id}`}>Palabras clave</Label>
                      <Input 
                        id={`product-keywords-${product.id}`} 
                        value={product.keywords}
                        onChange={(e) => handleProductChange(product.id, 'keywords', e.target.value)}
                        placeholder="Palabras separadas por comas (ej: zapatilla, calzado, deportivo)"
                      />
                      <p className="text-xs text-gray-500">
                        Palabras o frases que los clientes podrían usar para referirse a este producto.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <RiImage2Line className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`product-image-${product.id}`} className="mb-2 block">
                          Imagen de referencia
                        </Label>
                        <Input 
                          id={`product-image-${product.id}`}
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleProductChange(product.id, 'image', URL.createObjectURL(file));
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {products.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No hay productos configurados</p>
                  <Button onClick={handleAddProduct} variant="outline" className="mt-4">
                    Añadir producto
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <p className="text-xs text-gray-500">
                Añade hasta 50 productos para reconocimiento automático
              </p>
              <Button 
                onClick={() => setActiveTab("multimedia")}
                className="flex items-center gap-1"
              >
                Continuar <RiArrowDownSLine className="h-4 w-4 transform rotate-270" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="multimedia">
          <Card>
            <CardHeader>
              <CardTitle>Contenido Multimedia</CardTitle>
              <CardDescription>
                Sube fotos, audios y videos que el chatbot podrá usar en las conversaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <RiUploadLine className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="font-medium">Arrastra archivos aquí o haz clic para seleccionar</h3>
                  <p className="text-sm text-gray-500">
                    Soporta imágenes (JPG, PNG), audio (MP3, M4A) y video (MP4, MOV) hasta 20MB
                  </p>
                  <Button variant="outline" className="relative mt-2">
                    Seleccionar archivos
                    <input
                      type="file"
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*,audio/*,video/*"
                      onChange={handleFileUpload}
                    />
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Archivos disponibles ({mediaFiles.length})</h3>
                <div className="space-y-2">
                  {mediaFiles.map(file => (
                    <div 
                      key={file.id} 
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded flex items-center justify-center ${
                          file.type === 'image' ? 'bg-blue-100 text-blue-600' :
                          file.type === 'audio' ? 'bg-purple-100 text-purple-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {file.type === 'image' && <RiImage2Line className="h-5 w-5" />}
                          {file.type === 'audio' && <div className="h-5 w-5">🔊</div>}
                          {file.type === 'video' && <div className="h-5 w-5">🎬</div>}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          {file.type === 'image' ? 'Ver' : 'Reproducir'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-red-500 text-xs"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {mediaFiles.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No hay archivos cargados
                    </div>
                  )}
                </div>
              </div>
              
              <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">¿Cómo usar estos archivos?</span>
                </p>
                <p className="mt-1 text-xs text-yellow-700">
                  En el prompt, puedes indicarle a la IA que use estos archivos en momentos específicos. Por ejemplo: 
                  "Si el cliente pregunta por nuestras zapatillas deportivas, muestra la imagen 'zapatillas_deportivas.jpg'."
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button 
                onClick={handleSaveConfig} 
                disabled={saveConfig.isPending}
                className="flex items-center gap-2"
              >
                <RiSave3Line className="h-4 w-4" />
                {saveConfig.isPending ? "Guardando..." : "Guardar toda la configuración"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-10 rounded-lg border border-blue-100 bg-blue-50 p-6">
        <h3 className="font-medium text-blue-800 mb-2">¿Cómo funciona?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2">
                <RiBrainLine className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-blue-800">Configuración simple</h4>
            </div>
            <p className="text-sm text-blue-700">
              Solo escribe un prompt claro sobre cómo quieres que se comporte tu chatbot. 
              No se necesitan conocimientos técnicos.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2">
                <RiImage2Line className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-blue-800">Reconocimiento inteligente</h4>
            </div>
            <p className="text-sm text-blue-700">
              El chatbot puede identificar productos a partir de textos o imágenes 
              enviadas por los clientes.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2">
                <RiWhatsappLine className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-blue-800">Respuestas multimedia</h4>
            </div>
            <p className="text-sm text-blue-700">
              Envía imágenes, audios y videos automáticamente según el contexto 
              de la conversación.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}