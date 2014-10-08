/// <reference path="Abstract/Widget.ts"/>

import widget = require("./Abstract/Widget");
import view = require("../../UI/Views/View");
import util = require("../../Util/Observable");

export class InputWidget extends widget.FormattableWidget implements util.IObserver {
  
  private autoTimerId: number;
  private autoStateDigest: number;
  private autoNavIndex: number;
  private autoResultListExposed: boolean;
  private autoCompleteView: view.View;

  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters);

    if (this.writeOnly()) {
      throw 'InputWidget is applied on ' + rootElement.get(0).nodeName + ', which is immutable and doesn\'t support user interaction. This is bad.';
    }

    if (this.params().autocomplete) {
      this.initAutoComplete(rootElement);
    } else {
      this.rootElement.on('change', () => this.changeEvent());
    }
  }

  private changeEvent(): void {
    this.notify(new util.Notification('change', this.rootElement, this.action(), this.get()));
  }

  private params(): IParameters {
    var param: IParameters = {};
    $.extend(param, this.parameters);

    param.autocomplete = /^true$/i.test(this.parameters['autocomplete']);

    return param;
  }

  private initAutoComplete(rootElement: JQuery): void {
    var wrapper = $('<div />');
    var result = $('<div />');

    wrapper.css({ height: 'auto', padding: '0', margin: '0', position: 'relative' });
    result.css({ position: 'absolute', left: '0', top: (rootElement.outerHeight(true) + 1) + 'px', width: rootElement.outerWidth() - 2 + 'px'});

    result.html('<ul data-widget="list" data-bind="_" data-widget-links="true" data-widget-highlighting="true" data-action="autoItemClicked"></ul>');
    //result.children('ul').hide();
    result.addClass('autocomplete-result');

    rootElement.wrap(wrapper);
    rootElement.parent().append(result);

    this.autoCompleteView = new view.View(result);
    this.autoCompleteView.observe(this);
    this.autoCompleteView.load();

    this.rootElement.on('keyup', (ev) => this.autoChangedState(ev));
    this.rootElement.on('focus', (ev) => this.autoClientArrived(ev));
    this.rootElement.on('blur', (ev) => this.autoClientLeft(ev));

    result.on('mouseenter', (ev) => this.autoResultClientArrived(ev));
    result.on('mouseleave', (ev) => this.autoResultClientLeft(ev));

    result.hide();

    this.autoTimerId = 0;
    this.autoStateDigest = 0;
    this.autoNavIndex = 0;
    this.autoResultListExposed = false;
  }

  public autoComplete(items: any): void {
    var data: Array<Object> = [];
    var params: IParameters = this.params();
    var i: number;

    for (i = 0; i < items.length; i += 1) {
      data.push({
        title: items[i][params.autocompleteKeyProperty],
        url: items[i][params.autocompleteValueProperty],
        highlight: this.rootElement.val()
      });
    }

    this.autoCompleteView.bind({ _: data });
    this.autoCompleteView.rootElement[data.length ? 'show' : 'hide']();

    this.autoNavIndex = 0;
    this.autoNavigatedSelect();
  }

  private autoChangedState(ev: JQueryEventObject): void {
    if (this.autoNavigated(ev)) {
      this.autoNavigatedSelect();
      return;
    }

    if (this.autoTimerId) {
      window.clearTimeout(this.autoTimerId);
    }

    this.autoTimerId = window.setTimeout(() => {
      this.autoTimerId = 0;
      this.autoExamineNewState();
    }, 250);
  }

  private autoNavigated(ev: JQueryEventObject): boolean {
    var direction: number = this.autoNavIndex;

    switch (ev.keyCode) {
      case 13:
        this.autoNavigatedClick();
        return true;

      case 40: // down-arrow
        direction = 1;
        break;

      case 38: // up-arrow
        direction = -1;
        break;

      default:
        return false;
    }

    this.autoNavIndex += direction;
    return true;
  }

  private autoNavigatedSelect(): void {
    var items: JQuery;
    items = this.rootElement.next().find('li');

    if (this.autoNavIndex < 0) {
      this.autoNavIndex = 0;
    } else if (this.autoNavIndex >= items.length) {
      this.autoNavIndex = items.length - 1;
    }

    this.autoSelectNavigationItem($(items.get(this.autoNavIndex)));
  }

  private autoSelectNavigationItem(item: JQuery): void {
    item.addClass('active');
    item.siblings('.active').removeClass('active');
    this.autoNavIndex = item.index();

    if (item.length) {
      var results: JQuery = this.rootElement.next();

      if (item.parent().height() > results.height()) {
        results.css('overflow-y', 'scroll');
      } else {
        // Have to set this to something to cause a reflow, 
        // otherwise browsers would remove scrollbar but still reserve the space for it.
        results.css('overflow-y', 'auto');
      }

      var scrollPosition: number = results.scrollTop();
      var diff: number = 0;

      if (item.position().top + item.outerHeight(true) > results.height()) {
        diff = item.position().top + item.outerHeight(true) - results.height();
      } else if (item.position().top < 0) {
        diff = item.position().top;
      }

      if (diff !== 0) {
        results.scrollTop(scrollPosition + diff);
      }
    }
  }

  private autoNavigatedClick(): void {
    var items: JQuery;
    items = this.rootElement.next().find('li.active');

    if (items.length > 0) {
      items.find('a').trigger('click');
    }
  }

  private autoClientArrived(ev: JQueryEventObject): void {
    var result = this.rootElement.next();
    if (result.find('li').length) {
      result.show();
    }
  }

  private autoClientLeft(ev: JQueryEventObject): void {
    if (this.autoResultListExposed) {
      return;
    }

    var result = this.rootElement.next();
    result.hide();
  }

  private autoResultClientArrived(ev: JQueryEventObject): void {
    this.autoResultListExposed = true;
  }

  private autoResultClientLeft(ev: JQueryEventObject): void {
    this.autoResultListExposed = false;

    if (!this.rootElement.is(document.activeElement)) {
      this.autoClientLeft(ev);
    }
  }

  private autoExamineNewState(): void {
    var text = this.get();
    var state = text.hashCode();
    var data: IAutoCompleteNotification;

    if (state === this.autoStateDigest) {
      // No change
      return; 
    }

    data = {
      term: text,
      autoComplete: (result) => {
         this.autoComplete(result);
      }
    };

    this.notify(new util.Notification('autocomplete', this.rootElement, 'autoComplete', data));

    this.autoStateDigest = state;    
  }

  public notified(source: Object, data: util.INotification): void {
    if (data.action() === 'autoItemClicked') {
      // Select the item the client clicked on
      this.autoSelectNavigationItem(data.source().parents('li'));

      // Notify the listeners about the change
      this.notify(new util.Notification('change', this.rootElement, this.action(), data.data()));
    }
  }
}

interface IParameters {
  autocomplete?: boolean;
  autocompleteKeyProperty?: string;
  autocompleteValueProperty?: string;
}

export interface IAutoCompleteNotification {
  term: string;
  autoComplete: (result: IAutoCompleteData[]) => void;
}

export interface IAutoCompleteData {
  key: string;
  value: string;
}