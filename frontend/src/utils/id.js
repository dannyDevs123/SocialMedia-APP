export const getId = (value) => {
  if (value == null) return '';
  if (typeof value === 'object') {
    return String(value._id || value.id || '');
  }
  return String(value);
};

export const sameId = (a, b) => getId(a) !== '' && getId(a) === getId(b);

export const asArray = (value) => (Array.isArray(value) ? value : []);
