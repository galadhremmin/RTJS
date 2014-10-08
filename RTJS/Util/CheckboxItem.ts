/// <reference path="KeyValuePair.ts"/>

import util = require("./KeyValuePair");
 
export class CheckboxItem extends util.KeyValuePair {
    
  constructor(key: string, value: any, typeName: string, private checked: boolean) {
    super(key, value, typeName);
  }

  public getChecked(): boolean {
    return this.checked;
  }

  public setChecked(value: boolean): void {
    this.checked = value;
  }

}
