/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var TextFormatterWidget = (function (_super) {
        __extends(TextFormatterWidget, _super);
        function TextFormatterWidget() {
            _super.apply(this, arguments);
        }
        TextFormatterWidget.prototype.set = function (value) {
            var elem = this.rootElement, innerText = elem.text(), data = ($.isArray(value)) ? value : [value], formattedText = '';

            //if the character { exists, treat innerText with string.format
            if (innerText.indexOf('{') >= 0) {
                formattedText = innerText.format.apply(innerText, data);
            } else {
                formattedText = data;
            }

            elem.text(formattedText);
        };
        return TextFormatterWidget;
    })(widget.ViewOnlyWidget);
    exports.TextFormatterWidget = TextFormatterWidget;
});
