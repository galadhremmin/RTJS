/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
 
export class HiddenWidget extends widget.Widget {
    
  public set(value: any): void {
    this.rootElement.val(value);
    this.rootElement.trigger('change');
  }

  public get(): any {
    return this.rootElement.val();
  }

  public validate(typeName?: string): boolean {
    return true;
  }
} 

