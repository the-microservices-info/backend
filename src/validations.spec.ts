import { patterns, validate } from './validations';

const goodAnswer = {
  introduction: { allowed: true },
  backgroundExperience: {
    knowledgeLevel: 3,
    knowledgeSource: 'Books, blog posts or written tutorials',
    years: '1 - 2 years'
  },
  personalInformation: { name: '', email: '', available: undefined },
  ...patterns.reduce((pAns: any, pattern: string): any => {
    pAns[pattern] = {
      isUsed: false,
      knowledgeType: "I didn't know"
    };

    return pAns;
  }, {})
};

describe(validate, () => {
  describe('passes', () => {
    test('with good answer', () => {
      const { isValid } = validate(goodAnswer);

      expect(isValid).toBeTruthy();
    });
  });

  describe('fails', () => {
    let copyAnswer: any;

    beforeEach(() => (copyAnswer = Object.assign({}, goodAnswer)));

    test('without introduction', () => {
      delete copyAnswer.introduction;

      const { isValid, reasons } = validate(copyAnswer);

      expect(isValid).toBeFalsy();
      expect(reasons.answer.length).toEqual(1);
      expect(reasons.answer[0]).toMatch('only and exactly');

      expect(reasons['introduction.allowed'].length).toEqual(1);
      expect(reasons['introduction.allowed'][0]).toMatch('required');
    });

    test('without backgroundExperience', () => {
      delete copyAnswer.backgroundExperience;

      const { isValid, reasons } = validate(copyAnswer);

      expect(isValid).toBeFalsy();
      expect(reasons.answer.length).toEqual(1);
      expect(reasons.answer[0]).toMatch('only and exactly');

      const subs = ['knowledgeLevel', 'knowledgeSource', 'years'];

      subs.forEach((sub: string): void => {
        expect(reasons[`backgroundExperience.${sub}`].length).toEqual(1);
        expect(reasons[`backgroundExperience.${sub}`][0]).toMatch('required');
      });
    });

    patterns.forEach((pattern: string): void => {
      test(`without ${pattern}`, () => {
        delete copyAnswer[pattern];

        const { isValid, reasons } = validate(copyAnswer);

        expect(isValid).toBeFalsy();
        expect(reasons.answer.length).toEqual(1);
        expect(reasons.answer[0]).toMatch('only and exactly');

        const subs = ['knowledgeType', 'isUsed'];

        subs.forEach((sub: string): void => {
          expect(reasons[`${pattern}.${sub}`].length).toEqual(1);
          expect(reasons[`${pattern}.${sub}`][0]).toMatch('required');
        });
      });
    });

    describe('for wrong types of backgroundExperience attributes', () => {
      test('knowledgeSource', () => {
        copyAnswer.backgroundExperience.knowledgeSource = 'foo';

        const { isValid, reasons } = validate(copyAnswer);

        expect(isValid).toBeFalsy();
        expect(reasons['backgroundExperience.knowledgeSource'].length).toEqual(1);
        expect(reasons['backgroundExperience.knowledgeSource'][0]).toMatch('invalid');
      });

      test('years', () => {
        copyAnswer.backgroundExperience.years = 4;

        const { isValid, reasons } = validate(copyAnswer);

        expect(isValid).toBeFalsy();
        expect(reasons['backgroundExperience.years'].length).toEqual(1);
        expect(reasons['backgroundExperience.years'][0]).toMatch('invalid');
      });
    });

    describe('for wrong type of pattern.knowledgeType', () => {
      patterns.forEach((pattern: string): void => {
        test(`${pattern}.knowledgeType`, () => {
          copyAnswer[pattern].knowledgeType = 12;

          const { isValid, reasons } = validate(copyAnswer);

          expect(isValid).toBeFalsy();
          expect(reasons[`${pattern}.knowledgeType`].length).toEqual(1);
          expect(reasons[`${pattern}.knowledgeType`][0]).toMatch('invalid');
        });
      });
    });

    describe('for wrong type of pattern.statements', () => {
      patterns.forEach((pattern: string): void => {
        test(`${pattern}.statements failing by wrong structure`, () => {
          copyAnswer[pattern].isUsed = true;

          copyAnswer[pattern].statements = [
            'The pattern was present in the initial versions of the implementation',
            'The pattern was implemented via refactoring',
            'The pattern is implemented in various parts of the system',
            'The usage of the pattern was beneficial to the system'
          ];

          const { isValid, reasons } = validate(copyAnswer);

          expect(isValid).toBeFalsy();
          expect(reasons[`${pattern}.statements`].length).toEqual(1);
          expect(reasons[`${pattern}.statements`][0]).toMatch('invalid');
        });

        test(`${pattern}.statements failing by value undefined`, () => {
          copyAnswer[pattern].isUsed = true;

          copyAnswer[pattern].statements = [
            {
              statement: 'The pattern was present in the initial versions of the implementation',
              value: undefined
            },
            {
              statement: 'The pattern was implemented via refactoring',
              value: undefined
            },
            {
              statement: 'The pattern is implemented in various parts of the system',
              value: undefined
            },
            {
              statement: 'The usage of the pattern was beneficial to the system',
              value: undefined
            }
          ];

          const { isValid, reasons } = validate(copyAnswer);

          expect(isValid).toBeFalsy();
          expect(reasons[`${pattern}.statements`].length).toEqual(1);
          expect(reasons[`${pattern}.statements`][0]).toMatch('invalid');
        });
      });
    });
  });
});
