/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget", "RTJS/UI/Views/View", "RTJS/Util/Observable"], function(require, exports, widget, view, util) {
    var InputWidget = (function (_super) {
        __extends(InputWidget, _super);
        function InputWidget(rootElement, parameters) {
            var _this = this;
            _super.call(this, rootElement, parameters);

            if (this.writeOnly()) {
                throw 'InputWidget is applied on ' + rootElement.get(0).nodeName + ', which is immutable and doesn\'t support user interaction. This is bad.';
            }

            if (this.params().autocomplete) {
                this.initAutoComplete(rootElement);
            } else {
                this.rootElement.on('change', function () {
                    return _this.changeEvent();
                });
            }
        }
        InputWidget.prototype.changeEvent = function () {
            this.notify(new util.Notification('change', this.rootElement, this.action(), this.get()));
        };

        InputWidget.prototype.params = function () {
            var param = {};
            $.extend(param, this.parameters);

            param.autocomplete = /^true$/i.test(this.parameters['autocomplete']);

            return param;
        };

        InputWidget.prototype.initAutoComplete = function (rootElement) {
            var _this = this;
            var wrapper = $('<div />');
            var result = $('<div />');

            wrapper.css({ height: 'auto', padding: '0', margin: '0', position: 'relative' });
            result.css({ position: 'absolute', left: '0', top: (rootElement.outerHeight(true) + 1) + 'px', width: rootElement.outerWidth() - 2 + 'px' });

            result.html('<ul data-widget="list" data-bind="_" data-widget-links="true" data-widget-highlighting="true" data-action="autoItemClicked"></ul>');

            //result.children('ul').hide();
            result.addClass('autocomplete-result');

            rootElement.wrap(wrapper);
            rootElement.parent().append(result);

            this.autoCompleteView = new view.View(result);
            this.autoCompleteView.observe(this);
            this.autoCompleteView.load();

            this.rootElement.on('keyup', function (ev) {
                return _this.autoChangedState(ev);
            });
            this.rootElement.on('focus', function (ev) {
                return _this.autoClientArrived(ev);
            });
            this.rootElement.on('blur', function (ev) {
                return _this.autoClientLeft(ev);
            });

            result.on('mouseenter', function (ev) {
                return _this.autoResultClientArrived(ev);
            });
            result.on('mouseleave', function (ev) {
                return _this.autoResultClientLeft(ev);
            });

            result.hide();

            this.autoTimerId = 0;
            this.autoStateDigest = 0;
            this.autoNavIndex = 0;
            this.autoResultListExposed = false;
        };

        InputWidget.prototype.autoComplete = function (items) {
            var data = [];
            var params = this.params();
            var i;

            for (i = 0; i < items.length; i += 1) {
                data.push({
                    title: items[i][params.autocompleteKeyProperty],
                    url: items[i][params.autocompleteValueProperty],
                    highlight: this.rootElement.val()
                });
            }

            this.autoCompleteView.bind({ _: data });
            this.autoCompleteView.rootElement[data.length ? 'show' : 'hide']();

            this.autoNavIndex = 0;
            this.autoNavigatedSelect();
        };

        InputWidget.prototype.autoChangedState = function (ev) {
            var _this = this;
            if (this.autoNavigated(ev)) {
                this.autoNavigatedSelect();
                return;
            }

            if (this.autoTimerId) {
                window.clearTimeout(this.autoTimerId);
            }

            this.autoTimerId = window.setTimeout(function () {
                _this.autoTimerId = 0;
                _this.autoExamineNewState();
            }, 250);
        };

        InputWidget.prototype.autoNavigated = function (ev) {
            var direction = this.autoNavIndex;

            switch (ev.keyCode) {
                case 13:
                    this.autoNavigatedClick();
                    return true;

                case 40:
                    direction = 1;
                    break;

                case 38:
                    direction = -1;
                    break;

                default:
                    return false;
            }

            this.autoNavIndex += direction;
            return true;
        };

        InputWidget.prototype.autoNavigatedSelect = function () {
            var items;
            items = this.rootElement.next().find('li');

            if (this.autoNavIndex < 0) {
                this.autoNavIndex = 0;
            } else if (this.autoNavIndex >= items.length) {
                this.autoNavIndex = items.length - 1;
            }

            this.autoSelectNavigationItem($(items.get(this.autoNavIndex)));
        };

        InputWidget.prototype.autoSelectNavigationItem = function (item) {
            item.addClass('active');
            item.siblings('.active').removeClass('active');
            this.autoNavIndex = item.index();

            if (item.length) {
                var results = this.rootElement.next();

                if (item.parent().height() > results.height()) {
                    results.css('overflow-y', 'scroll');
                } else {
                    // Have to set this to something to cause a reflow,
                    // otherwise browsers would remove scrollbar but still reserve the space for it.
                    results.css('overflow-y', 'auto');
                }

                var scrollPosition = results.scrollTop();
                var diff = 0;

                if (item.position().top + item.outerHeight(true) > results.height()) {
                    diff = item.position().top + item.outerHeight(true) - results.height();
                } else if (item.position().top < 0) {
                    diff = item.position().top;
                }

                if (diff !== 0) {
                    results.scrollTop(scrollPosition + diff);
                }
            }
        };

        InputWidget.prototype.autoNavigatedClick = function () {
            var items;
            items = this.rootElement.next().find('li.active');

            if (items.length > 0) {
                items.find('a').trigger('click');
            }
        };

        InputWidget.prototype.autoClientArrived = function (ev) {
            var result = this.rootElement.next();
            if (result.find('li').length) {
                result.show();
            }
        };

        InputWidget.prototype.autoClientLeft = function (ev) {
            if (this.autoResultListExposed) {
                return;
            }

            var result = this.rootElement.next();
            result.hide();
        };

        InputWidget.prototype.autoResultClientArrived = function (ev) {
            this.autoResultListExposed = true;
        };

        InputWidget.prototype.autoResultClientLeft = function (ev) {
            this.autoResultListExposed = false;

            if (!this.rootElement.is(document.activeElement)) {
                this.autoClientLeft(ev);
            }
        };

        InputWidget.prototype.autoExamineNewState = function () {
            var _this = this;
            var text = this.get();
            var state = text.hashCode();
            var data;

            if (state === this.autoStateDigest) {
                // No change
                return;
            }

            data = {
                term: text,
                autoComplete: function (result) {
                    _this.autoComplete(result);
                }
            };

            this.notify(new util.Notification('autocomplete', this.rootElement, 'autoComplete', data));

            this.autoStateDigest = state;
        };

        InputWidget.prototype.notified = function (source, data) {
            if (data.action() === 'autoItemClicked') {
                // Select the item the client clicked on
                this.autoSelectNavigationItem(data.source().parents('li'));

                // Notify the listeners about the change
                this.notify(new util.Notification('change', this.rootElement, this.action(), data.data()));
            }
        };
        return InputWidget;
    })(widget.FormattableWidget);
    exports.InputWidget = InputWidget;
});
