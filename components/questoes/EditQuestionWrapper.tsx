"use client";

import { useAppStore } from "@/src/store";
import { QuestionForm } from "./QuestionForm";
import { notFound } from "next/navigation";

type Props = { id: string };

export function EditQuestionWrapper({ id }: Props) {
  const question = useAppStore((s) => s.getQuestion(id));

  if (!question) return notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Editar Questão</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Altere os campos e salve para atualizar a questão.
      </p>
      <QuestionForm question={question} />
    </div>
  );
}
