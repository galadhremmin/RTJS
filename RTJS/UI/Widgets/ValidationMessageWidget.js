/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var ValidationMessageWidget = (function (_super) {
        __extends(ValidationMessageWidget, _super);
        function ValidationMessageWidget() {
            _super.apply(this, arguments);
        }
        ValidationMessageWidget.prototype.set = function (message) {
            var elem = this.rootElement, showFlag = Boolean(elem.data('showFlag')), useColour = Boolean(elem.data('useColour')), html = showFlag ? '<span style="float: left; margin-left: 0;" class="error-description icon warning"></span>' : '' + '<p class="' + (useColour ? 'error-description' : '') + '">' + message + '</p>';

            if (message) {
                this.rootElement.html(html);
            } else {
                this.rootElement.empty();
            }
        };
        return ValidationMessageWidget;
    })(widget.ViewOnlyWidget);
    exports.ValidationMessageWidget = ValidationMessageWidget;
});
