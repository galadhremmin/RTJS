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

    this.trimContentWithEllipsis(rawElement, rawMeasure);
  }

  private trimContentWithEllipsis(trimElement: HTMLElement, measureElement: HTMLElement): void {
    if (!measureElement) {
      measureElement = trimElement;
    }

    if (measureElement.scrollWidth > measureElement.offsetWidth) {

      var text = String(trimElement.innerHTML),
        length = text.length - 1,
        contentOverflows = function(elem) {
          var sw, ow;

          // Round to the nearest 5 pixels
          // scroll width - actual width of the element
          sw = Math.round(elem.scrollWidth);
          sw -= sw % 5;

          // offset width - width of the container
          ow = Math.round(elem.offsetWidth);
          ow -= ow % 5;

          return sw > ow;
        },
        words = text.split(' '),
        ntext = '';

      for (var i = 0; i < words.length; i += 1) {

        ntext += (i > 0 ? ' ' : '') + words[i];
        trimElement.innerHTML = ntext;

        if (!contentOverflows(measureElement)) {
          continue;
        }

        if (words[i].length > 1) {

          length = ntext.length - 1;
          while (length >= 0) {

            if (ntext[ntext.length - 1] != ' ') {
              trimElement.innerHTML = ntext.substr(0, length) + '...';
              if (!contentOverflows(measureElement)) {
                break;
              }
            }

            length -= 1;
          }

        }

        break;
      }
    }
  }
}

