"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "@/src/store";
import { questionSchema, type QuestionFormData } from "@/src/lib/schemas";
import { ENEM_AREAS, type Question } from "@/src/types";
import { ImageUploader } from "./ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const LETTERS = ["A", "B", "C", "D", "E"] as const;

type Props = {
  question?: Question;
};

export function QuestionForm({ question }: Props) {
  const router = useRouter();
  const addQuestion = useAppStore((s) => s.addQuestion);
  const updateQuestion = useAppStore((s) => s.updateQuestion);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: question
      ? {
          area: question.area,
          statement: question.statement,
          images: question.images,
          alternatives: question.alternatives,
          correctAnswer: question.correctAnswer,
        }
      : {
          area: undefined,
          statement: "",
          images: [],
          alternatives: LETTERS.map((letter) => ({ letter, text: "" })),
          correctAnswer: undefined,
        },
  });

  function onSubmit(data: QuestionFormData) {
    if (question) {
      updateQuestion(question.id, data);
    } else {
      const newQuestion: Question = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        ...data,
      };
      addQuestion(newQuestion);
    }
    router.push("/questoes");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Área */}
      <div className="space-y-1.5">
        <Label htmlFor="area">Área do conhecimento *</Label>
        <Controller
          name="area"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="area" className={errors.area ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione a área" />
              </SelectTrigger>
              <SelectContent>
                {ENEM_AREAS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.area && (
          <p className="text-xs text-destructive">{errors.area.message}</p>
        )}
      </div>

      {/* Enunciado */}
      <div className="space-y-1.5">
        <Label htmlFor="statement">Enunciado *</Label>
        <Textarea
          id="statement"
          rows={5}
          placeholder="Digite o enunciado da questão..."
          className={errors.statement ? "border-destructive" : ""}
          {...register("statement")}
        />
        {errors.statement && (
          <p className="text-xs text-destructive">{errors.statement.message}</p>
        )}
      </div>

      {/* Imagens */}
      <div className="space-y-1.5">
        <Label>Imagens (opcional)</Label>
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUploader images={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <Separator />

      {/* Alternativas */}
      <div className="space-y-3">
        <Label>Alternativas *</Label>
        {LETTERS.map((letter, i) => (
          <div key={letter} className="flex items-start gap-3">
            <span className="w-6 font-bold text-sm mt-2 shrink-0">{letter}</span>
            <div className="flex-1">
              <Input
                placeholder={`Texto da alternativa ${letter}`}
                className={
                  errors.alternatives?.[i]?.text ? "border-destructive" : ""
                }
                {...register(`alternatives.${i}.text`)}
              />
              {errors.alternatives?.[i]?.text && (
                <p className="text-xs text-destructive mt-0.5">
                  {errors.alternatives[i]?.text?.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resposta correta */}
      <div className="space-y-1.5">
        <Label>Resposta correta *</Label>
        <Controller
          name="correctAnswer"
          control={control}
          render={({ field }) => (
            <div className="flex gap-2">
              {LETTERS.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => field.onChange(letter)}
                  className={`w-10 h-10 rounded-full border-2 font-bold text-sm transition-colors ${
                    field.value === letter
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary/60"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}
        />
        {errors.correctAnswer && (
          <p className="text-xs text-destructive">{errors.correctAnswer.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {question ? "Salvar alterações" : "Cadastrar questão"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/questoes")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
