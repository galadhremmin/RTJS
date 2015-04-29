# MouseOverWidget

Shows a tooltip at the mouse cursor while it is hovering above the element.
Also allows element to have a click event.

## Binding
This is a ViewOnlyWidget and thus does not support data-binding.

## Data attributes
`MouseOverWidget` supports the following specialized data-attributes:
* `data-title`: Specify the text to display inside the tooltip.

## Events
Will send a [Observable.Notification](class.Util.Observable.Notification) with type `mouseOver` to its observers on `mouseOver`-events.

## Styling
These classes are used to style the tooltip:
* Tooltip box: `super-puff-tooltip`.
* Tooltip text container: `tooltip-text`.
* For a speech bubble-style arrow, style `super-puff-tooltip-triangle`.