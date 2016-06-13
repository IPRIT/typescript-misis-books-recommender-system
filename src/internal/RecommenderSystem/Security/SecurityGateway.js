var Config_1 = require("./Config");
/**
 * Created by Александр on 12.06.2016.
 */
var request = require('request-promise');
var SecurityGateway = (function () {
    function SecurityGateway() {
    }
    SecurityGateway.getInstance = function () {
        if (SecurityGateway.instance && SecurityGateway.instance instanceof SecurityGateway) {
            return SecurityGateway.instance;
        }
        return (SecurityGateway.instance = new SecurityGateway());
    };
    SecurityGateway.prototype.sendUserRequest = function (uri, token, params) {
        if (params === void 0) { params = {}; }
        params.rs_token = token;
        params.token = Config_1.CONFIG.GATEWAY_TOKEN;
        var options = {
            uri: uri,
            qs: params,
            json: true // Automatically parses the JSON string in the response
        };
        return request(options);
    };
    SecurityGateway.prototype.sendSystemRequest = function (uri, params) {
        if (params === void 0) { params = {}; }
        params.token = Config_1.CONFIG.GATEWAY_TOKEN;
        var options = {
            uri: uri,
            qs: params,
            json: true // Automatically parses the JSON string in the response
        };
        return request(options);
    };
    SecurityGateway.instance = null;
    return SecurityGateway;
})();
exports.SecurityGateway = SecurityGateway;
//# sourceMappingURL=SecurityGateway.js.map