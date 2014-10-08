/// <reference path="LabelWidget.ts"/>

import widget = require("./LabelWidget");
  
  /**
    * A label widget that automatically trims it's content with ellipses (...) if it overflows.
    * If specified, the widget will measure overflow of data-measure-element instead of itself. This allows the widget to trim itself to make it's container fit, even if the container holds other elements as well.
    *
    * Beware that container probably needs to have white-space: nowrap or something like that for this to work as intended.
    */
export class TrimmedLabelWidget extends widget.LabelWidget {
    
  public set (value: any): void {
    super.set(value);
    this.ellipsisTrim();
  }

  public reflow(): void {
    super.reflow();
    this.ellipsisTrim();
  }

  private getTrimmingContainer(): JQuery {
    var id = this.rootElement.data('measure-element');
    if (!id) {
      return undefined;
    }

    return $('#' + id);
  }

  private ellipsisTrim(): void {
    var measureElement = this.getTrimmingContainer(),
        rawElement = this.rootElement.get(0),
        rawMeasure = (measureElement && measureElement.length > 0) ? measureElement[0] : null;

    ptk.utilities.trimContentWithEllipsis(rawElement, rawMeasure);
  }

}

