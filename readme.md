Simple vue.js based html reporter for cucumber projects.

### Function params
|name|type|mandatory|default|description|
|-|-|-|-|-|
|json|string|M||path to cucumber json|
|targetFolder|string|M||path where result html will be stored|

### How to use
```javascript
const HTMLReporter = require("@cucumber-e2e/html-reporter");

HTMLReporter.generate({
    json: path.resolve(pathToJson),
    targetFolder: path.resolve(reportPath),
});
```

![Example Report](./docs/exaple.png)
