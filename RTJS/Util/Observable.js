define(["require", "exports"], function(require, exports) {
    var Observable = (function () {
        function Observable() {
            this.observers = [];
        }
        Observable.prototype.observe = function (observer) {
            for (var i = 0; i < this.observers.length; i += 1) {
                if (this.observers[i] === observer) {
                    return;
                }
            }

            this.observers.push(observer);
        };

        Observable.prototype.unobserve = function (observer) {
            for (var i = 0; i < this.observers.length; i += 1) {
                if (this.observers[i] === observer) {
                    this.observers.splice(i, 1);
                    return true;
                }
            }

            return false;
        };

        /**
        * Notifies all observers with the specified message payload. This is a synchronous operation.
        */
        Observable.prototype.notify = function (payload) {
            for (var i = 0; i < this.observers.length; i += 1) {
                this.observers[i].notified.call(this.observers[i], this, payload);
            }
        };
        return Observable;
    })();
    exports.Observable = Observable;

    var Notification = (function () {
        function Notification(typeName, notificationSource, widgetAction, payload) {
            this.typeName = typeName;
            this.notificationSource = notificationSource;
            this.widgetAction = widgetAction;
            this.payload = payload;
        }
        Notification.prototype.type = function () {
            return this.typeName;
        };

        Notification.prototype.source = function () {
            return this.notificationSource;
        };

        Notification.prototype.action = function () {
            return this.widgetAction;
        };

        Notification.prototype.data = function () {
            return this.payload;
        };
        return Notification;
    })();
    exports.Notification = Notification;
});
