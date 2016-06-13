var FactorsStore_1 = require("../Factors/FactorsStore");
var FactorsComputation_1 = require("../Factors/FactorsComputation");
var ItemsCollator_1 = require("./ItemsCollator");
var Promise = require('es6-promise').Promise;
/**
 * Created by Александр on 12.06.2016.
 */
var RecommendationsEvaluator = (function () {
    function RecommendationsEvaluator(rsToken) {
        this.rsToken = rsToken;
        this.store = FactorsStore_1.FactorsStore.getInstance();
    }
    RecommendationsEvaluator.prototype.getRecommendations = function (userId, count, offset, category) {
        var _this = this;
        if (count === void 0) { count = 10; }
        if (offset === void 0) { offset = 0; }
        if (category === void 0) { category = 1; }
        return new Promise(function (resolve, reject) {
            if (!_this.store.isReady) {
                return reject(new Error('Recommender model is not ready'));
            }
            else if (!_this.store.userExists(_this.getUserKeyById(userId))) {
                return reject(new Error('Recommender model does not contain this user'));
            }
            var forecastCollection = _this.computeForecastCollection(userId, category);
            var itemsId = forecastCollection.map(function (item) { return item.item_id; })
                .slice(offset, offset + count);
            var collator = new ItemsCollator_1.ItemsCollator();
            collator.collateItems(itemsId, category, _this.rsToken)
                .then(function (result) {
                if (result.items) {
                    result.items = result.items.map(function (item, index) {
                        item.forecastRate = forecastCollection[index].forecastRate;
                        return item;
                    });
                }
                result.all_items_count = forecastCollection.length;
                resolve(result);
            })
                .catch(function (err) { return reject(err); });
        });
    };
    RecommendationsEvaluator.prototype.computeForecastCollection = function (userId, category) {
        var _this = this;
        if (category === void 0) { category = 1; }
        var state = this.store.state;
        var itemsKeyList = Object.keys(state.itemsFeatureVectors)
            .filter(function (itemKey) {
            return category === 1 || state.items[itemKey].category === category;
        });
        var userKey = this.getUserKeyById(userId);
        var forecastCollection = itemsKeyList.map(function (itemKey) {
            var forecastRate = _this.computeForecast(userKey, itemKey);
            var curCategory = state.items[itemKey].category;
            if (category === 1 && curCategory > 2) {
                forecastRate *= 0.8;
            }
            return {
                item_id: state.items[itemKey].id,
                forecastRate: forecastRate
            };
        });
        forecastCollection.sort(function (a, b) { return b.forecastRate - a.forecastRate; });
        return forecastCollection;
    };
    RecommendationsEvaluator.prototype.computeForecast = function (userKey, itemKey) {
        var state = this.store.state;
        return state.mu + state.usersBasePredictor[userKey] + state.itemsBasePredictor[itemKey] + this.dotFactors(userKey, itemKey);
    };
    RecommendationsEvaluator.prototype.dotFactors = function (userKey, itemKey) {
        var state = this.store.state;
        return state.usersFeatureVectors[userKey].reduce(function (res, factor, f) {
            return res + factor * state.itemsFeatureVectors[itemKey][f];
        }, 0);
    };
    RecommendationsEvaluator.prototype.getUserKeyById = function (userId) {
        return FactorsComputation_1.FactorsComputation.indexPrefix + 'user_' + userId;
    };
    RecommendationsEvaluator.prototype.getItemKeyById = function (itemId) {
        return FactorsComputation_1.FactorsComputation.indexPrefix + 'item_' + itemId;
    };
    return RecommendationsEvaluator;
})();
exports.RecommendationsEvaluator = RecommendationsEvaluator;
//# sourceMappingURL=RecommendationsEvaluator.js.map