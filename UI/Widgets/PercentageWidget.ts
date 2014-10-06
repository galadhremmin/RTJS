/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
  
export class PercentageWidget extends widget.FormattableWidget {
    
  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters, 'decimal');
  }

  public validate(typeName?: string): boolean {
    var result,
      associatedLabel,
      value = this.get();

    if (!value) {
      this.set(0);
      value = this.get();
    }

    result = super.validate('float');

    // Cannot be higher than 100%
    value = parseFloat(value);

    if (result && (isNaN(value) || value > 100)) {
      // Fetch the associated label for this element
      associatedLabel = $('label[for="' + this.id() + '"]');

      // Order of acquiring: 1) label text, 2) element ID, 3) element name 
      var elementName = associatedLabel.length ? associatedLabel.text() : (this.id() || this.rootElement.attr('name'));

      if (elementName === undefined) {
        throw 'There is no label associated with this element: ' + this.id();
      }

      this.validationError = ptk.lang.common.validation['percentage'].format(elementName);

      result = false;
    }

    return result;
  }
}

