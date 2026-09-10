<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=32&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&width=700&lines=RegexLab+%E2%80%94+Regex+Compiler;Thompson+NFA+%E2%86%92+Subset+DFA+%E2%86%92+Min-DFA;A+Compiler-Design+Workbench+for+Regular+Expressions" alt="Typing SVG" />

<h3>Turn a regex into tokens, an AST, an NFA, a DFA, and a minimized DFA — visually.</h3>

<p>
  <img src="https://img.shields.io/github/stars/i-Anurag1/regex?style=for-the-badge&color=6366F1&logo=github" />
  <img src="https://img.shields.io/github/forks/i-Anurag1/regex?style=for-the-badge&color=8B5CF6&logo=github" />
  <img src="https://img.shields.io/github/license/i-Anurag1/regex?style=for-the-badge&color=22C55E" />
  <img src="https://img.shields.io/github/actions/workflow/status/i-Anurag1/regex/ci.yml?style=for-the-badge&label=CI&logo=githubactions&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Flow-FF0072?style=for-the-badge&logo=react&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white" />
  <img src="https://img.shields.io/badge/Pytest-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" />
</p>

<a href="#-quick-start">Quick Start</a> •
<a href="#-architecture">Architecture</a> •
<a href="#-supported-syntax">Syntax</a> •
<a href="#-api">API</a> •
<a href="#-demo-flow">Demo</a> •
<a href="#-testing">Testing</a>

</div>

<br/>

## Overview

**RegexLab** is a full-stack compiler-design laboratory for regular expressions — not a generic regex tester. It compiles a pattern through every classical stage of a regex engine and exposes each intermediate artifact in the UI, so it works equally well as a **teaching tool** and a **portfolio project**.

```
Regex → Lexer → Parser → AST → Thompson NFA → Subset DFA → Hopcroft Min-DFA → Simulation
```

<br/>

## 🏗 Architecture

```mermaid
flowchart LR
    A["📝 Regex String"] --> B["🔤 Lexer\n(Tokenizer)"]
    B --> C["🌳 Recursive-Descent\nParser"]
    C --> D["🌲 Abstract Syntax\nTree (AST)"]
    D --> E["🔀 Thompson\nConstruction (NFA)"]
    E --> F["⚡ Epsilon Closure +\nSubset Construction"]
    F --> G["🎯 DFA"]
    G --> H["✂️ Partition Refinement\n(Minimization)"]
    H --> I["✅ Minimized DFA"]
    I --> J["▶️ Deterministic\nSimulation"]

    style A fill:#6366F1,color:#fff,stroke:#4338CA
    style D fill:#8B5CF6,color:#fff,stroke:#6D28D9
    style E fill:#EC4899,color:#fff,stroke:#BE185D
    style G fill:#F59E0B,color:#fff,stroke:#B45309
    style I fill:#22C55E,color:#fff,stroke:#15803D
    style J fill:#06B6D4,color:#fff,stroke:#0E7490
```

### System layers

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend — React + TypeScript + Vite"]
        F1[Graph Rendering<br/>React Flow]
        F2[AST Viewer]
        F3[Token Tables]
        F4[Transition Tables]
        F5[Simulation Panel]
        F6[Statistics]
        F7[Assistant]
        F8[Theory / Architecture Pages]
    end

    subgraph Backend["⚙️ Backend — FastAPI"]
        B1[lexer]
        B2[parser]
        B3[ast]
        B4[automata]
        B5[compiler]
        B6[schemas]
        B7[api]
        B8[core]
    end

    Frontend <-->|REST / JSON| Backend

    style Frontend fill:#1E1B4B,color:#fff,stroke:#6366F1
    style Backend fill:#052E16,color:#fff,stroke:#22C55E
```

<br/>

## ✨ Features

| | |
|---|---|
| 🔍 **Full pipeline visibility** | Inspect tokens, AST, NFA, DFA, and minimized DFA for any regex |
| 🎨 **Interactive automata graphs** | React Flow rendering with START/ACCEPT notation, self-transitions, fit/zoom/reset/fullscreen |
| 🧪 **Simulation lab** | Single and batch string testing with deterministic step traces |
| 📊 **Stats & export** | Export results as JSON, CSV, and a full compilation report |
| 🤖 **Optional AI assistant** | Falls back to deterministic local suggestions — the core compiler never depends on an external AI service |
| 🐳 **One-command deploy** | Docker Compose + Nginx, CI-tested on every push |

<br/>

## 📐 Supported Syntax

RegexLab targets **regular languages**, not engine-specific pattern tricks.

| Category | Supported |
|---|---|
| Literals & concatenation | `abc`, implicit concatenation |
| Alternation / grouping | <code>&#124;</code>, `(...)` |
| Quantifiers | `*`, `+`, `?` |
| Bounded repetition | `{m}`, `{m,n}`, `{m,}` (capped at 100) |
| Epsilon | `ε`, `epsilon` |
| Character classes | `[...]`, ranges, negated ASCII classes, `.` |
| Shorthand classes | `\d` `\D` `\w` `\W` `\s` `\S` |
| Escapes | `\xHH`, `\uHHHH`, escaped metacharacters |
| Anchors | `^`, `$` |

**Intentionally excluded:** backreferences, lookarounds, conditionals, recursion, and other zero-width engine-specific constructs — these fall outside regular-language automata and would break the FAANG-style compiler semantics this project demonstrates.

<br/>

## 🚀 Quick Start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API docs → `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```
App → `http://localhost:5173`

### Docker (full stack)

```bash
docker compose up --build
```
App → `http://localhost:8080`

<br/>

## 🔌 API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/compile` | `{ "regex": "(a\|b)*abb" }` → full pipeline artifacts |
| `POST` | `/api/simulate` | `{ "regex": "a+", "text": "aaa" }` → step-by-step trace |
| `POST` | `/api/batch-simulate` | `{ "regex": "a+", "strings": ["a", "aa", "b"] }` |
| `POST` | `/api/assistant` | Optional — deterministic local fallback without credentials |

<br/>

## 🎬 Demo Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as RegexLab UI
    participant API as FastAPI Backend

    U->>UI: Enter (a|b)*abb
    UI->>API: POST /api/compile
    API-->>UI: tokens, AST, NFA, DFA, min-DFA
    UI-->>U: Show token positions
    UI-->>U: Explain AST & precedence
    UI-->>U: Render Thompson NFA (ε-edges)
    UI-->>U: Render Subset DFA
    UI-->>U: Render Minimized DFA
    U->>UI: Simulate "aabb" / "aba"
    UI->>API: POST /api/simulate
    API-->>UI: deterministic trace
    U->>UI: Run batch tests
    UI->>API: POST /api/batch-simulate
    U->>UI: Export JSON / CSV / Report
```

1. Open `(a|b)*abb`
2. Compile → show token positions
3. Explain the AST and operator precedence
4. Open the Thompson NFA → point out epsilon edges
5. Open the DFA → explain epsilon closure and subsets
6. Open the minimized DFA → explain partition refinement
7. Simulate `aabb` and `aba`
8. Run batch tests
9. Export JSON, CSV, and a compilation report
10. Show **Theory**, **Architecture**, `PROJECT_REPORT.md`, and `VIVA.md`

<br/>

## ✅ Testing

```bash
make backend-test
make backend-check
cd frontend && npm test -- --run
cd frontend && npm run lint
cd frontend && npm run build
```

Backend coverage includes valid syntax, malformed syntax, shorthand classes, escaped operators, bounded repetition, anchors, wildcard matching, determinism, and minimized-automata correctness. CI runs Python tests, compilation checks, frontend build, and frontend tests on every push.

<br/>

## 🎯 Product Direction

RegexLab is built as a **compiler-design workbench**, not a generic regex tester. The primary journey is:

**Regex → Lexer → AST → Thompson NFA → Subset DFA → Hopcroft Min-DFA → Simulation**

The automata workspace features explicit START/ACCEPT notation, readable transition labels, dedicated self-transition rendering, state inspection, fit/zoom/reset/fullscreen controls, a legend, and a validation lab for single and batch inputs.

See [`DESIGN_RESEARCH.md`](./DESIGN_RESEARCH.md) for the full product and UX rationale.

<br/>

<div align="center">

### ⭐ If this project helped you understand automata theory, consider starring it!

<img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F%20and%20Automata%20Theory-6366F1?style=for-the-badge" />

</div>
