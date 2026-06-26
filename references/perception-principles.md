# Perception Principles — the «why» behind chart choice

The theory that grounds the selection matrix. Use it to *justify* a chart type and to settle disputes («why bar, not pie?»).

---

## 1. Cleveland–McGill: accuracy ranking of visual channels

How precisely people decode a quantity, best → worst:

1. **Position** on a common scale (dot/bar baseline) — most accurate
2. **Position** on non-aligned scales (small multiples)
3. **Length** (bar length, no shared baseline)
4. **Angle / slope** (line direction, pie wedge)
5. **Area** (bubble size)
6. **Volume / curvature**
7. **Color hue / shade / saturation** — least accurate (good for categories, bad for magnitude)

**Rule:** put the comparison that *matters most* on the *most accurate* channel.
- Compare values precisely → bar (position/length), not pie (angle) or bubble (area).
- Color/size = secondary or categorical encoding only, never the primary quantitative read.

## 2. Stevens' power law (why area misleads)
Perceived magnitude ≠ actual for area/volume. Doubling a circle's *value* by doubling its *radius* quadruples the area → readers overstate. If you must use area (bubble), scale by **area**, not radius, and add labels.

## 3. Tufte's integrity & minimalism
- **Lie factor** = (size of effect shown) / (size of effect in data). Aim ≈ 1. Truncated bar axes, dual axes, and 3D inflate it.
- **Data-ink ratio:** maximize ink that encodes data; erase non-data ink (heavy borders, backgrounds, 3D, redundant grids/legends).
- **Small multiples:** repeat a small chart across a variable — the most honest way to compare many series/groups (beats one cluttered multi-line or dual-axis chart).
- **Graphical excellence:** most ideas, in the least ink, in the smallest space, with the least distortion.

## 4. Preattentive attributes (what the eye finds in <250 ms)
Color (hue), intensity, size, orientation, position, motion, enclosure. **Encode the one thing you want noticed** with exactly one strong preattentive cue; keep everything else neutral. One red bar among gray = instant focus. Five colors = no focus.

## 5. Gestalt grouping (how layout implies relationship)
- **Proximity** — near items read as a group (use spacing to group/separate).
- **Similarity** — same color/shape read as same category.
- **Enclosure** — a box/band groups stronger than proximity.
- **Continuity / connection** — a line connecting points implies a relationship/sequence (don't connect unordered categories).
- **Common fate** — items moving/trending together read as related.

## 6. Color use (see also `color-systems.md`, `accessibility.md`)
- **Categorical:** distinct hues, ≤ 6–8; colorblind-safe (IBM).
- **Sequential:** single hue light→dark for ordered magnitude.
- **Diverging:** two hues from a meaningful midpoint (e.g. vs target); avoid red↔green (use blue↔orange/magenta).
- Never carry meaning by color alone — pair with label/position/shape.

---

## Quick adjudication table

| Dispute | Verdict (principle) |
|---|---|
| Pie vs bar for compare | Bar — position beats angle (CM #1 vs #4) |
| Bubble vs bar for magnitude | Bar — area is CM #5 + Stevens distortion |
| Dual-axis vs small multiples | Small multiples — kills lie-factor/spurious correlation |
| 3D bar vs 2D bar | 2D — 3D adds occlusion + perspective distortion |
| Rainbow vs sequential ramp | Sequential — perceptually uniform, colorblind-safe |
| Many lines vs faceted | Facet (small multiples) when >4–5 series overlap |
| Truncated bar axis | Never — bars must start at 0 (length encodes value) |
| Truncated line axis | OK if indexed/zoomed **and** the break is marked |
