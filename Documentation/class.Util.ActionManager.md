# ActionManager
Handles routing of [Observable.Notification](class.Util.Observable.Notification)-intances with an action specified to the corresponding action method on the controller (reference stored in private member `context`.

While the standard library uses this for managing actions on controllers, it can be used to route notifications on actions on any object that follows the naming convention for action methods.

## Routing
When passed a [Observable.Notification](class.Util.Observable.Notification) will look at its action member and call the method on the context with the same name as the action, plus an `Action` suffix, passing in the `data` and `source` members of the notification to it.

ie. an action of `ButtonClicked` will result in a call to `context.ButtonClickedAction`.