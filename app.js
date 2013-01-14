var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , sessionConnections = 0;
  global.root = process.cwd() + '/';

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.compress());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({keepExtensions: true}));
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
  app.use(require('less-middleware')({ src: __dirname + '/public', compress: true, optimization: 2 }));
  app.use(express.static(path.join(__dirname, 'public')));
  console.log('development mode');
});

app.configure('production', function(){
  app.use(express.static(path.join(__dirname, 'public')));
  console.log('production mode');
});

//VIEWS
app.get('/', routes.index);
app.get('/views/:view.html', routes.views);

//COLLECTION CONTROLLERS
var Users = require('./controllers/users')
, Votes = require('./controllers/votes')
, Voters = require('./controllers/voters')
, Settings = require('./controllers/settings');

//REST
app.get('resources/users', Users.index);
app.get('resources/user/:id', Users.show);

var users = app.resource('resources/users', Users)
, votes = app.resource('resources/votes', Votes)
, voters = app.resource('resources/voters', Voters)
, settings = app.resource('resources/settings', Settings);
//users.add(votes);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});