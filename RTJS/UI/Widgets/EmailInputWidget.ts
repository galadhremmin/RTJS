import widget = require("./Abstract/Widget");
  
export class EmailInputWidget extends widget.Widget {
    
  private validationErrorContainer: string;

  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters);

    this.validationErrorContainer = rootElement.data('validate-container-id');

    // Disable copy and paste
    rootElement.on('copy', (ev) => {
      ev.preventDefault();
      return false;
    });

    rootElement.on('paste', (ev) => {
      ev.preventDefault();

      // show validation error message
      if (this.validationErrorContainer) {
        $('#' + this.validationErrorContainer).show();
      }

      return false;
    });
  }

  public validate(typeName?: string): boolean {
    var elem = this.rootElement,
      siblingId = elem.data('validate-against'),
      siblingText = '',
      emptyEmailValid = elem.data('validate-allow-empty'), // is true or false
      text = elem.val();

    if ((text.length < 1 && !emptyEmailValid) || !this.isValidEmail(text, emptyEmailValid)) {
      this.validationError = rtjs.Language.current().validation.missingEmail;
      return false;
    }

    if (siblingId) {
      siblingText = $('#' + siblingId).val();

      if (siblingText.toLowerCase() !== text.toLowerCase()) {
        this.validationError = rtjs.Language.current().validation.emailMismatch;
        return false;
      }
    }

    return true;
  }

  private isValidEmail(text: string, emptyEmailValid: boolean): boolean {
    if (emptyEmailValid && !text) {
      return true;
    }

    return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i.test(text);
  }
}

