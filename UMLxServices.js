var express = require('express');
var app = express();
var fs = require("fs");
var path = require('path');
var admZip = require('adm-zip');
var umlModelExtractor = require("./UMLModelExtractor.js");
var umlFileManager = require("./UMLFileManager.js");
var umlEvaluator = require("./UMLEvaluator.js");
var umlModelInfoManager = require("./UMLModelInfoManagerMongoDB.js");
var effortPredictor = require("./UMLxEffortPredictor.js");
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
const androidAnalyzer = require('./UMLxAndroidAnalyzer');
const { fork } = require('child_process');
//var Worker = require('webworker-threads').Worker;

var currentModel = null;
// global variable to map appToken -> endpoint location
var endpoints = {};

/* output/ and uploads/ folders auto-creation */
var checkDirExist = (folderpath) => {
	const pathArr = folderpath.split('/');
	let _path = '';
	for (let i = 0; i < pathArr.length; i++) {
    	if (pathArr[i]) {
    		_path += pathArr[i] + '/';
      		if (!fs.existsSync(_path)) {
        		fs.mkdirSync(_path);
      		}
    	}
  	}
}
checkDirExist('public/output');
checkDirExist('public/uploads');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var date = new Date();
        var uploadDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
        var fileDestination = 'public/uploads/'+uploadDate+"@"+Date.now()+"/";
        var stat = null;
        try {
            stat = fs.statSync(fileDestination);
        } catch (err) {
            fs.mkdirSync(fileDestination);
        }
        if (stat && !stat.isDirectory()) {
            throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
        }
        cb(null, fileDestination);
    }
})

console.l = console.log;
//console.log = function() {};

var fileDestination = null;
umlSurveyFiles = [];
var surveyFiles = multer.diskStorage({
    destination: function (req, file, cb) {
    	if(fileDestination==null) {
            fileDestination = 'public/survey/';
            var stat = null;
            try {
                stat = fs.statSync(fileDestination);
            } catch (err) {
                fs.mkdirSync(fileDestination);
            }
            if (stat && !stat.isDirectory()) {
                throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
            }
        }
        cb(null, fileDestination);
    },
    filename: function (req, file, cb) {
        var fileName = Date.now()+ "-" + file.originalname;
        cb(null, fileName);
		console.log("saved the file " + fileName + " in " + fileDestination);
    }
})




var upload = multer({ storage: storage });
var surveyUploads = multer({ storage: surveyFiles });

app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true}));


app.set('views', './views');
app.set('view engine', 'jade');

app.get('/codeAnalysisPage',function(req,res){
	res.render('codeAnalysisPage');
});

app.post('/analyseSrc',function(req,res){
	console.log(req);
	
	// var configFilePath = req.files['config-file'][0].path;
	configFilePath = "D:\\Research Projects\\UMLx\\data\\Android_Projects\\repo_12_5.json";

	fileManagerUtil = require("./utils/FileManagerUtil.js");

	fileManagerUtil.readJSON(configFilePath, function(config){
			console.log(config);
			config.configFilePath = configFilePath;
			 res.send(config);
	});

});

app.post('/genRepoReport',function(req,res){
	console.log(req);
	
	// var configFilePath = req.files['config-file'][0].path;
	configFilePath = "D:\\Research Projects\\UMLx\\data\\Android_Projects\\repo_12_5.json";

	fileManagerUtil = require("./utils/FileManagerUtil.js");

	fileManagerUtil.readJSON(configFilePath, function(config){
			console.log(config);
			config.configFilePath = configFilePath;
			
			
var modelOutputDirs = FileManagerUtil.readFileSync(repo.reportDir+"\\analysis-results-folders.txt").split(/\r?\n/g);
var transactionFiles = [];
var filteredTransactionFiles = [];
var modelEvaluationFiles = [];
for(var i in modelOutputDirs){
  //code here using lines[i] which will give you each line
	var modelOutputDir = modelOutputDirs[i];

	if(modelOutputDir === ""){
		continue;
	}
	
	filteredTransactionFiles.push(modelOutputDir+"\\"+"filteredTransactionEvaluation.csv");
	transactionFiles.push(modelOutputDir+"\\"+"transactionEvaluation.csv");
	modelEvaluationFiles.push(modelOutputDir+"\\"+"modelEvaluation.csv");
}


var modelEvaluationContents = FileManagerUtil.readFilesSync(modelEvaluationFiles);
var modelEvaluationConsolidation = "";
for(var i in modelEvaluationContents){
	  var modelEvaluationLines = modelEvaluationContents[i].split(/\r?\n/g);
	  if(i == 0){
		  modelEvaluationConsolidation += modelEvaluationLines[0]+","+"transaction_file";
	  }
		  for(var j = 1; j < modelEvaluationLines.length; j++){
		  if(modelEvaluationLines[j] === ""){
			  continue;
		  }

		  modelEvaluationConsolidation += "\n"+modelEvaluationLines[j]+","+filteredTransactionFiles[i];
		  
		  }
}
	  
FileManagerUtil.writeFileSync(repo.reportDir+"\\modelEvaluations.csv", modelEvaluationConsolidation);

var transactionEvaluationContents = FileManagerUtil.readFilesSync(transactionFiles);
var transactionEvaluationConsolidation = "";

//console.log(transactionEvaluationContents);

function filter(transaction){
	var invalidTerms = ["message", "Message", "undefined", "error", "information", "Information"]
	for(var i in invalidTerms){
		if(transaction.indexOf(invalidTerms[i])>-1 && transaction.split("->").length < 3){
			return true;
		}
	}
	
	return false;
}



for(var i in transactionEvaluationContents){
	var identifiedTransactions = {};
	//remove duplicate transactions and write back.
	 var transactionEvaluationLines = transactionEvaluationContents[i].split(/\r?\n/g);
	 var filteredTransactionEvaluationStr = transactionEvaluationLines[0];
	  if(i == 0){
		  transactionEvaluationConsolidation += transactionEvaluationLines[0];
	  }
		  for(var j = 1; j < transactionEvaluationLines.length; j++){
		 var transactionEvaluationFields = transactionEvaluationLines[j].split(/,/g);
		  if(transactionEvaluationLines[j] === "" || filter(transactionEvaluationFields[1]) || identifiedTransactions[transactionEvaluationFields[1].replace(/\s/g, "").toLowerCase()]){
			  	  console.log("duplicates");
			  	  console.log(transactionEvaluationFields[1]);
				  continue;
		  }
		  identifiedTransactions[transactionEvaluationFields[1].replace(/\s+/g, "").toLowerCase()] = 1;
		  filteredTransactionEvaluationStr += "\n"+transactionEvaluationLines[j];
		  transactionEvaluationConsolidation += "\n"+transactionEvaluationLines[j]+","+i;
		  
		  }
	  
	  var transactionFilePath = transactionFiles[i];
	  FileManagerUtil.writeFileSync(filteredTransactionFiles[i],  filteredTransactionEvaluationStr);
}

	   FileManagerUtil.writeFileSync(repo.repoDir+"\\transactionEvaluations.csv", transactionEvaluationConsolidation);

	});

});

app.post('/analyseRepo',function(req,res){
	console.log(req);
	
	// var configFilePath = req.files['config-file'][0].path;
	configFilePath = "D:\\Research Projects\\UMLx\\data\\Android_Projects\\repo_12_5.json";

	fileManagerUtil = require("./utils/FileManagerUtil.js");

	fileManagerUtil.readJSON(configFilePath, function(config){
			console.log(config);
			config.configFilePath = configFilePath;
			 res.send(config);
	});

});

app.post('/analyseRepo',function(req,res){
	console.log(req);
	
	// var configFilePath = req.files['config-file'][0].path;
	configFilePath = "D:\\Research Projects\\UMLx\\data\\Android_Projects\\repo_12_5.json";

	fileManagerUtil = require("./utils/FileManagerUtil.js");

	fileManagerUtil.readJSON(configFilePath, function(config){
		var reportDir = config.reportDir;

			var reportPath = reportDir+"\\analysis-results-folders.txt";
	global.debugCache = new Object();
//	FileManagerUtil.deleteFileSync(reportPath);
	
	  //use promise to construct the repo objects
    function analyseModel(projectXMI, projectName, reportDir){
        return new Promise((resolve, reject) => {
//        	config.setDebugOutputDir(projectPath+"/debug");
        	

        if(!projectName){
        		projectName = ""
        }
        	
   		 let date = new Date();
   	     let analysisDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
   	     analysisDate = analysisDate+"@"+Date.now();
   	   
   	     projectName = projectName + "_"+analysisDate;
        	
        	var outputDir = reportDir +"\\"+projectName+"_analysis";
        	global.debugOutputDir = outputDir + "/debug";
        	var inputFile = projectXMI;
        	
        	console.log(inputFile);
        	
        	mkdirp(outputDir, function(err) { 
        	fs.exists(inputFile, (exists) => {
        	if(!exists){
        		console.log(inputFile+" doesn't exist.");
        		resolve();
        	}
        	else{
            //to generate svg file.
        	UMLxAnalyticToolKit.analyseSrc(inputFile, outputDir, projectName, function(model){
        		if(!model){
        			console.log('analysis error!');
            		resolve();
            		return;
        		}
        		console.log("finished sr analysis");
        		FileManagerUtil.appendFile(reportPath, model.OutputDir+"\n", function(message){
            		console.log('analysis finished!');
            		console.log(message);
            		resolve();
        		})
        		  
        	});
        	
        	}
      	  });
        	});
        	
        });
    }
    
    return Promise.all(projectList.map(project=>{
        return analyseModel(project.path+"\\"+project.modelFile, project.tag, reportDir);
    })).then(
        function(){
			console.log("=============Cache==============");
			var OutputDir = global.debugOutputDir ? global.debugOutputDir : './debug';
			for (var key in global.debugCache) {
				mkdirp(OutputDir, function(err) { 
					fs.writeFile(key, global.debugCache[key], function(err){
						if(err){
							console.log(err);
						}
					});
					});
				}
			console.log("Finish write debug cache in files");
            return new Promise((resolve, reject) => {
                setTimeout(function(){
                	console.log("analysis finished");
                    resolve();
                }, 0);
            });
        }

    ).catch(function(err){
        console.log(err);
    });
	
	});

});

app.post('/genCOCOMOReport',function(req,res){
	// console.log(req);
	
	// var configFilePath = req.files['config-file'][0].path;
	configFilePath = req.body['configFile'];

	configFilePath = "D:\\Research Projects\\UMLx\\data\\Android_Projects\\repo_12_5.json";

	fileManagerUtil = require("./utils/FileManagerUtil.js");

	fileManagerUtil.readJSON(configFilePath, function(config){

		var fileList = config.reportDir+"/fileList.txt";

		if(!fileManagerUtil.existsSync(fileList)){
		    var paths = "";
			 var projectList = config.projectList;
            for(var i = 0; i < projectList.length; i++){
                var project = projectList[i];
				paths += project.path;
				if(i != projectList.length - 1){
				paths += "\n";
				}
			}

			fileManagerUtil.writeFileSync(fileList, paths);
		}

		var slocReport = config.reportDir+"/slocReport.csv";
		if(!fileManagerUtil.existsSync(slocReport)){
			var generateSlocReport = require('./utils/RepoAnalyzerUtil').generateSlocReport;

		generateSlocReport(fileList, slocReport);
		}

		
		var cocomoCalculator = require("./effort_estimators/COCOMOCalculator.js");
		var cocomoDataPath = config.repoDir+"\\COCOMORatings.csv";

		if(!fileManagerUtil.existsSync(cocomoDataPath)){
			var slocReport = fileManagerUtil.loadCSVFileSync(slocReport, true);
			var cocomoValues = cocomoCalculator.genDefaultValues();
			var rows = "PROJ,KSLOC";
			for(var i in cocomoValues){
				rows += ","+i;				
			}
			rows += "\n";

			console.log(rows);

			for(var i = 0; i < slocReport.length; i++){
				var slocReportItem = slocReport[i];
				// console.log(slocReportItem);
				rows += slocReportItem.project;
			 	rows += ","+Number(slocReportItem.code)*0.001;
				for(var j in cocomoValues){
					rows += ","+cocomoValues[j];
				}

				if(i != slocReport.length - 1){
					rows += "\n";
				}
			}

			// console.log(rows);

			fileManagerUtil.writeFileSync(cocomoDataPath, rows);
		}

		var cocomoDataResults= config.repoDir+"\\COCOMOResults.csv";
		cocomoCalculator.loadCOCOMOData(cocomoDataPath, function(cocomoDataList){

		var rows = "";

		for(var i = 0; i < cocomoDataList.length; i++){
	
		var cocomoData = cocomoCalculator.estimateProjectEffort(cocomoDataList[i]);

		console.log(cocomoData);
				
		if(i == 0){
			rows += "PROJ, KSLOC, Effort";
			for(var j in cocomoData.SF){
				rows += ","+j;
			}

			for(var j in cocomoData.EM){
				for(var k in cocomoData.EM[j]){
				rows += ","+k;
				}
			}
		}

		rows += "\n";

		rows += cocomoData.PROJ;
		rows += ","+cocomoData.KSLOC;
		rows += ","+cocomoData.PH_most_likely;
		for(var j in cocomoData.SF){
				rows += ","+cocomoData.SF[j];
			}

			for(var j in cocomoData.EM){
				for(var k in cocomoData.EM[j]){
				rows += ","+cocomoData.EM[j][k];
				}
			}
			
			
		}
		fileManagerUtil.writeFileSync(cocomoDataResults, rows);


	});
	});
});

app.post('/genSrcReport',function(req,res){
	// console.log(req);
	
	// var configFilePath = req.files['config-file'][0].path;
	configFilePath = req.body['configFile'];

	configFilePath = "D:\\Research Projects\\UMLx\\data\\Android_Projects\\repo_12_5.json";

	fileManagerUtil = require("./utils/FileManagerUtil.js");

	fileManagerUtil.readJSON(configFilePath, function(config){

		    var paths = "";
			 var projectList = config.projectList;
            for(var i = 0; i < projectList.length; i++){
                var project = projectList[i];
				paths += project.path;
				if(i != projectList.length - 1){
				paths += "\n";
				}
			}

			var fileList = config.reportDir+"/fileList.txt";

			fileManagerUtil.writeFileSync(fileList, paths);
		
			var generateSlocReport = require('./utils/RepoAnalyzerUtil').generateSlocReport;

			generateSlocReport(fileList, config.reportDir+"/slocReport.csv");
	});
});

app.get('/kdmModelRecoverPage',function(req,res){
	res.render('kdmModelRecoverPage');
});

app.post('/genKDM', upload.fields([{ name: 'workingDir', maxCount: 1 }]), function(req,res){
	console.log(req);
	
	var workingDir = "public/"+req.body['workingDir'];

	console.log(workingDir);
			
			var generateKDMModel4 = require('./utils/EclipseUtil').generateKDMModel4;
			// var generateKDMModel4 = require('./utils/EclipseUtil').generateKDMModel2;

			// var workingDir = path.dirname(projectZipFilePath);

			fs.readdir(workingDir, function(err, files) {

				if (files.indexOf(".project") === -1) {
								return;
				}

				// files.forEach(function(filename) {
					
			        // console.log(workingDir + "/" + filename);

					// fs.lstat(workingDir + "/" + filename, function(err, stats) {
					// 	if(err) {
					// 		return console.log(err);
					// 	}

						// if (!stats.isDirectory()) {
						// 	return;
						// }


						// fs.readdir(workingDir + "/" + filename, function(err, files) {
						// 	if (err) {
						// 		return console.log(err);
						// 	}

							// the directory must contain ".project" file to proceed
							

							generateKDMModel4(workingDir, function(err, resultPath) {
								if (err) {
									return console.log(err);
								}

								console.log("KDM Complete:", resultPath);
								res.end("success");
							});
						// });
					// });
				// });
});
});

app.post('/genkdmModel', upload.fields([{ name: 'project-zip-file', maxCount: 1 }]), function(req,res){
	console.log(req);
	
	var projectZipFilePath = req.files['project-zip-file'][0].path;

	// extract zip file, put at the same directory
	fs.createReadStream(projectZipFilePath)
		.pipe(unzip.Extract({ 
			path: projectZipFilePath.substring(0, projectZipFilePath.lastIndexOf("\\")) 
		}))
		.on('close', function () {
			
			var generateKDMModel4 = require('./utils/EclipseUtil').generateKDMModel4;
			var workingDir = path.dirname(projectZipFilePath);

			fs.readdir(workingDir, function(err, files) {
				files.forEach(function(filename) {
					fs.lstat(workingDir + "/" + filename, function(err, stats) {
						if(err) {
							return console.log(err);
						}

						if (!stats.isDirectory()) {
							return;
						}

						fs.readdir(workingDir + "/" + filename, function(err, files) {
							if (err) {
								return console.log(err);
							}

							// the directory must contain ".project" file to proceed
							if (files.indexOf(".project") === -1) {
								return;
							}

							generateKDMModel4(workingDir + "/" + filename, function(err, resultPath) {
								if (err) {
									return console.log(err);
								}

								console.log("KDM Complete:", resultPath);
								res.download(resultPath, "result.xmi");
							});
						});
					});
				});
			});
		});
});


app.get('/loadEstimatorInfo', function(req, res){
    res.render('estimationPanel', {estimatorParameters: {}});
});


// END OF TEST GIT API
app.get('/estimationPage',function(req,res){
	res.render('estimationPage', {cookieName: "EstimationPageOptions"});
});

app.post('/predictProjectEffort', upload.fields([{name:'distributed_system',maxCount:1},{name:'response_time', maxCount:1},{name:'end_user_efficiency', maxCount:1},{name:'complex_internal_processing', maxCount:1},{name:'code_must_be_reusable', maxCount:1}
,{name:'easy_to_install', maxCount:1},{name:'easy_to_use', maxCount:1},{name:'portable', maxCount:1},{name:'easy_to_change', maxCount:1},{name:'concurrent', maxCount:1}
,{name:'includes_special_security_objectives', maxCount:1},{name:'provides_direct_access_for_third_parties', maxCount:1},{name:'special_user_training_facilities_are_required', maxCount:1},{name:'familiar_with_the_project_model_that_is_used', maxCount:1},{name:'application_experience', maxCount:1}
,{name:'object_oriented_experience', maxCount:1},{name:'lead_analyst_capability', maxCount:1},{name:'motivation', maxCount:1},{name:'stable_requirements', maxCount:1},{name:'part_time_staff', maxCount:1}
,{name:'difficult_programming_language', maxCount:1},{name:'uml_file', maxCount:1},{name:'uml_other', maxCount:1}, {name:'model', maxCount:1},{name:'simulation', maxCount:1}]), function(req,res){
	var uploadedFile = req.files['uml_file'][0];
    if (uploadedFile.mimetype == "text/xml" || path.extname(uploadedFile.originalname) == ".apk") { // xml file or apk file
        var projectInfo = {};
		projectInfo.distributedSystem = req.body['distributed_system'];
		projectInfo.responseTime = req.body['response_time'];
		projectInfo.endUserEfficiency = req.body['end_user_efficiency'];
		projectInfo.complexInternalProcessing = req.body['complex_internal_processing'];
		projectInfo.codeReusable = req.body['code_must_be_reusable'];
		projectInfo.easyInstall = req.body['easy_to_install'];
		projectInfo.easyUse = req.body['easy_to_use'];
		projectInfo.portable = req.body['portable'];
		projectInfo.easyToChange = req.body['easy_to_change'];
		projectInfo.concurrent = req.body['concurrent'];
		projectInfo.specialSecurityObjectives = req.body['includes_special_security_objectives'];
		projectInfo.directAccessForThirdParties = req.body['provides_direct_access_for_third_parties'];
		projectInfo.userTrainingFacilitiesRequired = req.body['special_user_training_facilities_are_required'];
		projectInfo.familiarWithProjectModel = req.body['familiar_with_the_project_model_that_is_used'];
		projectInfo.applicationExperience = req.body['application_experience'];
		projectInfo.objectOrientedExperience = req.body['object_oriented_experience'];
		projectInfo.leadAnalystCapability = req.body['lead_analyst_capability'];
		projectInfo.motivation = req.body['motivation'];
		projectInfo.stableRequirements = req.body['stable_requirements'];
		projectInfo.partTimeStaff = req.body['part_time_staff'];
		projectInfo.difficultProgrammingLanguage = req.body['difficult_programming_language'];
		
		if(req.body['personnel']){
			projectInfo.personnel = Number(req.body['personnel']);
		}
		
		if(req.body['schedule']){
			projectInfo.schedule = Number(req.body['schedule']);
		}
		
		if(req.body['hours-per-month']){
			projectInfo.hoursPerMonth = Number(req.body['hours-per-month']);
		}
		
		projectInfo.hoursPerMonth = 40;
		
		var umlFilePath = req.files['uml_file'][0].path;
		
		var estimationModel = req.body['model'];
		
		console.log("estimate project effort");
		var umlModelType = "uml";
		var umlModelName = "query1";
		var formInfo = req.body;
		var repoID = req.query.repoID;
		umlModelInfoManager.queryRepoInfo(repoID, function(repoInfo){
			if(!repoInfo){
				res.end("error");
				return;
			}
			var umlFileInfo = umlFileManager.getUMLFileInfo(repoInfo, umlFilePath, umlModelType, formInfo);
	//		console.log('umlFileInfo => ' + JSON.stringify(umlFileInfo));
			var modelInfo = umlModelInfoManager.initModelInfo(umlFileInfo, umlModelName, repoInfo);
			modelInfo.projectInfo = projectInfo;

			if (path.extname(uploadedFile.originalname) == ".apk") {
				modelInfo['apkFile'] = true;
			}
	//		console.log('updated model info');
	//		console.log(modelInfo);
			umlModelExtractor.extractModelInfo(modelInfo, function(modelInfo){
				//update model analytics.
				if(!modelInfo){
					res.end("error");
					return;
				}
				modelInfo.Name = umlModelName
				console.log("model is extracted");
				umlEvaluator.evaluateModel(modelInfo, function(){
					console.log("model analysis complete");

	                effortPredictor.predictEffortByModel(modelInfo, estimationModel, function(estimationResults){
	                    if(!estimationResults){
	                        console.log("error");
	                        res.render('estimationResultPaneSimplified', {error: "inter process error"});
	                        return;
	                    }

	                    console.log("estimation results");
	                    console.log(estimationResults);

	                    modelInfo[estimationModel] = estimationResults;
						modelInfo.repo_id = repoInfo._id;

						umlModelInfoManager.saveModelInfo(modelInfo, repoID, function(modelInfo2){
							umlModelInfoManager.saveEstimation(modelInfo, function(modelInfo){
								currentModel = modelInfo;
								umlModelInfoManager.queryModelNumByRepoID(repoID, function(modelNum){
								// res.send({modelNum: modelNum});
								res.render('estimationResultPaneSimplified', {estimationResults:estimationResults, modelInfo: modelInfo});
								})
							});
						})
	                });

				});

			});
		});
	}
});

// console.l = console.log;
// console.log = function() {};

app.get('/signup',function(req,res){

	if(req.query.tk!=null && req.query.tk!=undefined){
		res.render('signup', {tk:req.query.tk});
	} else {
	res.render('signupNew');
	}
});

app.get('/login',function(req,res){
	const tracker = require("./TrackUserInfo.js");
	tracker.tracker(req);
	res.render('loginNew');

});

app.get('/logout',function(req,res){
	res.clearCookie('appToken', { path: '/' });
	res.redirect('/');
});

app.post('/login', upload.fields([{name:'username', maxCount:1},{name:'password', maxCount:1}]),  function (req, res){

	var username = req.body['username'];
	var pwd = req.body['password'];
	umlModelInfoManager.validateUserLogin(username,pwd,function(result,message){
        res.json(result);
    });

})

app.get('/logout', function (req, res) {
	res.clearCookie('appToken', { path: '/' });
	res.redirect('/')
})


app.post('/updateModel', function (req, res){
	const tracker = require("./TrackUserInfo.js");
	tracker.tracker(req);
    var modelInfo = req.body;
    //JSON.parse(modelInfo);
    console.log(modelInfo);
    var repoID = modelInfo.rep_id;
	umlModelInfoManager.updateModelInfo(modelInfo, repoID, function(result,message){
        res.json(result);
        console.log("UpdateModel Finished");
    });
})


app.post('/signup', upload.fields([{name:'email',maxCount:1},{name:'username', maxCount:1},{name:'password', maxCount:1},{name:'enterpriseUser',maxCount :1},{name:'token',maxCount : 1}]),  function (req, res){

	var email = req.body['email'];
	var username = req.body['username'];
	var pwd = req.body['password'];
	var isEnterpriseUser= false;
	if(req.body['enterpriseUser']){
		isEnterpriseUser= req.body['enterpriseUser']=="on"? true : false;
	}
	var token = '';
	var enterpriseUserId ='';
	if(req.body['token']){
		 token = req.body['token'];
			 // verifies secret and checks exp
				 jwt.verify(token, config.secretUserInvite, function(err, payload) {
				   if (err) {
					   	 console.log('Failed to authenticate token. Token is not Valid');
						 var result = {
		            	          success: false,
		            	          message: 'Link is no longer valid.',
		                 };
						 res.json(result);
					   //return res.json({ success: false, message: 'Failed to authenticate token.' });
				   } else {
				     // if everything is good, save to request for use in other routes
					   umlModelInfoManager.queryUserInfo(payload.enterpriseUserId, function(user){

							 if(!user || !user.isEnterprise){
								 console.log('Not a valid enterprise userId');
								 var result = {
				            	          success: false,
				            	          message: 'Invalid Enterprise User Id',
				                 };
								 res.json(result);
							 }  else {
								 enterpriseUserId = payload.enterpriseUserId;
								 umlModelInfoManager.newUserSignUp(email,username,pwd,isEnterpriseUser,enterpriseUserId,function(result,message){
								        res.json(result)
								    });
							 }
						 });
				   }
				 });


	} else {
    umlModelInfoManager.newUserSignUp(email,username,pwd,isEnterpriseUser,enterpriseUserId,function(result,message){
        res.json(result)
    });
	}

})

app.get('/surveyProject', function(req, res){
	res.render('surveyProject');
});


app.get('/clearDB', function(req, res){
	var userId = req.query.user_id;
	if(userId === "flyqk191829189181810282"){
	umlModelInfoManager.clearDB(function(result){
		res.end('database is clear');
	    });
	}
})

app.get('/setupRepoStorage', function(req, res){
	var userId = req.query.user_id;
	if(userId === "flyqk191829189181810282"){
	umlModelInfoManager.setupRepoStorage(function(){
		res.end('database is set up');
	    });
	}
})

app.get('/clearRepo', function(req, res){
	var userId = req.query.user_id;
	if(userId === "flyqk191829189181810282"){
	umlModelInfoManager.setupRepoStorage(function(){
		res.end('database is set up');
	    });
	}
})


app.post('/uploadSurveyData', surveyUploads.fields([{name: 'project_plans', maxCount: 1}, {name: 'requirements', maxCount:1},
	{name: 'use_cases', maxCount: 1}, {name: 'uml_file', maxCount: 1}, {name: 'uml_other', maxCount:1}]), function (req, res){
	console.log(req.body);
	var formInfo = req.body;

	const tracker = require("./TrackUserInfo.js");
	tracker.tracker(req);

	console.log("==========req.files=============");
    console.log(req.files);

    formInfo.project_plans = (req.files.project_plans==undefined) ? "" : Date.now()+ "-" + req.files.project_plans[0].originalname;
    formInfo.requirements = (req.files.requirements==undefined) ? "" : Date.now()+ "-" + req.files.requirements[0].originalname;
    formInfo.use_cases = (req.files.use_cases==undefined) ? "" : Date.now()+ "-" + req.files.use_cases[0].originalname;
    formInfo.uml_file = (req.files.uml_file==undefined) ? "" : Date.now()+ "-" + req.files.uml_file[0].originalname;
    formInfo.uml_other = (req.files.uml_other==undefined) ? "" : Date.now()+ "-" + req.files.uml_other[0].originalname;

    console.log('=================formInfo==================');
    console.log(formInfo);

	umlModelInfoManager.saveSurveyData(formInfo);
	res.redirect("thankYou");
});

app.get('/thankYou', function(req, res){
	res.render('thankYou');
});

//route middleware to verify a token
app.use(function(req, res, next) {

	var token = undefined ;
	if(req.cookies){
		token = req.cookies.appToken;
	}
	if (token) {
	 // verifies secret and checks exp
		 jwt.verify(token, config.secret, function(err, user) {
		   if (err) {
			   console.log('Failed to authenticate token.');
			   res.redirect('/login');
			   //return res.json({ success: false, message: 'Failed to authenticate token.' });
		   } else {
		     // if everything is good, save to request for use in other routes
		     umlModelInfoManager.queryUserInfo(user.userId,function(user){
		    	if(!user){
		    		res.redirect('/login');
		    		return;
		    	}

		    	req.userInfo ={};
		    	req.userInfo.userName = user.username;
		    	req.userInfo.repoId = user.repoId;
		    	req.userInfo._id = user._id;
				req.userInfo.isEnterprise = (user.isEnterprise?true:false);
				req.userInfo.isTempUser = false;
		    	if(req.userInfo.isEnterprise){
		    		req.userInfo.enterpriseUserId = user.enterpriseUserId;
		    	}
				req.userInfo.email = user.email;
				next();
		 	  });
		   }
		 });
	} else {
		umlModelInfoManager.queryTempRepoInfo(function(repoInfo){
			repoId = repoInfo._id;
			req.userInfo = {};
			req.userInfo.repoId = repoId;
			req.userInfo.isTempUser = true;
			console.log(repoId);
			next();
		})
	}

});

app.get('/savegitinfo', function(req,res){
	console.log("****************************");

	var email = req.userInfo.email;
	var userId = req.userInfo._id;
	umlModelInfoManager.saveGitInfo(email,userId, function(success,msg){
		var result = {
		          success: success,
		          message: msg,
	   };
		res.json(result);
	});
});

app.get('/profile',function(req,res){
	profileInfo.userName = req.userInfo.userName;
	profileInfo.email = req.userInfo.email;
	profileInfo.isEnterprise = req.userInfo.isEnterprise?true:false;
	
	umlModelInfoManager.getGitData(req.userInfo._id, function(gitData, success, msg){
		if(success==true){
			profileInfo.gitData = gitData;
		}
	
		umlModelInfoManager.queryRepoFromUser(userID, function(result, message){
				console.log("WERTYU********************************");
        		res.render('profile', {profileInfo:profileInfo, profileRep:result.Repos[0]});
	   	});
    	});
});

app.get('/inviteUser',function(req,res){
	res.render('invite');
});

app.post('/inviteUser', upload.fields([{name:'email',maxCount:1}]),  function (req, res){


	const tracker = require("./TrackUserInfo.js");
	tracker.tracker(req);


	var email = req.body['email'];
	var enterpriseUserId = req.userInfo._id;
	var smtpTransport = nodemailer.createTransport({
	    service: "gmail",
	    host: "smtp.gmail.com",
	    auth: {
	        user: "teamumlx@gmail.com",
	        pass: "teamumlx123"
	    }
	});

	var payload = {
    		enterpriseUserId : enterpriseUserId,
    		invitedUserEmail : email
    };

    var token = jwt.sign(payload, config.secretUserInvite, {
    	expiresIn : 60*60*24 // expires in 24 hours
    });

	var mailOptions = {
		        from: '"Kritika Vaid" <kritikavaid123@gmail.com>', // sender address
		        to: email, // list of receivers
		        subject: 'Umlx Invitation Link', // Subject line
		        html: 'Please sign up using this '+ '<a href="http://localhost:8081/signup?tk='+token+'">link</a>' // html body
		    };

	smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });
	var result = {
	          success: true,
	          message: 'User Invited',
   };
	res.json(result);

})
app.get('/surveyAnalytics', function (req, res){
    // console.log(req);
	console.log("=================arrive here====================");
    umlModelInfoManager.saveSurveyAnalyticsData(req.query.uuid, req.query.ip, req.query.page);
    // console.log(data)
    // res.sendStatus(200);
});

app.post('/uploadUMLFile', upload.fields([{ name: 'uml_file', maxCount: 1 }, { name: 'uml_other', maxCount: 1 },
    { name: 'uml_model_name', maxCount: 1 }, { name: 'uml_model_type', maxCount: 1 }, { name: 'repo_id', maxCount: 1 }]), function (req, res) {

	const tracker = require("./TrackUserInfo.js");
	tracker.tracker(req);

	const worker = fork('./UMLxAnalyzeWorker.js',
		[],
        {
            execArgv: []
        });
    let token = req.cookies.appToken;
    console.l("token: " + token);
    let subscription = endpoints[token];
    console.l("subscription: " + subscription);
    
    worker.on('message', (text) => {
        console.l("killing child process");
        sendPush(subscription, 'Evaluation finished');
        worker.kill();
        res.redirect('/'); // 第二次redirect 
    });

    let obj = encapsulateReq(req);
    let objJson = JSON.stringify(obj);
    worker.send(objJson);
    console.l("DEBUGGGG: inside uploadUMLFile");
    sendPush(subscription, 'Project Analyzing');
    
    console.l("DEBUGGGG: before evaluate project");

    
    // setTimeout(() => evaluateUploadedProject(req), 2000);
});




function encapsulateReq(req) {
    let obj = {};
    obj.files = req.files;
    obj.body = req.body;
    obj.userInfo = req.userInfo;
    obj.sub = endpoints[req.cookies.appToken];
    return obj;
}

function sendPush(subscription, push_title) {
    const payload = JSON.stringify({title: push_title});
    console.log("DEBUGGGG: ready to send notification");
    if(subscription) {
        webpush.sendNotification(subscription, payload).catch(error => {
            console.error(error.stack);
        });
    } else {
        console.l("sendPush(): subscription endpoint not find, printing endpoints");
        console.l(endpoints);
    }
}

function evaluateUploadedProject(req) {

    console.log("DEBUGGGG: start evaluating project");
    var umlFilePath = null;
    var umlOtherPath = null;
    //need to implement unzipped xml file data-analysis, for now only process single xml file!!
    if(req.files['uml-file'] != null && req.files['uml-other'] != null){
        // console.log("================================path===================");

        umlFilePath = req.files['uml-file'][0].path;
        umlOtherPath = req.files['uml-other'][0].path;

        // console.log(umlFilePath);
        // console.log(umlOtherPath);

        fs.createReadStream(umlOtherPath).pipe(unzip.Extract({ path: umlFilePath.substring(0, umlFilePath.lastIndexOf("\\")) }));
        //remove directory of zip file and the contents in the directory
        rimraf(umlOtherPath.substring(0, umlOtherPath.lastIndexOf("\\")),function(err) {
            if (err) {
                console.log(err);
            }
        });
    }
    else if (req.files['uml-file'] != null) {
        umlFilePath = req.files['uml-file'][0].path;
    }
    //same problem as above comment
    else if (req.files['uml-other'] != null) {
        umlOtherPath = req.files['uml-other'][0].path;

        console.log("================================path===================");
        console.log(umlOtherPath);

        fs.createReadStream(umlOtherPath).pipe(unzip.Extract({path: umlOtherPath.substring(0, umlOtherPath.lastIndexOf("\\")) }));

        // res.redirect('/');

    } else {
        return false;
    }

    var projectInfo = {};
    projectInfo.distributedSystem = req.body['distributed-system'];
    projectInfo.responseTime = req.body['response-time'];
    projectInfo.endUserEfficiency = req.body['end-user-efficiency'];
    projectInfo.complexInternalProcessing = req.body['complex-internal-processing'];
    projectInfo.codeReusable = req.body['code-must-be-reusable'];
    projectInfo.easyInstall = req.body['easy-to-install'];
    projectInfo.easyUse = req.body['easy-to-use'];
    projectInfo.portable = req.body['portable'];
    projectInfo.easyToChange = req.body['easy-to-change'];
    projectInfo.concurrent = req.body['concurrent'];
    projectInfo.specialSecurityObjectives = req.body['includes-special-security-objectives'];
    projectInfo.directAccessForThirdParties = req.body['provides-direct-access-for-third-parties'];
    projectInfo.userTrainingFacilitiesRequired = req.body['special-user-training-facilities-are-required'];
    projectInfo.familiarWithProjectModel = req.body['familiar-with-the-project-model-that-is-used'];
    projectInfo.applicationExperience = req.body['application-experience'];
    projectInfo.objectOrientedExperience = req.body['object-oriented-experience'];
    projectInfo.leadAnalystCapability = req.body['lead-analyst-capability'];
    projectInfo.motivation = req.body['motivation'];
    projectInfo.stableRequirements = req.body['stable-requirements'];
    projectInfo.partTimeStaff = req.body['part-time-staff'];
    projectInfo.difficultProgrammingLanguage = req.body['difficult-programming-language'];

    // e.g.
    //  req.files['avatar'][0] -> File
    //  req.files['gallery'] -> Array
    //
    // req.body will contain the text fields, if there were any
    var umlModelName = req.body['uml-model-name'];
    var umlModelType = req.body['uml-model-type'];
    var repoId = req.userInfo.repoId;
    var uuidVal = req.body['uuid'];
    var formInfo = req.body;

    if(umlFilePath != null){
        umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
            var umlFileInfo = umlFileManager.getUMLFileInfo(repoInfo, umlFilePath, umlModelType, formInfo);
            console.log('umlFileInfo => ' + JSON.stringify(umlFileInfo));
            var modelInfo = umlModelInfoManager.initModelInfo(umlFileInfo, umlModelName,repoInfo);
            modelInfo.projectInfo = projectInfo;
            console.log('updated model info');
            console.log(modelInfo);
            umlModelExtractor.extractModelInfo(modelInfo, function(modelInfo){
                //update model analytics.
                console.log("model is extracted");
                if(!modelInfo){
                    // res.end("error");
                    return;
                }
                umlEvaluator.evaluateModel(modelInfo, function(modelInfo2){
                    console.log("model analysis complete");

                    console.log(modelInfo2);

                    if(!modelInfo2){
                        // res.redirect('/');
                        return;
                    }

                    effortPredictor.predictEffort(modelInfo2, function(modelInfo3){
                        if(!modelInfo3){
                            console.log("effort prediction failed");
                        }


                        var debug = require("./utils/DebuggerOutput.js");
                        debug.writeJson("evaluated_model_example"+modelInfo2._id, modelInfo2);

                        umlModelInfoManager.saveModelInfo(modelInfo2, repoId, function(modelInfo){
                            //				console.log(modelInfo);
                            umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo2){
                                console.log("=============repoInfo==========");
                                console.log(repoInfo2);
                                console.log("=============repoInfoNumber==========");
                                //var totalRec = repoInfo2.Models.length;
                                //console.log(totalRec);
                                console.log("=============render==========");
                                //res.render('mainPanel', {repoInfo:repoInfo2, totalRec: totalRec});
                                // setTimeout(function(){
                                // 	console.log("=============refresh=============");

                                var token = req.cookies.appToken;
                                var subscription = endpoints[token];
                                const payload = JSON.stringify({title: 'test'});
                                console.log("DEBUGGGG: ready to send notification");
                                webpush.sendNotification(subscription, payload).catch(error => {
                                    console.error(error.stack);
                                });
                            });
                        });
                    });
                });
            });
        });
    }

}

app.get('/uploadUMLFileCompany', function(req, res){
	console.log('============gettoweb============');
	res.redirect('/');
})


//This funtion is same as loadEmpiricalUsecaseDataForRepo, except we just take file from user input and pass it down.
app.post('/uploadUseCaseFile', upload.fields([{name:'usecase-file',maxCount:1}, {name:'repo-id', maxCount:1}]), function(req, res) {
	console.log('/uploadUseCaseFile');
	const tracker = require("./TrackUserInfo.js");
	tracker.tracker(req);
	var usecaseFilePath = req.files['usecase-file'][0].path;
	var repoId = req.userInfo.repoId;
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		umlEvaluator.loadUseCaseEmpirics(repoInfo, function(repo){
			if(!repo){
				res.end('lod error!');
				return;
			}
			umlModelInfoManager.updateRepoInfo(repo, function(repoInfo){
					res.redirect('/');
			});
		}, usecaseFilePath);
	});
})

/*
 * To integrate the model version control system, to reflect the evolution of the architecture for certain process.
 */
app.post('/uploadUMLFileVersion', upload.fields([{name:'uml-file',maxCount:1},{name:'uml-model-type', maxCount:1}, {name:'repo-id', maxCount:1}, {name:'model-id', maxCount:1}]), function (req, res){
	console.log("/uploadUMLFileVersion");
	const tracker = require("./TrackUserInfo.js");
	tracker.tracker(req);
	var umlFilePath = req.files['uml-file'][0].path;
	var umlModelType = req.body['uml-model-type'];
	var modelId = req.body['model-id'];
	var repoId = req.userInfo.repoId;
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		var umlFileInfo = umlFileManager.getUMLFileInfo(repoInfo, umlFilePath, umlModelType);
//		console.log('umlFileInfo');
		umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo){
			var modelInfoVersion = umlModelInfoManager.createModelInfoVersion(umlFileInfo, modelInfo);
			umlModelExtractor.extractModelInfo(modelInfoVersion, function(modelInfoVersion){
			//update model analytics.
				if(!modelInfoVersion){
					res.end("error");
					return;
				}
//			console.log(modelInfo);
			umlEvaluator.evaluateModel(modelInfoVersion, function(){
				console.log("model analysis complete");
			});

			umlModelInfoManager.pushModelInfoVersion(modelId, repoId, modelInfoVersion, function(modelInfo){
//				console.log(modelInfo);
				if(!modelInfo){
					res.end('model doesn\'t exist!');
				}
//				res.render('modelAnalytics', {modelAnalytics:modelInfo.ModelAnalytics, repo_id:repoId});
			});

		});
		});
	});
})


app.get('/deleteModel', function (req, res){
	var modelId = req.query['model_id'];
	var repoId = req.userInfo.repoId;
	console.log("/deleteModel");
	var reanalyseRepo = false;
	umlModelInfoManager.deleteModel(repoId, modelId, function(result){
		if(!result){
			res.end('delete error!');
			return;
		}

		if(reanalyseRepo){
			umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		      console.log(repoInfo);
		      umlEvaluator.evaluateRepo(repoInfo, function(){
					console.log("model analysis is complete");
				});
		      umlModelInfoManager.updateRepoInfo(repoInfo, function(){

					c

				});
			});
		}
		else{
		res.redirect('/');
		}
	});
})


app.get('/reanalyseRepo', function (req, res){

	var repoId = req.userInfo.repoId;

	/* multiprocess sequence start */
    const worker = fork('./UMLxReanalyseWorker.js');
    let token = req.cookies.appToken;
    console.l("token: " + token);
    let subscription = endpoints[token];
    console.l("subscription: " + subscription);
    console.l("test1");

    worker.on('message', (text) => {
        if(text.isEqual('ok')) {
            sendPush(subscription, 'Reanalyse finished');
        } else {
            sendPush(subscription, 'Reanalyse Failed');
            console.l("Reanalyse Failed");
            console.l(text);
        }
        console.l("killing child process");
        worker.kill();
    });
    console.l("test2");

    worker.send(repoId);
    console.l("DEBUGGGG: Reanalyse task sent to worker");
    sendPush(subscription, 'Project Reanalysing');
    res.redirect('/');
    /* multiprocess sequence end */

	//		console.log(refresh);
	umlModelInfoManager.queryFullRepoInfo(repoId, function(repoInfo){
	console.log("==================SURPRISE================");

    umlEvaluator.evaluateRepo(repoInfo, function(repoInfo){

        umlModelInfoManager.updateRepoInfo(repoInfo, function(){
            // counter = true;
			console.log("Finish All Calculation!");
			res.redirect('/');
        });
    });
});
})


app.get('/requestRepoBrief', function (req, res){
		var repoId = req.userInfo.repoId;

		console.log("refresh");
		umlModelInfoManager.requestRepoBrief(repoId, function(repoInfoBrief){
			console.log('==========totalRec===========');
			// console.log(totalRec);
            repoInfoBrief.projectNum[repoInfoBrief.projectNum.length] = totalRec;
            repoInfoBrief.NT[repoInfoBrief.NT.length] = totalNT;
            repoInfoBrief.UseCaseNum[repoInfoBrief.UseCaseNum.length] = totalUseCaseNum;
			repoInfoBrief.EntityNum[repoInfoBrief.EntityNum.length] = totalEntityNum;
			var newKeys = ["SLOC", "schedule","personnel", "EUCP", "EXUCP", "DUCP", "effort", "estimatedEffort"];
			for (var i=0, len=newKeys.length; i<len; ++i){
				repoInfoBrief[newKeys[i]][repoInfoBrief[newKeys[i]].length] = totalVal[newKeys[i]];
			}
			res.end(JSON.stringify(repoInfoBrief));
		});
})

app.get('/queryAllModelNames', function (req, res){
		var repoId = req.userInfo.repoId;

		console.log("refresh");
		umlModelInfoManager.queryAllModelNames(repoId, function(names){
			console.log('==========totalRec===========');
			console.log("names");
				res.end(JSON.stringify(names));
			});
})




app.get('/reanalyseModel', function (req, res){
	console.log("/reanalyseModel");
	var modelId = req.query['model_id'];
	var repoId = req.userInfo.repoId;
	umlModelInfoManager.queryModelInfo(modelId, req.userInfo.repoId, function(modelInfo){
		umlModelExtractor.extractModelInfo(modelInfo, function(extractedModelInfo){
			//update model analytics.
			if(!extractedModelInfo){
				res.end("error");
				return;
			}
			umlEvaluator.evaluateModel(extractedModelInfo, function(modelInfo2){
				console.log("model analysis complete");
				
				effortPredictor.predictEffort(modelInfo2, function(modelInfo3){
					if(!modelInfo3){
						 res.redirect('/');
						 return;
					}

                umlModelInfoManager.updateModelInfo(modelInfo3, repoId, function(modelInfo){
                    console.log("Re ana Now is good!1");
                    console.log(modelInfo);
                    var uploadsFile = modelInfo.fileUrl;
                    uploadsFile = uploadsFile.substring(0, uploadsFile.length - 33);
                    console.log(uploadsFile);
                    res.render('modelDetail', { modelInfo: modelInfo, repo_id: repoId, upLoadsPath: uploadsFile });
                    console.log("Re ana Now is good!2");

				});
                });
			});

		});
	});
})


app.get('/requestDomainModelDetail', function (req, res){
	console.log("/requestDomainModelDetail");
	var modelId = req.query['model_id'];
	var repoId = req.userInfo.repoId;
	umlModelInfoManager.queryDomainModelDetail(modelId, repoId, function(domainModel){
		if(!domainModel){
			res.end('delete error!');
			return;
		}
		console.log("domain model");
		console.log(domainModel);
		res.render('domainModelDetail',{domainModel: domainModel});
	});
})


app.get('/deleteUseCase', function (req, res){
	console.log("/deleteUseCase");
	var modelId = req.query['model_id'];
	var useCaseId = req.query['useCase_id'];
	var repoId = req.userInfo.repoId;
	umlModelInfoManager.deleteUseCase(repoId, modelId, useCaseId, function(result){
		if(!result){
			res.end('delete error!');
			return;
		}

		umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo){
//			console.log(modelInfo);
			res.render('modelDetail', {modelInfo:modelInfo});
		    });
	});
})

app.post('/uploadUseCaseEvaluation', upload.fields([{name:'ccss',maxCount:1},{name:'it', maxCount:1},{name:'ilf', maxCount:1}, {name:'elf', maxCount:1},{name:'ei', maxCount:1}, {name:'eo', maxCount:1}, {name:'eq', maxCount:1}, {name:'ph', maxCount:1}, {name:'useCase-id',maxCount:1}]),  function (req, res){
	console.log("/uploadUseCaseEvaluation");

	const tracker = require("./TrackUserInfo.js");
	tracker.tracker(req);

	var CCSS = req.body['ccss'];
	var IT = req.body['it'];
	var ILF = req.body['ilf'];
	var ELF = req.body['elf'];
	var EI = req.body['ei'];
	var EO = req.body['eo'];
	var EQ = req.body['eq'];
	var Effort = req.body['ph'];
	var useCaseId = req.body['useCase-id'];
	var modelId = req.body['model-id'];
	var repoId = req.userInfo.repoId;

	umlModelInfoManager.queryUseCaseInfo(repoId, modelId, useCaseId, function(useCaseInfo){
		console.log("useCase analytics name");
		useCaseInfo.CCSS = CCSS;
		useCaseInfo.IT = IT;
		useCaseInfo.ILF = ILF;
		useCaseInfo.ELF = ELF;
		useCaseInfo.EI = EI;
		useCaseInfo.EO = EO;
		useCaseInfo.EQ = EQ;
		useCaseInfo.Effort = Effort;
		umlModelInfoManager.updateUseCaseInfo(repoId, modelId, useCaseInfo, function(useCaseInfo){
			res.render('useCaseDetail', {useCaseInfo:useCaseInfo,modelId:modelId,repoId:repoId});
		});
	});

})


app.get('/queryExistingModelsTest', function(req, res){
	console.log("/queryExistingModelsTest");
	var projectId = "13d24325-9c00-275e-1e69-131bde0f";
	var modelInfo = umlModelInfoManager.queryExistingModelsTest(projectId, function(result){
		res.end(JSON.stringify(result));
	});

})

app.get('/queryModelInfo', function(req, res){
	var modelId = req.query.model_id;
	var repoId = req.userInfo.repoId;
	umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo){
		if (!modelInfo) {
			res.end("error");
			return;
		}
		var uploadsFile = modelInfo.fileUrl;
		uploadsFile = uploadsFile.substring(0, uploadsFile.length - 33);
		//console.log(uploadsFile);
		res.render('modelDetail', { modelInfo: modelInfo, repo_id: repoId, upLoadsPath: uploadsFile });
	});
    
})

app.get('/setupTestRepoStorage', function(req, res){
	var modelInfo = umlModelInfoManager.setupModelStorage(function(result){
		res.end('created');
	});

})

app.get('/addModelTest', function(req, res){
	var testModel = {Name:"test1", createDate:"1"};
	umlModelInfoManager.saveModelInfoTest(testModel, function(result){
		res.end(JSON.stringify(result));
	});

})


app.get('/requestModelUseCases', function(req, res){
	var modelId = req.query.model_id;
	umlModelInfoManager.queryModelInfo(modelId, req.userInfo.repoId, function(modelInfo){
		res.render('useCaseList', {modelInfo:modelInfo});
	    });
})


app.get('/requestUseCaseDetail', function(req, res){
	var useCaseId = req.query.useCase_id;
	var modelId = req.query.model_id;
	var repoId = req.userInfo.repoId;
	umlModelInfoManager.queryUseCaseInfo(repoId, modelId, useCaseId, function(useCaseInfo){
		if(!useCaseInfo){
			res.send("error");
			return;
		}
		
		//create the displayable paths
		var displayableTransactions = [];
		for(var i in useCaseInfo.Transactions){
			var transaction = useCaseInfo.Transactions[i];
			var transactionStr = "";
			for(var j in transaction.Nodes){
				var node = transaction.Nodes[j];
				transactionStr += node.Name;
				if( i != transaction.Nodes.length - 1){
					transactionStr += "->";
				}
			}
			displayableTransactions.push({id: i, TransactionStr: transactionStr, Tag: "undefined"});
		}
		console.log(useCaseInfo);
		useCaseInfo.DisplayableTransactions = displayableTransactions;
				res.render('useCaseDetail', {useCaseInfo:useCaseInfo, modelId:modelId,repoId:repoId});

		//create img directory so icons can be displayed
		var fs_extra = require('fs-extra');
		var mkdirp = require('mkdirp');
		var imgDirectory = "public/output/repo" + repoId + "/" + modelId.substring(0, 32) + "/" + useCaseId + "/img";
		mkdirp(imgDirectory, function(err) {
			if(err) {
				console.log(err);
				return;
			}
		});
		fs_extra.copy('public/img', imgDirectory, function(err) {
			if(err) {
				console.log(err);
				return;
			}
		});

	    });
})

app.get('/queryExistingModels', function(req, res){
	var projectId = req.query.project_id;
	umlModelInfoManager.queryRepoInfo(0,function(repoInfo){
		res.render('modelList', {repoInfo:repoInfo});
	});
})

app.get('/queryRepoInfo', function(req, res){
	//temporary analysis
	var repoId = req.query.repo_id;
	var refresh = req.query.refresh;
//	console.log(req.query);
	if(refresh === 'true'){
		refresh = true;
	}
	else{
		refresh = false;
	}

//	console.log(refresh);
	umlModelInfoManager.queryRepoInfo(req.userInfo.repoId, function(repoInfo){
//		console.log(repoInfo);
		res.render('repoDetail', {repoInfo:repoInfo});
	}, refresh);
})

app.get('/reloadRepo', function(req, res){
	let repoId = req.userInfo.repoId;
	/* Multiprocess sequence start */
    // const worker = fork('./UMLxReloadWorker.js');
    // let token = req.cookies.appToken;
    // console.l("token: " + token);
    // let subscription = endpoints[token];
    // console.l("subscription: " + subscription);
    // worker.on('message', (text) => {
    //     if(text.isEqual('ok')) {
    //         sendPush(subscription, 'Reload finished');
    //     } else {
    //         sendPush(subscription, 'Reload Failed');
    //         console.l("Reload Failed");
    //         console.l(text);
    //     }
    //     console.l("killing child process");
    //     worker.kill();
    // });
    // worker.send(repoId);
    // console.l("DEBUGGGG: reload task sent to worker");
    // sendPush(subscription, 'Project Reloading');
    // res.redirect('/');
    /* multiprocess sequence end */

	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		umlModelInfoManager.reloadRepo(repoInfo, function(repoInfo){
			if(!repoInfo){
				res.end("repoInfo error");
				return;
			}
			effortPredictor.predictEffortRepo(repoInfo, function(repoInfo2){
				if(!repoInfo2){
					console.log("effort prediction failed at repo level");
				}
                umlModelInfoManager.updateRepoInfo(repoInfo2, function(repoInfo3){
                    res.redirect('/');
                });
			});
		});
	});
});


app.get('/uploadProject', function(req, res){
	res.render('uploadProject');
});

// TODO use this API to populate data on UI
app.get('/getSubmittedSurveyList', function(req, res){
    umlModelInfoManager.getSurveyData(function(data){
        res.send(data);
    }, req.query.id);
});		

app.get('/surveyData', function(req, res){
   res.render("surveyData");
});

// to handle post redirect to home page
app.post('/', function(req, res){
	console.log('==============testpost==============');
    res.redirect('/');
    // setTimeout(function () {
    //     res.redirect('/');
    // }, 10000);

});

//Vibhanshu
var totalRec = 0;
var totalUseCaseNum = 0;
var totalNT = 0;
var totalEntityNum =  0;
var pageSize = 10;
var pageCount = 0;
var start = 0;
var currentPage = 1;
var totalVal = {"SLOC": 0, "schedule": 0,"personnel": 0, "EUCP": 0, "EXUCP": 0, "DUCP": 0, "effort": 0, "estimatedEffort": 0};
app.get('/pager',function(req,res){
   
    //var index = req.param('index');
    var repID = req.param('repId');
    //start = parseInt(req.param('start'));
    //pageSize = parseInt(req.param('pageSize'));
    
    
    if(req.param('currentPage') != undefined){
        currentPage = parseInt(req.param('currentPage'));
    }
    
    if(currentPage >1){
        start = (currentPage - 1) * pageSize;
    }else{
        start = 0;
    }
    
    console.log("repo ID "+repID+" Start "+start+" pageSize "+pageSize+" pageCount "+pageCount+" currentPage "+currentPage);
    
    //umlModelInfoManager.queryRepoInfo(repID, function(repoInfo){
    
        umlModelInfoManager.queryRepoInfoByPage(repID, pageSize, start, function(result,message){
       
        /*totalRec = result.length;
        pageCount =  Math.ceil(totalRec/pageSize);
        */
        
        //console.log(result);
        //console.log("Index in UMLx "+ index);

        res.render('pagination', {repoId: repID, pageR:result.Models, pageSize: pageSize, pageCount: pageCount, currentPage: currentPage});
       
       // });
    }); 
})


app.get('/', function(req, res){
	const tracker = require("./TrackUserInfo.js");
	tracker.tracker(req);

	var message = req.query.e;
	var requestUUID = randomstring.generate({
        length: 12,
		charset: 'alphabetic'
    });
	
	var repoId = req.userInfo.repoId;

//    if(req.param('step') != undefined && req.param('page') != undefined){
//        var repID = req.param('repId');
//        //var stepSize = parseInt(req.param('step'));
//        //pageSize = parseInt(req.param('page'));
//    }else{
//        repID = repoInfo._id;
//        //stepSize = repoInfo.Models.length;
//        //pageSize = 3;
	//    }
	
	
		if(req.param('currentPage') != undefined){
			currentPage = parseInt(req.param('currentPage'));
		}
		
		if(currentPage >1){
			start = (currentPage - 1) * pageSize;
		}
	
	//    umlModelInfoManager.queryRepoInfoByPage(repID, pageSize, start, function(result,message){
		umlModelInfoManager.queryModelNumByRepoID(repoId, function(modelNum){
	
		  
	//    umlModelInfoManager.queryRepoInfoByPage(req.userInfo.repoId, function(repoInfo){
	  umlModelInfoManager.queryRepoInfoByPage(repoId, pageSize, start, function(repoInfo, message){
	
		  console.log("==========================sfsdfsdfs==============");
		  console.log(repoInfo);
	
		  umlModelInfoManager.queryAllModelBrief(repoId, function(resultForRepoInfo){
			  repoInfo.UseCaseNum = resultForRepoInfo.UseCaseNum;
			repoInfo.NT = resultForRepoInfo.NT;
			repoInfo.EntityNum = resultForRepoInfo.EntityNum;
			var newKeys = ["SLOC", "schedule","personnel", "EUCP", "EXUCP", "DUCP", "effort", "estimatedEffort"];
			for (let i = 0, len = newKeys.length; i < len; ++i) {
				repoInfo[newKeys[i]] = resultForRepoInfo[newKeys[i]];
				totalVal[newKeys[i]] = resultForRepoInfo[newKeys[i]];
			}
	
			totalUseCaseNum = resultForRepoInfo.UseCaseNum;
			totalNT = resultForRepoInfo.NT;
			totalEntityNum =  resultForRepoInfo.EntityNum;
			
		  umlModelInfoManager.requestRepoBrief(repoId, function(repoInfoBrief){
		  
			totalRec = modelNum;
			pageCount =  Math.ceil(totalRec/pageSize);
		   
			console.log("total Records"+totalRec);
			
			console.log("INSIDE INDEX API pageCount "+ pageCount+ " pageSize "+pageSize+" Current page "+ currentPage+" Start "+start );
			
			if(!repoInfo){
				res.send("error");
				return;
			}

			var profileInfo = {};
			var userID = req.userInfo._id;
			var profileRep = {}
			profileInfo.userName = req.userInfo.userName;
			profileInfo.email = req.userInfo.email;
			profileInfo.isEnterprise = req.userInfo.isEnterprise?true:false;

			umlModelInfoManager.getGitData(req.userInfo._id, function(gitData, success, msg){
				if(success==true){
					profileInfo.gitData = gitData;
	 			}

				umlModelInfoManager.queryRepoFromUser(userID, function(result, message){
					if(result){
					profileRep = result.Repos[0];
					}
				});
			});
				if(req.userInfo.isEnterprise){
					// get the repoinfo for all the repo that are part of this enterprise account
					umlModelInfoManager.queryRepoIdsForAdmin(req.userInfo._id, function(repoIds){
						repoIds.push(req.userInfo.repoId);
						//console.log(repoIds);
						umlModelInfoManager.queryRepoInfoForAdmin(repoIds, function(modelArray){
	
							for(var i in modelArray ){
								var model = modelArray[i];
								for(var j in model ){
								repoInfo.Models.push(model[j]);
								}
							}
							
							repoInfo.requestUUID = requestUUID;
							console.log(repoInfo);
							res.render('index', {totalRec: totalRec, reppID: repoId, repoPageInfo: repoInfo.Models,
								repoInfo:repoInfo, message:message,isEnterprise : req.userInfo.isEnterprise, modelAllNum:modelNum,
								pageSize: pageSize, pageCount: pageCount, currentPage: currentPage, repoInfoBrief: repoInfoBrief, 
								profileInfo: profileInfo, profileRep: profileRep});
						});
					});
				} else {
					repoInfo.requestUUID = requestUUID;
					if (req.userInfo.isTempUser) {
						res.render('index_login', {totalRec: totalRec, reppID: repoId, repoPageInfo: repoInfo.Models, modelAllNum:modelNum,
							repoInfo:repoInfo, message:message,isEnterprise : req.userInfo.isEnterprise, pageSize: pageSize,
							pageCount: pageCount, currentPage: currentPage, repoInfoBrief: repoInfoBrief, 
							profileInfo: profileInfo, profileRep: profileRep});
					} else {
						console.log(repoInfo);
						res.render('index', {totalRec: totalRec, reppID: repoId, repoPageInfo: repoInfo.Models, modelAllNum:modelNum,
							repoInfo:repoInfo, message:message,isEnterprise : req.userInfo.isEnterprise, pageSize: pageSize,
							pageCount: pageCount, currentPage: currentPage, repoInfoBrief: repoInfoBrief, 
							profileInfo: profileInfo, profileRep: profileRep});
					}
				}
	
			});
		});
			 });
		});
});


app.post('/saveModelInfoCharacteristics', upload.fields([]), function(req,res){
    // console.log("/saveModelInfoCharacteristics");
	// console.log(req.body);
	const tracker = require("./TrackUserInfo.js");
	tracker.tracker(req);
	umlModelInfoManager.saveModelInfoCharacteristics(req.body, function(result,message){		
		res.json(result);
	});
});

app.get('/deleteUser', function(req,res){
	var userId = req.query['uid'];
	umlModelInfoManager.deleteUser(userId, function(status){
		var result ={'status' : status};
		res.json(result);
	});
});


app.get('/readFile', function(req,res){
	var filePath = req.query['url'];
	umlModelInfoManager.deleteUser(userId, function(status){
		var result ={'status' : status};
		res.json(result);
	});
});

/*
 * only for debugging process
 */
app.get('/queryUsers', function(req,res){
	var userId = req.query['uid'];
	umlModelInfoManager.queryUsers(function(users){
		console.log(users);
		res.render('userList', {users: users});
	});
});

app.get('/listFileUnderDir', function(req, res) {
	var filePath = '.' + req.query.fileFolder;
	console.log(filePath);

	var isAbsolute = false;
	if(filePath.includes(":")){
		isAbsolute = true;
		filePath = filePath.replace(/public\//g, "");
	}
	
    function recurDir(filePath, done) {
        var results = [];
        fs.readdir(filePath, function(err, list){
            if (err) {
                return done(err);
            } else {
                var pending = list.length;
                if (!pending) {
                	return done(null, results);
				}

				list.forEach(function(file) {
					var fileDir = path.resolve(filePath, file);
					fs.stat(fileDir, function(err, stat){
							var entry = {};
							entry.isFolder = stat.isDirectory();
							entry.url = file;
							entry.size = stat.size;
							entry.date = stat.birthtime;
							// entry.parent = filePath.substring(filePath.lastIndexOf("public/uploads/")-1);
							entry.parent = filePath;
							results.push(entry);
							if (!--pending) {
								done(null, results);
							}
					});
				});
            }
        });
    }
    recurDir(filePath, function (err, data) {
		if (err) {
			throw err;
		}
        res.json(data);
    });
});

//Fetch txt/csv file in public/repo/ouput
app.get('/fetchDocument', function (req, res) {

    var docPath = req.query.DocFolder;

	if(!docPath.includes(":")){
		docPath = "public/"+docPath;
	}

    fs.readFile(docPath, function (err, data) {
        if (err) {
            return console.error(err);
        }
        res.writeHead(200, { 'content-Type': 'text/html' });

        res.write(data);
        res.end();

    });
});


app.get('/downloadDocument', function(req, res) {

	var all_path = req.query.downloadUrl;
	console.log("===========all_path===============");
	console.log(all_path);

    let downloadPath = 'http://localhost:8081/' + all_path;
    console.log("++++++++++++++++downloadPath++++++++++++++");
    console.log(downloadPath);

    let savePath = 'public/downloads';
    console.log("++++++++++++++++savePath++++++++++++++");
    console.log(savePath);

    let fileName = all_path.substring(all_path.lastIndexOf('/') + 1);
    console.log("++++++++++++++++fileName++++++++++++++");
    console.log(fileName);

    let test_path = 'localhost:8081/' + all_path;
    console.log("===========test_path===============");
    console.log(test_path);

    download(downloadPath, savePath).then(() => {
        console.log('done!');
    });

    res.end();
});


app.get('/deactivateUser', function(req,res){
	var userId = req.query['uid'];

	var loggedInUserId = req.userInfo._id;

	if( !req.userInfo.isEnterprise && req.userInfo._id!=userId){
		var result={'status' : false , 'message' : 'Not authorized to deactivate this user'};
		res.json(result);
	} else {
		umlModelInfoManager.deactivateUser(loggedInUserId, userId, function(status,msg){
			var result ={'status' : status,'message' : msg};
			res.json(result);
		});
	}
});


////==================== local machine code for development ==========================
//
//var server = app.listen(8081,'127.0.0.1', function () {
//  var host = server.address().address
//  var port = server.address().port
//  console.log("Example app listening at http://%s:%s", host, port)
//});

//==================== remote server code for production ==========================
//var vhost = require('vhost');
//var webServer = module.exports = express();
//
//webServer.use(vhost('umlx.kanqi.org', app)); // Serves top level domain via Main server app
//
///* istanbul ignore next */
//if (!module.parent) {
//  webServer.listen(8081);
//  console.log('Express started on port 8081');
//}


// =====================push notification module=======================
// push notification module
const webpush = require('web-push');

const publicVapidKey = "BM2EKwsY9E_5r5ewHVlZ1hSwpSfRpvqQm0DPT3C60WQ3md98O0_Tb7c56yFfzFlFyaKqNVfYe1Vv2sul6m4Myt0";
const privateVapidKey = "zi84jsmnux1jffj4Kt0XnSNWeKVYmQpmRd-lMZkqU-k";

// Replace with your email
webpush.setVapidDetails('mailto:val@karpov.io', publicVapidKey, privateVapidKey);


app.use(require('body-parser').json());



app.post('/subscribe', (req, res) => {
    const token = req.cookies.appToken;
    const subscription = req.body;
	const tracker = require("./TrackUserInfo.js");
	tracker.tracker(req);
    if(subscription) {
        endpoints[token] = subscription;
        console.l('server received subsription endpoint');
    } else {
        console.l("server didn't receive corrent endpoint");
    }
    res.status(201).json({});
    // const payload = JSON.stringify({title: 'test'});
    console.l(subscription);
    // webpush.sendNotification(subscription, payload).catch(error => {
    //     console.error(error.stack);
    // });
});

app.get('/getZipPackage', function (req, res){
	var UMLxAnalyticToolKitCore = require("./utils/UMLxAnalyticToolKitCore.js");
	var zipFolder = require('zip-folder');

	var repoId = '/repo' + currentModel.repo_id;
	var modelId = '/' + currentModel.fileId;
	currentModel.OutputDir = __dirname + '/public/output' + repoId + modelId;
	
	var folderPath = __dirname + '/public/output' + repoId + modelId;
	var zipPath = __dirname + '/public/output/package.zip';

	UMLxAnalyticToolKitCore.generateReport(currentModel, function () {
		console.log("generateReport success");
		zipFolder(folderPath, zipPath, function(err) {
		    if(err) {
		        console.log(err);
		    } else {
	 			res.download(zipPath, function(err) {
	 				if (err) {
	 					console.log(err);
	 				} else {
	 					fs.unlink(zipPath, function(err) {
	 						if (err) {
	 							console.log(err);
	 						}
	 					});
	 				}
	 			});
		    }
		});			
	});	
});

app.post('/analyseSLOC', function (req, res) {
	const tracker = require("./TrackUserInfo.js");
	tracker.tracker(req);
	var archives = req.body.archives;
	archives = JSON.parse(archives);

	console.log(req.body.workingDir);

	var workingDir = "public/"+req.body.workingDir;

	if(workingDir.includes(":")){
		workingDir = workingDir.replace(/public\//g, "");
	}

	var analyseSLOC = require('./utils/RepoAnalyzerUtil').analyseSLOC;

	var filePaths = "";
	var appRoot = path.dirname(require.main.filename)+"/public";

	console.log("Submitted archives: ");
	for (var i = 0; i < archives.length; i++) {
		console.log(archives[i]);

		if(archives[i].includes(":")){
			filePaths += archives[i];
		}
		else{
			filePaths += appRoot+"/"+archives[i];
		}

		if(i != archives.legnth - 1){
			filePaths += "\n";
		}
	}

	var writeFile = require('./utils/FileManagerUtil').writeFileSync;
	
	var outputFilePath = workingDir+"/fileList.txt";
	
	writeFile(outputFilePath, filePaths);
	
	console.log("hello");
	analyseSLOC(outputFilePath, workingDir, function(result){
        if(result){
			console.log(result);
		}
		else{
			console.log("error in analysing SLOC");
		}
	});

});

//
//==================== local machine code for development ==========================
var server = app.listen(8081,'0.0.0.0', function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});

app.get('/getZipPackage', function (req, res){
	var repoId = '/repo' + req.query.repo_id;
	var modelId = '/' + req.query.model_id;

	var zipFolder = require('zip-folder');
	var folderPath = __dirname + '/public/output' + repoId + modelId;
	var zipPath = __dirname + '/public/output/package.zip';
	 
	zipFolder(folderPath, zipPath, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
 			res.download(zipPath, function(err) {
 				if (err) {
 					console.log(err);
 				} else {
 					fs.unlink(zipPath, function(err) {
 						if (err) {
 							console.log(err);
 						}
 					});
 				}
 			});
	    }
	});		
});
