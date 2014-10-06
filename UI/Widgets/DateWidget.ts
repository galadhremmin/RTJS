/// <reference path="Abstract/Widget.ts"/> 

import widget = require("./Abstract/Widget");
  
export class DateWidget extends widget.FormattableWidget {
    
  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters, 'date');
  }

  public validate(typeName?: string): boolean {
    if (this.writeOnly()) {
      return true;
    }

    var year,
      month,
      day,
      associatedLabel,
      elementName,
      rawDate = this.get(),
      date,
      today = new Date(),
      a100YearsAgo = new Date(today.getFullYear() - 100, 0, 1);

    year  = rawDate.substring(0, 4);
    month = rawDate.substring(4, 6);
    day   = rawDate.substring(6, 8);
    date  = new Date(year, month - 1, day);

    // Fetch the associated label for this element
    associatedLabel = $('label[for="' + this.id() + '"]');

    // Order of acquiring: 1) label text, 2) element ID, 3) element name 
    elementName = associatedLabel.length ? associatedLabel.text() : (this.id() || this.rootElement.attr('name'));

    if (elementName === undefined) {
      throw 'There is no label associated with this element: ' + this.id();
    }

    //validate that it is a correct date (including checks for leap year). If not, show error message
    if (date <= today) {
      if (day > 31 || day < 1 || month > 12 || month < 1) { //js Date-object will parse these values, so we need an extra check.
        this.validationError = ptk.lang.common.validation.wrongDate;
        return false;
      } else if (day >= 31 && (month == 4 || month == 6 || month == 9 || month == 11)) { //months with 30 days. Observe that only two "equals" chars are used by design
        this.validationError = ptk.lang.common.validation.wrongDate;
        return false;
      } else if (this.isLeapYear(year) && day == 29 && month == 2) { //february 29 if leap year
        return super.validate('date');
      } else if (day >= 29 && month == 2) { //february with 29 or more days
        this.validationError = ptk.lang.common.validation.wrongDate;
        return false;
      } else if (date < a100YearsAgo) {
        this.validationError = ptk.lang.common.validation.pastYear;
        return false;
      }
    } else {
      this.validationError = ptk.lang.common.validation.futureYear;
      return false;
    }

    return super.validate('date');
  }

  private isLeapYear(year: number): boolean {
    if (year % 400 === 0 || (year % 100 != 0 && year % 4 == 0)) {
      return true;
    }

    return false;
  }
}
  
