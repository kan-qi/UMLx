/*
var fs = require("fs");
var mkdirp = require("mkdirp");
var rimraf = require('rimraf');

var jp = require('jsonpath');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var eaParser = require('./model_platforms/ea/XMI2.1Parser.js');
var srcParser = require('./model_platforms/src/SrcParser.js');
var vpParser = require('./model_platforms/visual_paradigm/XML2.1Parser.js');

function analyzeUML() {
	//Input xml file directory 
	var inputDir = process.argv[2];
	//Manully setted output directory
	var date = new Date();
    var analysisDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
    var outputDir = "public/analysisResult/"+analysisDate+"@"+Date.now()+"/";

    //create output directory for analysis result
	mkdirp(outputDir, (err) => {
		if(err) {
			console.log("Error: Fail to create output directory!");
			throw(err);
		}

		fs.readFile(inputDir, "utf8", (err, data) => {
			if(err) { 
				console.log("Error: Fail to read XMI file!");
				throw(err);
			}
			
			parser.parseString(data, (err, str) => {
				if(err) {
					console.log("Error: Fail to convert file data to string!");
					throw(err);
				}

				//determine what type of xmi it is
				var xmiParser = null;

				if(jp.query(str, '$..["xmi:Extension"][?(@["$"]["extender"]=="Enterprise Architect")]')[0]) {
					xmiParser = eaParser;
				}

				if(jp.query(str, '$..["xmi:Extension"][?(@["$"]["extender"]=="Visual Paradigm")]')[0]) {
					xmiParser = vpParser;
				}

				if(jp.query(str, '$..["kdm:Segment"]')[0]){
					xmiParser = srcParser;
				}

				if(xmiParser === null) {
					console.log("Error: Could not find XMI Parser!");
					return;
				}
				//extract model information due to different xmi parser
				xmiParser.extractUserSystermInteractionModel(str, outputDir, inputDir, (err, model) => {
					if(err) {
						console.log("Error: Fail to extract model Info!");
						console.log(err);
					}
					console.log("Out Put dir:");
					console.log(outputDir);
					// console.log("Successfully extract model Info and saved them to output Directory: " + outputDir);
				})
			});
	    });
	});

	return outputDir;
}

analyzeUML();
*/

var umlModelExtractor = require("./UMLModelExtractor.js");
var umlFileManager = require("./UMLFileManager.js");
var umlEvaluator = require("./UMLEvaluator.js");
var umlModelInfoManager = require("./UMLModelInfoManagerMongoDB.js");
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = "mongodb://127.0.0.1:27017/repo_info_schema";



function analyzeUML() {
	//Input xml file directory 
	var inputDir = process.argv[2];
	console.log(inputDir);
	//Manully setted output directory
	var date = new Date();
    var analysisDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
    var umlModelName = '';
    var outputDir = "public/analysisResult/"+analysisDate+"@"+Date.now()+"/";
    var umlModelType = 'uml';
    var formInfo = '';
    var repoId = '';//req.userInfo.repoId;

    MongoClient.connect(url, function (err, db) {
	    if (err) throw err;
	    db.collection("users").findOne({}, function (err, result) {
			if (err) throw err;
			repoId = result.repoId;
			db.close();
			
			umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
				var umlFileInfo = umlFileManager.getUMLFileInfo(repoInfo, inputDir, umlModelType, formInfo);
				//console.log('umlFileInfo => ' + JSON.stringify(umlFileInfo));
				var modelInfo = umlModelInfoManager.initModelInfo(umlFileInfo, umlModelName,repoInfo);
				//console.log('updated model info');
				//console.log(modelInfo);
				umlModelExtractor.extractModelInfo(modelInfo, function(modelInfo){
				//update model analytics.
					console.log("model is extracted");
					if(!modelInfo){
						res.end("error");
						return;
					}
					umlEvaluator.evaluateModel(modelInfo, function(){
						console.log("model analysis complete");
					});
		//			console.log(modelInfo);

					umlModelInfoManager.saveModelInfo(modelInfo, repoId, function(modelInfo){
		//				console.log(modelInfo);
						umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
							console.log("=============repoInfo==========");
							console.log(repoInfo);
						}, true);
					});
				});
			});
	    });
	});
	console.log(repoId);


    

	return outputDir;
}

analyzeUML();