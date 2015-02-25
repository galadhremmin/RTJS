# Widget
A widget is a view component. It can accept user interaction (buttons, input fields, ...) and can opt not to (tables, labels, ...). The widget implements the observer/observable pattern, and the view it's associated with will be listening to its notifications. 

The `Widget` class is considered abstract. `ViewOnlyWidget` and `FormattableWidget` are abstract specializations intended as an aid in the creation of bespoke widgets. 
 * `ViewOnlyWidget` is useful when creating stateless data visualization widgets. While these widgets can let the client interact with the data they're presenting, they aren't intended in persisting the result of the manipulation.
 * `FormattableWidget` is useful when creating widgets which accepts client input. A [formatter](class.Util.Formatter.md) is installed on the root element, which will ensure that the data bound to the widget is presented in a manner relevant to its context. 

## Binding 
A widget has two methods which are invoked by the binding mechamism: `get` and `set`. A widget will bind if the binding data source has a property with the name (and path) as determined by the widget's `data-bind` attribute. The `data-bind` attribute supports the dot-notation, which means that `foo.bar.baz` will match `{foo:{bar:{baz:1}}}`. It also supports direct property names when no hierarchy is inferred. 

The `data-visibility` attribute can be used to associate the widget's visible state with the data being bound to it. It supports single as well as multiple, comma separated, values.

The widget's associated view performs the binding. Please refer to the [View](class.UI.Views.View.md) for more information about it.

## Events
A widget can trigger notifications. The `data-action` attribute is used for associating a notification with an event handler. These handlers are usually placed within the [Controller](class.UI.Controllers.Abstract.Controller.md), but can also be installed in the view, provided that an [ActionManager](class.Util.ActionManager.md) exists.

## Persisting state
A widget can use the [SessionStorage](class.Util.SessionStorage.md) and similar storage containers to persist its state across page loads. It's also possible to pass the widget's state to a web service for deep persistance. By overriding the `retainsState(): boolean`, making it return true to turn this feature on. With this feature on, the widget's state is automatically retained when the `onunload` event is fired.

## Viewport tracking
An experimental feature. By enabling viewport tracking, the widget can change state depending on whether it's currently within the viewport or not. The notification _viewport-status-change_ is emitted when the widget's visual state changes. Enable viewport tracking by setting the attribute `data-viewport-tracking` to `true`. The attributes `viewport-offset-top`, `viewport-vertical-scale` and `viewport-class` determine the behaviour.

## Methods

| Method            | Description|
|:------------------|:-----------|
|`action(): string`| Gets the name of the associated event handler.
|`key(): string`|Gets the binding path.
|`_stateKey(): string`|Overridable. Gets an unique identifier for the widget. Returns a combination of the root element's ID and the current location by default.
|`retainsState(): boolean`|Overridable. Returns whether the widget intends to retain state across page loads. Returns `false` by default.
|`_serializeState(data: any): any`|Overridable. Gets a serialized representation of the widget's current state. Returns the data arguments in its unserialized form by default.
|`_deserializeState(data: any): any`|Overridable. Deserializes the widget's previous state. Returns the data arguments in its unserialized form by default.
|`_saveState(): void`|Overridable. Saves the widget's current state across page loads. Uses SessionStorage by default. Override to use another storage container.
|`_loadState(): void`|Overridable. Loads the widget's previous state. Uses SessionStorage by default. Override if you wish to use another container.
|`_lastBindingSourceDigest(value?: number): number`|The checksum for the data collection most recently bound to the widget. This feature is used by the view to ensure that the same data isn't bound twice in a row. This method can be overridden to return 0, if for some reason, one would wish to disable automatic redundancy protection.
|`_bindingSource(): string`|Same as `key()`.
|`restore(): void`|Overridable. This method is invoked when the widget has been initialized and is ready to be used. Handles state restoration, and can be used to implement post-initialization.
|`bind(data: any, dataDigest?: number): void`|Internal method. Binds the specified data argument to the widgets. The digest parameter must be specified to enable redundancy protection.
|`visibleForData(data: any, apply: boolean): VisibilityStatus`|Determines whether the widget is configured to remain visible for the specified data.
|`getViewportTrackingElement(): JQuery`|Overridable. Retrieves the element which should trigger the viewport. Returns the root element by default.
|`validate(typeName?: string): boolean`|Overridable. Examines the widget's current state and returns whether it's valid. This method can be overridden to implement custom validation, but the use of existing validation functionality is encouraged.
|`visible(): boolean`|Returns whether the root element is current visible. The element's visible state is determined by the `:visible` selector. Abstain from overriding this method, unless it's absolutely necessary.
|`executeOnElement(elementFunction: (widget: Widget) => void): void`|Executes the specified callback on the root element. 
|`inDOM(): boolean`|Gets whether the root element still exists in the DOM. **Do not override** as this method is used for finding leaking widgets ("zombies").
|`id(): string`|Gets the ID of the root element.
|`set(value: any): void`|Overridable. Assigns the specified value to the widget.
|`get(): any`|Overridable. Retrieves the value contained by the widget. Returns `undefined` if the widget doesn't support this method.
|`writeOnly(): boolean`|Overridable. Returns whether the widget only intends to visualize the data it's bound. Returns `false` by default, except `ViewOnlyWidget`, which returns `true`.
|`reflow(): void`|Reflows and repaints the widget. This method is never called by the RTJS framework, but can be useful to update interactive components, such as a chart.
