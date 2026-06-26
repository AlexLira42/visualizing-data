# Dashboard Patterns — single-glance operational UIs

For dashboards a manager scans repeatedly («посмотрел раз — всё ясно»). Codifies patterns proven in production АРМ/dashboards. Pairs with `annotation-patterns.md` and the verdict idea from `zelazny-message-framework.md`.

---

## 1. The verdict-first layout (inverted pyramid)
Top → bottom, decreasing urgency:
1. **Verdict line** — one sentence, the whole-screen takeaway, colored by status (`🔴/🟠/✅`). Built from live data, not static.
2. **Hero KPI row** — 3–5 big numbers, each with a **status sub-label** that states the conclusion («инцидент-режим (>150)», «не в работе»), not just a unit.
3. **Detail panels** — the evidence behind the KPIs (lists→bars, composition→stacked).
4. **Footnotes** — definitions, legend, source, «обновлено HH:MM».

The reader gets the answer in row 1; rows 2–4 are for those who want the why.

## 2. Status-verdict, not raw color
- Define a **4-status semantic palette**: норма (blue) · следить (amber) · действовать (magenta) · хорошо (teal). Avoid red/green.
- Every status must be **dual-encoded**: color + word/icon (colorblind + scan-ability).
- A KPI shows a number **and** a verdict label («24 на офлайн-столах»), so it reads without thinking.

## 3. Make magnitudes visible
- List of categories with counts → **bars** (length encodes the number); sort by value for rankings. Equal-weight text rows hide the outlier.
- A breakdown of a whole → **100% stacked bar**; order segments by criticality (most critical at one consistent edge) and add an axis hint («← спокойнее · критичнее →»).
- Reconcile sub-totals to the headline number («классифицировано 17 из 175 · прочие 158») so users trust it.

## 4. The 5-second test
Show the dashboard for 5 seconds, then ask: «what needs action right now?» If they can't answer, the verdict/hero layer is failing — strengthen it before adding charts.

## 5. Freshness & trust
- Always show **«обновлено HH:MM»** and the data source/scope in the subtitle.
- **Per-block rule:** *every block/panel that is NOT controlled by a period/time filter MUST carry its own «обновлено …» timestamp* (in its header, right-aligned). A block that already exposes a date/period filter shows the **selected period** instead — that filter is the freshness signal, a separate «обновлено» would be redundant. So each panel answers either «за какой период» (filtered) or «обновлено когда» (live snapshot) — never neither.
- **Timezone must be explicit.** Print the user's business timezone (e.g. `обновлено: 26.06.2026 09:46 (МСК)`), never bare server/UTC time. Generate the timestamp in that zone at the source (`datetime.now(tz=MSK)`), not `datetime.now()` — the latter silently emits server-local/UTC and shows the wrong hour.
- If data can be stale, surface it (gray «нет данных за …», or a staleness badge). Silent staleness erodes trust faster than a missing number.

## 6. Drill-down & interaction (when interactive)
- Every panel header → **«открыть →»** to the full screen (overview = entry point, not the analysis).
- Tooltips: one shared fixed-position element; show the full breakdown on hover; never rely on hover for the primary read (must work on a glance/print).
- Cross-filter only if it earns its complexity; default to clear static panels.

## 7. Responsive & performance
- KPI row: `repeat(N,1fr)` → collapse to 2-up / 1-up at narrow widths.
- Charts: `viewBox` + `width:100%`; read `clientWidth` for full-width.
- SVG up to ~1k marks; aggregate server-side beyond (see `performance.md`).

---

## Anti-patterns
- ❌ A wall of equal KPI tiles with no verdict — reader must compute the conclusion.
- ❌ Status by color alone; red/green pairing.
- ❌ Lists where a 96 and a 0 look equally weighted (use bars).
- ❌ Sub-panels that don't reconcile to the headline number.
- ❌ No «обновлено» / source → users can't trust or time-box it.
- ❌ An unfiltered block with neither «обновлено» nor a period — reader can't tell how fresh it is.
- ❌ Bare timestamp without timezone, or server/UTC time labeled as local (МСК).
- ❌ Primary insight hidden behind a hover tooltip.

## Ship checklist
- [ ] One verdict line at top, status-colored, from live data, dual-encoded.
- [ ] Hero KPIs each carry a conclusion sub-label.
- [ ] Lists→bars; composition→ordered 100% stack with axis hint.
- [ ] Sub-totals reconcile to the headline.
- [ ] Every unfiltered block carries «обновлено HH:MM (TZ)»; filtered blocks show the selected period instead.
- [ ] Timestamps generated in the business timezone (МСК), not server/UTC; TZ printed.
- [ ] Passes the 5-second «what needs action?» test.
