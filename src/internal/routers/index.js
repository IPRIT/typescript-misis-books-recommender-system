var express = require('express');
var router = express.Router();
router.get('/', function (req, res) {
    console.log(1);
    res.render('index/index');
});
module.exports = router;
//# sourceMappingURL=index.js.map