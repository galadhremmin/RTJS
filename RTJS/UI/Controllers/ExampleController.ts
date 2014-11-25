import views = require("../Views/View");
import Controller = require("./Abstract/Controller");
import Model = require("../../Model/Abstract/Model");

export class ExampleController extends Controller<views.View, Model> {

  constructor(rootElement: JQuery, model: Model) {
    super(new views.View(rootElement), model);
  }

  private exampleButtonClickedAction() {
    var data = this.view.read();
    this.view.bind({ message: 'Hello ' + data.name + '!' });
  }

}

 