/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget", "RTJS/Util/Observable"], function(require, exports, widget, util) {
    var CurrencyWidget = (function (_super) {
        __extends(CurrencyWidget, _super);
        function CurrencyWidget(rootElement, parameters) {
            var _this = this;
            _super.call(this, rootElement, parameters, 'thousand');

            if (!this.writeOnly()) {
                rootElement.on('change', function (event) {
                    return _this.changeEvent(event);
                });
            }
        }
        CurrencyWidget.prototype.set = function (value) {
            if (this.writeOnly()) {
                value = ptk.formatter.format(this.formatter, value);
                this.rootElement.text(value + ' kr');
            } else {
                _super.prototype.set.call(this, value);
            }
        };

        CurrencyWidget.prototype.validate = function (typeName) {
            // Skip validation for write-only ("ViewOnly") widgets
            if (this.writeOnly()) {
                return true;
            }

            var result, associatedLabel, value = this.get(), max = 2147483647;

            if (!value) {
                this.set(0);
                value = this.get();
            }

            result = _super.prototype.validate.call(this, 'integer');

            // Validate valid 32 bit integer
            if (result) {
                value = parseInt(value, 10);
                result = (value < max);
            }

            if (!result) {
                // Fetch the associated label for this element
                associatedLabel = $('label[for="' + this.id() + '"]');

                // Order of acquiring: 1) label text, 2) element ID, 3) element name
                var elementName = associatedLabel.length ? associatedLabel.text() : (this.id() || this.rootElement.attr('name'));

                if (elementName === undefined) {
                    throw 'There is no label associated with this element: ' + this.id();
                }

                if (isNaN(value)) {
                    this.validationError = ptk.lang.common.validation['integer'].format(elementName);
                } else if (value > max) {
                    this.validationError = ptk.lang.common.validation['integerTooBig'].format(elementName, ptk.formatter.format('thousand', max));
                }

                result = false;
            }

            return result;
        };

        CurrencyWidget.prototype.changeEvent = function (event) {
            var action = this.action();
            if (action) {
                this.notify(new util.Notification('keyup', this.rootElement, action, this.get()));
            }
        };
        return CurrencyWidget;
    })(widget.FormattableWidget);
    exports.CurrencyWidget = CurrencyWidget;
});
