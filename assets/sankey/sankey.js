/*!
 * sankey.js — dependency-free Sankey (flow) diagram rendered as inline SVG.
 * Part of the visualizing-data skill. MIT.
 *
 * Look: multi-stage "where did everything end up" chart in the style of
 * Intercom's "How you're handling conversations" — thin node bars, two-line
 * labels «298 (55%) / Resolved by **AI agent**», gradient bands source→target.
 *
 * API
 *   Sankey.render(host, data, options) → { layout(), update(data), destroy() }
 *   Sankey.layout(data, options)       → geometry only, no DOM (testable in Node)
 *   Sankey.fromPaths(paths, options)   → { nodes, links } from per-item step sequences
 *   Sankey.PALETTE                     → semantic group colours
 *
 * data = {
 *   nodes: [{ id, label, group?, color?, column?, value? }],  // label may contain **bold** parts
 *   links: [{ source, target, value, color? }]                // acyclic: a repeat is a new node
 * }
 *
 * Rules and checklist: references/sankey-flow-diagram.md
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Sankey = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Semantic colours: colour = who handled the item / how it ended, not "one colour per node".
  // IBM base + mint and slate. Losses are magenta, not red. Checked by simulating protan-, deuter- and
  // tritanopia: outcome groups stay ≥ 18 ΔE apart; ai/bot is the closest pair (≈13 ΔE for deuteranopia),
  // so the bold actor name in the label carries that difference.
  var PALETTE = {
    root: '#7f8db0',      // entry point, total
    ai: '#785EF0',        // AI agent
    bot: '#648FFF',       // rule-based bot, automation, workflow
    human: '#FFB000',     // teammate, manual work
    escalated: '#DC267F', // escalation, failure, constraint, loss
    resolved: '#47C98F',  // success, closed, sold
    pending: '#9AA3B2',   // waiting, declined, unknown
    other: '#9AA3B2'
  };
  // Fallback when a node has neither colour nor group: one colour per label.
  var CYCLE = ['#648FFF', '#785EF0', '#DC267F', '#FE6100', '#FFB000', '#47C98F', '#7f8db0'];

  var STRINGS = {
    en: { ofTotal: 'of total', of: 'of', q: ['“', '”'], table: 'Data table', from: 'From', to: 'To',
          value: 'Value', share: '% of total', shareSrc: '% of source', inflow: 'in', outflow: 'out' },
    ru: { ofTotal: 'от всех', of: 'от', q: ['«', '»'], table: 'Таблица данных', from: 'Откуда', to: 'Куда',
          value: 'Количество', share: '% от всех', shareSrc: '% от источника', inflow: 'вход', outflow: 'выход' }
  };

  var DEFAULTS = {
    width: null,          // px; null → host width (never below what the labels need), re-laid out on resize
    minWidth: 640,        // narrower hosts scroll horizontally instead of squeezing text
    height: null,         // px; null → from the busiest column
    nodeWidth: 14,
    nodePadding: 30,      // min vertical gap between nodes; keep ≥ label height (2 lines ≈ 28px)
    minNodeHeight: 2,     // tiny states stay visible
    labelWidth: null,     // px reserved right of the last column; null → measured
    margin: { top: 20, right: 8, bottom: 20, left: 4 },
    align: 'left',        // 'left': column = step depth (Intercom) | 'justify': every end state in the last column
    order: 'input',       // 'input': keep the given order inside a column | 'auto': reorder to reduce crossings
    iterations: 6,        // relaxation passes that line nodes up with their flows
    total: null,          // base for "% of total"; default = sum of entry nodes
    linkColor: 'gradient',// 'gradient' | 'source' | 'target' | any CSS colour
    palette: null,        // overrides for PALETTE groups
    highlight: null,      // node ids whose flows stay emphasised — the path that carries the message
    tooltip: true,
    table: true,          // <details> data table under the chart: exact numbers, screen readers
    ariaLabel: null,      // the chart's message, e.g. "AI agent resolves 55% of conversations"
    locale: null,         // 'ru' | 'en'; default from <html lang>
    format: null,         // value formatter; default toLocaleString
    warn: true            // console.warn about data problems (unbalanced nodes, skipped links)
  };

  function sumValues(links) { var s = 0; for (var i = 0; i < links.length; i++) s += links[i].value; return s; }
  function plain(s) { return String(s).replace(/\*\*/g, ''); }
  function r2(v) { return Math.round(v * 100) / 100; }

  // ───────────────────────── layout (pure, no DOM) ─────────────────────────
  function layout(data, options) {
    var opt = Object.assign({}, DEFAULTS, options || {});
    var margin = Object.assign({}, DEFAULTS.margin, opt.margin || {});
    var warnings = [];
    if (!data || !Array.isArray(data.nodes)) throw new Error('Sankey: data.nodes must be an array');

    var nodes = data.nodes.map(function (n, i) {
      if (!n || n.id == null) throw new Error('Sankey: node #' + i + ' has no id');
      return {
        id: String(n.id), label: n.label != null ? String(n.label) : String(n.id),
        group: n.group || null, color: n.color || null,
        column: n.column != null ? +n.column : null, fixedValue: n.value != null ? +n.value : null,
        index: i, sourceLinks: [], targetLinks: [], data: n
      };
    });
    var byId = Object.create(null);
    nodes.forEach(function (n) {
      if (byId[n.id]) throw new Error('Sankey: duplicate node id "' + n.id + '"');
      byId[n.id] = n;
    });

    var links = [];
    (data.links || []).forEach(function (l, i) {
      var s = byId[String(l.source)], t = byId[String(l.target)];
      if (!s) throw new Error('Sankey: link #' + i + ' has unknown source "' + l.source + '"');
      if (!t) throw new Error('Sankey: link #' + i + ' has unknown target "' + l.target + '"');
      if (s === t) throw new Error('Sankey: link #' + i + ' is a self-loop on "' + s.id + '"');
      var v = +l.value;
      if (!(v > 0)) { warnings.push('link ' + s.id + ' → ' + t.id + ' skipped (value ' + l.value + ')'); return; }
      var link = { source: s, target: t, value: v, color: l.color || null, index: links.length, data: l };
      links.push(link); s.sourceLinks.push(link); t.targetLinks.push(link);
    });

    // Topological order (Kahn). A Sankey has to be acyclic.
    var indeg = nodes.map(function (n) { return n.targetLinks.length; });
    var queue = nodes.filter(function (n) { return indeg[n.index] === 0; });
    var topo = [];
    while (queue.length) {
      var q = queue.shift(); topo.push(q);
      q.sourceLinks.forEach(function (l) { if (--indeg[l.target.index] === 0) queue.push(l.target); });
    }
    if (topo.length !== nodes.length) {
      var cyc = nodes.filter(function (n) { return indeg[n.index] > 0; }).map(function (n) { return n.id; });
      throw new Error('Sankey: cycle among nodes ' + cyc.join(', ') +
        ' — model a repeat (e.g. "reopened") as a new node in a later column');
    }

    // Values + conservation check: a middle node must pass on what it receives.
    nodes.forEach(function (n) {
      n.inValue = sumValues(n.targetLinks);
      n.outValue = sumValues(n.sourceLinks);
      n.value = n.fixedValue != null ? n.fixedValue : Math.max(n.inValue, n.outValue);
      if (n.targetLinks.length && n.sourceLinks.length && Math.abs(n.inValue - n.outValue) > 1e-9) {
        warnings.push('"' + plain(n.label) + '": in ' + r2(n.inValue) + ' ≠ out ' + r2(n.outValue) +
          (n.inValue > n.outValue
            ? ' — ' + r2(n.inValue - n.outValue) + ' stop here without a flow (add an explicit end node)'
            : ' — more flows out than in'));
      }
    });

    // Columns: longest path from an entry node; explicit `column` wins.
    topo.forEach(function (n) {
      var c = 0;
      n.targetLinks.forEach(function (l) { c = Math.max(c, l.source.col + 1); });
      n.col = n.column != null ? n.column : c;
    });
    var maxCol = 0;
    nodes.forEach(function (n) { if (n.col > maxCol) maxCol = n.col; });
    if (opt.align === 'justify') {
      nodes.forEach(function (n) { if (!n.sourceLinks.length && n.column == null) n.col = maxCol; });
    }
    links.forEach(function (l) {
      if (l.target.col <= l.source.col) {
        throw new Error('Sankey: link "' + l.source.id + '" → "' + l.target.id +
          '" does not go left to right (column ' + l.source.col + ' → ' + l.target.col + ')');
      }
    });
    var ncols = maxCol + 1, columns = [], c;
    for (c = 0; c < ncols; c++) columns.push([]);
    nodes.forEach(function (n) { columns[n.col].push(n); });

    // Geometry.
    var maxLen = 0;
    columns.forEach(function (col) { maxLen = Math.max(maxLen, col.length); });
    var width = opt.width || 960;
    var height = opt.height || Math.max(240, Math.min(1200, maxLen * 52 + margin.top + margin.bottom));
    var y0 = margin.top, y1 = height - margin.bottom;
    var labelWidth = opt.labelWidth != null ? opt.labelWidth : 170;
    var innerW = Math.max(opt.nodeWidth, width - margin.left - margin.right - labelWidth);
    var py = maxLen > 1 ? Math.min(opt.nodePadding, (y1 - y0) / (maxLen - 1) * 0.66) : opt.nodePadding;

    var ky = Infinity;
    columns.forEach(function (col) {
      var s = 0;
      col.forEach(function (n) { s += n.value; });
      if (s > 0) ky = Math.min(ky, (y1 - y0 - (col.length - 1) * py) / s);
    });
    if (!isFinite(ky) || ky < 0) ky = 0;
    // Tiny nodes are drawn at minNodeHeight; shrink the scale until every column still fits.
    for (var pass = 0; pass < 6 && ky > 0; pass++) {
      var fits = true;
      columns.forEach(function (col) {
        if (!col.length) return;
        var avail = y1 - y0 - (col.length - 1) * py, fixedH = 0, scaled = 0, used = 0;
        col.forEach(function (n) {
          var h = n.value * ky;
          if (h < opt.minNodeHeight) { fixedH += opt.minNodeHeight; used += opt.minNodeHeight; }
          else { scaled += n.value; used += h; }
        });
        if (used > avail + 1e-6 && scaled > 0) { ky = Math.min(ky, Math.max(0, (avail - fixedH) / scaled)); fits = false; }
      });
      if (fits) break;
    }

    var step = ncols > 1 ? (innerW - opt.nodeWidth) / (ncols - 1) : 0;
    nodes.forEach(function (n) {
      n.x0 = margin.left + n.col * step;
      n.x1 = n.x0 + opt.nodeWidth;
      n.h = Math.max(opt.minNodeHeight, n.value * ky);
    });
    links.forEach(function (l) { l.width = l.value * ky; });

    // Initial positions: stack each column, spread the free space evenly (as d3-sankey).
    columns.forEach(function (col) {
      var y = y0;
      col.forEach(function (n) { n.y0 = y; n.y1 = y + n.h; y = n.y1 + py; });
      var gap = (y1 - y + py) / (col.length + 1);
      col.forEach(function (n, i) { n.y0 += gap * (i + 1); n.y1 += gap * (i + 1); });
    });
    nodes.forEach(reorderNodeLinks);

    // Relaxation (port of d3-sankey): pull nodes toward the flows they share.
    for (var it = 0; it < opt.iterations; it++) {
      var alpha = Math.pow(0.99, it), beta = Math.max(1 - alpha, (it + 1) / opt.iterations);
      relaxRightToLeft(alpha, beta);
      relaxLeftToRight(alpha, beta);
    }
    if (!opt.iterations) columns.forEach(function (col) { resolveCollisions(col, 1); });

    // Link offsets inside their nodes, ordered to minimise crossings.
    nodes.forEach(function (n) {
      reorderNodeLinks(n);
      var sy = n.y0, ty = n.y0;
      n.sourceLinks.forEach(function (l) { l.sy = sy; sy += l.width; });
      n.targetLinks.forEach(function (l) { l.ty = ty; ty += l.width; });
    });

    var total = opt.total;
    if (total == null) {
      total = 0;
      nodes.forEach(function (n) { if (!n.targetLinks.length) total += n.value; });
    }

    return {
      nodes: nodes, links: links, columns: columns, width: width, height: height,
      ky: ky, padding: py, total: total, warnings: warnings, labelWidth: labelWidth
    };

    function byBreadth(a, b) { return a.y0 - b.y0 || a.index - b.index; }
    function reorderNodeLinks(n) {
      n.sourceLinks.sort(function (a, b) { return a.target.y0 - b.target.y0 || a.index - b.index; });
      n.targetLinks.sort(function (a, b) { return a.source.y0 - b.source.y0 || a.index - b.index; });
    }
    function targetTop(source, target) {
      var y = source.y0 - (source.sourceLinks.length - 1) * py / 2, i, l;
      for (i = 0; i < source.sourceLinks.length; i++) { l = source.sourceLinks[i]; if (l.target === target) break; y += l.width + py; }
      for (i = 0; i < target.targetLinks.length; i++) { l = target.targetLinks[i]; if (l.source === source) break; y -= l.width; }
      return y;
    }
    function sourceTop(source, target) {
      var y = target.y0 - (target.targetLinks.length - 1) * py / 2, i, l;
      for (i = 0; i < target.targetLinks.length; i++) { l = target.targetLinks[i]; if (l.source === source) break; y += l.width + py; }
      for (i = 0; i < source.sourceLinks.length; i++) { l = source.sourceLinks[i]; if (l.target === target) break; y -= l.width; }
      return y;
    }
    function relaxLeftToRight(alpha, beta) {
      for (var i = 1; i < columns.length; i++) {
        var col = columns[i];
        col.forEach(function (t) {
          var y = 0, w = 0;
          t.targetLinks.forEach(function (l) {
            var v = l.value * (t.col - l.source.col);
            y += targetTop(l.source, t) * v; w += v;
          });
          if (!(w > 0)) return;
          var dy = (y / w - t.y0) * alpha;
          t.y0 += dy; t.y1 += dy;
          reorderNodeLinks(t);
        });
        if (opt.order === 'auto') col.sort(byBreadth);
        resolveCollisions(col, beta);
      }
    }
    function relaxRightToLeft(alpha, beta) {
      for (var i = columns.length - 2; i >= 0; i--) {
        var col = columns[i];
        col.forEach(function (s) {
          var y = 0, w = 0;
          s.sourceLinks.forEach(function (l) {
            var v = l.value * (l.target.col - s.col);
            y += sourceTop(s, l.target) * v; w += v;
          });
          if (!(w > 0)) return;
          var dy = (y / w - s.y0) * alpha;
          s.y0 += dy; s.y1 += dy;
          reorderNodeLinks(s);
        });
        if (opt.order === 'auto') col.sort(byBreadth);
        resolveCollisions(col, beta);
      }
    }
    function resolveCollisions(col, a) {
      if (!col.length) return;
      var mid = col.length >> 1, subject = col[mid];
      pushUp(col, subject.y0 - py, mid - 1, a);
      pushDown(col, subject.y1 + py, mid + 1, a);
      pushUp(col, y1, col.length - 1, a);
      pushDown(col, y0, 0, a);
    }
    function pushDown(col, y, i, a) {
      for (; i < col.length; i++) {
        var n = col[i], dy = (y - n.y0) * a;
        if (dy > 1e-6) { n.y0 += dy; n.y1 += dy; }
        y = n.y1 + py;
      }
    }
    function pushUp(col, y, i, a) {
      for (; i >= 0; i--) {
        var n = col[i], dy = (n.y1 - y) * a;
        if (dy > 1e-6) { n.y0 -= dy; n.y1 -= dy; }
        y = n.y0 - py;
      }
    }
  }

  // ───────────────────────── data helper ─────────────────────────
  // paths: [{ steps: ['Conversations', 'Chatbot replied', 'Closed by chatbot'], value: 140 }, ...]
  //        or plain arrays (value 1 each). Node id = "<step>:<label>", column = step index,
  //        so "Teammate replied" after the bot and after an escalation stay separate nodes.
  function fromPaths(paths, options) {
    var opt = options || {};
    var nodes = Object.create(null), order = [], links = Object.create(null), linkOrder = [];
    (paths || []).forEach(function (p) {
      var steps = Array.isArray(p) ? p : (p.steps || p.path || []);
      var v = Array.isArray(p) ? 1 : (p.value != null ? +p.value : 1);
      if (!(v > 0)) return;
      for (var i = 0; i < steps.length; i++) {
        var label = String(steps[i]), id = i + ':' + label;
        if (!nodes[id]) {
          nodes[id] = { id: id, label: label, column: i, _v: 0 };
          if (opt.groups && opt.groups[label]) nodes[id].group = opt.groups[label];
          order.push(id);
        }
        nodes[id]._v += v;
        if (i > 0) {
          var src = (i - 1) + ':' + String(steps[i - 1]), key = src + '\u0000' + id;
          if (!links[key]) { links[key] = { source: src, target: id, value: 0 }; linkOrder.push(key); }
          links[key].value += v;
        }
      }
    });
    var list = order.map(function (k) { return nodes[k]; });
    if (opt.sort === 'value') {
      list.sort(function (a, b) { return a.column - b.column || b._v - a._v; });
    }
    list.forEach(function (n) { delete n._v; });
    return { nodes: list, links: linkOrder.map(function (k) { return links[k]; }) };
  }

  // ───────────────────────── render (DOM) ─────────────────────────
  var NS = 'http://www.w3.org/2000/svg', UID = 0, tipEl = null, measureCtx = null;
  var CSS = [
    '.sk-host{overflow-x:auto;-webkit-overflow-scrolling:touch}',
    '.sk-svg{display:block;font-family:inherit;font-size:12px}',
    '.sk-svg text{fill:var(--sankey-ink,#e8ecf4);paint-order:stroke;stroke:var(--sankey-halo,rgba(15,17,23,.85));',
    'stroke-width:3px;stroke-linejoin:round;pointer-events:none}',
    '.sk-svg .sk-val{font-weight:700}',
    '.sk-svg .sk-name{fill:var(--sankey-muted,#aab3c5)}',
    '.sk-svg .sk-name .sk-b{fill:var(--sankey-ink,#e8ecf4);font-weight:700}',
    '.sk-link{opacity:var(--sankey-link-opacity,.42);transition:opacity .15s}',
    '.sk-node{cursor:pointer;outline:none}',
    '.sk-node rect,.sk-node text{transition:opacity .15s}',
    '.sk-node:focus-visible .sk-bar{stroke:var(--sankey-ink,#e8ecf4);stroke-width:2px}',
    '.sk-svg.sk-focus .sk-link{opacity:var(--sankey-link-dim-opacity,.07)}',
    '.sk-svg.sk-focus .sk-link.sk-hi{opacity:var(--sankey-link-hover-opacity,.75)}',
    '.sk-svg.sk-focus .sk-node:not(.sk-hi) .sk-bar{opacity:.35}',
    '.sk-svg.sk-focus .sk-node:not(.sk-hi) text{opacity:.4}',
    // static `highlight` (the chart's message) dims less than hover, so the rest stays readable as context
    '.sk-svg.sk-soft .sk-link{opacity:var(--sankey-link-soft-opacity,.2)}',
    '.sk-svg.sk-soft .sk-link.sk-hi{opacity:var(--sankey-link-hover-opacity,.75)}',
    '.sk-svg.sk-soft .sk-node:not(.sk-hi) .sk-bar{opacity:.6}',
    '.sk-svg.sk-soft .sk-node:not(.sk-hi) text{opacity:.7}',
    '.sk-tip{position:fixed;z-index:9999;pointer-events:none;max-width:300px;padding:8px 10px;border-radius:8px;',
    'font:12px/1.45 -apple-system,"Segoe UI",Roboto,Arial,sans-serif;background:var(--sankey-tip-bg,#111827);',
    'color:var(--sankey-tip-ink,#f9fafb);border:1px solid var(--sankey-tip-line,#2a3650);',
    'box-shadow:0 6px 24px rgba(0,0,0,.35);opacity:0;transition:opacity .1s}',
    '.sk-tip.sk-show{opacity:1}',
    '.sk-tip b{font-weight:700}',
    '.sk-table{margin-top:8px;font-size:12px;color:var(--sankey-muted,#aab3c5)}',
    '.sk-table summary{cursor:pointer}',
    '.sk-table table{border-collapse:collapse;margin-top:6px}',
    '.sk-table th,.sk-table td{padding:3px 14px 3px 0;text-align:left;font-weight:400;',
    'border-bottom:1px solid var(--sankey-line,rgba(127,141,176,.25))}',
    '.sk-table th{color:var(--sankey-ink,#e8ecf4);font-weight:600}',
    '.sk-table td.sk-n{text-align:right;font-variant-numeric:tabular-nums}'
  ].join('');

  function el(name, attrs, text) {
    var e = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function injectStyle() {
    if (document.getElementById('sankey-js-style')) return;
    var s = document.createElement('style');
    s.id = 'sankey-js-style'; s.textContent = CSS;
    document.head.appendChild(s);
  }
  function rich(textEl, label) {
    String(label).split(/\*\*(.+?)\*\*/).forEach(function (part, i) {
      if (part) textEl.appendChild(el('tspan', i % 2 ? { 'class': 'sk-b' } : null, part));
    });
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function bandPath(l) {
    var x0 = r2(l.source.x1), x1 = r2(l.target.x0), xm = r2((x0 + x1) / 2);
    var w = Math.max(l.width, 1);                       // hairline flows stay visible
    var s0 = r2(l.sy), t0 = r2(l.ty), s1 = r2(l.sy + w), t1 = r2(l.ty + w);
    return 'M' + x0 + ',' + s0 + 'C' + xm + ',' + s0 + ' ' + xm + ',' + t0 + ' ' + x1 + ',' + t0 +
      'L' + x1 + ',' + t1 + 'C' + xm + ',' + t1 + ' ' + xm + ',' + s1 + ' ' + x0 + ',' + s1 + 'Z';
  }
  function textWidth(text, weight, family) {
    if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
    if (!measureCtx) return String(text).length * 7;
    measureCtx.font = weight + ' 12px ' + family;
    return measureCtx.measureText(String(text)).width;
  }

  function render(host, data, options) {
    if (typeof host === 'string') host = document.querySelector(host);
    if (!host) throw new Error('Sankey: host element not found');
    var opt = Object.assign({}, DEFAULTS, options || {});
    injectStyle();
    host.classList.add('sk-host');

    var uid = 'sk' + (++UID);
    var lang = String(opt.locale || document.documentElement.getAttribute('lang') || 'en').slice(0, 2).toLowerCase();
    var T = STRINGS[lang] || STRINGS.en;
    var numTag = lang === 'ru' ? 'ru-RU' : undefined;
    var fmt = opt.format || function (v) { return r2(v).toLocaleString(numTag); };
    var palette = Object.assign({}, PALETTE, opt.palette || {});
    var family = (window.getComputedStyle(host).fontFamily) || 'sans-serif';
    var state = { data: data, L: null, pinned: null, hostW: 0 };
    var ro = null, timer = null;

    function pct(v, base) {
      if (!base) return '';
      var p = v / base * 100;
      return (p > 0 && p < 0.5) ? '<1%' : Math.round(p) + '%';
    }
    function valueLine(n, total) { return fmt(n.value) + ' (' + pct(n.value, total) + ')'; }
    function quote(s) { return T.q[0] + s + T.q[1]; }

    function draw() {
      state.hostW = Math.floor(host.clientWidth || 0);
      // Pass 1: columns and totals at a provisional width, to measure labels per column.
      var L0 = layout(state.data, Object.assign({}, opt, { width: opt.width || 960, labelWidth: 170 }));
      var stepNeed = 0, lastNeed = 60, lastCol = L0.columns.length - 1;
      L0.columns.forEach(function (col, ci) {
        col.forEach(function (n) {
          var w = Math.max(textWidth(valueLine(n, L0.total), 700, family), textWidth(plain(n.label), 600, family));
          if (ci === lastCol) lastNeed = Math.max(lastNeed, w + 14);
          else stepNeed = Math.max(stepNeed, w + opt.nodeWidth + 20);
        });
      });
      var m = Object.assign({}, DEFAULTS.margin, opt.margin || {});
      var labelWidth = opt.labelWidth != null ? opt.labelWidth : Math.ceil(lastNeed);
      var need = Math.ceil(m.left + m.right + opt.nodeWidth + lastCol * stepNeed + labelWidth);
      var width = opt.width || Math.max(opt.minWidth, state.hostW || 960, need);

      var L = layout(state.data, Object.assign({}, opt, { width: width, labelWidth: labelWidth }));
      state.L = L;
      if (opt.warn && L.warnings.length && typeof console !== 'undefined') {
        console.warn('Sankey: ' + L.warnings.join('; '));
      }

      var colorByLabel = Object.create(null), ci = 0;
      L.nodes.forEach(function (n) {
        n.fill = n.color || (n.group && palette[n.group]) || null;
        if (!n.fill) {
          var key = plain(n.label);
          if (!colorByLabel[key]) colorByLabel[key] = CYCLE[ci++ % CYCLE.length];
          n.fill = colorByLabel[key];
        }
      });

      var svg = el('svg', {
        'class': 'sk-svg', width: L.width, height: L.height, viewBox: '0 0 ' + L.width + ' ' + L.height,
        role: 'group', 'aria-label': opt.ariaLabel || null
      });
      if (opt.ariaLabel) svg.appendChild(el('title', null, opt.ariaLabel));
      var defs = el('defs'), gl = el('g', { 'class': 'sk-links' }), gn = el('g', { 'class': 'sk-nodes' });
      svg.appendChild(defs); svg.appendChild(gl); svg.appendChild(gn);

      L.links.forEach(function (l, i) {
        var fill;
        if (l.color) fill = l.color;
        else if (opt.linkColor === 'gradient') {
          var gid = uid + '-g' + i;
          var g = el('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse',
            x1: r2(l.source.x1), x2: r2(l.target.x0), y1: 0, y2: 0 });
          g.appendChild(el('stop', { offset: '0%', 'stop-color': l.source.fill }));
          g.appendChild(el('stop', { offset: '100%', 'stop-color': l.target.fill }));
          defs.appendChild(g);
          fill = 'url(#' + gid + ')';
        } else if (opt.linkColor === 'source') fill = l.source.fill;
        else if (opt.linkColor === 'target') fill = l.target.fill;
        else fill = opt.linkColor;
        var p = el('path', { 'class': 'sk-link', d: bandPath(l), fill: fill });
        p.__sk = { link: l }; l.el = p;
        gl.appendChild(p);
      });

      L.nodes.forEach(function (n) {
        var h = n.y1 - n.y0, cy = (n.y0 + n.y1) / 2, hit = Math.max(h, 16);
        var g = el('g', {
          'class': 'sk-node', tabindex: 0, role: 'img',
          'aria-label': plain(n.label) + ': ' + fmt(n.value) + ' (' + pct(n.value, L.total) + ' ' + T.ofTotal + ')'
        });
        g.appendChild(el('rect', { x: r2(n.x0 - 4), y: r2(cy - hit / 2), width: r2(n.x1 - n.x0 + 8), height: r2(hit),
          fill: 'transparent' }));
        g.appendChild(el('rect', { 'class': 'sk-bar', x: r2(n.x0), y: r2(n.y0), width: r2(n.x1 - n.x0), height: r2(h),
          rx: 2, fill: n.fill }));
        g.appendChild(el('text', { 'class': 'sk-val', x: r2(n.x1 + 8), y: r2(cy - 3) }, valueLine(n, L.total)));
        var name = el('text', { 'class': 'sk-name', x: r2(n.x1 + 8), y: r2(cy + 12) });
        rich(name, n.label);
        g.appendChild(name);
        g.__sk = { node: n }; n.el = g;
        gn.appendChild(g);
      });

      host.innerHTML = '';
      host.appendChild(svg);
      if (opt.table) host.appendChild(buildTable(L));
      wire(svg, L);
      applyFocus(svg, L, state.pinned || staticFocus(L));
    }

    function staticFocus(L) {
      if (!opt.highlight || !opt.highlight.length) return null;
      var ids = Object.create(null);
      opt.highlight.forEach(function (id) { ids[String(id)] = true; });
      var ns = L.nodes.filter(function (n) { return ids[n.id]; });
      return ns.length ? { nodes: ns, soft: true } : null;
    }

    function applyFocus(svg, L, f) {
      L.links.forEach(function (l) { l.el.classList.remove('sk-hi'); });
      L.nodes.forEach(function (n) { n.el.classList.remove('sk-hi'); });
      svg.classList.toggle('sk-focus', !!f && !f.soft);
      svg.classList.toggle('sk-soft', !!f && !!f.soft);
      if (!f) return;
      var mark = function (l) { l.el.classList.add('sk-hi'); l.source.el.classList.add('sk-hi'); l.target.el.classList.add('sk-hi'); };
      if (f.link) mark(f.link);
      (f.nodes || []).forEach(function (n) {
        n.el.classList.add('sk-hi');
        n.sourceLinks.forEach(mark); n.targetLinks.forEach(mark);
      });
    }

    function tip() {
      if (!tipEl) {
        tipEl = document.createElement('div');
        tipEl.className = 'sk-tip'; tipEl.setAttribute('role', 'tooltip');
        document.body.appendChild(tipEl);
      }
      return tipEl;
    }
    function showTip(html, x, y) {
      if (!opt.tooltip) return;
      var t = tip();
      t.innerHTML = html; t.classList.add('sk-show');
      var r = t.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
      var left = x + 14, top = y + 14;
      if (left + r.width > vw - 8) left = Math.max(8, x - r.width - 14);
      if (top + r.height > vh - 8) top = Math.max(8, y - r.height - 14);
      t.style.left = left + 'px'; t.style.top = top + 'px';
    }
    function hideTip() { if (tipEl) tipEl.classList.remove('sk-show'); }

    function nodeTip(n, L) {
      var s = '<b>' + esc(plain(n.label)) + '</b><br>' + esc(fmt(n.value)) + ' · ' + esc(pct(n.value, L.total)) + ' ' + esc(T.ofTotal);
      if (n.targetLinks.length && n.sourceLinks.length) {
        s += '<br>' + esc(T.inflow) + ' ' + esc(fmt(n.inValue)) + ' · ' + esc(T.outflow) + ' ' + esc(fmt(n.outValue));
      }
      return s;
    }
    function linkTip(l, L) {
      var src = plain(l.source.label), tgt = plain(l.target.label);
      return '<b>' + esc(src) + '</b> → <b>' + esc(tgt) + '</b><br>' + esc(fmt(l.value)) + ' · ' +
        esc(pct(l.value, L.total)) + ' ' + esc(T.ofTotal) + ' · ' + esc(pct(l.value, l.source.value)) + ' ' +
        esc(T.of) + ' ' + esc(quote(src));
    }

    function wire(svg, L) {
      function target(e) {
        var t = e.target;
        while (t && t !== svg) { if (t.__sk) return t.__sk; t = t.parentNode; }
        return null;
      }
      svg.addEventListener('pointermove', function (e) {
        var hit = target(e);
        if (!hit) { applyFocus(svg, L, state.pinned || staticFocus(L)); hideTip(); return; }
        if (!state.pinned) applyFocus(svg, L, hit.node ? { nodes: [hit.node] } : { link: hit.link });
        showTip(hit.node ? nodeTip(hit.node, L) : linkTip(hit.link, L), e.clientX, e.clientY);
      });
      svg.addEventListener('pointerleave', function () {
        applyFocus(svg, L, state.pinned || staticFocus(L)); hideTip();
      });
      svg.addEventListener('click', function (e) {     // touch: tap a node to pin its flows, tap elsewhere to clear
        var hit = target(e);
        state.pinned = hit && hit.node && !(state.pinned && state.pinned.nodes[0] === hit.node) ? { nodes: [hit.node] } : null;
        applyFocus(svg, L, state.pinned || staticFocus(L));
      });
      svg.addEventListener('focusin', function (e) {
        var hit = target(e);
        if (!hit || !hit.node) return;
        applyFocus(svg, L, { nodes: [hit.node] });
        var r = hit.node.el.getBoundingClientRect();
        showTip(nodeTip(hit.node, L), r.right, r.top);
      });
      svg.addEventListener('focusout', function () {
        applyFocus(svg, L, state.pinned || staticFocus(L)); hideTip();
      });
      svg.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.activeElement && document.activeElement.blur) document.activeElement.blur();
      });
    }

    function buildTable(L) {
      var det = document.createElement('details');
      det.className = 'sk-table';
      var sm = document.createElement('summary');
      sm.textContent = T.table;
      det.appendChild(sm);
      var rows = L.links.slice().sort(function (a, b) {
        return a.source.col - b.source.col || a.source.y0 - b.source.y0 || a.target.y0 - b.target.y0;
      });
      var html = '<table><thead><tr><th>' + esc(T.from) + '</th><th>' + esc(T.to) + '</th><th class="sk-n">' +
        esc(T.value) + '</th><th class="sk-n">' + esc(T.share) + '</th><th class="sk-n">' + esc(T.shareSrc) +
        '</th></tr></thead><tbody>';
      rows.forEach(function (l) {
        html += '<tr><td>' + esc(plain(l.source.label)) + '</td><td>' + esc(plain(l.target.label)) +
          '</td><td class="sk-n">' + esc(fmt(l.value)) + '</td><td class="sk-n">' + esc(pct(l.value, L.total)) +
          '</td><td class="sk-n">' + esc(pct(l.value, l.source.value)) + '</td></tr>';
      });
      det.insertAdjacentHTML('beforeend', html + '</tbody></table>');
      return det;
    }

    draw();
    if (!opt.width && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(function () {
        var w = Math.floor(host.clientWidth || 0);
        if (Math.abs(w - state.hostW) < 2) return;
        clearTimeout(timer);
        timer = setTimeout(draw, 120);
      });
      ro.observe(host);
    }

    return {
      layout: function () { return state.L; },
      update: function (next) { state.data = next; state.pinned = null; draw(); },
      destroy: function () { if (ro) ro.disconnect(); clearTimeout(timer); hideTip(); host.innerHTML = ''; }
    };
  }

  return { render: render, layout: layout, fromPaths: fromPaths, PALETTE: PALETTE };
}));
