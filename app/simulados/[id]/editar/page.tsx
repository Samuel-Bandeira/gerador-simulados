import { SimuladoBuilder } from "@/components/simulados/SimuladoBuilder";
import { use } from "react";

export default function EditarSimuladoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Editar Simulado</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Altere as questões, a ordem ou o título do simulado.
      </p>
      <SimuladoBuilder simuladoId={id} />
    </div>
  );
}
