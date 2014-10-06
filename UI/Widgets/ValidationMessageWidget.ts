/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
  
export class ValidationMessageWidget extends widget.ViewOnlyWidget {
    
  public set(message: any): void {
    var elem = this.rootElement,
      showFlag = Boolean(elem.data('showFlag')),
      useColour = Boolean(elem.data('useColour')),
      html = showFlag ? '<span style="float: left; margin-left: 0;" class="error-description icon warning"></span>' : '' +
        '<p class="' + (useColour ? 'error-description' : '') + '">' + message + '</p>';

    if (message) {
      this.rootElement.html(html);
    } else {
      this.rootElement.empty();
    }
  }

}

