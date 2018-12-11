var express = require('express');
var app = express();
var fs = require("fs");
var path = require('path')
var admZip = require('adm-zip');
var umlModelExtractor = require("./UMLModelExtractor.js");
var umlFileManager = require("./UMLFileManager.js");
var umlEvaluator = require("./UMLEvaluator.js");
var umlModelInfoManager = require("./UMLModelInfoManagerMongoDB.js");
var effortPredictor = require("./UMLxEffortPredictor.js");
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
const { fork } = require('child_process');
//var Worker = require('webworker-threads').Worker;

//var csv=require('csvtojson')
//var removeDir = require('some-custom-fs');
//var effortPredictor = require("./model_estimator/ProjectEffortEstimator.js");
console.l = console.log;
// console.log = function() {};


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


// END OF TEST GIT API
app.get('/estimationPage',function(req,res){
	res.render('estimationPageSimplified');
});

app.get('/estimationPageDemo',function(req,res){
	res.render('estimationPage', {cookieName: "EstimationPageOptionsEC2Demo"});
});

app.get('/docmagic-audit', function(req, res){
	fs.readFile('./docmagic-prototype/Audit_Prototype.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
});

app.get('/docmagic-audit-1', function(req, res){
	fs.readFile('./docmagic-prototype/Audit_Prototype_v1.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
});

app.post('/predictProjectEffort', upload.fields([{name:'distributed_system',maxCount:1},{name:'response_time', maxCount:1},{name:'end_user_efficiency', maxCount:1},{name:'complex_internal_processing', maxCount:1},{name:'code_must_be_reusable', maxCount:1}
,{name:'easy_to_install', maxCount:1},{name:'easy_to_use', maxCount:1},{name:'portable', maxCount:1},{name:'easy_to_change', maxCount:1},{name:'concurrent', maxCount:1}
,{name:'includes_special_security_objectives', maxCount:1},{name:'provides_direct_access_for_third_parties', maxCount:1},{name:'special_user_training_facilities_are_required', maxCount:1},{name:'familiar_with_the_project_model_that_is_used', maxCount:1},{name:'application_experience', maxCount:1}
,{name:'object_oriented_experience', maxCount:1},{name:'lead_analyst_capability', maxCount:1},{name:'motivation', maxCount:1},{name:'stable_requirements', maxCount:1},{name:'part_time_staff', maxCount:1}
,{name:'difficult_programming_language', maxCount:1},{name:'uml_file', maxCount:1},{name:'uml_other', maxCount:1}, {name:'model', maxCount:1},{name:'simulation', maxCount:1}]), function(req,res){

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

        let packed_obj = {};
        if(!req.files['uml_file']){
            console.log("empty uml file");
            res.end("No file uploaded!");
            return;
        }
        if(req.body['personnel']){
            projectInfo.personnel = Number(req.body['personnel']);
        }
        if(req.body['schedule']){
            projectInfo.schedule = Number(req.body['schedule']);
        }
        projectInfo.hoursPerMonth = 40;
        if(req.body['hours-per-month']){
            projectInfo.hoursPerMonth = Number(req.body['hours-per-month']);
        }
        var estimationModel = "eucp_lm";
        if(req.body['model']){
        estimationModel = req.body['model'];
        }
    //	umlEstimationInfo.otherFilePath = req.files['uml_other'][0].path;
    //	umlEstimationInfo.simulation = req.body['simulation'];
        console.log("estimate project effort");
    //	var otherFilePath = req.files['other_file'][0].path;
    //	var umlModelName = req.body['uml-model-name'];
    //	var umlModelType = req.body['uml-model-type'];
        var date = new Date();
        var uploadDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
        var formInfo = req.body;
        packed_obj['projectInfo'] = projectInfo;
        packed_obj['umlFilePath'] = req.files['uml_file'][0].path;
        packed_obj['umlModelType'] = 'uml';
        packed_obj['formInfo'] = formInfo;
        packed_obj['umlModelName'] = "query"+uploadDate+"@"+Date.now();
        packed_obj['estimationModel'] = estimationModel;

        const worker = fork('./UMLxPredictEffortWorker.js',
            [],
            {
                execArgv: []
            });
        worker.on('message', (return_obj) => {
            return_obj = JSON.parse(return_obj);
            let func = return_obj['func']
                , estimationResults = return_obj['estimationResults']
                , modelInfo = return_obj['modelInfo'];
            if(func === 'error') {
                res.end("error");
            } 
            else {
                res.render(func, {estimationResults:estimationResults, modelInfo: modelInfo});
            }
            sendPush(subscription, 'Evaluation Finished');
            worker.kill();
        });
        console.l("in service: umlfilepath: " + packed_obj['umlFilePath']);
        console.l("in service: packetobj: " + JSON.stringify(packed_obj));
        worker.send(JSON.stringify(packed_obj));
        let token = req.cookies.appToken;
        let subscription = endpoints[token];
        sendPush(subscription, 'Task Sent to backend, please wait');
});

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

app.get('/surveyPage', function(req, res){
	
	res.render('surveyProject');
});


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

app.get('/logout',function(req,res){
	if(req.cookies){
		req.cookies.appToken = null;
	}
	
	res.redirect('/login');
});

app.post('/login', upload.fields([{name:'username', maxCount:1},{name:'password', maxCount:1}]),  function (req, res){

	var username = req.body['username'];
	var pwd = req.body['password'];
	umlModelInfoManager.validateUserLogin(username,pwd,function(result,message){
        res.json(result);
    });

})

app.get('/logout', function (req, res) {
	if (req.cookies){
		req.cookies.appTooken = null;
	}

	res.redirect('/login')
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

const webpush = require('web-push');

const publicVapidKey = "BM2EKwsY9E_5r5ewHVlZ1hSwpSfRpvqQm0DPT3C60WQ3md98O0_Tb7c56yFfzFlFyaKqNVfYe1Vv2sul6m4Myt0";
const privateVapidKey = "zi84jsmnux1jffj4Kt0XnSNWeKVYmQpmRd-lMZkqU-k";

// Replace with your email
webpush.setVapidDetails('mailto:val@karpov.io', publicVapidKey, privateVapidKey);


app.use(require('body-parser').json());

let endpoints = {};

app.post('/subscribe', (req, res) => {
    console.l('inside /subscribe');
    const token = req.cookies.appToken;
    const subscription = req.body;
    if(subscription) {
        endpoints[token] = subscription;
        console.l('server received subsription endpoint');
    } else {
        console.l("server didn't receive correct endpoint");
    }
    res.status(201).json({});
    console.l(subscription);
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


app.get('/estimationPageAnalysis',function(req,res){
	res.render('estimationPageAnalysis');
});

app.get('/estimationAnalysisPackage',function(req,res){
	res.render('estimationAnalysisPackage');
});

/*
 * only for debugging process
 */
app.get('/listEstimationRequests', function(req,res){
	var userId = req.query['uid'];
	umlModelInfoManager.queryEstimationRequests(function(estimationRequests){
		console.log(estimationRequests);
		res.render('estimationRequestList', {estimationRequests: estimationRequests});
	});
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

//==================== local machine code for development ==========================

var server = app.listen(8081,'0.0.0.0', function () {
  var host = server.address().address;
  var port = server.address().port;
  console.l("Example app listening at http://%s:%s", host, port)
});
