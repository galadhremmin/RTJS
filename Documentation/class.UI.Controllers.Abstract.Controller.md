# Controller
Initializes a [view](class.UI.Views.View), and handles actions and notifications received from its [widgets](class.UI.Widgets.Abstract.Widget). A controller implements the observer/observable pattern.

The `Controller<TView, TModel>` class is considered abstract. The inheriting subclass must implement `constructor(rootElement: JQuery, model: Model)`. The implementation shall pass the desired view to the parent constructor. 
 
## Methods

| Method            | Description|
|:------------------|:-----------|
|`load(): void`| Loads the associated view, which in turn will trigger the initialization of its widgets. This method can be overloaded with pre-initialization code, _but_ we do not recommend that it's used for this purpose. Use `loaded` instead.
|`loaded(): void`|Overridable. Invoked when the view has successfully initialized and its components are ready. Post-initialization codes goes here. Empty by default.
|`handleNotification(params: util.INotification): void`|Overridable. Invoked when an unhandled notification is received from the view, or from one of its components. Empty by default.
|`id(): string`|Returns the ID of the view's root element.
|`validate(): boolean`|Overridable. Checks whether the controller's state is valid. This is useful when implementing cross-controller interconnectivity, or when working with navigation controllers. Returns `true` by default.