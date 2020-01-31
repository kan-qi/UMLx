var express = require('express');
var app = express();
var fs = require("fs");
var path = require('path')
var admZip = require('adm-zip');
var umlModelExtractor = require("./UMLModelExtractor.js");
var umlFileManager = require("./UMLFileManager.js");
var umlEvaluator = require("./UMLEvaluator.js");
var umlModelInfoManager = require("./UMLModelInfoManagerMongoDB.js");
var effortPredictor = require("./EffortPredictor.js");
//var COCOMOCalculator = require("./COCOMOCalculator.js");
var multer = require('multer');
var jade = require('jade');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var cookieParser = require('cookie-parser');
var nodemailer = require('nodemailer');
var RScriptUtil = require('./utils/RScriptUtil.js');
var bodyParser = require('body-parser');
var randomstring = require("randomstring");
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = "mongodb://127.0.0.1:27017/repo_info_schema";
var unzip = require('unzip');
var rimraf = require('rimraf');
var download = require('download');
//var Worker = require('webworker-threads').Worker;
var modelInfo = {};


// //GIT API TEST
// app.get('/testgitapirepos', function(req,response){
// 	var GitHubApi = require('github')

// 	var github = new GitHubApi({
// 	})

// 	// TODO: optional authentication here depending on desired endpoints. See below in README.

// 	github.repos.getForUser({
// 	    // optional
// 	    // headers: {
// 	    //     "cookie": "blahblah"
// 	    // },
// 	  username: 'kritikavd'
// 	}, function (err, res) {
// 	  if (err) throw err
// 	  response.json(res);

// 	});
// });



// app.get('/testgitapiuser', function(req,response){
// 	var GitHubApi = require('github')

// 	var github = new GitHubApi({
// 	})

// 	github.search.users({
// 	  q: 'kvaid@usc.edu in:email'
// 	}, function (err, res) {
// 	  if (err) throw err
// 	  response.json(res);
// 	  //console.log(JSON.stringify(res))
// 	});
// });


// app.get('/testgitapionecommit', function(req,response){
// 	var GitHubApi = require('github')

// 	var github = new GitHubApi({
// 	})

// 	github.gitdata.getCommit({
// 		owner: 'kritikavd',
// 		  repo: 'Web-Tech-Assignments',
// 		  sha :'c904b7eb886086665382162ad123555efb66be35'
// 	}, function (err, res) {
// 	  if (err) throw err
// 	  response.json(res);
// 	});

// });


// app.get('/testgitapiallcommit', function(req,response){
// 	var GitHubApi = require('github')

// 	var github = new GitHubApi({
// 	})

// 	github.repos.getCommits({
// 		owner: 'kritikavd',
// 		  repo: 'node-github',
// 	}, function (err, res) {
// 	  if (err) throw err
// 	  response.json(res);
// 	});
	
// });

// app.get('/testgitapiallcommitlast', function(req,response){
// 	var GitHubApi = require('github')

// 	var github = new GitHubApi({
// 	})
	
// 	github.repos.getCommits({
// 		owner: 'kritikavd',
// 		  repo: 'node-github',
// 		  page : 36,
// 	}, function (err, res) {
// 	  if (err) throw err
// 	  response.json(res);
// 	});

// });


// app.get('/testgitapifollowing', function(req,response){
// 	var GitHubApi = require('github')

// 	var github = new GitHubApi({
// 	})

// 	github.users.getFollowingForUser({
// 	    // optional
// 	    // headers: {
// 	    //     "cookie": "blahblah"
// 	    // },
// 	  username: 'defunkt'
// 	}, function (err, res) {
// 	  if (err) throw err
// 	  response.json(res);
// 	})
// });