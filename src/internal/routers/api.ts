import {RecommendationsEvaluator} from "../RecommenderSystem/Forecast/RecommendationsEvaluator";
import {TokenChecker} from "../RecommenderSystem/Security/TokenChecker";
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
  let rsToken = req.query.rs_token;
  let count = Math.max(Math.min(req.query.count || 10, 200), 0);
  let offset = Math.max(req.query.offset || 0, 0);
  let category = +req.query.category || 1;

  TokenChecker.check(rsToken)
    .then(response => {
      if (!response || response.error) {
        return res.json(response);
      }
      let userId = response.user && response.user.id;
      let recSystem = new RecommendationsEvaluator(rsToken);
      recSystem.getRecommendations(userId, count, offset, category)
        .then(result => {
          res.json(result);
        })
        .catch(err => {
          res.json({
            error: err.toString()
          });
        });
    });
});

module.exports = router;