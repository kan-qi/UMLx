///*
// * assumed data structure
// */
// var repo = {
//			reportDir: "",	//all the output files path
//			repoDir: "", //all the inputfiles destination
//			projectList: {
//				path: "",
//				modelFile: ""
//			}//model file paths
//}
	
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var execSync = require('child_process').execSync;
var AndroidLogUtil = require("./AndroidLogUtil.js");
var AndroidAPKUtil = require("./AndroidAPKUtil.js");
var FileManagerUtils = require("./FileManagerUtils.js");
var RScriptExec = require('./RScriptUtil.js');
var LogFilter = require('./AndroidLogFilter.js');
var config = require("../config.js");
var stringSimilarity = require('string-similarity');

var exec = require('child_process').exec;


var UMLxAnalyticToolKit = require("./UMLxAnalyticToolKitCore.js");

// Use the forward slash separator for running on macOS/Unix/Linux
//var pathSeparator = "\\";
var pathSeparator = "/";


function analyseAndroidApks(repoInfo){
	console.log("analyse android apks");
	    var projectList = repoInfo.projectList;
        var reportDir = repoInfo.reportDir;
        var repoDir = repoInfo.repoDir;

    	let final = [];

    	function apkAnalysisList(projectList) {
    	  return projectList.reduce((promise, project) => {
    	    return promise
    	      .then((result) => {
    	        console.log("analysing project: "+project.apkFileName);
    	        return AndroidAPKUtil.generateAndroidAnalysis(project).then(result => final.push(result));
    	      })
    	      .catch(console.error);
    	  }, Promise.resolve());
    	}

    	apkAnalysisList(projectList)
    	  .then(() => function(){
    		  console.log('analysis finished');
    	  });
	
}

function analyseAndroidProjectsByPromise(repoInfo){
    var projectList = repoInfo.projectList;
    var reportDir = repoInfo.reportDir;
    var repoDir = repoInfo.repoDir;
	var reportPath = reportDir + pathSeparator + "analysis-results-folders.txt";
	global.debugCache = new Object();

	  //use promise to construct the repo objects
    function analyseProject(projectXMI, project, reportDir){
        return new Promise((resolve, reject) => {

        var projectName = project.tag;
        if(!projectName){
        		projectName = ""
        }

   		 let date = new Date();
   	     let analysisDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
   	     analysisDate = analysisDate+"@"+Date.now();

   	     projectName = projectName + "_"+analysisDate;

					var outputDir = reportDir + pathSeparator + projectName + "_analysis";

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
        		FileManagerUtils.appendFile(reportPath, model.OutputDir+"\n", function(message){
            		console.log('analysis finished!');
            		console.log(message);
            		resolve();
        		})

        	}, project);

        	}
      	  });
        	});

        });
    }

    return Promise.all(projectList.map(project=>{
        return analyseProject(project.path + pathSeparator + project.modelFile, project, reportDir);


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
}

function analyseAndroidProjectsShellBatch(repoInfo){
	    var projectList = repoInfo.projectList;
        var reportDir = repoInfo.reportDir;
        var repoDir = repoInfo.repoDir;

    for(var i in projectList){
        var projectInfo = projectList[i];
            if(!FileManagerUtils.existsSync(projectInfo.path)){
                continue;
            }
            var executionInfo = {
                reportDir: repoInfo.reportDir,
                repoDir: repoInfo.repoDir,
                projectList: [projectInfo]
            }

            var executionInfoPath = "./debug/executionInfo_"+i+".json";
            FileManagerUtils.writeFileSync(executionInfoPath, JSON.stringify(executionInfo));

            //to generate svg file.
            var command = 'node --max_old_space_size=10240 "./utils/AndroidProjectAnalysis.js" --analyse-android-projects "'+executionInfoPath+'"';

            try{
            var child = execSync(command, {stdio: 'inherit'});
            }
            catch(e){
                console.log(e)
            }

    }
}

function analyseAndroidApksShellBatch(repoInfo){
	    var projectList = repoInfo.projectList;
        var reportDir = repoInfo.reportDir;
        var repoDir = repoInfo.repoDir;

    for(var i in projectList){
        var projectInfo = projectList[i];
            var executionInfo = {
                reportDir: repoInfo.reportDir,
                repoDir: repoInfo.repoDir,
                projectList: [projectInfo]
            }

            var executionInfoPath = "./debug/executionInfo.json";
            FileManagerUtils.writeFileSync(executionInfoPath, JSON.stringify(executionInfo));

            //to generate svg file.
            var command = 'node --max_old_space_size=10240 "./utils/AndroidProjectAnalysis.js" --analyse-android-apks "'+executionInfoPath+'"';

            var child = execSync(command, {stdio: 'inherit'});

    }
}

function scanRepo(repoListPath, repoRecordPath){
		  //to generate svg file.
//			var classPath = '"C:\\Users\\flyqk\\Documents\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
			var classPath = '".' + pathSeparator + 'facility-tools' + pathSeparator + 'Repo Analyser' + pathSeparator + 'bin"';
			
		    var command = 'java -classpath '+classPath+' repo.AnalysisKit "scan-repo" "'+repoListPath+'" "'+repoRecordPath+'"';
		  	console.log(command);
		  	var child = exec(command, {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
		  		if (error !== null) {
		  			console.log('exec error: ' + error);
		  		}
		  		console.log('The file was saved!');
		  		  
		  	});
		  	
		  	child.stdout.on('data', function(data) {
		  	    console.log(data); 
		  	});
    
}

function selectFiles(repoRecordPath){
	 //to generate svg file.
//	var classPath = '"C:\\Users\\flyqk\\Documents\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
	var classPath = '".' + pathSeparator + 'facility-tools' + pathSeparator + 'Repo Analyser' + pathSeparator + 'bin"';

    var command = 'java -classpath '+classPath+' repo.AnalysisKit "select-files" "'+repoRecordPath+'"';
  	console.log(command);
  	var child = exec(command, {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
  		if (error !== null) {
  			console.log('exec error: ' + error);
  		}
  		console.log('The file was saved!');
  		  
  	});
  	
  	child.stdout.on('data', function(data) {
  	    console.log(data); 
  	});
}

function analyseSloc(repoRecordPath){
	 //to generate svg file.

//	var classPath = '"C:\\Users\\flyqk\\Documents\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
	var classPath = '".' + pathSeparator + 'facility-tools' + pathSeparator + 'Repo Analyser' + pathSeparator + 'bin"';

   var command = 'java -classpath '+classPath+' repo.AnalysisKit "analyse-sloc" "'+repoRecordPath+'"';
 	console.log(command);
 	var child = exec(command, {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
 		if (error !== null) {
 			console.log('exec error: ' + error);
 		}
 		console.log('The file was saved!');
 		  
 	});
 	
 	child.stdout.on('data', function(data) {
 	    console.log(data); 
 	});
}

function generateSlocReport(repoListPath, repoRecordPath){
	//  to generate svg file.
    //	var classPath = '"C:\\Users\\flyqk\\Documents\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
	var classPath = '".' + pathSeparator + 'facility-tools' + pathSeparator + 'Repo Analyser' + pathSeparator + 'bin"';

  var command = 'java -classpath '+classPath+' repo.AnalysisKit "generate-report" "'+repoListPath+'" "'+repoRecordPath+'"';
	console.log(command);
	var child = exec(command, {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
		}
		console.log('The file was saved!');
		  
	});
	
	child.stdout.on('data', function(data) {
	    console.log(data); 
	});
}

var functionSelection = process.argv[2];
var repoDesPath = process.argv[3];

var repo = JSON.parse(FileManagerUtils.readFileSync(repoDesPath).trim());

//1. create a list of projects:
 		
if(functionSelection === "--scan-repo"){
//2. scan the projects in repo
	var projectPaths = "";
	for(var i in repo.projectList){
		projectPaths += repo.projectList[i].path+"\n";
	}

	var repoRecordPath = repo.reportDir + pathSeparator + "sloc";
	
	mkdirp(repoRecordPath, function(err) {
		  var repoListPath = repoRecordPath + pathSeparator + "repositories.txt";
		  FileManagerUtils.writeFileSync(repoListPath, projectPaths);
		  scanRepo(repoListPath, repoRecordPath);
	});
}
else if(functionSelection === "--select-files"){
//3. open repo browser to select the files that should be include in the list
//var repoListDir= repo.reportDir+"\\temp";
var repoRecordPath = repo.reportDir + pathSeparator + "sloc";
selectFiles(repoRecordPath);
}
else if(functionSelection === "--analyse-sloc"){
//4. calculate sloc for each repo
//var repoListDir= repo.reportDir+"\\temp";
var repoRecordPath = repo.reportDir + pathSeparator + "sloc";
analyseSloc(repoRecordPath);
}
else if(functionSelection === "--generate-sloc-report"){
//5. calculate sloc for each repo
var repoRecordPath = repo.reportDir + pathSeparator + "sloc";
var repoListPath = repoRecordPath + pathSeparator + "repositories.txt";
generateSlocReport(repoListPath, repoRecordPath);
}
else if(functionSelection === "--calculate-cocomo-estimation-result"){
	var cocomoDataPath = repo.repoDir + pathSeparator + "COCOMORatings1.csv";
	var cocomoCalculator = require("../effort_estimators/COCOMOCalculator.js");
	cocomoCalculator.loadCOCOMOData(cocomoDataPath, function(cocomoDataList){
		for(var i in cocomoDataList){
		var cocomoData = cocomoCalculator.estimateProjectEffort(cocomoDataList[i]);
		console.log(cocomoData);
		}
	});
	
}
else if(functionSelection === "--collect-android-attributes"){
	var outputPath = repo.reportDir + pathSeparator + "android-attributes.csv";
	var androidAttrsCSV = "Proj, Services, Activities, BroadcastReceivers, ContentProviders, LayoutFiles, Views, Screens, EventHandlers";

    for(var i in repo.projectList){
    	var androidAttrsPath = repo.projectList[i].path + pathSeparator + "android-attrs.json";
    	if(!FileManagerUtils.existsSync(androidAttrsPath)){
        	continue;
        }
        //console.log(androidAttrsPath);
        androidAttrs = FileManagerUtils.readJSONSync(androidAttrsPath);
        //console.log(androidAttrs);
        androidAttrsCSV += "\n"+repo.projectList[i].tag+","
                + androidAttrs.Services+","
                +androidAttrs.Activities+","
                +androidAttrs.BroadcastReceivers+","
                +androidAttrs.ContentProviders+","
                +androidAttrs.LayoutFiles+","
                +androidAttrs.Views+","
                +androidAttrs.Screens+","
                +androidAttrs.EventHandlers;
    }

    FileManagerUtils.writeFileSync(outputPath, androidAttrsCSV);
}
else if(functionSelection === "--fix-android-analysis-reference"){
    var androidAnalysisPaths = [];
	var androidAnalysisReadPaths = [];
	var androidAnalysisWritePaths = [];
	for(var i in repo.projectList){
	    if(!FileManagerUtils.existsSync(repo.projectList[i].path)){
	        continue;
	    }
	    androidAnalysisPaths.push(repo.projectList[i].path);
		androidAnalysisReadPaths.push(repo.projectList[i].path+"/android-analysis-output.json");
		androidAnalysisWritePaths.push(repo.projectList[i].path+"/android-analysis-output1.json");
	}
    androidAnalysisResults = FileManagerUtils.readJSONFilesSync(androidAnalysisReadPaths);

	for(var i in androidAnalysisResults){
	    androidAnalysisResult = androidAnalysisResults[i];
	    if(!androidAnalysisResult){
	        continue;
	    }
    androidAnalysisResult.typeDependencyGraph=androidAnalysisPaths[i]+"/typedependencygraph.json"
    androidAnalysisResult.callGraph=androidAnalysisPaths[i]+"/callgraph.json"
    androidAnalysisResult.accessGraph=androidAnalysisPaths[i]+"/accessgraph.json"
    androidAnalysisResult.extendsGraph=androidAnalysisPaths[i]+"/extendsgraph.json"
    androidAnalysisResult.compositionGraph=androidAnalysisPaths[i]+"/compositiongraph.json"

    if(!FileManagerUtils.existsSync(androidAnalysisPaths[i]+"/soot-cfg-1.json")){
            androidAnalysisResult.cfg= androidAnalysisPaths[i]+"/soot-cfg-2.json"
    }
    else{
             androidAnalysisResult.cfg= androidAnalysisPaths[i]+"/soot-cfg-1.json"
    }
	}
    FileManagerUtils.writeJSONFilesSync(androidAnalysisWritePaths, androidAnalysisResults);


}
else if(functionSelection === "--parse-effort-and-active-personnel"){
effortRecords = [
  "EasySoundRecorder.txt",
  "MLManager.txt",
  "PhotoAffix.txt",
  "MovieGuide.txt",
  "MinimalToDo.txt",
  "AnotherMonitor.txt",
  "InstaMaterial.txt",
  "OmniNotes.txt",
  "ClipStack.txt",
  "AntennaPod.txt",
  "archi.txt",
  "bitcoin-wallet.txt",
  "ExoPlayer.txt",
  "gnucash-android.txt",
  "iosched.txt",
  "k-9.txt",
  "kickmaterial.txt",
  "NewPipe.txt",
  "Pedometer.txt",
  "Phonograph.txt",
  "pixel-dungeon.txt",
  "plaid.txt",
  "qksms.txt",
  "Shuttle.txt",
  "Telecine.txt",
  "turbo-editor.txt",
  "vlc.txt",
  "wally.txt",
  "WordPress-Android.txt",
  "superCleanMaster.txt",
  "kickstarter.txt",
  "FastHub.txt",
  "materialistic.txt",
  "owncloud.txt",
  "santa-tracker.txt",
  "2048.txt",
  "Telegram.txt",
  "Signal.txt",
  "Mindorks.txt",
  "shadowsocks.txt",
  "wikimedia.txt",
  "SeeWeather.txt",
  "astrid.txt",
  "PocketHub.txt",
  "todotxt.txt",
  "prey.txt",
  "iFixit.txt",
  "manmal.txt",
  "gauges.txt",
  "cgeo.txt",
  "reddit.txt",
  "AmazeFileManager.txt",
  "LeafPic.txt",
  "SimpleCalendar.txt",
  "AnExplorer.txt",
  "Timber.txt",
  "CoCoin.txt",
  "TravelMate.txt",
  "KISS.txt",
  "Android-CleanArchitecture.txt",
  "DuckDuckGo.txt",
  "Osmand.txt",
  "muzei.txt",
  "dashclock.txt",
  "Swiftnotes.txt",
  "mirakel-android.txt",
  "MaterialAudiobookPlayer.txt",
  "Kindle.txt"
  ]

  var dirPath = "/mnt/d/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/repo_analysis"
  var filePaths = []
    for(var i in effortRecords){
    	 filePaths.push(dirPath+"/"+effortRecords[i]);
    }
  var activePersonnel = "project, activePersonnel";
  var fileContents = FileManagerUtils.readFilesSync(filePaths);

  for(var i in fileContents){
    var lines = fileContents[i].split(/\r?\n/g);
    var triggerTimes = 0;
    var added = false;
    for(var j in lines){
        var line = lines[j]
        if(triggerTimes == 0){
            if(line === "[1] \"active personnel\""){
                triggerTimes ++;
                console.log("trigger times:"+effortRecords[i])
            }
        }
        else if(triggerTimes == 1){
            activePersonnel += "\n"+effortRecords[i].replace(".txt", "")+","+line.replace(/\[1\]\s/g, "");
            added = true;
            break;
        }
    }
    if(!added){
    activePersonnel += "\n"+effortRecords[i].replace(".txt", "")+","+"no found";
    }
  }
	FileManagerUtils.writeFileSync(repo.reportDir + pathSeparator + "effortRecords.csv",activePersonnel);
}
else if(functionSelection === "--analyse-android-apks"){
	
	analyseAndroidApks(repo);

}
else if(functionSelection === "--analyse-android-apks-shell-batch"){

	analyseAndroidApksShellBatch(repo);

}
else if(functionSelection === "--analyse-android-projects"){
	
analyseAndroidProjectsByPromise(repo)

}
else if(functionSelection === "--analyse-android-projects-shell-batch"){

analyseAndroidProjectsShellBatch(repo)

}
else if(functionSelection === "--filter-logs"){
	
//	filterLogs(repo.projectList, repo.reportDir);
  
//	var projectPaths = "";
  
	for(var i in repo.projectList){
		var projectPath = repo.projectList[i].path; 
		var logFile = repo.projectList[i].logFile;
		var logFolder = repo.projectList[i].logFolder;
		var filterFile = repo.projectList[i].filterFile;
		if(logFile){
		LogFilter.filterAndroidLog(projectPath+"/"+logFile, projectPath+"/"+filterFile, projectPath);
		}
		else{
		console.log(projectPath+"/"+logFolder)
		LogFilter.filterAndroidLogs(projectPath+"/"+logFolder, projectPath+"/"+filterFile, projectPath);	
		}
	}

}
else if(functionSelection === "--clean-repos"){

//	filterLogs(repo.projectList, repo.reportDir);

//	var projectPaths = "";

	for(var i in repo.projectList){
		var projectPath = repo.projectList[i].path;
        if(!FileManagerUtils.existsSync(projectPath)){
            continue;
        }

        var files = FileManagerUtils.listFilesSync(projectPath);
        for(var j in files){
            var file = files[j];
            if(file === repo.projectList[i].apkFileName){
                continue;
            }
            console.log(projectPath+pathSeparator+file);
            if(FileManagerUtils.isDirSync(projectPath+pathSeparator+file))
            {
            FileManagerUtils.deleteFolderRecursive(projectPath+pathSeparator+file);
            }
            else
            {
            FileManagerUtils.deleteFileSync(projectPath+pathSeparator+file);
            }
        }
	}

}
else if(functionSelection === "--check-repos"){

//	filterLogs(repo.projectList, repo.reportDir);

//	var projectPaths = "";

	for(var i in repo.projectList){
		var projectPath = repo.projectList[i].path;
        if(!FileManagerUtils.existsSync(projectPath)){
            continue;
        }

        var files = FileManagerUtils.listFilesSync(projectPath);
        for(var j in files){
            var file = files[j];
            if(file === repo.projectList[i].apkFileName){
                console.log(file+" repo doesn't exist.")
                continue;
            }
            console.log(projectPath+pathSeparator+file);
            if(FileManagerUtils.isDirSync(projectPath+pathSeparator+file))
            {
            FileManagerUtils.deleteFolderRecursive(projectPath+pathSeparator+file);
            }
            else
            {
            FileManagerUtils.deleteFileSync(projectPath+pathSeparator+file);
            }
        }
	}

}
else if(functionSelection === "--distribute-effort-to-personnel"){
    var onlineProjects = [];
    var onlineProjectsIndex = {};
    if(FileManagerUtils.existsSync(repo.repoDir+"/project_list_4_25.csv")){
    var onlineProjectData = FileManagerUtils.loadCSVFileSync(repo.repoDir+"/project_list_4_25.csv", true);
    for(var i in onlineProjectData){
        var onlineProject = onlineProjectData[i];
        onlineProjects.push(onlineProject.Project);
        onlineProjectsIndex[onlineProject.Project] = i;
    }
    }

//        var contributors = [];
        var contributorProjects = {};
        if(FileManagerUtils.existsSync(repo.repoDir+"/emails.csv")){
        var contributorData = FileManagerUtils.loadCSVFileSync(repo.repoDir+"/emails.csv", true);
        for(var i in contributorData){
            var contributor = contributorData[i];
//            contributors.push(contributor);
            var contributorProject = contributorProjects[contributor.repo_name];
            if(!contributorProject){
                contributorProjects[contributor.repo_name] = [];
                contributorProject = contributorProjects[contributor.repo_name];
            }
            contributorProject.push(contributor);
        }
     }

    var output = "id,name,email,contributions,repo_name,effort\n";
     for(var i in contributorProjects){
        var contributorProject = contributorProjects[i];
        var totalContribution = 0;
        for(var j in contributorProject){
            var contributor = contributorProject[j];
            totalContribution += Number(contributor.contributions);
        }
        var effort = 0;
        var repo_name = j;

           if(onlineProjects.length>0){
                    		var matches = stringSimilarity.findBestMatch(repo_name, onlineProjects);
        //            		if(matches.bestMatch.rating > 0.5){
                    		matchedOnlineProject  =  onlineProjectData[onlineProjectsIndex[matches.bestMatch.target]];
        //            		}
                            console.log(repo_name+" matched: "+matches.bestMatch.target);

           effort = Number(matchedOnlineProject.Effort)
           }

        for(var j in contributorProject){
                    var contributor = contributorProject[j];
                    contributor["effort"] = totalContribution == 0 ? 0 : Number(contributor.contributions)/totalContribution*effort;
                    output += contributor.id+","+contributor.name+","+contributor.email+","+contributor.contributions+","+contributor.repo_name+","+contributor.effort+"\n";
         }
     }


     FileManagerUtils.writeFileSync(repo.reportDir + pathSeparator + "effort_distribution.csv", output);

}
else if(functionSelection === "--connect-data-sheets"){
	var datasheet1 = repo.repoDir + pathSeparator + "android_dataset_8_6_3.csv";
	var datasheet2 = repo.repoDir + pathSeparator + "Use_Case_Analysis_Results_1.csv";

	var data1 = FileManagerUtils.loadCSVFileSync2(datasheet1, true);
	var data2 = FileManagerUtils.loadCSVFileSync2(datasheet2, true);

	var header = data1.header + ","+data2.header;

    var projects2 = [];
    var projects2Index = {};
    var projects2List = [];

    for(var i in data2.body){
            var project = data2.body[i];
            //console.log(project);
            projects2.push(project.Project);
            projects2Index[project.Project] = i;
            projects2List[i] = project;
    }


    var outputStr = "";
    outputStr += header;

    //console.log(projects2);

    for(var i in data1.body){
         var proj1 = data1.body[i];

         var matches = stringSimilarity.findBestMatch(proj1.PROJ, projects2);

         matchedProject  =  projects2List[projects2Index[matches.bestMatch.target]];

         console.log(matchedProject.line);

         outputStr += "\n"+proj1.line + "," + matchedProject.line;

         console.log(project+" matched: "+matches.bestMatch.target);
    }

    FileManagerUtils.writeFileSync(repo.reportDir + pathSeparator + "combined_data_set.csv", outputStr);

}
else if(functionSelection === "--generate-repo-analysis-report"){

//var modelOutputDirs = FileManagerUtils.readFileSync(repo.reportDir + pathSeparator + "analysis-results-folders.txt").split(/\r?\n/g);
console.log(repo.reportDir + pathSeparator + "files.txt");
var modelOutputDirs = FileManagerUtils.readFileSync(repo.reportDir + pathSeparator + "files.txt").split(/\r?\n/g);
//console.log(modelOutputDirs)
// or load the modelOutputDirs from the json file

//var modelOutputDirs = []
//for(var i in repo.projectList){
//    var projectInfo = repo.projectList[i];
//    //modelOutputDirs.push(repo.repoDir+"/"+repo.projectList[i].tag);
//    modelOutputDirs.push(projectInfo.path+"_"+projectInfo.clusterConfig);
//}

var repoProjects = [];
var repoProjectsIndex = {};
for(var i in repo.projectList){
    var repoProject = repo.projectList[i];
    repoProjects.push(repoProject.tag);
    repoProjectsIndex[repoProject.tag] = i;
}


var onlineProjects = [];
var onlineProjectsIndex = {};
if(FileManagerUtils.existsSync(repo.repoDir+"/project_list.csv")){
var onlineProjectData = FileManagerUtils.loadCSVFileSync(repo.repoDir+"/project_list.csv", true);
for(var i in onlineProjectData){
    var onlineProject = onlineProjectData[i];
    onlineProjects.push(onlineProject.Project);
    onlineProjectsIndex[onlineProject.Project] = i;
}
}


var useCaseProjects = [];
var useCaseProjectsIndex = {};
if(FileManagerUtils.existsSync(repo.repoDir+"/Use_Case_Analysis_Results.csv")){
var useCaseProjectData = FileManagerUtils.loadCSVFileSync(repo.repoDir+"/Use_Case_Analysis_Results.csv", true);
for(var i in useCaseProjectData){
    var useCaseProject = useCaseProjectData[i];
    useCaseProjects.push(useCaseProject.Project);
    useCaseProjectsIndex[useCaseProject.Project] = i;
}
}

var transactionFiles = [];
var filteredTransactionFiles = [];
var modelEvaluationFiles = [];
var effortEstimationFilesEUCP = [];
var effortEstimationFilesEXUCP = [];
var effortEstimationFilesEUUCP = [];
var effortEstimationFiles = [];

for(var i in modelOutputDirs){
  //code here using lines[i] which will give you each line
	var modelOutputDir = modelOutputDirs[i];

	if(modelOutputDir === "" || !FileManagerUtils.existsSync(modelOutputDir)||!FileManagerUtils.isDirSync(modelOutputDir)){
		continue;
	}
	
	filteredTransactionFiles.push(modelOutputDir + pathSeparator +"filteredTransactionEvaluation.csv");
	transactionFiles.push(modelOutputDir + pathSeparator + "transactionEvaluation.csv");
	modelEvaluationFiles.push(modelOutputDir + pathSeparator + "modelEvaluation.csv");
//	effortEstimationFilesEUCP.push(modelOutputDir + pathSeparator + "estimationResultEUCP.json");
//	effortEstimationFilesEXUCP.push(modelOutputDir + pathSeparator + "estimationResultEXUCP.json");
//	effortEstimationFilesDUCP.push(modelOutputDir + pathSeparator + "estimationResultDUCP.json");

	effortEstimationFiles.push(modelOutputDir + pathSeparator + "estimationResultEUCP.json");
	effortEstimationFiles.push(modelOutputDir + pathSeparator + "estimationResultEXUCP.json");
	effortEstimationFiles.push(modelOutputDir + pathSeparator + "estimationResultDUCP.json");
}


var modelEvaluationContents = FileManagerUtils.readFilesSync(modelEvaluationFiles);
var modelEvaluationConsolidation = "";
var matchedProjectIndex = new Set();
var matchedCseCaseProjectIndex = new Set();
var unavailableProject = [];
var headed = false;
console.log("matched projects:")
for(var i in modelEvaluationContents){
      if(modelEvaluationContents[i] === "" || !modelEvaluationContents[i]){
      continue;
      }
	  var modelEvaluationLines = modelEvaluationContents[i].split(/\r?\n/g);
	  if(!headed){
		  modelEvaluationConsolidation += modelEvaluationLines[0]+","+"transaction_file";
	   if(onlineProjects.length > 0){
	        for(var k in onlineProjectData[0]){
                           modelEvaluationConsolidation += ","+k;
            }
      	}

      	 if(useCaseProjects.length > 0){
        	        for(var k in useCaseProjectData[0]){
                                   modelEvaluationConsolidation += ","+k;
                    }
         }
         headed = true;
	  }


          var matchedOnlineProject = {};
		  for(var j = 1; j < modelEvaluationLines.length; j++){
		  if(modelEvaluationLines[j] === ""){
			  continue;
		  }

		  modelEvaluationConsolidation += "\n"+modelEvaluationLines[j]+","+filteredTransactionFiles[i];

		  var fields = modelEvaluationLines[j].split(",");
		  if(fields){
		    var project = fields[1].substring(0, fields[1].lastIndexOf("_"));

            if(onlineProjects.length>0){
            		var matches = stringSimilarity.findBestMatch(project, onlineProjects);
//            		if(matches.bestMatch.rating > 0.5){
            		matchedOnlineProject  =  onlineProjectData[onlineProjectsIndex[matches.bestMatch.target]];
            		matchedProjectIndex.add(onlineProjectsIndex[matches.bestMatch.target]);
//            		}
                    console.log(project+" matched: "+matches.bestMatch.target);


            for(var k in matchedOnlineProject){
                    modelEvaluationConsolidation += ",\""+ matchedOnlineProject[k]+"\"";
            }
            }


            if(useCaseProjects.length > 0){
                    //matches for the use case analysis data
                    var useCaseProjMatches = stringSimilarity.findBestMatch(project, useCaseProjects);
                    // if(useCaseProjMatches.bestMatch.rating > 0.5){
                     matchedCseCaseProject  =  useCaseProjectData[useCaseProjectsIndex[useCaseProjMatches.bestMatch.target]];
                     matchedCseCaseProjectIndex.add(useCaseProjectsIndex[useCaseProjMatches.bestMatch.target]);
                    // }
                    console.log(project+" matched: "+useCaseProjMatches.bestMatch.target);


                for(var k in matchedCseCaseProject){
                                modelEvaluationConsolidation += ",\""+ matchedCseCaseProject[k]+"\"";
                }


            }
		  }

		  }
}
	  
FileManagerUtils.writeFileSync(repo.reportDir + pathSeparator + "modelEvaluations.csv", modelEvaluationConsolidation);

var effortEstimationContents = FileManagerUtils.readJSONFilesSync(effortEstimationFiles);
var effortEstimationConsolidation = "project, eucp, exucp, ducp";
for(var i = 0 ; i < effortEstimationContents.length; i++){
	     if(i%3 == 0){
	        effortEstimationConsolidation += "\n"+modelOutputDirs[i/3]+",";
	     }
	     else{
	         effortEstimationConsolidation += ",";
	     }

          if(effortEstimationContents[i]){
		  effortEstimationConsolidation += effortEstimationContents[i].Effort;
		  }
}

FileManagerUtils.writeFileSync(repo.reportDir + pathSeparator + "estimationResults.csv", effortEstimationConsolidation);


var transactionEvaluationContents = FileManagerUtils.readFilesSync(transactionFiles);
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
	  FileManagerUtils.writeFileSync(filteredTransactionFiles[i],  filteredTransactionEvaluationStr);
}

FileManagerUtils.writeFileSync(repo.repoDir + pathSeparator + "transactionEvaluations.csv", transactionEvaluationConsolidation);

          var unmatchedRepoProjects = {};
		  console.log("unmatched online projects.");
		  console.log(matchedProjectIndex);
		  for(var i in onlineProjects){
		    if(matchedProjectIndex.has(i)){
		        continue;
		    }
		     var repoProjMatches = stringSimilarity.findBestMatch(onlineProjects[i], repoProjects);
              // if(useCaseProjMatches.bestMatch.rating > 0.5){
              unmatchedRepoProjects[repoProjMatches.bestMatch.target] = 1;
		    console.log(onlineProjects[i]);
		  }

		  console.log("unmatched use case projects.");
          		  console.log(matchedCseCaseProjectIndex);
          		  for(var i in useCaseProjects){
          		    if(matchedCseCaseProjectIndex.has(i)){
          		        continue;
          		    }
          		     var repoProjMatches = stringSimilarity.findBestMatch(useCaseProjects[i], repoProjects);
                                  // if(useCaseProjMatches.bestMatch.rating > 0.5){
                                  unmatchedRepoProjects[repoProjMatches.bestMatch.target] = 1;
          		    console.log(useCaseProjects[i]);

   		  }

   		  var unmatchedProjectsProfile = {
   		  reportDir: repo.reportDir,
   		  repoDir: repo.repoDir,
   		  projectList : [
   		  ]
   		  }

   		  for(var i in unmatchedRepoProjects){
   		   unmatchedProjectsProfile.projectList.push(repo.projectList[repoProjectsIndex[i]]);
   		  }
     FileManagerUtils.writeJSONFilesSync([repo.repoDir + pathSeparator + "unmatched_projects.json"], [unmatchedProjectsProfile]);
}
