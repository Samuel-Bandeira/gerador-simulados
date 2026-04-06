"use client";

import { forwardRef } from "react";
import type { Simulado, Question, ENEMArea } from "@/src/types";
import { ENEM_AREAS } from "@/src/types";

/* -----------------------------------------------------------------------
 * Layout ENEM/APEIRON
 *
 * Estrutura do PDF:
 *  1. Capa (fundo amarelo, logo, instruções) — page-break-after: always
 *  2. Para cada área: cabeçalho de seção + questões em 2 colunas CSS
 *
 * Limitação do html2pdf.js (html2canvas): cabeçalhos/rodapés por página
 * não são suportados. O cabeçalho APEIRON/enem2026 aparece uma vez por seção.
 * --------------------------------------------------------------------- */

// ---------------------------------------------------------------------------
// Ícone APEIRON (pirâmide estilizada)
// ---------------------------------------------------------------------------
function ApeiронIcon({ size = 44 }: { size?: number }) {
  const w = size;
  const h = size * 0.88;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 50 44"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* Triângulo externo */}
      <polygon
        points="25,1 49,43 1,43"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Triângulo interno */}
      <polygon
        points="25,12 40,38 10,38"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Linha central vertical */}
      <line x1="25" y1="12" x2="25" y2="38" stroke="#1a1a1a" strokeWidth="1.5" />
      {/* Linha diagonal esquerda interna */}
      <line x1="25" y1="12" x2="10" y2="38" stroke="#1a1a1a" strokeWidth="1.5" />
      {/* Linha diagonal direita interna */}
      <line x1="25" y1="12" x2="40" y2="38" stroke="#1a1a1a" strokeWidth="1.5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Branding enem2026
// ---------------------------------------------------------------------------
function EnemBrand({ scale = 1 }: { scale?: number }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "baseline", lineHeight: 1 }}>
      <span
        style={{
          fontSize: `${36 * scale}pt`,
          fontWeight: 900,
          color: "#1a3080",
          fontFamily: "Arial Black, Arial, sans-serif",
          letterSpacing: "-1px",
        }}
      >
        enem
      </span>
      <span
        style={{
          fontSize: `${26 * scale}pt`,
          fontWeight: 300,
          color: "#4a7fd4",
          fontFamily: "Arial, sans-serif",
          letterSpacing: "2px",
          marginLeft: "2px",
        }}
      >
        2026
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Capa (Página 1)
// ---------------------------------------------------------------------------
const YELLOW = "#f5e87a";

function deriveDia(areas: ENEMArea[]): string {
  const dia1 = areas.some((a) => a === "LINGUAGENS" || a === "CIENCIAS_HUMANAS");
  const dia2 = areas.some((a) => a === "CIENCIAS_NATUREZA" || a === "MATEMATICA");
  if (dia1 && !dia2) return "1º DIA";
  if (dia2 && !dia1) return "2º DIA";
  return "1º e 2º DIA";
}

function deriveSubtitles(areas: ENEMArea[]): string[] {
  const subtitles: string[] = [];
  if (areas.includes("LINGUAGENS"))
    subtitles.push("PROVA DE LINGUAGENS, CÓDIGOS E SUAS TECNOLOGIAS E REDAÇÃO");
  if (areas.includes("CIENCIAS_HUMANAS"))
    subtitles.push("PROVA DE CIÊNCIAS HUMANAS E SUAS TECNOLOGIAS");
  if (areas.includes("CIENCIAS_NATUREZA"))
    subtitles.push("PROVA DE CIÊNCIAS DA NATUREZA E SUAS TECNOLOGIAS");
  if (areas.includes("MATEMATICA"))
    subtitles.push("PROVA DE MATEMÁTICA E SUAS TECNOLOGIAS");
  return subtitles;
}


function CapaPage({
  simulado,
  totalQuestions,
}: {
  simulado: Simulado;
  totalQuestions: number;
}) {
  const areas = simulado.cadernos.map((c) => c.area);
  const dia = deriveDia(areas);
  const subtitles = deriveSubtitles(areas);
  const cadernoColor = simulado.cadernoColor ?? "AMARELO";
  const cadernoNumber = simulado.cadernoNumber ?? 1;
  const transcricaoFrase =
    simulado.transcricaoFrase ?? "O sentido da vida é buscar qualquer sentido";
  // Extrai apenas o ano de 4 dígitos da edição (ex: "Ed 1 - 2026" → "2026")
  const year = simulado.edition?.match(/\d{4}/)?.[0] ?? new Date().getFullYear().toString();

  // Alias para px: elemento de seção com padding lateral
  const P = "0 18px";

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",  // A4 @ 96 dpi (297mm)
        background: YELLOW,
        fontFamily: "Arial, Calibri, sans-serif",
        color: "#1a1a1a",
        paddingTop: "14px",
        paddingBottom: "12px",
        boxSizing: "border-box",
        pageBreakAfter: "always",
        position: "relative",
        overflow: "hidden",   // mantém html2canvas restrito a 764px de largura
      }}
    >
      {/* Padrão de fundo */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            rgba(200,170,0,0.08) 0px,
            rgba(200,170,0,0.08) 1px,
            transparent 1px,
            transparent 18px
          ), repeating-linear-gradient(
            -45deg,
            rgba(200,170,0,0.08) 0px,
            rgba(200,170,0,0.08) 1px,
            transparent 1px,
            transparent 18px
          )`,
          pointerEvents: "none",
        }}
      />

      {/* ── Topo: CADERNO | Logo | DIA ── */}
      <div style={{ padding: P, marginBottom: "6px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "9pt", fontWeight: "bold", letterSpacing: "0.05em" }}>
            CADERNO {cadernoNumber} | {cadernoColor}
          </span>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <ApeiронIcon size={38} />
            <span style={{ fontSize: "7pt", fontWeight: "bold", letterSpacing: "0.18em" }}>
              APEIRON
            </span>
          </div>

          {/* "1º DIA" — display:inline-block para box model correto no flex */}
          <span
            style={{
              display: "inline-block",
              fontSize: "20pt",
              fontWeight: 900,
              fontFamily: "Arial Black, Arial, sans-serif",
              border: "3px solid #1a1a1a",
              padding: "1px 8px",
              lineHeight: 1.15,
              whiteSpace: "nowrap",
            }}
          >
            {dia}
          </span>
        </div>
      </div>

      {/* ── Linha divisória full-width ── */}
      <div style={{ borderTop: "2px solid #1a1a1a", marginBottom: "10px" }} />

      {/* ── Título ── */}
      <div style={{ padding: P, textAlign: "center", marginBottom: "6px" }}>
        <div
          style={{
            fontSize: "18pt",
            fontWeight: 900,
            fontFamily: "Arial Black, Arial, sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            lineHeight: 1.2,
          }}
        >
          Exame Nacional do Ensino Médio
        </div>
        {subtitles.map((sub, i) => (
          <div key={i} style={{ fontSize: "8.5pt", fontWeight: "bold", marginTop: "3px" }}>
            {sub}
          </div>
        ))}
      </div>

      {/* ── Logo enem + Caderno box ── */}
      <div style={{ padding: P, marginBottom: "10px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "2px solid #1a1a1a",
            padding: "10px 12px",
            background: "rgba(255,255,255,0.15)",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          {/* Lado esquerdo: ícone + título + brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
            <ApeiронIcon size={48} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "9pt", fontWeight: "bold", marginBottom: "2px" }}>
                {simulado.title}
              </div>
              <EnemBrand scale={0.85} />
            </div>
          </div>

          {/* Caixa CADERNO / N / COR — largura fixa para não vazar */}
          <div
            style={{
              border: "2px solid #1a1a1a",
              padding: "6px 12px",
              textAlign: "center",
              width: "90px",
              flexShrink: 0,
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: "7.5pt", fontWeight: "bold", letterSpacing: "0.06em" }}>
              CADERNO
            </div>
            <div
              style={{
                fontSize: "30pt",
                fontWeight: 900,
                fontFamily: "Arial Black, Arial, sans-serif",
                lineHeight: 1,
                borderTop: "1px solid #1a1a1a",
                borderBottom: "1px solid #1a1a1a",
                margin: "3px 0",
                padding: "1px 0",
              }}
            >
              {cadernoNumber}
            </div>
            <div style={{ fontSize: "8pt", fontWeight: "bold" }}>{cadernoColor}</div>
          </div>
        </div>
      </div>

      {/* ── Linhas marcadoras ── */}
      <div style={{ padding: P }}>
        <div style={{ display: "flex", gap: "2px", marginBottom: "4px" }}>
          <div style={{ width: "12px", height: "10px", background: "#1a1a1a" }} />
          <div style={{ width: "12px", height: "10px", background: "#1a1a1a" }} />
        </div>
      </div>

      {/* ── Dupla linha + faixa de segurança (full-width sem padding) ── */}
      <div style={{ borderTop: "3px solid #1a1a1a", marginBottom: "1px" }} />
      <div style={{ borderTop: "1px solid #1a1a1a", marginBottom: "3px" }} />

      <div
        style={{
          background: "rgba(220,200,60,0.45)",
          padding: "3px 18px",
          overflow: "hidden",
          whiteSpace: "nowrap",
          marginBottom: "3px",
          letterSpacing: "0.22em",
          fontSize: "8pt",
          fontWeight: "bold",
          color: "rgba(180,150,0,0.55)",
          textTransform: "uppercase",
        }}
      >
        {"APEIRON" + year + " · APEIRON" + year + " · APEIRON" + year + " · APEIRON" + year + " · APEIRON" + year}
      </div>

      <div style={{ borderTop: "1px solid #1a1a1a", marginBottom: "1px" }} />
      <div style={{ borderTop: "3px solid #1a1a1a", marginBottom: "8px" }} />

      {/* ── Seção inferior com padding ── */}
      <div style={{ padding: P }}>

        {/* Caixa ATENÇÃO */}
        <div
          style={{
            border: "1px solid #8a7800",
            padding: "10px 12px",
            marginBottom: "8px",
            background: "rgba(255,255,255,0.2)",
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: "9.5pt", textAlign: "center", lineHeight: 1.4 }}>
            <strong>ATENÇÃO</strong>: transcreva no espaço apropriado do seu CARTÃO-RESPOSTA
            <br />
            com sua caligrafia usual, considerando as letras maiúsculas e minúsculas, a seguinte frase:
          </p>
          <div
            style={{
              background: "#1a1a1a",
              color: "#fff",
              textAlign: "center",
              padding: "8px 12px",
              fontSize: "10pt",
              fontWeight: "bold",
            }}
          >
            {transcricaoFrase}
          </div>
        </div>

        {/* Linha */}
        <div style={{ borderTop: "1px solid #8a7800", marginBottom: "8px" }} />

        {/* Instruções */}
        <div style={{ textAlign: "center", marginBottom: "6px" }}>
          <strong style={{ fontSize: "9.5pt", letterSpacing: "0.04em" }}>
            LEIA ATENTAMENTE AS INSTRUÇÕES SEGUINTES:
          </strong>
        </div>

        <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "9pt", lineHeight: 1.45 }}>
          <li style={{ marginBottom: "5px" }}>
            Este CADERNO DE QUESTÕES contém {totalQuestions} questões numeradas de 01 a{" "}
            {totalQuestions}
            {areas.includes("LINGUAGENS") ? " e a Proposta de Redação" : ""}, dispostas da seguinte
            maneira:
            {areas.includes("LINGUAGENS") && (
              <ol type="a" style={{ marginTop: "3px", paddingLeft: "16px", marginBottom: 0 }}>
                <li>
                  questões de número 01 a{" "}
                  {simulado.cadernos.find((c) => c.area === "LINGUAGENS")?.questions.length ?? 45},
                  relativas à área de Linguagens, Códigos e suas Tecnologias;
                </li>
                <li>Proposta de Redação;</li>
                {areas.includes("CIENCIAS_HUMANAS") && (
                  <li>
                    questões de número{" "}
                    {(simulado.cadernos.find((c) => c.area === "LINGUAGENS")?.questions.length ?? 45) + 1}{" "}
                    a{" "}
                    {(simulado.cadernos.find((c) => c.area === "LINGUAGENS")?.questions.length ?? 45) +
                      (simulado.cadernos.find((c) => c.area === "CIENCIAS_HUMANAS")?.questions.length ?? 45)}
                    , relativas à área de Ciências Humanas e suas Tecnologias.
                  </li>
                )}
              </ol>
            )}
            {areas.includes("LINGUAGENS") && areas.includes("CIENCIAS_HUMANAS") && (
              <p style={{ margin: "4px 0 0", fontSize: "9pt" }}>
                <strong>ATENÇÃO</strong>: as questões de 01 a 05 são relativas à língua estrangeira.
                Você deverá responder apenas às questões relativas à língua estrangeira (inglês ou
                espanhol) escolhida no ato de sua inscrição.
              </p>
            )}
          </li>

          <li style={{ marginBottom: "4px" }}>
            Confira se a quantidade e a ordem das questões do seu CADERNO DE QUESTÕES estão de acordo
            com as instruções anteriores. Caso o caderno esteja incompleto, tenha defeito ou apresente
            qualquer divergência, comunique ao aplicador da sala para que ele tome as providências
            cabíveis.
          </li>

          <li style={{ marginBottom: "4px" }}>
            Para cada uma das questões objetivas, são apresentadas 5 opções. Apenas uma responde
            corretamente à questão.
          </li>

          <li style={{ marginBottom: "4px" }}>
            O tempo disponível para estas provas é de <strong>cinco horas e trinta minutos</strong>.
          </li>

          <li style={{ marginBottom: "4px" }}>
            Reserve tempo suficiente para preencher o CARTÃO-RESPOSTA e a FOLHA DE REDAÇÃO.
          </li>

          <li style={{ marginBottom: "4px" }}>
            Os rascunhos e as marcações assinaladas no CADERNO DE QUESTÕES não serão considerados na
            avaliação.
          </li>

          <li style={{ marginBottom: "4px" }}>
            Somente serão corrigidas as redações transcritas na FOLHA DE REDAÇÃO.
          </li>

          <li style={{ marginBottom: "4px" }}>
            Quando terminar as provas, acene para chamar o aplicador e entregue este CADERNO DE
            QUESTÕES e o CARTÃO-RESPOSTA/FOLHA DE REDAÇÃO.
          </li>

          <li style={{ marginBottom: "4px" }}>
            Você poderá deixar o local de prova somente após decorridas duas horas do início da
            aplicação e poderá levar seu CADERNO DE QUESTÕES ao deixar em definitivo a sala de prova
            nos <strong>30 minutos</strong> que antecedem o término das provas.
          </li>
        </ol>

        {/* Linha */}
        <div style={{ borderTop: "1px solid #8a7800", margin: "8px 0" }} />

        {/* Rodapé */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <ApeiронIcon size={32} />
          <div style={{ fontSize: "7pt", color: "#555", letterSpacing: "0.04em" }}>
            Copyright © {year} de APEIRON Educação — Todos os direitos reservados.
          </div>
        </div>

      </div>{/* fim seção inferior */}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cabeçalho de página de questões (aparece uma vez por seção)
// ---------------------------------------------------------------------------
function PageHeader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "6px",
        marginBottom: "4px",
        columnSpan: "all",
      }}
    >
      {/* Lado esquerdo: logo + texto */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <ApeiронIcon size={30} />
        <span
          style={{
            fontSize: "7pt",
            fontWeight: "bold",
            letterSpacing: "0.14em",
            color: "#1a1a1a",
          }}
        >
          APEIRON
        </span>
      </div>

      {/* Centro: enem brand */}
      <div style={{ textAlign: "center" }}>
        <EnemBrand scale={0.45} />
        <div style={{ fontSize: "6.5pt", color: "#444", letterSpacing: "0.04em", marginTop: "1px" }}>
          Exame Nacional do Ensino Médio
        </div>
      </div>

      {/* Lado direito: faixa amarela decorativa */}
      <div
        style={{
          width: "60px",
          height: "6px",
          background: "#e8c800",
          borderRadius: "1px",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cabeçalho de área/seção (dentro das colunas)
// ---------------------------------------------------------------------------
function SectionHeader({
  label,
  questionRange,
}: {
  label: string;
  questionRange: string;
}) {
  return (
    <div
      style={{
        background: "#f0e000",
        borderLeft: "4px solid #b8a800",
        padding: "6px 10px",
        marginBottom: "12px",
        breakInside: "avoid",
        columnSpan: "all",
      }}
    >
      <div
        style={{
          fontSize: "9.5pt",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "#1a1a1a",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "8pt", fontWeight: "bold", color: "#333", marginTop: "1px" }}>
        {questionRange}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Estilos das questões
// ---------------------------------------------------------------------------
// Largura de cada coluna: (764px_content - 20px_gap) / 2 ≈ 372px
// (794px total - 30px page padding = 764px; dividido em 2 colunas com 20px gap)
const COLUMN_MAX_IMG = "370px";

const S = {
  columns: {
    columnCount: 2,
    columnGap: "20px",
    columnRule: "1px solid #c0c0c0",
    // Garante que filhos com overflow não escapem da coluna
    overflow: "hidden" as const,
  } as React.CSSProperties,

  question: {
    // SEM break-inside: avoid — questões fluem entre colunas como no ENEM real.
    // Se uma questão não cabe em uma coluna, o texto continua na próxima coluna
    // (e na próxima página se necessário), em vez de pular a página inteira.
    marginBottom: "14px",
    paddingBottom: "10px",
    borderBottom: "1px solid #ddd",
    overflow: "hidden" as const,
    minWidth: 0,
  } as React.CSSProperties,

  questionTitle: {
    fontSize: "9pt",
    fontWeight: "bold" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    borderBottom: "2px solid #1a1a1a",
    paddingBottom: "3px",
    marginBottom: "6px",
    // Evita que o título fique órfão no final de uma coluna sem o corpo da questão
    breakAfter: "avoid" as const,
  } as React.CSSProperties,

  statement: {
    margin: "0 0 6px 0",
    fontSize: "9pt",
    // pre-wrap preserva quebras de linha do banco, mas não quebra palavras longas
    // → troca por normal + break-word para garantir quebra em strings contínuas
    whiteSpace: "normal" as const,
    wordBreak: "break-word" as const,
    overflowWrap: "break-word" as const,
    textAlign: "justify" as const,
    lineHeight: 1.45,
  } as React.CSSProperties,

  imageWrapper: {
    textAlign: "center" as const,
    margin: "6px 0",
    breakInside: "avoid" as const,
    // Limita largura ao tamanho da coluna; max-width:100% em CSS columns
    // é relativo ao container inteiro, não à coluna — por isso usamos px fixo
    maxWidth: COLUMN_MAX_IMG,
    overflow: "hidden" as const,
  } as React.CSSProperties,

  imageCaption: {
    fontSize: "7.5pt",
    color: "#555",
    marginTop: "2px",
    fontStyle: "italic" as const,
  } as React.CSSProperties,

  alternatives: {
    marginTop: "5px",
  } as React.CSSProperties,

  alternative: {
    display: "flex" as const,
    gap: "5px",
    marginBottom: "2px",
    fontSize: "9pt",
    breakInside: "avoid" as const,
    lineHeight: 1.4,
  } as React.CSSProperties,

  altLetter: {
    fontWeight: "bold" as const,
    minWidth: "16px",
    flexShrink: 0,
  } as React.CSSProperties,

  gabaritoSection: {
    pageBreakBefore: "always",
    paddingTop: "8px",
  } as React.CSSProperties,

  gabaritoTitle: {
    fontSize: "12pt",
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    textTransform: "uppercase" as const,
    borderBottom: "2px solid #000",
    paddingBottom: "6px",
    marginBottom: "14px",
    letterSpacing: "0.08em",
  } as React.CSSProperties,

  gabaritoAreaTitle: {
    fontSize: "9pt",
    fontWeight: "bold" as const,
    textTransform: "uppercase" as const,
    background: "#e8e8e8",
    padding: "3px 8px",
    marginBottom: "6px",
    marginTop: "10px",
  } as React.CSSProperties,
};

// ---------------------------------------------------------------------------
// Gabarito
// ---------------------------------------------------------------------------
function Gabarito({
  simulado,
  questionMap,
}: {
  simulado: Simulado;
  questionMap: Map<string, Question>;
}) {
  return (
    <div style={S.gabaritoSection}>
      <p style={S.gabaritoTitle}>Gabarito</p>

      {simulado.cadernos.map((caderno) => {
        const areaLabel =
          ENEM_AREAS.find((a) => a.value === caderno.area)?.label ?? caderno.area;
        const sorted = [...caderno.questions].sort((a, b) => a.order - b.order);

        const rows: Array<Array<{ order: number; answer: string }>> = [];
        for (let i = 0; i < sorted.length; i += 10) {
          rows.push(
            sorted.slice(i, i + 10).map((sq) => ({
              order: sq.order,
              answer: questionMap.get(sq.questionId)?.correctAnswer ?? "—",
            }))
          );
        }

        return (
          <div key={caderno.area}>
            <p style={S.gabaritoAreaTitle}>{areaLabel}</p>
            {rows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                style={{ display: "flex", gap: "0", marginBottom: "3px" }}
              >
                {row.map((cell) => (
                  <div
                    key={cell.order}
                    style={{ display: "flex", flexDirection: "column" as const }}
                  >
                    <div
                      style={{
                        background: "#1a1a1a",
                        color: "#fff",
                        border: "1px solid #1a1a1a",
                        width: "48px",
                        textAlign: "center" as const,
                        fontSize: "8pt",
                        padding: "2px",
                        fontWeight: "bold" as const,
                      }}
                    >
                      {cell.order}
                    </div>
                    <div
                      style={{
                        border: "1px solid #aaa",
                        borderTop: "none",
                        width: "48px",
                        textAlign: "center" as const,
                        fontSize: "9pt",
                        padding: "3px 2px",
                      }}
                    >
                      {cell.answer}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rodapé de página de questões
// ---------------------------------------------------------------------------
function PageFooter({
  areaLabel,
  cadernoNumber,
  cadernoColor,
}: {
  areaLabel: string;
  cadernoNumber: number;
  cadernoColor: string;
}) {
  return (
    <div
      style={{
        borderTop: "1px solid #c0c0c0",
        marginTop: "8px",
        paddingTop: "4px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "7pt",
        color: "#555",
        columnSpan: "all",
      }}
    >
      <span style={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {areaLabel.toUpperCase()} | CADERNO {cadernoNumber} | {cadernoColor}
      </span>
      <span style={{ fontSize: "7pt" }}>Copyright © APEIRON Educação — Todos os direitos reservados.</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Template principal
// ---------------------------------------------------------------------------
type Props = {
  simulado: Simulado;
  questions: Question[];
};

export const SimuladoTemplate = forwardRef<HTMLDivElement, Props>(
  function SimuladoTemplate({ simulado, questions }, ref) {
    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const cadernoNumber = simulado.cadernoNumber ?? 1;
    const cadernoColor = simulado.cadernoColor ?? "AMARELO";

    const totalQuestions = simulado.cadernos.reduce(
      (sum, c) => sum + c.questions.length,
      0
    );

    // Numeração contínua entre cadernos
    let globalOrder = 1;
    const orderedCadernos = simulado.cadernos.map((caderno) => {
      const sorted = [...caderno.questions].sort((a, b) => a.order - b.order);
      const withGlobal = sorted.map((sq) => ({ ...sq, globalOrder: globalOrder++ }));
      return { caderno, questions: withGlobal };
    });

    // Padding das páginas de questões (substitui as margens do jsPDF que estão em 0)
    const PAGE_PAD = "20px 15px";

    return (
      <div
        ref={ref}
        style={{
          fontFamily: "Calibri, Arial, sans-serif",
          fontSize: "9pt",
          color: "#1a1a1a",
          background: "#fff",
          width: "794px",   // A4 completo @ 96 dpi; margens no CSS
          lineHeight: "1.4",
          overflow: "hidden",
        }}
      >
        {/* ── Capa ── */}
        <CapaPage simulado={simulado} totalQuestions={totalQuestions} />

        {/* ── Cadernos / Áreas ── */}
        {orderedCadernos.map(({ caderno, questions: sortedQ }, sectionIdx) => {
          const areaLabel =
            ENEM_AREAS.find((a) => a.value === caderno.area)?.label ?? caderno.area;
          const firstOrder = sortedQ[0]?.globalOrder ?? 1;
          const lastOrder = sortedQ[sortedQ.length - 1]?.globalOrder ?? 1;
          const questionRange = `Questões de ${String(firstOrder).padStart(2, "0")} a ${String(lastOrder).padStart(2, "0")}`;

          return (
            <div
              key={caderno.area}
              style={{
                pageBreakBefore: sectionIdx > 0 ? "always" : "auto",
                padding: PAGE_PAD,
              }}
            >
              {/* Cabeçalho de seção (logo + enem brand) */}
              <PageHeader />
              <div style={{ borderTop: "3px solid #e8c800", marginBottom: "10px" }} />

              {/* Banner de área */}
              <SectionHeader label={areaLabel} questionRange={questionRange} />

              {/* Questões em 2 colunas */}
              <div style={S.columns}>
                {sortedQ.map((sq) => {
                  const q = questionMap.get(sq.questionId);
                  if (!q) return null;

                  const beforeImages = q.images.filter((img) => img.position === "before");
                  const afterImages = q.images.filter((img) => img.position === "after");

                  return (
                    <div key={sq.questionId} style={S.question}>
                      {/* Título da questão */}
                      <div style={S.questionTitle}>Questão {sq.globalOrder}</div>

                      {/* Imagens antes do enunciado */}
                      {beforeImages.map((img) => (
                        <div key={img.id} style={S.imageWrapper}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.base64}
                            alt={img.caption ?? ""}
                            style={{
                              maxWidth: COLUMN_MAX_IMG,
                              width: "100%",
                              height: "auto",
                              maxHeight: "160px",
                              objectFit: "contain",
                              display: "block",
                            }}
                          />
                          {img.caption && (
                            <p style={S.imageCaption}>{img.caption}</p>
                          )}
                        </div>
                      ))}

                      {/* Enunciado */}
                      <p style={S.statement}>{q.statement}</p>

                      {/* Imagens após o enunciado */}
                      {afterImages.map((img) => (
                        <div key={img.id} style={S.imageWrapper}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.base64}
                            alt={img.caption ?? ""}
                            style={{
                              maxWidth: COLUMN_MAX_IMG,
                              width: "100%",
                              height: "auto",
                              maxHeight: "160px",
                              objectFit: "contain",
                              display: "block",
                            }}
                          />
                          {img.caption && (
                            <p style={S.imageCaption}>{img.caption}</p>
                          )}
                        </div>
                      ))}

                      {/* Alternativas */}
                      <div style={S.alternatives}>
                        {q.alternatives.map((alt) => (
                          <div key={alt.letter} style={S.alternative}>
                            <span style={S.altLetter}>{alt.letter}</span>
                            <span>{alt.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rodapé da seção */}
              <PageFooter
                areaLabel={areaLabel}
                cadernoNumber={cadernoNumber}
                cadernoColor={cadernoColor}
              />
            </div>
          );
        })}

        {/* ── Gabarito ── */}
        <div style={{ padding: PAGE_PAD }}>
          <Gabarito simulado={simulado} questionMap={questionMap} />
        </div>
      </div>
    );
  }
);
