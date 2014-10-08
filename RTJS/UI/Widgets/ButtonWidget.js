/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget", "RTJS/Util/Observable"], function(require, exports, widget, util) {
    var ButtonWidget = (function (_super) {
        __extends(ButtonWidget, _super);
        function ButtonWidget(rootElement, parameters) {
            var _this = this;
            _super.call(this, rootElement, parameters);
            rootElement.on('click', function (event) {
                return _this.clickEvent(event);
            });
        }
        ButtonWidget.prototype.set = function (value) {
            this.rootElement.data('action-argument', value);
        };

        ButtonWidget.prototype.clickEvent = function (event) {
            var boundArg = null, notifyData;

            event.preventDefault();
            boundArg = this.rootElement.data('action-argument');

            notifyData = (boundArg != null && boundArg != undefined) ? { data: boundArg, event: event } : event;

            this.notify(new util.Notification('click', this.rootElement, this.action(), notifyData));
        };
        return ButtonWidget;
    })(widget.ViewOnlyWidget);
    exports.ButtonWidget = ButtonWidget;
});
