import models = require("RTJS/Model/Abstract/IModel");
import views = require("RTJS/UI/Views/View");
import controller = require("RTJS/UI/Controllers/Abstract/Controller");

export class Bootstrapper<TModel extends models.IModel> {
  constructor(public controllers: rtjs.LoadedControllerMap, public repository: TModel) {

  }

  public bootstrap(): void {
    this.controllers.each((controller) => {
      controller.load();
    });
  }

  public findController(name: string, id?: string): Array<controller.Controller<views.View, models.IModel>> {
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
