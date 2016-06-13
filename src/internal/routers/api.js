var RecommendationsEvaluator_1 = require("../RecommenderSystem/Forecast/RecommendationsEvaluator");
var TokenChecker_1 = require("../RecommenderSystem/Security/TokenChecker");
var express = require('express');
var stream = require('stream');
var router = express.Router();
var app = express();
router.all('/', function (req, res) {
    res.json({
        'current state': 'API RUNNING'
    });
});
router.get('/getRecommendations', function (req, res) {
    var rsToken = req.query.rs_token;
    var count = Math.max(Math.min(req.query.count || 10, 200), 0);
    var offset = Math.max(req.query.offset || 0, 0);
    var category = +req.query.category || 1;
    TokenChecker_1.TokenChecker.check(rsToken)
        .then(function (response) {
        if (!response || response.error) {
            return res.json(response);
        }
        var userId = response.user && response.user.id;
        var recSystem = new RecommendationsEvaluator_1.RecommendationsEvaluator(rsToken);
        recSystem.getRecommendations(userId, count, offset, category)
            .then(function (result) {
            res.json(result);
        })
            .catch(function (err) {
            res.json({
                error: err.toString()
            });
        });
    });
});
module.exports = router;
//# sourceMappingURL=api.js.map