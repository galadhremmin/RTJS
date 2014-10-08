/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget", "RTJS/Util/Observable", "RTJS/Util/KeyValuePair", "RTJS/Util/CheckboxItem"], function(require, exports, widget, util, assoc, checkbox) {
    var SelectWidget = (function (_super) {
        __extends(SelectWidget, _super);
        function SelectWidget(rootElement, parameters) {
            var _this = this;
            _super.call(this, rootElement, parameters);

            if (!rootElement.is('select')) {
                throw 'The selectWidget must be used with <select>.';
            }

            rootElement.customSelect();
            rootElement.on('change.widget', function (event) {
                return _this.changeEvent(event);
            });
        }
        SelectWidget.prototype.set = function (values) {
            var _this = this;
            if (!$.isArray(values)) {
                values = [values];
            }

            // disable events
            this.rootElement.off('change.widget');

            // Handle util_keyValue classes, which might be used to append new options to the
            // existing select view. This is achieved by passing an array of util_keyValue
            // objects.
            var text, value, widget = this.rootElement.get(0), i, j, indexes = [];
            for (i = 0; i < values.length; i += 1) {
                text = values[i];

                if (text instanceof assoc.KeyValuePair) {
                    // Get the value and the textual content for the <option> element.
                    //
                    // Note: this is an unfortunate naming clash! The util_keyValue class
                    //       is generic and has been designed with the intent that it
                    //       would suit variety of contexts.
                    //
                    // *          This is why the KEY is the VALUE and the
                    // *          VALUE is the TEXTUAL CONTENT
                    // *          of the <option> element.
                    //
                    value = text.getKey();
                    text = text.getValue();

                    for (j = 0; j < widget.options.length; j += 1) {
                        // Look for an existing <option> element.
                        if (widget.options[j].value == value) {
                            // If it exists, make sure to that its textual content is correct
                            // by applying it. For convenience, jQuery is used here.
                            $(widget.options[j]).text(text);
                            break;
                        }
                    }

                    // If the j index counter equals the length of the array of option
                    // elements, the list doesn't contain an element with the specified
                    // ID. Add one.
                    if (j === widget.options.length) {
                        widget.options[widget.options.length] = new Option(text, value);
                    }

                    // All done. The CheckboxItem class is a specialization of the util_keyValue
                    // class. It adds the ability to set whether the item (in this case the <option>)
                    // should be selected or not.
                    //
                    // Check if the value object is of this class, and if it is, if it is considered
                    // selected (by checking its checked status).
                    if (values[i] instanceof checkbox.CheckboxItem && values[i].getChecked()) {
                        indexes.push(value);
                    }
                } else {
                    indexes.push(values[i]);
                }
            }

            // Now use jQuery to perform the actual selection
            this.rootElement.val(indexes);

            // enable events
            this.rootElement.on('change.widget', function (event) {
                return _this.changeEvent(event);
            });
            if (indexes.length > 0) {
                this.rootElement.trigger('change');
            }
        };

        SelectWidget.prototype.get = function () {
            return this.rootElement.val();
        };

        SelectWidget.prototype.validate = function () {
            var value = this.get();
            return value !== undefined;
        };

        SelectWidget.prototype.removeAllItems = function (listOfExceptions) {
            if (!$.isArray(listOfExceptions)) {
                listOfExceptions = [];
            }

            this.rootElement.find('option').each(function () {
                if ($.inArray(this.value, listOfExceptions) == -1) {
                    $(this).remove();
                }
            });

            this._lastBindingSourceDigest(0);
        };

        SelectWidget.prototype.changeEvent = function (event) {
            event.preventDefault();
            this.notify(new util.Notification('change', this.rootElement, this.action(), this.get()));
        };
        return SelectWidget;
    })(widget.Widget);
    exports.SelectWidget = SelectWidget;
});
