import { EditQuestionWrapper } from "@/components/questoes/EditQuestionWrapper";
import { use } from "react";

export default function EditarQuestaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EditQuestionWrapper id={id} />;
}
