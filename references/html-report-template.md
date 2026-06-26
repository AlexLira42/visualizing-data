# Shareable Single-File HTML Report

A **self-contained `.html`** report: one file, zero dependencies, inline `<style>` + vanilla-JS SVG charts. Opens by double-click, hosts as a static file, and survives email/Slack/Drive without a build step.

> Use for: live dashboards, prototypes for comparison, exec read-outs, anything that must be **shared as a link or file** and **render offline**. For a formatted Word deliverable use `statistical-reports-docx.md` instead.

---

## Why single-file

- **Portable:** no `node_modules`, no CDN — works offline, behind VPN, in an email attachment.
- **Reviewable:** the whole report is one diff; easy to version in git.
- **Deployable:** drop into nginx/Railway static root; or `open file.html` locally.
- **Accessible & crisp:** SVG scales, supports `aria-label`, prints well.

Trade-off: not for >10k data points per chart (use Canvas/WebGL or pre-aggregate — see `performance.md`).

---

## Structure (top → bottom)

1. **Header** — report title + context line (scope, «обновлено HH:MM», data source).
2. **Verdict / hero line** — the single takeaway as one sentence (Zelazny), colored by status. (Optional KPI row.)
3. **Message-titled sections** — one chart per section; section heading = the chart's *conclusion*, not its topic.
4. **Footnotes** — definitions, source, methodology, palette note.

Each chart = one message. If a section needs two points, it needs two charts.

---

## Technical constraints (checklist)

- [ ] Single file; `<style>` inline; no external JS/CSS/fonts (system font stack).
- [ ] Charts as **inline SVG** built with one `el()` helper (below). No chart library.
- [ ] Color via CSS variables; **IBM colorblind-safe** palette (`#648FFF #785EF0 #DC267F #FE6100 #FFB000`). Reuse a project `tokens.css` if one exists.
- [ ] Every chart: `role="img"` + `aria-label` stating the message. Meaning never by color alone (labels/shapes too).
- [ ] Numbers rounded to decision precision; reference/threshold lines **labeled with their value**.
- [ ] Responsive: `viewBox` + `width:100%`; read `clientWidth` for full-width charts.
- [ ] Tooltip = one fixed-position `<div>`; transparent hover-zones over bars/points.
- [ ] Works on `file://` AND when served — if it loads assets (e.g. `tokens.css`), **serve from the file's own docroot** or assets 404.

---

## Minimal skeleton (copy-paste)

```html
<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Отчёт</title>
<style>
  :root{--bg:#0a0e16;--card:#0f1117;--line:#1e2535;--ink:#f8fafc;--mut:#94a3b8;
        --blue:#648FFF;--purple:#785EF0;--magenta:#DC267F;--orange:#FE6100;--yellow:#FFB000;--neutral:#7f8db0}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif}
  .wrap{max-width:1240px;margin:0 auto;padding:28px 22px}
  .msg{font-size:19px;font-weight:800;margin:0 0 2px}      /* заголовок = вывод */
  .sub{font-size:13px;color:var(--mut);margin:0 0 14px}
  .panel{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;margin-top:18px}
  svg{display:block;width:100%}
</style></head>
<body><div class="wrap">
  <h1 class="msg" style="font-size:24px">Заголовок-вывод отчёта</h1>
  <div class="sub">контекст · источник · обновлено 08:42</div>
  <section class="panel">
    <div class="msg">Сообщение этого графика (вывод, не тема)</div>
    <div id="chart1"></div>
  </section>
</div>
<script>
const NS='http://www.w3.org/2000/svg';
const el=(n,a,t)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);if(t!=null)e.textContent=t;return e;};
const C={blue:'#648FFF',magenta:'#DC267F',neutral:'#7f8db0',line:'#2a3650',dim:'#6b7890',goal:'#FFB000'};

function barChart(hostId,rows,opt={}){           // Item comparison → горизонтальные бары
  const host=document.getElementById(hostId);
  const W=Math.max(host.clientWidth||720,420),H=rows.length*30+24,pl=120,pr=44;
  const max=Math.max(1,...rows.map(r=>r.v));
  const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':opt.aria||'bar chart'});
  rows.forEach((r,i)=>{const y=12+i*30,w=(W-pl-pr)*r.v/max;
    svg.appendChild(el('text',{x:pl-8,y:y+14,fill:C.dim,'font-size':12,'text-anchor':'end'},r.label));
    svg.appendChild(el('rect',{x:pl,y:y+3,width:Math.max(2,w),height:16,rx:4,fill:r.color||C.blue}));
    svg.appendChild(el('text',{x:pl+w+6,y:y+15,fill:'#cbd5e1','font-size':12,'font-weight':700},r.v});
  });
  host.appendChild(svg);
}
// barChart('chart1',[{label:'A',v:96,color:C.magenta},{label:'B',v:19}],{aria:'A=96, B=19'});
</script></body></html>
```

Extend with: stacked bars (Component), sparkline + reference line (Time, label the average/goal value), waterfall (composition), paired bars (correlation). See the live examples produced under this skill's session work (funnel-dashboard / ticket-ops overview prototypes).

---

## Sharing / deploy

- **Local review:** `open report.html` (macOS) — `file://` is fine if no external assets.
- **Preview a page that loads assets:** start a static server **from the docroot that contains the asset** (`cd public && python3 -m http.server`), else `tokens.css`/images 404.
- **Host:** copy the file into an nginx/static root (e.g. Railway single-file image, `try_files $uri /index.html`). Push to the repo's deploy branch only with the owner's confirmation.
- **Auto-updating data:** keep the report a static shell whose data globals are rewritten by a refresh job/commit; the chart code stays stable.

---

## Accessibility & quality gate (run before sharing)
- [ ] Each chart has `aria-label` = its message; data-table fallback for key tables.
- [ ] Colorblind-safe; passes a deuteranopia check; no meaning by color alone.
- [ ] Verdict/title states the conclusion; numbers rounded; reference lines labeled.
- [ ] Renders with no console errors; responsive at narrow widths.
