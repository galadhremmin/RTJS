/// <reference path="../View.ts"/>

import view = require("RTJS/UI/Views/View");
import widgetB = require("RTJS/UI/Widgets/ButtonWidget");
import widgetI = require("RTJS/UI/Widgets/InputWidget");

export class DialogueView extends view.View {
  public isOpen: boolean;
  public previousHash: string;

  constructor(root: JQuery, public container: JQuery, public breadcrumb: string) {
    super(root);

    $(window).on('hashchange', () => this.hashChanged.apply(this, arguments));
    this.isOpen = false;
  }

  private hashChanged(event, data): void {
    var current = window.location.hash,
      own = this.getHash();

    if (data && data.source !== this.rootElement) {
      return;
    }

    if (!this.rootElement.is(':visible') && current === own) {
      this.show();
    } else {
      this.hide();
    }
  }

  public load(callback?: () => void): void {
    super.load(() => {
      // The dialogue might already be opened. The user might have clicked the back button on
      // the browser. The easiest way to detect this is to check for forward slash in the current hash.
      if (String(window.location.hash).indexOf('/') > -1) {
        // Forward slash found! Invoke the hashChanged method to check whether the dialogue is meant to be opened.
        this.hashChanged(null, null);
      }

      if (typeof callback === 'function') {
        callback.apply(this);
      }
    });
  }

  public open(): void {
    if (this.rootElement.is(':visible')) {
      return;
    }

    this.pushHash(this.getHash());
  }

  /**
    * Close the dialog and optionally prevent hash changes. If hash changes are prevented, then you manually need to set window.location.hash 
    */
  public close(preventPopHash?: boolean): void {

    if (!this.rootElement.is(':visible')) {
      return;
    }

    if (!preventPopHash) {
      this.popHash();
    }
  }

  public validate(): boolean {
    var result = super.validate();
    if (result) {
      this.hideValidationErrors();
    } else {
      this.displayValidationErrors(this.validationErrors);
    }

    return result;
  }

  public toggleFieldVisibility(action: string): void {
    this.rootElement.find('[data-visible-on]').each(function () {
      var elem = $(this),
        showElem = elem.data('visible-on'),
        hideElem = elem.data('hidden-on');

      if (showElem && hideElem) {
        if (String(showElem).indexOf(action) >= 0) {
          elem.show();
        } else if (String(hideElem).indexOf(action) >= 0) {
          elem.hide();
        }
      }
    });
  }

  public show(callback?: Function): void {
    this.isOpen = true;
    this.hideValidationErrors();

    $('#breadcrumb-step').text(' / ' + this.breadcrumb);

    this.rootElement.css({ visibility: 'visible' }).fadeIn($.proxy(() => {
      this.container.css({ visibility: 'hidden' });
      this.dialogueInitialize();

      if (callback !== undefined) {
        callback.apply(this);
      }

    }, this));
  }

  public hide(callback?: Function): void {
    this.isOpen = false;
    this.container.css({ visibility: 'inherit' });
    $('#breadcrumb-step').text('');

    this.rootElement.fadeOut($.proxy(() => {
      this.rootElement.css({ visibility: 'hidden' });
      if (callback !== undefined) {
        callback.apply(this);
      }

    }, this));
  }

  public dialogueInitialize(): void {
    // No further initialization. This method is meant to be overridden.
  }

  private hideValidationErrors(): void {
    this.rootElement.find('.validation-error.error-description').empty();
    this.rootElement.find('.validation-error.error-description').hide();
  }

  private displayValidationErrors(errors: string[]): void {
    this.rootElement.find('.validation-error.error-description').html(errors[0]);
    this.rootElement.find('.validation-error.error-description').show();
  }

  private getHash(): string {
    var hash = this.rootElement.data('slug');
    hash = hash || this.rootElement.attr('id');
    return '#' + hash;
  }

  private pushHash(hash: string): void {
    if (this.previousHash === hash) {
      return;
    }

    this.previousHash = window.location.hash;
    window.location.hash = hash;
  }

  private popHash(): void {
    window.location.hash = this.previousHash || this.parentHash();
    $(window).trigger('hashchange', { source: this.rootElement });
  }

  private parentHash(): string {
    var hash = window.location.hash.split('/');

    if (hash.length === 2) {
      return hash[0];
    }

    return '';
  }
}

export class ButtonDialogueView extends DialogueView {
  public notified(source: Object, data: any): void {
    if (source instanceof widgetB.ButtonWidget || source instanceof widgetI.InputWidget) {
      super.notified(source, data);
    }
  }
} 