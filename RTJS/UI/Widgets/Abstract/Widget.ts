import util = require("../../../Util/Observable");
import SessionStorage = require("../../../Util/SessionStorage");
import format = require("../../../Util/Formatter")

/**
  * Represents a user interface component which supports binding and content generation.
  *
  * This component can be stateful if the necessary methods are implemented.
  */
export class Widget extends util.Observable {
    
  public validationError: string;

  constructor(public rootElement: JQuery, public parameters: Object) {
    super();

    // Disable enter-keys in all input fields
    if (rootElement.is('input[type="text"]')) {
      rootElement.on('keydown', event => {
        if (event.keyCode == 13  /* enter */ || event.keyCode == 108 /* numlock enter */) {
          event.preventDefault();
          return false;
        }

        return true;
      });
    }

    // Zero the data content digest when changes are registered by the element. This will case it to be recalculated
    // when next accessed.
    if (rootElement.is('input,textarea,select')) {
      rootElement.on('change.widget', (event, setTriggered) => {
        if (!setTriggered) {
          this._lastBindingSourceDigest(0);
        }
      });
    }
  }

  /**
    * Retrieves the widget's default action handler specified by the data-action attribute. Returns undefined if none exist.
    */
  public action(): string {
    return this.rootElement.data('action') || undefined; // just to guard against null and 0.
  }

  public key(): string {
    return this.rootElement.data('bind');
  }

  public _stateKey(): string {
    var elem = this.rootElement.get(0),
      id = String(elem.id || ''),
      path = window.location.pathname;

    if (id.length < 1) {
      return undefined;
    }

    return 'WS_' + path.replace(/[\/\s]/g, '.') + '_' + id;
  }

  public retainsState(): boolean {
    return false;
  }

  public _serializeState(data: any): any {
    return data;
  }

  public _deserializeState(data: any): any {
    return data;
  }

  public _saveState(): void {
    var key = this._stateKey();
    if (key === undefined) {
      throw 'Failed to save state for the widget ' + this.toString();
    }

    var value = this.get();
    if (!value) {
      return;
    }

    value = this._serializeState(value);
    if (!value) {
      return;
    }


    SessionStorage.instance().set(key, value);
  }

  public _loadState(): void {
    var key = this._stateKey();
    if (key === undefined) {
      return;
    }

    var data = SessionStorage.instance().get(key);
    if (data) {
      this.set(this._deserializeState(data));
    }

    $(window).on('beforeunload', () => { this._saveState(); });
  }

  public _lastBindingSourceDigest(value?: number): number {
    if (value !== undefined) {
      if (value === 0) {
        value = JSON.stringify(this.get()).hashCode();
      }

      this.rootElement.data('ds', value);
    }

    return this.rootElement.data('ds');
  }

  public _bindingSource(): string {
    return this.rootElement.data('bind');
  }

  public restore(): void {
    if (this.retainsState()) {
      this._loadState();
    }
  }

  /**
    * Assigns the specified data to the widget. The dataHashCode parameter is optional, but might be used when you already have calculated the digest hash.
    */
  public bind(data: any, dataDigest?: number): void {
    var status: VisibilityStatus = this.visibleForData(data, true);

    // Save the digest to ensure that the same data isn't bound multiple times. This is performed
    // before the data is bound, as some widgets might trigger a event upon binding.
    if (status.changed() || status.visible) {
      this._lastBindingSourceDigest(dataDigest || 0);
    }

    // Apply the data. This method is specialized.
    if (status.visible) {
      this.set(data);
    }
  }

  public visibleForData(data: any, apply: boolean): VisibilityStatus {
    var visibleForData = this.rootElement.data('visibility');
    var duration: number;
    var status = new VisibilityStatus(this.rootElement.css('display') !== 'none', true);

    if (visibleForData === undefined) {
      return status;
    }

    // Multiple data sources might be specified, separated by , Split it by this character
    // and iterate through each item and examine the data.
    var expressions = $.trim(String(visibleForData)).split(','), i;
    for (i = 0; i < expressions.length; i += 1) {
      if (this.validateVisibilityExpression(expressions[i], data)) {
        break;
      }
    }

    // If none of the items match, the element is considered hidden.
    status.visible = i < expressions.length;

    // Actually apply visiblity based on this data as well.
    if (apply) {
      duration = this.rootElement.data('visibility-duration');
      if (duration) {
        if (status.visible) {
          this.rootElement.slideDown(duration);
        } else {
          this.rootElement.slideUp(duration);
        }
      } else {
        this.rootElement[status.visible ? 'show' : 'hide'](duration);
      }
    }
    
    return status;
  }

  private validateVisibilityExpression(expression: string, data: any): boolean {
    var visible: boolean;

    switch (expression[0]) {
      case '{':
        // The expression is in fact a JavaScript expression, expecting _data_ as an input variable.
        // Expected format: { condition using _data_ } like: { data.length > 0 }
        try {
          var visibilityFunction = new Function('return (' + expression.replace(/^\{|\}$/g, '') + ');');
          visible = visibilityFunction.call(data);
        } catch (ex) {
          visible = false;
        }

        break;
      case '!':
        // The expression parameter contains the data it doesn't expect
        visible = ($.trim(expression.substr(1)) != String(data));

        break;
      default:
        // The expression parameter contains the expected data
        visible = (expression == String(data));

        break;
    }

    return visible;
  }

  public validate(typeName?: string): boolean {
    var rules = [{ selector: this.rootElement, type: typeName }],
      result = ValidationManager.validate(rules, null, true),
      associatedLabel, elementName;

    if (result) {
      this.validationError = null;
    } else {
      // Fetch the associated label for this element
      associatedLabel = $('label[for="' + this.rootElement.attr('id') + '"]');

      // Order of acquiring: 1) label text, 2) element ID, 3) element name 
      elementName = associatedLabel.length ? associatedLabel.text() : (this.rootElement.attr('id') || this.rootElement.attr('name'));

      if (elementName === undefined) {
        throw 'There is no label associated with this element: ' + this.rootElement.attr('id');
      }

      this.validationError = 'Dummy description!'; // TODO: ptk.lang.common.validation[typeName].format(elementName);
    }

    return result;
  }

  public visible(): boolean {
    return !this.rootElement.is(':hidden');
  }

  public executeOnElement(elementFunction: (widget: Widget) => void): void {
    if (elementFunction) {
      elementFunction.call(this.rootElement, this);
    }
  }

  public inDOM(): boolean {
    return !!this.rootElement.get(0).parentElement;
  }

  /** 
    * Retrieves the id attribute from the widget's root element. Returns null if the attribute doesn't exist.
    */
  public id(): string {
    var id = this.rootElement.attr('id');
    return id || null;
  }

  /**
    * Binds the specified value to the widget's root element.
    */
  public set(value: any): void {
    if (this.writeOnly()) {
      this.rootElement.text(value);
    } else {
      this.rootElement.val(value);
      this.rootElement.trigger('change', [ /* setTriggered: */ true ]);
    }
  }

  /**
    * Retrieves the value contained by the widget. Returns undefined if the widget 
    * doesn't support this method.
    */
  public get(): any {
    if (this.writeOnly()) {
      return undefined;
    }

    return this.rootElement.val();
  }

  public writeOnly(): boolean {
    return false;
  }
  
  /**
    * Recalculates and repaints the widget.
    */
  public reflow(): void {
    // noop -- overload
  }
}

/**
  * Represents an user interface component which supports binding, but doesn't change its content; get() always returns null, and the component is ignored by View.read.
  *
  * This component doesn't retain state.
  */
export class ViewOnlyWidget extends Widget {

  public get(): any {
    return undefined;
  }
    
  public writeOnly(): boolean {
    return true;
  }

  public validate(typeName?: string) {
    return true;
  }

  public retainsState() {
    return false;
  }

}

/**
  * Represents an user interface component which supports binding, which is formatted according to the formatter specified by the data-value-format attribute on the root element.
  *
  * This component can be stateful if the necessary methods are implemented.
  */
export class FormattableWidget extends Widget {
    
  public formatter;
  private supportsInput;

  constructor(rootElement: JQuery, parameters: Object, formatterName?: string) {
    super(rootElement, parameters);

    var existingFormatter = this.rootElement.data('value-format');
    if (existingFormatter) {
      formatterName = existingFormatter;
    }

    if (formatterName !== undefined) {
      this.rootElement.data('value-format', formatterName);
    }

    this.formatter = this.rootElement.data('value-format') || null;
    this.supportsInput = this.rootElement.is('input,textarea');

    if (this.supportsInput && this.formatter) {
      format.instance().install(this.rootElement, this.formatter);
    }
  }

  public set(value: any): void {
    if (this.formatter) {
      value = format.instance().format(this.formatter, value);
    }

    super.set(value);
  }

  /**
    * Retrieves the widget's current value. Returns undefiend if the widget is read-only ("ViewOnly").
    */
  public get(): any {
    if (this.writeOnly()) {
      return undefined; // ref. StaticWidget
    }

    var value = this.rootElement.val();
    if (this.formatter) {
      value = format.instance().unformat(this.formatter, value);
    }

    return value;
  }

  public writeOnly(): boolean {
    return !this.supportsInput;
  }
}

/**
  * Represents a charting widget which supports one-directonal binding.
  */
export class ChartWidget extends ViewOnlyWidget {

  private chart: any;

  public create(): void {
    this.chart = null; // TODO: implement HighCharts (.charts.chart('#' + this.id(), this.settings());)
  }

  public render(): void {
    if (this.chart && this.chart.needsRender()) {
      this.chart.render();
    }
  }

  public settings(): IChartSettings {
    return {};
  }
    
  public set(value: any, changedConfig?: HighchartsOptions): void {
    if (this.chart) {
      if (changedConfig) {
        this.chart.updateConfig(changedConfig);
      }

      this.chart.setData(value);
    }
  }

}

export interface IChartSettings {
  data?: any;
  settings?: IChartSettingsList;
}

export interface IChartSettingsList {
  categories?: any[];
  margin?: number[];
  tooltipPositioner?: any;
  tooltipFormatter?: () => string;
  yLabelFormatter?: () => number;
  animationDuration?: number;
  yTickInterval?: number;
  xMin?: number;
  xMax?: number;
  columnWidth?: number;
  connectLineOverNulls?: boolean;
  horizontalTitle?: string;
  verticalTitle?: string;
  pointPadding?: number;
}

export class VisibilityStatus {
  /**
   * Gets whether the widget is visible before the binding has happened.
   */
  public currentlyVisible: boolean;

  /**
   * Gets whether the widget is visible after the binding has happened.
   */
  public visible: boolean;

  constructor(currentlyVisible: boolean, visible: boolean) {
    this.currentlyVisible = currentlyVisible;
    this.visible = visible;
  }

  /**
   * Determines whether the widget's visibility was modified.
   */
  public changed(): boolean {
    return this.currentlyVisible !== this.visible;
  }
}

class ValidationManager {
  
  public static validate(data: IValidationData[], feedbackLabelSelector: JQuery, ignoreIfHidden: boolean):  boolean {
    /// <summary>Validates the specified data fields and provides error messages upon failure. The validation process is halted upon first failure.</summary>
    /// <param name="data" type="Array">An array of configuration objects (other is optional): { selector: '#element', type: 'integer|boolean|date|year|regexp', name: 'Element name', other: /^IfRegularExp$/ }</param>
    /// <returns>True if the form is valid</returns>
    var i,
      item,
      elem,
      feedbackLabel = $(feedbackLabelSelector);

    if (data && data.length) {
      for (i = 0; i < data.length; i += 1) {
        item = data[i];
        elem = $(item.selector);

        if (!ignoreIfHidden || elem.is(':visible')) {
          if (elem.length < 1 || !ValidationManager.validate(elem, item.type, item.other)) {

            if (feedbackLabel && item.name) {
              feedbackLabel.text('Dummy text'); // TODO: ptk.lang.common.validation[item.type].format(item.name));
              feedbackLabel.show();
            }

            return false;
          }
        }
      }
    }

    feedbackLabel.hide();
    feedbackLabel.text('');

    return true;
  }

  private static validateElement(elem: JQuery, type: string, custom: RegExp): boolean {
    if (type === undefined) {
      return true;
    }

    var value: string, reg: RegExp;

    switch (type) {
      case 'integer':
        // matches integers 0 - 9, regardless of order (hence '0000999' passes validation)
        reg = /^[0-9]+$/;
        break;
      case 'float':
        // matches floating points with , as the delimiter: 1234, 12,34 and 0,123.
        reg = /^([0-9]+(\.[0-9]*)?|0\.[0-9]+)$/;
        break;
      case 'boolean':
        // matches 0, 1, yes & no
        reg = /^([01]|yes|no)$/;
        break;
      case 'date':
        // matches YYYY-MM-DD and YYYYMMMDD with the following constraints:
        // - millennia must begin with 1 or 2
        // - month must begin with 0 or 1 
        // - day must begin with 1 through 3
        // There is no validation of the date itself
        reg = /^([12]{1}[0-9]{3}\-[01]{1}[0-9]{1}\-[0-3]{1}[0-9]{1}|[12]{1}[0-9]{3}[01]{1}[0-9]{1}[0-3]{1}[0-9]{1})$/;
        break;
      case 'year':
        // matches YYYY, where the millenia must begin with 1 or 2
        reg = /^[12]{1}[0-9]{3}$/;
        break;
      case 'regexp':
        reg = custom;
        break;
      default:
        throw 'Unrecognised validation type: "' + type + '"';
    }

    value = ValidationManager.getValue(elem);
    return reg.test(value);
  }

  private static getValue(elem: JQuery): string {
    // siming's special drop-down menu requires special treatment!
    if (elem.hasClass("radio-group")) {
      return elem.find('input:checked').val();
    }

    return elem.val();
  }

}

interface IValidationData {
  selector: JQuery;
  type: string;
}