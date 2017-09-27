var express = require('express');
var app = express();
var fs = require("fs");
var admZip = require('adm-zip');
var exec = require('child_process').exec;
var umlModelAnalyzer = require("./UMLModelAnalyzer.js");
var umlFileManager = require("./UMLFileManager.js");
var umlEvaluator = require("./UMLEvaluator.js");
var umlModelInfoManager = require("./UMLModelInfoManagerMongoDB.js");
var umlEstimator = require("./UMLEstimator.js");
//var COCOMOCalculator = require("./COCOMOCalculator.js");
var multer = require('multer');
var jade = require('jade');

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

var upload = multer({ storage: storage })

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'jade');

var userInfo = {
		userName: "kqi",
		password: "123456",
//		repoId:"59739373e190cc204c5ffeb1" // for resilient agile
		repoId:"598c93a9a9813b12105c953e"
}

var modelInfo = {};

app.post('/uploadUMLFile', upload.fields([{name:'uml-file',maxCount:1},{name:'uml-model-name', maxCount:1},{name:'uml-model-type', maxCount:1}, {name:'repo-id', maxCount:1}]), function (req, res){
	console.log("/uploadUMLFile");
	var umlFilePath = req.files['uml-file'][0].path;
	var umlModelName = req.body['uml-model-name'];
	var umlModelType = req.body['uml-model-type'];
	var repoId = req.body['repo-id'];
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		var umlFileInfo = umlFileManager.getUMLFileInfo(repoInfo, umlFilePath, umlModelType, umlModelName);
//		console.log('umlFileInfo');
		umlModelAnalyzer.extractModelInfo(umlFileInfo, function(modelInfo){
			//update model analytics.
//			console.log(modelInfo);
			umlModelAnalyzer.analyseModel(modelInfo, function(){
				console.log("model analysis complete");
			});
//			console.log(modelInfo);
			umlModelInfoManager.saveModelInfo(modelInfo, repoId, function(modelInfo){
//				console.log(modelInfo);
				umlModelInfoManager.queryRepoAnalytics(repoId, function(repoAnalytics, repoInfo){
					console.log("=============repoAnalytics==========");
//					console.log(repoAnalytics);
					res.render('mainPanel', {repo:repoInfo});
				}, true);
			});
		});
	});
})


app.get('/deleteModel', function (req, res){
	console.log("/deleteModel");
	var modelId = req.query['model_id'];
	var repoId = userInfo.repoId;
	umlModelInfoManager.deleteModel(repoId, modelId, function(result){
		if(!result){
			res.end('delete error!');
			return;
		}
		
		res.redirect('/');
	});
})


app.get('/reanalyseModel', function (req, res){
	console.log("/reanalyseModel");
	var modelId = req.query['model_id'];
	var repoId = userInfo.repoId;
	umlModelInfoManager.queryModelInfo(modelId, userInfo.repoId, function(modelInfo){
		umlModelAnalyzer.extractModelInfo(modelInfo, function(modelInfo){
			//update model analytics.
			umlModelAnalyzer.analyseModel(modelInfo, function(){
				console.log("model analysis complete");
			});
//			console.log(modelInfo);
			umlModelInfoManager.updateModelInfo(modelInfo, repoId, function(modelInfo){
//				console.log(modelInfo);
				umlModelInfoManager.queryModelAnalytics(modelId, repoId, function(modelAnalytics, modelInfo){
					console.log("=============repoAnalytics==========");
//					console.log(repoAnalytics);
					res.render('modelAnalytics', {modelAnalytics:modelAnalytics});
				});
			});
		});
	});
})


app.get('/requestDomainModelDetail', function (req, res){
	console.log("/requestDomainModelDetail");
	var modelId = req.query['model_id'];
	var repoId = userInfo.repoId;
//	console.log(modelId);
	umlModelInfoManager.queryDomainModelDetail(modelId, repoId, function(domainModel){
		if(!domainModel){
			res.end('delete error!');
			return;
		}
//		console.log(domainModel);
		res.render('domainModelDetail',{domainModelInfo: domainModel});
	});
})


app.get('/loadEmpiricalUsecaseDataForRepo', function (req, res){
	console.log("/loadEmpiricalUsecaseDataForRepo");
	var repoId = userInfo.repoId;
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
	umlEvaluator.loadUseCaseEmpiricsForRepo(repoInfo, function(repo){
		if(!repo){
			res.end('load error!');
			return;
		}
		
//		umlModelAnalyzer.analyseRepo(repo, function(){
//			console.log("repo analysis complete");
//		});
//		console.log(repo);
//		console.log(modelInfo);
		umlModelInfoManager.updateRepoInfo(repo, function(repoInfo){
//			console.log(modelInfo);
				res.redirect('/');
		});
		
	});
	});
})

app.get('/loadEmpiricalModelDataForRepo', function (req, res){
	console.log("/loadEmpiricalModelDataForRepo");
	var repoId = userInfo.repoId;
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
	umlEvaluator.loadModelEmpiricsForRepo(repoInfo, function(repo){
		if(!repo){
			res.end('load error!');
			return;
		}
		
//		umlModelAnalyzer.analyseRepo(repo, function(){
//			console.log("repo analysis complete");
//		});
//		console.log(repo);
//		console.log(modelInfo);
		umlModelInfoManager.updateRepoInfo(repo, function(repoInfo){
//			console.log(modelInfo);
				res.redirect('/');
		});
		
	});
	});
})

app.get('/deleteUseCase', function (req, res){
	console.log("/deleteUseCase");
	var modelId = req.query['model_id'];
	var useCaseId = req.query['useCase_id'];
	var repoId = userInfo.repoId;
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


app.get('/getUseCaseAnalyticsForModelCSV', function (req, res){
	console.log("/getUseCaseAnalyticsForModelCSV");
	var modelId = req.query['model_id'];
	var repoId = userInfo.repoId;
		
		umlModelInfoManager.queryModelAnalytics(modelId, repoId, function(modelAnalytics){
			umlFileManager.loadCSVFileAsString(modelAnalytics.OutputDir+"/"+modelAnalytics.UseCaseAnalyticsFileName, function(csvData){
				if(csvData){
					res.end(csvData);
				}
			})
	});
})

app.post('/uploadUseCaseEvaluation', upload.fields([{name:'ccss',maxCount:1},{name:'it', maxCount:1},{name:'ilf', maxCount:1}, {name:'elf', maxCount:1},{name:'ei', maxCount:1}, {name:'eo', maxCount:1}, {name:'eq', maxCount:1}, {name:'ph', maxCount:1}, {name:'useCase-id',maxCount:1}]),  function (req, res){
	console.log("/uploadUseCaseEvaluation");
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
	var repoId = userInfo.repoId;
	
	umlModelInfoManager.queryUseCaseAnalytics(repoId, modelId, useCaseId, function(useCaseAnalytics, useCaseInfo){
		console.log("useCase analytics name");
//		console.log(useCaseAnalytics.Name);
		useCaseAnalytics.CCSS = CCSS;
		useCaseAnalytics.IT = IT;
		useCaseAnalytics.ILF = ILF;
		useCaseAnalytics.ELF = ELF;
		useCaseAnalytics.EI = EI;
		useCaseAnalytics.EO = EO;
		useCaseAnalytics.EQ = EQ;
		useCaseAnalytics.Effort = Effort;
		useCaseInfo.useCaseAnalytics = useCaseAnalytics;
		umlModelInfoManager.updateUseCaseInfo(repoId, modelId, useCaseInfo, function(useCaseInfo){
//			console.log(useCaseInfo);
			res.render('useCaseDetail', {useCaseInfo:useCaseInfo,useCaseAnalytics:useCaseInfo.useCaseAnalytics,modelId:modelId,repoId:repoId});
		});
	});
	
})

app.post('/uploadModelEvaluation', upload.fields([{name:'ueucw',maxCount:1},{name:'uexucw', maxCount:1},{name:'uaw', maxCount:1},{name:'tcf',maxCount:1},{name:'ef', maxCount:1},{name:'afp', maxCount:1},{name:'vaf', maxCount:1},{name:'ph', maxCount:1}, {name:'model-id',maxCount:1}]),  function (req, res){
	console.log("/uploadModelEvaluation");
	var uploadModelEvaluation = {
	UEUCW : req.body['ueucw'],
	UEXUCW : req.body['uexucw'],
	UAW : req.body['uaw'],
	TCF : req.body['tcf'],
	EF : req.body['ef'],
	AFP : req.body['afp'],
	VAF : req.body['vaf'],
	Effort : req.body['ph']
	}
	
	modelId = req.body['model-id'];
	repoId = userInfo.repoId;
	
	console.log("model-id:"+modelId);
	
	umlModelInfoManager.queryModelAnalytics(modelId, repoId, function(modelAnalytics, modelInfo){
		for(var i in uploadModelEvaluation){
			if(uploadModelEvaluation[i]){
				modelAnalytics[i] = uploadModelEvaluation[i];
			}
		}
		
		modelInfo.ModelAnalytics = modelAnalytics;
		umlModelInfoManager.updateModelInfo(modelInfo, repoId, function(modelInfo){
//			console.log(modelInfo.ModelAnalytics);
			res.render('modelAnalytics', {modelAnalytics:modelInfo.ModelAnalytics});
		});
	});
	
})


app.get('/queryExistingModelsTest', function(req, res){
	console.log("/queryExistingModelsTest");
	var projectId = "13d24325-9c00-275e-1e69-131bde0f";
	var modelInfo = umlModelInfoManager.queryExistingModelsTest(projectId, function(result){
		res.end(JSON.stringify(result));
	});
//	var useCase = modelInfo.useCases[modelInfoId];

})

app.get('/queryModelAnalytics', function(req, res){
	var modelId = req.query.model_id;
	umlModelInfoManager.queryModelAnalytics(modelId, userInfo.repoId, function(modelAnalytics){
		//console.log('model Analytics');
		//console.log(modelAnalytics);
		
		res.render('modelAnalytics', {modelAnalytics:modelAnalytics});
	    });
//	var useCase = modelInfo.useCases[modelInfoId];

})

app.get('/setupTestRepoStorage', function(req, res){
	var modelInfo = umlModelInfoManager.setupModelStorage(function(result){
		res.end('created');
	});
//	var useCase = modelInfo.useCases[modelInfoId];

})

app.get('/addModelTest', function(req, res){
	var testModel = {Name:"test1", createDate:"1"};
	umlModelInfoManager.saveModelInfoTest(testModel, function(result){
		res.end(JSON.stringify(result));
	});
//	var useCase = modelInfo.useCases[modelInfoId];

})


app.get('/requestModelInfo', function(req, res){
	var modelId = req.query.model_id;
	umlModelInfoManager.queryModelInfo(modelId, userInfo.repoId, function(modelInfo){
//		console.log(modelInfo);
		res.render('modelDetail', {modelInfo:modelInfo});
	    });
})

app.get('/clearDB', function(req, res){
	var userId = req.query.user_id;
	if(userId === "flyqk"){
	umlModelInfoManager.clearDB(function(result){
		res.end('database is clear');
	    });
	}
})


app.get('/setupRepoStorage', function(req, res){
	var userId = req.query.user_id;
	if(userId === "flyqk"){
	umlModelInfoManager.setupRepoStorage(function(){
		res.end('database is set up');
	    });
	}
})


app.get('/addRepo', function(req, res){
	var userId = req.query.user_id;
	var password = req.query.password;
	if(userId === "flyqk" && password === "123456"){
	umlModelInfoManager.createRepo(function(repo){
		console.log(repo);
		res.end('database is set up');
	    });
	}
})


app.get('/requestUseCaseDetail', function(req, res){
	var useCaseId = req.query.useCase_id;
	var modelId = req.query.model_id;
	var repoId = userInfo.repoId;
	umlModelInfoManager.queryUseCaseAnalytics(repoId, modelId, useCaseId, function(useCaseAnalytics, useCaseInfo){
//				console.log('use case detail');
//				console.log(useCaseInfo);
		for(var i in useCaseInfo.Diagrams){
//		console.log(useCaseInfo.Diagrams[i]['Paths']);
		}
				res.render('useCaseDetail', {useCaseInfo:useCaseInfo,useCaseAnalytics:useCaseAnalytics,modelId:modelId,repoId:repoId});
	    });
})

app.get('/queryExistingModels', function(req, res){
	var projectId = req.query.project_id;
	umlModelInfoManager.queryRepoInfo(0,function(repoInfo){
		res.render('modelList', {repoInfo:repoInfo});
	});
})

app.get('/queryRepoAnalytics', function(req, res){
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
	umlModelInfoManager.queryRepoAnalytics(userInfo.repoId, function(repoAnalytics){
//		console.log(repoAnalytics);
		res.render('repoAnalytics', {repoAnalytics:repoAnalytics});
	}, refresh);
})

app.get('/reloadRepo', function(req, res){
	//temporary analysis
	var repoId = req.query.repo_id;
	
//	console.log(refresh);
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		umlModelInfoManager.reloadRepo(repoInfo, function(modelInfo){
			//update model analytics.
//			console.log(modelInfo);
			umlModelAnalyzer.analyseModel(modelInfo, function(){
				console.log("model analysis complete");
			});
//			console.log(modelInfo);
			umlModelInfoManager.updateModelInfo(modelInfo, repoId, function(modelInfo){
				
			});
		});
	});
})

//app.get('/loadCOCOMOData', function(req, res){
//	//temporary analysis
//	var repoId = req.query.repo_id;
//	
//	COCOMOCalculator.loadCOCOMOData(repoId, function(repoInfo){
//		umlModelInfoManager.updateRepoInfo(repoInfo, function(repoInfo){
////			console.log(modelInfo);
//				res.redirect('/');
//		});
//	});
//})

app.get('/queryEstimationModel', function(req, res){
	var estimator = req.query.estimator;
	var x = req.query.model+"_ALY";
	var y = "Effort_Norm_UCP";
	var repoId = req.query.repo_id;
	var simulation = false;
	if(req.query.simulation === 'true'){
		 simulation = true ;
		}
	console.log("query_estimation_model");
//	console.log(repoId);
	console.log(simulation);
	if(estimator === "OLSR"){
		umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		umlEvaluator.evaluateRepoForModels(repoInfo, function(modelEvaluationStr, repoAnalytics){
			var modelEvaluationData = umlFileManager.parseCSVData(modelEvaluationStr, true);
			umlEstimator.runLinearRegression(repoAnalytics, modelEvaluationData, x, y, function(calibrationResults){
				console.log(calibrationResults);
				if(calibrationResults === false){
					res.end("error");
				}
				else{
					res.render('calibrationResult', {calibrationResult:calibrationResults[x], ver: new Date().getTime()});
				}
			});
			
		}, false);
		});
	}
	else{
		res.end(estimator);
	}
})

app.get('/evaluateRepoForModels', function(req, res){
	var repoId = req.query.repo_id;
	var simulation = false;
	var refresh = false;
	if(req.query.simulation === 'true'){
	 simulation = true ;
	}
	
	if(req.query.refresh === 'true'){
	refresh = true;
	}
//	var repoId = "595b50d4aebbbd2c4c4c6b58";
	console.log(repoId);
//	var repoId = req.query.repo_id;
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
			umlEvaluator.evaluateRepoForModels(repoInfo, function(modelEvaluationStr, repoAnalytics){
				if(modelEvaluationStr){
//				console.log(repoEvaluationResult.repoEvaluationStr);
				res.end(modelEvaluationStr);
				}
			}, refresh);
		});
})

app.get('/dumpRepoDescriptiveDistributions', function(req, res){
	var repoId = req.query.repo_id;
	var refresh = false;
	
	if(req.query.refresh === 'true'){
	refresh = true;
	}
	
//	var repoId = "595b50d4aebbbd2c4c4c6b58";
	console.log(repoId);
//	var repoId = req.query.repo_id;
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
			umlEvaluator.evaluateRepoForModels(repoInfo, function(modelEvaluationStr, repoAnalytics){
				umlEvaluator.evaluateRepoForUseCases(repoInfo, function(useCaseEvaluationStr, repoAnalytics){
					
					var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/RepoDiscriptiveAnalysis.R "'+repoAnalytics.OutputDir+"/"+repoAnalytics.RepoEvaluationForUseCasesFileName+'" "'+repoAnalytics.OutputDir+"/"+repoAnalytics.RepoEvaluationForModelsFileName+'" "'+repoAnalytics.OutputDir+'" "."';
//					console.log('generate model Analytics');
					console.log(command);
					var child = exec(command, function(error, stdout, stderr) {

						if (error !== null) {
//							console.log('exec error: ' + error);
							console.log('exec error: repo id=' + repoAnalytics._id)
							res.end('exec error: repo id=' + repoAnalytics._id);
						} 
						res.end('success');
					});
					
				}, refresh);
			}, refresh);
		});
})

app.get('/evaluateRepoForUseCases', function(req, res){
	var repoId = req.query.repo_id;
	var simulation = false;
//	var repoId = "595b50d4aebbbd2c4c4c6b58";
	console.log(repoId);
//	var repoId = req.query.repo_id;
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
			umlEvaluator.evaluateRepoForUseCases(repoInfo, function(useCaseEvaluationStr, repoAnalytics){
				if(useCaseEvaluationStr){
//				console.log(repoEvaluationResult.repoEvaluationStr);
				res.end(useCaseEvaluationStr);
				}
			});
		});
})

app.get('/evaluateModelForUseCases', function(req, res){
	var modelId = req.query.model_id;
//	var modelId = "a08440f186a8d13192784845c7301f981499148138239";
	var repoId = userInfo.repoId;
	var simulation = false;
	umlModelInfoManager.queryModelAnalytics(modelId, repoId, function(modelAnalytics, modelInfo){
			umlEvaluator.evaluateModelForUseCases(modelInfo, function(useCaseEvaluationStr, modelInfo){
				
				umlModelInfoManager.updateModelInfo(modelInfo, repoId, function(modelInfo){
//					console.log(modelInfo);
					if(useCaseEvaluationStr){
						// calculateObserluteDifferences
						
//					console.log(modelEvaluationResult.usecaseEvaluationStr);
					var modelAnalytics = modelInfo.ModelAnalytics;
					useCaseEvaluationStr += "\n\n";
//				    useCaseEvaluationStr += "CCSS_SAD: "+modelAnalytics.CCSS_DIFF+"\n";
//				    useCaseEvaluationStr += "IT_SAD: "+modelAnalytics.IT_DIFF+"\n";
				    useCaseEvaluationStr += "EI_SAD: "+modelAnalytics.EI_DIFF+"\n";
				    useCaseEvaluationStr += "EO_SAD: "+modelAnalytics.EO_DIFF+"\n";
				    useCaseEvaluationStr += "EQ_SAD: "+modelAnalytics.EQ_DIFF+"\n";
				    useCaseEvaluationStr += "FUNC_NA: "+modelAnalytics.FUNC_NA+"\n";
				    useCaseEvaluationStr += "FN_ALY: "+modelAnalytics.FN+"\n";
				    useCaseEvaluationStr += "FN_SAD: "+modelAnalytics.FN_DIFF+"\n";
				    useCaseEvaluationStr += "DM_SAD: "+modelAnalytics.DM_DIFF+"\n";
				    useCaseEvaluationStr += "INT_SAD: "+modelAnalytics.INT_DIFF+"\n";
				    useCaseEvaluationStr += "CTRL_SAD: "+modelAnalytics.CTRL_DIFF+"\n";
				    useCaseEvaluationStr += "EXTIVK_SAD: "+modelAnalytics.EXTIVK_DIFF+"\n";
				    useCaseEvaluationStr += "EXTCLL_SAD: "+modelAnalytics.EXTCLL_DIFF+"\n";
				    useCaseEvaluationStr += "TRAN_NA: "+modelAnalytics.TRAN_NA+"\n";
				    useCaseEvaluationStr += "TN_ALY: "+modelAnalytics.TN+"\n";
				    useCaseEvaluationStr += "TN_SAD: "+modelAnalytics.TN_DIFF+"\n";
				    useCaseEvaluationStr += "Effort_SAD: "+modelAnalytics.Effort_DIFF+"\n";
				    useCaseEvaluationStr += res.end(useCaseEvaluationStr);
					}
				});
				
				
			});
		}, true);
})

app.get('/', function(req, res){
	var message = req.query.e;
	umlModelInfoManager.queryRepoInfo(userInfo.repoId, function(repoInfo){
//		console.log(repoInfo);
		res.render('index', {repo:repoInfo, message:message});
	});
})

app.get('/signup',function(req,res){
	res.render('signup');
});

app.get('/login',function(req,res){
	res.render('login');
});


app.post('/signup', upload.fields([{name:'email',maxCount:1},{name:'username', maxCount:1},{name:'password', maxCount:1}]),  function (req, res){
	
	var email = req.body['email'];
	var username = req.body['username'];
	var pwd = req.body['password'];
	
    umlModelInfoManager.newUserSignUp(email,username,pwd,function(status,message){
        if(status == 1){
            console.log('success');
            console.log('message'+message);
            res.json({status:'success',message:message});
            
        } else {
             console.log('failed');
             console.log('message'+message);
             res.json({status:'failure',message:message});
        }
    });

})

app.post('/login', upload.fields([{name:'username', maxCount:1},{name:'password', maxCount:1}]),  function (req, res){
	
	var username = req.body['username'];
	var pwd = req.body['password'];
	 umlModelInfoManager.validateUserLogin(username,pwd,function(status,message){
        if(status == 1){
        	res.json({status:'success',message:message});
        } else {
        	res.json({status:'failure',message:message});
        }
    });
	
})

var server = app.listen(8081,'127.0.0.1', function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})