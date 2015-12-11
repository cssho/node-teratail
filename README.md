# node-teratail
teratail API client library for node.js

[![NPM](https://nodei.co/npm/teratail.png)](https://nodei.co/npm/teratail/)

```javascript
var Teartail = require('teratail');

var client = new Teartail({
  bearer_token: ''
});

var params = {};
client.get('users/teratail', params, function(error, tweets, response){
  if (!error) {
    console.log(tweets);
  } else {
    console.log(error);
  }
});
```