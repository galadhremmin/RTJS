# RTJS
## Summary
An asynchronous MVC Framework written in TypeScript.
## Dependencies
 * Basic jQuery (1.x or 2.x)
 * RequireJS
 * extensions.js (included)
 
If you're building an ASP.NET website, we recommend that you bundle these resources.

## Installation
 * Import into Visual Studio (2013 Update 3+).
 * Enable AMD under the project's TypeScript configuration.
 * Include all dependencies (located within Dependencies folder). Optionally bundle them.
 * Open init.ts and correct the rootPath on the Initializer class. 
 * Include the bundle and _init.js_ at the end of your HTML-document.

## Sample
The following code snippet initializes _ExampleBootstrap_, which in turn loads _ExampleController_ and its associated view. You'll find the source code for these classes within the RTJS folder.

```
<div data-bootstrap="Example" data-controller="Example">
  <input type="text" data-widget="input" data-bind="name" />
  <input type="button" data-widget="button" data-action="exampleButtonClicked" value="Submit" />
  <span data-widget="label" data-bind="message"></span>

  <script src="RTJS/init.js" async defer></script>
</div>
```

## Known issues
 * RTJS might asynchronously load a lot of files (30+) while in production. Until HTTP/2 becomes widely adopted, we're looking into using LocalStorage as a script cache, to improve TCP performance.
 * While bootstrappers are useful to group initializing controllers, they're in most situations redundant. They were  originally conceived as a means for controllers to communicate with one another, and while they're still a feasible solution to cross-controller communication, we've found it easier to use shared models instead. They remain for compatibility reasons, pending deletion.
 * It's not possible to programmatically change value formatters.
