# SelectWidget

Widget for `<select>`-elements. The widget recognizes regular html `<option>`-elements, or you can use an array of [KeyValuePair](class.Util.KeyValuePair.md) or [CheckboxItem](class.Util.CheckboxItem.md) for dynamic creation and updating of options.

The widget action will be invoked on the controller when the user makes a selection.

## Binding
Bind to a value in order to set the current selection.

In order to append or update options, bind to an array of [KeyValuePair](class.Util.KeyValuePair.md) or [CheckboxItem](class.Util.CheckboxItem.md). The widget will check each option, if an option with that value-attribute already exists, its text is updated to that of the binding object. If such an option does not already exist, it is added to the list. The difference between [KeyValuePair](class.Util.KeyValuePair.md) and [CheckboxItem](class.Util.CheckboxItem.md) is that [CheckboxItem](class.Util.CheckboxItem.md) also allows you to specify an item as selected when binding.

> *NOTE*: Due to an unfortunate naming clash the `key`-member of [KeyValuePair](class.Util.KeyValuePair.md) and [CheckboxItem](class.Util.CheckboxItem.md) will be used for the `value`-attribute of the resulting `<option>`, and the `value`-member will be used for the text displayed in the list for that `<option>`.

## Methods
| Method            | Description|
|:------------------|:-----------|
|`removeAllItems(listOfExceptions: string[]): void`|Removes all options from the select-list, except those whose values are specified in `listOfExceptions`.