var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "RTJS/Util/Observable", "RTJS/Util/SessionStorage"], function(require, exports, observer, dataTools) {
    var SvcModel = (function (_super) {
        __extends(SvcModel, _super);
        function SvcModel(serviceName) {
            _super.call(this);
            this.serviceName = serviceName;
            this.requests = [];
            this.working = false;
        }
        SvcModel.prototype.enqueueAll = function (requests) {
            for (var i = 0; i < requests.length; i += 1) {
                this.enqueue(requests[i]);
            }
        };

        SvcModel.prototype.enqueue = function (request) {
            this.requests.push(request);

            this.tryWorkQueue();
        };

        SvcModel.prototype.dequeue = function () {
            if (this.requests.length) {
                var request = this.requests.splice(0, 1)[0];
                return request;
            }

            return null;
        };

        SvcModel.prototype.moveToNextWorkItem = function () {
            this.working = false;
            this.tryWorkQueue();
        };

        /**
        * Attempts to grab the next request item in the working queue.
        */
        SvcModel.prototype.tryWorkQueue = function () {
            var _this = this;
            if (this.working) {
                return;
            }

            this.working = true;
            var request = this.dequeue();
            if (!request) {
                this.working = false;
                return;
            }

            request.setInferredOrDefaultServiceName(this.serviceName);

            $.ajax({
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                processData: false,
                data: request.data ? JSON.stringify(request.data) : null,
                type: 'POST',
                url: '/Services/' + request.serviceName + '.svc/' + request.methodName,
                success: $.proxy(function (jsonData) {
                    // Run next item in the work queue. Do this asynchronously
                    window.setTimeout($.proxy(function () {
                        return _this.moveToNextWorkItem();
                    }, _this), 1);

                    // Invoke the callback
                    if (request.callback.success) {
                        var param = request.callback.success.call(_this, jsonData[request.methodName + 'Result']);

                        // A default notification parameter was passed along. Notify the listeners.
                        if (param) {
                            _this.notify(param);
                        }
                    }
                }, this),
                error: $.proxy(function (engine, statusText, errorObj) {
                    // Run next item in the work queue. Do this asynchronously
                    window.setTimeout($.proxy(function () {
                        return _this.moveToNextWorkItem();
                    }, _this), 1);

                    if (request.callback.fail) {
                        var param = request.callback.fail.call(_this, engine.status, statusText, errorObj);

                        if (param) {
                            _this.notify(param);
                        }
                    }
                }, this)
            });
        };

        SvcModel.prototype.updateValidity = function (key, validity, data) {
            var storage = dataTools.SessionStorage.instance();
            data = data || storage.get(key) || {};
            data.Valid = !!validity;
            storage.set(key, data);
        };

        SvcModel.prototype.checkHasChanged = function (key, newData) {
            var storage = dataTools.SessionStorage.instance();
            return !storage.matches(key, newData);
        };

        SvcModel.prototype.checkValidity = function (key, data) {
            var storage = dataTools.SessionStorage.instance();
            data = data || storage.get(key) || {};
            return !!(data.Valid);
        };
        return SvcModel;
    })(observer.Observable);
    exports.SvcModel = SvcModel;

    var SvcRequest = (function () {
        function SvcRequest(methodName, data, callback, serviceName) {
            this.methodName = methodName;
            this.data = data;
            this.callback = callback;
            this.serviceName = serviceName;
        }
        SvcRequest.prototype.setInferredOrDefaultServiceName = function (defaultServiceName) {
            this.serviceName = this.serviceName || defaultServiceName;

            if (this.serviceName.length > 4 && this.serviceName.substr(-4) === '.svc') {
                this.serviceName = this.serviceName.substr(0, this.serviceName.length - 4);
            }
        };
        return SvcRequest;
    })();
    exports.SvcRequest = SvcRequest;
});
