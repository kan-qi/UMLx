var express = require('express');
var app = express();    //jade
app.set("view engine","jade")

var MongoClient = require ('mongodb').MongoClient;
var url_local = 'mongodb://localhost:27017/';

var bodyParser = require ('body-parser');
// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded ({extended: false});

app.use (express.static ('public'));
app.get ('/', function (req, res) {
  res.render('Sample');
  // res.sendFile (__dirname + '/' + 'StudentList');
});

var model;

//list all models
app.post('/list', urlencodedParser, function (req, res) {
  MongoClient.connect (url_local, function (err, db) {
    if (err) throw err;
    var dbo = db.db ('testdb');
    dbo.collection ('estimations').find ({}).toArray (function (err, result) {
      if (err) throw err;
      console.log (result);
      // res.json (result);
      model = result;
      res.render('ModelList', {title: 'Information', model: model});
      db.close ();
    });
  });
});

//list the model by inputting name, 必须用post
app.post('/queryByName', urlencodedParser, function (req, res) {
  //urlencodeParser 对req.body.name起作用
  MongoClient.connect (url_local, function (err, db) {
    if (err) throw err;
    var dbo = db.db ('testdb');

    // var query = {model_name: req.body.name};
    var st = req.body.name;
    var query = {model_name: st}; 
    dbo
      .collection ('estimations')
      .find (query)
      .toArray (function (err, result) {
        if (err) throw err;
        // console.log (result);
        for(item in result) console.log(item);
        // res.json (result);
        model = result;
        res.render('modelList', {title: 'Information', model: model});
        // res.render('cvResults', {title: 'Information', model: result});
        
        // console.log(result.dataset_name);
      });
  });
});

app.get('/queryByName/cvResults', urlencodedParser, function (req, res) {
  var item = model[0];
  res.render('cvResults', {title: 'cvResults', item: item.cvResults});
});

app.get('/queryByName/bsEstimations', urlencodedParser, function (req, res) {
  var item = model[0];
  var keys = Object.keys(item.bsEstimations);
  // console.log(keys);
  item = item.bsEstimations;
  console.log(keys);
  res.render('bsEstimations', {title: 'bsEstimations', item: item, keys: keys});
});

app.get('/queryByName/cvResults/accuracy_metrics', urlencodedParser, function (req, res) {
  var item = model[0];
  var keys = Object.keys(item.cvResults.accuracy_metrics);
  // console.log(keys);
  item = item.cvResults.accuracy_metrics;
  console.log(keys);
  res.render('accuracy_metrics', {title: 'accuracy_metrics', item: item, keys: keys});
});

app.get('/queryByName/cvResults/goodness_fit_metrics', urlencodedParser, function (req, res) {
  var item = model[0];
  var keys = Object.keys(item.cvResults.goodness_fit_metrics);
  // console.log(keys);
  item = item.cvResults.goodness_fit_metrics;
  console.log(keys);
  res.render('goodness_fit_metrics', {title: 'goodness_fit_metrics', item: item, keys: keys});
});



var server = app.listen(5000, function () {
    console.log('Node server is running..');
});

