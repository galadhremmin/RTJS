# ButtonWidget
A widget that handles buttons. Extends `ViewOnlyWidget`.

## Data attributes
* `data-action-argument`: Optional. Sends extra arguments together with an action. This data is then notified to all observers together with the click event object

## Methods
| Method                            | Description
|:----------------------------------|:-----------
| set(value: any): void             | Sets the `action-argument` data attribute value
| clickEvent(ev: JQueryEventObject) | The method that fires on the rootElement's click event. Handles the optional `data-action-argument` and notifies all observers.
