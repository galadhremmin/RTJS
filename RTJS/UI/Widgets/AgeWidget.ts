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

    var lang = rtjs.Language.current();
    if (text.length < 1) {
      this.validationError = lang.validation.missingAge;
      return false;
    } else if (maxAge && inputAge > maxAge) {
      this.validationError = lang.validation.tooOld.format(maxAge.toString());
      return false;
    } else if (minAge && inputAge < minAge) {
      this.validationError = lang.validation.tooYoung.format(minAge.toString());
      return false;
    }

    return true;
  }
}

interface IParameters {
  maxage?: number;
  minage?: number;
}
