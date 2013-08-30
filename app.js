
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var parse = require('./handlers/regexp.parse');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);


app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use("/regexp/parse/", parse.map);


app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req,res) {
    res.writeHead(302, {'Location': 'reg-exp-test.html'});
    res.end();
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
