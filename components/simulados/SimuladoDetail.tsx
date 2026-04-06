"use client";

import { useRef, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/src/store";
import { ENEM_AREAS } from "@/src/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pencil, Download, Loader2 } from "lucide-react";
import { SimuladoTemplate } from "@/components/pdf/SimuladoTemplate";
import { generateSimuladoPDF, buildFilename } from "@/src/lib/pdf-generator";

type Props = { id: string };

export function SimuladoDetail({ id }: Props) {
  const simulado = useAppStore((s) => s.getSimulado(id));
  const questions = useAppStore((s) => s.questions);
  const [generating, setGenerating] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);

  if (!simulado) return notFound();

  const totalQuestions = simulado.cadernos.reduce(
    (sum, c) => sum + c.questions.length,
    0
  );

  async function handleGeneratePDF() {
    if (!templateRef.current || !simulado) return;
    setGenerating(true);
    try {
      await generateSimuladoPDF(
        templateRef.current,
        buildFilename(simulado.title)
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/simulados"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </Link>
          <h1 className="text-2xl font-bold">{simulado.title}</h1>
          {simulado.edition && (
            <p className="text-muted-foreground text-sm mt-0.5">{simulado.edition}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Criado em {new Date(simulado.createdAt).toLocaleDateString("pt-BR")} · {totalQuestions} questões
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/simulados/${id}/editar`}>
            <Button variant="outline" size="sm">
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Editar
            </Button>
          </Link>
          <Button size="sm" onClick={handleGeneratePDF} disabled={generating}>
            {generating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 mr-1.5" />
            )}
            {generating ? "Gerando..." : "Gerar PDF"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Prévia por caderno */}
      {simulado.cadernos.map((caderno) => {
        const areaLabel = ENEM_AREAS.find((a) => a.value === caderno.area)?.label;
        return (
          <Card key={caderno.area}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{areaLabel}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {caderno.questions
                .sort((a, b) => a.order - b.order)
                .map((sq) => {
                  const q = questions.find((q) => q.id === sq.questionId);
                  return (
                    <div key={sq.questionId} className="flex items-start gap-3 text-sm">
                      <span className="font-bold tabular-nums w-6 shrink-0 text-muted-foreground">
                        {sq.order}.
                      </span>
                      <p className="line-clamp-2 text-muted-foreground">
                        {q?.statement ?? <span className="italic">Questão removida</span>}
                      </p>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        );
      })}

      {/* Template oculto para o html2pdf capturar */}
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          visibility: "hidden",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <SimuladoTemplate ref={templateRef} simulado={simulado} questions={questions} />
      </div>
    </div>
  );
}
