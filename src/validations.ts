export interface ValidationOutput {
  isValid: boolean;
  reasons: string[];
}

const valIntroduction: (data: any) => ValidationOutput = (data: any) => {
  const intro: any = data.introduction;
  const reasons: string[] = [];

  if (intro === undefined) {
    reasons.push("attr 'introduction' must be defined");
    return { isValid: false, reasons };
  }

  if (intro.allowed === undefined) {
    reasons.push("attr 'introduction.allowed' must be defined");
    return { isValid: false, reasons };
  }

  if (typeof intro.allowed !== 'boolean') {
    reasons.push("attr 'introduction.allowed' must be of type Boolean");
    return { isValid: false, reasons };
  }

  return { isValid: true, reasons };
};

const valBgExp: (data: any) => ValidationOutput = (data: any) => {
  const bg: any = data.backgroundExperience;
  let isValid = true;
  const reasons: string[] = [];

  if (bg === undefined) {
    reasons.push("attr 'backgroundExperience' must be defined");
    return { isValid: false, reasons };
  }

  if (bg.knowledgeLevel === undefined) {
    reasons.push("attr 'backgroundExperience.knowledgeLevel' must be defined");
    isValid = false;
  } else if (typeof bg.knowledgeLevel !== 'number') {
    reasons.push("attr 'backgroundExperience.knowledgeLevel' must be a number");
    isValid = false;
  } else if (0 > bg.knowledgeLevel || bg.knowledgeLevel > 5) {
    reasons.push("attr 'backgroundExperience.knowledgeLevel' must be gt 0 and lt 6");
    isValid = false;
  }

  if (bg.knowledgeSource === undefined) {
    reasons.push("attr 'backgroundExperience.knowledgeSource' must be defined");
    isValid = false;
  }

  if (bg.years === undefined) {
    reasons.push("attr 'backgroundExperience.years' must be defined");
    isValid = false;
  }

  return { isValid, reasons };
};

export const validate: (data: any) => ValidationOutput = (data: any) => {
  const introValid: ValidationOutput = valIntroduction(data);
  const bgExpValid: ValidationOutput = valBgExp(data);

  return {
    isValid: introValid.isValid && bgExpValid.isValid,
    reasons: introValid.reasons.concat(bgExpValid.reasons)
  };
};
