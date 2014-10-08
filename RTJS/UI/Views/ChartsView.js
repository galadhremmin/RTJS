var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./View", "RTJS/UI/Widgets/Abstract/Widget"], function(require, exports, view, widgets) {
    var ChartsView = (function (_super) {
        __extends(ChartsView, _super);
        function ChartsView() {
            _super.apply(this, arguments);
        }
        ChartsView.prototype.load = function (callback) {
            var _this = this;
            _super.prototype.load.call(this, function () {
                _this.widgets.each(function (wdgt) {
                    if (wdgt instanceof widgets.ChartWidget) {
                        var chart = wdgt;

                        chart.create();
                        chart.render();
                    }
                });

                if ($.type(callback) === 'function') {
                    callback.call(_this);
                }
            });
        };
        return ChartsView;
    })(view.ButtonView);
    exports.ChartsView = ChartsView;
});
