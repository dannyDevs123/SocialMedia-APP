const toIdString = (value) => {
  if (value == null) return '';
  if (typeof value === 'object') {
    return String(value._id || value.id || '');
  }
  return String(value);
};

const sameId = (a, b) => toIdString(a) !== '' && toIdString(a) === toIdString(b);

module.exports = {
  toIdString,
  sameId,
};
