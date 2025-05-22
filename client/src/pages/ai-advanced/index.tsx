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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { RiBrainLine, RiUploadLine, RiFileTextLine, RiRobotLine, RiImage2Line, RiEmotionLine } from "@/lib/icons";
import { Layout } from "@/components/layout/layout";

export default function AIAdvanced() {
  const [activeTab, setActiveTab] = useState("train");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [sentimentText, setSentimentText] = useState("");
  const [sentimentResult, setSentimentResult] = useState<null | {
    sentiment: "positive" | "negative" | "neutral";
    score: number;
  }>(null);
  const { toast } = useToast();

  // Simulate file upload with progress
  const handleFileUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Archivo procesado correctamente",
            description: "El documento ha sido analizado y añadido a la base de conocimiento"
          });
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  // Simulate sentiment analysis
  const analyzeSentiment = () => {
    if (!sentimentText) {
      toast({
        title: "Error",
        description: "Por favor, introduce un texto para analizar",
        variant: "destructive"
      });
      return;
    }

    // Simulate processing
    setTimeout(() => {
      // Simple mock sentiment analysis
      const words = sentimentText.toLowerCase().split(" ");
      const positiveWords = ["bueno", "excelente", "genial", "feliz", "satisfecho", "gracias", "encantado"];
      const negativeWords = ["malo", "terrible", "pésimo", "infeliz", "enojado", "frustrado", "problema"];
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      words.forEach(word => {
        if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
        if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
      });
      
      let sentiment: "positive" | "negative" | "neutral" = "neutral";
      let score = 0.5;
      
      if (positiveCount > negativeCount) {
        sentiment = "positive";
        score = 0.5 + (0.5 * (positiveCount / (positiveCount + negativeCount)));
      } else if (negativeCount > positiveCount) {
        sentiment = "negative";
        score = 0.5 - (0.5 * (negativeCount / (positiveCount + negativeCount)));
      }
      
      setSentimentResult({
        sentiment,
        score
      });
    }, 1000);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">IA Avanzada</h1>
        <p className="mt-1 text-sm text-gray-500">
          Personaliza y optimiza tus chatbots con capacidades avanzadas de inteligencia artificial
        </p>
      </div>

      <Tabs defaultValue="train" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 gap-4 w-full md:w-3/4">
          <TabsTrigger value="train" className="flex gap-2 items-center">
            <RiFileTextLine />
            <span>Entrenamiento</span>
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="flex gap-2 items-center">
            <RiEmotionLine />
            <span>Análisis de Sentimientos</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex gap-2 items-center">
            <RiRobotLine />
            <span>Respuestas Automáticas</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex gap-2 items-center">
            <RiImage2Line />
            <span>Análisis de Imágenes</span>
          </TabsTrigger>
        </TabsList>

        {/* Entrenamiento */}
        <TabsContent value="train" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Entrenar tu IA</CardTitle>
                <CardDescription>
                  Sube documentos para entrenar tu IA con conocimientos específicos de tu negocio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <RiUploadLine className="h-10 w-10 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Arrastra archivos PDF, DOCX o TXT aquí, o
                  </p>
                  <Button className="mt-2" onClick={handleFileUpload}>Seleccionar archivos</Button>
                  
                  {isUploading && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Procesando documento...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="model">Modelo de IA</Label>
                  <Select defaultValue="gpt-4">
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Seleccionar modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Recomendado)</SelectItem>
                      <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="ada">Ada (Más rápido)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-gray-500">
                    Modelos más avanzados generan respuestas de mayor calidad pero pueden ser más lentos
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Límite:</span> 50MB por archivo, máximo 5 archivos
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Base de conocimiento</CardTitle>
                <CardDescription>
                  Documentos subidos y procesados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <RiFileTextLine className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium">manual_producto.pdf</p>
                          <p className="text-xs text-gray-500">524 KB - 12 páginas</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Ver</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <RiFileTextLine className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium">faqs_soporte.txt</p>
                          <p className="text-xs text-gray-500">128 KB - 45 preguntas</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Ver</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <RiFileTextLine className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium">politicas_empresa.docx</p>
                          <p className="text-xs text-gray-500">218 KB - 8 páginas</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Ver</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Análisis de Sentimientos */}
        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Análisis de Sentimientos</CardTitle>
              <CardDescription>
                Analiza el sentimiento de un texto para comprender mejor a tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sentiment-text">Texto para analizar</Label>
                <Textarea 
                  id="sentiment-text" 
                  className="mt-1" 
                  rows={5} 
                  placeholder="Introduce el texto que deseas analizar..." 
                  value={sentimentText}
                  onChange={(e) => setSentimentText(e.target.value)}
                />
              </div>
              
              <Button onClick={analyzeSentiment}>Analizar sentimiento</Button>
              
              {sentimentResult && (
                <div className="rounded-lg border border-gray-200 p-4 mt-4">
                  <h3 className="text-md font-medium mb-2">Resultado del análisis</h3>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      sentimentResult.sentiment === "positive" ? "bg-green-100 text-green-600" :
                      sentimentResult.sentiment === "negative" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <RiEmotionLine className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {sentimentResult.sentiment === "positive" ? "Positivo" :
                        sentimentResult.sentiment === "negative" ? "Negativo" :
                        "Neutral"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Puntuación: {Math.round(sentimentResult.score * 100)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Negativo</span>
                      <span>Neutral</span>
                      <span>Positivo</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 relative">
                      <div 
                        className={`absolute top-0 bottom-0 left-0 rounded-full ${
                          sentimentResult.sentiment === "positive" ? "bg-green-500" :
                          sentimentResult.sentiment === "negative" ? "bg-red-500" :
                          "bg-gray-400"
                        }`}
                        style={{ width: `${Math.round(sentimentResult.score * 100)}%`, left: `${sentimentResult.sentiment === "neutral" ? "50%" : "0"}`, transform: sentimentResult.sentiment === "neutral" ? "translateX(-50%)" : "none" }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      {sentimentResult.sentiment === "positive" ? 
                        "El texto presenta un tono principalmente positivo. Considera aprovechar este sentimiento positivo en tu respuesta." :
                        sentimentResult.sentiment === "negative" ?
                        "El texto presenta un tono principalmente negativo. Considera usar un enfoque empático y resolutivo en tu respuesta." :
                        "El texto presenta un tono neutral. Considera mantener un tono profesional y directo en tu respuesta."
                      }
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Análisis en tiempo real</CardTitle>
              <CardDescription>
                Implementa análisis de sentimientos en tu chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Activar análisis en chatbots</Label>
                <Select defaultValue="enabled">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Activado</SelectItem>
                    <SelectItem value="disabled">Desactivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Respuestas automáticas por sentimiento</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <Card>
                    <CardHeader className="py-3 px-4 bg-green-50 rounded-t-lg">
                      <CardTitle className="text-sm flex items-center">
                        <div className="h-6 w-6 bg-green-100 rounded-full text-green-700 flex items-center justify-center mr-2">
                          <span>+</span>
                        </div>
                        Positivo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 text-sm">
                      <p>Respuestas positivas y animadas, aprovechando el buen estado de ánimo del cliente.</p>
                      <Button className="mt-3 w-full" variant="outline" size="sm">Configurar</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3 px-4 bg-gray-50 rounded-t-lg">
                      <CardTitle className="text-sm flex items-center">
                        <div className="h-6 w-6 bg-gray-100 rounded-full text-gray-700 flex items-center justify-center mr-2">
                          <span>=</span>
                        </div>
                        Neutral
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 text-sm">
                      <p>Respuestas neutras y profesionales, centradas en proporcionar información clara.</p>
                      <Button className="mt-3 w-full" variant="outline" size="sm">Configurar</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3 px-4 bg-red-50 rounded-t-lg">
                      <CardTitle className="text-sm flex items-center">
                        <div className="h-6 w-6 bg-red-100 rounded-full text-red-700 flex items-center justify-center mr-2">
                          <span>-</span>
                        </div>
                        Negativo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 text-sm">
                      <p>Respuestas empáticas y orientadas a soluciones, para aliviar la frustración.</p>
                      <Button className="mt-3 w-full" variant="outline" size="sm">Configurar</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Respuestas Automáticas */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Respuestas Automáticas por Industria</CardTitle>
              <CardDescription>
                Genera respuestas optimizadas para diferentes sectores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecciona una industria</Label>
                <Select defaultValue="ecommerce">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar industria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="restaurant">Restaurante</SelectItem>
                    <SelectItem value="healthcare">Salud</SelectItem>
                    <SelectItem value="realestate">Inmobiliaria</SelectItem>
                    <SelectItem value="education">Educación</SelectItem>
                    <SelectItem value="travel">Turismo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Estilo de comunicación</Label>
                <Select defaultValue="friendly">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Amigable y cercano</SelectItem>
                    <SelectItem value="professional">Profesional y formal</SelectItem>
                    <SelectItem value="casual">Casual y relajado</SelectItem>
                    <SelectItem value="enthusiastic">Entusiasta y energético</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="mt-2">Generar respuestas automáticas</Button>
              
              <div className="border rounded-lg p-4 mt-4">
                <h3 className="text-md font-medium mb-3">Respuestas generadas para E-commerce</h3>
                
                <div className="space-y-3">
                  <div className="border-b pb-3">
                    <p className="text-sm font-medium mb-1">Bienvenida</p>
                    <p className="text-sm text-gray-600">¡Hola! 👋 Bienvenido/a a nuestra tienda online. ¿En qué puedo ayudarte hoy? Estoy aquí para asistirte con nuestros productos, realizar un pedido o resolver cualquier duda.</p>
                  </div>
                  
                  <div className="border-b pb-3">
                    <p className="text-sm font-medium mb-1">Información de producto</p>
                    <p className="text-sm text-gray-600">¡Claro! Este producto cuenta con [características]. Está disponible en [variantes]. ¿Te gustaría más información o quizás ver opiniones de otros clientes?</p>
                  </div>
                  
                  <div className="border-b pb-3">
                    <p className="text-sm font-medium mb-1">Proceso de compra</p>
                    <p className="text-sm text-gray-600">Puedo guiarte en todo el proceso de compra. Simplemente indica qué producto te interesa y te ayudaré a añadirlo al carrito. También puedo informarte sobre opciones de envío y métodos de pago disponibles.</p>
                  </div>
                  
                  <div className="border-b pb-3">
                    <p className="text-sm font-medium mb-1">Seguimiento de pedido</p>
                    <p className="text-sm text-gray-600">Para revisar el estado de tu pedido, necesito el número de referencia. Con esa información podré darte detalles actualizados sobre dónde se encuentra tu paquete y cuándo llegará.</p>
                  </div>
                  
                  <div className="border-b pb-3">
                    <p className="text-sm font-medium mb-1">Devoluciones</p>
                    <p className="text-sm text-gray-600">Lamento que el producto no haya cumplido tus expectativas. Nuestro proceso de devolución es muy sencillo. Tienes 30 días para devolver tu compra. ¿Te gustaría que te explique los pasos a seguir?</p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 gap-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button size="sm">Aplicar a chatbot</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análisis de Imágenes */}
        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Procesamiento de Imágenes</CardTitle>
              <CardDescription>
                Tu chatbot puede entender y describir imágenes que envían los clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Estado del procesamiento de imágenes</Label>
                <Select defaultValue="enabled">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Activado</SelectItem>
                    <SelectItem value="disabled">Desactivado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Al activar esta función, tu chatbot podrá detectar y describir las imágenes que envíen los usuarios
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Nivel de detalle</Label>
                <Select defaultValue="detailed">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico (etiquetas generales)</SelectItem>
                    <SelectItem value="detailed">Detallado (descripción completa)</SelectItem>
                    <SelectItem value="advanced">Avanzado (incluye contexto y sugerencias)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-6">
                <h3 className="text-md font-medium mb-3">Ejemplo de procesamiento</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">Imagen enviada por cliente:</p>
                    <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                      <RiImage2Line className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">Análisis y respuesta del chatbot:</p>
                    <div className="bg-gray-50 rounded-lg p-3 h-40 overflow-auto">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Descripción:</span> La imagen muestra un producto de la categoría [tipo] con [características principales]. Aparenta estar [estado/condición].
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Respuesta recomendada:</span> "Veo que me has enviado una imagen de [producto]. Puedo proporcionarte más información sobre este artículo o alternativas similares que tenemos disponibles. ¿Te gustaría conocer precios, disponibilidad o características específicas?"
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button>Probar con una imagen</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}