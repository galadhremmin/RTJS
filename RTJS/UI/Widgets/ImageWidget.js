/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var ImageWidget = (function (_super) {
        __extends(ImageWidget, _super);
        function ImageWidget() {
            _super.apply(this, arguments);
        }
        ImageWidget.prototype.set = function (value) {
            var elem = this.rootElement;
            if (value) {
                elem.prop('src', value);
                elem.css('visibility', 'visible');
            } else {
                elem.css('visibility', 'hidden');
            }
        };
        return ImageWidget;
    })(widget.ViewOnlyWidget);
    exports.ImageWidget = ImageWidget;
});
