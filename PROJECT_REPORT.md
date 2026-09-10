# Project Report: Regex Compiler and Automata Visualizer

## 1. Objective

Build a deterministic compiler pipeline for regular expressions and expose every intermediate representation through an interactive web application. The system is designed for Compiler Design and Theory of Computation demonstrations.

## 2. Pipeline

1. Lexical analysis: converts source text into positioned tokens.
2. Parsing: recursive-descent parser enforces precedence and syntax.
3. AST: stores operator structure and source spans.
4. Thompson construction: converts the AST into an epsilon-NFA.
5. Subset construction: computes epsilon closures and DFA subsets.
6. DFA minimization: partition refinement removes equivalent states.
7. Simulation: walks the minimized DFA over an input string.

## 3. Grammar

```text
regex      := union
union      := concat ('|' concat)*
concat     := repeat+
repeat     := atom ('*' | '+' | '?' | '{m}' | '{m,n}' | '{m,}')*
atom       := literal | class | epsilon | group | '^'
group      := '(' union ')'
```

`$` is supported as the final full-string anchor. Character classes support ranges, negation, escaped characters, and common shorthands. The compiler uses an ASCII universe for wildcard and negated-class expansion.

## 4. Correctness

Thompson construction preserves the language of every AST node. Subset construction maps each DFA state to an epsilon-closed NFA state set. Accepting DFA states are exactly the subsets containing the NFA accepting state. Partition refinement preserves DFA language equivalence. Simulation follows one deterministic transition per input symbol.

## 5. Complexity

Let `n` be the AST size and `k` the DFA alphabet size. Thompson construction uses O(n) NFA states. Subset construction has worst-case O(2^n) DFA states and O(k * 2^n) transition work. DFA simulation is O(|input|). DFA minimization is implemented with partition refinement and operates over the completed transition relation.

## 6. Engineering

Backend: FastAPI, Pydantic, modular compiler packages, API validation, deterministic fallback assistant, automated tests.

Frontend: React + TypeScript, Tailwind CSS, React Flow, responsive dashboard, interactive automata, AST and token views, history, batch simulation, exports, theory and architecture pages.

Deployment: Docker Compose with a FastAPI service and an Nginx-served production frontend. GitHub Actions runs backend tests, Python compilation checks, frontend build, and frontend tests.

## 7. Supported syntax

Literals, concatenation, union, `*`, `+`, `?`, groups, epsilon, classes, ranges, negated ASCII classes, `.`, `\\d`, `\\D`, `\\w`, `\\W`, `\\s`, `\\S`, `\\xHH`, `\\uHHHH`, `^`, `$`, and bounded repetition.

Non-regular engine features such as backreferences and lookaround are excluded by design. They do not map directly to the finite automata pipeline presented by this project.

## 8. Test plan

Tests cover basic literals, union, concatenation, closure operators, character classes, shorthand classes, bounded repetition, anchors, wildcard matching, escaped operators, epsilon, malformed syntax, determinism, API validation, and minimized automata.

## 9. Showcase points

The strongest professor or interview demonstration is `(a|b)*abb`. It shows precedence, AST structure, epsilon transitions, subset construction, state reduction, and accepted/rejected simulations in one example. Exported JSON gives a machine-readable representation of the full compilation result.

## 10. Future scope

Possible extensions include Unicode interval alphabets, DFA equivalence checking, regex equivalence counterexamples, grammar editor support, Web Workers for large automata, persistent server-side projects, and formal property-based testing.
