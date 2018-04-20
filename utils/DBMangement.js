(function(){

	   var mongo = require('mongodb');
	    var MongoClient = mongo.MongoClient;
	    var umlModelExtractor = require("./UMLModelExtractor.js");
	    var umlEvaluator = require("./UMLEvaluator.js");
		var url = "mongodb://127.0.0.1:27017/repo_info_schema";
	    var umlFileManager = require("./UMLFileManager.js");
	    var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
	    var config = require('./config'); // get our config file
	    const uuidv4 = require('uuid/v4');
	
	function updateModelInfoId(token, message, callbackfunc){
//		updateModelInfoId();
	}
	
	module.exports = {
	}
	
	
})();
