import util = require("./Observable")

class ActionManager {

  constructor(private context: Object) {
  }

  public resolve(params: util.INotification): boolean {
    if (!params || !params.action() || params.action().length < 1) {
      return false;
    }

    var internalName = this.getInternalActionName(params.action());
      
    if (internalName in this.context) {
      this.context[internalName].call(this.context, params.data(), params.source());
      return true;
    }

    return false;
  }

  private getInternalActionName(actionName: string): string {
    return actionName + 'Action';
  }
}

export = ActionManager;