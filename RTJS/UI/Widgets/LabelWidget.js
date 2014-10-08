/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var LabelWidget = (function (_super) {
        __extends(LabelWidget, _super);
        function LabelWidget() {
            _super.apply(this, arguments);
        }
        LabelWidget.prototype.get = function () {
            return undefined;
        };

        LabelWidget.prototype.validate = function (typeName) {
            return true;
        };

        LabelWidget.prototype.writeOnly = function () {
            return true;
        };

        LabelWidget.prototype.retainsState = function () {
            return false;
        };
        return LabelWidget;
    })(widget.FormattableWidget);
    exports.LabelWidget = LabelWidget;
});
