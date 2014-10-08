/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
import util = require("../../Util/Observable");  

export class TimerWidget extends widget.Widget {
    
  private interval;
  private initialized;

  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters);

    this.interval = null;
    this.initialized = false;

    $(window).on('beforeunload', () => this.stop());
  }

  public start(): void {
    this.stop();
    this.interval = window.setInterval(() => this.tick(), 1000);
    this.tick(); // <-- apply initial formatting
  }

  public stop() {
    if (this.interval) {
      window.clearInterval(this.interval);
    }
    this.interval = null;
  }

  public tick() {
    var value = this.rootElement.data('value');

    // Reduce the value by a second
    value -= 1;
    if (value < 1) {
      value = 0;
      this.notify(new util.Notification('zeroed', this.rootElement, this.action(), event));
      this.stop();
    }

    // Format the output in minutes:seconds
    var minutes: any = Math.floor(value / 60),
      seconds: any = value % 60;

    if (minutes < 10) {
      minutes = '0' + minutes;
    }

    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    this.rootElement.html(minutes + ':' + seconds);

    // Save the new value
    this.rootElement.data('value', value);
  }

  public set(value: any): void {
    if (this.initialized) {
      console.log('TimerWidget (#' + this.id() + ') has already been initialized and will ignore all binding requests.');
      return;
    }

    if (isNaN(value)) {
      throw 'Non-numeric value bound to ui_timerWidget.';
    }

    this.rootElement.data('value', value);
    this.start();

    this.initialized = true;
  }

  public get(): any {
    return this.rootElement.data('value');
  }

  public retainsState(): boolean {
    return true;
  }

  public _serializeState(data: any): any {
    return { value: data, t: new Date().getTime() };
  }

  public _deserializeState(data: any): any {
    var value = data.value,
      dt = new Date().getTime() - data.t;

    value -= Math.floor(dt * 0.001);
    if (value < 0) {
      value = 0;
    }

    return value;
  }

  public validate(): boolean {
    return true;
  }
}

