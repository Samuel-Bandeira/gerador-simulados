export type ENEMArea =
  | "LINGUAGENS"
  | "CIENCIAS_HUMANAS"
  | "CIENCIAS_NATUREZA"
  | "MATEMATICA";

export const ENEM_AREAS: { value: ENEMArea; label: string }[] = [
  { value: "LINGUAGENS", label: "Linguagens, Códigos e suas Tecnologias" },
  { value: "CIENCIAS_HUMANAS", label: "Ciências Humanas e suas Tecnologias" },
  {
    value: "CIENCIAS_NATUREZA",
    label: "Ciências da Natureza e suas Tecnologias",
  },
  { value: "MATEMATICA", label: "Matemática e suas Tecnologias" },
];

export type AlternativeLetter = "A" | "B" | "C" | "D" | "E";

export type Alternative = {
  letter: AlternativeLetter;
  text: string;
};

export type QuestionImage = {
  id: string;
  base64: string;
  mimeType: string;
  caption?: string;
  position: "before" | "after";
};

export type Question = {
  id: string;
  area: ENEMArea;
  statement: string;
  images: QuestionImage[];
  alternatives: Alternative[];
  correctAnswer: AlternativeLetter;
  createdAt: string;
};

export type SimuladoQuestion = {
  questionId: string;
  order: number;
};

export type Caderno = {
  area: ENEMArea;
  questions: SimuladoQuestion[];
};

export type CadernoColor = "AMARELO" | "AZUL" | "VERDE" | "ROSA";

export type Simulado = {
  id: string;
  title: string;
  edition?: string;
  /** Número do caderno (1, 2, 3...). Default: 1 */
  cadernoNumber?: number;
  /** Cor do caderno. Default: AMARELO */
  cadernoColor?: CadernoColor;
  /** Frase para transcrição no cartão-resposta */
  transcricaoFrase?: string;
  cadernos: Caderno[];
  createdAt: string;
};
