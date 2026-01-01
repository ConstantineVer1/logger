function ConsoleTransport(options) {
  if (!(this instanceof ConsoleTransport)) return new ConsoleTransport(options);
  const opts = options && typeof options === "object" ? options : {};
  this._console = opts.console || console;
}

ConsoleTransport.prototype.write = function write(record) {
  // NDJSON by default; easy to pipe to collectors
  const line = safeStringify(record);

  const c = this._console;
  const lvl = record && typeof record.level === "string" ? record.level : "info";

  if (lvl === "error" || lvl === "fatal") return c.error(line);
  if (lvl === "warn") return c.warn(line);
  if (lvl === "debug" || lvl === "trace") return c.debug ? c.debug(line) : c.log(line);
  return c.log(line);
};

function safeStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return JSON.stringify({
      time: Date.now(),
      level: "error",
      msg: "logger: failed to stringify record",
      err: {
        type: e && e.name ? String(e.name) : "Error",
        message: e && e.message ? String(e.message) : "",
        stack: e && e.stack ? String(e.stack) : ""
      }
    });
  }
}

module.exports = ConsoleTransport;

