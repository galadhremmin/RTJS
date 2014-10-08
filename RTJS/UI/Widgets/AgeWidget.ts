/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
export class AgeWidget extends widget.Widget {
    
  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters);

  }

  private params(): IParameters {
    return <IParameters> this.parameters;
  }

  public validate(typeName?: string): boolean {
    var elem = this.rootElement,
      text = elem.val(),
      inputAge = parseInt(text),
      maxAge = this.params().maxage, //<input type="text" data-widget="age" data-widget-maxAge="50" />
      minAge = this.params().minage;

    if (text.length < 1) {
      this.validationError = ptk.lang.common.validation.missingAge;
      return false;
    } else if (maxAge !== undefined && inputAge > maxAge) {
      this.validationError = ptk.lang.common.validation.tooOld.format(maxAge);
      return false;
    } else if (minAge !== undefined && inputAge < minAge) {
      this.validationError = ptk.lang.common.validation.tooYoung.format(minAge);
      return false;
    }

    return true;
  }
}

interface IParameters {
  maxage?: number;
  minage?: number;
}
