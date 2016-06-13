var FactorsComputation_1 = require("./RecommenderSystem/Factors/FactorsComputation");
var FactorsStore_1 = require("./RecommenderSystem/Factors/FactorsStore");
function serverInit() {
    var fc = new FactorsComputation_1.FactorsComputation();
    fc.initialize()
        .then(function () {
        return fc.learn();
    })
        .then(function () {
        FactorsStore_1.FactorsStore.getInstance()
            .store({
            mu: fc.mu,
            usersBasePredictor: fc.usersBasePredictor,
            itemsBasePredictor: fc.itemsBasePredictor,
            usersFeatureVectors: fc.usersFeatureVectors,
            itemsFeatureVectors: fc.itemsFeatureVectors,
            items: fc.itemsInfo
        });
        console.log('Recommender model is ready for forecasting');
    })
        .catch(function (err) {
        throw err;
    });
}
exports.default = serverInit;
//# sourceMappingURL=init.js.map