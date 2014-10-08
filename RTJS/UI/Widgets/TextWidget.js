/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var TextWidget = (function (_super) {
        __extends(TextWidget, _super);
        function TextWidget() {
            _super.apply(this, arguments);
        }
        TextWidget.prototype.set = function (value) {
            if (value) {
                var html = $.parseHTML(value);

                // Don't super call the set method because 'value' is a html object.
                this.rootElement.html(html);
                this.rootElement.show();
            } else {
                this.rootElement.hide();
            }
        };
        return TextWidget;
    })(widget.ViewOnlyWidget);
    exports.TextWidget = TextWidget;
});
