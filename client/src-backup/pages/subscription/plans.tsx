import { useState } from "react";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RiCheckLine } from "@/lib/icons";

interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string | number;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: PlanFeature[];
  highlight?: boolean;
  mostPopular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Ideal para emprendedores y pequeñas empresas",
    priceMonthly: 29,
    priceYearly: 290,
    currency: "€",
    features: [
      { name: "Chatbots", included: true, limit: 2 },
      { name: "Mensajes por mes", included: true, limit: 1000 },
      { name: "Plantillas básicas", included: true },
      { name: "Integración WhatsApp", included: true },
      { name: "Estadísticas básicas", included: true },
      { name: "CRM Básico", included: true },
      { name: "Soporte por email", included: true },
      { name: "API Access", included: false },
      { name: "Personalización avanzada", included: false },
      { name: "Múltiples usuarios", included: false },
    ]
  },
  {
    id: "professional",
    name: "Professional",
    description: "Perfecto para negocios en crecimiento",
    priceMonthly: 79,
    priceYearly: 790,
    currency: "€",
    features: [
      { name: "Chatbots", included: true, limit: 10 },
      { name: "Mensajes por mes", included: true, limit: 5000 },
      { name: "Todas las plantillas", included: true },
      { name: "Integración WhatsApp", included: true },
      { name: "Estadísticas avanzadas", included: true },
      { name: "CRM Completo", included: true },
      { name: "Soporte prioritario", included: true },
      { name: "API Access", included: true },
      { name: "Personalización avanzada", included: true },
      { name: "Múltiples usuarios", included: false, limit: 3 },
    ],
    mostPopular: true,
    highlight: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Para empresas con altas necesidades",
    priceMonthly: 199,
    priceYearly: 1990,
    currency: "€",
    features: [
      { name: "Chatbots", included: true, limit: "Ilimitados" },
      { name: "Mensajes por mes", included: true, limit: 25000 },
      { name: "Todas las plantillas", included: true },
      { name: "Integración WhatsApp", included: true },
      { name: "Estadísticas avanzadas", included: true },
      { name: "CRM Completo", included: true },
      { name: "Soporte dedicado 24/7", included: true },
      { name: "API Access", included: true },
      { name: "Personalización avanzada", included: true },
      { name: "Múltiples usuarios", included: true, limit: 10 },
    ]
  }
];

export function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  
  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly");
  };

  const discount = 20; // 20% discount for yearly billing

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Planes de Suscripción</h1>
        <p className="mt-2 text-lg text-gray-600">
          Elige el plan perfecto para tu negocio
        </p>
      </div>

      <div className="mb-10 flex justify-center">
        <div className="inline-flex items-center rounded-lg bg-gray-100 p-1">
          <div className="flex items-center space-x-4 px-3 py-2">
            <div className="flex items-center space-x-3">
              <Switch
                id="billing-toggle"
                checked={billingCycle === "yearly"}
                onCheckedChange={toggleBillingCycle}
              />
              <Label htmlFor="billing-toggle" className="cursor-pointer">
                Facturación Anual
              </Label>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Ahorra {discount}%
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative overflow-hidden ${
              plan.highlight ? "border-primary shadow-lg" : ""
            }`}
          >
            {plan.mostPopular && (
              <div className="absolute right-0 top-0">
                <Badge className="rounded-bl-lg rounded-tr-lg rounded-br-none rounded-tl-none bg-primary text-white">
                  Más Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">
                    {plan.currency}
                    {billingCycle === "monthly" 
                      ? plan.priceMonthly 
                      : plan.priceYearly
                    }
                  </span>
                  <span className="ml-2 text-gray-500">
                    / {billingCycle === "monthly" ? "mes" : "año"}
                  </span>
                </div>
                {billingCycle === "yearly" && (
                  <p className="mt-1 text-sm text-green-600">
                    Ahorras {plan.currency}
                    {plan.priceMonthly * 12 - plan.priceYearly} al año
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`mr-3 rounded-full p-1 ${
                      feature.included ? "text-green-500" : "text-gray-300"
                    }`}>
                      <RiCheckLine size={18} />
                    </div>
                    <div>
                      <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                        {feature.name}
                      </span>
                      {feature.limit && (
                        <span className="ml-1 text-gray-500">
                          ({feature.limit})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant={plan.highlight ? "default" : "outline"} 
                className="w-full"
                asChild
              >
                <Link href={`/subscription/checkout/${plan.id}`}>
                  Seleccionar Plan
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-lg bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-medium">¿Necesitas un plan personalizado?</h3>
        <p className="mb-4 text-gray-600">
          Si tienes necesidades específicas o requieres características adicionales, podemos crear un plan a la medida para tu empresa.
        </p>
        <Button variant="outline">Contactar Ventas</Button>
      </div>
    </>
  );
}

export default SubscriptionPlans;
