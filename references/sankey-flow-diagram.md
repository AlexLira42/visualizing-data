# Sankey Flow Diagram — where items end up across steps

A multi-stage flow chart in the style of Intercom's **"How you're handling conversations"** report: every item flows from the entry node through who handled it (AI agent, chatbot, teammate) to how it ended. Node height and band width are proportional to the number of items.

- **Renderer:** `assets/sankey/sankey.js` — no dependencies, inline SVG, dark/light via CSS variables.
- **Demo:** `examples/html/sankey-conversations.html` — support conversations and a sales-lead path, dark/light, hover, keyboard.

---

## When to use

✅ The message is about **where the volume goes** through 2–6 steps, with splits and merges:
- support: entry → AI agent / chatbot / teammate → resolved / escalated / closed by whom;
- sales leads: lead → taken → reached → offer → paid, with the reason for every loss;
- ticket or order routing; payment attempts (method → approved / declined → retried another way).

❌ Use something else:

| Situation | Instead |
|---|---|
| Linear funnel: each step is a subset of the previous one, no reasons for the drop | Horizontal bar funnel with step-to-step conversion |
| The point is an exact value or a small difference (2% vs 3%) | Sorted bars or a table — band widths hide small differences |
| Items loop back (reopened, returned to the queue) | Model the repeat as a new node in a later column, or use a state-transition matrix |
| How the split changes over time | Small multiples of end-state shares or a 100% stacked bar per week |
| More than ~30 nodes, more than 6 steps, many flows under 1% | Aggregate into «Другое» or split into two charts |

---

## Message first

- **Title = the dominant flow or the biggest loss**, computed from the same data object as the chart, never typed: «ИИ-агент сам решает 55% обращений, сотрудник закрывает 29%».
- **Subtitle = period, unit, what % means**: «обращения за 7 дней · % — от всех 1 000 обращений».
- **Emphasize the path behind the title**: `highlight: [nodeId]` keeps its flows bright and softly dims the rest.
- **Check the rounding when the title sums several nodes.** Labels 28% + 2% next to a title «29%» look like an error. Show the absolute number or pick data/rounding that agree.

---

## Data model

```js
{
  nodes: [{ id, label, group, color?, column?, value? }],  // label may contain **bold** parts
  links: [{ source, target, value }]
}
```

- **Node = state at a step.** «Сотрудник ответил» after the chatbot and after an escalation are different nodes: different `id`, same `label`, same color. Merging them creates false merges or a cycle.
- **Link = how many items moved from A to B.** One unit (conversations, not messages), one period, one cohort: items that entered in the period, followed to their current state. Say so in the subtitle.
- **Conservation.** Every middle node must pass on what it receives (in = out). Items that stop there (still open, no data yet) get an explicit end node («Ещё открыто», «Нет данных»), otherwise the loss is invisible. The renderer warns in the console: `"X": in 197 ≠ out 180 — 17 stop here without a flow`.
- **Columns.** Default `align: 'left'`: column = step number (longest path from the entry), and end states stay at the step where they happen, as in Intercom. `align: 'justify'` moves every end state to the last column; use it when the message is only about final outcomes.
- **No cycles, no right-to-left links.** The renderer throws on both.
- **From raw events** (one row per item and step): build per-item paths and pass them to `Sankey.fromPaths()`. Node ids become `"<step>:<state>"`, so repeated states stay separate.

```js
const data = Sankey.fromPaths([
  { steps: ['Заявки', 'Взяли в работу', 'Не дозвонились'], value: 380 },
  { steps: ['Заявки', 'Взяли в работу', 'Контакт', 'Подборка', 'Оплатил'], value: 90 }
], { groups: { 'Заявки': 'root', 'Не дозвонились': 'escalated', 'Оплатил': 'resolved' } });
```

```python
# pandas: events(item_id, step_no, state) → links for the renderer
paths = (events.sort_values(['item_id', 'step_no'])
               .groupby('item_id')['state'].agg(tuple)
               .value_counts())
links = {}
for steps, v in paths.items():
    for i in range(1, len(steps)):
        key = (f"{i-1}:{steps[i-1]}", f"{i}:{steps[i]}")
        links[key] = links.get(key, 0) + int(v)
data = {
    "nodes": [{"id": n, "label": n.split(":", 1)[1]} for n in dict.fromkeys(k for pair in links for k in pair)],
    "links": [{"source": s, "target": t, "value": v} for (s, t), v in links.items()],
}
```

---

## Visual spec

| Element | Rule |
|---|---|
| Node | Bar 12–16 px wide, height ∝ value, at least 2 px; vertical gap ≥ label height (≈30 px) |
| Label | Right of the node, two lines: «298 (55%)» in bold, then the state with the actor in bold — `Закрыто **сотрудником**` |
| % | Of the total entry volume on every label. % of the source node only in the tooltip — never mix the two bases on labels |
| Flow | Filled band, horizontal S-curve, gradient from the source color to the target color, opacity ≈0.35–0.45; tiny flows at least 1 px |
| Color | By meaning (`group`), not one color per node; the same label keeps the same color in every column |
| Order | Inside a column by meaning (success on top, losses next, manual work at the bottom) and fixed between periods — `order: 'input'`. `order: 'auto'` reorders to reduce crossings; use it for exploration only |
| Legend | Short, fixed group order, above the chart; node labels already carry the meaning |

Semantic groups — `Sankey.PALETTE`. IBM base plus mint and slate; losses are magenta, not red, so there is no red/green pair. Checked by simulating protanopia, deuteranopia and tritanopia: outcome groups stay at least 18 ΔE apart. The closest pair is `ai`/`bot` (≈13 ΔE for deuteranopia), so the bold actor name in the label carries that difference.

| group | color | meaning |
|---|---|---|
| `root` | `#7f8db0` | entry, total |
| `ai` | `#785EF0` | AI agent |
| `bot` | `#648FFF` | rule-based bot, automation, workflow |
| `human` | `#FFB000` | teammate, manual work |
| `escalated` | `#DC267F` | escalation, constraint, loss |
| `resolved` | `#47C98F` | resolved, closed, sold |
| `pending` | `#9AA3B2` | waiting, declined, unknown |

---

## Quick start (single-file HTML)

```html
<div id="flow"></div>
<script>/* paste the contents of assets/sankey/sankey.js here */</script>
<script>
Sankey.render('#flow', {
  nodes: [
    { id: 'all', label: 'Обращения', group: 'root' },
    { id: 'bot', label: '**Чат-бот** ответил', group: 'bot' },
    { id: 'bot-closed', label: 'Закрыто **чат-ботом**', group: 'resolved' },
    { id: 'tm', label: '**Сотрудник** ответил', group: 'human' }
  ],
  links: [
    { source: 'all', target: 'bot', value: 356 },
    { source: 'bot', target: 'bot-closed', value: 158 },
    { source: 'bot', target: 'tm', value: 198 }
  ]
}, { ariaLabel: 'Чат-бот сам закрывает 44% своих обращений' });
</script>
```

**Main options:** `align` ('left' | 'justify'), `order` ('input' | 'auto'), `highlight` (node ids), `total` (base for %), `linkColor` ('gradient' | 'source' | 'target' | CSS color), `palette` (group overrides), `width` / `height` / `minWidth`, `table`, `tooltip`, `ariaLabel`, `locale` ('ru' | 'en', default from `<html lang>`), `format`.

**Theme** — CSS variables on the page: `--sankey-ink`, `--sankey-muted`, `--sankey-halo` (= panel background; keeps labels readable over flows), `--sankey-link-opacity`, `--sankey-tip-bg`, `--sankey-tip-ink`, `--sankey-tip-line`, `--sankey-line`. The demo has a dark and a light set.

**`Sankey.layout(data, options)`** is pure (no DOM). Use it to compute title numbers from the same values the chart draws, and to test the data in Node.

---

## Interaction & accessibility

- Hover or focus a node → its flows stay, the rest dims; hover a flow → «A → B · 198 · 20% от всех · 56% от «A»».
- Tab moves across nodes, Esc clears; a tap pins the highlight on touch screens.
- The message never lives only in a tooltip: title and labels carry it.
- Interactive SVG → `role="group"` with `aria-label` = message; each node is `role="img"` with its value and %. A `<details>` data table lists every flow.
- Narrow screens: text stays 12 px and the chart scrolls horizontally instead of shrinking.

---

## Python alternatives

- **Plotly:** `go.Sankey(arrangement="snap", node=dict(label=labels, color=colors, x=xs, y=ys, pad=15), link=dict(source=src_idx, target=tgt_idx, value=values))` — `source`/`target` are indices into the node list; set node `x` by step to keep the columns. Labels are single-line, so the two-line value + state label needs `customdata`/hover.
- `matplotlib.sankey` draws a different diagram (a single energy-balance flow). Don't use it for multi-stage flows.

---

## Verification checklist

- [ ] No console warnings: every middle node balances; the sum of entry nodes equals the total in the subtitle.
- [ ] Title and subtitle numbers come from the same data object as the chart (`Sankey.layout`).
- [ ] Labels don't overlap and nothing is clipped on the right — check text bounding boxes pairwise in a headless browser.
- [ ] Both themes readable (labels over flows); deuteranopia check — groups distinguishable, meaning also in text.
- [ ] The highlighted path is the one the title talks about.
- [ ] Desktop and ~390 px width: horizontal scroll, text stays 12 px.
- [ ] Node order is the same across periods — two weeks side by side, nodes don't jump.

## Pitfalls

- ❌ Mixed % bases on labels (of total and of parent) — readers add up the wrong numbers.
- ❌ A node that silently loses volume (in > out) — the chart looks complete when it isn't.
- ❌ The same state at different steps merged into one node — a false merge or a cycle.
- ❌ Dozens of sub-1% flows — spaghetti; aggregate them.
- ❌ Two Sankeys with different totals side by side — band widths aren't comparable; compare end-state shares as bars.

---

*Last updated: 2026-11-19*
