/// <reference path="LabelWidget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./LabelWidget"], function(require, exports, widget) {
    /**
    * A label widget that automatically trims it's content with ellipses (...) if it overflows.
    * If specified, the widget will measure overflow of data-measure-element instead of itself. This allows the widget to trim itself to make it's container fit, even if the container holds other elements as well.
    *
    * Beware that container probably needs to have white-space: nowrap or something like that for this to work as intended.
    */
    var TrimmedLabelWidget = (function (_super) {
        __extends(TrimmedLabelWidget, _super);
        function TrimmedLabelWidget() {
            _super.apply(this, arguments);
        }
        TrimmedLabelWidget.prototype.set = function (value) {
            _super.prototype.set.call(this, value);
            this.ellipsisTrim();
        };

        TrimmedLabelWidget.prototype.reflow = function () {
            _super.prototype.reflow.call(this);
            this.ellipsisTrim();
        };

        TrimmedLabelWidget.prototype.getTrimmingContainer = function () {
            var id = this.rootElement.data('measure-element');
            if (!id) {
                return undefined;
            }

            return $('#' + id);
        };

        TrimmedLabelWidget.prototype.ellipsisTrim = function () {
            var measureElement = this.getTrimmingContainer(), rawElement = this.rootElement.get(0), rawMeasure = (measureElement && measureElement.length > 0) ? measureElement[0] : null;

            ptk.utilities.trimContentWithEllipsis(rawElement, rawMeasure);
        };
        return TrimmedLabelWidget;
    })(widget.LabelWidget);
    exports.TrimmedLabelWidget = TrimmedLabelWidget;
});
