const { readFileSync } = require('fs');
const { resolve } = require('path');

function fileToObject(fileName) {
  const fullFileName = resolve(__dirname, fileName);
  const fileContent = readFileSync(fullFileName).toString();
  return JSON.parse(fileContent);
}

console.log(fileToObject('data.json'));
