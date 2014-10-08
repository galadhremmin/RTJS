import IModel = require("../../Model/Abstract/IModel");
import views = require("../../UI/Views/View");
import Controller = require("../../UI/Controllers/Abstract/Controller");

class Bootstrap<TModel extends IModel> {
  constructor(public controllers: rtjs.LoadedControllerMap, public repository: TModel) {

  }

  public bootstrap(): void {
    this.controllers.each((controller) => {
      controller.load();
    });
  }

  public findController(name: string, id?: string): Array<Controller<views.View, IModel>> {
    var className = rtjs.Initializer.getClassName(name + 'Controller', false);
    var controllers = this.controllers.get(className);

    if (!controllers) {
      return undefined;
    }

    if (!$.isArray(controllers)) {
      return [controllers];
    }

    return controllers;
  }
}

export = Bootstrap;