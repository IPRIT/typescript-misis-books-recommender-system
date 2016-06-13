var SecurityGateway_1 = require("./SecurityGateway");
var Promise = require('es6-promise').Promise;
/**
 * Created by Александр on 13.06.2016.
 */
var TokenChecker = (function () {
    function TokenChecker() {
    }
    TokenChecker.check = function (rsToken) {
        var apiUrl = TokenChecker.API_BASE + TokenChecker.API_RATES_URI;
        return SecurityGateway_1.SecurityGateway.getInstance()
            .sendUserRequest(apiUrl, rsToken);
    };
    TokenChecker.API_BASE = 'http://twosphere.ru/rs-api';
    TokenChecker.API_RATES_URI = '/checkToken';
    return TokenChecker;
})();
exports.TokenChecker = TokenChecker;
//# sourceMappingURL=TokenChecker.js.map