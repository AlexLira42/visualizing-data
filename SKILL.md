---
name: visualizing-data
description: Builds dashboards, reports, and data-driven interfaces requiring charts, graphs, or visual analytics. Provides systematic framework for selecting appropriate visualizations based on data characteristics and analytical purpose. Includes 24+ visualization types organized by purpose (trends, comparisons, distributions, relationships, flows, hierarchies, geospatial), accessibility patterns (WCAG 2.1 AA compliance), colorblind-safe palettes, and performance optimization strategies. Use when creating visualizations, choosing chart types, displaying data graphically, or designing data interfaces.
---

# Data Visualization Component Library

Systematic guidance for selecting and implementing effective data visualizations, matching data characteristics with appropriate visualization types, ensuring clarity, accessibility, and impact.

## Overview

Data visualization transforms raw data into visual representations that reveal patterns, trends, and insights. This skill provides:

1. **Selection Framework**: Systematic decision trees from data type + purpose → chart type
2. **24+ Visualization Methods**: Organized by analytical purpose
3. **Accessibility Patterns**: WCAG 2.1 AA compliance, colorblind-safe palettes
4. **Performance Strategies**: Optimize for dataset size (<1000 to >100K points)
5. **Document Output Support**: Structured `.docx` statistical report templates
6. **Critique Mode**: 7-dimension rubric to review and fix existing charts (Step 7)
7. **Shareable HTML Reports**: self-contained single-file reports with inline-SVG charts
8. **Multi-Language Support**: JavaScript/TypeScript (primary), Python, Rust, Go

---

## Message-First Principle (Zelazny)

Before any chart mechanics, run the McKinsey/Zelazny pipeline:

```
DATA → 1. MESSAGE → 2. COMPARISON → 3. CHART TYPE
```

The chart type is determined by your **message** (the one point to take away), not by the data itself. Two non-negotiable rules:

1. **Write the message as one declarative sentence first.** If you can't, you don't yet have a point — don't pick a chart.
2. **The title states the conclusion, not the topic.** Action title (`"Объём продаж удвоился"`) over topic label (`"Динамика продаж"`). One chart = one message.

**Comparison-type detector** (message → comparison → default chart):

| Comparison | Trigger words | Default chart |
|---|---|---|
| **Component** (% of whole) | доля, % от целого, составило X% | Pie (≤6 slices) / 100% stacked bar |
| **Item/Position** (ranking) | больше/меньше, на N-м месте, largest | Bar (sorted) |
| **Time-series** (change) | рос/снижался/колебался, trend | Column (≤6 pts) / Line (many) |
| **Frequency** (count in ranges) | в диапазоне X–Y, распределение | Histogram (few bins) / curve |
| **Correlation** (relationship) | зависит/не зависит, связь между | Paired bars (few) / Scatter (many) |

**Presentation vs document:** a slide chart must be **2× simpler and 4× clearer** than the same chart in a written report. For **qualitative/non-numeric** ideas (process, barriers, balance) use **visual concepts/metaphors**, not data charts.

**Full framework:** See `references/zelazny-message-framework.md`

---

## Quick Start Workflow

### Step 0: Define the Message
```
Write the takeaway as ONE sentence → it becomes the chart's action title.
Detect comparison type (table above) → default chart.
```

### Step 1: Assess Data
```
What type? [categorical | continuous | temporal | spatial | hierarchical]
How many dimensions? [1D | 2D | multivariate]
How many points? [<100 | 100-1K | 1K-10K | >10K]
```

### Step 2: Determine Purpose
```
What story to tell? [comparison | trend | distribution | relationship | composition | flow | hierarchy | geographic]
```

### Step 3: Select Chart Type

**Quick Selection:**
- Compare 5-10 categories → Bar Chart
- Show sales over 12 months → Line Chart
- Display distribution of ages → Histogram or Violin Plot
- Explore correlation → Scatter Plot
- Show budget breakdown → Treemap or Stacked Bar
- Need executive deliverable in Word format → `.docx` Statistical Report Template
- Need staffing coverage by hour/day with interaction → Staff Coverage Heatmap (HTML)

**Complete decision trees:** See `references/selection-matrix.md`

### Step 4: Implement

See language sections below for recommended libraries.

### Step 5: Apply Accessibility
- Add text alternative (aria-label)
- Ensure 3:1 color contrast minimum
- Use colorblind-safe palette
- Provide data table alternative

### Step 6: Optimize Performance
- <1000 points: Standard SVG rendering
- >1000 points: Sampling or Canvas rendering
- Very large: Server-side aggregation

### Step 7: Critique (review an existing or just-built chart)
Don't ship without a review pass. Score the chart on the 7-dimension rubric — message, chart-type fit, encoding/perception, labeling, color/accessibility, data-ink, storytelling — find what's broken, and **rebuild with the fixes**. A presentation chart should score ≥12/14 with no zeros.

**Full rubric & output format:** See `references/critique-rubric.md`

### Output mode: shareable single-file HTML report
For a portable, dependency-free deliverable (live dashboard, comparison prototype, exec read-out) that opens offline and hosts as a static file, build a **self-contained `.html`** with inline SVG charts.

**Template, skeleton & deploy notes:** See `references/html-report-template.md`

---

## Purpose-First Selection

**Match analytical purpose to chart type:**

| Purpose | Chart Types |
|---------|-------------|
| **Compare values** | Bar Chart, Lollipop Chart |
| **Show trends** | Line Chart, Area Chart |
| **Reveal distributions** | Histogram, Violin Plot, Box Plot |
| **Explore relationships** | Scatter Plot, Bubble Chart |
| **Explain composition** | Treemap, Stacked Bar, Pie Chart (<6 slices) |
| **Visualize flow** | Sankey Diagram, Chord Diagram |
| **Display hierarchy** | Sunburst, Dendrogram, Treemap |
| **Show geographic** | Choropleth Map, Symbol Map |

---

## Visualization Catalog

### Tier 1: Fundamental Primitives
General audiences, straightforward data stories:
- **Bar Chart**: Compare categories
- **Line Chart**: Show trends over time
- **Scatter Plot**: Explore relationships
- **Pie Chart**: Part-to-whole (max 5-6 slices)
- **Area Chart**: Emphasize magnitude over time

### Tier 2: Purpose-Driven
Specific analytical insights:
- **Comparison**: Grouped Bar, Lollipop, Bullet Chart
- **Trend**: Stream Graph, Slope Graph, Sparklines
- **Distribution**: Violin Plot, Box Plot, Histogram
- **Relationship**: Bubble Chart, Hexbin Plot
- **Composition**: Treemap, Sunburst, Waterfall
- **Flow**: Sankey Diagram, Chord Diagram

### Tier 3: Advanced
Complex data, sophisticated audiences:
- **Multi-dimensional**: Parallel Coordinates, Radar Chart, Small Multiples
- **Temporal**: Gantt Chart, Calendar Heatmap, Candlestick
- **Network**: Force-Directed Graph, Adjacency Matrix

**Detailed descriptions:** See `references/chart-catalog.md`

---

## Accessibility Requirements (WCAG 2.1 AA)

### Text Alternatives
```html
<figure role="img" aria-label="Sales increased 15% from Q3 to Q4">
  <svg>...</svg>
</figure>
```

### Color Requirements
- Non-text UI elements: 3:1 minimum contrast
- Text: 4.5:1 minimum (or 3:1 for large text ≥24px)
- Don't rely on color alone - use patterns/textures + labels

### Colorblind-Safe Palettes

**IBM Palette (Recommended):**
```
#648FFF (Blue), #785EF0 (Purple), #DC267F (Magenta),
#FE6100 (Orange), #FFB000 (Yellow)
```

**Avoid:** Red/Green combinations (8% of males have red-green colorblindness)

### Keyboard Navigation
- Tab through interactive elements
- Enter/Space to activate tooltips
- Arrow keys to navigate data points

**Complete accessibility guide:** See `references/accessibility.md`

---

## Performance by Data Volume

| Rows | Strategy | Implementation |
|------|----------|----------------|
| <1,000 | Direct rendering | Standard libraries (SVG) |
| 1K-10K | Sampling/aggregation | Downsample to ~500 points |
| 10K-100K | Canvas rendering | Switch from SVG to Canvas |
| >100K | Server-side aggregation | Backend processing |

---

## JavaScript/TypeScript Implementation

### Recharts (Business Dashboards)
Composable React components, declarative API, responsive by default.

```bash
npm install recharts
```

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', sales: 4000 },
  { month: 'Feb', sales: 3000 },
  { month: 'Mar', sales: 5000 },
];

export function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="sales" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### D3.js (Custom Visualizations)
Maximum flexibility, industry standard, unlimited chart types.

```bash
npm install d3
```

### Plotly (Scientific/Interactive)
3D visualizations, statistical charts, interactive out-of-box.

```bash
npm install react-plotly.js plotly.js
```

### Docx (Statistical Word Reports)
Use for business-ready `.docx` reporting with metric tables, delta coloring, and signal indicators (`🔴`, `✅`, `Норма`).

```bash
npm install docx
```

Key style constraints in this template:
- Times New Roman across the document
- H1/H2 color `#2E5496`
- Table header `#2E5496` with white text
- Alternating table rows `#EEF3FB` / white
- Delta colors: red `#C0392B`, green `#27AE60`, neutral `#E67E22`

Detailed guide: `references/statistical-reports-docx.md`

**Detailed examples:** See `references/javascript/`

---

## Python Implementation

**Common Libraries:**
- **Plotly** - Interactive charts (same API as JavaScript)
- **Matplotlib** - Publication-quality static plots
- **Seaborn** - Statistical visualizations
- **Altair** - Declarative visualization grammar

### Staff Coverage Heatmap (Python + HTML)
Use for operational staffing analysis from shift tables (Excel/CSV), with hour/day heatmap, hover details, and coverage metrics.

Core pipeline:
1. Parse shifts (`08:00-20:00`, `в`, `ОТПУСК`) into time ranges
2. Build `hours x days` coverage matrix
3. Compute summary metrics (max, avg, coverage %, peak hour)
4. Render interactive HTML heatmap

Detailed guide: `references/staff-coverage-heatmap.md`

**When building Python implementations:**
1. Follow universal patterns above
2. Use RESEARCH_GUIDE.md to research libraries
3. Add to `references/python/`

---

## Integration with Design Tokens

Reference the **design-tokens** skill for theming:

```css
--chart-color-primary
--chart-color-1 through --chart-color-10
--chart-axis-color
--chart-grid-color
--chart-tooltip-bg
```

```tsx
<Line stroke="var(--chart-color-primary)" />
```

Light/dark/high-contrast themes work automatically via design tokens.

---

## Common Mistakes to Avoid

0. **No message** - Picking a chart before writing the one-sentence takeaway (Zelazny step 1)
0b. **Topic title instead of message title** - "Sales by region" hides the point; use "Region B drives 40% of sales"
1. **Chart-first thinking** - Choose based on data + purpose, not aesthetics
2. **Pie charts for >6 categories** - Use sorted bar chart instead
3. **Dual-axis charts** - Usually misleading, use small multiples
4. **3D when 2D sufficient** - Adds complexity, reduces clarity
5. **Rainbow color scales** - Not perceptually uniform, not colorblind-safe
6. **Truncated y-axis** - Indicate clearly or start at zero
7. **Too many colors** - Limit to 6-8 distinct categories
8. **Missing context** - Always label axes, include units

---

## Quick Decision Tree

```
START: What is your data?

Categorical (categories/groups)
  ├─ Compare values → Bar Chart
  ├─ Show composition → Treemap or Pie Chart (<6 slices)
  └─ Show flow → Sankey Diagram

Continuous (numbers)
  ├─ Single variable → Histogram, Violin Plot
  └─ Two variables → Scatter Plot

Temporal (time series)
  ├─ Single metric → Line Chart
  ├─ Multiple metrics → Small Multiples
  └─ Daily patterns → Calendar Heatmap

Hierarchical (nested)
  ├─ Proportions → Treemap
  └─ Show depth → Sunburst, Dendrogram

Geographic (locations)
  ├─ Regional aggregates → Choropleth Map
  └─ Point locations → Symbol Map
```

---

## References

**Selection Guides:**
- `references/zelazny-message-framework.md` - Message→comparison→chart pipeline, action titles, 5 comparison types, visual concepts/metaphors
- `references/chart-catalog.md` - All 24+ visualization types
- `references/selection-matrix.md` - Complete decision trees
- `references/perception-principles.md` - The «why»: Cleveland-McGill ranking, Tufte (data-ink, lie factor, small multiples), Gestalt, preattentive

**Technical Guides:**
- `references/critique-rubric.md` - Critique/review mode: 7-dimension scorecard + fixes (Step 7)
- `references/html-report-template.md` - Shareable single-file HTML report (inline-SVG, no deps, deploy notes)
- `references/annotation-patterns.md` - Storytelling layer: highlight-the-point, reference lines, callouts, so-what captions
- `references/dashboard-patterns.md` - Single-glance dashboards: verdict-first, hero-KPI, status-verdict, 5-second test
- `references/accessibility.md` - WCAG 2.1 AA patterns
- `references/color-systems.md` - Colorblind-safe palettes
- `references/performance.md` - Optimization by data volume
- `references/statistical-reports-docx.md` - `.docx` statistical report template
- `references/staff-coverage-heatmap.md` - interactive staffing coverage heatmap template

**Language-Specific:**
- `references/javascript/` - React, D3.js, Plotly examples
- `references/python/` - Plotly, Matplotlib, Seaborn
- `references/python/publication-figures.md` - Camera-ready journal figures: vector export, fonts, column sizing, grayscale-safe

**Assets:**
- `assets/color-palettes/` - Accessible color schemes
- `assets/example-datasets/` - Sample data for testing

---

## Examples

**Working code examples:**
- `examples/javascript/bar-chart.tsx`
- `examples/javascript/line-chart.tsx`
- `examples/javascript/scatter-plot.tsx`
- `examples/javascript/accessible-chart.tsx`

```bash
cd examples/javascript && npm install && npm start
```

---

## Validation

```bash
# Validate accessibility
scripts/validate_accessibility.py <chart-html>

# Test colorblind
# Use browser DevTools color vision deficiency emulator
```

---

**Progressive disclosure:** This SKILL.md provides overview and quick start. Detailed documentation, code examples, and language-specific implementations in `references/` and `examples/` directories.
