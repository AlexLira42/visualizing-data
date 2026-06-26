# Statistical Reports Generator (.docx)

Use this template when the output must be a formatted Word document with tables, metrics, and delta indicators.

## When to Use

- Daily/weekly statistical reports in `.docx`
- Current vs baseline metric comparison documents
- Professional reports with color-coded status indicators
- Reports with signals (`🔴`, `✅`, `Норма`)

## Style Standard

- Font: `Times New Roman` (entire document)
- H1: `#2E5496`, `28pt`
- H2: `#2E5496`, `20pt`
- Table header: `#2E5496` with white text
- Alternating table rows: `#EEF3FB` / white
- Delta colors:
  - negative growth: `#C0392B`
  - positive decline: `#27AE60`
  - neutral: `#E67E22`

## Dependency

```bash
npm install docx
```

```json
{
  "docx": "^7.8.0"
}
```

## Core Helpers

```javascript
const docx = require("docx");
const {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  HeadingLevel
} = docx;
```

Required helper blocks:
- `dHeader(text, level)` for H1/H2 headings
- `dText(text, options)` for paragraphs/subtitles
- `dCell(text, options)` for styled table cells
- `createTableWithHeader(headers, data)` for standard report tables
- `formatDelta(current, previous, reverseLogic)` for delta text+color+signal
- `createDeltaRow(label, current, previous, reverseLogic)` for metric rows
- `divider()` for section separators
- `dInlineNote(text)` for short inline observations

## Delta Logic

- `reverseLogic = true` for metrics where decrease is good (for example: open tickets)
- `reverseLogic = false` for metrics where increase is good (for example: sales)
- Signal mapping:
  - improved: `✅`
  - degraded: `🔴`
  - unchanged: `Норма`

## Skeleton

```javascript
const fs = require("fs");
const docx = require("docx");

async function generateReport() {
  const doc = new docx.Document({
    sections: [{
      children: [
        dHeader("Статистический отчет", 1),
        dText("Подзаголовок отчета", { italics: true, color: "666666" }),
        divider(),
        dHeader("1. Основные метрики", 2),
        createTableWithHeader(
          ["Метрика", "Сегодня", "Вчера", "Δ", "Сигнал"],
          [
            createDeltaRow("Открытых тикетов", 145, 178, true),
            createDeltaRow("Новых заявок", 67, 54, false)
          ]
        ),
        dInlineNote("Снижение открытых тикетов — положительная динамика")
      ]
    }]
  });

  const buffer = await docx.Packer.toBuffer(doc);
  fs.writeFileSync("/mnt/user-data/outputs/report.docx", buffer);
}
```

## Validation

```bash
python3 /mnt/skills/public/docx/scripts/office/validate.py report.docx
```

## Troubleshooting

- If validation fails with `"bold with color"`:
  - pass `bold: false` explicitly when setting cell text color
- If table is too wide:
  - set explicit `columnWidths` in DXA units
  - or use landscape section for wide tables
- If text overflows:
  - reduce text size (for example `size: 20`)

## Full Source

The detailed template/source material is maintained locally by the skill author and is not bundled in this public repository.
