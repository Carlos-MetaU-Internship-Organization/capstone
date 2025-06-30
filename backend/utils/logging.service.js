const logs = [];

function log(level, message, data = null) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data
  };
  logs.push(entry);
  console.log(`[${level.toUpperCase()}] ${entry.timestamp} - ${message}`, data || '');
}

function logInfo(message, data = null) {
  log('info', message, data);
}

function logWarning(message, data = null) {
  log('warning', message, data);
}

function logError(message, data = null) {
  log('error', message, data);
}

function getLogs() {
  return logs;
}

module.exports = {
  logInfo,
  logWarning,
  logError,
  getLogs
}