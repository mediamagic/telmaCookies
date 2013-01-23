var cluster = require('cluster'),
numCPUs = require('os').cpus().length;
if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died');
    cluster.fork();
  });
} else {
  var express = require('express')
    , routes = require('./routes')
    , admin = require('./routes/admin')
    , http = require('http')
    , path = require('path')
    , sessionConnections = 0
    , Users = require('./controllers/users')
    , Votes = require('./controllers/votes')
    , Voters = require('./controllers/voters')
    , Settings = require('./controllers/settings')
    , Statistics = require('./controllers/statistics')
    , PowerUsers = require('./controllers/PowerUsers')
    , Api = require('./controllers/api')
    , MemcachedStore = require('connect-memcached')(express);
    global.root = process.cwd() + '/';

  var app = express();

  app.configure(function(){
    app.set('port', process.env.PORT || 8080);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.compress());
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.cookieParser()); 
    app.use(express.session({ secret: "p@5HqrL.v[&kKq/Q", store: new MemcachedStore }));
    app.use(express.bodyParser({keepExtensions: true}));
    app.use(express.methodOverride());
    app.use(express.csrf());
    app.use(function(req, res, next){
      var token = req.session._csrf
      , cookie = req.cookies['csrf.token']
      , port = (app.get('port') == 80 || app.get('port') ==443) ? '' : ':'+app.get('port');
      if (token && cookie !== token)
        res.cookie('csrf.token', token);
      res.locals.requested_url = req.protocol + '://' + req.host  +  port + req.path;
      next();
    });
    app.use(app.router);
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
    app.use(require('less-middleware')({ src: __dirname + '/public', compress: true, optimization: 2 }));
    app.use(express.static(path.join(__dirname, 'public')));
    console.log('development mode');
  });

  app.configure('production', function(){
    var oneYear = 31557600000;
    app.use(express.static(path.join(__dirname, 'public', {maxAge: oneYear})));
    console.log('production mode');
  }); 

  //MIDDLEWARE
  function adminAuth(req, res, next){
    req.admin = false;
    if (!req.session.user_id)
      return res.redirect('/#/login?url='+res.locals.requested_url);
    req.admin = true;
    next();
  }

  //VIEWS
  app.get('/', routes.index);
  app.get('/views/:view.html', routes.views);
  app.get('/views/admin/:view.html', adminAuth, admin.views);
  app.get('/admin*', adminAuth, admin.index);
  app.get('/logout', admin.logout);

  //API
  app.post('/api/login', PowerUsers.login);
  app.get('/api/videoCheck/:id', Api.videoCheck);
  app.get('/api/createCSV', adminAuth, Api.createCSV);
  app.get('/api/createCSV/:id', adminAuth, Api.createCSV);

  //RESTful RESOURCES
  app.get ('/resources/users', Users.index);
  app.get ('/resources/users/:id', Users.load, Users.show);
  app.get ('/resources/users', Users.index);
  app.get ('/resources/users/:id', Users.load, Users.show);
  app.post('/resources/users', adminAuth, Users.create);
  app.put ('/resources/users/:id', adminAuth, Users.load, Users.update);
  app.get ('/resources/users/:id/votes', Votes.index);
  app.post('/resources/users/:id/votes', Votes.create);
  app.get ('/resources/voters', adminAuth, Voters.index);
  app.get ('/resources/voters/:id', adminAuth, Voters.show);
  app.post('/resources/voters', Voters.create);
  app.get ('/resources/settings', Settings.index);
  app.put ('/resources/settings', adminAuth, Settings.update);
  app.post('/resources/stats/:type', Statistics.create);
  app.get ('/resources/stats/:type', adminAuth, Statistics.index);

  var server = http.createServer(app);
  server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
}