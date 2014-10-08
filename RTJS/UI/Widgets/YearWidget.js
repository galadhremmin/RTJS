/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget", "RTJS/Util/Observable"], function(require, exports, widget, util) {
    var YearWidget = (function (_super) {
        __extends(YearWidget, _super);
        function YearWidget(rootElement, parameters) {
            var _this = this;
            _super.call(this, rootElement, parameters, 'year');

            if (!this.writeOnly()) {
                rootElement.on('change', function (event) {
                    return _this.elementChanged(event);
                });
            }
        }
        YearWidget.prototype.get = function () {
            var value = _super.prototype.get.call(this);
            if (value === undefined) {
                return undefined;
            }

            if (!/^[12][0-9]{3}$/.test(value)) {
                return 0;
            }

            return parseInt(value);
        };

        YearWidget.prototype.validate = function (typeName) {
            var year = this.get(), thisYear = new Date().getFullYear(), associatedLabel = $('label[for="' + this.id() + '"]'), elementName = associatedLabel.length ? associatedLabel.text() : (this.id() || this.rootElement.attr('name'));

            if (this.rootElement.is(':visible')) {
                if (isNaN(parseInt(year, 10))) {
                    this.validationError = rtjs.Language.current().validation.missingYear.format(elementName);
                    return false;
                }
                if (year > thisYear) {
                    this.validationError = rtjs.Language.current().validation.futureYear;
                    return false;
                }
                if (year < (thisYear - 100)) {
                    this.validationError = rtjs.Language.current().validation.pastYear;
                    return false;
                }
            }

            return true;
        };

        YearWidget.prototype.elementChanged = function (event) {
            if (this.action() !== undefined) {
                this.notify(new util.Notification('change', this.rootElement, this.action(), this.get()));
            }
        };
        return YearWidget;
    })(widget.FormattableWidget);
    exports.YearWidget = YearWidget;
});
