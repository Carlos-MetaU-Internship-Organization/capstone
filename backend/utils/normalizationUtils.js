
function normalizeValue(value, highestValue, method = 'normal') {
  if (method === 'normal') {
    return highestValue === 0 ? 1 : value / highestValue;
  } else {
    return highestValue === 0 ? 0 : 1 - (value / highestValue);
  }
}

module.exports = normalizeValue;