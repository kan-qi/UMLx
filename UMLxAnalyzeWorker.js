const fs = require("fs");
const umlModelExtractor = require("./UMLModelExtractor.js");
const umlFileManager = require("./UMLFileManager.js");
const umlEvaluator = require("./UMLEvaluator.js");
const umlModelInfoManager = require("./UMLModelInfoManagerMongoDB.js");
const effortPredictor = require("./UMLxEffortPredictor.js");
const unzip = require('unzip');
const rimraf = require('rimraf');
const path = require('path');
const webpush = require('web-push');
const androidAnalyzer = require('./UMLxAndroidAnalyzer');
// const publicVapidKey = "BLf_oTgET2-eieOnwQYLjq1mSReMhbDdrhcKSPYQsa-Yiovq0IE5VCT1zS4GjZkKNef8cu8gXNlym7uFGjG5DcI";
// const privateVapidKey = "rrC1pjbnR7SeLHJg5AUW7-Hz--7M9yC6o_TIFtbBYk4";
const publicVapidKey = "BM2EKwsY9E_5r5ewHVlZ1hSwpSfRpvqQm0DPT3C60WQ3md98O0_Tb7c56yFfzFlFyaKqNVfYe1Vv2sul6m4Myt0";
const privateVapidKey = "zi84jsmnux1jffj4Kt0XnSNWeKVYmQpmRd-lMZkqU-k";
// Replace with your email
webpush.setVapidDetails('mailto:val@karpov.io', publicVapidKey, privateVapidKey);

console.l = console.log;

process.on("message", (req) => {
    console.l('stringed req');
    console.l(req);
    req = JSON.parse(req);
    let text = evaluateUploadedProject(req);
    
    //process.send('ok');
});

function sendPush(subscription) {
    const payload = JSON.stringify({title: 'test'});
    console.log("DEBUGGGG: ready to send notification");
    webpush.sendNotification(subscription, payload).catch(error => {
        console.error(error.stack);
    });
}

function evaluateUploadedProject(req) {

    console.l("DEBUGGGG: start evaluating project");
    var umlFilePath = null;
    var umlOtherPath = null;
    console.log(req);
    //need to implement unzipped xml file data-analysis, for now only process single xml file!!
    if(req.files['uml_file'] != null && req.files['uml_other'] != null){
        // console.log("================================path===================");
        console.l('uml-file && other not null');
        umlFilePath = req.files['uml_file'][0].path;
        umlOtherPath = req.files['uml_other'][0].path;

        // console.log(umlFilePath);
        // console.log(umlOtherPath);

        fs.createReadStream(umlOtherPath).pipe(unzip.Extract({ path: umlFilePath.substring(0, umlFilePath.lastIndexOf("\\")) }));
        //remove directory of zip file and the contents in the directory
        rimraf(umlOtherPath.substring(0, umlOtherPath.lastIndexOf("\\")),function(err) {
            if (err) {
                console.l("Error at checkpoint 0" + err);
            }
        });
    }
    else if (req.files['uml_file'] != null) {
        var uploadedFile = req.files['uml_file'][0];
        if (uploadedFile.mimetype == "text/xml" || path.extname(uploadedFile.originalname) == ".apk") { // xml file or apk file
            umlFilePath = uploadedFile.path;
            console.l("path:" + umlFilePath);
        }
    }
    //same problem as above comment
    else if (req.files['uml_other'] != null) {
        umlOtherPath = req.files['uml_other'][0].path;

        console.log("================================path===================");
        console.log(umlOtherPath);

        fs.createReadStream(umlOtherPath).pipe(unzip.Extract({path: umlOtherPath.substring(0, umlOtherPath.lastIndexOf("\\")) }));

        // res.redirect('/');

    } else {
        console.l("ERROR: null object found checkpoint 1");
        return false;
    }
    console.l("evaluate project info");
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
        console.l('umlfilepath not null');
        console.l('repoid: '+repoId);
        umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
            if(!repoInfo) {
                console.l("repoinfo null");
            } else {
                console.l("repoinfo not null");
            }
            var umlFileInfo = umlFileManager.getUMLFileInfo(repoInfo, umlFilePath, umlModelType, formInfo);
            console.l('umlFileInfo => ' + JSON.stringify(umlFileInfo));
            var modelInfo = umlModelInfoManager.initModelInfo(umlFileInfo, umlModelName,repoInfo);
            modelInfo.projectInfo = projectInfo;
            if (path.extname(uploadedFile.originalname) == ".apk") {
				modelInfo['apkFile'] = true;
			}
            console.l('updated model info');
            //console.l(modelInfo);
            umlModelExtractor.extractModelInfo(modelInfo, function(modelInfo){
                //update model analytics.
                console.l("mdoel is extracted");
                if(!modelInfo){
                    // res.end("error");
                    console.l('Error: model info null');
                    return;
                }
                if (!umlModelName) {
                    umlModelName = "project" + repoId
                }
                modelInfo.Name = umlModelName;
                umlEvaluator.evaluateModel(modelInfo, function(modelInfo2){
                    console.l("model analysis complete");
                    console.log(modelInfo2);
                    if(!modelInfo2){
                        // res.redirect('/');
                        console.l('Error: modelinfo2 null');
                        return;
                    }
                    effortPredictor.predictEffort(modelInfo2, function(modelInfo3){
                        if(!modelInfo3){
                            console.l("Error: effort prediction failed");
                        }
                        console.l("model effort predicted");
                        //var debug = require("./utils/DebuggerOutput.js");
                        //debug.writeJson("evaluated_model_example"+modelInfo2._id, modelInfo2);
                        umlModelInfoManager.saveModelInfo(modelInfo2, repoId, function(modelInfo){
                            //				console.log(modelInfo);
                            console.log("inside saveModelInfo");
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


                                // }, 1000);
                                //window.location.reload(true);
                                // sendPush(req.sub);
                                console.l("finished evaluation");
                                // setTimeout(() => process.send('ok'), 2000);
                                process.send('ok');
                                // return 'ok';
                            });
                        });
                    });
                });
            });
        });
    }

}