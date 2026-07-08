import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Deliverables to render (order = submission order)
const files = [
  "deliverables/00_README_Index.md",
  "deliverables/01_Clarification_Questions.md",
  "deliverables/02_Solution_Vision.md",
  "deliverables/03_High_Level_Backlog.md",
  "deliverables/04_Key_Assumptions.md",
  "deliverables/05_Discovery_Workshops.md",
];

marked.setOptions({ gfm: true, breaks: false, headerIds: true, mangle: false });

// Render ```mermaid fenced blocks as <div class="mermaid"> (raw, unescaped) so
// Mermaid can turn them into SVG diagrams in the browser / headless PDF pass.
marked.use({
  renderer: {
    code(codeArg, infostring) {
      const text = typeof codeArg === "object" ? codeArg.text : codeArg;
      const lang = ((typeof codeArg === "object" ? codeArg.lang : infostring) || "").trim().split(/\s+/)[0];
      if (lang === "mermaid") return `<div class="mermaid">${text}</div>\n`;
      return false; // fall back to marked's default code rendering
    },
  },
});

const css = `
  :root{
    --brand:#0e5a8a; --brand-2:#0a3f61; --accent:#e0792b;
    --ink:#12212b; --muted:#5b6b76; --line:#d8e0e6; --soft:#f4f7f9;
  }
  *{box-sizing:border-box}
  html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--ink);line-height:1.5;margin:0;font-size:10.5pt}
  .page{max-width:820px;margin:0 auto;padding:32px 40px}
  h1{font-size:23pt;color:var(--brand-2);line-height:1.15;margin:0 0 .3rem;border-bottom:3px solid var(--brand);padding-bottom:.35rem}
  h2{font-size:15pt;color:var(--brand-2);margin:1.5rem 0 .5rem;padding-top:.2rem;border-top:1px solid var(--line)}
  h3{font-size:11.5pt;color:var(--brand);margin:1rem 0 .3rem}
  p{margin:.4rem 0}
  a{color:var(--brand);text-decoration:none}
  code{background:var(--soft);padding:.05rem .3rem;border-radius:4px;font-size:.9em;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
  ul,ol{margin:.3rem 0 .6rem;padding-left:1.3rem}
  li{margin:.15rem 0}
  strong{color:var(--brand-2)}
  blockquote{margin:.6rem 0;padding:.5rem .9rem;background:var(--soft);border-left:4px solid var(--accent);color:var(--ink);border-radius:0 6px 6px 0}
  blockquote p{margin:.2rem 0}
  hr{border:none;border-top:1px solid var(--line);margin:1.4rem 0}
  table{width:100%;border-collapse:collapse;margin:.6rem 0;font-size:9pt}
  th,td{border:1px solid var(--line);padding:.35rem .5rem;text-align:left;vertical-align:top}
  th{background:var(--brand);color:#fff;font-weight:600}
  tr:nth-child(even) td{background:var(--soft)}
  h2,h3{break-after:avoid-page;page-break-after:avoid}
  table,blockquote,pre{break-inside:avoid;page-break-inside:avoid}
  tr{break-inside:avoid;page-break-inside:avoid}
  @page{size:A4;margin:16mm 14mm}
  @media print{.page{max-width:none;margin:0;padding:0}a{color:var(--ink)}.noprint{display:none}}
  .noprint{position:fixed;top:10px;right:10px;background:var(--brand);color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:12px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.15)}
  .mermaid{display:flex;justify-content:center;margin:1rem 0;background:var(--soft);border:1px solid var(--line);border-radius:8px;padding:14px}
  .mermaid svg{max-width:100%;height:auto}
  .mermaid,figure{break-inside:avoid;page-break-inside:avoid}
  img{max-width:100%;height:auto;display:block;margin:1rem auto;border:1px solid var(--line);border-radius:8px}
  p:has(> img){break-inside:avoid;page-break-inside:avoid}
`;

const mermaidScript = `
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  mermaid.initialize({
    startOnLoad: false, theme: "base", securityLevel: "loose",
    flowchart: { useMaxWidth: true, htmlLabels: false, curve: "basis" },
    themeVariables: {
      primaryColor: "#eaf2f8", primaryBorderColor: "#0e5a8a", primaryTextColor: "#12212b",
      lineColor: "#0e5a8a", fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif", fontSize: "14px",
    },
  });
  // Render each diagram explicitly with a UNIQUE id via mermaid.render() rather
  // than the batch mermaid.run(). run() was misplacing diagrams (one rendered
  // into another's container, leaving overlapping/empty boxes). Rendering one
  // at a time into its own element is deterministic.
  async function renderAll() {
    const nodes = Array.from(document.querySelectorAll(".mermaid"));
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i];
      const code = (el.textContent || "").trim();
      if (!code) continue;
      try {
        const { svg, bindFunctions } = await mermaid.render("mmd-" + i, code);
        el.innerHTML = svg;
        if (bindFunctions) bindFunctions(el);
      } catch (e) {
        console.error("mermaid render failed for #" + i, e);
      }
    }
  }
  try { await renderAll(); } catch (e) { console.error(e); }
  window.__diagramsReady = true;
</script>`;

function render(mdPath) {
  const abs = resolve(root, mdPath);
  const md = readFileSync(abs, "utf8");
  const body = marked.parse(md);
  const title = (md.match(/^#\s+(.+)$/m)?.[1] || basename(mdPath)).replace(/[#*`]/g, "").trim();
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>${css}</style>
</head>
<body>
<button class="noprint" onclick="window.print()">Save as PDF ⌘/Ctrl+P</button>
<div class="page">
${body}
</div>
${md.includes("```mermaid") ? mermaidScript : ""}
</body>
</html>`;
  const outPath = abs.replace(/\.md$/, ".html");
  writeFileSync(outPath, html, "utf8");
  return outPath;
}

for (const f of files) {
  const out = render(f);
  console.log("Wrote " + out);
}
console.log("Done: " + files.length + " HTML files.");
