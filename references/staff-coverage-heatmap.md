# Staff Coverage Heatmap Generator

Use this template for interactive staffing coverage analysis by hour/day in HTML.

## When to Use

- Analyze team workload by hours and days
- Detect staffing coverage gaps
- Visualize shift schedules
- Compare teams or periods
- Support staffing optimization decisions

## Input Formats

- Excel: employee column + datetime day columns, values like `08:00-20:00` or `в`
- CSV: first column employee name, remaining day columns with shifts

Typical shift cell formats:
- `08:00-20:00`
- `в` / `В` (day off)
- `ОТПУСК`
- empty / `NaN`
- multiple segments: `09:00-18:00, 15:00-17:00`

## Core Functions

Python helper set:
- `parse_time_range(time_str)` -> parse shift cells into time intervals
- `build_coverage_matrix(df, start_hour, end_hour, days_in_month)` -> `hours x days` matrix
- `calculate_metrics(coverage)` -> max/avg/coverage/peak-hour metrics
- `generate_heatmap_html(coverage, metrics, title, subtitle, month, year, days)` -> final interactive HTML

## Output

Interactive `heatmap.html` with:
- hour/day coverage grid
- color intensity by number of employees
- hover details per cell
- summary metrics (max, avg, coverage %, peak hour)
- weekday labels and optional weekend highlighting

## Minimal Flow

```python
import pandas as pd

df = pd.read_excel("file.xlsx", sheet_name="Sheet", header=2)
coverage = build_coverage_matrix(df, start_hour=7, end_hour=22, days_in_month=31)
metrics = calculate_metrics(coverage)
html = generate_heatmap_html(coverage, metrics, "Team Coverage", "18 staff", "March", 2026, 31)

with open("/mnt/user-data/outputs/heatmap.html", "w", encoding="utf-8") as f:
    f.write(html)
```

## Dependencies

```bash
pip install pandas numpy openpyxl
```

## Troubleshooting

- Empty matrix:
  - verify header row index in Excel import
- Wrong weekdays:
  - verify year/month/day parameters
- Shifts are not parsed:
  - inspect sample raw cells and normalize format
- Encoding issues:
  - prefer UTF-8, then test UTF-16/CP1251 for legacy CSV

## Full Source

The detailed template/source material is maintained locally by the skill author and is not bundled in this public repository.
