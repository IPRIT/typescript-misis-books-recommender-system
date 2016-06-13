var RatesFetcher_1 = require("./RatesFetcher");
var Promise = require('es6-promise').Promise;
/**
 * Created by Александр on 12.06.2016.
 */
var FactorsComputation = (function () {
    function FactorsComputation() {
        this.dataSetUsers = {};
        this.dataSetItems = {};
        this.dataSetMatrix = {};
        this.itemsInfo = {};
        this.debug = true;
        this.features = 50;
        this.lambda = 0.05;
        this.eta = 0.01;
        this.mu = 0;
        this.usersBasePredictor = {};
        this.itemsBasePredictor = {};
        this.usersFeatureVectors = {};
        this.itemsFeatureVectors = {};
        this.iterationNumber = 0;
        this.error = 0;
        this.rmse = 1;
        this.rmseOld = 0;
        this.threshold = 0.01;
        this.startUserFactorValue = 0.1;
        this.startItemFactorValue = 0.05;
        this.rates = [];
    }
    FactorsComputation.prototype.initialize = function () {
        var _this = this;
        var fetcher = new RatesFetcher_1.RatesFetcher();
        return fetcher.initialize()
            .then(function (rates) {
            _this.rates = rates;
            _this.createDataSet();
            _this.initializeFactors();
        });
    };
    FactorsComputation.prototype.createDataSet = function () {
        var _this = this;
        this.rates.forEach(function (rate) {
            _this.setRate(rate);
        });
    };
    FactorsComputation.prototype.initializeFactors = function () {
        var _this = this;
        Object.keys(this.dataSetUsers).forEach(function (userKey) {
            _this.usersBasePredictor[userKey] = 0;
            for (var f = 0; f < _this.features; f++) {
                if (!_this.usersFeatureVectors[userKey]) {
                    _this.usersFeatureVectors[userKey] = [];
                }
                _this.usersFeatureVectors[userKey].push(_this.startUserFactorValue);
            }
        });
        Object.keys(this.dataSetItems).forEach(function (itemKey) {
            _this.itemsBasePredictor[itemKey] = 0;
            for (var f = 0; f < _this.features; f++) {
                if (!_this.itemsFeatureVectors[itemKey]) {
                    _this.itemsFeatureVectors[itemKey] = [];
                }
                _this.itemsFeatureVectors[itemKey].push(_this.startItemFactorValue * f);
            }
        });
    };
    FactorsComputation.prototype.getUserKeyById = function (userId) {
        return FactorsComputation.indexPrefix + 'user_' + userId;
    };
    FactorsComputation.prototype.getItemKeyById = function (itemId) {
        return FactorsComputation.indexPrefix + 'item_' + itemId;
    };
    FactorsComputation.prototype.addRateForUser = function (rate) {
        var userKey = this.getUserKeyById(rate.user_id);
        if (!this.dataSetUsers[userKey]) {
            this.dataSetUsers[userKey] = [];
        }
        this.dataSetUsers[userKey].push(rate);
    };
    FactorsComputation.prototype.addRateForItem = function (rate) {
        var itemKey = this.getItemKeyById(rate.item_id);
        if (!this.dataSetItems[itemKey]) {
            this.dataSetItems[itemKey] = [];
        }
        this.dataSetItems[itemKey].push(rate);
    };
    FactorsComputation.prototype.getUserRatesVectorById = function (userId) {
        var userKey = this.getUserKeyById(userId);
        return this.dataSetUsers[userKey] || [];
    };
    FactorsComputation.prototype.getItemRatesVectorById = function (itemId) {
        var itemKey = this.getItemKeyById(itemId);
        return this.dataSetItems[itemKey] || [];
    };
    FactorsComputation.prototype.setRate = function (rate) {
        var userKey = this.getUserKeyById(rate.user_id), itemKey = this.getItemKeyById(rate.item_id);
        if (!this.dataSetMatrix[userKey]) {
            this.dataSetMatrix[userKey] = {};
        }
        if (!this.itemsInfo[itemKey]) {
            this.itemsInfo[itemKey] = {
                id: rate.item_id,
                category: rate.category
            };
        }
        this.dataSetMatrix[userKey][itemKey] = rate;
        this.addRateForUser(rate);
        this.addRateForItem(rate);
    };
    FactorsComputation.prototype.learn = function () {
        var _this = this;
        var eps = 1e-6;
        return new Promise(function (resolve, reject) {
            while (Math.abs(_this.rmseOld - _this.rmse) > eps || _this.iterationNumber < 10000) {
                _this.rmseOld = _this.rmse;
                _this.rmse = 0;
                Object.keys(_this.dataSetMatrix).forEach(function (userKey) {
                    Object.keys(_this.dataSetMatrix[userKey]).forEach(function (itemKey) {
                        var forecastRate = _this.computeForecast(userKey, itemKey);
                        _this.error = _this.dataSetMatrix[userKey][itemKey].rate - forecastRate;
                        _this.rmse += _this.error * _this.error; // computing root mean square deviation (error)
                        _this.mu += _this.eta * _this.error; // reducing error effect
                        _this.usersBasePredictor[userKey] += _this.eta * (_this.error - _this.lambda * _this.usersBasePredictor[userKey]);
                        _this.itemsBasePredictor[itemKey] += _this.eta * (_this.error - _this.lambda * _this.itemsBasePredictor[itemKey]);
                        for (var f = 0; f < _this.features; f++) {
                            _this.usersFeatureVectors[userKey][f] += _this.eta * (_this.error * _this.itemsFeatureVectors[itemKey][f] - _this.lambda * _this.usersFeatureVectors[userKey][f]);
                            _this.itemsFeatureVectors[itemKey][f] += _this.eta * (_this.error * _this.usersFeatureVectors[userKey][f] - _this.lambda * _this.itemsFeatureVectors[itemKey][f]);
                        }
                    });
                });
                _this.rmse = Math.sqrt(_this.rmse / _this.rates.length);
                if (typeof _this.rmse !== 'number') {
                    reject(new Error("Rmse value is not finite"));
                }
                if (_this.debug) {
                    console.log("[Epoch " + ++_this.iterationNumber + "]: rmse = " + _this.rmse.toFixed(8) + ".");
                }
            }
            resolve();
        });
    };
    FactorsComputation.prototype.computeForecast = function (userKey, itemKey) {
        return this.mu + this.usersBasePredictor[userKey] + this.itemsBasePredictor[itemKey] + this.dotFactors(userKey, itemKey);
    };
    FactorsComputation.prototype.dotFactors = function (userKey, itemKey) {
        var _this = this;
        return this.usersFeatureVectors[userKey].reduce(function (res, factor, f) {
            return res + factor * _this.itemsFeatureVectors[itemKey][f];
        }, 0);
    };
    FactorsComputation.indexPrefix = '_index_';
    return FactorsComputation;
})();
exports.FactorsComputation = FactorsComputation;
//# sourceMappingURL=FactorsComputation.js.map