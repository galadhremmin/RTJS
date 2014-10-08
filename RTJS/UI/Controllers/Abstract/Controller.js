define(["require", "exports", "RTJS/UI/Views/View", "RTJS/Util/ActionManager"], function(require, exports, views, action) {
    var Controller = (function () {
        function Controller(view, model) {
            this.view = view;
            this.model = model;
            if (!(view instanceof views.View)) {
                throw 'Controller hasn\'t been properly overloaded. The constructor\'s first parameter should be of the type JQuery to be compatible with the RTJS initializer. This is the root element for the view.';
            }

            this.actionManager = new action.ActionManager(this);

            view.observe(this);
            model.observe(this);
        }
        Controller.prototype.load = function () {
            var _this = this;
            this.view.load(function () {
                _this.loaded();
            });
        };

        /**
        * This method is invoked when the view and its widgets have successfully been loaded and configured.
        */
        Controller.prototype.loaded = function () {
        };

        Controller.prototype.notified = function (source, params) {
            // Deallocate some data when the controller is no longer in use
            if (!this.view.inDOM()) {
                this.tearDown();
                return;
            }

            if (!this.actionManager.resolve(params)) {
                this.handleNotification(params);
            }
        };

        Controller.prototype.handleNotification = function (params) {
        };

        Controller.prototype.id = function () {
            return this.view.id();
        };

        Controller.prototype.validate = function () {
            return true;
        };

        Controller.prototype.tearDown = function () {
            this.view.unobserve(this);
            this.model.unobserve(this);

            this.view = undefined;
            this.model = undefined;
        };
        return Controller;
    })();
    exports.Controller = Controller;
});
