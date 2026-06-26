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

## License

MIT — see [LICENSE](LICENSE).
