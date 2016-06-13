var SecurityGateway_1 = require("../Security/SecurityGateway");
var Promise = require('es6-promise').Promise;
/**
 * Created by Александр on 12.06.2016.
 */
var ItemsCollator = (function () {
    function ItemsCollator() {
        this.API_BASE = 'http://twosphere.ru/rs-api';
        this.API_RATES_URI = '/collateItems';
    }
    ItemsCollator.prototype.collateItems = function (items, category, rsToken) {
        var apiUrl = this.API_BASE + this.API_RATES_URI;
        return SecurityGateway_1.SecurityGateway.getInstance()
            .sendUserRequest(apiUrl, rsToken, {
            items: items.join(','),
            category: category
        });
    };
    return ItemsCollator;
})();
exports.ItemsCollator = ItemsCollator;
//# sourceMappingURL=ItemsCollator.js.map