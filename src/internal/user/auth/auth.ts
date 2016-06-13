var AUTH_COOKIE_NAME = 'auth.sid';

module.exports = {
  allowCrossOrigin: AllowCrossOrigin
};

function AllowCrossOrigin(req, res, next) {
  var session = req.session;
  res.set('Access-Control-Allow-Origin', '*');
  next();
}