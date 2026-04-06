import { SimuladoDetail } from "@/components/simulados/SimuladoDetail";
import { use } from "react";

export default function SimuladoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SimuladoDetail id={id} />;
}
