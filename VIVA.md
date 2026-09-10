# Viva Preparation

## Core questions

### Why use Thompson construction?
It provides a direct structural translation from a regex AST to an epsilon-NFA. Each AST operator has a small construction, so the proof follows the syntax tree.

### Why is the DFA deterministic?
A DFA state represents one epsilon-closed subset of NFA states. For a fixed subset and input symbol, the resulting closure is unique.

### Why minimize the DFA?
Equivalent states accept the same suffix language. Merging them reduces the machine while preserving the accepted language.

### What is epsilon closure?
It is the set of states reachable using zero or more epsilon transitions.

### Why is subset construction exponential?
An NFA with `n` states has up to `2^n` subsets, and each reachable subset is a possible DFA state.

### What is the simulation complexity?
O(m) for an input of length `m`, after compilation, because each character performs one DFA transition.

### Why are backreferences excluded?
Backreferences refer to previously matched text and are outside regular languages. The finite automata pipeline represents regular languages, so supporting them would require different semantics.

### Why support `{m,n}`?
It is a regular-language repetition operator. The compiler expands bounded copies into a finite Thompson construction.

### How are errors reported?
The lexer records source spans. Parser and lexer errors include the failing position and an actionable message.

## Demo questions

1. Compile `(a|b)*abb`.
2. Explain why `*` binds tighter than `|`.
3. Show the AST.
4. Explain one epsilon closure from the DFA trace.
5. Identify an accepting DFA state.
6. Show how minimization partitions states.
7. Simulate `aabb`.
8. Simulate `aba` and explain rejection.
9. Run a batch test.
10. Export the compilation result.

## Interview-level extensions

Discuss parser design, deterministic state representation, transition-table complexity, sink-state completion during minimization, automata visualization, API validation, testing strategy, and why regular-expression engine features differ from formal regular expressions.
