/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
  
export class TextWidget extends widget.ViewOnlyWidget {
    
  public set(value: any): void {
    if (value) {
      var html: any = $.parseHTML(value);

      // Don't super call the set method because 'value' is a html object. 
      this.rootElement.html(html);
      this.rootElement.show();
    } else {
      this.rootElement.hide();
    }
  }

}

