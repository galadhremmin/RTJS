/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var HiddenWidget = (function (_super) {
        __extends(HiddenWidget, _super);
        function HiddenWidget() {
            _super.apply(this, arguments);
        }
        HiddenWidget.prototype.set = function (value) {
            this.rootElement.val(value);
            this.rootElement.trigger('change');
        };

        HiddenWidget.prototype.get = function () {
            return this.rootElement.val();
        };

        HiddenWidget.prototype.validate = function (typeName) {
            return true;
        };
        return HiddenWidget;
    })(widget.Widget);
    exports.HiddenWidget = HiddenWidget;
});
