const logs = [];

function log(level, message, data = null) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };
  logs.push(entry);
  console[level](
    `[${level.toUpperCase()}] ${entry.timestamp} - ${message}`,
    data || "",
  );
}

export function logInfo(message, data = null) {
  log("info", message, data);
}

export function logWarning(message, data = null) {
  log("warn", message, data);
}

export function logError(message, data = null) {
  log("error", message, data);
}

export function getLogs() {
  return logs;
}
