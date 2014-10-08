define(["require", "exports"], function(require, exports) {
    var Bootstrapper = (function () {
        function Bootstrapper(controllers, repository) {
            this.controllers = controllers;
            this.repository = repository;
        }
        Bootstrapper.prototype.bootstrap = function () {
            this.controllers.each(function (controller) {
                controller.load();
            });
        };

        Bootstrapper.prototype.findController = function (name, id) {
            var className = rtjs.Initializer.getClassName(name + 'Controller', false);
            var controllers = this.controllers.get(className);

            if (!controllers) {
                return undefined;
            }

            if (!$.isArray(controllers)) {
                return [controllers];
            }

            return controllers;
        };
        return Bootstrapper;
    })();
    exports.Bootstrapper = Bootstrapper;
});
