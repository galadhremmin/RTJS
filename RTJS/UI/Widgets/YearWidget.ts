/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
import util = require("RTJS/Util/Observable");
  
export class YearWidget extends widget.FormattableWidget {
    
  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters, 'year');

    if (!this.writeOnly()) {
      rootElement.on('change', (event) => this.elementChanged(event));
    }
  }

  public get(): any {
    var value = super.get();
    if (value === undefined) {
      return undefined;
    }

    if (!/^[12][0-9]{3}$/.test(value)) {
      return 0;
    }

    return parseInt(value);
  }
    
  public validate(typeName?: string): boolean {
    var year = this.get(),
      thisYear = new Date().getFullYear(),
      associatedLabel = $('label[for="' + this.id() + '"]'), // Order of acquiring: 1) label text, 2) element ID, 3) element name 
      elementName = associatedLabel.length ? associatedLabel.text() : (this.id() || this.rootElement.attr('name')); // Fetch the associated label for this element

    if (this.rootElement.is(':visible')) {
      if (isNaN(parseInt(year, 10))) { // need to parse year before isNaN - javascript intreprets empty string as 0
        this.validationError = ptk.lang.common.validation['year'].format(elementName);
        return false;
      }
      if (year > thisYear) {
        this.validationError = ptk.lang.common.validation['futureYear'];
        return false;
      }
      if (year < (thisYear - 100)) {
        this.validationError = ptk.lang.common.validation['pastYear'];
        return false;
      }
    }

    return true;
  }

  private elementChanged(event: Event): void {
    if (this.action() !== undefined) {
      this.notify(new util.Notification('change', this.rootElement, this.action(), this.get()));
    }
  }

}

