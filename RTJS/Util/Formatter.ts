interface IFormatter {
  unformat(s: string): any;
  format(s: any): string;
}

module rtjs.formatter {
  export class ThousandFormatter implements IFormatter {
    public unformat(s: string): any {
      var isNegative = false;
      var value = <any>s;

      if (!isNaN(value) && isFinite(value)) {
        value = Math.floor(parseFloat(s) + 0.5);
        if (value < 0) {
          isNegative = true;
        }
      } else if (String(s).length > 0) {
        isNegative = (String(s).substring(0, 1) == '-');
      }

      // Remove all non-numeric characters from the input string
      s = String(s).replace(/[^0-9]/g, '');

      value = (s.length < 1) ? 0 : s;
      return (value && isNegative) ? (-1) * value : value;
    }

    public format(s: any): string {
      s = this.unformat(s);
      return (!s || s.length < 1 || isNaN(s)) ? s : String(s).toCurrency(0, false);
    }
  }

  export class CurrencyFormatter extends ThousandFormatter {
    public format(s: any): string {
      s = super.format(s);
      return s + ' kr';
    }
  }

  export class DotCurrencyFormatter extends ThousandFormatter {
    public format(s: any): string {
      s = super.format(s);
      return s.replace(/\s/g, '.');
    }
  }

  export class QuirkyCurrencyFormatter extends DotCurrencyFormatter {
    public format(s: any): string {
      s = super.format(s);
      return s.replace(/\s/g, '.') + ' kr';
    }
  }

  export class PercentFormatter implements IFormatter {
    public unformat(s: string): any {
      var value = 0;
      s = String(s).replace(/[%\s]/g, '');

      if (s === '< 1') {
        value = 0;
      } else {
        s = String(s).replace(/[^0-9]/g, '');
        value = (s.length < 1) ? 0 : <any> s;
      }

      return value;
    }

    public format(s: any): string {
      var isTiny = false;
      if (!isNaN(s) && isFinite(s)) {
        var floatValue = parseFloat(s);
        if (floatValue < 1) {
          isTiny = true;
        }
        s = Math.floor(floatValue + 0.5);
      }

      s = String(s).replace(/[^0-9]/g, '');
      var value = (s.length < 1) ? 0 : s;
      if (isTiny) {
        value = '< 1';
      }

      return value + ' %';
    }
  }

  export class DateFormatter implements IFormatter {

    public unformat(s: string, jsonify?: boolean): any {
      // Deal with Microsoft JSON date retardness
      if (jsonify) {
        var parts = s.split('-'),
          date = Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12);
        return '/Date(' + date + ')/';
      }

      // Removes all non-numeric character from the input string
      return s.replace(/[^0-9]/g, '');
    }

    public format(s: any): string {
      var year, jsonData, date, particle, currentYear: any = new Date().getFullYear();

      // check for ASP.NET time
      jsonData = /^\/Date\((\d*)[\+Z]?\d*\)\/$/.exec(s);
      if (jsonData) {
        date = new Date(+jsonData[1]);
        s = [date.getFullYear()];

        particle = date.getMonth() + 1; // JS month is 0-based
        if (particle < 10)
          particle = '0' + particle;
        s.push(particle);

        particle = date.getDate();
        if (particle < 10)
          particle = '0' + particle;
        s.push(particle);

        return s.join('-');
      }

      // Removes all non-numeric characters
      var formatter = new DateFormatter();
      s = formatter.unformat(s + '');

      if (s.length === 8 && /[12][0-9]{3}[01][0-9][0-3][0-9]/.test(s)) { // Case YYYYMMDD
        s = s.substr(0, 4) + '-' + s.substr(4, 2) + '-' + s.substr(6, 2);

      } else if (s.length === 6 && /[0-9]{2}[01][0-9][0-3][0-9]/.test(s)) { // Case YYMMDD
        // Get the year participle from the input string
        year = s.substr(0, 2);

        // Get the current year's last two digits and compare.
        currentYear = (new Date().getFullYear() + "").substr(2, 4);
        currentYear = parseInt(currentYear);

        if (year <= currentYear) {
          year = '20' + year;
        } else {
          year = '19' + year;
        }

        s = year + '-' + s.substr(2, 2) + '-' + s.substr(4, 2);
      } else if (s.length === 4 && s > 1900 && s <= currentYear) { // Case YYYY
        s = s + '-01-01';
      }

      return s;
    }
  }

  export class YearFormatter implements IFormatter {

    public unformat(s: string): any {
      return s.replace(/[^0-9]/g, '');
    }

    public format(s: any): string {
      var currentYear;

      s = this.unformat(s + '');

      if (s.length > 4) {
        s = s.substr(0, 4);

      } else if (s.length === 1 || s.length === 2) { // Y and YY
        currentYear = (new Date().getFullYear() + "").substr(2, 4);
        currentYear = parseInt(currentYear);

        if (s.length < 2) {
          s = '0' + s;
        }

        if (s <= currentYear) {
          s = '20' + s;
        } else {
          s = '19' + s;
        }
      }

      return s;
    }
  }

  export class DecimalFormatter implements IFormatter {

    public unformat(s: string): any {
      var decimalPos, integerPart, decimalPart: any = 0;

      s += '';
      decimalPos = s.indexOf(',');
      if (decimalPos === -1) {
        integerPart = s;
      } else {
        integerPart = s.substr(0, decimalPos);
        decimalPart = s.substr(decimalPos + 1).replace(/[^0-9]/g, '');
      }

      var formatter = new ThousandFormatter();
      s = formatter.unformat(integerPart);

      if (!isNaN(decimalPart) && isFinite(decimalPart) && decimalPart > 0) {
        s += '.' + decimalPart;
      }

      return s;
    }

    public format(s: any): string {
      var decimalPos, integerPart, decimalPart: any = 0;
      s = (s + '').replace(/\./g, ',');

      decimalPos = s.indexOf(',');
      if (decimalPos === -1) {
        integerPart = s;
        decimalPart = '00';
      } else {
        integerPart = s.substr(0, decimalPos);
        decimalPart = s.substr(decimalPos + 1);

        switch (decimalPart.length) {
          case 0:
            decimalPart += '0';
          case 1:
            decimalPart += '0';
            break;
          default:
            decimalPart = decimalPart.substr(0, 2);
        }
      }

      var formatter = new ThousandFormatter();
      integerPart = formatter.unformat(integerPart);
      s = formatter.format(integerPart);

      if (!isNaN(decimalPart) && isFinite(decimalPart)) {
        s += ',' + decimalPart;
      }

      return s;
    }
  }
}

interface IFormattingHook {
  withoutFormatter(el: HTMLElement): string;
  withFormatter(el: HTMLElement, formatter: IFormatter): string;
}

class Formatter {

  private static inst: Formatter = null;
  private formatters: any;

  public static instance(): Formatter {
    if (Formatter.inst == null) {
      Formatter.inst = new Formatter();
    }

    return Formatter.inst;
  }

  constructor() {
    this.formatters = {};
    this.installFormatter();
  }

  public install(element: JQuery, formatterName: string): void {
    $(element).data('value-format', formatterName);
    this.enable(element);
  }

  private formatHook(el: JQuery, context: IFormattingHook): string {
    var formatter = this.getFormatterByElement(el);

    if (!formatter) {
      return context.withoutFormatter(el.get(0));
    }

    return context.withFormatter(el.get(0), formatter);
  }

  public format(formatName: string, value: any): string {
    var formatter = this.getFormatterByName(formatName);
    if (formatter == null)
      return value;

    var args = Array.prototype.slice.call(arguments, 1);
    return formatter.format.apply(formatter, args);
  }

  public unformat(formatName: string, value: string): any {
    var formatter = this.getFormatterByName(formatName);
    if (formatter == null)
      return value;

    var args = Array.prototype.slice.call(arguments, 1);
    return formatter.unformat.apply(formatter, args);
  }

  private installFormatter(): void {
    var origHook = $.valHooks.text || {
      get: (elem: HTMLInputElement): string => elem.value,
      set: (elem: HTMLInputElement, value: string): string => (elem.value = value)
    }; // preserve existing value hooks if such exist

    $.valHooks.text = {
      get: function (el) {
        return Formatter.instance().formatHook($(el), {
          // Behaviour with formatter 
          withFormatter: function (elem, formatter) {
            var value = origHook.get(elem);
            return formatter.unformat(value);
          },

          // Behaviour without formatter
          withoutFormatter: function (elem) {
            return origHook.get(elem);
          }
        });
      },
      set: function (el, val) {
        return Formatter.instance().formatHook($(el), {
          // Behaviour with formatter
          withFormatter: function (elem, formatter) {
            val = formatter.format(val);
            return origHook.set(elem, val);
          },

          // Behaviour without formatter
          withoutFormatter: function (elem) {
            return origHook.set(elem, val);
          }
        });
      }
    };
  }

  private enable(selector: JQuery): void {
    $(selector || '[data-value-format]').each((index: number, elem: HTMLElement) => {
      this.hook($(elem));
    });
  }

  private hook(elem: JQuery): void {
    var me = this;
    $(elem).on('focus', function () {
      var f = me.getFormatterByElement($(this));
      this.value = f.unformat(this.value);

      if ((this.tagName + '').toUpperCase() == 'INPUT') {

        // Automatically select 0 and empty input fields
        if (/^[0\s]+/.test(this.value)) {
          var box = this;
          window.setTimeout(function () { box.select(); }, 100);
        } else {
          me.setCaretPosition($(this), this.value.length, true);
        }

      }
    }).on('blur', function () {
        var f = me.getFormatterByElement($(this));
        this.value = f.format(this.value);
      });
  }

  private setCaretPosition(element: JQuery, pos: number, ieOnly: boolean): void {
    if (ieOnly && window.navigator.appName.toUpperCase().indexOf('EXPLORER') >= 0) {
      var ctrl = element.get(0);
      if (ctrl.hasOwnProperty('createTextRange')) {
        var range = ctrl['createTextRange'].apply(ctrl);
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
      }
    }
  }

  private getFormatterByElement(element: JQuery): IFormatter {
    return this.getFormatterByName(element.data('value-format'));
  }

  private getFormatterByName(formatterName: string): IFormatter {
    if (!formatterName) {
      return null;
    }

    formatterName = this.formatName(formatterName);

    if (this.formatters.hasOwnProperty(formatterName)) {
      return this.formatters[formatterName];
    }

    if (!rtjs.formatter.hasOwnProperty(formatterName)) {
      return null;
    }

    var formatter = new rtjs.formatter[formatterName]();
    this.formatters[formatterName] = formatter;

    return formatter;
  }

  private formatName(name: string): string {
    if (!name) {
      return null;
    }

    name = name.substr(0, 1).toUpperCase() + name.substr(1);

    if (name.length < 11 || name.substr(-10) !== 'Formatter') {
      name += 'Formatter';
    }

    return name;
  }
}

export = Formatter;