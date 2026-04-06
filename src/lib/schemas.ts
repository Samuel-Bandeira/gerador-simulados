import { z } from "zod";

export const alternativeSchema = z.object({
  letter: z.enum(["A", "B", "C", "D", "E"]),
  text: z.string().min(1, "Alternativa obrigatória"),
});

export const questionImageSchema = z.object({
  id: z.string(),
  base64: z.string(),
  mimeType: z.string(),
  caption: z.string().optional(),
  position: z.enum(["before", "after"]),
});

export const questionSchema = z.object({
  area: z.enum(
    ["LINGUAGENS", "CIENCIAS_HUMANAS", "CIENCIAS_NATUREZA", "MATEMATICA"],
    { error: "Selecione uma área do conhecimento" }
  ),
  statement: z.string().min(10, "Enunciado deve ter pelo menos 10 caracteres"),
  images: z.array(questionImageSchema),
  alternatives: z
    .array(alternativeSchema)
    .length(5, "A questão deve ter exatamente 5 alternativas"),
  correctAnswer: z.enum(["A", "B", "C", "D", "E"], {
    error: "Selecione a resposta correta",
  }),
});

export type QuestionFormData = z.infer<typeof questionSchema>;
