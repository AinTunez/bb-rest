var request = require('request');
exports.app = function (origin, key, secret, tokenRefresh) {
    var $blackboard = this;	    
    $blackboard._key = key;
    $blackboard._secret = secret;
    $blackboard._origin = origin;	
    $blackboard._token = {accessToken: void 0, time: 0};    
    $blackboard._tokenRefresh = (Number(tokenRefresh) || 10) * 60000;
    $blackboard._hasToken = function () {
        var p = $blackboard._token;
        return p.accessToken && (Date.now() - p.time < $blackboard._tokenRefresh);
    };
    $blackboard._token = function (callback) {
        if (typeof callback !== 'function') callback = (body) => console.log(body);
        if ($blackboard._hasToken()) {
            callback();
        } else {            
            if (typeof callback !== 'function') callback = () => void 0;
            var options = {
                method: 'post',
                url: $blackboard._origin + '/learn/api/public/v1/oauth2/token',                
                headers: {Authorization: 'Basic ' + new Buffer($blackboard._key + ':' + $blackboard._secret).toString('base64')},
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

        }		
    };
    $blackboard._ajax = function (method, endpoint, form, body, callback) {
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
                form: form,
                json: true
            };            
            request(options, (err, res, body) => err ? console.error(err) : callback(body));
        });
    };

    ['get','post','patch','delete'].forEach(function (method) {
        $blackboard[method] = function (endpoint, options) {
            options = options || {};
            var form = options.form;
            var body = options.body || options.data;
            var callback = options.callback || options.complete;
            $blackboard._ajax(method, endpoint, form, body, callback);            
        };
    });
};