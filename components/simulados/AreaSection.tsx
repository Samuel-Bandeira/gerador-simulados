"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SortableQuestionItem } from "./SortableQuestionItem";
import type { ENEMArea, Question } from "@/src/types";
import { ENEM_AREAS } from "@/src/types";

type Props = {
  area: ENEMArea;
  selectedIds: string[];
  allQuestions: Question[];
  startOrder: number;
  onChange: (ids: string[]) => void;
};

export function AreaSection({
  area,
  selectedIds,
  allQuestions,
  startOrder,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const areaLabel = ENEM_AREAS.find((a) => a.value === area)!.label;
  const areaQuestions = allQuestions.filter((q) => q.area === area);
  const selectedQuestions = selectedIds
    .map((id) => areaQuestions.find((q) => q.id === id))
    .filter(Boolean) as Question[];
  const unselectedQuestions = areaQuestions.filter(
    (q) => !selectedIds.includes(q.id)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selectedIds.indexOf(active.id as string);
    const newIndex = selectedIds.indexOf(over.id as string);
    onChange(arrayMove(selectedIds, oldIndex, newIndex));
  }

  function addQuestion(id: string) {
    onChange([...selectedIds, id]);
  }

  function removeQuestion(id: string) {
    onChange(selectedIds.filter((qid) => qid !== id));
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="font-medium text-sm">{areaLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Badge variant="secondary">{selectedIds.length} questão{selectedIds.length !== 1 ? "ões" : ""}</Badge>
          )}
          {areaQuestions.length === 0 && (
            <span className="text-xs text-muted-foreground">Sem questões no banco</span>
          )}
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="p-4 space-y-4">
          {/* Questões selecionadas + drag-and-drop */}
          {selectedQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
              Nenhuma questão adicionada nesta área
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {selectedQuestions.map((q, idx) => (
                    <SortableQuestionItem
                      key={q.id}
                      question={q}
                      order={startOrder + idx}
                      onRemove={() => removeQuestion(q.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Adicionar questões */}
          {unselectedQuestions.length > 0 && (
            <>
              <Separator />
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectorOpen((v) => !v)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Adicionar questões ({unselectedQuestions.length} disponíveis)
                </Button>

                {selectorOpen && (
                  <div className="mt-3 space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {unselectedQuestions.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => addQuestion(q.id)}
                        className="w-full flex items-start gap-2 text-left px-3 py-2 rounded-md border text-sm hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                        <span className="line-clamp-2">{q.statement}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {areaQuestions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Cadastre questões de {areaLabel} no banco de questões para adicioná-las aqui.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
