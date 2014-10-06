/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
import util = require("RTJS/Util/Observable");
  
export class ButtonWidget extends widget.ViewOnlyWidget {
    
  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters);
    rootElement.on('click', (event: JQueryEventObject) => this.clickEvent(event));
  }

  public set(value: any): void {
    this.rootElement.data('action-argument', value);
  }

  private clickEvent(event: JQueryEventObject) {
    var boundArg = null,
      notifyData;

    event.preventDefault();
    boundArg = this.rootElement.data('action-argument');

    notifyData = (boundArg != null && boundArg != undefined) ? { data: boundArg, event: event } : event;

    this.notify(new util.Notification('click', this.rootElement, this.action(), notifyData));
  }

}

