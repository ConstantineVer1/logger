const LEVELS = Object.freeze({
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60
});

function normalizeLevel(level) {
  if (typeof level === "number" && Number.isFinite(level)) return level;
  if (typeof level !== "string") return null;
  const key = level.toLowerCase();
  return Object.prototype.hasOwnProperty.call(LEVELS, key) ? LEVELS[key] : null;
}

function levelName(levelNumber) {
  for (const [name, num] of Object.entries(LEVELS)) {
    if (num === levelNumber) return name;
  }
  return null;
}

module.exports = {
  LEVELS,
  normalizeLevel,
  levelName
};

