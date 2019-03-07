(function() {
    var path = require('path');
    var mkdirp = require('mkdirp');
    var fs = require('fs');
    var exec = require('child_process').exec;
    var FileManagerUtil = require("./utils/FileManagerUtils.js");
    var UMLxAnalyticToolKit = require("./utils/UMLxAnalyticToolKitCore.js");

    function analyseAndroidApks(apkFileName, reportDir){
        console.log("analyse android apks");
        //return AndroidLogUtil.generateAndroidAnalysis(apkFileName, reportDir);

        /* dummy android apk analysis due to that gator command cannot run on local machine with MAC OS*/
        return new Promise((resolve, reject) => {
            var project = {
                "reportDir": reportDir,
                "repoDir": reportDir,
                "path": "/Users/diaozhuoran/desktop/DR2/UMLxKqi/UMLx/data/GitAndroidAnalysis/batch_analysis/AnotherMonitor_release-1",
                "modelFile": "android-analysis-output.json",
                "stimulusFile": "gator-handlers.txt",
//                "tag": "AnotherMonitor_release-1",
                "tag": path.baseName(apkFileName),
                "apkFileName":"AnotherMonitor_release.apk",
                "logFile":"filtered_android_log.txt",
                "useCaseRec":"record.txt",
                "clusterConfig": "S1W1L1"
            }
            setTimeout(resolve(project), 1000);
        });
    }

    function analyseAndroidProject(project, reportDir){
//        var reportPath = reportDir+"/analysis-results-folders.txt";
//        global.debugCache = new Object();
        
        //use promise to construct the repo objects
        var analyseProject = function(projectXMI, project, outputDir){
            return new Promise((resolve, reject) => {
                var projectName = project.tag;
                if(!projectName){
                    projectName = ""
                }

//                let date = new Date();
//                let analysisDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
//                analysisDate = analysisDate+"@"+Date.now();
//
//                projectName = projectName + "_"+analysisDate;

//                var outputDir = reportDir +"/"+projectName+"_analysis";
//                global.debugOutputDir = outputDir + "/debug";
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
                                    resolve(false);
                                    return;
                                }
                                else{
                                	console.log('analysis finished!');
                                	resolve(model); //this grammer may not be correct, but "model" needs to be returned to line 103 to deliver the result to the front end.
                                	return;
                                	
                                }
                            }, project);
                        }
                    });
                });
            });
        }
        
        return analyseProject(project.path+"/"+project.modelFile, project, reportDir);
    }
	
	module.exports = {
			analyseAPKGator: function(apkFilePath, workDir, outputdir, callback){
				//our gator analyzer is currently called by the following command.
				
				//./gator a -p /mnt/d/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/demo-release-unsigned.apk -client GUIHierarchyPrinterClient
			
				// we need to find a way to call the command from nodejs.
				
				// example of doing similar things are in ./utils/EclipseUtil.js, for example, line 13, using "exec"
                //const reportDir = "./data/GitAndroidAnalysis/batch_analysis";
//                const reportDir = "./public/output";
                analyseAndroidApks(apkFilePath, reportDir)
                    .then((project) => {
                        console.l("apk analysis finish");
                        analyseAndroidProject(project, outputDir)
                            .then(result => {
                                console.l("Android project analysis finish");
                                callback(result);
                            })
                            .catch(err => console.l(err))
                    })
                    .catch(err => console.l(err))
			}
			
	}
}())