import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from '@stripe/stripe-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RiLockLine } from "@/lib/icons";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder");

const billingSchema = z.object({
  name: z.string().min(3, { message: "Nombre es requerido" }),
  email: z.string().email({ message: "Email inválido" }),
  address: z.string().min(5, { message: "Dirección es requerida" }),
  city: z.string().min(2, { message: "Ciudad es requerida" }),
  postalCode: z.string().min(5, { message: "Código postal inválido" }),
  country: z.string().min(2, { message: "País es requerido" }),
  saveInfo: z.boolean().optional(),
});

function CheckoutForm({ planId }: { planId: string }) {
  const [location, navigate] = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: plan } = useQuery({
    queryKey: ["/api/subscription/plans", planId],
    initialData: { 
      id: planId,
      name: planId === "starter" ? "Starter" : planId === "professional" ? "Professional" : "Enterprise",
      priceMonthly: planId === "starter" ? 29 : planId === "professional" ? 79 : 199,
      currency: "€",
      billingCycle: "monthly"
    }
  });

  const form = useForm<z.infer<typeof billingSchema>>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      saveInfo: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof billingSchema>) => {
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    try {
      // Create payment intent on the server
      const response = await apiRequest("POST", "/api/create-subscription", {
        planId: plan.id,
        billingInfo: values,
      });

      const { clientSecret } = await response.json();

      // Confirm the payment with Stripe.js
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: values.name,
            email: values.email,
            address: {
              line1: values.address,
              city: values.city,
              postal_code: values.postalCode,
              country: values.country,
            },
          },
        },
      });

      if (error) {
        toast({
          title: "Error de pago",
          description: error.message || "Hubo un problema procesando tu pago.",
          variant: "destructive",
        });
      } else if (paymentIntent.status === "succeeded") {
        toast({
          title: "Pago completado",
          description: "Tu suscripción ha sido activada exitosamente.",
        });
        // Redirect to dashboard or success page
        navigate("/");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre y apellidos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@correo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Calle, número, piso..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad</FormLabel>
                <FormControl>
                  <Input placeholder="Ciudad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Postal</FormLabel>
                <FormControl>
                  <Input placeholder="Código Postal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un país" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ES">España</SelectItem>
                    <SelectItem value="MX">México</SelectItem>
                    <SelectItem value="CO">Colombia</SelectItem>
                    <SelectItem value="AR">Argentina</SelectItem>
                    <SelectItem value="CL">Chile</SelectItem>
                    <SelectItem value="PE">Perú</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <div>
            <FormLabel>Información de Pago</FormLabel>
            <div className="mt-1 rounded-md border border-gray-300 p-4">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="flex items-center">
            <RiLockLine className="mr-2 text-gray-500" />
            <span className="text-sm text-gray-500">Los pagos se procesan de forma segura</span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="saveInfo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Guardar información para futuros pagos</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="rounded-md bg-gray-50 p-4">
          <h3 className="text-lg font-medium">Resumen del pedido</h3>
          <div className="mt-4 flex justify-between">
            <span>Plan {plan.name}</span>
            <span>{plan.currency}{plan.priceMonthly} / mes</span>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
              Procesando...
            </>
          ) : (
            `Pagar ${plan.currency}${plan.priceMonthly} / mes`
          )}
        </Button>
      </form>
    </Form>
  );
}

export function SubscriptionCheckout() {
  const params = useParams<{ planId: string }>();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    if (params.planId) {
      apiRequest("POST", "/api/subscription/create-intent", { planId: params.planId })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch(console.error);
    }
  }, [params.planId]);

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">
            Completa tu información para finalizar la suscripción
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de Facturación</CardTitle>
            <CardDescription>
              Introduce tus datos para completar la compra
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm planId={params.planId} />
              </Elements>
            ) : (
              <div className="flex items-center justify-center py-6">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default SubscriptionCheckout;
