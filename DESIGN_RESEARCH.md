# RegexLab UX and Product Research

## Product position

RegexLab is positioned as a compiler-design workbench, not as a generic regex tester. The primary user journey is:

`Regex source → Lexing → AST → Thompson NFA → Subset DFA → Hopcroft Min-DFA → Simulation → Evidence`

The interface therefore prioritizes inspection, traceability, state-machine literacy, and reproducible testing.

## Research benchmark

### Regex101
Regex101 establishes a strong benchmark for regex editing, explanation, debugging, unit tests, multiple test strings, and quick reference. RegexLab deliberately borrows the idea of a fast test bench and explanatory feedback, but keeps its core semantics grounded in regular-language automata rather than a programming-language regex flavor. See the public Regex101 documentation for its editor, debugger, explanation, unit-test, and multiple-test workflows.

### JFLAP
JFLAP is the strongest academic benchmark for interactive formal-language tooling. Its workflow includes graphical automata construction, tracing, fast simulation, multiple-input testing, NFA→DFA conversion, minimization, and conversion between formal representations. RegexLab follows the same educational principle while replacing the desktop-style UI with a modern web workbench and making the compiler pipeline explicit.

### Automata graph tooling
Graphviz's `dot` layout is designed for directed, layered graphs and explicitly attempts to reduce edge crossings and edge length. RegexLab therefore uses level-based graph placement and state grouping rather than arbitrary force-like placement. For the browser UI, React Flow provides custom edges, edge labels, markers, interaction widths, and custom node components, which are used as rendering primitives rather than as the product's visual language.

### Existing open-source regex-to-automata projects
Existing projects commonly provide Regex→NFA→DFA→Min-DFA conversion, step simulation, transition tables, and graph export. RegexLab differentiates through a more deliberate product flow: each compiler stage has a purpose, each graph is readable as a formal automaton, state inspection is contextual, self-transitions are explicit, and the validation lab connects the diagram to real test strings.

## UX principles adopted

1. One primary action: Compile regex.
2. One persistent source of truth: the current regex appears throughout the workspace.
3. Progressive disclosure: overview first, implementation details second.
4. Every graph has a legend and reading instructions.
5. State semantics are visible: START, ACCEPT, intermediate, incoming, outgoing, and self-loop counts.
6. Self-transitions use a dedicated loop path instead of overlapping straight edges.
7. Multiple symbols between the same states are consolidated into one readable edge label.
8. The minimised DFA is presented as the canonical machine for simulation.
9. Batch testing provides evidence instead of relying on a single example.
10. Exportable JSON, CSV, and Markdown preserve reproducibility.
11. Motion communicates state changes and hierarchy; it does not replace information.
12. The UI avoids an AI chatbot as a decorative feature. The primary differentiator is the compiler and automata system itself.

## Graph requirements

Every automaton view should communicate:

- a single start state
- accepting states using double-ring notation
- directed transition arrows
- transition labels
- epsilon transitions when present
- self-transitions
- alphabet Σ
- state and transition counts
- interactive state inspection
- fit/zoom/reset/fullscreen controls
- a stable layout that does not conflict with React Flow's transform system

## Final review checklist

Before a portfolio or interview demo:

- compile at least one simple regex
- compile a branching regex
- compile a regex with a self-loop
- inspect NFA epsilon transitions
- inspect DFA subset states
- inspect minimized DFA
- run accepted and rejected strings
- run a batch test
- demonstrate JSON/CSV/report export
- explain Thompson, subset construction, and Hopcroft minimization
- explain why backreferences/lookarounds are outside regular-language automata semantics
