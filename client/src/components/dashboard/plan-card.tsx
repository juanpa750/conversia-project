import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiCheckLine } from "@/lib/icons";
import { Button } from "@/components/ui/button";

interface PlanFeatureProps {
  children: React.ReactNode;
}

function PlanFeature({ children }: PlanFeatureProps) {
  return (
    <div className="flex items-center">
      <RiCheckLine className="mr-2" />
      <span className="text-sm">{children}</span>
    </div>
  );
}

export function PlanCard() {
  return (
    <Card className="bg-gradient-to-r from-primary to-indigo-600 text-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Plan Premium</CardTitle>
          <span className="rounded-md bg-white bg-opacity-30 px-2 py-1 text-xs font-medium">
            Activo
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-white text-opacity-80">
          Estás utilizando 80% de tu plan. Considera actualizar para obtener más beneficios.
        </p>
        
        <div className="mb-6 space-y-2">
          <PlanFeature>12 de 15 chatbots</PlanFeature>
          <PlanFeature>2,867 de 5,000 mensajes</PlanFeature>
          <PlanFeature>Soporte prioritario</PlanFeature>
        </div>
        
        <Button 
          variant="secondary" 
          className="w-full bg-white text-primary hover:bg-opacity-90"
          asChild
        >
          <Link href="/subscription/plans">Actualizar Plan</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default PlanCard;
