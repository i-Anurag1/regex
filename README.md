# Regex Compiler and Automata Visualizer

A full-stack compiler-design laboratory for regular expressions. It turns a regex into tokens, an AST, Thompson NFA, subset-construction DFA, minimized DFA, and a deterministic simulation trace. The UI exposes the intermediate artifacts so the project works both as a teaching tool and as a portfolio project.

## Stack

Frontend: React, TypeScript, Vite, Tailwind CSS, React Flow
Backend: Python, FastAPI, Pydantic
Algorithms: recursive-descent parsing, Thompson construction, epsilon closure, subset construction, partition-refinement DFA minimization
Testing: Pytest, Vitest
Deployment: Docker Compose, Nginx, GitHub Actions

## Supported regex language

The compiler targets regular languages rather than engine-specific features. Supported syntax includes literals, implicit concatenation, `|`, `*`, `+`, `?`, grouping, epsilon (`ε` or `epsilon`), character classes, ranges, negated ASCII classes, `.`, escaped metacharacters, `\\d`, `\\D`, `\\w`, `\\W`, `\\s`, `\\S`, `\\xHH`, `\\uHHHH`, `^`, `$`, and bounded repetition `{m}`, `{m,n}`, `{m,}`. Repetition bounds are capped at 100 to keep automata finite and responsive.

Backreferences, lookarounds, conditionals, recursion, and engine-specific zero-width constructs are intentionally excluded because they are outside regular-language automata and would make the compiler semantics differ from the FAANG-style compiler pipeline demonstrated here.

## Architecture

`Regex -> Lexer -> Parser -> AST -> Thompson NFA -> Subset DFA -> Minimization -> Simulation`

Backend modules are separated into `lexer`, `parser`, `ast`, `automata`, `compiler`, `schemas`, `api`, and `core`. The frontend separates graph rendering, AST rendering, token tables, transitions, simulation, statistics, assistant, theory, and architecture pages.

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
# Linux/macOS
source .venv/bin/activate
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Tests and checks

```bash
make backend-test
make backend-check
cd frontend && npm test -- --run
cd frontend && npm run lint
cd frontend && npm run build
```

### Docker

```bash
docker compose up --build
```

Open `http://localhost:8080`.

## API

`GET /api/health`

`POST /api/compile` with `{ "regex": "(a|b)*abb" }`

`POST /api/simulate` with `{ "regex": "a+", "text": "aaa" }`

`POST /api/batch-simulate` with `{ "regex": "a+", "strings": ["a", "aa", "b"] }`

`POST /api/assistant` is optional. Without credentials it uses deterministic local suggestions, so the compiler never depends on an AI service.

## Demo flow

1. Open `(a|b)*abb`.
2. Compile and show token positions.
3. Explain the AST and precedence.
4. Open the Thompson NFA and point out epsilon edges.
5. Open the DFA and explain epsilon closure and subsets.
6. Open minimized DFA and explain partition refinement.
7. Simulate `aabb` and `aba`.
8. Run batch tests.
9. Export JSON, CSV, and a compilation report.
10. Show Theory, Architecture, PROJECT_REPORT.md, and VIVA.md.

## Project quality

The backend has unit and API tests for valid syntax, malformed syntax, shorthand classes, escaped operators, bounded repetition, anchors, wildcard matching, determinism, and minimized automata. The CI workflow runs Python tests, compilation checks, frontend build, and frontend tests.

## Product and UX direction

RegexLab is designed as a compiler-design workbench rather than a generic regex tester. The primary journey is Regex → Lexer → AST → Thompson NFA → Subset DFA → Hopcroft Min-DFA → Simulation. The automata workspace uses explicit START/ACCEPT notation, readable transition labels, dedicated self-transition rendering, state inspection, fit/zoom/reset/fullscreen controls, a legend, and a validation lab for single and batch inputs. See `DESIGN_RESEARCH.md` for the product and UX rationale.
