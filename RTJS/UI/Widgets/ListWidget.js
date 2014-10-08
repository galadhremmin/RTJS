/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget", "RTJS/Util/Observable"], function(require, exports, widget, util) {
    var ListWidget = (function (_super) {
        __extends(ListWidget, _super);
        function ListWidget() {
            _super.apply(this, arguments);
        }
        ListWidget.prototype.set = function (array) {
            if (!$.isArray(array)) {
                return;
            }

            var links = this.params().links;
            var highlighting = this.params().highlighting;

            if (links) {
                this.setLinks(array, highlighting);
            } else {
                this.setItems(array);
            }
        };

        ListWidget.prototype.setLinks = function (links, highlightWords) {
            var items = [];
            var i;
            var link;
            var listItem;

            this.validateLinks(links);

            if (highlightWords) {
                this.validateHighlighting(links);
            }

            for (i = 0; i < links.length; i += 1) {
                link = links[i];
                listItem = this.getListItem(link, highlightWords);

                items.push(listItem);
            }

            this.rootElement.html(items.join(''));

            var me = this;
            this.rootElement.find('li a').on('click', function (ev) {
                me.linkClicked(ev, $(this));
            });
        };

        ListWidget.prototype.getListItem = function (link, highlightWords) {
            var linkTitle = link.title;

            if (highlightWords && link.highlight.length > 0) {
                var regeExp = new RegExp(link.highlight, 'gi');
                var titleArray = link.title.split(regeExp);

                if (titleArray.length !== 1) {
                    linkTitle = '';

                    for (var i = 0; i < titleArray.length; i += 1) {
                        // Because we want to highlight words case insensitive it is important to write out the word with the same casing as in the original title.
                        var highlightLength = link.highlight.length;
                        var specificHighlightedWord;
                        if (i !== titleArray.length - 1) {
                            // Default string index values for the first iteration
                            var start = titleArray[0].length;
                            var end = titleArray[0].length + highlightLength;

                            for (var j = 1; j <= i; j += 1) {
                                start += titleArray[j].length + highlightLength;
                                end = start + highlightLength;
                            }

                            specificHighlightedWord = link.title.substring(start, end);
                            linkTitle += titleArray[i] + '<strong>' + specificHighlightedWord + '</strong>';
                        }
                    }
                }

                // Add the last string from string array
                linkTitle += titleArray[titleArray.length - 1];
            }
            return '<li><a class="list-widget-item" href="' + link.url + '" > ' + linkTitle + ' </a></li>';
        };

        ListWidget.prototype.setItems = function (array) {
            var items = [];
            var i;

            for (i in array) {
                if (array.hasOwnProperty(i)) {
                    items.push('<li>' + array[i] + '</li>');
                }
            }

            this.rootElement.html(items.join(''));
        };

        ListWidget.prototype.params = function () {
            return this.parameters;
        };

        ListWidget.prototype.validateLinks = function (array) {
            for (var i = 0; i < array.length; i += 1) {
                if (!array[i].hasOwnProperty('url') || !array[i].hasOwnProperty('title')) {
                    throw 'ListWidget binding object must contain the properties "url" and "title"';
                }
            }
        };

        ListWidget.prototype.validateHighlighting = function (array) {
            for (var i = 0; i < array.length; i += 1) {
                if (!array[i].hasOwnProperty('highlight')) {
                    throw 'ListWidget binding object must contain the property "highlight"';
                }
            }
        };

        ListWidget.prototype.linkClicked = function (ev, source) {
            ev.preventDefault();
            this.notify(new util.Notification('click', source, this.action(), source.attr('href')));
        };
        return ListWidget;
    })(widget.ViewOnlyWidget);
    exports.ListWidget = ListWidget;
});
