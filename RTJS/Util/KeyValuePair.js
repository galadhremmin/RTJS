define(["require", "exports"], function(require, exports) {
    var KeyValuePair = (function () {
        function KeyValuePair(key, value, container) {
            this.key = key;
            this.value = value;
            this.container = container;
        }
        KeyValuePair.prototype.getKey = function () {
            return this.key;
        };

        KeyValuePair.prototype.getValue = function () {
            return this.value;
        };

        KeyValuePair.prototype.getContainer = function () {
            return this.container;
        };
        return KeyValuePair;
    })();
    exports.KeyValuePair = KeyValuePair;
});
