# Critique & Review Mode

Structured rubric for **evaluating an existing chart, dashboard, or report** — the inverse of the generative workflow. Use it to score a visualization, find what's wrong, and prescribe fixes.

> When the user says: «найди косяки в графике», «отревьюй дашборд», «что не так с этой визуализацией», «critique this chart», «review the viz», «улучши этот график» — run this rubric.

For broad adversarial review of an analysis/decision (not the chart itself), hand off to the **`critical-review`** skill. This file is specifically about the *visualization*.

---

## How to run

1. **Restate the chart's apparent message** in one sentence. If you can't, that's finding #1 (no message).
2. Score each of the **7 dimensions** below: `2` = good, `1` = partial, `0` = broken.
3. For every `0`/`1`, write a concrete **fix** (not just a complaint).
4. Output the **scorecard** + prioritized fixes (worst dimensions first).
5. If possible, **show the fix** (rebuild the chart) rather than only describing it.

Pass bar: a presentation chart should score **≥12/14** with **no zeros**. A zero on dimension 1 (message) or 5 (accessibility) blocks ship.

---

## The 7 dimensions

| # | Dimension | Score 2 (good) | Score 0 (broken) |
|---|---|---|---|
| 1 | **Message & title** | Title states the *conclusion*; one chart = one message | Topic title or no title; chart makes 2+ points |
| 2 | **Chart-type fit** | Comparison type → matching chart (see `selection-matrix.md`) | Wrong family (pie for trend, line for ranking) |
| 3 | **Encoding & perception** | Uses high-accuracy channels (position/length); y-axis from 0 or clearly marked | Truncated axis unmarked; dual-axis; 3D; area/angle for precise compare |
| 4 | **Labeling & context** | Axes+units+source; direct labels where they beat a legend; rounded numbers | Missing units/source; legend hunt; decimal noise |
| 5 | **Color & accessibility** | Colorblind-safe; ≥3:1 (UI) / 4.5:1 (text); color not the only cue; aria-label | Red/green only; low contrast; meaning by color alone |
| 6 | **Data-ink & chartjunk** | Every mark earns its place; quiet gridlines | Heavy grid, 3D shadows, redundant legends, decorative fills |
| 7 | **Storytelling & annotation** | Key point highlighted; reference/threshold lines; context muted | Flat, undifferentiated; reader must hunt for the point |

---

## Per-dimension checklist & fixes

### 1 — Message & title (most important)
- ❓ Can you write the takeaway as one declarative sentence? Is it the title?
- ❌ Topic title «Динамика продаж» → ✅ message title «Продажи удвоились за год».
- ❌ Slide makes two points → split into two charts.

### 2 — Chart-type fit
- Detect the comparison: component / item / time / frequency / correlation (`zelazny-message-framework.md`).
- Map to default chart; deviate only with reason.
- ❌ Pie with >6 slices → sorted bar. ❌ Line for categories → bar.

### 3 — Encoding & perception (Cleveland–McGill + Tufte)
- Accuracy ranking of visual channels: **position > length > angle/slope > area > color/shade**. Put the most important comparison on the most accurate channel.
- Truncated y-axis: only for indexed/zoomed series, and **mark the break**. Bars must start at 0.
- No dual y-axis (use small multiples). No 3D. No area to compare precise values.
- Tufte's **lie factor** ≈ 1: visual size of effect = numerical size.

### 4 — Labeling & context
- Axes labeled with units; data source + date present.
- Prefer **direct labels** on lines/bars over a separate legend when ≤ a few series.
- Round numbers to decision precision; kill trailing decimals and gridline clutter.

### 5 — Color & accessibility (WCAG 2.1 AA — `accessibility.md`, `color-systems.md`)
- Colorblind-safe palette (IBM: `#648FFF #785EF0 #DC267F #FE6100 #FFB000`). Avoid red/green pairing.
- Contrast: ≥3:1 non-text, ≥4.5:1 text (≥3:1 for ≥24px).
- Never encode meaning by **color alone** — add labels, icons, shapes, or position.
- `role="img"` + `aria-label` stating the message; offer a data-table alternative.

### 6 — Data-ink & chartjunk (Tufte)
- Maximize data-ink ratio: remove anything not encoding data (heavy borders, background fills, 3D, drop shadows, redundant value+axis+legend).
- Gridlines: faint and few, or replace with direct labels.

### 7 — Storytelling & annotation (`annotation-patterns.md`)
- Highlight the point: strongest contrast on the key element, **mute** the rest to gray.
- Add reference/threshold/target lines (goal, average, baseline) **labeled with their value**.
- One «so-what» caption near the focal point.

---

## Zelazny master heuristics (when a «technically correct» chart still underwhelms)
Run in order:
1. **Simplify** — remove everything not serving the message.
2. **Show more** — sometimes the fix is more context/comparison, not less.
3. **Do it differently** — switch comparison type / chart type.
4. **Get inventive** — a visual concept/metaphor may beat a literal chart.

---

## Output format

```
Сообщение графика (как читается): "<одно предложение или 'НЕ ЧИТАЕТСЯ'>"

Оценка: NN/14
1. Сообщение/заголовок ......... X/2  — <замечание + фикс>
2. Тип графика ................. X/2  — ...
3. Кодирование/восприятие ...... X/2  — ...
4. Подписи/контекст ............ X/2  — ...
5. Цвет/доступность ............ X/2  — ...
6. Data-ink/chartjunk .......... X/2  — ...
7. Сторителлинг/аннотации ...... X/2  — ...

Топ-3 правки (по влиянию):
1) ...
2) ...
3) ...
```

Then, if feasible, **rebuild the chart with the fixes applied** (don't stop at the critique).
