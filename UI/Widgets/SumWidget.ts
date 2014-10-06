import widget = require("./Abstract/Widget");

/**
  * Intended for table footers. Will bind to an array of data, iterate through all array items, find the value of 'data-path' for each object, and summarize these for the whole array.
  * Please note that as this expects an array and does not know the sum value until after binding, 'data-visibility' might not work as expected.
  */
export class SumWidget extends widget.ViewOnlyWidget {
    
  public set(value) {
    var elem = this.rootElement,
      path = elem.data('path'),
      sum = 0,
      i,
      splitPath = path.split("."),
      tmp,
      formatter,
      sumPrefix;

    if (!$.isArray(value)) {
      value = [value];
    }

    // Summarize value at {path} in every object contained in value.
    for (i = 0; i < value.length; i += 1) {
      tmp = this.findValue(value[i], splitPath);
      if (tmp == null || tmp == undefined || isNaN(tmp * 1)) {
        continue;
      }

      sum += tmp;
    }

    // To make data visibility work for sums, we need to call it here.
    this.visibleForData(sum, true);

    //Use these to specify if you want a certain prefix depending on whether the number is positive or negative.
    if (sum > 0) {
      sumPrefix = elem.data('positive-prefix');
    } else if (sum < 0) {
      sumPrefix = elem.data('negative-prefix');
    }

    // Can use formatters as well! wow such flexible!
    formatter = elem.data('value-format');
    if (formatter) {
      sum = ptk.formatter.format(formatter, sum);
    }

    if (sumPrefix) {
      sum = sumPrefix + sum;
    }

    super.set(sum);
  }

  private findValue(item: Object, path: string[]): any {
    var i,
      value = item;

    for (i = 0; i < path.length; i += 1) {
      if (path[i] == null || path[i] == undefined || path[i].length == 0) {
        continue;
      }

      value = value[path[i]];

      if (value == null || value == undefined) {
        return null;
      }
    }

    return value;
  }
} 