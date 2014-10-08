import views = require("RTJS/UI/Views/View");
import util = require("RTJS/Util/Observable");
import models = require("RTJS/Model/Abstract/IModel");
import action = require("RTJS/Util/ActionManager");

export class Controller<TView extends views.View, TModel extends models.IModel> implements util.IObserver {
    
  private actionManager: action.ActionManager;

  constructor(public view: TView, public model: TModel) {
    if (!(view instanceof views.View)) {
      throw 'Controller hasn\'t been properly overloaded. The constructor\'s first parameter should be of the type JQuery to be compatible with the RTJS initializer. This is the root element for the view.';
    }

    this.actionManager = new action.ActionManager(this);

    view.observe(this);
    model.observe(this);
  }

  public load(): void {
    this.view.load(() => { this.loaded(); });
  }

  /**
   * This method is invoked when the view and its widgets have successfully been loaded and configured.
   */
  public loaded(): void {
    
  }

  public notified(source: Object, params: util.INotification): void {
    // Deallocate some data when the controller is no longer in use
    if (!this.view.inDOM()) {
      this.tearDown();
      return;
    }

    if (!this.actionManager.resolve(params)) {
      this.handleNotification(params);
    }
  }

  public handleNotification(params: util.INotification): void {
      
  }

  public id(): string {
    return this.view.id();
  }

  public validate(): boolean {
    return true;
  }

  private tearDown(): void {
    this.view.unobserve(this);
    this.model.unobserve(this);

    this.view  = undefined;
    this.model = undefined;
  }
}
