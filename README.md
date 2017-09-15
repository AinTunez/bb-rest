# bb-rest

This module allows for easy interaction with Blackboard Learn REST APIs in application code.

## Installation
Using npm:

    npm install bb-rest
    
## Setup

Add the module:

```javascript
const {restApp} = require('bb-rest');
```
Construct a new `restApp` object:

```javascript
var origin = 'https://example.blackboard.com';
var key = 'myAppKey';
var secret = 'myAppSecret';
var myApp = new restApp(origin, key, secret);
```
All authentication is handled automatically by the object, refreshing the access token as needed.

## Usage

`restApp` objects have five methods corresponding to the HTTP verbs `get`, `post`, `patch`, `put`, and `delete`. All operate on the same syntax:

```javascript
myApp[method](path [string], options [object]);
```

The `path` argument finds the main API directory automatically. You only need to include the path after `/learn/api/public/v1/`. 

The `options` argument takes only two properties:
1. `data`: the object to be sent with the request.
2. `complete`: the method to be performed upon the response. It follows the same syntax as the `callback` argument of the npm [request](https://www.npmjs.com/package/request) module. If undefined, it logs the body to the console.

A `PATCH` request to update an existing course might look like this:

```javascript
myApp.patch('courses/courseId:myCourse', {
  data: {name: 'New Name', description: 'This course has been renamed.'},
  complete: function (error, response, body) {
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', body);
  }
});
```
