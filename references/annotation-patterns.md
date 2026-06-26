# Annotation & Storytelling Layer

A correct chart still fails if the reader can't find the point. Annotation turns a chart into an argument. Apply these *after* the chart type is chosen.

> Principle: **highlight the point, mute the rest.** The eye should land on the conclusion in <3 seconds.

---

## 1. Highlight-the-point (focus + mute)
- Color the **one** element that carries the message with the strongest contrast (brand/status color); render all context in **gray/neutral**.
- One red line among gray lines > a rainbow of equal lines.
- For «we» vs peers: «we» in color, everyone else gray.

## 2. Reference / threshold / target lines — **always label the value**
- Target (goal), average/median, baseline, prior period, SLA threshold.
- Dashed line + an inline label at the right end stating the value: `цель 7%`, `ср 18.8%`, `SLA 24ч`.
- An unlabeled reference line is a question, not an answer.

## 3. Direct labels over legends
- ≤ ~4 series: label each line/bar at its end; drop the legend (no eye round-trips).
- Label the **last/最 important** value on a line; not every point.
- Bars: value at bar end; total above stacked bars.

## 4. Callouts & event markers
- Short callout near the focal point: `← рост 3 дня подряд`, `сбой ТО 14.06`.
- Vertical event markers on time series (launch, incident, policy change) with a tiny label.
- Keep callouts to 1–2 per chart; more = noise.

## 5. The «so-what» caption
- One line under/beside the chart stating the implication, not the data: «24 тикета на офлайн-столах — переназначить», not «офлайн = 24».
- Pairs with the action/message title (Zelazny): title = conclusion, caption = action.

## 6. Value & delta annotations
- Show the delta that matters: `+0.03 п.п. за сутки`, `−10.0 пп к цели`, colored by good/bad (with arrow ↗/↘ so it's not color-alone).
- Round to decision precision; put units once.

## 7. Uncertainty (don't fake precision)
- Confidence band / error bars when the estimate is noisy; or a «прочие N» bucket when a breakdown doesn't sum to the total.
- Mark forecast vs actual (solid vs dashed) and label «прогноз».

---

## Anti-patterns
- ❌ Annotating everything → nothing stands out. One focal point per chart.
- ❌ Reference line with no value label.
- ❌ Color-only emphasis (fails colorblind) — pair with weight/label/position.
- ❌ Legend when direct labels would do.
- ❌ Caption restates the axis instead of the implication.

## Checklist
- [ ] Exactly one focal element, in color; context muted.
- [ ] Every reference/threshold line labeled with its value.
- [ ] Direct labels where they beat a legend.
- [ ] ≤2 callouts; key delta shown with arrow + sign.
- [ ] One «so-what» line = the action, not the data.
