/// <reference path="Abstract/Widget.ts"/> 

import widget = require("./Abstract/Widget");

export class NumberWidget extends widget.FormattableWidget {
  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters, 'thousand');
  }

  public validate(typeName?: string): boolean {
    return super.validate('integer');
  }
}
