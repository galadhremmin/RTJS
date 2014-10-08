var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "RTJS/UI/Controllers/Abstract/Controller", "RTJS/UI/Views/View"], function(require, exports, controllers, views) {
    var DefaultController = (function (_super) {
        __extends(DefaultController, _super);
        function DefaultController(rootElement, model) {
            _super.call(this, new views.View(rootElement), model);
        }
        return DefaultController;
    })(controllers.Controller);
    exports.DefaultController = DefaultController;
});
