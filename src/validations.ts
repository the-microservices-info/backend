import * as Validator from 'validatorjs';

export const patterns = [
  'Database per Service',
  'Saga',
  'Event Sourcing',
  'Asynchronous Messaging',
  'Domain Event',
  'Transactional Outbox',
  'API Composition',
  'Adapter Microservice',
  'CQRS',
  'API Gateway',
  'BFF'
];

export const formsSections = ['introduction', 'backgroundExperience', ...patterns];

export const validate: (answer: any) => any = (answer: any) => {
  const rules = {
    answer: 'is_answer'
  };

  const innerRules = {
    introduction: {
      allowed: 'required|boolean'
    },
    backgroundExperience: {
      knowledgeLevel: 'required|min:0|max:5',
      knowledgeSource: 'required|is_source',
      years: 'required|is_bg_year'
    },
    ...patterns.reduce((pValidation: any, pattern: string): any => {
      pValidation[pattern] = {
        isUsed: 'required|boolean',
        knowledgeType: 'required|is_pattern_knowledge_type',
        comments: 'string',
        statements: [{ required_if: ['isUsed', true] }, 'is_statements']
      };

      return pValidation;
    }, {})
  };

  const sections = ['introduction', 'backgroundExperience', ...patterns];
  const allSections = sections.map((s: string): string => `'${s}'`).join(', ');

  const hasAllSections = (value: any): boolean => {
    const keys = Object.keys(value).sort();
    const secs = sections.sort();

    return (
      keys.length === secs.length && keys.every((k: string, i: number): boolean => k === secs[i])
    );
  };

  const isKnowledgeSource = (value: any) =>
    [
      'Books, blog posts or written tutorials',
      'Professional course, workshop or conference tutorial',
      'A collegue or consultant',
      'Learned on the job by myself'
    ].includes(value);

  const isBGYear = (value: any) =>
    ['0 - 1 year', '1 - 2 years', '2 - 4 years', '4+ years'].includes(value);

  const isPatternKnowledgeType = (value: any) =>
    [
      'Yes, I knew as a pattern',
      "I recognize it as a practice, but I didn't know it was a pattern",
      "I didn't know"
    ].includes(value);

  const statements = [
    'The pattern was present in the initial versions of the implementation',
    'The pattern was implemented via refactoring',
    'The pattern is implemented in various parts of the system',
    'The usage of the pattern was beneficial to the system'
  ];

  const isStatements = (value: any) =>
    value.every(
      (each: any): boolean => statements.includes(each.statement) && each.value !== undefined
    );

  Validator.register(
    'is_answer',
    hasAllSections,
    'answers must only and exactly contain ' + allSections
  );
  Validator.register('is_source', isKnowledgeSource, 'invalid knowledgeSource');
  Validator.register('is_bg_year', isBGYear, 'invalid year');
  Validator.register(
    'is_pattern_knowledge_type',
    isPatternKnowledgeType,
    'invalid pattern knowledge type'
  );
  Validator.register('is_statements', isStatements, 'invalid statements');

  const answerValidation = new Validator({ answer }, rules);
  const validation = new Validator(answer, innerRules);

  const global = answerValidation.passes();
  const inner = validation.passes();

  return {
    isValid: global && inner,
    reasons: { ...answerValidation.errors.all(), ...validation.errors.all() }
  };
};
