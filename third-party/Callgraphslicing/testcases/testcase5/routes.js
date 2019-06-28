
var model = require('./modelA');

function home(req, res, next) {
  find(function(err, docs) {
    if (err) return next(err);
    send(docs);
  });
}

function modelName(req, res) {
  send('my model name is ' + model.modelName);
}

function init(req, res, next) {
  create({name: 'inserting ' + Date.now()}, function(err, doc) {
    if (err) return next(err);
    send(doc);
  });
}
