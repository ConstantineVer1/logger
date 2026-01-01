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
- Decide **queue limit** (`maxQueueSize`) to define “queue full”:
  - pick a default number (e.g. `1000`, `10_000`, `100_000`)
  - or require explicit config (no default; throw on init if missing)
