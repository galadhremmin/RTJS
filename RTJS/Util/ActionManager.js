define(["require", "exports"], function(require, exports) {
    var ActionManager = (function () {
        function ActionManager(context) {
            this.context = context;
        }
        ActionManager.prototype.resolve = function (params) {
            if (!params || !params.action() || params.action().length < 1) {
                return false;
            }

            var internalName = this.getInternalActionName(params.action());

            if (internalName in this.context) {
                this.context[internalName].call(this.context, params.data(), params.source());
                return true;
            }

            return false;
        };

        ActionManager.prototype.getInternalActionName = function (actionName) {
            return actionName + 'Action';
        };
        return ActionManager;
    })();
    exports.ActionManager = ActionManager;
});
