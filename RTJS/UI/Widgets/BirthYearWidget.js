var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./YearWidget"], function(require, exports, widget) {
    var BirthYearWidget = (function (_super) {
        __extends(BirthYearWidget, _super);
        function BirthYearWidget() {
            _super.apply(this, arguments);
        }
        BirthYearWidget.prototype.validate = function (typeName) {
            var year = this.get(), thisYear = new Date().getFullYear(), parsedYear, associatedLabel, elementName;

            if (!_super.prototype.validate.call(this, 'year')) {
                return false;
            }

            if (this.rootElement.is(':visible')) {
                if (year.length < 4) {
                    // Fetch the associated label for this element
                    associatedLabel = $('label[for="' + this.id() + '"]');

                    // Order of acquiring: 1) label text, 2) element ID, 3) element name
                    elementName = associatedLabel.length ? associatedLabel.text() : (this.id() || this.rootElement.attr('name'));

                    this.validationError = ptk.lang.common.validation['year'].format(elementName);

                    return false;
                }

                parsedYear = new Date(year + '/01/01').getFullYear();

                if (parsedYear > thisYear) {
                    this.validationError = ptk.lang.common.validation['futureBirthYear'];
                    return false;
                }

                if (parsedYear < (thisYear - 100)) {
                    this.validationError = ptk.lang.common.validation['pastBirthYear'];
                    return false;
                }
            }

            return true;
        };
        return BirthYearWidget;
    })(widget.YearWidget);
    exports.BirthYearWidget = BirthYearWidget;
});
