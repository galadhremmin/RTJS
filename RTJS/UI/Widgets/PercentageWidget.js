/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var PercentageWidget = (function (_super) {
        __extends(PercentageWidget, _super);
        function PercentageWidget(rootElement, parameters) {
            _super.call(this, rootElement, parameters, 'decimal');
        }
        PercentageWidget.prototype.validate = function (typeName) {
            var result, associatedLabel, value = this.get();

            if (!value) {
                this.set(0);
                value = this.get();
            }

            result = _super.prototype.validate.call(this, 'float');

            // Cannot be higher than 100%
            value = parseFloat(value);

            if (result && (isNaN(value) || value > 100)) {
                // Fetch the associated label for this element
                associatedLabel = $('label[for="' + this.id() + '"]');

                // Order of acquiring: 1) label text, 2) element ID, 3) element name
                var elementName = associatedLabel.length ? associatedLabel.text() : (this.id() || this.rootElement.attr('name'));

                if (elementName === undefined) {
                    throw 'There is no label associated with this element: ' + this.id();
                }

                this.validationError = ptk.lang.common.validation['percentage'].format(elementName);

                result = false;
            }

            return result;
        };
        return PercentageWidget;
    })(widget.FormattableWidget);
    exports.PercentageWidget = PercentageWidget;
});
