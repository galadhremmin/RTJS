import widget = require("./YearWidget");
  
export class BirthYearWidget extends widget.YearWidget {
    
  public validate(typeName?: string): boolean {
      
    var year = this.get(),
      thisYear = new Date().getFullYear(),
      parsedYear,
      associatedLabel,
      elementName;

    if (!super.validate('year')) {
      return false;
    }

    if (this.rootElement.is(':visible')) {
      var lang = rtjs.Language.current();

      if (year.length < 4) {
        // Fetch the associated label for this element
        associatedLabel = $('label[for="' + this.id() + '"]');

        // Order of acquiring: 1) label text, 2) element ID, 3) element name 
        elementName = associatedLabel.length ? associatedLabel.text() : (this.id() || this.rootElement.attr('name'));

        this.validationError = lang.validation.missingBirthYear.format(elementName);

        return false;
      }

      parsedYear = new Date(year + '/01/01').getFullYear();

      if (parsedYear > thisYear) {
        this.validationError = lang.validation.futureBirthYear;
        return false;
      }

      if (parsedYear < (thisYear - 100)) {
        this.validationError = lang.validation.pastBirthYear;
        return false;
      }
    }

    return true;

  }

}

