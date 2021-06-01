module.exports = function (patterns) {
  const base = [
    'id',
    'allowed',
    '[bgexp] k_level',
    '[bgexp] k_source',
    '[bgexp] years',
    '[personal] name',
    '[personal] email',
    '[personal] available'
  ];

  const basePatternSection = [
    'k_type',
    'is_used',
    'initial',
    'refactor',
    'v_parts',
    'beneficial',
    'comments'
  ];

  const patternSections = patterns.reduce((acc, currPattern) => {
    const currPatternSection = basePatternSection.map((text) => `[${currPattern}] ${text}`);
    return acc.concat(currPatternSection);
  }, []);

  return base.concat(patternSections);
};
