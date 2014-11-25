import views = require("../Views/View");
import Controller = require("./Abstract/Controller");
import Model = require("../../Model/Abstract/Model");
  
export class DefaultController extends Controller<views.View, Model> {
    
  constructor(rootElement: JQuery, model: Model) {

    super(new views.View(rootElement), model);

  }

}

