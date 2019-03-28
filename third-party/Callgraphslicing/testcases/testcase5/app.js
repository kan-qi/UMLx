
var express = require('express');
var mongoose = require('../../../lib');

var uri = 'mongodb://localhost/mongoose-shared-connection';
global.db = mongoose.createConnection(uri);

var routes = require('./routes');

var app = express();
get('/', routes.home);
get('/insert', routes.insert);
get('/name', routes.modelName);

listen(8000, function() {
  console.log('listening on http://localhost:8000');
});

home();
modelName();
init();