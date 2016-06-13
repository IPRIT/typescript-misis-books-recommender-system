var AUTH_COOKIE_NAME = 'auth.sid';
module.exports = {
    allowCrossOrigin: AllowCrossOrigin
};
function AllowCrossOrigin(req, res, next) {
    var session = req.session;
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Key');
    next();
}
//# sourceMappingURL=auth.js.map