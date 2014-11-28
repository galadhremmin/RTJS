/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
import util = require("../../Util/Observable");

export class SliderWidget extends widget.Widget {

  private startX;
  private endX;
  private handleW;
  private precision;
  private steps;
  private lastReportedValue;
  private value;

  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters);
    this.value = parameters ? (<IConfiguration>parameters).min || 0 : 0;

    var $elem = this.rootElement;
    $elem.addClass('widget-slider');

    var ball = $('<a href="#"></a>');
    ball.click((ev: any) => {
      if (ev.preventDefault) {
        ev.preventDefault();
      } else {
        ev.returnValue = false;
      }
    });

    this.rootElement.on('mousedown', (event) => this.beginSlide(event));
    this.rootElement.on('touchstart', (event) => this.beginSlide(event));
    this.rootElement.on('keyup', (event) => this.keyedSlide(event));

    this.rootElement.append(ball);
    this.rootElement.append('<div class="widget-slider-space"><div class="marked-area"></div><div class="shadow"></div></div>');

    //We need to recalculate the offsets for the slider if the user resizes the window while it is onscreen.
    $(window).on('resize.recalcslider', () => this.recalculatePositions());

    window.setTimeout(() => this.set(this.params().min), 0);
  }

  public set(v: any): void {
    var markArea = false;

    // This binding method is multi-purposed: it supports setup parameters, as well as
    // value binding, once the slider has been initialized. This functionality enables
    // late initialization through data properties from the data model.
    if (v instanceof SliderSetup) {
      var setup = <SliderSetup>v;
      this.parameters = {
        min: setup.min,
        max: setup.max,
        step: setup.step,
        markedLeft: setup.markedLeft,
        markedRight: setup.markedRight,
        markedBehavior: setup.markedBehavior
      };

      this.steps = undefined;

      v = setup.initialValue;

      markArea = true;
    }

    if (v === undefined || v === null || isNaN(v)) {
      return;
    }
    if (v === this.value) {
      return;
    }

    if (v > this.params().max) {
      this.value = this.params().max; // value exceeds allowed maximum?
    } else if (v < this.params().min) {
      this.value = this.params().min; // value is lower than the minimum?
    } else {
      this.value = Math.round(v / this.params().step) * this.params().step; // Calculate the nearest step
    }

    this.slide({ pageX: this.positionXForValue(this.value) });

    if (markArea) {
      this.setMarkedArea();
    }
  }

  public get(): any {
    return this.value;
  }

  private params(): IConfiguration {
    return <IConfiguration> this.parameters;
  }

  private setup(): void {
    if (this.steps !== undefined) {
      return;
    }

    // Save the slider's left hand side from the left side of the screen
    this.startX = this.rootElement.offset().left;

    // Save the slider's right hand side from the left side of the screen
    this.endX = this.rootElement.innerWidth() + this.startX;

    // Calculate the number of available steps between the defined minimum and maximum values
    this.steps = (this.params().max - this.params().min) / parseFloat(this.params().step);

    // Calculate the precision based on the number of integers defined as the step size
    this.precision = Math.pow(10, String(this.params().step).replace(/^[0-9]/g, '').length - 1);

    // Calculate width of the handle (first <a> in slider element)
    this.handleW = this.rootElement.children('a').outerWidth();

    if (this.value === undefined || this.value === null) {
      this.value = this.params().min;
    }
  }

  private setMarkedArea() {
    if (this.params().markedRight == null ||
      this.params().markedRight == undefined &&
      this.params().markedLeft == null ||
      this.params().markedLeft == undefined) {
      return;
    }

    var behavior = this.params().markedBehavior || SliderMarkedAreaBehavior.Normal;

    this.setMarked(behavior, this.params().markedLeft, this.params().markedRight);
  }

  private setMarked(behavior: SliderMarkedAreaBehavior, markedLeft?: number, markedRight?: number) {
    var marker = $('.marked-area', this.rootElement);

    marker.removeClass('left-end-marked right-end-marked');

    if (!markedLeft || markedLeft <= this.params().min) {
      markedLeft = this.params().min;
      marker.addClass('left-end-marked');
    }
    if (!markedRight || markedRight >= this.params().max) {
      markedRight = this.params().max;
      marker.addClass('right-end-marked');
    }

    var leftEnd = (behavior == SliderMarkedAreaBehavior.StickyLeft) ? this.value : markedLeft;
    var rightEnd = (behavior == SliderMarkedAreaBehavior.StickyRight) ? this.value : markedRight;

    var rightPosition = this.calculateRelativePosition(this.positionXForValue(rightEnd), 0),
      leftPosition = this.calculateRelativePosition(this.positionXForValue(leftEnd), 0),
      markedWidth = rightPosition.position - leftPosition.position;

    marker[0].style.width = markedWidth + 'px';
    marker[0].style.left = leftPosition.position + 'px';
  }

  private calculateRelativePosition(pageX: number, offsetWidth: number): IPositionData {
    var sliderWidth = (this.endX - this.startX),
      pixelWidthOfStep = sliderWidth / this.steps,
      maxX = sliderWidth - (offsetWidth / 2),
      minX = offsetWidth / 2,
      contextX, // pageX translated to slider-space.
      positionInSteps,
      offsetPosition, // position with offset factored in.
      resultVal; // value calculated for position.

    if (pageX < this.startX) {
      contextX = 0;
    } else if (pageX > this.endX) {
      contextX = sliderWidth;
    } else {
      contextX = pageX - this.startX;
    }

    positionInSteps = Math.round(contextX / pixelWidthOfStep);
    resultVal = Math.round(((positionInSteps * this.params().step) + this.params().min) * this.precision) / this.precision;

    if (this.value < this.params().min) {
      resultVal = this.params().min;
    } else if (this.value > this.params().max) {
      resultVal = this.params().max;
    }

    if (contextX < minX) {
      offsetPosition = minX;
    } else if (contextX > maxX) {
      offsetPosition = maxX;
    } else {
      offsetPosition = contextX;
    }

    return { val: resultVal, pxStepWidth: pixelWidthOfStep, numberSteps: positionInSteps, position: offsetPosition, maxX: maxX, minX: minX };
  }

  private recalculatePositions(): void {
    // Save the slider's left hand side from the left side of the screen
    this.startX = this.rootElement.offset().left;

    // Save the slider's right hand side from the left side of the screen
    this.endX = this.rootElement.innerWidth() + this.startX;
  }

  private beginSlide(ev: Event): void {

    // Prepare calculation values
    this.setup();

    // Assign the last reported value to null, forcing the bound value to be reported within the first iteration.
    this.lastReportedValue = null;

    // Attach the touch and mouse move events to the document element. These events are not attached to the <A> element
    // as it should be possible to touch outside the element and still affect its position.
    var d = $(document);

    d.on('touchmove', (event) => this.slide(event));
    d.on('mousemove', (event) => this.slide(event));
    d.on('touchcancel', (event) => this.endSlide(event));
    d.on('mouseleave', (event) => this.endSlide(event));
    d.on('mouseup', (event) => this.endSlide(event));
    d.on('touchend', (event) => this.endSlide(event));

    ev.preventDefault();
  }

  private slide(ev: any): void {
    var x, p;

    if (ev.originalEvent && ev.originalEvent.touches && ev.originalEvent.touches.length) {
      x = ev.originalEvent.touches[0].pageX;
    } else {
      x = ev.pageX;

      if (x === undefined) {
        x = 0;
      }
    }
    if (ev.hasOwnProperty('preventDefault')) {
      ev.preventDefault();
    }

    var calculatedPositionData = this.calculateRelativePosition(x, this.handleW);

    this.value = calculatedPositionData.val;

    (<HTMLElement> this.rootElement.get(0).firstChild).style.left = calculatedPositionData.position + 'px';

    p = this.params();
    if (p.markedBehavior != null && p.markedBehavior != undefined && p.markedBehavior != SliderMarkedAreaBehavior.Normal) {
      var markedArea = this.rootElement.find('.marked-area')[0];

      if (p.markedBehavior == SliderMarkedAreaBehavior.StickyLeft) {
        this.setMarked(p.markedBehavior, calculatedPositionData.val, p.markedRight);
      } else if (p.markedBehavior == SliderMarkedAreaBehavior.StickyRight) {
        this.setMarked(p.markedBehavior, p.markedLeft, calculatedPositionData.val);
      }
    }

    if (this.lastReportedValue !== this.value) {
      this.notify(new util.Notification('change', this.rootElement, this.action(), this.get()));
      this.lastReportedValue = this.value;
    }
  }

  private keyedSlide(ev: any): void {
    var mod = 0;

    switch (ev.which) {
      case 39:
        mod = 1;
        break;
      case 37:
        mod = -1;
        break;
      default:
        return;
    }

    ev.preventDefault();

    this.slide({ pageX: this.positionXForValue(this.get() + (mod * this.params().step)) });
  }

  private positionXForValue(v): number {
    this.setup(); // Prepare calculation values

    var w = (this.endX - this.startX) / this.steps,
      vInSteps = Math.round((v - this.params().min) / parseFloat(this.params().step)),
      x = this.startX + (vInSteps * w);

    return x;
  }

  private endSlide(ev: Event): void {

    // Detach the touch events
    var d = $(document);

    d.off('touchmove');
    d.off('mousemove');
    d.off('touchcancel');
    d.off('mouseleave');
    d.off('mouseup');
    d.off('touchend');

  }
}

interface IConfiguration {
  step: any;
  max: number;
  min: number;
  markedLeft?: number;
  markedRight?: number;
  markedBehavior?: SliderMarkedAreaBehavior;
}

interface IPositionData {
  val: number;
  position: number;
  pxStepWidth: number;
  numberSteps: number;
  maxX: number;
  minX: number;
}

export class SliderSetup {

  constructor(public min: number, public max: number, public step: number, public initialValue?: number, public markedLeft?: number, public markedRight?: number, public markedBehavior?: SliderMarkedAreaBehavior) {
  }

}

export enum SliderMarkedAreaBehavior {
  Normal,
  StickyLeft,
  StickyRight
}