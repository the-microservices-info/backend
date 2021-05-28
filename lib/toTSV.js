const patterns = require('./patterns');
const generateHeaders = require('./generate_headers');
const interpretFile = require('./interpret_file');
const flatten = require('./flatten');
const TSVstringify = require('./tsv_stringify');
const writeTSV = require('./write_tsv');

function main() {
  const headers = generateHeaders(patterns);

  const { answers } = interpretFile('data.json');
  const flat = flatten(answers);

  const rawTSV = TSVstringify(headers, flat);
  writeTSV('data.tsv', rawTSV);
}

main();
