define(["require", "exports"], function(require, exports) {
    var Collection = (function () {
        function Collection(values) {
            this.items = [];

            if (values) {
                for (var i = 0; i < values.length; i += 1) {
                    if (values[i] === undefined) {
                        continue;
                    }

                    this.items.push(values[i]);
                }
            }
        }
        Collection.prototype.add = function (item) {
            if (item === undefined) {
                return;
            }

            // note: null is considered a valid member of the collection array.
            this.items.push(item);
        };

        Collection.prototype.remove = function (index) {
            if (index < 0 || index >= this.items.length) {
                return undefined;
            }

            var item = this.items.splice(index, 1);
            return item[0];
        };

        Collection.prototype.get = function (index) {
            if (index < 0 || index >= this.items.length) {
                return undefined;
            }

            return this.items[index];
        };

        Collection.prototype.length = function () {
            return this.items.length;
        };

        Collection.prototype.each = function (callback) {
            if (Array.prototype.forEach) {
                // prefer the built-in forEach method
                this.items.forEach(callback);
            } else {
                for (var i = 0; i < this.items.length; i += 1) {
                    callback.call(this.items, this.items[i], i, this.items);
                }
            }
        };

        Collection.prototype.find = function (predicate) {
            var item;
            for (var i = 0; i < this.items.length; i += 1) {
                item = this.items[i];

                if (predicate.call(this.items, item)) {
                    return item;
                }
            }

            return undefined;
        };

        Collection.prototype.findAll = function (predicate) {
            var items = [];
            var item;

            for (var i = 0; i < this.items.length; i += 1) {
                item = this.items[i];

                if (predicate.call(this.items, item)) {
                    items.push(item);
                }
            }

            return items;
        };
        return Collection;
    })();
    exports.Collection = Collection;
});
