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
