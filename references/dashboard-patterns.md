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

## 8. Live narrative — words must refresh with the numbers

An auto-refreshed dashboard rebuilds the **data** on every run, but any sentence written at build time stays as written. Within weeks the words contradict the numbers right next to them («после запуска доля выше» next to a share that fell). Rule: **every conclusion, status badge and state claim is computed from the same data it describes — or carries the date and source of the fact it states.**

Five ways narrative goes stale, and the fix for each:

| Mechanism | Example | Fix |
|---|---|---|
| Fixed sentence | headline typed as a string: «После запуска доля выше, а новый поставщик почти ни при чём» | build the sentence from data; branch the wording by direction **and** significance: «выросла / снизилась / почти не изменилась» |
| Number inside a fixed phrase | `'сдвиг +'+x` → «сдвиг +-0,10»; `'не просел'`; status literal `['yes','КАННИБАЛИЗАЦИИ НЕ ВИДНО']` | sign-aware formatter with a real minus «−»; verdict words and status badges computed from the same values by an explicit rule (threshold or test) |
| State from a manual date or flag | «off since date X; any event after X = on again» — late events flipped it back to «запущено, меряем эффект» | derive the state from activity (no events for N days → off since the last event); show the declared decision date as a separate label |
| Hardcoded position | annotations at fixed indices `[11,23]`; the series grew and the year-ago label landed under the wrong month | locate by key (`rows.findIndex(r => r.key === prevKey)`); place paired labels by which value is higher, so they never collide |
| Fact from outside the data | partner export figures, process status («рассылки нет») | date + source in the same sentence («по выгрузке партнёра за 01–12.11 — 36 из 109»); show it as stale after N days (e.g. 30) |

Two related rules:
- **Comparable tiles.** Tiles that compare entities (providers, channels, teams) show the same metric, over the same period, in the same definition, and the chart row under them uses that metric too. ❌ «A: продаж в день за 104 дня» next to «B: заявок в день за 105 дней».
- **Totals from the parts as displayed.** A sum in a headline is computed from the rounded parts shown in the tiles. ❌ «добавили 0,64 пп» next to tiles 0,52 + 0,13.

Helpers (JS):
```js
const sg=(v,f=x=>x.toFixed(2).replace('.',','))=>(v>0?'+':v<0?'−':'')+f(Math.abs(v));   // real minus
const plural=(n,one,few,many)=>{n=Math.abs(n);const a=n%10,b=n%100;
  return a===1&&b!==11?one:a>=2&&a<=4&&(b<10||b>=20)?few:many;};
const verb=(d,p)=>p>=0.05?'почти не изменилась':d>0?'выросла':'снизилась';             // p — two-proportion test
const idle=(Date.parse(lastDay)-Date.parse(lastEvent))/864e5;                           // state by activity
const offSince=declared&&lastEvent<=declared?declared:(idle>=7?lastEvent:null);
```

**Verify — not with grep.** The narrative is rendered client-side, so grepping the built HTML checks the script, not the text. Render the page with real data in a headless browser (Playwright), dump every headline, note, KPI tile, status badge and table, and read each one against the numbers. After deploy: old phrases on the live URL = 0, new ones ≥ 1. Re-check `<text>` overlaps at 1440/1024/390 — computed labels move.

**When to audit.** On every data-regime change (launch, switch-off, new source, new definition), at least monthly, and on any question «это ещё актуально?». Audit **all** blocks, not just the one asked about: the same mechanism sits in the neighbours.

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
- ❌ A conclusion, status badge or state claim typed as a literal on an auto-refreshed dashboard — it will contradict the numbers within weeks (§8).
- ❌ Fixing only the stale sentence someone pointed out — the same mechanism sits in other blocks.
- ❌ Comparison tiles with different metrics or periods side by side.

## Ship checklist
- [ ] One verdict line at top, status-colored, from live data, dual-encoded.
- [ ] Hero KPIs each carry a conclusion sub-label.
- [ ] Lists→bars; composition→ordered 100% stack with axis hint.
- [ ] Sub-totals reconcile to the headline.
- [ ] Every unfiltered block carries «обновлено HH:MM (TZ)»; filtered blocks show the selected period instead.
- [ ] Timestamps generated in the business timezone (МСК), not server/UTC; TZ printed.
- [ ] Passes the 5-second «what needs action?» test.
- [ ] Every verdict, status and state sentence is computed from the data it describes; facts from outside the data carry date + source (§8).
- [ ] Wording branches on sign and significance; real minus «−»; correct plural forms.
- [ ] Rendered in a headless browser with real data and read block by block; old phrases on the live URL = 0.
