/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
  
export class LabelWidget extends widget.FormattableWidget {
    
  public get(): any {
    return undefined;
  }

  public validate(typeName?: string): boolean {
    return true;
  }

  public writeOnly() {
    return true;
  }

  public retainsState(): boolean { 
    return false;
  }
}

