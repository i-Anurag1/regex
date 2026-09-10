import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Check, ChevronRight, Clipboard, Code2, Download, FlaskConical,
  GitBranch, History, Layers3, Lightbulb, Moon, Network, Play, RotateCcw, Sparkles,
  Sun, Terminal, Trash2, Workflow, Zap
} from 'lucide-react';
import { compileRegex } from './lib/api';
import type { Compilation } from './types';
import StatCards from './components/StatCards';
import TokenTable from './components/TokenTable';
import AstView from './components/AstView';
import GraphView from './components/GraphView';
import Transitions from './components/Transitions';
import Simulation from './components/Simulation';
import RegexWorkbench from './components/RegexWorkbench';
import Theory from './pages/Theory';
import Architecture from './pages/Architecture';

const examples = [
  { regex: '(a|b)*abb', label: 'Binary suffix', description: 'Any a/b string ending in abb' },
  { regex: 'a(b|c)*d', label: 'Path pattern', description: 'a, then b/c, then d' },
  { regex: '(0|1)*101', label: 'Binary 101', description: 'Binary strings ending in 101' },
  { regex: '[a-z]+', label: 'Lowercase word', description: 'One or more lowercase letters' },
  { regex: '(ab|cd)?e*', label: 'Optional branch', description: 'ab or cd, followed by e*' },
  { regex: 'epsilon', label: 'Epsilon', description: 'The empty string' },
];

type Tab = 'overview' | 'tokens' | 'ast' | 'nfa' | 'dfa' | 'minimized' | 'simulation' | 'steps';

const tabs: { id: Tab; label: string; icon: typeof Network; hint: string }[] = [
  { id: 'overview', label: 'Overview', icon: Workflow, hint: 'See the compiled machine at a glance' },
  { id: 'tokens', label: 'Lexer', icon: Terminal, hint: 'Inspect lexical tokens' },
  { id: 'ast', label: 'AST', icon: GitBranch, hint: 'Understand the syntax tree' },
  { id: 'nfa', label: 'NFA', icon: Network, hint: 'Thompson construction' },
  { id: 'dfa', label: 'DFA', icon: Layers3, hint: 'Subset construction' },
  { id: 'minimized', label: 'Minimized DFA', icon: Zap, hint: 'Hopcroft minimization' },
  { id: 'simulation', label: 'Simulator', icon: Play, hint: 'Test strings step by step' },
  { id: 'steps', label: 'Algorithms', icon: FlaskConical, hint: 'Inspect construction steps' },
];

function Shell() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark"><Network size={18} /></span>
            <span>RegexLab</span><b>Automata</b>
          </Link>
          <nav className="main-nav">
            <Link to="/">Compiler</Link>
            <Link to="/theory">Theory</Link>
            <Link to="/architecture">Architecture</Link>
          </nav>
          <div className="topbar-status"><span className="status-dot" /> Local compiler online</div>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Compiler />} />
        <Route path="/theory" element={<Theory />} />
        <Route path="/architecture" element={<Architecture />} />
      </Routes>
    </div>
  );
}

function Compiler() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark');
  const [regex, setRegex] = useState('(a|b)*abb');
  const [c, setC] = useState<Compilation>();
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [history, setHistory] = useState<string[]>(() => JSON.parse(localStorage.getItem('regex-history') || '[]'));
  const [copied, setCopied] = useState(false);

  const run = async (value = regex) => {
    if (!value.trim()) return setErr('Enter a regular expression first.');
    setLoading(true); setErr('');
    try {
      const x = await compileRegex(value.trim());
      setC(x); setRegex(value.trim());
      const h = [value.trim(), ...history.filter(item => item !== value.trim())].slice(0, 12);
      setHistory(h); localStorage.setItem('regex-history', JSON.stringify(h));
      setTab('overview');
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setLoading(false); }
  };

  useEffect(() => { void run(); }, []);
  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const exportFile = (name: string, content: string, type: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name; a.click(); URL.revokeObjectURL(a.href);
  };
  const exportJson = () => c && exportFile('regex-compilation.json', JSON.stringify(c, null, 2), 'application/json');
  const exportCsv = () => c && exportFile('minimized-dfa.csv', [['from', 'symbol', 'to'], ...c.minimized_dfa.transitions.map(e => [String(e.from), e.symbol, String(e.to)])].map(r => r.map(x => `"${x.replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv');
  const report = () => c && exportFile('compilation-report.md', `# Regex Compilation Report\n\nRegex: \`${c.regex}\`\n\n${Object.entries(c.stats).map(([k, v]) => `- ${k}: ${v}`).join('\n')}\n\n## Automata\n- NFA states: ${c.nfa.states.length}\n- DFA states: ${c.dfa.states.length}\n- Minimized DFA states: ${c.minimized_dfa.states.length}\n`, 'text/markdown');
  const copyRegex = async () => { await navigator.clipboard.writeText(regex); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  const clearHistory = () => { setHistory([]); localStorage.removeItem('regex-history'); };

  const currentTab = useMemo(() => tabs.find(t => t.id === tab)!, [tab]);

  return (
    <main className="page-wrap">
      <section className="hero-panel">
        <div className="hero-grid" />
        <div className="eyebrow"><span className="eyebrow-icon"><Code2 size={14} /></span> Compiler Design Studio <span className="eyebrow-line" /> 7-stage pipeline</div>
        <div className="hero-copy">
          <div>
            <h1>See a regular expression<br /><span>become a machine.</span></h1>
            <p>Compile, visualize and simulate a regular expression from source text to a minimized deterministic finite automaton. Every stage is inspectable.</p>
          </div>
          <div className="hero-flow" aria-label="Compilation pipeline">
            {['Regex', 'Lexer', 'AST', 'NFA', 'DFA', 'Minimize'].map((x, i) => <span key={x}><b>{String(i + 1).padStart(2, '0')}</b>{x}{i < 5 && <ArrowRight size={14} />}</span>)}
          </div>
        </div>

        <div className="compiler-box">
          <div className="input-label"><span>REGULAR EXPRESSION</span><span>Press Ctrl + Enter to compile</span></div>
          <div className="regex-row">
            <div className="regex-input-wrap"><span className="prompt">/</span><input value={regex} onChange={e => setRegex(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && void run()} spellCheck={false} aria-label="Regular expression" /><span className="prompt">/</span></div>
            <button className="icon-button" onClick={copyRegex} title="Copy regex">{copied ? <Check size={18} /> : <Clipboard size={18} />}</button>
            <button className="primary-button" onClick={() => void run()} disabled={loading}>{loading ? <span className="spinner" /> : <Zap size={17} />}{loading ? 'Compiling' : 'Compile regex'}</button>
          </div>
          <div className="syntax-strip"><span><Check size={14} /> Regular-language semantics</span><span><Check size={14} /> Thompson NFA</span><span><Check size={14} /> Subset construction</span><span><Check size={14} /> Hopcroft minimization</span></div>
          {err && <div className="error-box"><span>Compilation failed</span><p>{err}</p></div>}
        </div>

        <div className="example-section">
          <div className="section-mini-title"><Lightbulb size={15} /> Try an example</div>
          <div className="example-grid">{examples.map(ex => <button key={ex.regex} className="example-card" onClick={() => { setRegex(ex.regex); void run(ex.regex); }}><span className="example-code">{ex.regex}</span><span>{ex.label}</span><small>{ex.description}</small><ChevronRight size={15} /></button>)}</div>
        </div>
      </section>

      {c && <>
        <section className="stats-strip"><div className="stats-title"><span className="live-dot" /> Compilation result</div><StatCards stats={c.stats} /></section>

        <section className="workspace-shell">
          <aside className="workspace-nav">
            <div className="workspace-nav-head"><span>INSPECT</span><small>8 stages</small></div>
            {tabs.map(item => { const Icon = item.icon; return <button key={item.id} className={`workspace-tab ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}><span className="tab-icon"><Icon size={16} /></span><span><b>{item.label}</b><small>{item.hint}</small></span>{tab === item.id && <ChevronRight size={15} />}</button>; })}
            <div className="workspace-tip"><Sparkles size={16} /><b>Learning mode</b><p>Each view exposes the data produced by the previous compiler stage.</p></div>
          </aside>

          <div className="workspace-content">
            <div className="content-heading"><div><div className="breadcrumb">COMPILER / {currentTab.label.toUpperCase()}</div><h2>{currentTab.label}</h2><p>{currentTab.hint}. Regex <code>/{c.regex}/</code></p></div><div className="export-actions"><button onClick={exportJson}><Download size={15} /> JSON</button><button onClick={exportCsv}><Download size={15} /> CSV</button><button onClick={report}><Download size={15} /> Report</button><button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}</button></div></div>

            {tab === 'overview' && <Overview c={c} history={history} setRegex={setRegex} clearHistory={clearHistory} setTab={setTab} />}
            {tab === 'tokens' && <TokenTable tokens={c.tokens} />}
            {tab === 'ast' && <AstView root={c.ast} />}
            {tab === 'nfa' && <div className="stack-gap"><GraphView graph={c.nfa} title="Thompson NFA" subtitle="ε-transitions connect fragments produced by each AST operator." /><Transitions graph={c.nfa} /></div>}
            {tab === 'dfa' && <div className="stack-gap"><GraphView graph={c.dfa} title="Subset Construction DFA" subtitle="Each DFA state represents an ε-closed subset of NFA states." /><Transitions graph={c.dfa} /></div>}
            {tab === 'minimized' && <div className="stack-gap"><GraphView graph={c.minimized_dfa} title="Minimized DFA" subtitle="Equivalent DFA states are merged using Hopcroft partition refinement." /><Transitions graph={c.minimized_dfa} /></div>}
            {tab === 'simulation' && <Simulation regex={c.regex} graph={c.minimized_dfa} />}
            {tab === 'steps' && <AlgorithmSteps c={c} />}
          </div>
        </section>
        <RegexWorkbench compilation={c} />
      </>}
    </main>
  );
}

function Overview({ c, history, setRegex, clearHistory, setTab }: { c: Compilation; history: string[]; setRegex: (x: string) => void; clearHistory: () => void; setTab: (x: Tab) => void }) {
  return <div className="overview-stack">
    <PipelineRail setTab={setTab} />
    <div className="overview-grid">
      <div className="overview-main"><GraphView graph={c.minimized_dfa} title="Your minimized machine" subtitle="This is the smallest DFA produced by the compiler for the current language." /><div className="explain-row"><div><span className="explain-number">01</span><b>Start state</b><p>The machine begins here and consumes the input from left to right.</p></div><div><span className="explain-number">02</span><b>Accepting state</b><p>Double-ring states represent strings accepted by the regular expression.</p></div><div><span className="explain-number">03</span><b>Transition</b><p>Each arrow tells the DFA where to move for one input symbol.</p></div></div></div>
    <div className="overview-side"><section className="pipeline-card"><div className="card-kicker">WHAT HAPPENED</div><h3>Compilation pipeline</h3>{['Lexical analysis', 'Parsing + AST', 'Thompson NFA', 'Subset construction DFA', 'Hopcroft minimization', 'DFA simulation'].map((x, i) => <button key={x} onClick={() => setTab(['tokens', 'ast', 'nfa', 'dfa', 'minimized', 'simulation'][i] as Tab)} className="pipeline-step"><span>{String(i + 1).padStart(2, '0')}</span><b>{x}</b><Check size={14} /></button>)}</section>
      <section className="history-card"><div className="card-kicker"><History size={13} /> RECENT REGEX</div>{history.length ? <div className="history-list">{history.slice(0, 6).map(x => <button key={x} onClick={() => setRegex(x)}><code>{x}</code><ChevronRight size={14} /></button>)}</div> : <p className="muted">Your recent expressions appear here.</p>}<button className="text-button" onClick={clearHistory}><Trash2 size={14} /> Clear history</button></section>
    </div>
    </div>
  </div>;
}

function PipelineRail({ setTab }: { setTab: (x: Tab) => void }) {
  const stages: { id: Tab; number: string; title: string; desc: string }[] = [
    { id: 'tokens', number: '01', title: 'Lex', desc: 'characters → tokens' },
    { id: 'ast', number: '02', title: 'Parse', desc: 'tokens → AST' },
    { id: 'nfa', number: '03', title: 'Thompson', desc: 'AST → NFA' },
    { id: 'dfa', number: '04', title: 'Subset', desc: 'NFA → DFA' },
    { id: 'minimized', number: '05', title: 'Minimize', desc: 'DFA → smallest DFA' },
    { id: 'simulation', number: '06', title: 'Simulate', desc: 'string → decision' },
  ];
  return <section className="pipeline-rail">
    <div className="pipeline-rail-title"><div><span className="card-kicker"><Workflow size={13}/> HOW THE COMPILER WORKS</span><h3>Follow the data from regex to machine</h3></div><span className="pipeline-rail-caption">Click any stage to inspect its output</span></div>
    <div className="pipeline-rail-track">
      {stages.map((stage, i) => <div className="pipeline-rail-item" key={stage.id}>
        <button onClick={() => setTab(stage.id)} className="pipeline-node">
          <span className="pipeline-node-num">{stage.number}</span><span><b>{stage.title}</b><small>{stage.desc}</small></span><ChevronRight size={14}/>
        </button>
        {i < stages.length - 1 && <span className="pipeline-connector"><span /></span>}
      </div>)}
    </div>
  </section>;
}

function AlgorithmSteps({ c }: { c: Compilation }) {
  const subset = c.dfa.subset_steps || [];
  const minimization = c.minimized_dfa.minimization_steps || [];
  return <div className="algorithm-grid"><StepPanel number="01" title="Subset construction" description="The compiler discovers DFA states by repeatedly taking move() followed by ε-closure()." data={subset} /><StepPanel number="02" title="Hopcroft minimization" description="Partition blocks are refined until no two states with different behavior remain together." data={minimization} /></div>;
}
function StepPanel({ number, title, description, data }: { number: string; title: string; description: string; data: unknown[] }) {
  return <section className="algorithm-panel"><div className="algorithm-head"><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></div><pre>{JSON.stringify(data, null, 2)}</pre></section>;
}

export default Shell;
