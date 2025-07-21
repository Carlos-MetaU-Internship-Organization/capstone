
function normalizeValue(value, highestValue, method = 'normal') {
  if (highestValue === 0) {
    return method === 'normal' ? 1 : 0;
  }
  const normalizedValue = value / highestValue;
  return method === 'normal' ? normalizedValue : 1 - normalizedValue;
}

module.exports = normalizeValue;