// Variáveis CSS do shadcn/ui (Nova preset) em formato seguro para o html2canvas.
// O html2canvas 1.4.x não suporta oklch()/lab() — por isso resetamos todos os
// custom properties para hex/rgba antes de capturar.
const SAFE_CSS_VARS = `
  :root, * { color-scheme: light !important; }
  html, body {
    background: #ffffff !important;
    color: #000000 !important;
  }
  :root {
    --background: #ffffff;
    --foreground: #171717;
    --card: #ffffff;
    --card-foreground: #171717;
    --popover: #ffffff;
    --popover-foreground: #171717;
    --primary: #171717;
    --primary-foreground: #fafafa;
    --secondary: #f5f5f5;
    --secondary-foreground: #171717;
    --muted: #f5f5f5;
    --muted-foreground: #737373;
    --accent: #f5f5f5;
    --accent-foreground: #171717;
    --destructive: #ef4444;
    --destructive-foreground: #fafafa;
    --border: #e5e5e5;
    --input: #e5e5e5;
    --ring: #171717;
    --radius: 0.5rem;
    --chart-1: #e67e22;
    --chart-2: #2ecc71;
    --chart-3: #3498db;
    --chart-4: #9b59b6;
    --chart-5: #f39c12;
    --sidebar: #f5f5f5;
    --sidebar-foreground: #171717;
    --sidebar-primary: #171717;
    --sidebar-primary-foreground: #fafafa;
    --sidebar-accent: #e5e5e5;
    --sidebar-accent-foreground: #171717;
    --sidebar-border: #e5e5e5;
    --sidebar-ring: #171717;
  }
`;

export async function generateSimuladoPDF(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;

  await html2pdf()
    .set({
      margin: [0, 0, 0, 0], // margens no CSS; aqui 0 para a capa ir borda-a-borda
      filename: `${filename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc: Document) => {
          // 1. Remove todos os stylesheets externos e <style> tags que contenham
          //    oklch()/lab() — Tailwind v4 e shadcn/ui os usam extensivamente.
          clonedDoc
            .querySelectorAll('link[rel="stylesheet"], style')
            .forEach((el) => el.remove());

          // 2. Injeta variáveis CSS seguras (hex/rgba) para que qualquer
          //    propriedade herdada resolva para formatos que o html2canvas entende.
          const safeStyle = clonedDoc.createElement("style");
          safeStyle.textContent = SAFE_CSS_VARS;
          clonedDoc.head.appendChild(safeStyle);

          // 3. Converte todos os elementos <svg> em <img> com data URL.
          //    O html2canvas tenta parsear estilos computados do SVG (inclusive
          //    cores herdadas do documento em lab()/oklch()) e lança erro fatal.
          //    Substituir por <img> evita esse parsing inteiramente.
          clonedDoc.querySelectorAll("svg").forEach((svg) => {
            const serializer = new XMLSerializer();
            const svgStr = serializer.serializeToString(svg);
            const img = clonedDoc.createElement("img");
            img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
            const w = svg.getAttribute("width");
            const h = svg.getAttribute("height");
            if (w) img.style.width = `${w}px`;
            if (h) img.style.height = `${h}px`;
            img.style.display = svg.style.display || "block";
            svg.parentNode?.replaceChild(img, svg);
          });
        },
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(element)
    .save();
}

export function buildFilename(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
