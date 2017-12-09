var express = require('express');
var app = express();
var fs = require("fs");
var admZip = require('adm-zip');
var umlModelAnalyzer = require("./UMLModelAnalyzer.js");
var umlFileManager = require("./UMLFileManager.js");
var umlEvaluator = require("./UMLEvaluator.js");
var umlModelInfoManager = require("./UMLModelInfoManagerMongoDB.js");
var umlEstimator = require("./UMLEstimator.js");
//var COCOMOCalculator = require("./COCOMOCalculator.js");
var multer = require('multer');
var jade = require('jade');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var cookieParser = require('cookie-parser');
//var sleep = require('sleep');
var nodemailer = require('nodemailer');
var RScriptUtil = require('./utils/RScriptUtil.js');
var bodyParser = require('body-parser');


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
        cb(null, fileName)
        umlSurveyFiles.push(fileName);
		console.log("saved the file " + fileName + " in " + fileDestination);
    }
})

var upload = multer({ storage: storage });
var surveyUploads = multer({ storage: surveyFiles });

app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));


app.set('views', './views');
app.set('view engine', 'jade');

//var userInfo = {
//		userName: "kqi",
//		password: "123456",
////		repoId:"59739373e190cc204c5ffeb1" // for resilient agile
//		repoId:"598c93a9a9813b12105c953e"
//}

var modelInfo = {};


//GIT API TEST
app.get('/testgitapirepos', function(req,response){
	var GitHubApi = require('github')

	var github = new GitHubApi({
	})

	// TODO: optional authentication here depending on desired endpoints. See below in README.

	github.repos.getForUser({
	    // optional
	    // headers: {
	    //     "cookie": "blahblah"
	    // },
	  username: 'kritikavd'
	}, function (err, res) {
	  if (err) throw err
	  response.json(res);

	});
});



app.get('/testgitapiuser', function(req,response){
	var GitHubApi = require('github')

	var github = new GitHubApi({
	})

	github.search.users({
	  q: 'kvaid@usc.edu in:email'
	}, function (err, res) {
	  if (err) throw err
	  response.json(res);
	  //console.log(JSON.stringify(res))
	});
});


app.get('/testgitapionecommit', function(req,response){
	var GitHubApi = require('github')

	var github = new GitHubApi({
	})

	github.gitdata.getCommit({
		owner: 'kritikavd',
		  repo: 'Web-Tech-Assignments',
		  sha :'c904b7eb886086665382162ad123555efb66be35'
	}, function (err, res) {
	  if (err) throw err
	  response.json(res);
	});

});


app.get('/testgitapiallcommit', function(req,response){
	var GitHubApi = require('github')

	var github = new GitHubApi({
	})

	github.repos.getCommits({
		owner: 'kritikavd',
		  repo: 'node-github',
	}, function (err, res) {
	  if (err) throw err
	  response.json(res);
	});
	
});

app.get('/testgitapiallcommitlast', function(req,response){
	var GitHubApi = require('github')

	var github = new GitHubApi({
	})
	
	github.repos.getCommits({
		owner: 'kritikavd',
		  repo: 'node-github',
		  page : 36,
	}, function (err, res) {
	  if (err) throw err
	  response.json(res);
	});

});


app.get('/testgitapifollowing', function(req,response){
	var GitHubApi = require('github')

	var github = new GitHubApi({
	})

	github.users.getFollowingForUser({
	    // optional
	    // headers: {
	    //     "cookie": "blahblah"
	    // },
	  username: 'defunkt'
	}, function (err, res) {
	  if (err) throw err
	  response.json(res);
	})
});

// END OF TEST GIT API

app.get('/signup',function(req,res){

	if(req.query.tk!=null && req.query.tk!=undefined){
		res.render('signup', {tk:req.query.tk});
	} else {
	res.render('signup');
	}
});

app.get('/login',function(req,res){
	res.render('login');
});

app.post('/login', upload.fields([{name:'username', maxCount:1},{name:'password', maxCount:1}]),  function (req, res){

	var username = req.body['username'];
	var pwd = req.body['password'];
	umlModelInfoManager.validateUserLogin(username,pwd,function(result,message){
        res.json(result);
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


//route middleware to verify a token
app.use(function(req, res, next) {

	var token =undefined ;
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
		    	if(req.userInfo.isEnterprise){
		    		req.userInfo.enterpriseUserId = user.enterpriseUserId;
		    	}
		    	req.userInfo.email = user.email;

		     next();

		 	  });
		   }
		 });

	} else {

	 // if there is no token
		res.redirect('/login');
	}

});

app.get('/savegitinfo', function(req,res){
	
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

	var profileInfo = {}

	profileInfo.userName = req.userInfo.userName;
	profileInfo.email = req.userInfo.email;
	profileInfo.isEnterprise = req.userInfo.isEnterprise?true:false;
	
	umlModelInfoManager.getGitData(req.userInfo._id, function(gitData, success, msg){
		if(success==true){
			profileInfo.gitData = gitData;
		}
	res.render('profile', {profileInfo:profileInfo});
	});

})

app.get('/inviteUser',function(req,res){
	res.render('invite');
});

app.post('/inviteUser', upload.fields([{name:'email',maxCount:1}]),  function (req, res){

	var email = req.body['email'];
	var enterpriseUserId = req.userInfo._id;
	var smtpTransport = nodemailer.createTransport({
	    service: "gmail",
	    host: "smtp.gmail.com",
	    auth: {
	        user: "kritikavaid123@gmail.com",
	        pass: "Strong123"
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
    umlModelInfoManager.saveSurveyAnalyticsData(req.query.uuid, req.query.ip, req.query.page);
    // console.log(data)
    // res.sendStatus(200);
});


app.post('/uploadSurveyData', surveyUploads.fields([{name: 'uml_file', maxCount: 1}, {name: 'uml_other', maxCount:1}]), function (req, res){
	console.log(req.body);
	var formInfo = req.body;
    // console.log(umlSurveyFiles);

    // save the file names in DB
    formInfo.uml_file = (umlSurveyFiles[0]==undefined) ? "" : umlSurveyFiles[0];
    formInfo.uml_other = (umlSurveyFiles[1]==undefined) ? "" : umlSurveyFiles[1];
	umlModelInfoManager.saveSurveyData(formInfo);
	res.redirect("thankYou");
});


app.post('/uploadUMLFile', upload.fields([{name:'uml-file',maxCount:1},{name:'uml-model-name', maxCount:1},{name:'uml-model-type', maxCount:1}, {name:'repo-id', maxCount:1}]), function (req, res){
	console.log(req.body);
	var umlFilePath = req.files['uml-file'][0].path;
	var umlModelName = req.body['uml-model-name'];
	var umlModelType = req.body['uml-model-type'];
	var repoId = req.userInfo.repoId;
	var uuidVal = req.body['uuid'];
	var formInfo = req.body;
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		var umlFileInfo = umlFileManager.getUMLFileInfo(repoInfo, umlFilePath, umlModelType, formInfo);
		console.log('umlFileInfo => ' + JSON.stringify(umlFileInfo));
		var modelInfo = umlModelInfoManager.initModelInfo(umlFileInfo, umlModelName,repoInfo);
		console.log('updated model info');
		console.log(modelInfo);
		umlModelAnalyzer.extractModelInfo(modelInfo, function(modelInfo){
			//update model analytics.
			console.log("model is extracted");
			umlEvaluator.evaluateModel(modelInfo, function(){
				console.log("model analysis complete");
			});
//			console.log(modelInfo);

			umlModelInfoManager.saveModelInfo(modelInfo, repoId, function(modelInfo){
//				console.log(modelInfo);
				umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
					console.log("=============repoInfo==========");
					console.log(repoInfo);
					res.render('mainPanel', {repoInfo:repoInfo});
				}, true);
			});
		});
	});
});


//This funtion is same as loadEmpiricalUsecaseDataForRepo, except we just take file from user input and pass it down.
app.post('/uploadUseCaseFile', upload.fields([{name:'usecase-file',maxCount:1}, {name:'repo-id', maxCount:1}]), function(req, res) {
	console.log('/uploadUseCaseFile');
	var usecaseFilePath = req.files['usecase-file'][0].path;
	var repoId = req.userInfo.repoId;
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		umlEvaluator.loadUseCaseEmpirics(repoInfo, function(repo){
			if(!repo){
				res.end('load error!');
				return;
			}
			umlModelInfoManager.updateRepoInfo(repo, function(repoInfo){
					res.redirect('/');
			});
		}, usecaseFilePath);
	});
})

app.post('/uploadModelFile', upload.fields([{name:'model-file',maxCount:1}, {name:'repo-id', maxCount:1}]), function(req, res) {
	console.log('/uploadModelFile');
	var modelFilePath = req.files['model-file'][0].path;
	var repoId = req.userInfo.repoId;
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		umlEvaluator.loadModelEmpirics(repoInfo, function(repo){
			if(!repo){
				res.end('load error!');
				return;
			}
			umlModelInfoManager.updateRepoInfo(repo, function(repoInfo){
					res.redirect('/');
			});

		}, modelFilePath);
	});
})

app.post('/uploadCOCOMOFile', upload.fields([{name:'COCOMO-file',maxCount:1}, {name:'repo-id', maxCount:1}]), function(req, res) {
	console.log('/uploadCOCOMOFile');
	var COCOMOFilePath = req.files['COCOMO-file'][0].path;
	var repoId = req.userInfo.repoId;
	res.end('<h1>function is not implemented');
	// COCOMOCalculator.loadCOCOMOData(repoId, function(repoInfo){
	// 	umlModelInfoManager.updateRepoInfo(repoInfo, function(repoInfo){
	// 		console.log(modelInfo);
	// 		res.redirect('/');
	// 	});
	// }, COCOMOFilePath);
})

/*
 * To integrate the model version control system, to reflect the evolution of the architecture for certain process.
 */
app.post('/uploadUMLFileVersion', upload.fields([{name:'uml-file',maxCount:1},{name:'uml-model-type', maxCount:1}, {name:'repo-id', maxCount:1}, {name:'model-id', maxCount:1}]), function (req, res){
	console.log("/uploadUMLFileVersion");
	var umlFilePath = req.files['uml-file'][0].path;
	var umlModelType = req.body['uml-model-type'];
	var modelId = req.body['model-id'];
	var repoId = req.userInfo.repoId;
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		var umlFileInfo = umlFileManager.getUMLFileInfo(repoInfo, umlFilePath, umlModelType);
//		console.log('umlFileInfo');
		umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo){
			var modelInfoVersion = umlModelInfoManager.createModelInfoVersion(umlFileInfo, modelInfo);
			umlModelAnalyzer.extractModelInfo(modelInfoVersion, function(modelInfoVersion){
			//update model analytics.
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
	console.log("/deleteModel");
	var modelId = req.query['model_id'];
	var repoId = req.userInfo.repoId;
	var reanalyzeRepo = req.query['reanalyse_repo'];
	var reanalyseRepo = false;
	umlModelInfoManager.deleteModel(repoId, modelId, function(result){
		if(!result){
			res.end('delete error!');
			return;
		}

		if(reanalyseRepo){
		 queryRepoInfo(repoId, function(repoInfo){
		      console.log(repoInfo);
		      umlModelAnalyzer.analyseRepo(repoInfo, function(){
					console.log("model analysis is complete");
				});
				updateRepo(repoInfo, function(){
//					umlFileManager.deleteDir(function(result){

//					});

					res.redirect('/');

				});
			});
		}
		else{
		res.redirect('/');
		}
	});
})


app.get('/reanalyseModel', function (req, res){
	console.log("/reanalyseModel");
	var modelId = req.query['model_id'];
	var repoId = req.userInfo.repoId;
	umlModelInfoManager.queryModelInfo(modelId, req.userInfo.repoId, function(modelInfo){
		umlModelAnalyzer.extractModelInfo(modelInfo, function(modelInfo){
			//update model analytics.
			umlEvaluator.evaluateModel(modelInfo, function(){
				console.log("model analysis complete");
			});
//			console.log(modelInfo);
			umlModelInfoManager.updateModelInfo(modelInfo, repoId, function(modelInfo){
//				console.log(modelInfo);
				umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo){
					console.log("=============repoInfo==========");
//					console.log(repoInfo);
					res.render('modelDetail', {modelInfo:modelInfo, repo_id: repoId});
				});
			});
		});
	});
})


app.get('/requestDomainModelDetail', function (req, res){
	console.log("/requestDomainModelDetail");
	var modelId = req.query['model_id'];
	var repoId = req.userInfo.repoId;
//	console.log(modelId);
	umlModelInfoManager.queryDomainModelDetail(modelId, repoId, function(domainModel){
		if(!domainModel){
			res.end('delete error!');
			return;
		}
//		console.log(domainModel);
		res.render('domainModelDetail',{domainModel: domainModel});
	});
})


app.get('/loadEmpiricalUsecaseDataForRepo', function (req, res){
	console.log("/loadEmpiricalUsecaseDataForRepo");
	var repoId = req.userInfo.repoId
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
	var repoId = req.userInfo.repoId
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


app.get('/getUseCaseAnalyticsForModelCSV', function (req, res){
	console.log("/getUseCaseAnalyticsForModelCSV");
	var modelId = req.query['model_id'];
	var repoId = req.userInfo.repoId;

		umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo){
			umlFileManager.loadCSVFileAsString(modelInfo.OutputDir+"/"+modelInfo.UseCaseEvaluationFileName, function(csvData){
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
	var repoId = req.userInfo.repoId;

	umlModelInfoManager.queryUseCaseInfo(repoId, modelId, useCaseId, function(useCaseInfo){
		console.log("useCase analytics name");
//		console.log(useCaseInfo.Name);
		useCaseInfo.CCSS = CCSS;
		useCaseInfo.IT = IT;
		useCaseInfo.ILF = ILF;
		useCaseInfo.ELF = ELF;
		useCaseInfo.EI = EI;
		useCaseInfo.EO = EO;
		useCaseInfo.EQ = EQ;
		useCaseInfo.Effort = Effort;
//		useCaseInfo.useCaseInfo = useCaseInfo;
		umlModelInfoManager.updateUseCaseInfo(repoId, modelId, useCaseInfo, function(useCaseInfo){
//			console.log(useCaseInfo);
			res.render('useCaseDetail', {useCaseInfo:useCaseInfo,modelId:modelId,repoId:repoId});
		});
	});

})

//app.post('/uploadModelEvaluation', upload.fields([{name:'ueucw',maxCount:1},{name:'uexucw', maxCount:1},{name:'uaw', maxCount:1},{name:'tcf',maxCount:1},{name:'ef', maxCount:1},{name:'afp', maxCount:1},{name:'vaf', maxCount:1},{name:'ph', maxCount:1}, {name:'model-id',maxCount:1}]),  function (req, res){
//	console.log("/uploadModelEvaluation");
//	var uploadModelEvaluation = {
//	UEUCW : req.body['ueucw'],
//	UEXUCW : req.body['uexucw'],
//	UAW : req.body['uaw'],
//	TCF : req.body['tcf'],
//	EF : req.body['ef'],
//	AFP : req.body['afp'],
//	VAF : req.body['vaf'],
//	Effort : req.body['ph']
//	}
//	
//	modelId = req.body['model-id'];
//	repoId = req.userInfo.repoId;
//	
//	console.log("model-id:"+modelId);
//	
//	umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo, modelInfo){
//		for(var i in uploadModelEvaluation){
//			if(uploadModelEvaluation[i]){
//				modelAnalytics[i] = uploadModelEvaluation[i];
//			}
//		}
//		
//		modelInfo.ModelAnalytics = modelAnalytics;
//		umlModelInfoManager.updateModelInfo(modelInfo, repoId, function(modelInfo){
////			console.log(modelInfo.ModelAnalytics);
//			res.render('modelAnalytics', {modelAnalytics:modelInfo.ModelAnalytics, repo_id: repoId});
//		});
//	});
//	
//})


app.get('/queryExistingModelsTest', function(req, res){
	console.log("/queryExistingModelsTest");
	var projectId = "13d24325-9c00-275e-1e69-131bde0f";
	var modelInfo = umlModelInfoManager.queryExistingModelsTest(projectId, function(result){
		res.end(JSON.stringify(result));
	});
//	var useCase = modelInfo.useCases[modelInfoId];

})

app.get('/queryModelInfo', function(req, res){
	var modelId = req.query.model_id;
	var repoId = req.userInfo.repoId;
	umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo){
//		console.log('model Analytics');
		//console.log(modelAnalytics);
		console.log(modelInfo);
		res.render('modelDetail', {modelInfo:modelInfo, repo_id:repoId});
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


app.get('/requestModelUseCases', function(req, res){
	var modelId = req.query.model_id;
	umlModelInfoManager.queryModelInfo(modelId, req.userInfo.repoId, function(modelInfo){
//		console.log(modelInfo);
		res.render('useCaseList', {modelInfo:modelInfo});
	    });
})

//app.get('/addRepo', function(req, res){
//	var userId = req.query.user_id;
//	var password = req.query.password;
//	if(userId === "flyqk" && password === "123456"){
//	umlModelInfoManager.createRepo(userId,password,function(repo){
//		console.log(repo);
//		res.end('database is set up');
//	    });
//	}
//})


app.get('/requestUseCaseDetail', function(req, res){
	var useCaseId = req.query.useCase_id;
	var modelId = req.query.model_id;
	var repoId = req.userInfo.repoId;
	umlModelInfoManager.queryUseCaseInfo(repoId, modelId, useCaseId, function(useCaseInfo){
//				console.log('use case detail');
//				console.log(useCaseInfo);
		for(var i in useCaseInfo.Diagrams){
//		console.log(useCaseInfo.Diagrams[i]['Paths']);
		}
				res.render('useCaseDetail', {useCaseInfo:useCaseInfo, modelId:modelId,repoId:repoId});
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
	//temporary analysis
	var repoId = req.query.repo_id;

//	console.log(refresh);
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		umlModelInfoManager.reloadRepo(repoInfo, function(repoInfo){
			if(!repoInfo){
				res.end("error");
				return;
			}
			umlModelInfoManager.updateRepo(repoInfo, function(repoInfo){
				res.end("success");
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
		umlEvaluator.evaluateRepo(repoInfo, function(repoInfo){
//			var modelEvaluationData = umlFileManager.parseCSVData(modelEvaluationStr, true);
//			umlEstimator.runLinearRegression(repoInfo, modelEvaluationData, x, y, function(calibrationResults){
//				console.log(calibrationResults);
//				if(calibrationResults === false){
//					res.end("error");
//				}
//				else{
//					res.render('calibrationResult', {calibrationResult:calibrationResults[x], ver: new Date().getTime()});
//				}
//			});

		}, false);
		});
	}
	else{
		res.end(estimator);
	}
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
				umlEvaluator.evaluateRepo(repoInfo, function(repoInfo){
					var command = './Rscript/RepoDiscriptiveAnalysis.R "'+repoInfo.OutputDir+"/"+repoInfo.RepoEvaluationForUseCasesFileName+'" "'+repoInfo.OutputDir+"/"+repoInfo.RepoEvaluationForModelsFileName+'" "'+repoInfo.OutputDir+'" "."';

					//	console.log('generate model Analytics');
//					console.log(command);
					RScriptUtil.runRScript(command, function(result){
						if(result){
							res.end('success');
						}
						else {
							res.end('error');
						}
					});
				});
		});
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
			umlEvaluator.evaluateRepo(repoInfo, function(repoInfo){
//				if(modelEvaluationStr){
//				console.log(repoEvaluationResult.repoEvaluationStr);
//				res.end(modelEvaluationStr);
//				}
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
			umlEvaluator.evaluateRepo(repoInfo, function(repoInfo){
//				if(useCaseEvaluationStr){
//				console.log(repoEvaluationResult.repoEvaluationStr);
//				res.end(useCaseEvaluationStr);
//				}
			});
		});
})

app.get('/evaluateModelForUseCases', function(req, res){
	var modelId = req.query.model_id;
//	var modelId = "a08440f186a8d13192784845c7301f981499148138239";
	var repoId = req.userInfo.repoId;
	var simulation = false;
	umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo){
			umlEvaluator.evaluateModel(modelInfo, function(modelInfo){

				umlModelInfoManager.updateModelInfo(modelInfo, repoId, function(modelInfo){
//					console.log(modelInfo);
					if(useCaseEvaluationStr){
						// calculateObserluteDifferences

//					console.log(modelEvaluationResult.usecaseEvaluationStr);
//					var modelAnalytics = modelInfo.ModelAnalytics;
					useCaseEvaluationStr += "this part nees to improve";
//				    useCaseEvaluationStr += "CCSS_SAD: "+modelAnalytics.CCSS_DIFF+"\n";
////				    useCaseEvaluationStr += "IT_SAD: "+modelAnalytics.IT_DIFF+"\n";
//				    useCaseEvaluationStr += "EI_SAD: "+modelAnalytics.EI_DIFF+"\n";
//				    useCaseEvaluationStr += "EO_SAD: "+modelAnalytics.EO_DIFF+"\n";
//				    useCaseEvaluationStr += "EQ_SAD: "+modelAnalytics.EQ_DIFF+"\n";
//				    useCaseEvaluationStr += "FUNC_NA: "+modelAnalytics.FUNC_NA+"\n";
//				    useCaseEvaluationStr += "FN_ALY: "+modelAnalytics.FN+"\n";
//				    useCaseEvaluationStr += "FN_SAD: "+modelAnalytics.FN_DIFF+"\n";
//				    useCaseEvaluationStr += "DM_SAD: "+modelAnalytics.DM_DIFF+"\n";
//				    useCaseEvaluationStr += "INT_SAD: "+modelAnalytics.INT_DIFF+"\n";
//				    useCaseEvaluationStr += "CTRL_SAD: "+modelAnalytics.CTRL_DIFF+"\n";
//				    useCaseEvaluationStr += "EXTIVK_SAD: "+modelAnalytics.EXTIVK_DIFF+"\n";
//				    useCaseEvaluationStr += "EXTCLL_SAD: "+modelAnalytics.EXTCLL_DIFF+"\n";
//				    useCaseEvaluationStr += "TRAN_NA: "+modelAnalytics.TRAN_NA+"\n";
//				    useCaseEvaluationStr += "TN_ALY: "+modelAnalytics.TN+"\n";
//				    useCaseEvaluationStr += "TN_SAD: "+modelAnalytics.TN_DIFF+"\n";
//				    useCaseEvaluationStr += "Effort_SAD: "+modelAnalytics.Effort_DIFF+"\n";
				    res.end(useCaseEvaluationStr);
					}
				});
			});
		}, true);
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
	res.redirect('/')
});

app.get('/', function(req, res){
		var message = req.query.e;

		umlModelInfoManager.queryRepoInfo(req.userInfo.repoId, function(repoInfo){
//			console.log(req.userInfo);

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

						res.render('index', {repoInfo:repoInfo, message:message,isEnterprise : req.userInfo.isEnterprise});


					});
				});

			} else {

				res.render('index', {repoInfo:repoInfo, message:message,isEnterprise : req.userInfo.isEnterprise});
			}


	});
});

app.get('/thankYou', function(req, res){
	res.render('thankYou');
});


var sequenceDiagramParser = require("./model_platforms/ea/XMI2.1Parserv1.1.js")
app.get('/testSequenceDiagramExtraction', function(req, res){
	sequenceDiagramParser.extractSequenceDiagrams("./temp/test_example.xml", function(sequenceDiagrams){
		res.json(sequenceDiagrams);
	});
});

app.get('/testRobustnessDiagramExtraction', function(req, res){
	sequenceDiagramParser.extractRobustnessDiagrams("./temp/test_example.xml", function(robustnessDiagrams){
		res.json(robustnessDiagrams);
	});
});

app.get('/testActivityDiagramExtraction', function(req, res){
	sequenceDiagramParser.extractActivityDiagrams("./temp/test_example.xml", function(activityDiagrams){
		res.json(activityDiagrams);
	});
});

app.get('/deleteUser', function(req,res){
	var userId = req.query['uid'];
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


var server = app.listen(8081,'127.0.0.1', function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)

})

