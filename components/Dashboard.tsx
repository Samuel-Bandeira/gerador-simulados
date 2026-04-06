"use client";

import { useAppStore } from "@/src/store";
import { ENEM_AREAS } from "@/src/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, AlertTriangle, HardDrive } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getStorageUsage } from "@/src/lib/storage-monitor";
import { useEffect, useState } from "react";

export function Dashboard() {
  const questions = useAppStore((s) => s.questions);
  const simulados = useAppStore((s) => s.simulados);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    setIsWarning(getStorageUsage().isWarning);
  }, [questions, simulados]);

  const questionsByArea = ENEM_AREAS.map((area) => ({
    ...area,
    count: questions.filter((q) => q.area === area.value).length,
  }));

  const recentSimulados = [...simulados]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const hasData = questions.length > 0 || simulados.length > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão geral do banco de questões e simulados
        </p>
      </div>

      {/* Alertas */}
      {!hasData && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Nenhum dado encontrado.</p>
            <p>
              Comece{" "}
              <Link href="/questoes/nova" className="underline font-medium">
                cadastrando questões
              </Link>{" "}
              ou importe um backup em{" "}
              <Link href="/configuracoes" className="underline font-medium">
                Configurações
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      {hasData && isWarning && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Armazenamento acima de 80%.</p>
            <p>
              Exporte um backup em{" "}
              <Link href="/configuracoes" className="underline font-medium">
                Configurações
              </Link>{" "}
              antes de adicionar mais conteúdo.
            </p>
          </div>
        </div>
      )}

      {hasData && !isWarning && (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50 text-blue-800">
          <HardDrive className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs">
            Seus dados ficam salvos apenas neste navegador.{" "}
            <Link href="/configuracoes" className="underline font-medium">
              Exporte um backup regularmente
            </Link>{" "}
            para não perder informações.
          </p>
        </div>
      )}

      {/* Contadores */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Questões
            </CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{questions.length}</div>
            <Link href="/questoes/nova">
              <Button variant="link" className="px-0 text-sm mt-1">
                + Cadastrar questão
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Simulados
            </CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{simulados.length}</div>
            <Link href="/simulados/novo">
              <Button variant="link" className="px-0 text-sm mt-1">
                + Criar simulado
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Questões por Área</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {questionsByArea.map((area) => (
              <div key={area.value} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {area.label}
                </span>
                <span className="text-sm font-semibold tabular-nums">{area.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Simulados Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSimulados.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum simulado criado ainda.</p>
            ) : (
              recentSimulados.map((s) => (
                <Link key={s.id} href={`/simulados/${s.id}`} className="block group">
                  <p className="text-sm font-medium group-hover:underline">{s.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(s.createdAt).toLocaleDateString("pt-BR")} ·{" "}
                    {s.cadernos.reduce((sum, c) => sum + c.questions.length, 0)} questões
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
