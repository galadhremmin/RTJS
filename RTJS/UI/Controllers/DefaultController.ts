import views = require("../Views/View");
import Controller = require("./Abstract/Controller");
import IModel = require("../../Model/Abstract/IModel");
  
export class DefaultController extends Controller<views.View, IModel> {
    
  constructor(rootElement: JQuery, model: IModel) {

    super(new views.View(rootElement), model);

  }

}

