/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var EmailInputWidget = (function (_super) {
        __extends(EmailInputWidget, _super);
        function EmailInputWidget(rootElement, parameters) {
            var _this = this;
            _super.call(this, rootElement, parameters);

            this.validationErrorContainer = rootElement.data('validate-container-id');

            // Disable copy and paste
            rootElement.on('copy', function (ev) {
                ev.preventDefault();
                return false;
            });

            rootElement.on('paste', function (ev) {
                ev.preventDefault();

                // show validation error message
                if (_this.validationErrorContainer) {
                    $('#' + _this.validationErrorContainer).show();
                }

                return false;
            });
        }
        EmailInputWidget.prototype.validate = function (typeName) {
            var elem = this.rootElement, siblingId = elem.data('validate-against'), siblingText = '', emptyEmailValid = elem.data('validate-allow-empty'), text = elem.val();

            if ((text.length < 1 && !emptyEmailValid) || !this.isValidEmail(text, emptyEmailValid)) {
                this.validationError = rtjs.Language.current().validation.missingEmail;
                return false;
            }

            if (siblingId) {
                siblingText = $('#' + siblingId).val();

                if (siblingText.toLowerCase() !== text.toLowerCase()) {
                    this.validationError = rtjs.Language.current().validation.emailMismatch;
                    return false;
                }
            }

            return true;
        };

        EmailInputWidget.prototype.isValidEmail = function (text, emptyEmailValid) {
            if (emptyEmailValid && !text) {
                return true;
            }

            return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i.test(text);
        };
        return EmailInputWidget;
    })(widget.Widget);
    exports.EmailInputWidget = EmailInputWidget;
});
