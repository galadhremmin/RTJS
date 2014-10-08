var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Abstract/Widget"], function(require, exports, widget) {
    var FoldoutWidget = (function (_super) {
        __extends(FoldoutWidget, _super);
        function FoldoutWidget(rootElement, parameters) {
            var _this = this;
            _super.call(this, rootElement, parameters);

            if (!rootElement.hasClass('information-foldout')) {
                rootElement.addClass('information-foldout');
            }
            if (!rootElement.hasClass('closed')) {
                rootElement.addClass('closed');
            }

            rootElement.find('.information-foldout-title').on('click', function (event) {
                return _this.clickEvent(event);
            });
        }
        FoldoutWidget.prototype.clickEvent = function (event) {
            event.preventDefault();
            this.rootElement.toggleClass('closed');
        };
        return FoldoutWidget;
    })(widget.ViewOnlyWidget);
    exports.FoldoutWidget = FoldoutWidget;
});
