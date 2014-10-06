import controllers = require("RTJS/UI/Controllers/Abstract/Controller");
import views = require("RTJS/UI/Views/View");
import models = require("RTJS/Model/Abstract/IModel");
  
export class DefaultController extends controllers.Controller<views.View, models.IModel> {
    
  constructor(rootElement: JQuery, model: models.IModel) {

    super(new views.View(rootElement), model);

  }

}

