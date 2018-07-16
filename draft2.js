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