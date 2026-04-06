import { SimuladoBuilder } from "@/components/simulados/SimuladoBuilder";

export default function NovoSimuladoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Novo Simulado</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Selecione as questões por área e defina a ordem de exibição.
      </p>
      <SimuladoBuilder />
    </div>
  );
}
