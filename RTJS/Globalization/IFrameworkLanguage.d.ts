interface IFrameworkLanguage {
  validation: IFrameworkValidationLanguage;
}

interface IFrameworkValidationLanguage {
  // Age
  missingAge: string;
  tooOld: string; // {0}
  tooYoung: string; // {0}

  // Birth year
  missingBirthYear: string; // {0}
  futureBirthYear: string;
  pastBirthYear: string;

  // Currency 
  missingCurrency: string; // {0}
  integerTooBig: string; // {element name} {value}

  // Date
  wrongDate: string;
  dateIs100YearsAgo: string;
  dateIntoFuture: string;

  // Email
  missingEmail: string;
  emailMismatch: string;

  // Year
  missingYear: string; // {0} 
  futureYear: string;
  pastYear: string;

  // Percentage
  percentageOutOfBounds: string; // {0}
}