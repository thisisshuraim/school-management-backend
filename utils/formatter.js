const capitalize = (s) => {
  if (!s)
    return '';

  const strs = s.split(' ').map(st => st.trim().toLowerCase());
  return strs.map(st => st.charAt(0).toUpperCase() + st.slice(1)).join(' ');
};

module.exports = {
  capitalize
};