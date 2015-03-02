# AgeWidget
A widget for input elements. Handles and validates age values.

## Data attributes / parameters
`AgeWidget` understands two different data attributes:
* `data-widget-maxAge`: maximum allowed age. Every value above this age is invalid.
* `data-widget-minAge`: mininum allowed age. Every value below this age is invalid.

## Methods
| Method                               | Description
|:-------------------------------------|:-----------
|`validate(typeName?: string): boolean`| Validates the given value and sets a `validationError` message in case it is invalid. 
