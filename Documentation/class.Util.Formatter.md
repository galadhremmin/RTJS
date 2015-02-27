# Formatter

A utility that formats values. A component that imports a reference to this utility, e.g. `import format = require("../../../Util/Formatter")` can 
instanciate it by calling `format.instance().install(element: JQuery, formatterName: string)` 

## Data attributes

To install this utility on an element the attribute `data-value-format` must be used. 

## Formatter classes 

All formatter classes have their own `format` and `unformat` methods

| Name                    | Description
|:------------------------|:------------
|`ThousandFormatter`      | Adds thousand separators to the value
|`CurrencyFormatter`      | Extends `ThousandFormatter` with an added Swedish currency marker *kr*
|`QuirkyCurrencyFormatter`| Extends `ThousandFormatter`. Like `CurrencyFormatter` but replaces spaces with periods
|`PercentFormatter`       | Adds percentage markers to the value
|`DateFormatter`          | Changes the value to a date format. Supports formatting of ASP.NET date times and values given as YYYYMMDD, YYYYMMDD, YYYY 
|`YearFormatter`          | Changes date values given as Y and YY to YYYY and strips out month and day data 
|`DecimalFormatter`       | Handles values that are decimals

## Methods

| Method                                                | Description
|:------------------------------------------------------|:-----------
|`instance(): Formatter`                                | Creates and returns a new instance of Formatter if it's not alread instanciated
|`install(element: JQuery, formatterName: string): void`| A method to set a value format data attribute to an element and enable formatting for it
|`format(s: any): string`                               | Runs the formatting for the input parameter and returns a formatted string accordingly 
|`unformat(s: stromg): any`                             | Unformats an already formatted value
