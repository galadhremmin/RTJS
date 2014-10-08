var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "RTJS/Util/Observable", "RTJS/Util/Collection", "RTJS/UI/Widgets/ButtonWidget", "RTJS/UI/Widgets/InputWidget"], function(require, exports, util, collection, widgetB, widgetI) {
    var View = (function (_super) {
        __extends(View, _super);
        function View(rootElement) {
            _super.call(this);
            this.rootElement = rootElement;
            this.widgets = new collection.Collection();
            this.validationErrors = [];
            this.keyedWidgets = {};
            this.loaded = false;
            this.pendingBinding = [];
        }
        View.prototype.load = function (callback) {
            var _this = this;
            var initializer = new rtjs.Initializer(this.rootElement, false);
            initializer.initialize(new rtjs.WidgetInitializer(), function (loadedWidgets) {
                var i;
                var loadedWidget;

                for (i = 0; i < loadedWidgets.length; i += 1) {
                    loadedWidget = loadedWidgets[i];

                    // Instruct the view to observe the widget for notifications, usually raised by
                    // user interaction
                    loadedWidget.observe(_this);

                    // Instruct the widget that it might restore it's previous state, if applicable.
                    loadedWidget.restore();

                    _this.widgets.add(loadedWidget);
                }

                if ($.type(callback) === 'function') {
                    callback.call(_this);
                }

                for (i = 0; i < _this.pendingBinding.length; i += 1) {
                    _this.bindInternal(_this.pendingBinding[i]);
                }

                _this.loaded = true;
                _this.pendingBinding = undefined;
            });
        };

        View.prototype.bind = function (source) {
            // If components are still being loaded, push the binding source to a pending queue.
            if (!this.loaded) {
                this.pendingBinding.push(source);
            } else {
                this.bindInternal(source);
            }
        };

        /**
        * Invokes the reflow()-method on all widgets associated with this view, which might trigger them to
        * recalculate their dimensions and repaint. For hidden views, this method is useful to invoke when the
        * view is appears, because some widgets might erroneously assume that their parent containers were
        * in fact visible when they, the widgets, were bound.
        */
        View.prototype.reflow = function () {
            this.widgets.each(function (item) {
                item.reflow();
            });
        };

        View.prototype.bindInternal = function (source) {
            var cache = {}, path, value, hashCode, getPropertyValue = function (absolutePath) {
                var i, tmp = source, props = absolutePath.split('.');

                // No dot = no hierarchy. Grab the value from the source.
                if (props.length < 2) {
                    return tmp[path];
                }

                for (i = 0; i < props.length; ++i) {
                    if (!tmp || !tmp.hasOwnProperty(props[i])) {
                        return undefined;
                    }

                    tmp = tmp[props[i]];
                }

                return tmp;
            };

            var zombies = [];
            this.widgets.each(function (widget, i) {
                // Ensure that the widget is still residing in the DOM
                if (!widget.inDOM()) {
                    zombies.push(i);
                    return;
                }

                // Look for the binding property within the specified data source
                path = widget._bindingSource();
                if (path === undefined) {
                    return;
                }

                value = getPropertyValue(path);
                if (value === undefined) {
                    return;
                }

                if (!cache.hasOwnProperty(path)) {
                    cache[path] = JSON.stringify(value).hashCode();
                }

                // Calculate hash code for the binding data source, and look at the previous binding
                // to associate
                hashCode = cache[path];
                if (widget._lastBindingSourceDigest() === hashCode) {
                    return;
                }

                widget.bind(value, hashCode);
            });

            // exterminate zombies (widgets living on even as they have left the DOM). This can happen when
            // a dialogue is opened and later closed, or when its contents are mutated.
            if (zombies.length) {
                var index = zombies.length;
                while (index) {
                    this.widgets.remove(zombies[index - 1]);
                    index -= 1;
                }
            }
        };

        /**
        * Creates an object containing current values from all widgets associated with this view.
        */
        View.prototype.read = function () {
            var values = {}, me = this;

            this.widgets.each(function (widget) {
                if (!widget.writeOnly()) {
                    var value = widget.get(), path = widget.key();

                    if ($.type(path) === 'string') {
                        me.appendToObject(values, path, value);
                    }
                }
            });

            return values;
        };

        /**
        * Validates all widgets associated with this view. Widgets not supporting interaction are ignored.
        */
        View.prototype.validate = function () {
            // Reset the array with validation errors if it's not empty
            if (this.validationErrors.length > 0) {
                this.validationErrors = [];
            }

            // Validate the view by invoking the validation method on all viable input fields
            var me = this;
            this.widgets.each(function (widget) {
                if (!widget.writeOnly() && !widget.validate()) {
                    me.validationErrors.push(widget.validationError);
                }
            });

            return this.validationErrors.length === 0;
        };

        /**
        * Returns the widget object for the specified ID. Returns null if none was fund.
        */
        View.prototype.widgetById = function (id) {
            // Look for previous searches that might be cached. This is a slight performance enhancement.
            if (this.keyedWidgets.hasOwnProperty(id)) {
                return this.keyedWidgets[id];
            }

            var widget = this.widgets.find(function (w) {
                return w.id() === id;
            }) || null;
            if (widget !== null) {
                this.keyedWidgets[id] = widget;
            }

            return widget;
        };

        /**
        * Returns the widget associated with the specified element. Returns null is none is found.
        */
        View.prototype.widgetByElement = function (element) {
            return this.widgets.find(function (widget) {
                return widget.rootElement.is(element);
            }) || null;
        };

        View.prototype.id = function () {
            return this.rootElement.attr('id');
        };

        View.prototype.inDOM = function () {
            return !!this.rootElement.get(0).parentElement;
        };

        /**
        * Appends the specified value to the target object to the path specified. Hierarchical paths are supported.
        * The changes are committed on the target object reference, but the reference is also returned in the end.
        */
        View.prototype.appendToObject = function (target, absolutePath, value) {
            var names = absolutePath.split('.');

            if (value === 'true' || value === 'false') {
                value = value === 'true';
            } else if (!isNaN(value)) {
                value = parseFloat(value);
            }

            for (var i = 0; i < names.length - 1; i += 1) {
                if (target[names[i]] === undefined) {
                    target[names[i]] = {};
                }

                target = target[names[i]];
            }

            if (names.length) {
                target[names[names.length - 1]] = value;
                target = target[names[names.length - 1]];
            }

            return target;
        };

        View.prototype.notified = function (source, data) {
            this.notify(data); // let the notification 'bubble up'
        };
        return View;
    })(util.Observable);
    exports.View = View;

    var ButtonView = (function (_super) {
        __extends(ButtonView, _super);
        function ButtonView() {
            _super.apply(this, arguments);
        }
        ButtonView.prototype.notified = function (source, data) {
            if (source instanceof widgetB.ButtonWidget || source instanceof widgetI.InputWidget) {
                _super.prototype.notified.call(this, source, data);
            }
        };
        return ButtonView;
    })(View);
    exports.ButtonView = ButtonView;
});
