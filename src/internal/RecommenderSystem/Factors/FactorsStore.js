var FactorsStore = (function () {
    function FactorsStore() {
        this.modelState = null;
    }
    FactorsStore.getInstance = function () {
        if (FactorsStore.instance && FactorsStore.instance instanceof FactorsStore) {
            return FactorsStore.instance;
        }
        return (FactorsStore.instance = new FactorsStore());
    };
    FactorsStore.prototype.store = function (modelState) {
        this.modelState = modelState;
        //todo: save/restore snapshot in persistent storage
        //this.snapshot()
    };
    Object.defineProperty(FactorsStore.prototype, "state", {
        get: function () {
            return this.modelState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FactorsStore.prototype, "isReady", {
        get: function () {
            return this.modelState != null;
        },
        enumerable: true,
        configurable: true
    });
    FactorsStore.prototype.userExists = function (userKey) {
        return !!this.modelState.usersFeatureVectors[userKey];
    };
    FactorsStore.instance = null;
    return FactorsStore;
})();
exports.FactorsStore = FactorsStore;
//# sourceMappingURL=FactorsStore.js.map