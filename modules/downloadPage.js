const request = require('request');
const configurations = require('./configurations');

module.exports = (uri) => {
    console.log(uri);
    return new Promise((resolve, reject) => {
        var username = configurations.proxy.username;
        var password = configurations.proxy.password;
        var port = 22225;
        var session_id = (1000000 * Math.random()) | 0;
        var super_proxy = 'http://' + username + '-session-' + session_id + ':' + password + '@zproxy.luminati.io:' + port;
        request({
            uri: uri,
            proxy: super_proxy,
            method: 'GET',
            headers: configurations.headers.next()
        }, (error, response, body) => {
            if (error != undefined) {
                reject(error);
            }
            resolve(body);
        });
    });
};
