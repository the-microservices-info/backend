const { writeFileSync } = require('fs');
const { resolve } = require('path');

module.exports = function (fileName, tsvString) {
  const fullFileName = resolve(__dirname, fileName);

  writeFileSync(fullFileName, tsvString);
};
