"use client";

import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { X, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { compressImage } from "@/src/lib/image-utils";
import type { QuestionImage } from "@/src/types";

type Props = {
  images: QuestionImage[];
  onChange: (images: QuestionImage[]) => void;
};

export function ImageUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setLoading(true);
    try {
      const newImages: QuestionImage[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const { base64, mimeType } = await compressImage(file);
        newImages.push({
          id: uuidv4(),
          base64,
          mimeType,
          caption: "",
          position: "after",
        });
      }
      onChange([...images, ...newImages]);
    } finally {
      setLoading(false);
    }
  }

  function updateImage(id: string, patch: Partial<QuestionImage>) {
    onChange(images.map((img) => (img.id === id ? { ...img, ...patch } : img)));
  }

  function removeImage(id: string) {
    onChange(images.filter((img) => img.id !== id));
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {loading ? "Processando..." : "Clique ou arraste imagens aqui"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Imagens serão comprimidas automaticamente
        </p>
      </div>

      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="flex gap-3 p-3 border rounded-lg bg-muted/30"
            >
              <div className="w-20 h-16 rounded border overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                {img.base64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.base64}
                    alt="preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Legenda (opcional)</Label>
                    <Input
                      placeholder="Ex: Figura 1 — Gráfico"
                      value={img.caption ?? ""}
                      onChange={(e) => updateImage(img.id, { caption: e.target.value })}
                      className="h-7 text-xs mt-0.5"
                    />
                  </div>
                  <div className="w-36">
                    <Label className="text-xs">Posição</Label>
                    <Select
                      value={img.position}
                      onValueChange={(v) =>
                        updateImage(img.id, { position: v as "before" | "after" })
                      }
                    >
                      <SelectTrigger className="h-7 text-xs mt-0.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Antes do enunciado</SelectItem>
                        <SelectItem value="after">Após o enunciado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeImage(img.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
