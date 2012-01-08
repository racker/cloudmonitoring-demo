var KeystoneClient = require('./keystone_client').KeystoneClient;

// Utility function for rendering responses
function render(res, template, data, options) {
  res.render(template,
    {user: res.req.user,
     url: res.req.originalUrl,
     emsg: res.emsg,
     data: data});
};

function login(req, res, next) {
  var redirectTo = req.param('next');
  render(res, 'login.jade', {next: redirectTo});
}

function attemptLogin(req, res, next) {
  var opts = {
                username: req.param('username'),
                password: req.param('password'),
                apikey: req.param('apikey')
              },
      redirectTo = req.param('next', '/');

  var ks = new KeystoneClient(opts);

  ks.tenantIdAndToken(function(err, result) {
    if (err) {
      res.emsg = err;
      render(res, 'login.jade', {next: redirectTo});
    }
    else {
      render(res, 'login.jade', {next: redirectTo, result: result});
    }
  });
}

function index(req, res){
  render(res, 'overview.jade');
}


exports.index = index;
exports.attemptLogin = attemptLogin;
exports.login = login;