import { QuestionForm } from "@/components/questoes/QuestionForm";

export default function NovaQuestaoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Nova Questão</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Preencha os campos abaixo para cadastrar uma nova questão.
      </p>
      <QuestionForm />
    </div>
  );
}
