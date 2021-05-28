const interpretFile = require('./interpret_file');
const generateHeaders = require('./generate_headers');
const patterns = require('./patterns');

function main() {
  const rawAnswers = interpretFile('data.json');
  const headers = generateHeaders(patterns);
  console.log(headers);
}

main();
