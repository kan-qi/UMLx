var express = require('express');
var app = express();
var fs = require("fs");
var path = require('path')
var admZip = require('adm-zip');
var umlModelExtractor = require("./UMLModelExtractor.js");
var umlFileManager = require("./UMLFileManager.js");
var umlEvaluator = require("./UMLEvaluator.js");
var umlModelInfoManager = require("./UMLModelInfoManagerMongoDB.js");
var effortPredictor = require("./model_estimator/EffortPredictor.js");
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

//var csv=require('csvtojson')
//var removeDir = require('some-custom-fs');
//var effortPredictor = require("./model_estimator/ProjectEffortEstimator.js");

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
        //console.log("--------------1-------------");
        //console.log(file.originalname);
        var fileName = Date.now()+ "-" + file.originalname;
        //console.log("--------------0-------------");
        //console.log(fileName);
        cb(null, fileName);
        //umlSurveyFiles.push(fileName);
        //console.log(umlSurveyFiles);
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
app.get('/estimationPage',function(req,res){
	res.render('estimationPage');
});
app.get('/signup',function(req,res){

	if(req.query.tk!=null && req.query.tk!=undefined){
		res.render('signup', {tk:req.query.tk});
	} else {
	res.render('signup');
	}
});

app.get('/login',function(req,res){
//	res.render('login');
	res.redirect('/surveyproject');
});

app.get('/logout',function(req,res){
	if(req.cookies){
		req.cookies.appToken = null;
	}
	
	res.redirect('/login');
});

app.post('/login', upload.fields([{name:'username', maxCount:1},{name:'password', maxCount:1}]),  function (req, res){

	res.end("error");
	return;

	var username = req.body['username'];
	var pwd = req.body['password'];
	umlModelInfoManager.validateUserLogin(username,pwd,function(result,message){
        res.json(result);
    });

})


app.post('/updateModel', function (req, res){

   // var obj = JSON.parse(JSON.stringify(req.body));
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

//app.get("/getModelInfoStatiscs", function(req, res){
//	umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo){
////		var modelInfoVersion = umlModelInfoManager.createModelInfoVersion(umlFileInfo, modelInfo);
////		umlModelExtractor.extractModelInfo(modelInfoVersion, function(modelInfoVersion){
////		//update model analytics.
//if(!modelInfoVersion){
//	res.end("error");
//	return;
//}
//////		console.log(modelInfo);
////		umlEvaluator.evaluateModel(modelInfoVersion, function(){
////			console.log("model analysis complete");
////		});
////
////		umlModelInfoManager.pushModelInfoVersion(modelId, repoId, modelInfoVersion, function(modelInfo){
//////			console.log(modelInfo);
//			if(!modelInfo){
//				res.end('model doesn\'t exist!');
//			}
//////			res.render('modelAnalytics', {modelAnalytics:modelInfo.ModelAnalytics, repo_id:repoId});
////		});
//
//	});
//});
//
//app.get("getRepoInfoStatistics", function(req, res){
//	
//});

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


app.post('/uploadSurveyData', surveyUploads.fields([{name: 'project_plans', maxCount: 1}, {name: 'requirements', maxCount:1},
	{name: 'use_cases', maxCount: 1}, {name: 'uml_file', maxCount: 1}, {name: 'uml_other', maxCount:1}]), function (req, res){
	console.log(req.body);
	var formInfo = req.body;

	console.log("==========req.files=============");
    console.log(req.files);

    // save the file names in DB
    // formInfo.project_plans = (umlSurveyFiles[0]==undefined) ? "" : umlSurveyFiles[0];
    // formInfo.requirements = (umlSurveyFiles[1]==undefined) ? "" : umlSurveyFiles[1];
    // formInfo.use_cases = (umlSurveyFiles[2]==undefined) ? "" : umlSurveyFiles[2];
    // formInfo.uml_file = (umlSurveyFiles[3]==undefined) ? "" : umlSurveyFiles[3];
    // formInfo.uml_other = (umlSurveyFiles[4]==undefined) ? "" : umlSurveyFiles[4];

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
	var userID = req.userInfo._id;
    	
	
	profileInfo.userName = req.userInfo.userName;
	profileInfo.email = req.userInfo.email;
	profileInfo.isEnterprise = req.userInfo.isEnterprise?true:false;
	
	umlModelInfoManager.getGitData(req.userInfo._id, function(gitData, success, msg){
		if(success==true){
			profileInfo.gitData = gitData;
		}
	
		umlModelInfoManager.queryRepoFromUser(userID, function(result, message){
        		res.render('profile', {profileInfo:profileInfo, profileRep:result.Repos[0]});
	   	});
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


app.post('/uploadUMLFile', upload.fields([{ name: 'uml-file', maxCount: 1 }, { name: 'uml-other', maxCount: 1 },
    { name: 'uml-model-name', maxCount: 1 }, { name: 'uml-model-type', maxCount: 1 }, { name: 'repo-id', maxCount: 1 }]), function (req, res) {
	
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

        res.redirect('/');

	} else {
		return false;
	}
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
			console.log('updated model info');
			console.log(modelInfo);
			umlModelExtractor.extractModelInfo(modelInfo, function(modelInfo){
				//update model analytics.
				console.log("model is extracted");
				if(!modelInfo){
					res.end("error");
					return;
				}
				umlEvaluator.evaluateModel(modelInfo, function(modelInfo2){
					console.log("model analysis complete");
					
					if(!modelInfo2){
						 res.redirect('/');
						 return;
					}

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
							 res.redirect('/');
                            // }, 1000);
                            //window.location.reload(true);
                        });
                    });
				});
	//			console.log(modelInfo);

/*
				umlModelInfoManager.saveModelInfo(modelInfo, repoId, function(modelInfo){
	//				console.log(modelInfo);
					umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
						console.log("=============repoInfo==========");
						console.log(repoInfo);
						res.render('mainPanel', {repoInfo:repoInfo});
						//res.redirect('/');
					}, true);
				});
*/
			});
		});
	}

});

app.get('/uploadUMLFileCompany', function(req, res){
	console.log('============gettoweb============');
	res.redirect('/');
})


//This funtion is same as loadEmpiricalUsecaseDataForRepo, except we just take file from user input and pass it down.
app.post('/uploadUseCaseFile', upload.fields([{name:'usecase-file',maxCount:1}, {name:'repo-id', maxCount:1}]), function(req, res) {
	console.log('/uploadUseCaseFile');
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

//app.post('/uploadCOCOMOFile', upload.fields([{name:'COCOMO-file',maxCount:1}, {name:'repo-id', maxCount:1}]), function(req, res) {
//	console.log('/uploadCOCOMOFile');
//	var COCOMOFilePath = req.files['COCOMO-file'][0].path;
//	var repoId = req.userInfo.repoId;
//	res.end('<h1>function is not implemented');
//	// COCOMOCalculator.loadCOCOMOData(repoId, function(repoInfo){
//	// 	umlModelInfoManager.updateRepoInfo(repoInfo, function(repoInfo){
//	// 		console.log(modelInfo);
//	// 		res.redirect('/');
//	// 	});
//	// }, COCOMOFilePath);
//})

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
//	console.log("/deleteModel");
	var modelId = req.query['model_id'];
	var repoId = req.userInfo.repoId;
	console.log("/deleteModel");
//	var reanalyzeRepo = req.query['reanalyse_repo'];
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

app.get('/reanalyseRepo', function (req, res){
//	console.log("/reanalyseRepo");
//	app.get('/queryRepoInfo', function(req, res){
		//temporary analysis
		var repoId = req.userInfo.repoId;

//		console.log(refresh);
		umlModelInfoManager.queryFullRepoInfo(repoId, function(repoInfo){
//			console.log("start");
//			console.log(repoInfo);
//			console.log("done");		
			
//   			var debug = require("./utils/DebuggerOutput.js");
//   			debug.writeJson("new_full_repo_info_"+repoId, repoInfo);
            console.log("==================SURPRISE================");
			umlEvaluator.evaluateRepo(repoInfo, function(repoInfo){

//				this repofo information only has repo structure but no actual data.
				
				umlModelInfoManager.updateRepoInfo(repoInfo, function(){
//					umlFileManager.deleteDir(function(result){

//					});
				
					res.redirect('/');
//					res.render('repoDetail', {modelInfo:modelInfo, repo_id: repoId});

				});
			});
//		});
	});
})


app.get('/requestRepoBrief', function (req, res){
//	console.log("/reanalyseRepo");
//	app.get('/queryRepoInfo', function(req, res){
		//temporary analysis
		var repoId = req.userInfo.repoId;

		console.log("refresh");
		umlModelInfoManager.requestRepoBrief(repoId, function(repoInfoBrief){
			console.log('==========totalRec===========');
			// console.log(totalRec);
            repoInfoBrief.projectNum[repoInfoBrief.projectNum.length - 1] = totalRec;
            repoInfoBrief.NT[repoInfoBrief.NT.length - 1] = totalNT;
            repoInfoBrief.UseCaseNum[repoInfoBrief.UseCaseNum.length - 1] = totalUseCaseNum;
            repoInfoBrief.EntityNum[repoInfoBrief.EntityNum.length - 1] = totalEntityNum;

				res.end(JSON.stringify(repoInfoBrief));
			});
})

app.get('/queryAllModelNames', function (req, res){
//	console.log("/reanalyseRepo");
//	app.get('/queryRepoInfo', function(req, res){
		//temporary analysis
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

                umlModelInfoManager.updateModelInfo(modelInfo2, repoId, function(modelInfo){
//				console.log(modelInfo);
//				umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo){
//					console.log("=============repoInfo==========");
//					console.log(repoInfo);
                    //res.render('modelDetail', {modelInfo:modelInfo, repo_id: repoId});
                    console.log("Re ana Now is good!1");
                    //console.log(modelAnalytics);
                    console.log(modelInfo);
                    var uploadsFile = modelInfo.fileUrl;
                    uploadsFile = uploadsFile.substring(0, uploadsFile.length - 33);
                    console.log(uploadsFile);
                    res.render('modelDetail', { modelInfo: modelInfo, repo_id: repoId, upLoadsPath: uploadsFile });
                    console.log("Re ana Now is good!2");

//				});
                });
			});
//			console.log(modelInfo);

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
		console.log("domain model");
		console.log(domainModel);
		res.render('domainModelDetail',{domainModel: domainModel});
	});
})


//app.get('/loadEmpiricalUsecaseDataForRepo', function (req, res){
//	console.log("/loadEmpiricalUsecaseDataForRepo");
//	var repoId = req.userInfo.repoId
//	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
//	umlEvaluator.loadUseCaseEmpiricsForRepo(repoInfo, function(repo){
//		if(!repo){
//			res.end('load error!');
//			return;
//		}
//
////		umlEvaluator.evaluateRepo(repo, function(){
////			console.log("repo analysis complete");
////		});
////		console.log(repo);
////		console.log(modelInfo);
//		umlModelInfoManager.updateRepoInfo(repo, function(repoInfo){
////			console.log(modelInfo);
//				res.redirect('/');
//		});
//
//	});
//	});
//})

//app.get('/loadEmpiricalModelDataForRepo', function (req, res){
//	console.log("/loadEmpiricalModelDataForRepo");
//	var repoId = req.userInfo.repoId
//	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
//	umlEvaluator.loadModelEmpiricsForRepo(repoInfo, function(repo){
//		if(!repo){
//			res.end('load error!');
//			return;
//		}
//
////		umlEvaluator.evaluateRepo(repo, function(){
////			console.log("repo analysis complete");
////		});
////		console.log(repo);
////		console.log(modelInfo);
//		umlModelInfoManager.updateRepoInfo(repo, function(repoInfo){
////			console.log(modelInfo);
//				res.redirect('/');
//		});
//
//	});
//	});
//})

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


//app.get('/getUseCaseAnalyticsForModelCSV', function (req, res){
//	console.log("/getUseCaseAnalyticsForModelCSV");
//	var modelId = req.query['model_id'];
//	var repoId = req.userInfo.repoId;
//
//		umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo){
//			umlFileManager.loadCSVFileAsString(modelInfo.OutputDir+"/"+modelInfo.UseCaseEvaluationFileName, function(csvData){
//				if(csvData){
//					res.end(csvData);
//				}
//			})
//	});
//})

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

	// MongoClient.connect(url, function (err, db) {
	//     if (err) throw err;

	// });
	umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo){
		console.log("Now is good!1");
		//console.log(modelAnalytics);
		console.log(modelInfo);
		var uploadsFile = modelInfo.fileUrl;
		uploadsFile = uploadsFile.substring(0, uploadsFile.length - 33);
		console.log(uploadsFile);
		res.render('modelDetail', { modelInfo: modelInfo, repo_id: repoId, upLoadsPath: uploadsFile });
		console.log("Now is good!2");
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
		// console.log("AAAAAAAAAAAAAAAAAAAAA");
		// console.log(modelInfo);
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
//		for(var i in useCaseInfo.Diagrams){
//		console.log(useCaseInfo.Diagrams[i]['Transactions']);
//		}
		
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
	//temporary analysis
	var repoId = req.userInfo.repoId;

//	console.log(refresh);
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		umlModelInfoManager.reloadRepo(repoInfo, function(repoInfo){
			if(!repoInfo){
				res.end("error");
				return;
			}
			umlModelInfoManager.updateRepoInfo(repoInfo, function(repoInfo){
				res.redirect('/');
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
			var modelEvaluationData = umlFileManager.parseCSVData(modelEvaluationStr, true);
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

app.post('/predictProjectEffort', upload.fields([{name:'distributed_system',maxCount:1},{name:'response_time', maxCount:1},{name:'end_user_efficiency', maxCount:1},{name:'complex_internal_processing', maxCount:1},{name:'code_must_be_reusable', maxCount:1}
,{name:'easy_to_install', maxCount:1},{name:'easy_to_use', maxCount:1},{name:'portable', maxCount:1},{name:'easy_to_change', maxCount:1},{name:'concurrent', maxCount:1}
,{name:'includes_special_security_objectives', maxCount:1},{name:'provides_direct_access_for_third_parties', maxCount:1},{name:'special_user_training_facilities_are_required', maxCount:1},{name:'familiar_with_the_project_model_that_is_used', maxCount:1},{name:'application_experience', maxCount:1}
,{name:'object_oriented_experience', maxCount:1},{name:'lead_analyst_capability', maxCount:1},{name:'motivation', maxCount:1},{name:'stable_requirements', maxCount:1},{name:'part_time_staff', maxCount:1}
,{name:'difficult_programming_language', maxCount:1},{name:'uml_file', maxCount:1},{name:'uml_other', maxCount:1}, {name:'estimator', maxCount:1},{name:'model', maxCount:1},{name:'simulation', maxCount:1}]), function(req,res){
	var umlEstimationInfo = {};
	umlEstimationInfo.distributedSystem = req.body['distributed_system'];
	umlEstimationInfo.responseTime = req.body['response_time'];
	umlEstimationInfo.endUserEfficiency = req.body['end_user_efficiency'];
	umlEstimationInfo.complexInternalProcessing = req.body['complex_internal_processing'];
	umlEstimationInfo.codeReusable = req.body['code_must_be_reusable'];
	umlEstimationInfo.easyInstall = req.body['easy_to_install'];
	umlEstimationInfo.easyUse = req.body['easy_to_use'];
	umlEstimationInfo.portable = req.body['portable'];
	umlEstimationInfo.easyToChange = req.body['easy_to_change'];
	umlEstimationInfo.concurrent = req.body['concurrent'];
	umlEstimationInfo.specialSecurityObjectives = req.body['includes_special_security_objectives'];
	umlEstimationInfo.directAccessForThirdParties = req.body['provides_direct_access_for_third_parties'];
	umlEstimationInfo.userTrainingFacilitiesRequired = req.body['special_user_training_facilities_are_required'];
	umlEstimationInfo.familiarWithProjectModel = req.body['familiar_with_the_project_model_that_is_used'];
	umlEstimationInfo.applicationExperience = req.body['application_experience'];
	umlEstimationInfo.objectOrientedExperience = req.body['object_oriented_experience'];
	umlEstimationInfo.leadAnalystCapability = req.body['lead_analyst_capability'];
	umlEstimationInfo.motivation = req.body['motivation'];
	umlEstimationInfo.stableRequirements = req.body['stable_requirements'];
	umlEstimationInfo.partTimeStaff = req.body['part_time_staff'];
	umlEstimationInfo.difficultProgrammingLanguage = req.body['difficult_programming_language'];
//	console.log("files");
//	console.log(req.files);
	umlEstimationInfo.umlFilePath = req.files['uml_file'][0].path;
	umlEstimationInfo.estimator = req.body['estimator'];
	umlEstimationInfo.model = req.body['model'];
//	umlEstimationInfo.otherFilePath = req.files['uml_other'][0].path;
//	umlEstimationInfo.simulation = req.body['simulation'];
	

//app.post('/predictProjectEffort', upload.fields([{name:'uml_file',maxCount:1},{name:'uml_other', maxCount:1}, {name:'repo-id', maxCount:1},{name:'estimator', maxCount:1},{name:'model', maxCount:1}]), function (req, res){
//	console.log(req.body);
	console.log("estimate project effort");
//	if(!req.files['uml_file']){
//		console.log("empty uml file");
//		res.end("error");
//		return;
//	}
//	var otherFilePath = req.files['other_file'][0].path;
//	var umlModelName = req.body['uml-model-name'];
//	var umlModelType = req.body['uml-model-type'];
	umlEstimationInfo.umlModelType = "uml";
	umlEstimationInfo.umlModelName = "query1";
	var repoId = req.userInfo.repoId;
//	var model = req.body['model'];
//	var estimator = req.body['estimator'];
	

//	var sizeMetric = "UEUCW";
	if(umlEstimationInfo.model === "EUCP"){
		umlEstimationInfo.sizeMetric = "EUCP";
		umlEstimationInfo.transactionMetric = "SWTI";
	}
	if(umlEstimationInfo.model === "EXUCP"){
		umlEstimationInfo.sizeMetric = "EXUCP";
		umlEstimationInfo.transactionMetric = "SWTII";
	}
	else{
		umlEstimationInfo.sizeMetric = "DUCP"
		umlEstimationInfo.transactionMetric = "SWTIII";
	}

//	console.log("check");
//	console.log(model);
//	console.log(estimator);

//	var umlFilePath = req.files['uml_file'][0].path;
	
//	model = "EUCP";
//	estimator = "linear";

//	var predictionModel = model+"_"+estimator+"_model.rds";
//	var uuidVal = req.body['uuid'];
//	console.log(repoId);
//	console.log(umlEstimationInfo.umlFilePath);
	var formInfo = req.body;
	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
		var umlFileInfo = umlFileManager.getUMLFileInfo(repoInfo, umlEstimationInfo.umlFilePath, umlEstimationInfo.umlModelType, formInfo);
		console.log('umlFileInfo => ' + JSON.stringify(umlFileInfo));
		var modelInfo = umlModelInfoManager.initModelInfo(umlFileInfo, umlEstimationInfo.umlModelName, repoInfo);
		console.log('updated model info');
		console.log(modelInfo);
		umlModelExtractor.extractModelInfo(modelInfo, function(modelInfo){
			//update model analytics.
			if(!modelInfo){
				res.end("error");
				return;
			}
			console.log("model is extracted");
			umlEvaluator.evaluateModel(modelInfo, function(){
				console.log("model analysis complete");



			});
//			console.log(modelInfo);
			effortPredictor.predictEffort(modelInfo, umlEstimationInfo, function(estimatedEffort){
				if(!estimatedEffort){
					console.log("error");
					res.render('estimationResultPane', {error: "inter process error"});
					return;
				}
				
				console.log("predicted effort");
				console.log(estimatedEffort);
				
				console.log("estimation request");
				console.log(umlEstimationInfo);
				
				var estimationResults = effortPredictor.makeProjectManagementDecisions(modelInfo, umlEstimationInfo, estimatedEffort);
				
				
				modelInfo.EstimationResults = estimationResults;
				modelInfo.repo_id = repoId;
				modelInfo.estimationResultsFile = "estimationResult.json"
//				modelInfo.SizeMetric = sizeMetric;
//				modelInfo.EstimationModel = model;

                modelInfo.umlEstimationInfo = umlEstimationInfo;

                umlModelInfoManager.saveEstimation(modelInfo, function(modelInfo){
//					console.log(modelInfo);
					var files = [{fileName : modelInfo.estimationResultsFile , content : JSON.stringify(estimationResults)}];
					
					umlFileManager.writeFiles(modelInfo.OutputDir, files, function(err){
					if(err){
						res.end("error");
						return;
					}
					
					res.render('estimationResultPane', {estimationResults:estimationResults, estimationModel: umlEstimationInfo.model, sizeMetric: umlEstimationInfo.sizeMetric, transactionMetric: umlEstimationInfo.transactionMetric, modelInfo: modelInfo});

////
                    });
                });


            });
			
		});
	});
});

//app.get('/dumpRepoDescriptiveDistributions', function(req, res){
//	var repoId = req.query.repo_id;
//	var refresh = false;
//
//	if(req.query.refresh === 'true'){
//	refresh = true;
//	}
//
////	var repoId = "595b50d4aebbbd2c4c4c6b58";
//	console.log(repoId);
////	var repoId = req.query.repo_id;
//	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
//				umlEvaluator.evaluateRepo(repoInfo, function(repoInfo){
//					var command = './Rscript/RepoDiscriptiveAnalysis.R "'+repoInfo.OutputDir+"/"+repoInfo.RepoEvaluationForUseCasesFileName+'" "'+repoInfo.OutputDir+"/"+repoInfo.RepoEvaluationForModelsFileName+'" "'+repoInfo.OutputDir+'" "."';
//
//					//	console.log('generate model Analytics');
////					console.log(command);
//					RScriptUtil.runRScript(command, function(result){
//						if(result){
//							res.end('success');
//						}
//						else {
//							res.end('error');
//						}
//					});
//				});
//		});
//})

//simplify the whole process by just loading the generate csv files.
//remove it just request the files.
//app.get('/evaluateRepoForModels', function(req, res){
//	var repoId = req.query.repo_id;
//	console.log(repoId);
//	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
//		umlFileManager.loadCSVFileAsString(repoInfo.OutputDir+"/"+repoInfo.ModelEvaluationFileName, function(modelEvaluationCSVFile){
//				res.end(modelEvaluationCSVFile);
//			})
//		});
//	
//})

//app.get('/evaluateRepoForUseCases', function(req, res){
//	var repoId = req.query.repo_id;
//	var simulation = false;
////	var repoId = "595b50d4aebbbd2c4c4c6b58";
//	console.log(repoId);
////	var repoId = req.query.repo_id;
//	umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
//			umlEvaluator.evaluateRepo(repoInfo, function(repoInfo){
////				if(useCaseEvaluationStr){
////				console.log(repoEvaluationResult.repoEvaluationStr);
////				res.end(useCaseEvaluationStr);
////				}
//			});
//		});
//})

//app.get('/evaluateModelForUseCases', function(req, res){
//	var modelId = req.query.model_id;
////	var modelId = "a08440f186a8d13192784845c7301f981499148138239";
//	var repoId = req.userInfo.repoId;
//	var simulation = false;
//	umlModelInfoManager.queryModelInfo(modelId, repoId, function(modelInfo){
//			umlEvaluator.evaluateModel(modelInfo, function(modelInfo){
//
//				umlModelInfoManager.updateModelInfo(modelInfo, repoId, function(modelInfo){
////					console.log(modelInfo);
//					if(useCaseEvaluationStr){
//						// calculateObserluteDifferences
//
////					console.log(modelEvaluationResult.usecaseEvaluationStr);
////					var modelAnalytics = modelInfo.ModelAnalytics;
//					useCaseEvaluationStr += "this part nees to improve";
////				    useCaseEvaluationStr += "CCSS_SAD: "+modelAnalytics.CCSS_DIFF+"\n";
//////				    useCaseEvaluationStr += "IT_SAD: "+modelAnalytics.IT_DIFF+"\n";
////				    useCaseEvaluationStr += "EI_SAD: "+modelAnalytics.EI_DIFF+"\n";
////				    useCaseEvaluationStr += "EO_SAD: "+modelAnalytics.EO_DIFF+"\n";
////				    useCaseEvaluationStr += "EQ_SAD: "+modelAnalytics.EQ_DIFF+"\n";
////				    useCaseEvaluationStr += "FUNC_NA: "+modelAnalytics.FUNC_NA+"\n";
////				    useCaseEvaluationStr += "FN_ALY: "+modelAnalytics.FN+"\n";
////				    useCaseEvaluationStr += "FN_SAD: "+modelAnalytics.FN_DIFF+"\n";
////				    useCaseEvaluationStr += "DM_SAD: "+modelAnalytics.DM_DIFF+"\n";
////				    useCaseEvaluationStr += "INT_SAD: "+modelAnalytics.INT_DIFF+"\n";
////				    useCaseEvaluationStr += "CTRL_SAD: "+modelAnalytics.CTRL_DIFF+"\n";
////				    useCaseEvaluationStr += "EXTIVK_SAD: "+modelAnalytics.EXTIVK_DIFF+"\n";
////				    useCaseEvaluationStr += "EXTCLL_SAD: "+modelAnalytics.EXTCLL_DIFF+"\n";
////				    useCaseEvaluationStr += "TRAN_NA: "+modelAnalytics.TRAN_NA+"\n";
////				    useCaseEvaluationStr += "TN_ALY: "+modelAnalytics.TN+"\n";
////				    useCaseEvaluationStr += "TN_SAD: "+modelAnalytics.TN_DIFF+"\n";
////				    useCaseEvaluationStr += "Effort_SAD: "+modelAnalytics.Effort_DIFF+"\n";
//				    res.end(useCaseEvaluationStr);
//					}
//				});
//			});
//		}, true);
//});

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

        totalUseCaseNum = resultForRepoInfo.UseCaseNum;
        totalNT = resultForRepoInfo.NT;
        totalEntityNum =  resultForRepoInfo.EntityNum;
	  
	  umlModelInfoManager.requestRepoBrief(repoId, function(repoInfoBrief){
      
        totalRec = modelNum;
        pageCount =  Math.ceil(totalRec/pageSize);
       
        console.log("total Records"+totalRec);
        
        console.log("INSIDE INDEX API pageCount "+ pageCount+ " pageSize "+pageSize+" Current page "+ currentPage+" Start "+start );
    
      //console.log("INSIDE UMLXSERVICES: "+ repoId);
//      console.log("INSIDE UMLXSERVICES"+ repoInfo.Models[0].creationTime);
                       
//			console.log(req.userInfo);
		//console.log(repoInfo);
		if(!repoInfo){
			res.send("error");
			return;
		}
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
						res.render('index', {totalRec: totalRec, reppID: repoId, repoPageInfo: repoInfo.Models,
							repoInfo:repoInfo, message:message,isEnterprise : req.userInfo.isEnterprise,
							pageSize: pageSize, pageCount: pageCount, currentPage: currentPage, repoInfoBrief: repoInfoBrief});
                	});
				});

			} else {
                repoInfo.requestUUID = requestUUID;
				res.render('index', {totalRec: totalRec, reppID: repoId, repoPageInfo: repoInfo.Models,
					repoInfo:repoInfo, message:message,isEnterprise : req.userInfo.isEnterprise, pageSize: pageSize,
					pageCount: pageCount, currentPage: currentPage, repoInfoBrief: repoInfoBrief});
			}

		});
    });
         });
	});



});

var testingParser = require('./model_platforms/visual_paradigm/XML2.1Parser.js');
app.get('/testFunctions', function(req, res){
	testingParser.extractDiagramModels("./vp_xml_export.xml/project.xml", function(data){
		console.log ('the output data', JSON.stringify(data));
		res.json(data);
	})
});

var sequenceDiagramParser = require("./model_platforms/ea/XMI2.1Parser.js")
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

//app.get('/testCOCOMODataLoad', function(req, res){
//	var cocomoCalculator = require("./evaluators/COCOMOEvaluator/COCOMOCalculator.js")
//	cocomoCalculator.loadCOCOMOData("./temp/COCOMOData.csv", function(outputStr){
//		res.end(outputStr);
//	});
//});


app.post('/saveModelInfoCharacteristics', upload.fields([{name:'distributed_system',maxCount:1},{name:'response_time', maxCount:1},{name:'end_user_efficiency', maxCount:1},{name:'complex_internal_processing', maxCount:1},{name:'code_must_be_reusable', maxCount:1}
,{name:'easy_to_install', maxCount:1},{name:'easy_to_use', maxCount:1},{name:'portable', maxCount:1},{name:'easy_to_change', maxCount:1},{name:'concurrent', maxCount:1}
,{name:'includes_special_security_objectives', maxCount:1},{name:'provides_direct_access_for_third_parties', maxCount:1},{name:'special_user_training_facilities_are_required', maxCount:1},{name:'familiar_with_the_project_model_that_is_used', maxCount:1},{name:'application_experience', maxCount:1}
,{name:'object_oriented_experience', maxCount:1},{name:'lead_analyst_capability', maxCount:1},{name:'motivation', maxCount:1},{name:'stable_requirements', maxCount:1},{name:'part_time_staff', maxCount:1}
,{name:'difficult_programming_language', maxCount:1},{name:'modelID', maxCount:1}]), function(req,res){
	var umlEstimationInfo = {};
	umlEstimationInfo.distributedSystem = req.body['distributed_system'];
	umlEstimationInfo.responseTime = req.body['response_time'];
	umlEstimationInfo.endUserEfficiency = req.body['end_user_efficiency'];
	umlEstimationInfo.complexInternalProcessing = req.body['complex_internal_processing'];
	umlEstimationInfo.codeReusable = req.body['code_must_be_reusable'];
	umlEstimationInfo.easyInstall = req.body['easy_to_install'];
	umlEstimationInfo.easyUse = req.body['easy_to_use'];
	umlEstimationInfo.portable = req.body['portable'];
	umlEstimationInfo.easyToChange = req.body['easy_to_change'];
	umlEstimationInfo.concurrent = req.body['concurrent'];
	umlEstimationInfo.specialSecurityObjectives = req.body['includes_special_security_objectives'];
	umlEstimationInfo.directAccessForThirdParties = req.body['provides_direct_access_for_third_parties'];
	umlEstimationInfo.userTrainingFacilitiesRequired = req.body['special_user_training_facilities_are_required'];
	umlEstimationInfo.familiarWithProjectModel = req.body['familiar_with_the_project_model_that_is_used'];
	umlEstimationInfo.applicationExperience = req.body['application_experience'];
	umlEstimationInfo.objectOrientedExperience = req.body['object_oriented_experience'];
	umlEstimationInfo.leadAnalystCapability = req.body['lead_analyst_capability'];
	umlEstimationInfo.motivation = req.body['motivation'];
	umlEstimationInfo.stableRequirements = req.body['stable_requirements'];
	umlEstimationInfo.partTimeStaff = req.body['part_time_staff'];
	umlEstimationInfo.difficultProgrammingLanguage = req.body['difficult_programming_language'];
	umlEstimationInfo.modelID = req.body['modelID'];	
	umlModelInfoManager.saveModelInfoCharacteristics(umlEstimationInfo, function(result,message){		
		res.json(result);
	});
});

//app.post('/saveEstimation', upload.fields([{name:'distributed_system',maxCount:1},{name:'response_time', maxCount:1},{name:'end_user_efficiency', maxCount:1},{name:'complex_internal_processing', maxCount:1},{name:'code_must_be_reusable', maxCount:1}
//,{name:'easy_to_install', maxCount:1},{name:'easy_to_use', maxCount:1},{name:'portable', maxCount:1},{name:'easy_to_change', maxCount:1},{name:'concurrent', maxCount:1}
//,{name:'includes_special_security_objectives', maxCount:1},{name:'provides_direct_access_for_third_parties', maxCount:1},{name:'special_user_training_facilities_are_required', maxCount:1},{name:'familiar_with_the_project_model_that_is_used', maxCount:1},{name:'application_experience', maxCount:1}
//,{name:'object_oriented_experience', maxCount:1},{name:'lead_analyst_capability', maxCount:1},{name:'motivation', maxCount:1},{name:'stable_requirements', maxCount:1},{name:'part_time_staff', maxCount:1}
//,{name:'difficult_programming_language', maxCount:1},{name:'uml_file', maxCount:1},{name:'estimator', maxCount:1},{name:'model', maxCount:1},{name:'simulation', maxCount:1}]), function(req,res){
//	var umlEstimationInfo = {};
//	umlEstimationInfo.distributedSystem = req.body['distributed_system'];
//	umlEstimationInfo.responseTime = req.body['response_time'];
//	umlEstimationInfo.endUserEfficiency = req.body['end_user_efficiency'];
//	umlEstimationInfo.complexInternalProcessing = req.body['complex_internal_processing'];
//	umlEstimationInfo.codeReusable = req.body['code_must_be_reusable'];
//	umlEstimationInfo.easyInstall = req.body['easy_to_install'];
//	umlEstimationInfo.easyUse = req.body['easy_to_use'];
//	umlEstimationInfo.portable = req.body['portable'];
//	umlEstimationInfo.easyToChange = req.body['easy_to_change'];
//	umlEstimationInfo.concurrent = req.body['concurrent'];
//	umlEstimationInfo.specialSecurityObjectives = req.body['includes_special_security_objectives'];
//	umlEstimationInfo.directAccessForThirdParties = req.body['provides_direct_access_for_third_parties'];
//	umlEstimationInfo.userTrainingFacilitiesRequired = req.body['special_user_training_facilities_are_required'];
//	umlEstimationInfo.familiarWithProjectModel = req.body['familiar_with_the_project_model_that_is_used'];
//	umlEstimationInfo.applicationExperience = req.body['application_experience'];
//	umlEstimationInfo.objectOrientedExperience = req.body['object_oriented_experience'];
//	umlEstimationInfo.leadAnalystCapability = req.body['lead_analyst_capability'];
//	umlEstimationInfo.motivation = req.body['motivation'];
//	umlEstimationInfo.stableRequirements = req.body['stable_requirements'];
//	umlEstimationInfo.partTimeStaff = req.body['part_time_staff'];
//	umlEstimationInfo.difficultProgrammingLanguage = req.body['difficult_programming_language'];
//	umlEstimationInfo.umlFile = req.body['uml_file'];
//	umlEstimationInfo.estimator = req.body['estimator'];
//	umlEstimationInfo.model = req.body['model'];
//	umlEstimationInfo.simulation = req.body['simulation'];
//	
//	umlModelInfoManager.saveEstimation(umlEstimationInfo, function(result,message){		
//		res.json(result);
//	});
//});

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
	var filePath = req.query.fileFolder;

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
						// if (stat && stat.isDirectory()) {
						// 	var entry = {};
						// 	entry.isFolder = 'true';
						// 	entry.url = file;
                         //    entry.parent = filePath.substring(filePath.lastIndexOf("public/uploads/")-1);
						// 	results.push(entry);
                        //
						// 	recurDir(fileDir, function(err, ans) {
						// 		results = results.concat(ans);
						// 		if (!--pending) {
						// 			done(null, results);
						// 		}
						// 	});
						// } else {
							var entry = {};
							entry.isFolder = stat.isDirectory();
							entry.url = file;
							entry.size = stat.size;
							entry.date = stat.birthtime;
							entry.parent = filePath.substring(filePath.lastIndexOf("public/uploads/")-1);
							results.push(entry);
							if (!--pending) {
								done(null, results);
							}
						// }
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

    // fs.readdir(filePath, function(err, list){
    	// if (err) {
    	// 	throw err;
	// 	} else {
     //        res.json(list);
	// 	}
	// });
});

//Fetch txt/csv file in public/repo/ouput
app.get('/fetchDocument', function (req, res) {

    var docPath = req.query.DocFolder;

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

    // download(downloadPath).then(data => {
    //     fs.writeFileSync(savePath + '/' + fileName, data);
    // });

    // download(test_path).pipe(fs.createWriteStream(savePath + '/' + fileName));

    // fs.readFile(downloadPath, (err, data) => {
    //     if (err) throw err;
    //     console.log(data);
    //
    //     fs.writeFile(savePath, data, (err) => {
    //         if (err) throw err;
    //         console.log(fs.readFileSync(path));
    //     });
    // });

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


//==================== local machine code for development ==========================

//var server = app.listen(8081,'127.0.0.1', function () {
//  var host = server.address().address
//  var port = server.address().port
//  console.log("Example app listening at http://%s:%s", host, port)
//});

//==================== remote server code for production ==========================
var vhost = require('vhost');
var webServer = module.exports = express();

webServer.use(vhost('umlx.kanqi.org', app)); // Serves top level domain via Main server app

/* istanbul ignore next */
if (!module.parent) {
  webServer.listen(8081);
  console.log('Express started on port 8081');
}
