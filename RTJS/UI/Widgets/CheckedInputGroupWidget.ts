/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
import KeyValuePair = require("../../Util/KeyValuePair");
import util = require("../../Util/Observable");
  
export class CheckedInputGroupWidget extends widget.Widget {
  private type;

  constructor(rootElement: JQuery, properties: Object) {
    super(rootElement, properties);
    this.initControl();
  }

  public getType(): string {
    return this.type;
  }

  public disable(value: boolean): void {
    var elements: HTMLInputElement[] = this.getImmediateElements();

    for (var i = 0; i < elements.length; i += 1) {
      elements[i].disabled = value;
      $(elements[i]).trigger('disabledchange.inputgroup');
    }
  }

  public set(data: any): void {
    var elem = this.rootElement,
      dataArray = $.isArray(data) ? data : [data],
      selectedValues = [],
      i,
      j,
      value,
      input,
      inputs,
      html,
      name,
      newIndex = null,
      domChanged = false;

    // acquire all selected values
    for (i = 0; i < dataArray.length; i += 1) {
      value = dataArray[i];
      if (value === null) {
        throw 'ui_checkedInputGroupWidget: binding to null!';
      }

      if (!(value instanceof KeyValuePair)) {
        value = new KeyValuePair(undefined, String(value));
      }

      selectedValues.push(value);
    }

    // get all checkboxes and radio buttons
    inputs = this.getImmediateElements(function (element) {
      var t = String(element.type).toUpperCase();
      if (t === 'CHECKBOX' || t === 'RADIO') {
        this.unbindChangeEvent(element);
        element.checked = false;

        return true;
      }

      return false;
    });

    // 
    for (i = 0; i < selectedValues.length; i += 1) {

      value = selectedValues[i];
      // identify missing inputs
      for (j = 0; j < inputs.length; j += 1) {
        input = inputs[j];
        if (input.value === value.getValue()) {
          input.checked = true;
          break;
        }
      }

      if (j < inputs.length) {
        continue;
      }

      if (value.getKey() === undefined) {
        console.log('ui_checkedInputGroupWidget: binding value does not exist in collection.');
        continue;
      }

      if ($.inArray(value.getContainer(), ['checkbox', 'radio'])) {
        throw 'The item with the value "' + value.getValue() + '" has an invalid or unsupported type "' + value.getContainer() + '". Check the container field.';
      }

      // generate the html code for the new input item
      if (value.getContainer() === 'radio') {
        name = this.rootElement.attr('id') + '-radio';
      } else {
        name = this.rootElement.attr('id') + '-' + (newIndex || j);
      }

      html = '<label><input name="' + name + '" type="' + value.getContainer() + '" value="' + value.getValue() + '" />' + value.getKey() + '</label>';

      elem.append(html);

      // if checkboxitem is checked
      if (value.getChecked()) {
        $(elem).find('input').attr('checked', 'true');
      }

      domChanged = true;
      newIndex = j + 1;
    }

    if (domChanged) {
      // initialize the input items again
      this.initControl();
    } else {
      // select and deselect all items again
      var checkbox = true;

      if (this.type === 'RADIO') {
        this.select(inputs[0]); // <-- this will affect all inputs
        checkbox = false;
      }

      for (i = 0; i < inputs.length; i += 1) {
        this.bindChangeEvent(inputs[i]);

        if (checkbox) {
          this.select(inputs[i]);
        }
      }
    }

    this.dispatchNotification('bind');
  }

  public get(): any[] {
    var result = [];

    //push the values of all selected inputs into the results array.
    this.getImmediateElements((elem) => {
      if (elem.checked) {

        var value: any = elem.value;
        switch (value) {
          case 'true':
            value = true;
            break;
          case 'false':
            value = false;
            break;
        }

        result.push(value);
      }

      return false;
    });

    return result;
  }

  public validate(typeName?: string): boolean {
    var result = this.get();
    return result.length < 1 && this.type === 'RADIO' ? false : true;
  }

  public _lastBindingSourceDigest(value?: number): number {
    // Radio can only select one element at the time, so ensure that the digest is calculated on the 
    // selected value, and not an array with the selected value as an element within.
    if (value === 0 && this.type === 'RADIO') {
      var currentValue = this.get();
      if (currentValue.length) {
        value = JSON.stringify(currentValue[0]).hashCode();
      }
    } 

    return super._lastBindingSourceDigest(value);
  }

  private belongsToMe(node: Element): boolean {
    var myself = this.rootElement.get(0);
    node = <Element>node.parentNode;
    do {
      if (String(node.tagName).toUpperCase() === 'FIELDSET') {
        return node === myself;
      }
      node = <Element>node.parentNode;
    } while (node);

    return false;
  }

  private getImmediateElements(callbackFunction?: (elem: HTMLInputElement) => boolean, nodeName?: string): Array<HTMLInputElement> {
    if (nodeName === undefined) {
      nodeName = 'input';
    }

    var node,
      i,
      inputs = this.rootElement.get(0).getElementsByTagName(nodeName),
      r: Array<HTMLInputElement> = [];

    for (i = 0; i < inputs.length; i += 1) {
      node = inputs[i];
      if (this.belongsToMe(node)) {
        if (callbackFunction && !callbackFunction.call(this, node)) {
          continue;
        }

        r.push(node);
      }
    }

    return r;
  }

  private bindChangeEvent(selector: any): void {
    if (!selector || $(selector).length < 1) {
      throw 'CheckedInputGroupWidget.unbindChangeEvent: invalid selector ' + selector;
    }

    var me = this;
    $(selector).on('change.inputgroup', function(ev) {
      me.changeEvent(this, ev);
    });

    $(selector).on('disabledchange.inputgroup', function(ev) {
      me.disabledChangeEvent(<HTMLInputElement>this, ev);
    });
  }

  private unbindChangeEvent(selector: any): void  {
    if (!selector || $(selector).length < 1) {
      throw 'CheckedInputGroupWidget.unbindChangeEvent: invalid selector ' + selector;
    }

    $(selector).off('change.inputgroup');
    $(selector).off('disabledchange.inputgroup');
  }

  private changeEvent(element: Element, ev: Event): void {
    this.select(<HTMLInputElement>element);

    // Remove the last binding source as the user has interacted with the component and thus (possibly) invalidated its state. 
    // This enables the restoration of the state by binding the same data, again.
    this._lastBindingSourceDigest(0);

    this.dispatchNotification('change', ev);
  }

  private disabledChangeEvent(element: HTMLInputElement, ev: Event): void {
    var disabled = element.disabled,
      $this = $(element),
      parent = $(element).parent('label');

    if (disabled) {
      $this.data('prev-state', element.checked ? 1 : 0);
      $this.prop('checked', false);
      parent.addClass('disabled');
    } else {
      parent.removeClass('disabled');
      $this.prop('checked', $this.data('prev-state') == 1);
    }
  }

  private dispatchNotification(eventName: string, event?: Event): void {
    var action = this.action() || null;
    this.notify(new util.Notification(eventName, event ? event.target : this, action, this.get()));
  }

  private select(element: HTMLInputElement): void {
    // Just for clairty - this method must be applied with this as the checkbox being manipulated
    var checkboxes: Array<HTMLInputElement>, parent: Element, $parent: JQuery, i;

    if (this.type === 'RADIO') {
      // radio boxes require special treatment as their select state is relative, rather than individual. Thus
      // changing the state of one of the elements requires all elements to be re-evaluated. This is achieved by 
      // acquiring their <fieldset> parent, and thereafter performing a selector of all available inputs.
      parent = element;
      do {
        parent = <Element>parent.parentNode;
      } while (parent && String(parent.tagName).toUpperCase() !== 'FIELDSET');

      checkboxes = <Array<HTMLInputElement>> <any> $(parent).find('label > input');
    } else {
      checkboxes = [element];
    }

    // Acquire the parent, whose CSS class state must be changed to reflect the new state of the checkbox
    for (i = 0; i < checkboxes.length; ++i) {
      $parent = $(checkboxes[i]).parent('label');

      if (!$parent) {
        continue;
      }

      if (checkboxes[i].checked) {
        $parent.addClass('checked');
      } else {
        $parent.removeClass('checked');
      }
    }
  }

  private initControl(): void {
    // Make sure that the source element is a <fieldset>
    if (String(this.rootElement.get(0).tagName).toUpperCase() !== 'FIELDSET') {
      throw 'ui_checkedInputGroupWidget: incorrect source element for ' + this.rootElement.attr('id') + '. Expecting fieldset.';
    }

    // Assign the input-group-list class to the parent <fieldset>. This CSS class will define its 
    // custom appearance
    this.rootElement.addClass('input-group-list');

    // Find all <label>'s and their _descendant_ <input>'s and assign their type to the label. This is
    // necessary for the CSS definitions to distinguish between a checkboxes and radio buttons
    this.getImmediateElements(function (elem) {
      var checkbox = $(elem).find('input');
      if (checkbox.length < 1) {
        console.error('WARNING! Label element (' + (elem.id || elem.name || elem.innerText) + ') without an input element.');
        return; // ignore the bastard
      }

      $(elem).addClass(checkbox.attr('type'));

      if (checkbox.is(':checked')) {
        $(elem).addClass('checked');
      }
      if (checkbox.is(':disabled')) {
        $(elem).addClass('disabled');
      }

      this.bindChangeEvent(checkbox);
      if (!this.type) {
        this.type = checkbox.attr('type').toUpperCase();
      }

      return true;
    }, 'label');
  }


}

