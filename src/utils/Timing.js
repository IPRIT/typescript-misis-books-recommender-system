var Timing = (function () {
    function Timing() {
    }
    Timing.prototype.proxy = function (_proxyFunction) {
        return {
            _proxyFunction: _proxyFunction
        };
    };
    Timing.prototype.zone = function (potentiallyCallableFunction) {
        this.start = new Date();
        if (typeof potentiallyCallableFunction === 'function') {
            potentiallyCallableFunction();
        }
        else {
            potentiallyCallableFunction._proxyFunction();
        }
        return this;
    };
    Object.defineProperty(Timing.prototype, "elapsed", {
        get: function () {
            if (this.start) {
                return new Date().getTime() - this.start.getTime();
            }
            return new Date().getTime();
        },
        enumerable: true,
        configurable: true
    });
    return Timing;
})();
exports.default = Timing;
//# sourceMappingURL=Timing.js.map