var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , sessionConnections = 0
  , Users = require('./controllers/users')
  , Votes = require('./controllers/votes')
  , Voters = require('./controllers/voters')
  , Settings = require('./controllers/settings');
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

//REST
app.get('resources/users', Users.index);
app.get('resources/user/:id', Users.show);

app.get ('/resources/users', Users.index);
app.get ('/resources/users/:id', Users.load, Users.show);
app.post('/resources/users', Users.create);
app.put ('/resources/user/:id', Users.load, Users.update);

app.get ('/resources/users/:id/votes', Votes.index);
app.post('/resources/users/:id/votes', Votes.create);

app.get ('/resources/voters', Voters.index);
app.get ('/resources/voters/:id', Voters.show);
app.post('/resources/voters', Voters.create);
app.put('/resources/voters/:id', Voters.update);

app.get ('/resources/settings', Settings.index);
app.put ('/resources/settings', Settings.update);


//users.add(votes);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});