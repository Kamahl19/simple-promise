<a href="https://promisesaplus.com/">
  <img src="https://promisesaplus.com/assets/logo-small.png"
       alt="Promises/A+ logo"
       title="Promises/A+ 1.1 compliant"
       align="right" />
</a>

# Simple Promise

[Promises/A+][aplus] compliant JavaScript promise implementation

[aplus]: https://promisesaplus.com

### Installation

```
npm install simple-promise
```

### Usage

```javascript
var Promise = require('simple-promise');

new Promise((resolve, reject) => {
    resolve('success');
}).then((result) => {
    console.log(result);
});
```
