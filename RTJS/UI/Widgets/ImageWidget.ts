/// <reference path="Abstract/Widget.ts"/> 

import widget = require("./Abstract/Widget");
  
export class ImageWidget extends widget.ViewOnlyWidget {
    
  public set(value: any): void {
    var elem = this.rootElement;
    if (value) {
      elem.prop('src', value);
      elem.css('visibility', 'visible');
    } else {
      elem.css('visibility', 'hidden');
    }
  }

}

