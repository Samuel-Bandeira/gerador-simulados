<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Geração de PDF

O projeto atualmente usa `html2pdf.js` para gerar o PDF do simulado (`components/pdf/SimuladoTemplate.tsx`).

**Próximo passo planejado:** adicionar `@react-pdf/renderer` como segundo gerador de PDF, em paralelo ao html2pdf.js. A arquitetura prevista é:

```
Simulado (dados)
     │
     ├── components/pdf/SimuladoTemplate.tsx   → html2pdf.js  (atual)
     └── components/pdf/SimuladoTemplatePDF.tsx → @react-pdf/renderer (a implementar)
```

Na tela de detalhes do simulado (`components/simulados/SimuladoDetail.tsx`), o usuário terá dois botões de download. Após validação com o cliente, o template que não atender é descartado.

**Motivação:** `html2pdf.js` não suporta cabeçalho/rodapé nativos por página. `@react-pdf/renderer` roda no browser, sem backend, e oferece controle preciso de quebra de página, fontes TTF (Calibri) e layout em colunas.
