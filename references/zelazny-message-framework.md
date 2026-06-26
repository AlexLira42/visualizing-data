# Zelazny Message-Driven Framework

Source: Gene Zelazny, *Say It With Charts* (рус. «Говори на языке диаграмм», 6-е изд., МИФ 2016). Director of Visual Communications, McKinsey & Company.

This is the **conceptual layer** that sits *before* chart-type mechanics. The rest of this skill (libraries, accessibility, performance) answers "how to draw it". Zelazny answers "what to say and which form fits the message".

---

## The 3-step pipeline

```
DATA  →  1. MESSAGE  →  2. COMPARISON  →  3. CHART TYPE
```

Never start at the chart. The chart type is determined **not by the data** (dollars, %, units) but by **your message** — the one point you want the audience to take away.

> "Выбирать тип диаграммы, не сформулировав окончательно идею, — это всё равно что подбирать предметы гардероба по цвету с закрытыми глазами."

### Step 1 — Message (от данных к идее)

The same table yields many possible messages. Decide which single aspect matters, then write it as **one declarative sentence** (a claim, not a topic).

The same data ("sales by product Jan–May") can carry different messages depending on emphasis:
- "Sales grew steadily from January" (look down a column → time)
- "In May, product A far outsold B and C" (look across a row → position)
- "In May, product A had the largest share of total" (share of total → component)

### Step 2 — Comparison (от идеи к сравнению)

Every message maps to exactly **one of five comparison types**. See the detector below.

### Step 3 — Chart type (от сравнения к диаграмме)

Each comparison maps to a default chart form via the 5×5 matrix below.

---

## The "message = title" rule (most important takeaway)

The chart title must state the **conclusion**, not the **topic**. A topic title hides your point and forces the reader to guess.

| ❌ Topic title (describes data) | ✅ Message title (states the point) |
|---|---|
| Динамика объёма продаж компании | Объём продаж компании удвоился |
| Производительность по регионам | Центральный регион — четвёртый по производительности |
| Распределение активов по подразделениям | В подразделении Б сконцентрировано 30% активов |
| Возрастная структура штата | Большинству сотрудников от 35 до 45 лет |
| Соотношение зарплаты и рентабельности | Связи между зарплатой и рентабельностью нет |

Rule: an action/message title reads like a newspaper headline — short, sharp, makes a claim. If you can't write one, you haven't found your message yet — don't pick a chart.

**One chart = one message.** If a slide makes two points, it needs two charts.

---

## Comparison-type detector (by keywords)

| # | Comparison (RU / EN) | What it shows | Trigger words |
|---|---|---|---|
| 1 | **Покомпонентное** / Component | Each part as **% of a whole** | «доля», «процент от целого», «составило X%», "share", "% of total", "half/quarter of" |
| 2 | **Позиционное** / Item (Position) | How items **rank** vs each other (=, >, <) | «больше/меньше/равно», «на N-м месте», "ranks", "largest", "smallest", "more/less than" |
| 3 | **Временное** / Time-series | How a metric **changes over time** | «рос/снижался/колебался», «изменялся», "grew", "declined", "fluctuated", "trend", "over years/quarters" |
| 4 | **Частотное** / Frequency | **How many items fall into value ranges** | «в диапазоне от X до Y», «концентрация», «распределение», "distribution of", "concentration", "X to Y range" |
| 5 | **Корреляционное** / Correlation | Whether two variables are **related** | «зависит от / не зависит», «возрастает при», «связь между», "varies with", "(in)dependent of", "relationship between" |

Quick summary:
- Component — % of a whole
- Item/Position — ranking of items
- Time — change over time
- Frequency — count of items in intervals
- Correlation — relationship between two variables

---

## The 5×5 selection matrix (comparison → chart)

| Comparison | Default chart | When / variant |
|---|---|---|
| **Component** | **Pie** (round) | Single moment, ≤6 slices. For comparing structures of 2+ wholes → 100% stacked bars |
| **Item / Position** | **Bar** (horizontal) | Sort bars by value to show ranking; deviation bars to show gaps |
| **Time-series** | **Column** if few points (≤6–7); **Line** if many | Columns emphasise discrete periods; line emphasises movement |
| **Frequency** | **Column histogram** if few bins; **Line (curve)** if many | Histogram for a handful of intervals; curve for a smooth distribution |
| **Correlation** | **Paired bars** if few items; **Scatter** if many | Two opposed bar series, or X/Y dots; trend implied vs counter-trend |

Zelazny's chart-mix opinion (use as a sanity check on your own deck):
- **Pie ≈ 5%** of charts — overused; least practical; reserve for clean part-to-whole.
- **Bar ≈ 25%** — most flexible and underused; default when in doubt.
- **Column + Line ≈ 50%** — the workhorses.
- **Scatter ≈ 10%** — looks intimidating, but right for correlation with many points.
- Remaining ~10% are combinations.

---

## Pie-chart construction rules

- **≤6 components.** More than that → keep top 5, group the rest as "Other".
- **Most important slice at 12 o'clock**, running clockwise (the eye starts there).
- Emphasise the key slice with the **strongest contrast** (e.g. dark/bright); if nothing to single out, use one uniform fill.
- If form fights content (decorative pie obscures the relationship) you do the reader a disservice.

---

## Presentation vs Document (2× simpler, 4× clearer)

A chart for **presentation** (projected, glanced at) must be **at least 2× simpler and 4× clearer** than the same chart in a **written report** (read at a desk, reread at will). It is like a billboard read at speed, not a page studied.

Practical simplification when moving report → slide:
- One message per chart; cut secondary series.
- Replace data-dump tables with the single comparison that carries the point.
- Action title; drop the legend if direct labels work.
- Round numbers; remove gridline/decimal noise.
- Large type; high contrast.

> "Слайды должны быть понятны даже без присутствия консультанта."

---

## Visual concepts & metaphors (for *qualitative* ideas)

Charts handle **quantitative** messages. For **conceptual / non-numeric** ideas (process, sequence, barriers, interaction, balance) Zelazny uses **visual concepts** and **metaphors** instead of data charts.

**Visual concepts** — abstract diagrams of an idea:
- Horizontal movement (progress, timeline, flow A→B)
- Vertical movement (growth, hierarchy, rise/fall)
- Circular movement (cycle, feedback loop)
- Interaction (two-way arrows, meshing gears)
- Driving forces / leverage / balance (fulcrum, scales)
- Penetration / barriers (breaking through, filters/screens)
- Interrelationships, processes, segmentation

**Visual metaphors** — borrow a familiar image to carry the idea: games, sports, mazes, optical illusions, stairs/ladders, ropes, punctuation, drops/splashes, road in/out, near–far.

Guardrails:
- Use a metaphor only if it **clarifies** the relationship; never let decoration obscure content.
- A concept diagram is not a data chart — don't fake precision it doesn't have.
- Keep it as simple as the idea: one concept per visual.

---

## Master-class heuristics (Part 4) — when a chart underwhelms

1. **Лучше упростить** — remove everything not serving the message.
2. **Лучше показать больше** — sometimes the fix is *more* context/comparison, not less.
3. **Лучше сделать по-другому** — switch comparison/chart type entirely.
4. **Лучше проявить изобретательность** — a concept/metaphor may beat a literal chart.

Run these in order when a draft "technically correct" chart still doesn't land.

---

## How this layers onto the rest of the skill

1. Write the **message sentence** (this file).
2. Detect the **comparison type** (keyword table).
3. Pick the **default chart** (5×5 matrix) — then refine with `selection-matrix.md` decision trees for series count, audience, performance.
4. Implement with the language libraries; apply `accessibility.md` and `color-systems.md`.
5. Title the chart with the **message**, not the topic.
