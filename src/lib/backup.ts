import type { Question, Simulado } from "@/src/types";

export type BackupData = {
  version: 1;
  exportedAt: string;
  questions: Question[];
  simulados: Simulado[];
};

export function exportBackup(questions: Question[], simulados: Simulado[]): void {
  const data: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    questions,
    simulados,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup-enem-${date}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

export function parseBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        if (!raw.version || !Array.isArray(raw.questions) || !Array.isArray(raw.simulados)) {
          throw new Error("Arquivo de backup inválido ou corrompido.");
        }
        resolve(raw as BackupData);
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Erro ao ler o arquivo."));
      }
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsText(file);
  });
}
