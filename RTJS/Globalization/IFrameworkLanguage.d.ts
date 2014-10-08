interface IFrameworkLanguage {
  validation: IFrameworkValidationLanguage;
}

interface IFrameworkValidationLanguage {
  missingAge: string;
  tooOld: string;
  tooYoung: string;
}