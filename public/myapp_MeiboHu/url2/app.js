var express = require ('express');
var app = express ();

var MongoClient = require ('mongodb').MongoClient;
var url_local = 'mongodb://localhost:27017/';

// //list all collections
// app.get('/list', (req, res) => {
//     MongoClient.connect(url_local, function(err, db) {
//         if (err) throw err;
//         var dbo = db.db("testdb");
//         dbo.collection("estimations").find({}).toArray(function(err, result) {
//             if (err) throw err;
//             console.log(result);
//             res.json(result);
//             db.close();
//         });
//     });
// });

// //list by date creation
// app.get('/listByDateCreate', (req, res) => {
//     MongoClient.connect(url_local, function(err, db) {
//         if (err) throw err;
//         var dbo = db.db("testdb");
//         var mysort = { Date_created : 1 };       //sort it by data create ascending
//         dbo.collection("estimations").find().sort(mysort).toArray(function(err, result) {
//             if (err) throw err;
//             console.log(result);
//             res.json(result);
//             db.close();
//         });
//     });
// });

// //list by insert time
// app.get('/listByInsertTime', (req, res) => {
//     MongoClient.connect(url_local, function(err, db) {
//         if (err) throw err;
//         var dbo = db.db("testdb");
//         var mysort = { _id : 1 };
//         dbo.collection("estimations").find().sort(mysort).toArray(function(err, result) {
//             if (err) throw err;
//             console.log(result);
//             res.json(result);
//             db.close();
//         });
//     });
// });

// //query by key word
// app.get('/listByKeyWord', (req, res) => {
//     MongoClient.connect(url_local, function(err, db) {
//         if (err) throw err;
//         var dbo = db.db("testdb");
//         var query = { model_name: 'ucp'};
//         dbo.collection("estimations").find(query).toArray(function(err, result) {
//             if (err) throw err;
//             console.log(result);
//             res.json(result);
//             db.close();
//         });
//     });
// });

// app.post('/', (req, res) => {
//     MongoClient.connect(url_local, function(err, db) {
//         if (err) throw err;
//         var dbo = db.db("testdb");
//         dbo.collection("estimations").insertOne({
//             name: req.body.name,
//             age: req.body.age
//         },
//         function(err, result) {
//             if (err) throw err;
//             res.json(result);
//             db.close();
//         });
//     });
// });

var bodyParser = require ('body-parser');
// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded ({extended: false});

app.use (express.static ('public'));
app.get ('/', function (req, res) {
  res.sendFile (__dirname + '/' + 'index.htm');
});

//list all models
app.post ('/list', urlencodedParser, function (req, res) {
  MongoClient.connect (url_local, function (err, db) {
    if (err) throw err;
    var dbo = db.db ('testdb');
    dbo.collection ('estimations').find ({}).toArray (function (err, result) {
      if (err) throw err;
      console.log (result);
      res.json (result);
      db.close ();
    });
  });
});

//list all models by Date_created
app.post ('/listByDateCreate', urlencodedParser, function (req, res) {
  MongoClient.connect (url_local, function (err, db) {
    if (err) throw err;
    var dbo = db.db ('testdb');
    var mysort = {Date_created: 1}; //sort it by data create ascending
    dbo
      .collection ('estimations')
      .find ()
      .sort (mysort)
      .toArray (function (err, result) {
        if (err) throw err;
        console.log (result);
        res.json (result);
        db.close ();
      });
  });
});

//list all models by insert time(id)
app.post ('/listByInsertTime', urlencodedParser, function (req, res) {
  MongoClient.connect (url_local, function (err, db) {
    if (err) throw err;
    var dbo = db.db ('testdb');
    var mysort = {_id: 1};
    dbo
      .collection ('estimations')
      .find ()
      .sort (mysort)
      .toArray (function (err, result) {
        if (err) throw err;
        console.log (result);
        res.json (result);
        db.close ();
      });
  });
});

//list the model by inputting name
app.post ('/queryByName', urlencodedParser, function (req, res) {
  //urlencodeParser 对req.body.name起作用
  MongoClient.connect (url_local, function (err, db) {
    if (err) throw err;
    var dbo = db.db ('testdb');

    // var query = {model_name: req.body.name};
    var st = req.body.name;
    var query = {model_name: {$regex: st}}; //vague query
    dbo
      .collection ('estimations')
      .find (query)
      .toArray (function (err, result) {
        if (err) throw err;
        console.log (result);

        res.json (result);
        db.close ();
      });
  });
});

// //list the model by inputting name
// app.post ('/queryByName', urlencodedParser, function (req, res) {
//   //urlencodeParser 对req.body.name起作用
//   MongoClient.connect (url_local, function (err, db) {
//     if (err) throw err;
//     var dbo = db.db ('testdb');
//     var query = {model_name: req.body.name};
//     dbo
//       .collection ('estimations')
//       .find (query)
//       .toArray (function (err, result) {
//         if (err) throw err;
//         console.log (result);

//         res.json (result);
//         db.close ();
//       });
//   });
// });

app.listen (3000, () => console.log ('Server running on port 3000!'));
