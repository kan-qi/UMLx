(function() {
    var path = require('path');
    var mkdirp = require('mkdirp');
    var fs = require('fs');
    var exec = require('child_process').exec;
    var FileManagerUtil = require("./utils/FileManagerUtils.js");
    var UMLxAnalyticToolKit = require("./utils/UMLxAnalyticToolKitCore.js");
    var srcParser = require('./model_platforms/src/SrcParser.js');
<<<<<<< HEAD
=======
    var modelDrawer = require('./model_drawers/UserSystemInteractionModelDrawer');
    var AndroidLogUtil = require('./utils/AndroidLogUtil');
>>>>>>> 8b08cd56893f5b7556a384bf2d315f21164c7522


    function analyseAndroidApks(apkFilePath, reportDir){
        console.log("analyse android apks");
        return AndroidLogUtil.generateAndroidAnalysis(apkFilePath, reportDir);

        /* dummy android apk analysis due to that gator command cannot run on local machine with MAC OS*/
//         return new Promise((resolve, reject) => {
//             var project = {
//                 "reportDir": reportDir,
//                 "repoDir": reportDir,
//                 "path": reportDir,
//                 "modelFile": "android-analysis-output.json",
//                 "stimulusFile": "gator-handlers.txt",
// //                "tag": "AnotherMonitor_release-1",
//                 "tag": path.basename(apkFilePath),
//                 "apkFileName": path.basename(apkFilePath),
//                 //"logFile":"filtered_android_log.txt",
//                 //"useCaseRec":"record.txt",
//                 "clusterConfig": "S1W1L1"
//             }
//             var project = {
//                 "reportDir": reportDir,
//                 "repoDir": reportDir,
//                 "path": "/Users/diaozhuoran/desktop/DR2/UMLx404/UMLx/data/GitAndroidAnalysis/batch_analysis/AnotherMonitor_release-1",
//                 "modelFile": "android-analysis-output.json",
//                 "stimulusFile": "gator-handlers.txt",
// //                "tag": "AnotherMonitor_release-1",
//                 "tag": path.basename(apkFileName),
//                 "apkFileName":"AnotherMonitor_release.apk",
//                 "logFile":"filtered_android_log.txt",
//                 "useCaseRec":"record.txt",
//                 "clusterConfig": "S1W1L1"
            // }
        //     setTimeout(resolve(project), 1000);
        // });
    }

    function analyseAndroidProject(project, reportDir, umlModelInfo){        
        //use promise to construct the repo objects
        var analyseProject = function(projectXMI, project, reportDir){
            return new Promise((resolve, reject) => {
                var projectName = project.tag;
                if(!projectName){
                    projectName = ""
                }

                let date = new Date();
                let analysisDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
                analysisDate = analysisDate+"@"+Date.now();

                projectName = projectName + "_"+analysisDate;

                var outputDir = reportDir +"/"+projectName+"_analysis";
                //global.debugOutputDir = outputDir + "/debug";
                var inputFile = projectXMI;

                console.log(inputFile);

                mkdirp(outputDir, function(err) { 
                    fs.exists(inputFile, (exists) => {
                        if(!exists){
                            console.log(inputFile+" doesn't exist.");
                            reject();
                        }
                        else{
                    //to generate svg file.
//                            UMLxAnalyticToolKit.analyseSrc(inputFile, outputDir, projectName, function(model){
//                                if(!model){
//                                    console.log('analysis error!');
//                                    resolve();
//                                    return;
//                                }
//                                console.log("finished sr analysis");
//                                FileManagerUtil.appendFile(reportPath, model.OutputDir+"\n", function(message){
//                                    console.log('analysis finished!');
//                                    console.log(message);
//                                    resolve(true, model);
//                                })
//                            }, project);
<<<<<<< HEAD

                            	var modelJson = JSON.parse(FileManagerUtil.readJSONSync(inputFile).trim());
                            	srcParser.isJSONBased = true;


                                	var path = require('path');
                                			var workDir = path.dirname(umlModelInfo.umlFilePath);
                                			srcParser.extractUserSystermInteractionModel(modelJson, outputDir, umlModelInfo.OutputDir, umlModelInfo.AccessDir, function(model){

                                				if(!model){
                                					return;
                                				}

                                				// set up the model info properties
                                				for(var i in model){
                                					umlModelInfo[i] = model[i];
                                				}

                                				// set up the domain model
                                				var domainModel = umlModelInfo.DomainModel;

                                				var debug = require("./utils/DebuggerOutput.js");
                                				debug.writeJson2("constructed_domain_model", domainModel, umlModelInfo.OutputDir);

                                				for(var i in umlModelInfo.UseCases) {
                                								var useCase = umlModelInfo.UseCases[i];

                                								modelDrawer.drawUSIMDiagram(useCase, domainModel, useCase.OutputDir+"/usim.dotty", function(){

                                									console.log("use case is drawn");
                                								});
                                								modelDrawer.drawTransactionsDiagram(useCase, domainModel, useCase.OutputDir+"/transactions.dotty", function(){

                                									console.log("simple use case is drawn");
                                								});

                                //								pathsDrawer.drawPaths(useCase.Paths, useCase.OutputDir+"/paths.dotty", function(){
                                //									console.log("paths are drawn");
                                //								});
                                				}

                                				modelDrawer.drawDomainModel(domainModel, domainModel.OutputDir+"/domainModel.dotty", function(){
                                					console.log("domain model is drawn");
                                				});


                                				var debug = require("./utils/DebuggerOutput.js");
                                				debug.writeJson2("constructed_usim_model", umlModelInfo, umlModelInfo.OutputDir);

//                                				if(callbackfunc){
                                                 //                                					callbackfunc(umlModelInfo);
                                                 //                                				}

                                                  resolve(true, model);

                                			}, umlModelInfo);
=======
                                var modelJson = FileManagerUtil.readJSONSync(inputFile);
                                //var modelJson = JSON.parse(FileManagerUtil.readJSONSync(inputFile).trim());
                                
                                srcParser.isJSONBased = true;

                                            //var workDir = path.dirname(umlModelInfo.umlFilePath);
                                            //umlModelInfo = modelJson;
                                            
                                            srcParser.extractUserSystermInteractionModel(modelJson, outputDir, umlModelInfo.OutputDir, umlModelInfo.AccessDir, function(model){

                                                if(!model){
                                                    return;
                                                }


                                                // set up the model info properties
                                                for(var i in model){
                                                    umlModelInfo[i] = model[i];
                                                }

                                                // set up the domain model
                                                var domainModel = umlModelInfo.DomainModel;
                                                var debug = require("./utils/DebuggerOutput.js");
                                                debug.writeJson2("constructed_domain_model", domainModel, umlModelInfo.OutputDir);
                                                for(var i in umlModelInfo.UseCases) {
                                                                var useCase = umlModelInfo.UseCases[i];

                                                                modelDrawer.drawUSIMDiagram(useCase, domainModel, useCase.OutputDir+"/usim.dotty", function(){

                                                                    console.log("use case is drawn");
                                                                });
                                                                modelDrawer.drawTransactionsDiagram(useCase, domainModel, useCase.OutputDir+"/transactions.dotty", function(){

                                                                    console.log("simple use case is drawn");
                                                                });

                                //                              pathsDrawer.drawPaths(useCase.Paths, useCase.OutputDir+"/paths.dotty", function(){
                                //                                  console.log("paths are drawn");
                                //                              });
                                                }
                                                modelDrawer.drawDomainModel(domainModel, domainModel.OutputDir+"/domainModel.dotty", function(){
                                                    console.log("domain model is drawn");
                                                });


                                                var debug = require("./utils/DebuggerOutput.js");
                                                debug.writeJson2("constructed_usim_model", umlModelInfo, umlModelInfo.OutputDir);

//                                              if(callbackfunc){
                                                 //                                                 callbackfunc(umlModelInfo);
                                                 //                                             }
                                                  resolve(model);

                                            }, umlModelInfo);
>>>>>>> 8b08cd56893f5b7556a384bf2d315f21164c7522

                        }
                    });
                });
            });
        }
        
        return analyseProject(project.path+"/"+project.modelFile, project, reportDir);
    }
    
    module.exports = {
            analyseAPKGator: function(apkFilePath, workDir, outputdir, callback, umlModelInfo){
                //our gator analyzer is currently called by the following command.
                
                //./gator a -p /mnt/d/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/demo-release-unsigned.apk -client GUIHierarchyPrinterClient
            
                // we need to find a way to call the command from nodejs.
                
                // example of doing similar things are in ./utils/EclipseUtil.js, for example, line 13, using "exec"
                //const reportDir = "./data/GitAndroidAnalysis/batch_analysis";
//                const reportDir = "./public/output";
                analyseAndroidApks(apkFilePath, outputdir)
                    .then((project) => {
                        console.l("apk analysis finish");
                        analyseAndroidProject(project, outputdir, umlModelInfo)
                            .then((result) => {
                                console.l("Android project analysis finish");
                                callback(result);
                            })
                            .catch(err => {
                                console.l(err);
                                callback(false);
                            })
                    })
                    .catch(err => {
                        console.l(err);
                        callback(false);
                    })
            }
            
    }
}())