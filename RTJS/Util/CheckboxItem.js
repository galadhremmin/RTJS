/// <reference path="KeyValuePair.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./KeyValuePair"], function(require, exports, util) {
    var CheckboxItem = (function (_super) {
        __extends(CheckboxItem, _super);
        function CheckboxItem(key, value, typeName, checked) {
            _super.call(this, key, value, typeName);
            this.checked = checked;
        }
        CheckboxItem.prototype.getChecked = function () {
            return this.checked;
        };

        CheckboxItem.prototype.setChecked = function (value) {
            this.checked = value;
        };
        return CheckboxItem;
    })(util.KeyValuePair);
    exports.CheckboxItem = CheckboxItem;
});
