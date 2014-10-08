/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
import util = require("../../Util/Observable");  

export class MouseOverWidget extends widget.ViewOnlyWidget {
    
  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters);

    var me = this;
    this.rootElement
      .on('mouseover', function (event) { me.mouseOverEvent(event, this); })
      .on('mousemove', function (event) { me.mouseMoveEvent(event, this); })
      .on('mouseout',  function (event) { me.mouseOutEvent(event, this); });

    if (this.action()) {
      rootElement.on('click', (event: JQueryEventObject) => this.clickEvent(event));
    }

    // Enable clicking on anchor tags with mouseOverWidget in touch devices, e.g. iPhones
    this.rootElement.on('touchend', function (event) {
      var link = $(this).attr('href');
      window.location.href = link;

      return false; // prevent anchor click   
    });
  }

  private mouseOverEvent(e: JQueryEventObject, elem: Element): void {
    var $this = $(elem);

    clearTimeout($this.data('timeoutId'));

    var text = $this.data().title;
    $('body').append('<div class="super-puff-tooltip"><div class="tooltip-text">' + text + '</div><div class="super-puff-tooltip-triangle"></div></div>');

    this.notify(new util.Notification('mouseOver', this.rootElement, this.get(), e));
  }

  private mouseMoveEvent(e: JQueryEventObject, elem: Element): void {
    var puffWidth = $('.super-puff-tooltip').width();
    $('.super-puff-tooltip').css('top', e.pageY - 68);
    $('.super-puff-tooltip').css('left', e.pageX - puffWidth - 15);
  }

  private mouseOutEvent(e: JQueryEventObject, elem: Element): void {
    $('.super-puff-tooltip').remove();
  }

  private clickEvent(event: JQueryEventObject): void {
    var boundArg = null,
      notifyData;

    event.preventDefault();
    boundArg = this.rootElement.data('action-argument');

    notifyData = (boundArg != null && boundArg != undefined) ? { data: boundArg, event: event } : event;

    this.notify(new util.Notification('click', this.rootElement, this.action(), notifyData));
  }
}

