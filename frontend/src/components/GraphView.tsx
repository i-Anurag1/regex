import { useMemo, useState } from 'react';
import { Check, CheckCircle2, Info, Maximize2, Minimize2, Network, RotateCcw, ScanSearch, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { Edge, Graph } from '../types';

type Point = { x: number; y: number };
type Layout = { positions: Map<number, Point>; width: number; height: number; radius: number };

function buildLayout(graph: Graph): Layout {
  const outgoing = new Map<number, number[]>();
  const incoming = new Map<number, number[]>();
  graph.states.forEach(s => { outgoing.set(s.id, []); incoming.set(s.id, []); });
  graph.transitions.forEach(t => {
    if (t.from !== t.to) {
      outgoing.get(t.from)?.push(t.to);
      incoming.get(t.to)?.push(t.from);
    }
  });

  const level = new Map<number, number>([[graph.start, 0]]);
  const queue = [graph.start];
  while (queue.length) {
    const id = queue.shift()!;
    for (const next of outgoing.get(id) || []) {
      if (!level.has(next)) {
        level.set(next, (level.get(id) ?? 0) + 1);
        queue.push(next);
      }
    }
  }
  const maxKnown = Math.max(0, ...Array.from(level.values()));
  graph.states.forEach(s => { if (!level.has(s.id)) level.set(s.id, maxKnown + 1); });

  const buckets = new Map<number, number[]>();
  graph.states.forEach(s => {
    const l = level.get(s.id) ?? 0;
    buckets.set(l, [...(buckets.get(l) || []), s.id]);
  });

  const layers = [...buckets.keys()].sort((a, b) => a - b);
  const maxCount = Math.max(1, ...layers.map(l => buckets.get(l)!.length));
  const xGap = 205;
  const yGap = 150;
  const padX = 125;
  const padY = 145;
  const width = Math.max(980, padX * 2 + Math.max(0, layers.length - 1) * xGap);
  const height = Math.max(470, padY * 2 + (maxCount - 1) * yGap);
  const positions = new Map<number, Point>();

  layers.forEach((l, layerIndex) => {
    const ids = [...buckets.get(l)!].sort((a, b) => {
      const score = (id: number) => (incoming.get(id) || []).reduce((sum, from) => sum + (level.get(from) ?? l), 0);
      return score(a) - score(b) || a - b;
    });
    ids.forEach((id, index) => {
      positions.set(id, {
        x: padX + layerIndex * xGap,
        y: height / 2 + (index - (ids.length - 1) / 2) * yGap,
      });
    });
  });
  return { positions, width, height, radius: 31 };
}

function groupedTransitions(transitions: Edge[]) {
  const map = new Map<string, Edge[]>();
  transitions.forEach(t => {
    const key = `${t.from}:${t.to}`;
    map.set(key, [...(map.get(key) || []), t]);
  });
  return [...map.values()].map(list => ({
    from: list[0].from,
    to: list[0].to,
    label: list.map(t => t.symbol === 'epsilon' ? 'ε' : t.symbol).join(', '),
    self: list[0].from === list[0].to,
  }));
}

function State({ id, point, radius, start, accept, selected, onClick }: {
  id: number; point: Point; radius: number; start: boolean; accept: boolean; selected: boolean; onClick: () => void;
}) {
  return (
    <g className={`diagram-state ${selected ? 'selected' : ''}`} onClick={onClick} role="button" tabIndex={0}>
      {start && <g className="svg-start">
        <line x1={point.x - 82} y1={point.y} x2={point.x - radius - 9} y2={point.y} className="svg-start-line" />
        <path d={`M ${point.x-radius-9} ${point.y} l -9 -6 M ${point.x-radius-9} ${point.y} l -9 6`} className="svg-arrow" />
        <text x={point.x - 82} y={point.y - 14}>START</text>
      </g>}
      <circle cx={point.x} cy={point.y} r={radius} className={`svg-state ${start ? 'start-state' : ''} ${accept ? 'accept-state' : ''}`} />
      {accept && <circle cx={point.x} cy={point.y} r={radius - 6} className="svg-accept-ring" />}
      <text x={point.x} y={point.y + 5} textAnchor="middle" className="svg-state-label">q{id}</text>
      {accept && <g className="svg-accept-badge">
        <circle cx={point.x + 23} cy={point.y + 23} r="10" />
        <Check size={11} x={point.x + 17.5} y={point.y + 17.5} />
      </g>}
      {accept && <text x={point.x} y={point.y + radius + 25} textAnchor="middle" className="svg-accept-text">ACCEPT</text>}
    </g>
  );
}

export default function GraphView({ graph, title, subtitle }: { graph: Graph; title: string; subtitle?: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const layout = useMemo(() => buildLayout(graph), [graph]);
  const transitions = useMemo(() => groupedTransitions(graph.transitions), [graph]);
  const selectedState = selected === null ? undefined : graph.states.find(s => s.id === selected);
  const selectedEdges = selected === null ? [] : graph.transitions.filter(t => t.from === selected || t.to === selected);
  const alphabet = graph.alphabet.map(x => x === 'epsilon' ? 'ε' : x);
  const edgePaths = useMemo(() => transitions.map((t, index) => {
    const a = layout.positions.get(t.from)!;
    const b = layout.positions.get(t.to)!;
    if (t.self) {
      const top = a.y - 31;
      return { ...t, id: `edge-${index}`, path: `M ${a.x-20} ${top+8} C ${a.x-82} ${top-80}, ${a.x+82} ${top-80}, ${a.x+20} ${top+8}`, labelX: a.x, labelY: top-72 };
    }
    const reverse = transitions.some(x => x.from === t.to && x.to === t.from);
    const curve = reverse ? (t.from < t.to ? -48 : 48) : 0;
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / len;
    const ny = dx / len;
    const cx = midX + nx * curve;
    const cy = midY + ny * curve;
    const ux = dx / len;
    const uy = dy / len;
    const sx = a.x + ux * 32;
    const sy = a.y + uy * 32;
    const ex = b.x - ux * 32;
    const ey = b.y - uy * 32;
    return { ...t, id: `edge-${index}`, path: `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`, labelX: (sx + 2*cx + ex)/4, labelY: (sy + 2*cy + ey)/4 };
  }), [transitions, layout]);

  const toggleFullscreen = () => {
    const el = document.querySelector('.automata-diagram-shell') as HTMLElement | null;
    if (!document.fullscreenElement) { void el?.requestFullscreen?.(); setFullscreen(true); }
    else { void document.exitFullscreen?.(); setFullscreen(false); }
  };

  return (
    <section className="graph-card clean-graph-card">
      <header className="clean-graph-header">
        <div>
          <div className="card-kicker"><Network size={14} /> AUTOMATA VISUALIZER <span className="live-chip">LIVE</span></div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="clean-graph-meta">
          <span><b>{graph.states.length}</b><small>states</small></span>
          <span><b>{graph.transitions.length}</b><small>transitions</small></span>
          <span><b>{graph.alphabet.length}</b><small>symbols</small></span>
        </div>
      </header>

      <div className="diagram-toolbar-row">
        <div className="diagram-instruction"><Info size={14} /><span>Read left → right. Double ring = accepting state. Click any state for details.</span></div>
        <div className="diagram-toolbar">
          <button onClick={() => setZoom(1)} title="Fit"><ScanSearch size={14} /> Fit</button>
          <button onClick={() => setZoom(z => Math.max(.65, +(z-.1).toFixed(2)))} title="Zoom out"><ZoomOut size={14} /></button>
          <span>{Math.round(zoom*100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.6, +(z+.1).toFixed(2)))} title="Zoom in"><ZoomIn size={14} /></button>
          <button onClick={() => setZoom(1)} title="Reset"><RotateCcw size={14} /></button>
          <button onClick={toggleFullscreen} title="Fullscreen">{fullscreen ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}</button>
        </div>
      </div>

      <div className="automata-diagram-shell">
        <svg className="automata-svg" viewBox={`0 0 ${layout.width} ${layout.height}`} style={{ transform: `scale(${zoom})` }} aria-label={title}>
          <defs>
            <marker id="regexlab-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          <g className="svg-edges">
            {edgePaths.map(edge => <g key={edge.id} className="svg-edge">
              <path d={edge.path} markerEnd="url(#regexlab-arrow)" />
              <g transform={`translate(${edge.labelX},${edge.labelY})`}>
                <rect x={-(Math.max(18, edge.label.length*4.1)+10)} y="-11" width={Math.max(36, edge.label.length*8.2+20)} height="22" rx="7" />
                <text textAnchor="middle" y="4">{edge.label}</text>
              </g>
            </g>)}
          </g>
          <g>
            {graph.states.map(s => {
              const p = layout.positions.get(s.id)!;
              return <State key={s.id} id={s.id} point={p} radius={layout.radius} start={!!s.start} accept={!!s.accept} selected={selected === s.id} onClick={() => setSelected(s.id)} />;
            })}
          </g>
        </svg>

        <div className="diagram-legend">
          <span><i className="legend-start-dot" /> Start</span>
          <span><i className="legend-state-dot" /> State</span>
          <span><i className="legend-accept-dot" /> Accepting</span>
          <span><i className="legend-loop-dot" /> Self-transition</span>
        </div>

        {selectedState && <aside className="clean-inspector">
          <div className="clean-inspector-head">
            <div><span className="card-kicker">STATE INSPECTOR</span><strong>q{selectedState.id}</strong></div>
            <button onClick={() => setSelected(null)}><X size={15}/></button>
          </div>
          <div className="clean-inspector-tags">
            {selectedState.start && <span className="inspector-start">START</span>}
            {selectedState.accept && <span className="inspector-accept">ACCEPT</span>}
            {!selectedState.start && !selectedState.accept && <span>INTERMEDIATE</span>}
          </div>
          <div className="clean-inspector-grid">
            <div><small>Incoming</small><b>{selectedEdges.filter(e => e.to === selectedState.id).length}</b></div>
            <div><small>Outgoing</small><b>{selectedEdges.filter(e => e.from === selectedState.id).length}</b></div>
            <div><small>Loops</small><b>{selectedEdges.filter(e => e.from === selectedState.id && e.to === selectedState.id).length}</b></div>
          </div>
          <div className="clean-inspector-list">
            {selectedEdges.slice(0, 8).map((e, i) => <div key={`${e.from}-${e.to}-${i}`}><code>{e.symbol === 'epsilon' ? 'ε' : e.symbol}</code><span>q{e.from} → q{e.to}</span></div>)}
          </div>
        </aside>}

        <div className="diagram-alphabet"><b>Σ</b>{alphabet.length ? alphabet.map(x => <code key={x}>{x}</code>) : <code>ε</code>}</div>
      </div>

      <footer className="clean-graph-footer">
        <div><strong>How to read this diagram</strong><span>The machine starts at START, follows one transition per consumed symbol, and accepts only when the complete input ends in a double-ring state.</span></div>
        <span className="compiled-badge"><CheckCircle2 size={14}/> Deterministic view</span>
      </footer>
    </section>
  );
}
