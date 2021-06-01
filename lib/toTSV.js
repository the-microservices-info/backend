const patterns = require('./patterns');
const shorten_names = require('./shorten_names');
const generateHeaders = require('./generate_headers');
const interpretFile = require('./interpret_file');
const flatten = require('./flatten');
const TSVstringify = require('./tsv_stringify');
const writeTSV = require('./write_tsv');

function main() {
  const shortened = shorten_names(patterns);
  const headers = generateHeaders(shortened);

  const {answers} = interpretFile('data.json');
  const flat = flatten(answers);

  const rawTSV = TSVstringify(headers, flat);
  writeTSV('data.tsv', rawTSV);
}

main();
