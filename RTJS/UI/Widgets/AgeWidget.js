/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var AgeWidget = (function (_super) {
        __extends(AgeWidget, _super);
        function AgeWidget(rootElement, parameters) {
            _super.call(this, rootElement, parameters);
        }
        AgeWidget.prototype.params = function () {
            return this.parameters;
        };

        AgeWidget.prototype.validate = function (typeName) {
            var elem = this.rootElement, text = elem.val(), inputAge = parseInt(text), maxAge = this.params().maxage, minAge = this.params().minage;

            if (text.length < 1) {
                this.validationError = ptk.lang.common.validation.missingAge;
                return false;
            } else if (maxAge !== undefined && inputAge > maxAge) {
                this.validationError = ptk.lang.common.validation.tooOld.format(maxAge);
                return false;
            } else if (minAge !== undefined && inputAge < minAge) {
                this.validationError = ptk.lang.common.validation.tooYoung.format(minAge);
                return false;
            }

            return true;
        };
        return AgeWidget;
    })(widget.Widget);
    exports.AgeWidget = AgeWidget;
});
