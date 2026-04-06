"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/src/store";
import { ENEM_AREAS } from "@/src/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, FileText, Pencil, Trash2, Download } from "lucide-react";

export function SimuladoList() {
  const simulados = useAppStore((s) => s.simulados);
  const deleteSimulado = useAppStore((s) => s.deleteSimulado);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sorted = [...simulados].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  function totalQuestions(id: string) {
    const s = simulados.find((s) => s.id === id);
    if (!s) return 0;
    return s.cadernos.reduce((sum, c) => sum + c.questions.length, 0);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Simulados</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {simulados.length} simulado{simulados.length !== 1 ? "s" : ""} criado{simulados.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/simulados/novo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo simulado
          </Button>
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Nenhum simulado criado</p>
          <p className="text-sm mt-1">Crie o primeiro simulado usando as questões do banco.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-w-3xl">
          {sorted.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{s.title}</CardTitle>
                    {s.edition && (
                      <p className="text-xs text-muted-foreground mt-0.5">{s.edition}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Link href={`/simulados/${s.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Download PDF">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/simulados/${s.id}/editar`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Excluir"
                      onClick={() => setDeleteId(s.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{totalQuestions(s.id)} questões</span>
                  <span>
                    {s.cadernos
                      .map((c) => ENEM_AREAS.find((a) => a.value === c.area)?.label.split(" ")[0])
                      .join(", ")}
                  </span>
                  <span className="ml-auto">
                    Criado em {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir simulado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O simulado será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { deleteSimulado(deleteId!); setDeleteId(null); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
