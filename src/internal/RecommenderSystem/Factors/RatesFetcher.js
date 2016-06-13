var SecurityGateway_1 = require("../Security/SecurityGateway");
var async = require('async');
var Promise = require('es6-promise').Promise;
var RatesFetcher = (function () {
    function RatesFetcher() {
        this.API_BASE = 'http://twosphere.ru/rs-api';
        this.API_RATES_URI = '/getRates';
        this.maxRatingsPerRequest = 5000;
        this.rates = [];
    }
    RatesFetcher.prototype.getSystemMetaInfo = function () {
        var apiUrl = this.API_BASE;
        return SecurityGateway_1.SecurityGateway.getInstance()
            .sendSystemRequest(apiUrl)
            .then(function (response) {
            return response.result;
        })
            .catch(function (err) {
            console.error('[Fetching system meta info] Error:', err);
        });
    };
    RatesFetcher.prototype.getAllRates = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var ratingsNumber = _this.metaInfo.rates;
            var breakdownNumber = Math.ceil(ratingsNumber / _this.maxRatingsPerRequest);
            var breakdownRange = [];
            for (var i = 0; i < breakdownNumber; ++i) {
                breakdownRange.push(i * _this.maxRatingsPerRequest);
            }
            var gotItems = [];
            var apiUrl = _this.API_BASE + _this.API_RATES_URI;
            var queue = async.queue(function (offset, callback) {
                SecurityGateway_1.SecurityGateway.getInstance().sendSystemRequest(apiUrl, {
                    offset: offset,
                    count: _this.maxRatingsPerRequest
                }).then(function (resp) { return resp.result.items; })
                    .then(function (items) {
                    gotItems.push.apply(gotItems, items);
                    console.log("Got items: " + items.length);
                    callback();
                });
            }, 3);
            queue.drain = function () {
                resolve(gotItems);
            };
            queue.push(breakdownRange, function (err) {
                if (err) {
                    reject(err);
                }
            });
        });
    };
    RatesFetcher.prototype.initialize = function () {
        var _this = this;
        return this.getSystemMetaInfo()
            .then(function (metaInfo) {
            _this.metaInfo = metaInfo;
            return _this.getAllRates();
        })
            .then(function (rates) {
            _this.rates = rates;
            console.log("Total got rates: " + rates.length);
            return rates;
        })
            .catch(function (err) {
            console.log('[Unknown error]:', err);
        });
    };
    return RatesFetcher;
})();
exports.RatesFetcher = RatesFetcher;
//# sourceMappingURL=RatesFetcher.js.map