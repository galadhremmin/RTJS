import Model = require("../../Model/Abstract/Model");
import views = require("../../UI/Views/View");
import Controller = require("../../UI/Controllers/Abstract/Controller");

class Bootstrap<TModel extends Model> {
  constructor(public controllers: rtjs.LoadedControllerMap, public repository: TModel) {

  }

  public bootstrap(): void {
    this.controllers.each((controller) => {
      controller.load();
    });
  }

  public findController(name: string, id?: string): Array<Controller<views.View, Model>> {
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