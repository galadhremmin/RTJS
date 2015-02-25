# LoadedControllerMap
Retains reference groups to the controller instances. The instances are grouped by their class names. 

Note: the map returns a reference to the controller associated with the specified class name, _or_ an array of references if multiple instances of the same controller exist.

## Methods

| Method            | Description|
|:------------------|:-----------|
|`add(name: string, instance: any): void`| Associates the instance to the specified string. If an object reference already exist in association with the specified name, both references will be retained.
|`get(name: string): any`|Gets the instance for the class name. Returns either an array of references, or a single reference, depending on the number of references which are associated with the class name.
|`each(callback: (controller: any) => void): void`|Invokes the specified callback on all controllers in the collection.