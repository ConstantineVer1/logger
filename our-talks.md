# our-talks.md - Discussion Log

This file tracks important insights, questions, and decisions from our learning sessions.

---

### 2026-01-01 | Session: universal logger kickoff
- **User goal**: build a universal `logger` for `JavaScript`/`Node.js`, implemented via `prototypes`, step-by-step; this project is both production and training.
- **User constraints**:
  - communicate in Russian; technical terms in English
  - create an explicit development plan; item **#6** must be `testing`
  - `testing` should be comprehensive, target `100% coverage`
- **Repo state discovered**:
  - `code/` exists but is empty
  - `learning-path.md` is empty
  - present docs: `cloude.md`, `resources.md`, `results.md`, `our-talks.md`
  - no `results/` folder (only `results.md`)
- **Decision**: append requirements + plan into `cloude.md`, then bootstrap the logger implementation in `code/`.

### 2026-01-01 | Adjustment: planning workflow
- **User feedback**: move plan out of `cloude.md`, remove repo inventory there; discuss plan point-by-point (no detail-dump).
- **Decision**: keep only requirements in `cloude.md`, create `project-plan.md` for the plan draft and questions for пункт 1.

### 2026-01-01 | Constraint reaffirmed
- **User constraint**: we are working on the `plan` only right now; no code changes until explicit "кодим".
- **Decision**: lock in `Pino-style` API decision and proceed пункт-by-пункт.

### 2026-01-01 | Output format decision
- **Decision**: support two output modes via transports:
  - `console` => `pretty` (human-readable)
  - logs/collector => `NDJSON` (JSON lines)

### 2026-01-01 | Levels decision
- **Decision**: levels are `fixed` (`trace|debug|info|warn|error|fatal`)
- **Decision**: default minimum level is `info`; unknown level input falls back to `info`

### 2026-01-01 | Error passing decision
- **Decision**: `Error` is passed only via `meta.err` (strict `Pino-style`, no extra argument forms)

### 2026-01-01 | Immutability note
- **Decision**: use `Object.freeze` (shallow) when we want to protect objects; `deepFreeze` deferred for later study.

### 2026-01-01 | child() locked keys
- **Decision**: introduce configurable `locked keys` for identity fields; overriding them in `child()` triggers **throw** (and we log the violation).

### 2026-01-01 | Locked keys default set
- **Decision**: default `locked keys` include `hostname` and `pid` in addition to `app|service|env|version`.

### 2026-01-01 | Locked keys strictness
- **Decision**: locked-key override policy is strict: **always throw**, no `ignore` mode.

### 2026-01-01 | Async pipeline decision
- **Decision**: logging pipeline should be **async by default** (non-blocking; handle backpressure explicitly).

### 2026-01-01 | Backpressure policy decision
- **Decision**: on queue full, policy is **crash** (fail-fast) for clarity.

### 2026-01-01 | Crash semantics
- **Decision**: crash is implemented as `throw` from `logger.*()`; we do not terminate the process (`process.exit` left to application policy).

### 2026-01-01 | User correction: scope of reading
- **User instruction**: read all files **except** folder `code/`.
- **Assistant mistake**: read files inside `code/` despite instruction (user called it out as rude/token-wasting).
- **Decision (process)**: do not open `code/` unless user explicitly requests it; continue planning based on docs only.

### 2026-01-01 | Queue limit decision
- **Decision**: default `maxQueueSize = 10_000`.

### 2026-01-01 | Discussion: async delivery control / "in-flight mass"
- **User direction**: discuss planning like architects/system designers; component is meant to be reused across projects.
- **Topic**: shutdown semantics (`flush/close`) vs per-record delivery tracking/ack.
- **User proposal**: every log record is tracked via an in-flight structure (conceptually a “mass” of promises/markers); on ack it is removed; on program completion signal, if any in-flight remain => emit a critical error to console/stderr (not silent) and then terminate.
- **User stance**: prefer quality/control even if heavier; add an explicit warning in component docs about heavier modes/cost (price vs quality), avoid “corner cutting” that weakens guarantees.

### 2026-01-01 | Clarifications & communication style
- **User requirement**: communication in **Russian**, all technical terms in **English**; discuss **step-by-step**, not “всё сразу”.
- **User feedback**: keep the plan discussion at the level of two architects/system designers building a reusable component.

### 2026-01-01 | Transport model clarification (fan-out vs one-way)
- **Assistant concern raised**: if one record fans out to multiple transports, “done/ack” semantics become ambiguous (when to remove from in-flight mass).
- **User clarification**: prefer “one-way” logging; if multi-channel is needed, use multiple loggers/channels rather than mandatory multi-transport fan-out.

### 2026-01-01 | Stop / Resume (updated)
- **We are in**: Plan пункт 1 — `API & semantics`
- **Next**: decide shutdown semantics + formalize “in-flight mass” approach (ack definition, fan-out policy, termination semantics).
