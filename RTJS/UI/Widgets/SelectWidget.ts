/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
import util = require("RTJS/Util/Observable");
import assoc = require("RTJS/Util/KeyValuePair");
import checkbox = require("RTJS/Util/CheckboxItem");
  
export class SelectWidget extends widget.Widget {

  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters);

    if (!rootElement.is('select')) {
      throw 'The selectWidget must be used with <select>.';
    }

    // rootElement.customSelect(); TODO Implement custom select
    rootElement.on('change.widget', (event) => this.changeEvent(event));
  }

  public set(values: any): void {
    if (!$.isArray(values)) {
      values = [values];
    }

    // disable events
    this.rootElement.off('change.widget');

    // Handle util_keyValue classes, which might be used to append new options to the
    // existing select view. This is achieved by passing an array of util_keyValue
    // objects.
    var text, value, widget = <HTMLSelectElement>this.rootElement.get(0), i, j, indexes = [];
    for (i = 0; i < values.length; i += 1) {
      text = values[i];

      if (text instanceof assoc.KeyValuePair) {

        // Get the value and the textual content for the <option> element. 
        //
        // Note: this is an unfortunate naming clash! The util_keyValue class
        //       is generic and has been designed with the intent that it
        //       would suit variety of contexts. 
        // 
        // *          This is why the KEY is the VALUE and the 
        // *          VALUE is the TEXTUAL CONTENT
        // *          of the <option> element.
        //
        value = text.getKey();
        text = text.getValue();

        for (j = 0; j < widget.options.length; j += 1) {
          // Look for an existing <option> element. 
          if (widget.options[j].value == value) {
            // If it exists, make sure to that its textual content is correct
            // by applying it. For convenience, jQuery is used here.
            $(widget.options[j]).text(text);
            break;
          }
        }

        // If the j index counter equals the length of the array of option
        // elements, the list doesn't contain an element with the specified
        // ID. Add one.
        if (j === widget.options.length) {
          widget.options[widget.options.length] = new Option(text, value);
        }

        // All done. The CheckboxItem class is a specialization of the util_keyValue
        // class. It adds the ability to set whether the item (in this case the <option>)
        // should be selected or not. 
        //
        // Check if the value object is of this class, and if it is, if it is considered
        // selected (by checking its checked status).
        if (values[i] instanceof checkbox.CheckboxItem && values[i].getChecked()) {
          indexes.push(value);
        }
      } else {
        indexes.push(values[i]);
      }
    }

    // Now use jQuery to perform the actual selection
    this.rootElement.val(indexes);

    // enable events 
    this.rootElement.on('change.widget', (event) => this.changeEvent(event));
    if (indexes.length > 0) {
      this.rootElement.trigger('change');
    }
  }

  public get(): any {
    return this.rootElement.val();
  }

  public validate(): boolean {
    var value = this.get();
    return value !== undefined;
  }

  public removeAllItems(listOfExceptions: string[]) {
    if (!$.isArray(listOfExceptions)) {
      listOfExceptions = [];
    }

    this.rootElement.find('option').each(function () {
      if ($.inArray(this.value, listOfExceptions) == -1) {
        $(this).remove();
      }
    });

    this._lastBindingSourceDigest(0);
  }
    
  private changeEvent(event) {
    event.preventDefault();
    this.notify(new util.Notification('change', this.rootElement, this.action(), this.get()));
  }
}

