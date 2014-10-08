/// <reference path="Abstract/Widget.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var TemplateListWidget = (function (_super) {
        __extends(TemplateListWidget, _super);
        function TemplateListWidget() {
            _super.apply(this, arguments);
        }
        TemplateListWidget.prototype.set = function (value) {
            if (!value || !$.isArray(value)) {
                return;
            }

            var itemTemplate, html = '';

            this.rootElement.empty();

            for (var i = 0; i < value.length; i++) {
                if (!value[i].selector) {
                    continue;
                }
                itemTemplate = $(value[i].selector);

                if (value[i].data) {
                    html += itemTemplate.template(value[i].data);
                } else {
                    html += itemTemplate.template();
                }
            }

            this.rootElement.append(html);
        };
        return TemplateListWidget;
    })(widget.ViewOnlyWidget);
    exports.TemplateListWidget = TemplateListWidget;
});
