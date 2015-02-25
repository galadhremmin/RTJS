# Boostrap
Groups and manages associated controllers by retaining their references (see [LoadedControllerMap](class.LoadedControllerMap.md)). Boostrappers can also be used for cross-controller interconnectivity, and pre-controller initialization.

The `Bootstrap<TModel>` class is  considered abstract.

## Methods

| Method            | Description|
|:------------------|:-----------|
|`bootstrap(): void`| Loads all associated [controllers](class.UI.Controllers.Abstract.Controller.md). This method can be overloaded for pre-initialization code.
|`findController(name: string, id?: string): Array<Controller<views.View, Model>>`|Retrieves to find the controllers associated with the specified class name. The id property is deprecated.