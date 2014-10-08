/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "RTJS/UI/Views/View", "./Abstract/Widget"], function(require, exports, view, widget) {
    /**
    * The table widget is designed to work in conjunction with the HTML <table> element. It supports
    * data binding, row folding and initilization of sub-widgets. Their notifications are automatically
    * relayed to the table widget's parent view.
    *
    * Only vertical <table> designs are supported.
    *
    * Data attributes
    * ---------------
    * All attributes prefixed with row are expected to be put on the <tr> element representing the header row.
    * Attributes with the column prefix are put on individual header cells (<th>).
    *
    * row-folding-widget:    widget responsible for the folding action. Usually tableAccordion. This widget is
    *                        automatically binding to table's data source.
    * column-tag:            The HTML element upon which the cell's widget will be attached to. Usually span or div.
    * column-widget:         Name of the widget to initialize on the tag specified by the column-tag attribute. Typically
    *                        label.
    * column-path:           Property path on the binding object. Dots aren't supported (leowic 2014-03-19)
    * column-widget-content: HTML content inside the widget tag.
    * column-widget-*:       optional widget parameters which will be transferred to the widget. Note: if you want to use
    *                        widget parameters (data-widget-[parameter]) the widget part must be repeated twice hence:
    *                        data-widget-widget-[parameter].
    * column-tag-*           optional html tag attributes, such as class etc.
    *
    *
    * Example initialization
    * ----------------------
    * <table data-widget="table" data-bind="DataSource" id="table-with-stuff">
    *   <thead>
    *     <tr data-row-folding-widget="tableAccordion">
    *       <th data-column-widget="label"
    *           data-column-path="Type"
    *           data-column-tag="span">Classification</th>
    *       <th data-column-widget="label"
    *           data-column-path="Description"
    *           data-column-tag="span">Description</th>
    *       <th data-column-widget="button"
    *           data-column-widget-action="deleteRow"
    *           data-column-widget-content="Delete"
    *           data-column-path="Description"
    *           data-column-tag="a">Delete</th>
    *    </tr>
    *   </thead>
    *   <tbody></tbody>
    * </table>
    */
    var TableWidget = (function (_super) {
        __extends(TableWidget, _super);
        function TableWidget(rootElement, properties) {
            var _this = this;
            _super.call(this, rootElement, properties);

            this.view = null;

            this.definitions = {
                columns: [],
                footers: [],
                foldUpWidget: null
            };

            this.callbacks = {
                onCellCreated: null,
                onFoldupRowCreated: null,
                onFooterCellCreated: null,
                onFooterCreated: null,
                onRowCreated: null,
                onRowDataBound: null
            };

            rootElement.find('thead tr').each(function (index, elem) {
                var widgetName = $(elem).data('row-folding-widget');
                if (widgetName !== undefined) {
                    _this.definitions.foldUpWidget = widgetName;
                }
            }).find('th').each(function (index, elem) {
                var def = _this.loadColumnDefinition($(elem));
                _this.definitions.columns.push(def);
            });

            rootElement.find('tfoot tr td').each(function (index, elem) {
                var def = _this.loadColumnDefinition($(elem));
                _this.definitions.footers.push(def);
            });
        }
        TableWidget.prototype.on = function (shortName, callback) {
            // change cellChanged => onCellChanged and look for it within the callback container object.
            var longName = 'on' + shortName.substr(0, 1).toUpperCase() + shortName.substr(1);

            if (!this.callbacks.hasOwnProperty(longName)) {
                throw longName + ' is not valid callback.';
            }

            this.callbacks[longName] = callback;
        };

        TableWidget.prototype.notified = function (widget, params) {
            this.notify(params);
        };

        TableWidget.prototype.set = function (valueArray) {
            if (!$.isArray(valueArray)) {
                throw 'ui_tableWidget.set expects an array of data binding elements.';
            }

            var root = this.rootElement.find('tbody'), htmlRow, data = {}, addedRows = $(), rowIndex;

            for (rowIndex = 0; rowIndex < valueArray.length; rowIndex += 1) {
                htmlRow = this.createTableRow(rowIndex, valueArray[rowIndex], data);
                if (!htmlRow) {
                    continue;
                }

                this.insertElement(root, htmlRow, 'data-bound-row.row-index-' + rowIndex);

                // Adds the row to the collection of added rows. This collection will be used to clear removed
                // rows from the table
                addedRows = addedRows.add(htmlRow);

                // There's a widget for the fold-up functionality?
                if (this.definitions.foldUpWidget !== undefined && this.definitions.foldUpWidget !== null) {
                    htmlRow = this.createTableFoldupRow(rowIndex, valueArray[rowIndex], data);
                    this.insertElement(root, htmlRow, 'data-bound-foldup-row.row-index-' + rowIndex);
                    addedRows = addedRows.add(htmlRow);
                }
            }

            // Clear all items not in the binding collection
            root.find('tr').not(addedRows).remove();

            this.initView(root, data);
            this.initEventHandlers();

            // Set contents of the footer, if present.
            this.setFooter(valueArray);
        };

        TableWidget.prototype.loadColumnDefinition = function (tableElement) {
            var definition = {}, custom = {}, customAttr = {}, data = tableElement.data(), value, hyphenize = function (letter) {
                return '-' + letter.toLowerCase();
            };

            for (var key in data) {
                if (key.substr(0, 6) !== 'column') {
                    continue;
                }

                value = data[key];

                // Reshape columnCamelCaseFormat to column-camel-case-format by inserting dashes between every capital letter
                //         ^    ^                   ^      ^
                //         0    6    ==========>    0      7
                //
                // The initial hyphen it tossed away by starting from position 7.
                key = key.replace(/([A-Z]{1})/g, hyphenize).substr(7);

                if (!key.indexOf('widget-')) {
                    key = 'data-' + key.substr(7);
                    custom[key] = value;
                } else if (!key.indexOf('tag-')) {
                    key = key.substr(4);
                    customAttr[key] = value;
                } else {
                    definition[key] = value;
                }
            }

            return { definitions: definition, customDefinitions: custom, customAttributes: customAttr };
        };

        TableWidget.prototype.createTableRow = function (rowIndex, sourceData, bindingData) {
            var htmlRow = $('<tr class="data-bound-row row-index-' + rowIndex + '"></tr>');

            if (this.definitions.foldUpWidget) {
                htmlRow.addClass('subject-row');
            }

            for (var i = 0; i < this.definitions.columns.length; i += 1) {
                var cellHtml = this.createTableCell(i, rowIndex, sourceData, bindingData);
                htmlRow.append(cellHtml.get(0)); // .get(0) is necessary to support IE8.
            }

            if (this.callbacks.onRowCreated) {
                htmlRow = this.callbacks.onRowCreated.call(this, htmlRow, rowIndex, sourceData, bindingData);

                if (!htmlRow) {
                    // It's fine to skip entire rows, should the onRowCreated be filtering through the results.
                    return null;
                }
            }

            return htmlRow;
        };

        TableWidget.prototype.createTableCell = function (cellIndex, rowIndex, value, data) {
            var column = this.definitions.columns[cellIndex].definitions, widgetAttributes = this.definitions.columns[cellIndex].customDefinitions, tagAttributes = this.definitions.columns[cellIndex].customAttributes, path = column.path, content = '', cellHtml = '<td>', cellJQuery, key;

            if (path === '.') {
                path = '_parent';
            } else if (value.hasOwnProperty(path)) {
                value = value[path];
            }

            if (column.tag) {
                // Build a data widget syntax given the widget binding path
                cellHtml += '<{0} data-widget="{1}"';

                if (path !== undefined) {
                    cellHtml += ' data-bind="' + (path + rowIndex) + '"';
                }

                // Content? This is a special widget parameter
                if (widgetAttributes.hasOwnProperty('data-content')) {
                    content = widgetAttributes['data-content'];
                }

                for (key in widgetAttributes) {
                    if (key != 'data-content') {
                        cellHtml += ' ' + key + '="' + widgetAttributes[key].replace(/"/g, '&quot;') + '"';
                    }
                }

                for (key in tagAttributes) {
                    cellHtml += ' ' + key + '="' + tagAttributes[key] + '"';
                }

                cellHtml += '>' + content + '</{0}>';

                // add the arrow for fold-up widgets
                if (this.definitions.foldUpWidget && cellIndex == this.definitions.columns.length - 1) {
                    cellHtml += '<div class="arrow"></div>';
                }
            }

            cellHtml += '</td>';

            // Insert all values
            cellJQuery = $(cellHtml.format(column.tag, column.widget));

            data[path + rowIndex] = value;

            // execute a formatting function, if there is one
            if (this.callbacks.onCellCreated) {
                cellJQuery = this.callbacks.onCellCreated.call(this, cellJQuery, cellIndex, value, rowIndex, data);

                if (!cellJQuery) {
                    throw 'ui_tableWidget: onCellCreated destroyed the cell. Make sure to return this.';
                }
            }

            return cellJQuery;
        };

        TableWidget.prototype.createTableFoldupRow = function (rowIndex, value, data) {
            var htmlRow = $('<tr class="data-bound-foldup-row row-index-' + rowIndex + ' information-row">' + '<td colspan="' + this.definitions.columns.length + '" data-bind="_parent' + rowIndex + '" data-widget="' + this.definitions.foldUpWidget + '"></td>' + '</tr>');

            // Add a reference to the data collection if it hasn't already been referenced.
            if (!data.hasOwnProperty('_parent' + rowIndex)) {
                data['_parent' + rowIndex] = value;
            }

            if (this.callbacks.onFoldupRowCreated) {
                htmlRow = this.callbacks.onFoldupRowCreated.call(this, htmlRow, rowIndex, value);
                if (!htmlRow) {
                    // It's fine to skip entire rows, should the onRowCreated be filtering through the results.
                    return null;
                }
            }

            return htmlRow;
        };

        TableWidget.prototype.setFooter = function (valueArray) {
            // Create footer
            var footerRoot = this.rootElement.find('tfoot');
            if (!footerRoot || footerRoot.length == 0) {
                return;
            }

            var footerRow = footerRoot.find('tr');
            if (footerRow.length > 1) {
                return;
            }

            this.setFooterRow(footerRow, valueArray);

            if (this.callbacks.onFooterCreated) {
                footerRoot = this.callbacks.onFooterCreated.call(this, footerRoot, valueArray);
                if (!footerRoot) {
                    return;
                }
            }

            this.initView(footerRoot, { _all: valueArray });
        };

        TableWidget.prototype.setFooterRow = function (rowElement, valueArray) {
            var _this = this;
            var footerCells = rowElement.find('td'), cellIndex = 0;
            if (!footerCells || footerCells.length == 0) {
                return null;
            }

            footerCells.each(function (index, elem) {
                var definition = _this.loadColumnDefinition($(elem)), cellContentHtml = _this.setFooterCell(definition, valueArray, cellIndex);

                // Clear the cell and append our new contents.
                $(elem).empty().append(cellContentHtml);

                cellIndex++;
            });

            return rowElement;
        };

        TableWidget.prototype.setFooterCell = function (definition, valueArray, cellIndex, data) {
            var column = definition.definitions, widgetAttributes = definition.customDefinitions, tagAttributes = definition.customAttributes, content = '', cellHtml = '', cellJQuery, key;

            // Disallow actual paths right now.
            if (column.path) {
                throw 'Footer column specified a path. This is not allowed.';
            }

            // Build a data widget syntax given the widget binding path
            cellHtml += '<{0} data-widget="{1}" data-bind="{2}"';

            // Content? This is a special widget parameter
            if (widgetAttributes.hasOwnProperty('data-content')) {
                content = widgetAttributes['data-content'];
            }

            for (key in widgetAttributes) {
                if (key != 'data-content') {
                    cellHtml += ' ' + key + '="' + widgetAttributes[key].replace(/"/g, '&quot;') + '"';
                }
            }

            for (key in tagAttributes) {
                cellHtml += ' ' + key + '="' + tagAttributes[key] + '"';
            }

            cellHtml += '>' + content + '</{0}>';

            // Insert all values
            cellJQuery = $(cellHtml.format(column.tag, column.widget, '_all'));

            // execute a formatting function, if there is one
            if (this.callbacks.onFooterCellCreated) {
                cellJQuery = this.callbacks.onFooterCellCreated.call(this, cellJQuery, cellIndex, valueArray, data);

                if (!cellJQuery) {
                    throw 'ui_tableWidget: onFooterCellCreated destroyed the cell. Make sure to return this.';
                }
            }

            return cellJQuery;
        };

        TableWidget.prototype.insertElement = function (destination, item, className) {
            // Instead of clearing the table upon binding, existing elements are replaced with new data.
            var prevRow = destination.find('tr.' + className);

            if (prevRow && prevRow.length) {
                prevRow.replaceWith(item);
            } else {
                destination.append(item);
            }
        };

        TableWidget.prototype.initView = function (root, data) {
            var _this = this;
            // A beautiful hack! Create an instance of the view controller to initiate the widgets.
            if (this.view) {
                this.view.unobserve(this);
                this.view = undefined;
            }

            this.view = new view.View(root);
            this.view.load();
            this.view.observe(this);

            this.view.bind(data);

            if (this.callbacks.onRowDataBound) {
                $(root).find('tr').each(function (rowIndex, rowElement) {
                    _this.callbacks.onRowDataBound.call(_this, $(rowElement), rowIndex, data);
                });
            }
        };

        TableWidget.prototype.initEventHandlers = function () {
            if (this.definitions.foldUpWidget) {
                // Implement folding
                this.rootElement.find('.subject-row').on('click', function () {
                    $(this).toggleClass('open'); // toggle th open class on the main <tr> element
                    $(this).next('.information-row').toggle(); // toggle the fold-up element which should be the immediate neighbour of the <tr>.
                });
            }
        };
        return TableWidget;
    })(widget.ViewOnlyWidget);
    exports.TableWidget = TableWidget;
});
