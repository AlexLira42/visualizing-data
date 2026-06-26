# Publication-Quality Figures (Python / matplotlib + seaborn)

For journal/report figures: vector output, embedded fonts, exact column sizing, colorblind- and grayscale-safe. Distinct from quick EDA plots — these are camera-ready.

---

## 1. Size to the target column (don't resize after)
Set the figure to the *physical* width of the destination; never scale a raster afterward.

| Target | Width |
|---|---|
| Single column (journal) | 3.3 in (~84 mm) |
| 1.5 column | 5.0 in (~127 mm) |
| Double column / full | 6.9 in (~175 mm) |
| Slide (16:9) | 13.3 × 7.5 in |

Height: pick for aspect (≈ width × 0.62 golden-ish), or to bank the data slope ~45°.

## 2. Export as vector with embedded fonts
- **SVG / PDF**, not PNG, for line art. Use PNG only for dense scatter/heatmaps (then ≥300 dpi).
- Embed fonts so the figure renders identically everywhere:

```python
import matplotlib as mpl
mpl.rcParams['pdf.fonttype'] = 42   # TrueType (editable text), not Type-3
mpl.rcParams['ps.fonttype']  = 42
mpl.rcParams['svg.fonttype'] = 'none'   # keep text as text in SVG
fig.savefig('fig.pdf', bbox_inches='tight', pad_inches=0.02)
fig.savefig('fig.png', dpi=300, bbox_inches='tight')
```

## 3. A reusable rcParams template
```python
import matplotlib as mpl
mpl.rcParams.update({
    'figure.figsize': (3.3, 2.4), 'figure.dpi': 150, 'savefig.dpi': 300,
    'font.family': 'sans-serif', 'font.sans-serif': ['Arial', 'Helvetica', 'DejaVu Sans'],
    'font.size': 8, 'axes.titlesize': 9, 'axes.labelsize': 8,
    'xtick.labelsize': 7, 'ytick.labelsize': 7, 'legend.fontsize': 7,
    'axes.linewidth': 0.8, 'lines.linewidth': 1.4, 'lines.markersize': 4,
    'axes.spines.top': False, 'axes.spines.right': False,   # despine
    'axes.grid': True, 'grid.color': '#e6e6e6', 'grid.linewidth': 0.6,
    'pdf.fonttype': 42, 'ps.fonttype': 42, 'svg.fonttype': 'none',
})
```

## 4. Colorblind- & grayscale-safe
- Categorical: `seaborn.color_palette('colorblind')` or IBM `['#648FFF','#785EF0','#DC267F','#FE6100','#FFB000']`.
- Sequential: `viridis` / `cividis` (perceptually uniform, OK in grayscale). Avoid `jet`/rainbow.
- **Redundant encoding** so it survives B/W print: vary line style (`-`,`--`,`:`) and marker (`o`,`s`,`^`) in addition to color.

```python
import seaborn as sns
sns.set_theme(context='paper', style='ticks', palette='colorblind')
```

## 5. Multi-panel = small multiples (Tufte)
Shared axes, consistent scale, one legend, panel letters.
```python
fig, axes = plt.subplots(2, 3, figsize=(6.9, 4.2), sharex=True, sharey=True,
                         constrained_layout=True)
for ax, (name, g) in zip(axes.ravel(), groups):
    ax.plot(g.x, g.y, color='#648FFF')
    ax.set_title(name, fontsize=8)
for n, ax in zip('abcdef', axes.ravel()):
    ax.text(-0.1, 1.05, n, transform=ax.transAxes, fontweight='bold')
```

## 6. Camera-ready checklist (run before export)
- [ ] Figure width = target column width; text ≥ 7 pt at final size.
- [ ] Vector (PDF/SVG) with fonts embedded (`fonttype 42` / `svg.fonttype none`).
- [ ] Axes labeled with **units**; ticks readable; y from 0 for bars.
- [ ] Despined; gridlines faint; no chartjunk/3D; data-ink maximized.
- [ ] Colorblind-safe **and** grayscale-safe (style+marker redundancy).
- [ ] One legend; direct labels where they beat it; source/n in caption.
- [ ] `bbox_inches='tight'`; consistent style across all figures via shared rcParams.

> For interactive/dashboard output use the JS single-file HTML route (`../html-report-template.md`); this file is for static print/journal figures.
