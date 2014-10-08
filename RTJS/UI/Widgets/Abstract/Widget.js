var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "RTJS/Util/Observable", "RTJS/Util/SessionStorage"], function(require, exports, util, dataTool) {
    /**
    * Represents a user interface component which supports binding and content generation.
    *
    * This component can be stateful if the necessary methods are implemented.
    */
    var Widget = (function (_super) {
        __extends(Widget, _super);
        function Widget(rootElement, parameters) {
            var _this = this;
            _super.call(this);
            this.rootElement = rootElement;
            this.parameters = parameters;

            // Disable enter-keys in all input fields
            if (rootElement.is('input[type="text"]')) {
                rootElement.on('keydown', function (event) {
                    if (event.keyCode == 13 || event.keyCode == 108) {
                        event.preventDefault();
                        return false;
                    }

                    return true;
                });
            }

            // Zero the data content digest when changes are registered by the element. This will case it to be recalculated
            // when next accessed.
            if (rootElement.is('input,textarea,select')) {
                rootElement.on('change.widget', function (event, setTriggered) {
                    if (!setTriggered) {
                        _this._lastBindingSourceDigest(0);
                    }
                });
            }
        }
        /**
        * Retrieves the widget's default action handler specified by the data-action attribute. Returns undefined if none exist.
        */
        Widget.prototype.action = function () {
            return this.rootElement.data('action') || undefined;
        };

        Widget.prototype.key = function () {
            return this.rootElement.data('bind');
        };

        Widget.prototype._stateKey = function () {
            var elem = this.rootElement.get(0), id = String(elem.id || ''), path = window.location.pathname;

            if (id.length < 1) {
                return undefined;
            }

            return 'WS_' + path.replace(/[\/\s]/g, '.') + '_' + id;
        };

        Widget.prototype.retainsState = function () {
            return false;
        };

        Widget.prototype._serializeState = function (data) {
            return data;
        };

        Widget.prototype._deserializeState = function (data) {
            return data;
        };

        Widget.prototype._saveState = function () {
            var key = this._stateKey();
            if (key === undefined) {
                throw 'Failed to save state for the widget ' + this.toString();
            }

            var value = this.get();
            if (!value) {
                return;
            }

            value = this._serializeState(value);
            if (!value) {
                return;
            }

            dataTool.SessionStorage.instance().set(key, value);
        };

        Widget.prototype._loadState = function () {
            var _this = this;
            var key = this._stateKey();
            if (key === undefined) {
                return;
            }

            var data = dataTool.SessionStorage.instance().get(key);
            if (data) {
                this.set(this._deserializeState(data));
            }

            $(window).on('beforeunload', function () {
                _this._saveState();
            });
        };

        Widget.prototype._lastBindingSourceDigest = function (value) {
            if (value !== undefined) {
                if (value === 0) {
                    value = JSON.stringify(this.get()).hashCode();
                }

                this.rootElement.data('ds', value);
            }

            return this.rootElement.data('ds');
        };

        Widget.prototype._bindingSource = function () {
            return this.rootElement.data('bind');
        };

        Widget.prototype.restore = function () {
            if (this.retainsState()) {
                this._loadState();
            }
        };

        /**
        * Assigns the specified data to the widget. The dataHashCode parameter is optional, but might be used when you already have calculated the digest hash.
        */
        Widget.prototype.bind = function (data, dataDigest) {
            var status = this.visibleForData(data, true);

            // Save the digest to ensure that the same data isn't bound multiple times. This is performed
            // before the data is bound, as some widgets might trigger a event upon binding.
            if (status.changed() || status.visible) {
                this._lastBindingSourceDigest(dataDigest || 0);
            }

            // Apply the data. This method is specialized.
            if (status.visible) {
                this.set(data);
            }
        };

        Widget.prototype.visibleForData = function (data, apply) {
            var visibleForData = this.rootElement.data('visibility');
            var duration;
            var status = new VisibilityStatus(this.rootElement.css('display') !== 'none', true);

            if (visibleForData === undefined) {
                return status;
            }

            // Multiple data sources might be specified, separated by , Split it by this character
            // and iterate through each item and examine the data.
            var expressions = $.trim(String(visibleForData)).split(','), i;
            for (i = 0; i < expressions.length; i += 1) {
                if (this.validateVisibilityExpression(expressions[i], data)) {
                    break;
                }
            }

            // If none of the items match, the element is considered hidden.
            status.visible = i < expressions.length;

            // Actually apply visiblity based on this data as well.
            if (apply) {
                duration = this.rootElement.data('visibility-duration');
                if (duration) {
                    if (status.visible) {
                        this.rootElement.slideDown(duration);
                    } else {
                        this.rootElement.slideUp(duration);
                    }
                } else {
                    this.rootElement[status.visible ? 'show' : 'hide'](duration);
                }
            }

            return status;
        };

        Widget.prototype.validateVisibilityExpression = function (expression, data) {
            var visible;

            switch (expression[0]) {
                case '{':
                    try  {
                        var visibilityFunction = new Function('return (' + expression.replace(/^\{|\}$/g, '') + ');');
                        visible = visibilityFunction.call(data);
                    } catch (ex) {
                        visible = false;
                    }

                    break;
                case '!':
                    // The expression parameter contains the data it doesn't expect
                    visible = ($.trim(expression.substr(1)) != String(data));

                    break;
                default:
                    // The expression parameter contains the expected data
                    visible = (expression == String(data));

                    break;
            }

            return visible;
        };

        Widget.prototype.validate = function (typeName) {
            var rules = [{ selector: this.rootElement, type: typeName }], result = ValidationManager.validate(rules, null, true), associatedLabel, elementName;

            if (result) {
                this.validationError = null;
            } else {
                // Fetch the associated label for this element
                associatedLabel = $('label[for="' + this.rootElement.attr('id') + '"]');

                // Order of acquiring: 1) label text, 2) element ID, 3) element name
                elementName = associatedLabel.length ? associatedLabel.text() : (this.rootElement.attr('id') || this.rootElement.attr('name'));

                if (elementName === undefined) {
                    throw 'There is no label associated with this element: ' + this.rootElement.attr('id');
                }

                this.validationError = 'Dummy description!'; // TODO: ptk.lang.common.validation[typeName].format(elementName);
            }

            return result;
        };

        Widget.prototype.visible = function () {
            return !this.rootElement.is(':hidden');
        };

        Widget.prototype.executeOnElement = function (elementFunction) {
            if (elementFunction) {
                elementFunction.call(this.rootElement, this);
            }
        };

        Widget.prototype.inDOM = function () {
            return !!this.rootElement.get(0).parentElement;
        };

        /**
        * Retrieves the id attribute from the widget's root element. Returns null if the attribute doesn't exist.
        */
        Widget.prototype.id = function () {
            var id = this.rootElement.attr('id');
            return id || null;
        };

        /**
        * Binds the specified value to the widget's root element.
        */
        Widget.prototype.set = function (value) {
            if (this.writeOnly()) {
                this.rootElement.text(value);
            } else {
                this.rootElement.val(value);
                this.rootElement.trigger('change', [true]);
            }
        };

        /**
        * Retrieves the value contained by the widget. Returns undefined if the widget
        * doesn't support this method.
        */
        Widget.prototype.get = function () {
            if (this.writeOnly()) {
                return undefined;
            }

            return this.rootElement.val();
        };

        Widget.prototype.writeOnly = function () {
            return false;
        };

        /**
        * Recalculates and repaints the widget.
        */
        Widget.prototype.reflow = function () {
            // noop -- overload
        };
        return Widget;
    })(util.Observable);
    exports.Widget = Widget;

    /**
    * Represents an user interface component which supports binding, but doesn't change its content; get() always returns null, and the component is ignored by View.read.
    *
    * This component doesn't retain state.
    */
    var ViewOnlyWidget = (function (_super) {
        __extends(ViewOnlyWidget, _super);
        function ViewOnlyWidget() {
            _super.apply(this, arguments);
        }
        ViewOnlyWidget.prototype.get = function () {
            return undefined;
        };

        ViewOnlyWidget.prototype.writeOnly = function () {
            return true;
        };

        ViewOnlyWidget.prototype.validate = function (typeName) {
            return true;
        };

        ViewOnlyWidget.prototype.retainsState = function () {
            return false;
        };
        return ViewOnlyWidget;
    })(Widget);
    exports.ViewOnlyWidget = ViewOnlyWidget;

    /**
    * Represents an user interface component which supports binding, which is formatted according to the formatter specified by the data-value-format attribute on the root element.
    *
    * This component can be stateful if the necessary methods are implemented.
    */
    var FormattableWidget = (function (_super) {
        __extends(FormattableWidget, _super);
        function FormattableWidget(rootElement, parameters, formatterName) {
            _super.call(this, rootElement, parameters);

            if (formatterName !== undefined) {
                this.rootElement.data('value-format', formatterName);
            }

            this.formatter = this.rootElement.data('value-format') || null;
            this.supportsInput = this.rootElement.is('input,textarea');

            if (this.supportsInput && this.formatter) {
                ptk.formatter.install(this.rootElement, this.formatter);
            }
        }
        FormattableWidget.prototype.set = function (value) {
            if (this.formatter) {
                value = ptk.formatter.format(this.formatter, value);
            }

            _super.prototype.set.call(this, value);
        };

        /**
        * Retrieves the widget's current value. Returns undefiend if the widget is read-only ("ViewOnly").
        */
        FormattableWidget.prototype.get = function () {
            if (this.writeOnly()) {
                return undefined;
            }

            var value = this.rootElement.val();
            if (this.formatter) {
                value = ptk.formatter.unformat(this.formatter, value);
            }

            return value;
        };

        FormattableWidget.prototype.writeOnly = function () {
            return !this.supportsInput;
        };
        return FormattableWidget;
    })(Widget);
    exports.FormattableWidget = FormattableWidget;

    /**
    * Represents a charting widget which supports one-directonal binding.
    */
    var ChartWidget = (function (_super) {
        __extends(ChartWidget, _super);
        function ChartWidget() {
            _super.apply(this, arguments);
        }
        ChartWidget.prototype.create = function () {
            this.chart = ptk.charts.chart('#' + this.id(), this.settings());
        };

        ChartWidget.prototype.render = function () {
            if (this.chart && this.chart.needsRender()) {
                this.chart.render();
            }
        };

        ChartWidget.prototype.settings = function () {
            return {};
        };

        ChartWidget.prototype.set = function (value, changedConfig) {
            if (this.chart) {
                if (changedConfig) {
                    this.chart.updateConfig(changedConfig);
                }

                this.chart.setData(value);
            }
        };
        return ChartWidget;
    })(ViewOnlyWidget);
    exports.ChartWidget = ChartWidget;

    var VisibilityStatus = (function () {
        function VisibilityStatus(currentlyVisible, visible) {
            this.currentlyVisible = currentlyVisible;
            this.visible = visible;
        }
        /**
        * Determines whether the widget's visibility was modified.
        */
        VisibilityStatus.prototype.changed = function () {
            return this.currentlyVisible !== this.visible;
        };
        return VisibilityStatus;
    })();
    exports.VisibilityStatus = VisibilityStatus;

    var ValidationManager = (function () {
        function ValidationManager() {
        }
        ValidationManager.validate = function (data, feedbackLabelSelector, ignoreIfHidden) {
            /// <summary>Validates the specified data fields and provides error messages upon failure. The validation process is halted upon first failure.</summary>
            /// <param name="data" type="Array">An array of configuration objects (other is optional): { selector: '#element', type: 'integer|boolean|date|year|regexp', name: 'Element name', other: /^IfRegularExp$/ }</param>
            /// <returns>True if the form is valid</returns>
            var i, item, elem, feedbackLabel = $(feedbackLabelSelector);

            if (data && data.length) {
                for (i = 0; i < data.length; i += 1) {
                    item = data[i];
                    elem = $(item.selector);

                    if (!ignoreIfHidden || elem.is(':visible')) {
                        if (elem.length < 1 || !ValidationManager.validate(elem, item.type, item.other)) {
                            if (feedbackLabel && item.name) {
                                feedbackLabel.text('Dummy text'); // TODO: ptk.lang.common.validation[item.type].format(item.name));
                                feedbackLabel.show();
                            }

                            return false;
                        }
                    }
                }
            }

            feedbackLabel.hide();
            feedbackLabel.text('');

            return true;
        };

        ValidationManager.validateElement = function (elem, type, custom) {
            if (type === undefined) {
                return true;
            }

            var value, reg;

            switch (type) {
                case 'integer':
                    // matches integers 0 - 9, regardless of order (hence '0000999' passes validation)
                    reg = /^[0-9]+$/;
                    break;
                case 'float':
                    // matches floating points with , as the delimiter: 1234, 12,34 and 0,123.
                    reg = /^([0-9]+(\.[0-9]*)?|0\.[0-9]+)$/;
                    break;
                case 'boolean':
                    // matches 0, 1, yes & no
                    reg = /^([01]|yes|no)$/;
                    break;
                case 'date':
                    // matches YYYY-MM-DD and YYYYMMMDD with the following constraints:
                    // - millennia must begin with 1 or 2
                    // - month must begin with 0 or 1
                    // - day must begin with 1 through 3
                    // There is no validation of the date itself
                    reg = /^([12]{1}[0-9]{3}\-[01]{1}[0-9]{1}\-[0-3]{1}[0-9]{1}|[12]{1}[0-9]{3}[01]{1}[0-9]{1}[0-3]{1}[0-9]{1})$/;
                    break;
                case 'year':
                    // matches YYYY, where the millenia must begin with 1 or 2
                    reg = /^[12]{1}[0-9]{3}$/;
                    break;
                case 'regexp':
                    reg = custom;
                    break;
                default:
                    throw 'Unrecognised validation type: "' + type + '"';
            }

            value = ValidationManager.getValue(elem);
            return reg.test(value);
        };

        ValidationManager.getValue = function (elem) {
            // siming's special drop-down menu requires special treatment!
            if (elem.hasClass("radio-group")) {
                return elem.find('input:checked').val();
            }

            return elem.val();
        };
        return ValidationManager;
    })();
});
