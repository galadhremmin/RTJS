/// <reference path="Abstract/Widget.ts"/> 

import widget = require("./Abstract/Widget");

export class TextFormatterWidget extends widget.ViewOnlyWidget {

  public set(value: any): void {
    var elem = this.rootElement,
      innerText = elem.text(),
      data = ($.isArray(value)) ? value : [value],
      formattedText = '';

    //if the character { exists, treat innerText with string.format
    if (innerText.indexOf('{') >= 0) {
      formattedText = innerText.format.apply(innerText, data);
    } else {
      formattedText = data;
    }

    elem.text(formattedText);
  }

}

