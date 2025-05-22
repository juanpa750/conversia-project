import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RiCustomerService2Line, RiSearchLine, RiFileList3Line } from "@/lib/icons";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: "open" | "closed" | "pending";
  category: string;
  createdAt: string;
  messages: {
    id: string;
    text: string;
    isAdmin: boolean;
    createdAt: string;
    userAvatar?: string;
  }[];
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const ticketSchema = z.object({
  title: z.string().min(5, { message: "El título debe tener al menos 5 caracteres" }),
  category: z.string().min(1, { message: "Selecciona una categoría" }),
  description: z.string().min(20, { message: "La descripción debe tener al menos 20 caracteres" }),
});

const messageSchema = z.object({
  message: z.string().min(1, { message: "El mensaje no puede estar vacío" }),
});

const DUMMY_TICKETS: SupportTicket[] = [
  {
    id: "1",
    title: "Problema con la conexión a WhatsApp",
    description: "No puedo conectar mi cuenta de WhatsApp Business. Aparece un error al intentar vincular el número.",
    status: "open",
    category: "Integración",
    createdAt: "2023-12-10T14:30:00Z",
    messages: [
      {
        id: "1",
        text: "No puedo conectar mi cuenta de WhatsApp Business. Aparece un error al intentar vincular el número. He intentado varias veces pero sigue fallando.",
        isAdmin: false,
        createdAt: "2023-12-10T14:30:00Z",
      },
      {
        id: "2",
        text: "Hola, gracias por contactarnos. ¿Podrías compartir qué mensaje de error estás recibiendo exactamente? También, ¿has verificado que tu cuenta de WhatsApp Business está activa?",
        isAdmin: true,
        createdAt: "2023-12-10T15:45:00Z",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      },
      {
        id: "3",
        text: "El error dice 'No se pudo verificar el número'. Sí, mi cuenta está activa y la uso normalmente en mi teléfono.",
        isAdmin: false,
        createdAt: "2023-12-10T16:10:00Z",
      }
    ]
  },
  {
    id: "2",
    title: "Duda sobre facturación",
    description: "Necesito un cambio en la información fiscal de mi factura del mes pasado.",
    status: "closed",
    category: "Facturación",
    createdAt: "2023-12-05T11:45:00Z",
    messages: [
      {
        id: "1",
        text: "Necesito un cambio en la información fiscal de mi factura del mes pasado. ¿Cómo puedo solicitarlo?",
        isAdmin: false,
        createdAt: "2023-12-05T11:45:00Z",
      },
      {
        id: "2",
        text: "Hola, puedes enviarnos los datos fiscales correctos y generaremos una nueva factura. ¿Qué datos necesitas modificar?",
        isAdmin: true,
        createdAt: "2023-12-05T13:20:00Z",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      },
      {
        id: "3",
        text: "Necesito cambiar el NIF y la dirección fiscal. Los datos correctos son: NIF: B12345678, Dirección: Calle Ejemplo 123, 28001 Madrid.",
        isAdmin: false,
        createdAt: "2023-12-06T09:15:00Z",
      },
      {
        id: "4",
        text: "Perfecto, hemos actualizado los datos y te hemos enviado la nueva factura a tu correo electrónico. ¿Hay algo más en lo que podamos ayudarte?",
        isAdmin: true,
        createdAt: "2023-12-06T10:30:00Z",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      },
      {
        id: "5",
        text: "He recibido la factura, todo correcto. Muchas gracias por la ayuda.",
        isAdmin: false,
        createdAt: "2023-12-06T11:05:00Z",
      }
    ]
  },
  {
    id: "3",
    title: "Error en el creador de chatbots",
    description: "Al intentar guardar un flujo complejo, la aplicación se bloquea y pierdo los cambios.",
    status: "pending",
    category: "Técnico",
    createdAt: "2023-12-08T09:15:00Z",
    messages: [
      {
        id: "1",
        text: "Al intentar guardar un flujo complejo, la aplicación se bloquea y pierdo los cambios. Esto ha ocurrido varias veces y es frustrante perder el trabajo.",
        isAdmin: false,
        createdAt: "2023-12-08T09:15:00Z",
      },
      {
        id: "2",
        text: "Lamentamos los inconvenientes. ¿Podrías decirnos qué navegador estás utilizando y aproximadamente cuántos nodos tiene tu flujo? Esto nos ayudará a reproducir el problema.",
        isAdmin: true,
        createdAt: "2023-12-08T10:40:00Z",
        userAvatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
      },
      {
        id: "3",
        text: "Estoy usando Chrome versión 108 y el flujo tiene aproximadamente 50 nodos con varias condiciones anidadas.",
        isAdmin: false,
        createdAt: "2023-12-08T11:25:00Z",
      },
      {
        id: "4",
        text: "Gracias por la información. Estamos investigando el problema. Como medida temporal, te recomendamos guardar el trabajo con más frecuencia y con flujos menos complejos. Te notificaremos cuando tengamos una solución.",
        isAdmin: true,
        createdAt: "2023-12-08T14:15:00Z",
        userAvatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
      }
    ]
  }
];

const DUMMY_FAQS: FAQ[] = [
  {
    id: "1",
    question: "¿Cómo puedo conectar mi cuenta de WhatsApp Business?",
    answer: "Para conectar tu cuenta de WhatsApp Business, ve a Configuración > Integraciones > WhatsApp. Sigue las instrucciones para escanear el código QR con tu teléfono o introduce el número de teléfono para recibir un código de verificación.",
    category: "Integraciones"
  },
  {
    id: "2",
    question: "¿Cuál es el límite de mensajes en mi plan?",
    answer: "El límite de mensajes depende de tu plan de suscripción. Plan Starter: 1.000 mensajes/mes, Plan Professional: 5.000 mensajes/mes, Plan Enterprise: 25.000 mensajes/mes. Puedes ver tu consumo actual en el Dashboard.",
    category: "Facturación"
  },
  {
    id: "3",
    question: "¿Cómo creo un flujo de conversación con condiciones?",
    answer: "Para crear un flujo con condiciones, añade un nodo de tipo 'Pregunta' o 'Menú' en el editor de flujos. Luego, puedes agregar respuestas condicionadas creando conexiones desde ese nodo a otros elementos basados en las respuestas del usuario.",
    category: "Uso"
  },
  {
    id: "4",
    question: "¿Puedo cambiar mi plan de suscripción?",
    answer: "Sí, puedes cambiar tu plan en cualquier momento. Ve a la sección de Suscripción en tu cuenta y selecciona 'Cambiar Plan'. Si actualizas a un plan superior, se te cobrará la diferencia prorrateada. Si bajas de plan, el cambio se aplicará en el siguiente ciclo de facturación.",
    category: "Facturación"
  },
  {
    id: "5",
    question: "¿Cómo puedo exportar mis contactos y conversaciones?",
    answer: "Para exportar datos, ve a la sección de Clientes o Conversaciones y haz clic en el botón 'Exportar'. Puedes elegir entre formatos CSV o Excel y seleccionar qué campos incluir en la exportación.",
    category: "Uso"
  },
  {
    id: "6",
    question: "¿La plataforma está disponible en varios idiomas?",
    answer: "Sí, actualmente soportamos español, inglés y portugués. Puedes cambiar el idioma de la interfaz en la sección de Ajustes > Preferencias > Idioma.",
    category: "General"
  }
];

const STATUS_BADGES = {
  open: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const STATUS_LABELS = {
  open: "Abierto",
  closed: "Cerrado",
  pending: "Pendiente",
};

export function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Ticket creation form
  const ticketForm = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
    },
  });

  // Message form for ticket replies
  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  // In a real application, we would fetch this data from the API
  const { data: tickets } = useQuery({
    queryKey: ["/api/support/tickets", { search: searchQuery }],
    initialData: DUMMY_TICKETS,
  });

  const { data: faqs } = useQuery({
    queryKey: ["/api/faqs"],
    initialData: DUMMY_FAQS,
  });

  const createTicket = useMutation({
    mutationFn: async (data: z.infer<typeof ticketSchema>) => {
      const res = await apiRequest("POST", "/api/support/tickets", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      ticketForm.reset();
      toast({
        title: "Ticket creado",
        description: "Tu solicitud ha sido enviada con éxito",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al crear el ticket",
        variant: "destructive",
      });
    },
  });

  const replyToTicket = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const res = await apiRequest("POST", `/api/support/tickets/${ticketId}/reply`, { message });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      messageForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al enviar el mensaje",
        variant: "destructive",
      });
    },
  });

  const filteredTickets = tickets.filter((ticket) => {
    if (
      searchQuery &&
      !ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredFaqs = faqs.filter((faq) => {
    if (
      searchQuery &&
      !faq.question.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const activeTicket = selectedTicket
    ? tickets.find((ticket) => ticket.id === selectedTicket)
    : null;

  const onSubmitTicket = (data: z.infer<typeof ticketSchema>) => {
    createTicket.mutate(data);
  };

  const onSubmitMessage = (data: z.infer<typeof messageSchema>) => {
    if (selectedTicket) {
      replyToTicket.mutate({
        ticketId: selectedTicket,
        message: data.message,
      });
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Soporte Técnico</h1>
        <p className="mt-1 text-sm text-gray-500">
          Obtén ayuda para resolver tus dudas y problemas
        </p>
      </div>

      <div className="mb-6">
        <div className="relative w-full">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <RiSearchLine />
          </span>
          <Input
            type="text"
            placeholder="Buscar en soporte técnico..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Mis Tickets</TabsTrigger>
          <TabsTrigger value="faqs">Preguntas Frecuentes</TabsTrigger>
          <TabsTrigger value="new-ticket">Nuevo Ticket</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Tickets List */}
            <div className="md:col-span-1">
              <div className="space-y-3">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50 ${
                        selectedTicket === ticket.id ? "border-primary bg-primary-50" : "border-gray-200"
                      }`}
                      onClick={() => setSelectedTicket(ticket.id)}
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={STATUS_BADGES[ticket.status]}
                        >
                          {STATUS_LABELS[ticket.status]}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {ticket.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {ticket.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                      <RiFileList3Line className="mb-2 h-12 w-12 text-gray-400" />
                      <h3 className="text-lg font-medium">No hay tickets</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchQuery
                          ? `No hay resultados para "${searchQuery}"`
                          : "Aún no has creado ningún ticket de soporte."}
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => document.querySelector('[data-value="new-ticket"]')?.dispatchEvent(
                          new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                          })
                        )}
                      >
                        Crear un ticket
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Ticket Detail */}
            <div className="md:col-span-2">
              {activeTicket ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between">
                      <Badge
                        variant="outline"
                        className={STATUS_BADGES[activeTicket.status]}
                      >
                        {STATUS_LABELS[activeTicket.status]}
                      </Badge>
                      <Badge variant="outline">{activeTicket.category}</Badge>
                    </div>
                    <CardTitle>{activeTicket.title}</CardTitle>
                    <CardDescription>
                      Creado el {new Date(activeTicket.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeTicket.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.isAdmin ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              message.isAdmin
                                ? "bg-gray-100 text-gray-800"
                                : "bg-primary-100 text-primary-800"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {message.isAdmin && (
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={message.userAvatar}
                                    alt="Support Agent"
                                  />
                                  <AvatarFallback>SA</AvatarFallback>
                                </Avatar>
                              )}
                              <span className="text-xs font-medium">
                                {message.isAdmin ? "Soporte" : "Tú"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="mt-1 text-sm">{message.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {activeTicket.status !== "closed" && (
                      <div className="mt-6">
                        <Form {...messageForm}>
                          <form
                            onSubmit={messageForm.handleSubmit(onSubmitMessage)}
                            className="space-y-4"
                          >
                            <FormField
                              control={messageForm.control}
                              name="message"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tu respuesta</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Escribe tu mensaje aquí..."
                                      rows={3}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="submit"
                              disabled={replyToTicket.isPending}
                            >
                              {replyToTicket.isPending ? "Enviando..." : "Enviar respuesta"}
                            </Button>
                          </form>
                        </Form>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-primary-100 p-6">
                      <RiCustomerService2Line className="h-12 w-12 text-primary-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium">Soporte Técnico</h3>
                    <p className="mt-2 max-w-md text-sm text-gray-500">
                      Selecciona un ticket de la lista para ver los detalles y responder,
                      o crea un nuevo ticket si necesitas ayuda con algo.
                    </p>
                    <Button
                      className="mt-6"
                      onClick={() => document.querySelector('[data-value="new-ticket"]')?.dispatchEvent(
                        new MouseEvent('click', {
                          bubbles: true,
                          cancelable: true,
                          view: window
                        })
                      )}
                    >
                      Nuevo Ticket
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle>Preguntas Frecuentes</CardTitle>
              <CardDescription>
                Encuentra respuestas rápidas a las preguntas más comunes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFaqs.length > 0 ? (
                <div className="space-y-6">
                  {filteredFaqs.map((faq) => (
                    <div key={faq.id} className="rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {faq.question}
                        </h3>
                        <Badge variant="outline">{faq.category}</Badge>
                      </div>
                      <p className="mt-3 text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <RiSearchLine className="mb-2 h-12 w-12 text-gray-400" />
                  <h3 className="text-lg font-medium">No se encontraron resultados</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No hay FAQs que coincidan con tu búsqueda "{searchQuery}".
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-ticket">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Ticket</CardTitle>
              <CardDescription>
                Describe tu problema o consulta y te responderemos a la brevedad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...ticketForm}>
                <form
                  onSubmit={ticketForm.handleSubmit(onSubmitTicket)}
                  className="space-y-6"
                >
                  <FormField
                    control={ticketForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Problema con la conexión a WhatsApp"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ticketForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Técnico">Técnico</SelectItem>
                            <SelectItem value="Facturación">Facturación</SelectItem>
                            <SelectItem value="Integración">Integración</SelectItem>
                            <SelectItem value="Cuenta">Cuenta</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ticketForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe tu problema o consulta en detalle..."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={createTicket.isPending}
                  >
                    {createTicket.isPending ? "Enviando..." : "Enviar Ticket"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

export default Support;
