"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "@/src/store";
import { ENEM_AREAS, type ENEMArea } from "@/src/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Pencil, Trash2, Copy, Plus } from "lucide-react";
import Link from "next/link";

const AREA_COLORS: Record<ENEMArea, string> = {
  LINGUAGENS: "bg-blue-100 text-blue-800",
  CIENCIAS_HUMANAS: "bg-amber-100 text-amber-800",
  CIENCIAS_NATUREZA: "bg-green-100 text-green-800",
  MATEMATICA: "bg-purple-100 text-purple-800",
};

const AREA_SHORT: Record<ENEMArea, string> = {
  LINGUAGENS: "Linguagens",
  CIENCIAS_HUMANAS: "C. Humanas",
  CIENCIAS_NATUREZA: "C. Natureza",
  MATEMATICA: "Matemática",
};

export function QuestionList() {
  const router = useRouter();
  const questions = useAppStore((s) => s.questions);
  const addQuestion = useAppStore((s) => s.addQuestion);
  const deleteQuestion = useAppStore((s) => s.deleteQuestion);

  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState<ENEMArea | "TODAS">("TODAS");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = questions
    .filter((q) => areaFilter === "TODAS" || q.area === areaFilter)
    .filter(
      (q) =>
        !search ||
        q.statement.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function handleDuplicate(id: string) {
    const original = questions.find((q) => q.id === id);
    if (!original) return;
    addQuestion({
      ...original,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    });
  }

  function handleDeleteConfirm() {
    if (deleteId) {
      deleteQuestion(deleteId);
      setDeleteId(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Banco de Questões</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {questions.length} questão{questions.length !== 1 ? "ões" : ""} cadastrada{questions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/questoes/nova">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova questão
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Buscar no enunciado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={areaFilter}
          onValueChange={(v) => setAreaFilter(v as ENEMArea | "TODAS")}
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas as áreas</SelectItem>
            {ENEM_AREAS.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {AREA_SHORT[a.value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Nenhuma questão encontrada</p>
          <p className="text-sm mt-1">
            {questions.length === 0
              ? "Comece cadastrando a primeira questão."
              : "Tente ajustar os filtros."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-36">Área</TableHead>
                <TableHead>Enunciado</TableHead>
                <TableHead className="w-32">Cadastrada em</TableHead>
                <TableHead className="w-28 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((q, idx) => (
                <TableRow key={q.id}>
                  <TableCell className="text-muted-foreground text-xs">
                    {filtered.length - idx}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${AREA_COLORS[q.area]}`}
                    >
                      {AREA_SHORT[q.area]}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm">{q.statement}</p>
                    {q.images.length > 0 && (
                      <Badge variant="outline" className="text-xs mt-0.5">
                        {q.images.length} imagem{q.images.length > 1 ? "ns" : ""}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(q.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Editar"
                        onClick={() => router.push(`/questoes/${q.id}`)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Duplicar"
                        onClick={() => handleDuplicate(q.id)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Excluir"
                        onClick={() => setDeleteId(q.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir questão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A questão será removida
              permanentemente do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
