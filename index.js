var request = require('request');
exports.RestApp = function (origin, key, secret) {
    var $blackboard = this;	    
    $blackboard._key = key;
    $blackboard._secret = secret;
    $blackboard._auth = 'Basic ' + new Buffer($blackboard._key + ':' + $blackboard._secret).toString('base64');
    $blackboard._origin = origin;	
    $blackboard._token = function (callback) {        
        var options = {
            method: 'post',
            url: $blackboard._origin + '/learn/api/public/v1/oauth2/token',                
            headers: {Authorization: $blackboard._auth},
            form: {grant_type: 'client_credentials'},
            json: true
        };            
        var req = request(options, function (err, res, body) {                
            if (err) {
                console.error(err);
            } else {                
                $blackboard._token.accessToken = body.access_token;
                if (callback) callback();
            }
        });
    };
    $blackboard._token.accessToken = '';
    $blackboard._ajaxInner = function (method, endpoint, data, callback, hasFailed) {							            
        var options = {
            method: method,
            url:  encodeURI($blackboard._origin + '/learn/api/public/v1/' + endpoint.replace(/^\//, '')),                
            headers: {
                Authorization: 'Bearer ' + $blackboard._token.accessToken,
                'content-type':'application/json'
            },
            body: data,
            json: true
        };            
        request(options, function (err, res, body) {            
            var msg = (body || {}).message;
            if (msg === 'API request is not authenticated.' || msg === 'Bearer token is invalid') {
                if (!hasFailed) {
                    $blackboard._token(() => $blackboard._ajaxInner(method, endpoint, data, callback, true));
                } else {
                    console.error('Authentication failed.');
                }
            } else {
                callback(err, res, body);
            }
        });
    };
    $blackboard._ajax = function (method, endpoint, data, callback) {
        if (typeof callback !== 'function') callback = (err, res, body) => console.log(err || body);
        var innerFn = () => $blackboard._ajaxInner(method, endpoint, data, callback);
        $blackboard._token.accessToken ? $blackboard._token(innerFn) : innerFn();
    };
    ['get','post','patch','delete','put'].forEach(function (method) {
        $blackboard[method] = function (endpoint, options) {
            options = options || {};
            if (typeof options === 'function') {
                var callback = options;
                $blackboard._ajax(method, endpoint, void 0, callback);
            } else {
                var data = options.body || options.data;
                var callback = options.callback || options.complete;
                $blackboard._ajax(method, endpoint, data, callback);
            }
        };
    });    
};
exports.restApp = exports.RestApp;