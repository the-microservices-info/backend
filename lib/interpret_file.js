const {readFileSync} = require('fs');
const {resolve} = require('path');

module.exports = function (fileName) {
  const fullFileName = resolve(__dirname, fileName);
  const fileContent = readFileSync(fullFileName).toString();
  return JSON.parse(fileContent);
}
