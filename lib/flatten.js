const patterns = require('./patterns');

function sanitize(raw) {
  return raw.replaceAll(/\s/g, '');
}

function flattenOne(doc) {
  const base = [
    doc._id,
    doc.introduction.allowed,
    doc.backgroundExperience.knowledgeLevel,
    doc.backgroundExperience.knowledgeSource,
    doc.backgroundExperience.years,
    doc.personalInformation.name,
    doc.personalInformation.email,
    doc.personalInformation.available
  ];

  const patternSections = patterns.reduce((acc, currPattern) => {
    const currPatternAnswers = doc[currPattern];
    if (currPatternAnswers.isUsed)
      return acc.concat([
        currPatternAnswers.knowledgeType,
        currPatternAnswers.isUsed,
        currPatternAnswers.statements[0].value,
        currPatternAnswers.statements[1].value,
        currPatternAnswers.statements[2].value,
        currPatternAnswers.statements[3].value,
        sanitize(currPatternAnswers.comments)
      ]);

    return acc.concat([
      currPatternAnswers.knowledgeType,
      currPatternAnswers.isUsed,
      'N/D',
      'N/D',
      'N/D',
      'N/D',
      ''
    ]);
  }, []);

  return base.concat(patternSections);
}

module.exports = function (allDocs) {
  return allDocs.map(flattenOne);
};
