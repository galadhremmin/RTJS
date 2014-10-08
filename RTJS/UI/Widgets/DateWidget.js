/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var DateWidget = (function (_super) {
        __extends(DateWidget, _super);
        function DateWidget(rootElement, parameters) {
            _super.call(this, rootElement, parameters, 'date');
        }
        DateWidget.prototype.validate = function (typeName) {
            if (this.writeOnly()) {
                return true;
            }

            var year, month, day, associatedLabel, elementName, rawDate = this.get(), date, today = new Date(), a100YearsAgo = new Date(today.getFullYear() - 100, 0, 1);

            year = rawDate.substring(0, 4);
            month = rawDate.substring(4, 6);
            day = rawDate.substring(6, 8);
            date = new Date(year, month - 1, day);

            // Fetch the associated label for this element
            associatedLabel = $('label[for="' + this.id() + '"]');

            // Order of acquiring: 1) label text, 2) element ID, 3) element name
            elementName = associatedLabel.length ? associatedLabel.text() : (this.id() || this.rootElement.attr('name'));

            if (elementName === undefined) {
                throw 'There is no label associated with this element: ' + this.id();
            }

            //validate that it is a correct date (including checks for leap year). If not, show error message
            if (date <= today) {
                if (day > 31 || day < 1 || month > 12 || month < 1) {
                    this.validationError = ptk.lang.common.validation.wrongDate;
                    return false;
                } else if (day >= 31 && (month == 4 || month == 6 || month == 9 || month == 11)) {
                    this.validationError = ptk.lang.common.validation.wrongDate;
                    return false;
                } else if (this.isLeapYear(year) && day == 29 && month == 2) {
                    return _super.prototype.validate.call(this, 'date');
                } else if (day >= 29 && month == 2) {
                    this.validationError = ptk.lang.common.validation.wrongDate;
                    return false;
                } else if (date < a100YearsAgo) {
                    this.validationError = ptk.lang.common.validation.pastYear;
                    return false;
                }
            } else {
                this.validationError = ptk.lang.common.validation.futureYear;
                return false;
            }

            return _super.prototype.validate.call(this, 'date');
        };

        DateWidget.prototype.isLeapYear = function (year) {
            if (year % 400 === 0 || (year % 100 != 0 && year % 4 == 0)) {
                return true;
            }

            return false;
        };
        return DateWidget;
    })(widget.FormattableWidget);
    exports.DateWidget = DateWidget;
});
