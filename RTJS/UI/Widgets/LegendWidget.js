/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var LegendWidget = (function (_super) {
        __extends(LegendWidget, _super);
        function LegendWidget() {
            _super.apply(this, arguments);
        }
        LegendWidget.prototype.set = function (value) {
            //separate the data-visibility attribute into an array.
            var visibleOnValues = this.rootElement.attr('data-visibility').replace(/,\s+/g, ',').split(',');
            var valueAsString = value + '';

            //check if the value exists in the array.
            if ($.inArray(valueAsString, visibleOnValues) > -1) {
                this.rootElement.show();
            } else {
                this.rootElement.hide();
            }
        };
        return LegendWidget;
    })(widget.ViewOnlyWidget);
    exports.LegendWidget = LegendWidget;
});
