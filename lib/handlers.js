
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

function index(req, res){
  render(res, 'overview.jade');
}


exports.index = index;
exports.login = login;