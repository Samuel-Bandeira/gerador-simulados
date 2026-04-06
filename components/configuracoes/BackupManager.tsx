"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/src/store";
import { exportBackup, parseBackupFile, type BackupData } from "@/src/lib/backup";
import { getStorageUsage, formatBytes } from "@/src/lib/storage-monitor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Download, Upload, AlertTriangle, CheckCircle2, Info } from "lucide-react";

type ImportMode = "replace" | "merge";

export function BackupManager() {
  const questions = useAppStore((s) => s.questions);
  const simulados = useAppStore((s) => s.simulados);
  const importData = useAppStore((s) => s.importData);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingBackup, setPendingBackup] = useState<BackupData | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const usage = getStorageUsage();

  function handleExport() {
    exportBackup(questions, simulados);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportSuccess(null);
    try {
      const data = await parseBackupFile(file);
      setPendingBackup(data);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      // Reset input so same file can be re-selected
      e.target.value = "";
    }
  }

  function handleConfirmImport() {
    if (!pendingBackup) return;
    importData(pendingBackup, importMode === "merge");
    setImportSuccess(
      importMode === "merge"
        ? `Mesclado com sucesso: ${pendingBackup.questions.length} questões e ${pendingBackup.simulados.length} simulados importados.`
        : `Substituição concluída: ${pendingBackup.questions.length} questões e ${pendingBackup.simulados.length} simulados carregados.`
    );
    setPendingBackup(null);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie o backup dos seus dados locais.
        </p>
      </div>

      {/* Uso do armazenamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4" />
            Armazenamento Local
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Usado</span>
            <span className="font-semibold">
              {formatBytes(usage.usedBytes)} / {formatBytes(usage.limitBytes)}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(usage.percentage * 100, 100)}%`,
                backgroundColor: usage.isWarning ? "#f59e0b" : "#22c55e",
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{questions.length} questões · {simulados.length} simulados</span>
            <span>{Math.round(usage.percentage * 100)}% utilizado</span>
          </div>
          {usage.isWarning && (
            <div className="flex items-start gap-2 p-3 rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Armazenamento acima de 80%. Exporte um backup antes de adicionar mais conteúdo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exportar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exportar Backup</CardTitle>
          <CardDescription>
            Baixa um arquivo JSON com todas as questões, simulados e imagens. Guarde em local seguro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} disabled={questions.length === 0 && simulados.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar backup
          </Button>
          {questions.length === 0 && simulados.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">Nenhum dado para exportar.</p>
          )}
        </CardContent>
      </Card>

      {/* Importar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Importar Backup</CardTitle>
          <CardDescription>
            Restaura dados a partir de um arquivo de backup anteriormente exportado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Modo de importação */}
          <div className="flex gap-3">
            {(["merge", "replace"] as ImportMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setImportMode(mode)}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm text-left transition-colors ${
                  importMode === mode
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/40"
                }`}
              >
                <p className="font-medium">
                  {mode === "merge" ? "Mesclar" : "Substituir"}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {mode === "merge"
                    ? "Adiciona os dados do backup aos existentes. Conflitos de ID são resolvidos pelo backup."
                    : "Apaga todos os dados atuais e os substitui pelo backup. Irreversível."}
                </p>
              </button>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Selecionar arquivo .json
          </Button>

          {importError && (
            <div className="flex items-start gap-2 p-3 rounded-md border border-destructive/30 bg-destructive/5 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {importError}
            </div>
          )}

          {importSuccess && (
            <div className="flex items-start gap-2 p-3 rounded-md border border-green-200 bg-green-50 text-green-800 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              {importSuccess}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação */}
      <AlertDialog open={!!pendingBackup} onOpenChange={() => setPendingBackup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {importMode === "replace" ? "Substituir todos os dados?" : "Mesclar backup?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  O arquivo contém{" "}
                  <strong>{pendingBackup?.questions.length} questões</strong> e{" "}
                  <strong>{pendingBackup?.simulados.length} simulados</strong>.
                </p>
                <p>
                  Exportado em:{" "}
                  {pendingBackup?.exportedAt
                    ? new Date(pendingBackup.exportedAt).toLocaleString("pt-BR")
                    : "—"}
                </p>
                {importMode === "replace" && (
                  <p className="text-destructive font-medium">
                    ⚠ Todos os dados atuais serão apagados permanentemente.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmImport}
              className={
                importMode === "replace"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {importMode === "replace" ? "Substituir tudo" : "Mesclar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
