/// <reference path="../View.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "RTJS/UI/Views/View", "RTJS/UI/Widgets/ButtonWidget", "RTJS/UI/Widgets/InputWidget"], function(require, exports, view, widgetB, widgetI) {
    var DialogueView = (function (_super) {
        __extends(DialogueView, _super);
        function DialogueView(root, container, breadcrumb) {
            var _this = this;
            _super.call(this, root);
            this.container = container;
            this.breadcrumb = breadcrumb;

            $(window).on('hashchange', function () {
                return _this.hashChanged.apply(_this, arguments);
            });
            this.isOpen = false;
        }
        DialogueView.prototype.hashChanged = function (event, data) {
            var current = window.location.hash, own = this.getHash();

            if (data && data.source !== this.rootElement) {
                return;
            }

            if (!this.rootElement.is(':visible') && current === own) {
                this.show();
            } else {
                this.hide();
            }
        };

        DialogueView.prototype.load = function (callback) {
            var _this = this;
            _super.prototype.load.call(this, function () {
                // The dialogue might already be opened. The user might have clicked the back button on
                // the browser. The easiest way to detect this is to check for forward slash in the current hash.
                if (String(window.location.hash).indexOf('/') > -1) {
                    // Forward slash found! Invoke the hashChanged method to check whether the dialogue is meant to be opened.
                    _this.hashChanged(null, null);
                }

                if (typeof callback === 'function') {
                    callback.apply(_this);
                }
            });
        };

        DialogueView.prototype.open = function () {
            if (this.rootElement.is(':visible')) {
                return;
            }

            this.pushHash(this.getHash());
        };

        /**
        * Close the dialog and optionally prevent hash changes. If hash changes are prevented, then you manually need to set window.location.hash
        */
        DialogueView.prototype.close = function (preventPopHash) {
            if (!this.rootElement.is(':visible')) {
                return;
            }

            if (!preventPopHash) {
                this.popHash();
            }
        };

        DialogueView.prototype.validate = function () {
            var result = _super.prototype.validate.call(this);
            if (result) {
                this.hideValidationErrors();
            } else {
                this.displayValidationErrors(this.validationErrors);
            }

            return result;
        };

        DialogueView.prototype.toggleFieldVisibility = function (action) {
            this.rootElement.find('[data-visible-on]').each(function () {
                var elem = $(this), showElem = elem.data('visible-on'), hideElem = elem.data('hidden-on');

                if (showElem && hideElem) {
                    if (String(showElem).indexOf(action) >= 0) {
                        elem.show();
                    } else if (String(hideElem).indexOf(action) >= 0) {
                        elem.hide();
                    }
                }
            });
        };

        DialogueView.prototype.show = function (callback) {
            var _this = this;
            this.isOpen = true;
            this.hideValidationErrors();

            $('#breadcrumb-step').text(' / ' + this.breadcrumb);

            this.rootElement.css({ visibility: 'visible' }).fadeIn($.proxy(function () {
                _this.container.css({ visibility: 'hidden' });
                _this.dialogueInitialize();

                if (callback !== undefined) {
                    callback.apply(_this);
                }
            }, this));
        };

        DialogueView.prototype.hide = function (callback) {
            var _this = this;
            this.isOpen = false;
            this.container.css({ visibility: 'inherit' });
            $('#breadcrumb-step').text('');

            this.rootElement.fadeOut($.proxy(function () {
                _this.rootElement.css({ visibility: 'hidden' });
                if (callback !== undefined) {
                    callback.apply(_this);
                }
            }, this));
        };

        DialogueView.prototype.dialogueInitialize = function () {
            // No further initialization. This method is meant to be overridden.
        };

        DialogueView.prototype.hideValidationErrors = function () {
            this.rootElement.find('.validation-error.error-description').empty();
            this.rootElement.find('.validation-error.error-description').hide();
        };

        DialogueView.prototype.displayValidationErrors = function (errors) {
            this.rootElement.find('.validation-error.error-description').html(errors[0]);
            this.rootElement.find('.validation-error.error-description').show();
        };

        DialogueView.prototype.getHash = function () {
            var hash = this.rootElement.data('slug');
            hash = hash || this.rootElement.attr('id');
            return '#' + hash;
        };

        DialogueView.prototype.pushHash = function (hash) {
            if (this.previousHash === hash) {
                return;
            }

            this.previousHash = window.location.hash;
            window.location.hash = hash;
        };

        DialogueView.prototype.popHash = function () {
            window.location.hash = this.previousHash || this.parentHash();
            $(window).trigger('hashchange', { source: this.rootElement });
        };

        DialogueView.prototype.parentHash = function () {
            var hash = window.location.hash.split('/');

            if (hash.length === 2) {
                return hash[0];
            }

            return '';
        };
        return DialogueView;
    })(view.View);
    exports.DialogueView = DialogueView;

    var ButtonDialogueView = (function (_super) {
        __extends(ButtonDialogueView, _super);
        function ButtonDialogueView() {
            _super.apply(this, arguments);
        }
        ButtonDialogueView.prototype.notified = function (source, data) {
            if (source instanceof widgetB.ButtonWidget || source instanceof widgetI.InputWidget) {
                _super.prototype.notified.call(this, source, data);
            }
        };
        return ButtonDialogueView;
    })(DialogueView);
    exports.ButtonDialogueView = ButtonDialogueView;
});
