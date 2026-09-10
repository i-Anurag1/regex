import { GitBranch } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Node } from '../types';
export default function AstView({ root }: { root: Node }) {
  const render = (n: Node): ReactNode => <li key={n.id}><div className={`ast-node ast-${n.kind.toLowerCase()}`}><span className="ast-kind">{n.kind}</span>{n.value !== undefined && <code>{JSON.stringify(n.value)}</code>}<span className="ast-span">{n.start}:{n.end}</span></div>{n.children.length > 0 && <ul>{n.children.map(render)}</ul>}</li>;
  return <section className="data-card ast-card"><div className="data-card-head"><div><div className="card-kicker"><GitBranch size={13}/> SYNTAX TREE</div><h3>Abstract Syntax Tree</h3><p>Parser precedence is visible in the tree structure. Repetition binds before concatenation, then union.</p></div></div><div className="ast-viewport"><ul className="ast-tree">{render(root)}</ul></div></section>;
}
