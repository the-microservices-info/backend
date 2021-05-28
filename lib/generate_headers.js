module.exports = function (patterns) {
  const base = [
    'id',
    'allowed',
    '[bgexp] knowledgeLevel',
    '[bgexp] knowledgeSource',
    '[bgexp] years',
    '[personal] name',
    '[personal] email',
    '[personal] available'
  ];

  const basePatternSection = [
    'knowledgeType',
    'isUsed',
    'The pattern was present in the initial versions of the implementation',
    'The pattern was implemented via refactoring',
    'The pattern is implemented in various parts of the system',
    'The usage of the pattern was beneficial to the system',
    'comments'
  ];

  const patternSections = patterns.reduce((acc, currPattern) => {
    const currPatternSection = basePatternSection.map((text) => `[${currPattern}] ${text}`);
    return acc.concat(currPatternSection);
  }, []);

  return base.concat(patternSections);
};
