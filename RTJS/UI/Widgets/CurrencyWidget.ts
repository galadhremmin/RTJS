/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
import util = require("RTJS/Util/Observable");

export class CurrencyWidget extends widget.FormattableWidget {

  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters, 'thousand');

    if (!this.writeOnly()) {
      rootElement.on('change', (event) => this.changeEvent(event));
    }
  }

  public set(value: any): void {
    if (this.writeOnly()) {
      value = ptk.formatter.format(this.formatter, value);
      this.rootElement.text(value + ' kr');
    } else {
      super.set(value);
    }
  }

  public validate(typeName?: string): boolean {

    // Skip validation for write-only ("ViewOnly") widgets
    if (this.writeOnly()) {
      return true;
    }

    var result,
      associatedLabel,
      value = this.get(),
      max = 2147483647;

    if (!value) {
      this.set(0);
      value = this.get();
    }

    result = super.validate('integer');

    // Validate valid 32 bit integer
    if (result) {
      value = parseInt(value, 10);
      result = (value <max);
    }

    if (!result) {
      // Fetch the associated label for this element
      associatedLabel = $('label[for="' + this.id() + '"]');

      // Order of acquiring: 1) label text, 2) element ID, 3) element name 
      var elementName = associatedLabel.length ? associatedLabel.text() : (this.id() || this.rootElement.attr('name'));

      if (elementName === undefined) {
        throw 'There is no label associated with this element: ' + this.id();
      }

      if (isNaN(value)) {
        this.validationError = rtjs.Language.current().validation.missingCurrency.format(elementName);
      } else if (value > max) {
        this.validationError = rtjs.Language.current().validation.integerTooBig.format(elementName, ptk.formatter.format('thousand', max));
      }

      result = false;
    }

    return result;
  }

  private changeEvent(event) {
    var action = this.action();
    if (action) {
      this.notify(new util.Notification('keyup', this.rootElement, action, this.get()));
    }
  }
}

