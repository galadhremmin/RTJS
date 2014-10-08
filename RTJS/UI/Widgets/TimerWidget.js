/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget", "RTJS/Util/Observable"], function(require, exports, widget, util) {
    var TimerWidget = (function (_super) {
        __extends(TimerWidget, _super);
        function TimerWidget(rootElement, parameters) {
            var _this = this;
            _super.call(this, rootElement, parameters);

            this.interval = null;
            this.initialized = false;

            $(window).on('beforeunload', function () {
                return _this.stop();
            });
        }
        TimerWidget.prototype.start = function () {
            var _this = this;
            this.stop();
            this.interval = window.setInterval(function () {
                return _this.tick();
            }, 1000);
            this.tick(); // <-- apply initial formatting
        };

        TimerWidget.prototype.stop = function () {
            if (this.interval) {
                window.clearInterval(this.interval);
            }
            this.interval = null;
        };

        TimerWidget.prototype.tick = function () {
            var value = this.rootElement.data('value');

            // Reduce the value by a second
            value -= 1;
            if (value < 1) {
                value = 0;
                this.notify(new util.Notification('zeroed', this.rootElement, this.action(), event));
                this.stop();
            }

            // Format the output in minutes:seconds
            var minutes = Math.floor(value / 60), seconds = value % 60;

            if (minutes < 10) {
                minutes = '0' + minutes;
            }

            if (seconds < 10) {
                seconds = '0' + seconds;
            }

            this.rootElement.html(minutes + ':' + seconds);

            // Save the new value
            this.rootElement.data('value', value);
        };

        TimerWidget.prototype.set = function (value) {
            if (this.initialized) {
                console.log('TimerWidget (#' + this.id() + ') has already been initialized and will ignore all binding requests.');
                return;
            }

            if (isNaN(value)) {
                throw 'Non-numeric value bound to ui_timerWidget.';
            }

            this.rootElement.data('value', value);
            this.start();

            this.initialized = true;
        };

        TimerWidget.prototype.get = function () {
            return this.rootElement.data('value');
        };

        TimerWidget.prototype.retainsState = function () {
            return true;
        };

        TimerWidget.prototype._serializeState = function (data) {
            return { value: data, t: new Date().getTime() };
        };

        TimerWidget.prototype._deserializeState = function (data) {
            var value = data.value, dt = new Date().getTime() - data.t;

            value -= Math.floor(dt * 0.001);
            if (value < 0) {
                value = 0;
            }

            return value;
        };

        TimerWidget.prototype.validate = function () {
            return true;
        };
        return TimerWidget;
    })(widget.Widget);
    exports.TimerWidget = TimerWidget;
});
