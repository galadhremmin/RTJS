define(["require", "exports"], function(require, exports) {
    var SessionStorage = (function () {
        function SessionStorage() {
            this.storage = window.sessionStorage;
            if (!(this.storage instanceof Storage)) {
                throw navigator.appName + ' ' + navigator.appVersion + ' doesn\'t seem to support sessionStorage.';
            }
        }
        SessionStorage.instance = function () {
            if (SessionStorage.inst === null) {
                SessionStorage.inst = new SessionStorage();
            }

            return SessionStorage.inst;
        };

        SessionStorage.prototype.set = function (key, value) {
            this.verifyKey(key);

            try  {
                this.storage.setItem('rtstore_' + key, JSON.stringify(value));
            } catch (e) {
                this.handleError(e);
            }
        };

        /**
        * Attempts to read the value for the given key from the session storage. If no such value exists, _null_ is returned.
        * Before storing the object, the object is converted to JSON. By setting the optional parameter _raw_ to true, the object's JSON representation is returned.
        */
        SessionStorage.prototype.get = function (key, raw) {
            this.verifyKey(key);

            try  {
                var value = this.storage.getItem('rtstore_' + key);
                if (!value && value !== 0) {
                    return null;
                }

                if (raw) {
                    return value;
                }

                return JSON.parse(value);
            } catch (e) {
                this.handleError(e);
            }

            return null;
        };

        /**
        * Checks whether the specified value matches the data stored for the specified key.
        */
        SessionStorage.prototype.matches = function (key, value) {
            var currentValue = this.get(key, true);
            if (!currentValue) {
                return true;
            }

            return currentValue.hashCode() == JSON.stringify(value).hashCode();
        };

        SessionStorage.prototype.remove = function (key) {
            this.verifyKey(key);

            try  {
                return this.storage.removeItem('rtstore_' + key);
            } catch (e) {
                this.handleError(e);
            }
        };

        SessionStorage.prototype.clear = function (filterFunc) {
            if (typeof filterFunc !== 'function') {
                filterFunc = null;
            }

            try  {
                for (var keyString in this.storage) {
                    if (!keyString) {
                        break;
                    }

                    if (keyString.substr(0, 8) !== 'rtstore_') {
                        continue;
                    }

                    if (filterFunc && !filterFunc(keyString.substr(8))) {
                        continue;
                    }

                    this.storage.removeItem(keyString);
                }
            } catch (e) {
                this.handleError(e);
            }
        };

        SessionStorage.prototype.handleError = function (e) {
            // Check for iOS privacy mode
            if (e.code == DOMException.QUOTA_EXCEEDED_ERR && this.storage.length === 0) {
                alert('Du kan inte använda den här sajten i privat surfläge.');
                window.location.href = '/';
            }
        };

        SessionStorage.prototype.verifyKey = function (key) {
            if (!key) {
                throw new Error('No default key provided, must specify a key');
            }
        };
        SessionStorage.inst = null;
        return SessionStorage;
    })();
    exports.SessionStorage = SessionStorage;
});
