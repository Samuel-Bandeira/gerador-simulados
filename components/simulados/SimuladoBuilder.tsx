"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "@/src/store";
import { ENEM_AREAS, type ENEMArea, type Simulado } from "@/src/types";
import { AreaSection } from "./AreaSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";

type SelectedByArea = Record<ENEMArea, string[]>;

const EMPTY_SELECTION: SelectedByArea = {
  LINGUAGENS: [],
  CIENCIAS_HUMANAS: [],
  CIENCIAS_NATUREZA: [],
  MATEMATICA: [],
};

type Props = {
  /** Se fornecido, estamos editando um simulado existente */
  simuladoId?: string;
};

export function SimuladoBuilder({ simuladoId }: Props) {
  const router = useRouter();
  const questions = useAppStore((s) => s.questions);
  const addSimulado = useAppStore((s) => s.addSimulado);
  const updateSimulado = useAppStore((s) => s.updateSimulado);
  const getSimulado = useAppStore((s) => s.getSimulado);

  const existing = simuladoId ? getSimulado(simuladoId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [edition, setEdition] = useState(existing?.edition ?? "");
  const [titleError, setTitleError] = useState("");

  const [selected, setSelected] = useState<SelectedByArea>(() => {
    if (!existing) return { ...EMPTY_SELECTION };
    const result: SelectedByArea = { ...EMPTY_SELECTION };
    for (const caderno of existing.cadernos) {
      result[caderno.area] = caderno.questions
        .sort((a, b) => a.order - b.order)
        .map((q) => q.questionId);
    }
    return result;
  });

  const totalSelected = Object.values(selected).reduce(
    (sum, ids) => sum + ids.length,
    0
  );

  /** Calcula o número inicial de cada área na numeração contínua */
  function getStartOrder(area: ENEMArea): number {
    let count = 1;
    for (const a of ENEM_AREAS) {
      if (a.value === area) break;
      count += selected[a.value].length;
    }
    return count;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError("Título obrigatório");
      return;
    }
    if (totalSelected === 0) return;

    const cadernos = ENEM_AREAS.filter(
      (a) => selected[a.value].length > 0
    ).map((a) => ({
      area: a.value,
      questions: selected[a.value].map((qid, idx) => ({
        questionId: qid,
        order: getStartOrder(a.value) + idx,
      })),
    }));

    if (existing) {
      updateSimulado(existing.id, { title: title.trim(), edition: edition.trim() || undefined, cadernos });
      router.push(`/simulados/${existing.id}`);
    } else {
      const simulado: Simulado = {
        id: uuidv4(),
        title: title.trim(),
        edition: edition.trim() || undefined,
        cadernos,
        createdAt: new Date().toISOString(),
      };
      addSimulado(simulado);
      router.push(`/simulados/${simulado.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Cabeçalho */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Título do simulado *</Label>
          <Input
            id="title"
            placeholder="Ex: Simulado Maio 2025 — Turma A"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError("");
            }}
            className={titleError ? "border-destructive" : ""}
          />
          {titleError && (
            <p className="text-xs text-destructive">{titleError}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edition">Identificação / edição (opcional)</Label>
          <Input
            id="edition"
            placeholder="Ex: 1º Simulado 2025"
            value={edition}
            onChange={(e) => setEdition(e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Contador total */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Seleção de questões</h2>
        <span className="text-sm text-muted-foreground">
          {totalSelected} questão{totalSelected !== 1 ? "ões" : ""} selecionada{totalSelected !== 1 ? "s" : ""}
        </span>
      </div>

      {questions.length === 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            Nenhuma questão no banco. Cadastre questões antes de montar um simulado.
          </p>
        </div>
      )}

      {/* Seções por área */}
      <div className="space-y-3">
        {ENEM_AREAS.map((area) => (
          <AreaSection
            key={area.value}
            area={area.value}
            selectedIds={selected[area.value]}
            allQuestions={questions}
            startOrder={getStartOrder(area.value)}
            onChange={(ids) =>
              setSelected((prev) => ({ ...prev, [area.value]: ids }))
            }
          />
        ))}
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-2 sticky bottom-0 bg-background pb-4">
        <Button type="submit" disabled={totalSelected === 0 || !title.trim()}>
          {existing ? "Salvar alterações" : "Criar simulado"}
          {totalSelected > 0 && ` (${totalSelected} questões)`}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/simulados")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
