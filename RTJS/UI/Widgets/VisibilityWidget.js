/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    /**
    * Represents an user interface component whose visibility is determined by the data bound to it, according to the data-visibility attribute on the root element.
    */
    var VisibilityWidget = (function (_super) {
        __extends(VisibilityWidget, _super);
        function VisibilityWidget() {
            _super.apply(this, arguments);
        }
        VisibilityWidget.prototype.set = function (value) {
            // Do nothing as this widget's binding value only means to change the root element's visibility.
        };

        VisibilityWidget.prototype._lastBindingSourceDigest = function (value) {
            return _super.prototype._lastBindingSourceDigest.call(this, undefined);
        };
        return VisibilityWidget;
    })(widget.ViewOnlyWidget);
    exports.VisibilityWidget = VisibilityWidget;
});
