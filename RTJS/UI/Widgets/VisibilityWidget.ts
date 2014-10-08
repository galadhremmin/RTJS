/// <reference path="Abstract/Widget.ts"/> 

import widget = require("./Abstract/Widget");
  
/**
  * Represents an user interface component whose visibility is determined by the data bound to it, according to the data-visibility attribute on the root element.
  */
export class VisibilityWidget extends widget.ViewOnlyWidget {
    
  public set(value: any): void {
    // Do nothing as this widget's binding value only means to change the root element's visibility.
  }

  public _lastBindingSourceDigest(value?: number): number {
    return super._lastBindingSourceDigest(undefined); // deliberately never set the digest value for this widget
  }
}
