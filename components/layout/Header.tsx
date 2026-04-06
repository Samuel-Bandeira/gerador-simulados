"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/src/store";
import { getStorageUsage, formatBytes } from "@/src/lib/storage-monitor";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Header() {
  // Reassess storage whenever questions or simulados change in the store
  const questions = useAppStore((s) => s.questions);
  const simulados = useAppStore((s) => s.simulados);

  const [usage, setUsage] = useState<ReturnType<typeof getStorageUsage> | null>(null);

  useEffect(() => {
    setUsage(getStorageUsage());
  }, [questions, simulados]);

  return (
    <header className="h-16 border-b flex items-center justify-end px-6 bg-background shrink-0 gap-4">
      {usage && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/configuracoes"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {usage.isWarning && (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
              <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(usage.percentage * 100, 100)}%`,
                    backgroundColor: usage.isWarning ? "#f59e0b" : "#22c55e",
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {formatBytes(usage.usedBytes)}
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Armazenamento: {formatBytes(usage.usedBytes)} /{" "}
              {formatBytes(usage.limitBytes)} ({Math.round(usage.percentage * 100)}%)
            </p>
            {usage.isWarning ? (
              <p className="text-amber-500 font-medium">
                Acima de 80% — faça um backup agora.
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">Clique para gerenciar backup.</p>
            )}
          </TooltipContent>
        </Tooltip>
      )}
    </header>
  );
}
