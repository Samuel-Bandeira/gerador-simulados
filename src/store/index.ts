"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Question, Simulado } from "@/src/types";

type AppState = {
  questions: Question[];
  simulados: Simulado[];

  // Questions
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, question: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  getQuestion: (id: string) => Question | undefined;

  // Simulados
  addSimulado: (simulado: Simulado) => void;
  updateSimulado: (id: string, simulado: Partial<Simulado>) => void;
  deleteSimulado: (id: string) => void;
  getSimulado: (id: string) => Simulado | undefined;

  // Backup
  importData: (data: { questions: Question[]; simulados: Simulado[] }, merge: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      questions: [],
      simulados: [],

      addQuestion: (question) =>
        set((state) => ({ questions: [...state.questions, question] })),

      updateQuestion: (id, updated) =>
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === id ? { ...q, ...updated } : q
          ),
        })),

      deleteQuestion: (id) =>
        set((state) => ({
          questions: state.questions.filter((q) => q.id !== id),
        })),

      getQuestion: (id) => get().questions.find((q) => q.id === id),

      addSimulado: (simulado) =>
        set((state) => ({ simulados: [...state.simulados, simulado] })),

      updateSimulado: (id, updated) =>
        set((state) => ({
          simulados: state.simulados.map((s) =>
            s.id === id ? { ...s, ...updated } : s
          ),
        })),

      deleteSimulado: (id) =>
        set((state) => ({
          simulados: state.simulados.filter((s) => s.id !== id),
        })),

      getSimulado: (id) => get().simulados.find((s) => s.id === id),

      importData: (data, merge) =>
        set((state) => ({
          questions: merge
            ? [
                ...state.questions.filter(
                  (q) => !data.questions.find((dq) => dq.id === q.id)
                ),
                ...data.questions,
              ]
            : data.questions,
          simulados: merge
            ? [
                ...state.simulados.filter(
                  (s) => !data.simulados.find((ds) => ds.id === s.id)
                ),
                ...data.simulados,
              ]
            : data.simulados,
        })),
    }),
    {
      name: "enem_store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
