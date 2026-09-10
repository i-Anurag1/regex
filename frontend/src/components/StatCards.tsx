import { Activity, Braces, Clock3, Hash, Network, Sigma, Workflow } from 'lucide-react';
const labels = [
  ['token_count','Tokens',TerminalIcon], ['ast_nodes','AST nodes',Braces], ['nfa_states','NFA states',Network], ['dfa_states','DFA states',Workflow], ['minimized_states','Minimized',Activity], ['alphabet_size','Alphabet',Sigma], ['compilation_ms','Compile time',Clock3]
] as const;
export default function StatCards({ stats }: { stats: Record<string, number> }) { return <div className="stats-grid">{labels.map(([key,label,Icon]) => <div className="stat-card" key={key}><span className="stat-icon"><Icon size={16} /></span><div><small>{label}</small><strong>{stats[key]}</strong></div></div>)}</div>; }
function TerminalIcon({size=16}:{size?:number}){ return <Hash size={size}/>; }
