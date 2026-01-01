const { LEVELS, normalizeLevel, levelName } = require("./levels");
const ConsoleTransport = require("./transports/console-transport");

function Logger(options) {
  if (!(this instanceof Logger)) return new Logger(options);

  const opts = options && typeof options === "object" ? options : {};

  const minLevel = normalizeLevel(opts.level);
  this._minLevel = minLevel == null ? LEVELS.info : minLevel;

  this._base = opts.base && typeof opts.base === "object" ? opts.base : null;
  this._bindings = opts.bindings && typeof opts.bindings === "object" ? opts.bindings : null;

  const transports = Array.isArray(opts.transports) ? opts.transports.slice() : null;
  this._transports = transports && transports.length ? transports : [new ConsoleTransport()];

  this._clock = typeof opts.clock === "function" ? opts.clock : Date.now;
  this._serializeError =
    typeof opts.serializeError === "function" ? opts.serializeError : defaultSerializeError;
}

Logger.prototype.setLevel = function setLevel(level) {
  const n = normalizeLevel(level);
  if (n == null) throw new TypeError("Unknown level");
  this._minLevel = n;
};

Logger.prototype.isLevelEnabled = function isLevelEnabled(level) {
  const n = normalizeLevel(level);
  if (n == null) return false;
  return n >= this._minLevel;
};

Logger.prototype.child = function child(bindings) {
  const b = bindings && typeof bindings === "object" ? bindings : null;

  // cheap structural sharing; merge happens at log-time
  return new Logger({
    level: this._minLevel,
    base: this._base,
    bindings: mergeObjects(this._bindings, b),
    transports: this._transports,
    clock: this._clock,
    serializeError: this._serializeError
  });
};

Logger.prototype.log = function log(level, msg, meta) {
  const n = normalizeLevel(level);
  if (n == null) throw new TypeError("Unknown level");
  if (n < this._minLevel) return;

  const message = msg == null ? "" : String(msg);
  const record = buildRecord(this, n, message, meta);

  for (let i = 0; i < this._transports.length; i++) {
    const t = this._transports[i];
    if (!t || typeof t.write !== "function") continue;
    try {
      t.write(record);
    } catch (err) {
      // logging must not crash the app; swallow by default
    }
  }
};

Logger.prototype.trace = function trace(msg, meta) {
  this.log("trace", msg, meta);
};
Logger.prototype.debug = function debug(msg, meta) {
  this.log("debug", msg, meta);
};
Logger.prototype.info = function info(msg, meta) {
  this.log("info", msg, meta);
};
Logger.prototype.warn = function warn(msg, meta) {
  this.log("warn", msg, meta);
};
Logger.prototype.error = function error(msg, meta) {
  this.log("error", msg, meta);
};
Logger.prototype.fatal = function fatal(msg, meta) {
  this.log("fatal", msg, meta);
};

function buildRecord(self, levelNumber, msg, meta) {
  const m = meta && typeof meta === "object" ? meta : null;

  const time = self._clock();
  const lvl = levelName(levelNumber) || "info";

  const record = {
    time,
    level: lvl,
    levelNumber,
    msg
  };

  if (self._base) Object.assign(record, self._base);
  if (self._bindings) Object.assign(record, self._bindings);

  if (m) {
    if (m.err instanceof Error) {
      record.err = self._serializeError(m.err);
      const rest = Object.assign({}, m);
      delete rest.err;
      Object.assign(record, rest);
    } else {
      Object.assign(record, m);
    }
  }

  return record;
}

function defaultSerializeError(err) {
  return {
    type: err && err.name ? String(err.name) : "Error",
    message: err && err.message ? String(err.message) : "",
    stack: err && err.stack ? String(err.stack) : ""
  };
}

function mergeObjects(a, b) {
  if (!a && !b) return null;
  if (!a) return b;
  if (!b) return a;
  return Object.assign({}, a, b);
}

module.exports = Logger;

