import { useMemo, useState } from 'react';
import { CheckCircle2, CircleX, FlaskConical, Play, RotateCcw, Sparkles } from 'lucide-react';
import { batchSimulate } from '../lib/api';
import type { Compilation } from '../types';

type Props = { compilation: Compilation };

const presets = [
  { label: 'Valid suffix', value: 'aabb' },
  { label: 'Valid short', value: 'abb' },
  { label: 'Invalid prefix', value: 'aba' },
  { label: 'Invalid symbol', value: 'abc' },
];

export default function RegexWorkbench({ compilation }: Props) {
  const [input, setInput] = useState('abb');
  const [lines, setLines] = useState('abb\naabb\naba\nabc');
  const [results, setResults] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const normalized = useMemo(() => lines.split(/\r?\n/).map(x => x.trim()).filter(Boolean), [lines]);
  const accepted = results.filter(x => x.accepted).length;
  const rejected = results.length - accepted;

  const run = async () => {
    setBusy(true);
    try {
      const response = await batchSimulate(compilation.regex, [input]);
      setResults(response.results || []);
    } finally {
      setBusy(false);
    }
  };

  const runBatch = async () => {
    setBusy(true);
    try {
      const response = await batchSimulate(compilation.regex, normalized);
      setResults(response.results || []);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="workbench-card">
      <div className="workbench-head">
        <div>
          <div className="card-kicker"><FlaskConical size={13} /> VALIDATION LAB</div>
          <h3>Prove what the machine accepts</h3>
          <p>Run concrete strings against the minimized DFA. This is the fastest way to connect the diagram to real behavior.</p>
        </div>
        <div className="workbench-regex"><span>ACTIVE PATTERN</span><code>/{compilation.regex}/</code></div>
      </div>

      <div className="workbench-single">
        <div className="workbench-field">
          <label>Single input</label>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && void run()} placeholder="Type a string" />
        </div>
        <button className="primary-button compact-button" onClick={() => void run()} disabled={busy}><Play size={15} /> {busy ? 'Running' : 'Test input'}</button>
        <button className="icon-button" onClick={() => { setInput(''); setResults([]); }} title="Reset"><RotateCcw size={16} /></button>
      </div>

      <div className="preset-row">
        {presets.map(p => <button key={p.value} className="preset-chip" onClick={() => setInput(p.value)}><span>{p.label}</span><code>{JSON.stringify(p.value)}</code></button>)}
      </div>

      <div className="batch-lab">
        <div className="batch-editor">
          <div className="workbench-field"><label>Batch inputs <span>one per line</span></label><textarea value={lines} onChange={e => setLines(e.target.value)} /></div>
          <button className="secondary-button compact-button" onClick={() => void runBatch()} disabled={busy}><Sparkles size={15} /> Run batch</button>
        </div>
        <div className="batch-result-panel">
          <div className="batch-summary"><span>{results.length ? `${accepted} accepted · ${rejected} rejected` : 'No run yet'}</span>{results.length > 0 && <span className="result-live">RESULTS</span>}</div>
          <div className="result-list">
            {results.length === 0 ? <div className="empty-result"><span>→</span><div><b>Run a test</b><small>The DFA decision and trace will appear here.</small></div></div> : results.map((item, index) => <div className="result-row" key={`${item.text}-${index}`}><code>{JSON.stringify(item.text)}</code><span className={item.accepted ? 'result-ok' : 'result-bad'}>{item.accepted ? <CheckCircle2 size={14} /> : <CircleX size={14} />}{item.accepted ? 'Accepted' : 'Rejected'}</span></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}
