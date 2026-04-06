"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Question } from "@/src/types";

type Props = {
  question: Question;
  order: number;
  onRemove: () => void;
};

export function SortableQuestionItem({ question, order, onRemove }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 bg-background border rounded-md px-3 py-2 group"
    >
      <button
        type="button"
        className="text-muted-foreground cursor-grab active:cursor-grabbing mt-0.5 shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <span className="font-bold text-sm w-6 shrink-0 mt-0.5 tabular-nums text-muted-foreground">
        {order}.
      </span>

      <p className="flex-1 text-sm line-clamp-2 min-w-0">{question.statement}</p>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
