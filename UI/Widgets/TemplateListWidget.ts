/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
  
export class TemplateListWidget extends widget.ViewOnlyWidget {
    
  public set(value: any): void {
    if (!value || !$.isArray(value)) {
      return;
    }

    var itemTemplate,
      html = '';

    this.rootElement.empty();

    for (var i = 0; i < value.length; i++) {
      if (!value[i].selector) {
        continue;
      }
      itemTemplate = $(value[i].selector);

      if (value[i].data) {
        html += itemTemplate.template(value[i].data);
      } else {
        html += itemTemplate.template();
      }
    }

    this.rootElement.append(html);
  }

}

