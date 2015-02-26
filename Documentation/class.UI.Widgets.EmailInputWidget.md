# EmailInputWidget

A widget for input fields that are to handle and validate email-addresses.

## Data attributes
`EmailInputWidget` understands three specialized data attributes:
* `data-validate-container-id`: Specifies the id of an element that will be used to display validation error messages originating from this widget.
* `data-validate-against`: Specifies the id of another input field whose contents must match the contents of this element for validation to pass. This allows proper validation of the common pattern where users are asked to repeat the email address exactly in a separate field when registering.
* `data-validate-allow-empty`: Is either true or false and specifies whether an empty field will pass validation or not. Default: false.
 
## Methods

| Method            | Description|
|:------------------|:-----------|
|`validate(typeName?: string): boolean`|Override of validate in base class. Validates that the current value of the input is a valid email address. See also `Data atttributes` above.
