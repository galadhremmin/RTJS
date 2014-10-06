import widget = require("./Abstract/Widget");
  
export class FoldoutWidget extends widget.ViewOnlyWidget {
    
  constructor(rootElement: JQuery, parameters: Object) {
    super(rootElement, parameters);

    if (!rootElement.hasClass('information-foldout')) {
      rootElement.addClass('information-foldout');
    }
    if (!rootElement.hasClass('closed')) {
      rootElement.addClass('closed');
    }

    rootElement.find('.information-foldout-title').on('click', (event) => this.clickEvent(event));
  }

  private clickEvent(event) {
    event.preventDefault();
    this.rootElement.toggleClass('closed');
  }
}
