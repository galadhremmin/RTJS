/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget", "RTJS/Util/Observable"], function(require, exports, widget, util) {
    var MouseOverWidget = (function (_super) {
        __extends(MouseOverWidget, _super);
        function MouseOverWidget(rootElement, parameters) {
            var _this = this;
            _super.call(this, rootElement, parameters);

            var me = this;
            this.rootElement.on('mouseover', function (event) {
                me.mouseOverEvent(event, this);
            }).on('mousemove', function (event) {
                me.mouseMoveEvent(event, this);
            }).on('mouseout', function (event) {
                me.mouseOutEvent(event, this);
            });

            if (this.action()) {
                rootElement.on('click', function (event) {
                    return _this.clickEvent(event);
                });
            }

            // Enable clicking on anchor tags with mouseOverWidget in touch devices, e.g. iPhones
            this.rootElement.on('touchend', function (event) {
                var link = $(this).attr('href');
                window.location.href = link;

                return false;
            });
        }
        MouseOverWidget.prototype.mouseOverEvent = function (e, elem) {
            var $this = $(elem);

            clearTimeout($this.data('timeoutId'));

            var text = $this.data().title;
            $('body').append('<div class="super-puff-tooltip"><div class="tooltip-text">' + text + '</div><div class="super-puff-tooltip-triangle"></div></div>');

            this.notify(new util.Notification('mouseOver', this.rootElement, this.get(), e));
        };

        MouseOverWidget.prototype.mouseMoveEvent = function (e, elem) {
            var puffWidth = $('.super-puff-tooltip').width();
            $('.super-puff-tooltip').css('top', e.pageY - 68);
            $('.super-puff-tooltip').css('left', e.pageX - puffWidth - 15);
        };

        MouseOverWidget.prototype.mouseOutEvent = function (e, elem) {
            $('.super-puff-tooltip').remove();
        };

        MouseOverWidget.prototype.clickEvent = function (event) {
            var boundArg = null, notifyData;

            event.preventDefault();
            boundArg = this.rootElement.data('action-argument');

            notifyData = (boundArg != null && boundArg != undefined) ? { data: boundArg, event: event } : event;

            this.notify(new util.Notification('click', this.rootElement, this.action(), notifyData));
        };
        return MouseOverWidget;
    })(widget.ViewOnlyWidget);
    exports.MouseOverWidget = MouseOverWidget;
});
