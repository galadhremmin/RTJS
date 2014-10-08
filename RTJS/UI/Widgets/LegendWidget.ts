/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
  
export class LegendWidget extends widget.ViewOnlyWidget {
  public set(value: any): void {
      
    //separate the data-visibility attribute into an array.
    var visibleOnValues = this.rootElement.attr('data-visibility').replace(/,\s+/g, ',').split(','); //The replace removes any whitespace after commas.
    var valueAsString = value + '';

    //check if the value exists in the array.
    if ($.inArray(valueAsString, visibleOnValues) > -1) {
      this.rootElement.show();
    } else {
      this.rootElement.hide();
    }

  }
}

