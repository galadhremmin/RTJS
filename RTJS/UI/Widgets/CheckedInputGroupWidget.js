/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget", "RTJS/Util/KeyValuePair", "RTJS/Util/Observable"], function(require, exports, widget, valueUtil, util) {
    var CheckedInputGroupWidget = (function (_super) {
        __extends(CheckedInputGroupWidget, _super);
        function CheckedInputGroupWidget(rootElement, properties) {
            _super.call(this, rootElement, properties);
            this.initControl();
        }
        CheckedInputGroupWidget.prototype.getType = function () {
            return this.type;
        };

        CheckedInputGroupWidget.prototype.disable = function (value) {
            var elements = this.getImmediateElements();

            for (var i = 0; i < elements.length; i += 1) {
                elements[i].disabled = value;
                $(elements[i]).trigger('disabledchange.inputgroup');
            }
        };

        CheckedInputGroupWidget.prototype.set = function (data) {
            var elem = this.rootElement, dataArray = $.isArray(data) ? data : [data], selectedValues = [], i, j, value, input, inputs, html, name, newIndex = null, domChanged = false;

            for (i = 0; i < dataArray.length; i += 1) {
                value = dataArray[i];
                if (value === null) {
                    throw 'ui_checkedInputGroupWidget: binding to null!';
                }

                if (!(value instanceof valueUtil.KeyValuePair)) {
                    value = new valueUtil.KeyValuePair(undefined, String(value));
                }

                selectedValues.push(value);
            }

            // get all checkboxes and radio buttons
            inputs = this.getImmediateElements(function (element) {
                var t = String(element.type).toUpperCase();
                if (t === 'CHECKBOX' || t === 'RADIO') {
                    this.unbindChangeEvent(element);
                    element.checked = false;

                    return true;
                }

                return false;
            });

            for (i = 0; i < selectedValues.length; i += 1) {
                value = selectedValues[i];

                for (j = 0; j < inputs.length; j += 1) {
                    input = inputs[j];
                    if (input.value === value.getValue()) {
                        input.checked = true;
                        break;
                    }
                }

                if (j < inputs.length) {
                    continue;
                }

                if (value.getKey() === undefined) {
                    console.log('ui_checkedInputGroupWidget: binding value does not exist in collection.');
                    continue;
                }

                if ($.inArray(value.getContainer(), ['checkbox', 'radio'])) {
                    throw 'The item with the value "' + value.getValue() + '" has an invalid or unsupported type "' + value.getContainer() + '". Check the container field.';
                }

                // generate the html code for the new input item
                if (value.getContainer() === 'radio') {
                    name = this.rootElement.attr('id') + '-radio';
                } else {
                    name = this.rootElement.attr('id') + '-' + (newIndex || j);
                }

                html = '<label><input name="' + name + '" type="' + value.getContainer() + '" value="' + value.getValue() + '" />' + value.getKey() + '</label>';

                elem.append(html);

                // if checkboxitem is checked
                if (value.getChecked()) {
                    $(elem).find('input').attr('checked', 'true');
                }

                domChanged = true;
                newIndex = j + 1;
            }

            if (domChanged) {
                // initialize the input items again
                this.initControl();
            } else {
                // select and deselect all items again
                var checkbox = true;

                if (this.type === 'RADIO') {
                    this.select(inputs[0]); // <-- this will affect all inputs
                    checkbox = false;
                }

                for (i = 0; i < inputs.length; i += 1) {
                    this.bindChangeEvent(inputs[i]);

                    if (checkbox) {
                        this.select(inputs[i]);
                    }
                }
            }

            this.dispatchNotification('bind');
        };

        CheckedInputGroupWidget.prototype.get = function () {
            var result = [];

            //push the values of all selected inputs into the results array.
            this.getImmediateElements(function (elem) {
                if (elem.checked) {
                    var value = elem.value;
                    switch (value) {
                        case 'true':
                            value = true;
                            break;
                        case 'false':
                            value = false;
                            break;
                    }

                    result.push(value);
                }

                return false;
            });

            return result;
        };

        CheckedInputGroupWidget.prototype.validate = function (typeName) {
            var result = this.get();
            return result.length < 1 && this.type === 'RADIO' ? false : true;
        };

        CheckedInputGroupWidget.prototype._lastBindingSourceDigest = function (value) {
            // Radio can only select one element at the time, so ensure that the digest is calculated on the
            // selected value, and not an array with the selected value as an element within.
            if (value === 0 && this.type === 'RADIO') {
                var currentValue = this.get();
                if (currentValue.length) {
                    value = JSON.stringify(currentValue[0]).hashCode();
                }
            }

            return _super.prototype._lastBindingSourceDigest.call(this, value);
        };

        CheckedInputGroupWidget.prototype.belongsToMe = function (node) {
            var myself = this.rootElement.get(0);
            node = node.parentNode;
            do {
                if (String(node.tagName).toUpperCase() === 'FIELDSET') {
                    return node === myself;
                }
                node = node.parentNode;
            } while(node);

            return false;
        };

        CheckedInputGroupWidget.prototype.getImmediateElements = function (callbackFunction, nodeName) {
            if (nodeName === undefined) {
                nodeName = 'input';
            }

            var node, i, inputs = this.rootElement.get(0).getElementsByTagName(nodeName), r = [];

            for (i = 0; i < inputs.length; i += 1) {
                node = inputs[i];
                if (this.belongsToMe(node)) {
                    if (callbackFunction && !callbackFunction.call(this, node)) {
                        continue;
                    }

                    r.push(node);
                }
            }

            return r;
        };

        CheckedInputGroupWidget.prototype.bindChangeEvent = function (selector) {
            if (!selector || $(selector).length < 1) {
                throw 'CheckedInputGroupWidget.unbindChangeEvent: invalid selector ' + selector;
            }

            var me = this;
            $(selector).on('change.inputgroup', function (ev) {
                me.changeEvent(this, ev);
            });

            $(selector).on('disabledchange.inputgroup', function (ev) {
                me.disabledChangeEvent(this, ev);
            });
        };

        CheckedInputGroupWidget.prototype.unbindChangeEvent = function (selector) {
            if (!selector || $(selector).length < 1) {
                throw 'CheckedInputGroupWidget.unbindChangeEvent: invalid selector ' + selector;
            }

            $(selector).off('change.inputgroup');
            $(selector).off('disabledchange.inputgroup');
        };

        CheckedInputGroupWidget.prototype.changeEvent = function (element, ev) {
            this.select(element);

            // Remove the last binding source as the user has interacted with the component and thus (possibly) invalidated its state.
            // This enables the restoration of the state by binding the same data, again.
            this._lastBindingSourceDigest(0);

            this.dispatchNotification('change', ev);
        };

        CheckedInputGroupWidget.prototype.disabledChangeEvent = function (element, ev) {
            var disabled = element.disabled, $this = $(element), parent = $(element).parent('label');

            if (disabled) {
                $this.data('prev-state', element.checked ? 1 : 0);
                $this.prop('checked', false);
                parent.addClass('disabled');
            } else {
                parent.removeClass('disabled');
                $this.prop('checked', $this.data('prev-state') == 1);
            }
        };

        CheckedInputGroupWidget.prototype.dispatchNotification = function (eventName, event) {
            var action = this.action() || null;
            this.notify(new util.Notification(eventName, event ? event.target : this, action, this.get()));
        };

        CheckedInputGroupWidget.prototype.select = function (element) {
            // Just for clairty - this method must be applied with this as the checkbox being manipulated
            var checkboxes, parent, $parent, i;

            if (this.type === 'RADIO') {
                // radio boxes require special treatment as their select state is relative, rather than individual. Thus
                // changing the state of one of the elements requires all elements to be re-evaluated. This is achieved by
                // acquiring their <fieldset> parent, and thereafter performing a selector of all available inputs.
                parent = element;
                do {
                    parent = parent.parentNode;
                } while(parent && String(parent.tagName).toUpperCase() !== 'FIELDSET');

                checkboxes = $(parent).find('label > input');
            } else {
                checkboxes = [element];
            }

            for (i = 0; i < checkboxes.length; ++i) {
                $parent = $(checkboxes[i]).parent('label');

                if (!$parent) {
                    continue;
                }

                if (checkboxes[i].checked) {
                    $parent.addClass('checked');
                } else {
                    $parent.removeClass('checked');
                }
            }
        };

        CheckedInputGroupWidget.prototype.initControl = function () {
            // Make sure that the source element is a <fieldset>
            if (String(this.rootElement.get(0).tagName).toUpperCase() !== 'FIELDSET') {
                throw 'ui_checkedInputGroupWidget: incorrect source element for ' + this.rootElement.attr('id') + '. Expecting fieldset.';
            }

            // Assign the input-group-list class to the parent <fieldset>. This CSS class will define its
            // custom appearance
            this.rootElement.addClass('input-group-list');

            // Find all <label>'s and their _descendant_ <input>'s and assign their type to the label. This is
            // necessary for the CSS definitions to distinguish between a checkboxes and radio buttons
            this.getImmediateElements(function (elem) {
                var checkbox = $(elem).find('input');
                if (checkbox.length < 1) {
                    console.error('WARNING! Label element (' + (elem.id || elem.name || elem.innerText) + ') without an input element.');
                    return;
                }

                $(elem).addClass(checkbox.attr('type'));

                if (checkbox.is(':checked')) {
                    $(elem).addClass('checked');
                }
                if (checkbox.is(':disabled')) {
                    $(elem).addClass('disabled');
                }

                this.bindChangeEvent(checkbox);
                if (!this.type) {
                    this.type = checkbox.attr('type').toUpperCase();
                }

                return true;
            }, 'label');
        };
        return CheckedInputGroupWidget;
    })(widget.Widget);
    exports.CheckedInputGroupWidget = CheckedInputGroupWidget;
});
