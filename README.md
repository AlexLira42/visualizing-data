# visualizing-data

A [Claude Code](https://claude.com/claude-code) skill for building **dashboards, reports, and data-driven interfaces**. It provides a systematic framework for choosing the right visualization (message → comparison → chart type), plus accessibility patterns, colorblind-safe palettes, dashboard patterns, and a critique rubric.

## What's inside

- **`SKILL.md`** — entry point: selection framework, quick-start workflow, chart catalog, accessibility, performance. (`SKILL.ru.md` — Russian version.)
- **`references/`** — deep-dive guides:
  - `zelazny-message-framework.md` — message-first pipeline & action titles
  - `selection-matrix.md`, `chart-catalog.md` — 24+ chart types & decision trees
  - `perception-principles.md` — Cleveland-McGill, Tufte, Gestalt
  - `dashboard-patterns.md` — single-glance operational dashboards (verdict-first, hero-KPI, freshness/«updated at» rules)
  - `annotation-patterns.md`, `critique-rubric.md`, `html-report-template.md`
  - `accessibility.md`, `color-systems.md`, `performance.md`
  - `staff-coverage-heatmap.md`, `statistical-reports-docx.md`
  - language guides under `references/javascript/`, `references/python/`, `references/go/`, `references/rust/`
- **`examples/`** — working code samples.

## Install

Copy this folder into your Claude Code skills directory:

```bash
# user-level (all projects)
git clone https://github.com/AlexLira42/visualizing-data ~/.claude/skills/visualizing-data

# or project-level
git clone https://github.com/AlexLira42/visualizing-data .claude/skills/visualizing-data
```

Claude Code auto-discovers the skill from its `SKILL.md` front-matter `description` and applies it when you ask to create charts, dashboards, or data visualizations.

## Credits & attribution

This skill is based on the **`visualizing-data`** skill from
[**ancoleman/ai-design-components**](https://github.com/ancoleman/ai-design-components)
by **Anton Coleman**, released under the MIT License.

This repository is an adaptation (not a structural GitHub fork — only the single
skill is extracted) with additional reference guides and modifications. The
original MIT copyright is **retained** in [LICENSE](LICENSE); changes are
copyrighted separately and also released under MIT.

## What's changed in this version

On top of the original base skill (chart-selection framework, accessibility,
colorblind-safe palettes, performance), this version adds:

- `references/zelazny-message-framework.md` — message-first pipeline (the title states the *conclusion*, not the topic)
- `references/perception-principles.md` — Cleveland-McGill ranking, Tufte (data-ink, lie factor), Gestalt
- `references/dashboard-patterns.md` — single-glance operational dashboards (verdict-first, hero-KPI, status-verdicts) **+ a data-freshness rule: every unfiltered block shows `updated HH:MM (timezone)`**
- `references/annotation-patterns.md` — storytelling layer (highlight-the-point, reference lines, so-what captions)
- `references/critique-rubric.md` — a 7-dimension self-review pass before shipping a chart
- `references/html-report-template.md` — self-contained single-file HTML report template
- `references/staff-coverage-heatmap.md` — interactive shift-coverage heatmap template
- `references/statistical-reports-docx.md` — styled `.docx` statistical-report template
- `SKILL.ru.md` — Russian-language version

## License

MIT — see [LICENSE](LICENSE). Original work © 2025 Anton Coleman; modifications © 2026 Alexandr Lira.
