/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var NumberWidget = (function (_super) {
        __extends(NumberWidget, _super);
        function NumberWidget(rootElement, parameters) {
            _super.call(this, rootElement, parameters, 'thousand');
        }
        NumberWidget.prototype.validate = function (typeName) {
            return _super.prototype.validate.call(this, 'integer');
        };
        return NumberWidget;
    })(widget.FormattableWidget);
    exports.NumberWidget = NumberWidget;
});
