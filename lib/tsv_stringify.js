module.exports = function (headers, data) {
  const all = [headers, ...data];

  return all.map((row) => row.join('\t'));
};
