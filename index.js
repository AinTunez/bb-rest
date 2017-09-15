var request = require('request');
exports.restApp = function (origin, key, secret, tokenRefreshRate) {
    var $blackboard = this;	    
    $blackboard._key = key;
    $blackboard._secret = secret;
    $blackboard._auth = 'Basic ' + new Buffer($blackboard._key + ':' + $blackboard._secret).toString('base64')},
    $blackboard._origin = origin;	
    $blackboard._token = {accessToken: void 0, time: 0};
    $blackboard._hasToken = function () {
        var p = $blackboard._token;
        return p.accessToken && (Date.now() - p.time < $blackboard._tokenRefresh);
    };
    $blackboard._token = function (callback) {
        if (typeof callback !== 'function') callback = (body) => console.log(body);
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
                $blackboard._token = {accessToken: body.access_token, time: Date.now()}
                callback();
            }
        });
    };
    $blackboard._ajax = function (method, endpoint, body, callback) {
        if (typeof callback !== 'function') callback = (body) => console.log(body);
        $blackboard._token(function () {							            
            var options = {
                method: method,
                url:  encodeURI($blackboard._origin + '/learn/api/public/v1/' + endpoint.replace(/^\//, '')),                
                headers: {
                    Authorization: 'Bearer ' + $blackboard._token.accessToken,
                    'content-type':'application/json'
                },
                body: body,
                json: true
            };            
            request(options, (err, res, body) => err ? console.error(err) : callback(body));
        });
    };

    ['get','post','patch','delete','put'].forEach(function (method) {
        $blackboard[method] = function (endpoint, options) {
            options = options || {};
            var body = options.body || options.data;
            var callback = options.callback || options.complete;
            $blackboard._ajax(method, endpoint, body, callback);            
        };
    });
};