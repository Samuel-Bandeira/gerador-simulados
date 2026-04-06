# PRD — Gerador de Simulados ENEM

**Versão:** 1.0  
**Data:** Junho 2025  
**Status:** Draft

---

## 1. Visão Geral

Ferramenta web para a equipe interna de uma empresa de cursinhos cadastrar questões e gerar simulados no padrão visual do ENEM, com exportação em PDF para impressão. Todo o estado é persistido localmente no navegador via `localStorage`, sem necessidade de backend ou banco de dados.

### Problema atual

A equipe monta os simulados manualmente: copia questões em um `.docx`, formata à mão, ajusta layout, imprime. O processo é lento, propenso a erros de formatação e não escala com o crescimento do banco de questões.

### Solução

Uma aplicação Next.js onde o admin cadastra questões (com enunciado, imagens e alternativas), monta um simulado selecionando questões e áreas, e gera um PDF automaticamente formatado no padrão ENEM.

---

## 2. Objetivos e Métricas de Sucesso

| Objetivo                   | Métrica                                                       |
| -------------------------- | ------------------------------------------------------------- |
| Eliminar formatação manual | 0 horas de ajuste de layout após geração                      |
| Reduzir tempo de montagem  | Montagem de um simulado completo em < 15 min                  |
| Garantir padrão visual     | PDF gerado indistinguível do padrão ENEM visualmente          |
| Preservar histórico        | Questões e simulados anteriores acessíveis a qualquer momento |

---

## 3. Escopo

### Dentro do escopo (v1)

- Cadastro de questões com texto, imagens e 5 alternativas (A–E)
- Organização por área do conhecimento do ENEM
- Montagem de simulado: seleção de questões, definição de ordem
- Geração de PDF no padrão visual ENEM (layout 2 colunas, numeração, cabeçalho por caderno)
- Gabarito no final do PDF
- Persistência via `localStorage`
- Importação/exportação do banco em JSON (backup manual)

### Fora do escopo (v1)

- Autenticação / controle de acesso
- Backend ou banco de dados
- Simulado online interativo para alunos
- Correção automática
- Fórmulas matemáticas (LaTeX/MathML)
- Multi-usuário / colaboração em tempo real

---

## 4. Usuários

**Único perfil: Equipe interna (admin)**

Características:

- Não é necessariamente técnica
- Acessa a ferramenta em desktop/notebook
- Precisa de uma interface simples, sem ambiguidade
- Já conhece o padrão visual do ENEM

---

## 5. Arquitetura Técnica

### Stack

| Camada                  | Tecnologia                                 |
| ----------------------- | ------------------------------------------ |
| Framework               | Next.js 15 (App Router)                    |
| Linguagem               | TypeScript                                 |
| Estilização             | Tailwind CSS + shadcn/ui                   |
| Formulários             | React Hook Form + Zod                      |
| Persistência            | `localStorage` (via hook customizado)      |
| Geração de PDF          | `html2pdf.js` ou `jsPDF` + template HTML   |
| Upload de imagens       | Base64 → `localStorage`                    |
| Gerenciamento de estado | Zustand (store persistido no localStorage) |

### Decisão: localStorage

Por se tratar de uma ferramenta usada por uma equipe pequena em um único dispositivo, `localStorage` é suficiente para v1. A limitação de ~5MB por origem é gerenciável com imagens em resolução moderada (recomendado comprimir antes do upload). A feature de exportar/importar JSON serve como mecanismo de backup.

> ⚠️ **Limitação conhecida:** imagens grandes podem estourar o limite do localStorage. O sistema deve alertar o usuário quando o armazenamento estiver acima de 80% da capacidade.

### Estrutura de dados no localStorage

```ts
// Chave: "enem_questions"
type Question = {
  id: string; // cuid
  area: ENEMArea;
  statement: string; // HTML rico ou texto puro
  images: QuestionImage[];
  alternatives: Alternative[];
  correctAnswer: "A" | "B" | "C" | "D" | "E";
  createdAt: string; // ISO 8601
};

type QuestionImage = {
  id: string;
  base64: string; // imagem em base64
  mimeType: string;
  caption?: string;
  position: "before" | "after" | "inline";
};

type Alternative = {
  letter: "A" | "B" | "C" | "D" | "E";
  text: string;
};

type ENEMArea =
  | "LINGUAGENS"
  | "CIENCIAS_HUMANAS"
  | "CIENCIAS_NATUREZA"
  | "MATEMATICA";

// Chave: "enem_simulados"
type Simulado = {
  id: string;
  title: string;
  edition?: string; // ex: "1º Simulado 2025"
  cadernos: Caderno[]; // cada área é um caderno
  createdAt: string;
};

type Caderno = {
  area: ENEMArea;
  questions: SimuladoQuestion[];
};

type SimuladoQuestion = {
  questionId: string;
  order: number; // número exibido na prova
};
```

---

## 6. Funcionalidades Detalhadas

### 6.1 Banco de Questões

**Listagem de questões**

- Tabela com colunas: número, área, trecho do enunciado, data de cadastro, ações
- Filtro por área do conhecimento
- Busca por texto no enunciado
- Ações: editar, duplicar, excluir

**Cadastro / Edição de questão**

- Campo: área do conhecimento (select obrigatório)
- Campo: enunciado (textarea com suporte a quebras de linha)
- Upload de imagem(ns): arraste ou clique, preview inline, opção de legenda, opção de posicionamento (antes/depois do enunciado)
- Alternativas A a E: campos de texto individuais, obrigatórios
- Campo: resposta correta (radio A–E)
- Botão: Salvar questão
- Validação em tempo real com Zod

### 6.2 Montagem de Simulado

**Criação de simulado**

- Campo: título do simulado (ex: "Simulado Maio 2025 — Turma A")
- Campo: edição/identificação opcional
- Interface de seleção de questões por área:
  - Cada área tem sua própria seção expansível
  - Lista de questões disponíveis com checkbox
  - Contador de selecionadas por área
  - Drag-and-drop para reordenar questões dentro da área
- Numeração automática e contínua entre as áreas
- Botão: Pré-visualizar → Gerar PDF

### 6.3 Geração de PDF

**Padrão visual ENEM a respeitar:**

- Papel A4, margens: superior 2cm, inferior 2cm, laterais 1,5cm
- Layout em 2 colunas separadas por fio vertical
- Fonte: Calibri 10pt no corpo, 11pt nas alternativas
- Cabeçalho de página: nome da prova (ex: "LINGUAGENS, CÓDIGOS E SUAS TECNOLOGIAS") + número de páginas
- Rodapé: identificação do simulado + numeração de páginas
- Numeração de questões: contínua de 1 a N, em negrito antes do enunciado
- Imagens: inseridas inline, centralizadas, com legenda abaixo se houver
- Alternativas: listadas em coluna simples abaixo do enunciado, com letra em negrito
- Quebra de seção entre áreas com título da nova área
- Gabarito: tabela no final do documento, organizada por caderno

**Fluxo de geração:**

1. Sistema monta HTML do simulado com CSS que replica o padrão ENEM
2. `html2pdf.js` converte o HTML para PDF no navegador
3. PDF é disponibilizado para download com nome formatado (ex: `simulado-maio-2025-turma-a.pdf`)

> Toda a geração ocorre no lado do cliente. Nenhum dado é enviado para servidores externos.

### 6.4 Histórico de Simulados

- Lista de simulados criados com data e quantidade de questões
- Ação: baixar PDF novamente (regenera a partir dos dados salvos)
- Ação: editar simulado (alterar questões e reordenação)
- Ação: excluir

### 6.5 Importação / Exportação (Backup)

- **Exportar:** gera arquivo `backup-enem-[data].json` com todo o conteúdo do localStorage (questões + simulados + imagens em base64)
- **Importar:** faz upload do arquivo JSON, substitui ou mescla com os dados atuais (opção do usuário)

---

## 7. Estrutura de Pastas

```
src/
├── app/
│   ├── page.tsx                        # dashboard / home
│   ├── questoes/
│   │   ├── page.tsx                    # listagem
│   │   └── [id]/
│   │       └── page.tsx                # cadastro / edição
│   ├── simulados/
│   │   ├── page.tsx                    # listagem / histórico
│   │   ├── novo/
│   │   │   └── page.tsx                # montagem do simulado
│   │   └── [id]/
│   │       └── page.tsx                # detalhes + download PDF
│   └── configuracoes/
│       └── page.tsx                    # exportar / importar backup
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── questoes/
│   │   ├── QuestionForm.tsx
│   │   ├── QuestionCard.tsx
│   │   └── ImageUploader.tsx
│   ├── simulados/
│   │   ├── SimuladoBuilder.tsx
│   │   ├── AreaSection.tsx
│   │   └── QuestionSelector.tsx
│   └── pdf/
│       ├── SimuladoTemplate.tsx        # template HTML do PDF
│       └── GabaritoTemplate.tsx
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useQuestions.ts
│   └── useSimulados.ts
├── store/
│   └── index.ts                        # Zustand store com persist
├── lib/
│   ├── pdf-generator.ts               # lógica html2pdf.js
│   ├── backup.ts                      # export/import JSON
│   └── storage-monitor.ts            # alerta de capacidade
└── types/
    └── index.ts                        # todos os tipos TypeScript
```

---

## 8. Telas e Navegação

```
/                        Dashboard (contadores: X questões, Y simulados)
├── /questoes            Lista de questões + busca/filtro
│   └── /questoes/nova   Formulário de nova questão
│   └── /questoes/[id]   Edição de questão existente
├── /simulados           Histórico de simulados
│   └── /simulados/novo  Montagem de simulado
│   └── /simulados/[id]  Detalhes + download PDF
└── /configuracoes       Backup (exportar / importar)
```

---

## 9. Requisitos Não-Funcionais

| Requisito       | Especificação                                             |
| --------------- | --------------------------------------------------------- |
| Performance     | Listagem de até 500 questões sem paginação                |
| Geração de PDF  | PDF de 90 questões gerado em < 10s no navegador           |
| Compatibilidade | Chrome e Edge (últimas 2 versões)                         |
| Responsividade  | Desktop only (min-width: 1024px)                          |
| Armazenamento   | Alerta ao atingir 4MB de uso no localStorage              |
| Offline         | Funciona completamente offline após primeiro carregamento |

---

## 10. Roadmap de Desenvolvimento

### Sprint 1 — Fundação

- [ ] Setup Next.js 15 + TypeScript + Tailwind + shadcn/ui
- [ ] Configuração do Zustand store com persist no localStorage
- [ ] Layout base: sidebar + header
- [ ] Tipos TypeScript e schemas Zod

### Sprint 2 — Banco de Questões

- [ ] CRUD de questões (listagem, criação, edição, exclusão)
- [ ] Upload e preview de imagens (base64)
- [ ] Filtros e busca na listagem
- [ ] Validações com React Hook Form + Zod

### Sprint 3 — Montagem do Simulado

- [ ] Tela de criação de simulado
- [ ] Seletor de questões por área
- [ ] Drag-and-drop para reordenação
- [ ] Numeração automática contínua

### Sprint 4 — Geração de PDF

- [ ] Template HTML/CSS fiel ao padrão ENEM
- [ ] Integração com `html2pdf.js`
- [ ] Geração do gabarito
- [ ] Download do PDF com nome formatado

### Sprint 5 — Polimento

- [ ] Histórico de simulados com opção de regenerar PDF
- [ ] Exportação/importação de backup JSON
- [ ] Monitor de capacidade do localStorage
- [ ] Testes manuais de ponta a ponta

---

## 11. Riscos e Mitigações

| Risco                                                    | Probabilidade | Impacto | Mitigação                                                                  |
| -------------------------------------------------------- | ------------- | ------- | -------------------------------------------------------------------------- |
| Limite do localStorage estourar com imagens grandes      | Alta          | Alto    | Compressão automática de imagens no upload + alerta de capacidade          |
| Layout do PDF não fiel ao ENEM em diferentes navegadores | Média         | Alto    | Desenvolver e testar exclusivamente no Chrome; documentar requisito        |
| Perda de dados por limpeza do navegador                  | Média         | Alto    | Instrução explícita para exportar backup regularmente; alerta no dashboard |
| Performance lenta ao gerar PDF com muitas imagens        | Baixa         | Médio   | Limitar resolução das imagens no upload                                    |

---

## 12. Definição de Pronto (DoD)

Uma feature está pronta quando:

- Funciona end-to-end no Chrome sem erros no console
- Dados persistem após recarregar a página
- Formulários validam e exibem erros claros
- O PDF gerado corresponde visualmente ao padrão ENEM
- Não há dados de questões/simulados anteriores interferindo após importar backup
