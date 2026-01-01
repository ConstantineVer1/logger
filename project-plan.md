# Project plan: universal logger (JavaScript/Node.js, prototypes)

Rules: обсуждаем **по пунктам**, без “всё сразу”. Термины — **English**, общение — **Russian**.

## Plan (draft)
1. **API & semantics** (обсуждаем первым)
2. **Repository structure** (`code/`, entrypoints, exports)
3. **Core engine** (`Logger` via `prototypes`)
4. **Transports** (console/stream/file)
5. **Formatters/serializers** (NDJSON, pretty, error serialization, redaction)
6. **Testing** (обязательно; цель `100% coverage`)
7. **Performance** (benchmarks, hot path)
8. **Docs & DX** (examples, typings)

## 1) API & semantics — decisions & next question
- **Decision**: `Pino-style` accepted: `logger.info(meta, msg)` (no dual-support)
- **Decision**: output is per-transport
  - `console` transport: `pretty` (human-readable)
  - log/collector transport: `NDJSON` (JSON lines)
- **Decision**: levels are `fixed`: `trace`, `debug`, `info`, `warn`, `error`, `fatal`
- **Decision**: default minimum level is `info`
- **Decision**: if an unknown level is provided by config/user input, fallback to `info`
- **Decision**: `Error` is passed only via `meta.err` (no extra `Error` argument forms)
- **Decision**: for immutability we use `Object.freeze` (shallow) when we choose to protect objects; `deepFreeze` is explicitly out-of-scope for now (later).
- **Decision**: `child()` uses **locked keys** (configurable)
- **Decision**: attempting to override a locked key => **throw** (and also log the violation)
- **Decision**: default locked keys list: `app`, `service`, `env`, `version`, `hostname`, `pid`
- **Decision**: strict mode — locked-key override is **always throw** (no `ignore` mode)
- **Decision**: logging pipeline is **async by default** (buffer/queue; must handle backpressure)
- **Decision**: backpressure policy (queue full) => **crash** (fail-fast)
- **Decision**: crash semantics => **throw** from `logger.*()` (no `process.exit`)
- **Next question (answer one)**: queue limit (definition of “queue full”)
  - fixed default size (pick a number)
  - or require explicit config (no default)

---

## Stop / Resume checkpoint

### Where we stopped
- We are still in **Plan пункт 1**: `API & semantics`

### Decisions locked (so far)
- `Pino-style` API: `logger.info(meta, msg)` (no dual-support)
- Output per transport: `console` => `pretty`, logs/collector => `NDJSON`
- Levels: fixed `trace|debug|info|warn|error|fatal`; default min level `info`; unknown level => fallback `info`
- `Error` passing: only `meta.err`
- Immutability: `Object.freeze` (shallow) when needed; `deepFreeze` later
- `child()`:
  - locked keys (configurable), default: `app|service|env|version|hostname|pid`
  - overriding locked key => **throw** (and log violation), strict (no ignore mode)
- Async pipeline: default `async` + explicit backpressure handling
- Backpressure policy: queue full => **crash** (fail-fast)
- Crash semantics: **throw** from `logger.*()` (process policy belongs to the app)

### Next (continue discussion from here)
- ✅ **Done**: queue limit locked — default `maxQueueSize = 10_000`

### Next (continue discussion from here, step-by-step)
#### Q1: shutdown semantics (lifecycle)
- Do we need explicit lifecycle methods (`flush()`, `close()`), or do we rely purely on process exit?
- If lifecycle exists: do we have a default `timeoutMs` for draining/closing?

#### Q2: per-record delivery control via “in-flight mass” (promises/markers)
Direction (from discussion):
- Track **every accepted record** in an in-flight structure (conceptually “mass” of promises/markers).
- When transport produces an “ack”, remove the marker.
- On program completion signal, if any in-flight remains => emit a **critical error** directly to console/stderr (must not be silent) and then terminate.

Open design details to decide (non-abstract, but required):
- What is “ack” for each transport type (`console`, `stream/file`, `network`)?
- Do we allow **fan-out** (one record -> multiple transports), or enforce **one logger = one transport** and multi-channel via multiple logger instances?
- Reconcile termination policy with earlier decision “crash semantics => throw from `logger.*()` (no `process.exit`)”.
