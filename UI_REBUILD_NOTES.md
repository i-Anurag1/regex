# RegexLab UI Rebuild v3

This release rebuilds the visual layer around a cleaner compiler-workbench layout.

Key changes:
- Replaced the React Flow automata canvas with a deterministic SVG automata renderer.
- Added stable left-to-right state layout with explicit START and ACCEPT semantics.
- Grouped parallel transitions into one labeled edge.
- Added dedicated self-transition loop geometry.
- Added curved reverse transitions to avoid overlapping arrows.
- Added state inspection, zoom, fit, reset, fullscreen, legend, and alphabet display.
- Removed transform-based node animation that interfered with graph geometry.
- Reworked the visual system for tighter spacing, clearer hierarchy, restrained borders, and documentation-grade UI.
- Preserved compiler pipeline, lexer, AST, NFA, DFA, minimization, simulation, validation, algorithms, exports, theory, and architecture views.
