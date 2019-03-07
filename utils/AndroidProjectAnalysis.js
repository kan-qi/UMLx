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
var exec = require('child_process').exec;
var AndroidLogUtil = require("./AndroidLogUtil.js");
var FileManagerUtil = require("./FileManagerUtils.js");
var RScriptExec = require('./RScriptUtil.js');
var LogFilter = require('./AndroidLogFilter.js');
var config = require("../config.js");

var UMLxAnalyticToolKit = require("./UMLxAnalyticToolKitCore.js");

// Use the forward slash separator for running on macOS/Unix/Linux
var pathSeparator = "\\";
//var pathSeparator = "/";


function analyseAndroidApks(projectList, reportDir){
	console.log("analyse android apks");
	
    	let final = [];

    	function apkAnalysisList(projectList) {
    	  return projectList.reduce((promise, project) => {
    	    return promise
    	      .then((result) => {
    	        console.log("analysing project: "+project.apkFileName);
    	        return AndroidLogUtil.generateAndroidAnalysis(project.apkFileName).then(result => final.push(result));
    	      })
    	      .catch(console.error);
    	  }, Promise.resolve());
    	}

    	apkAnalysisList(projectList)
    	  .then(() => function(){
    		  console.log('analysis finished');
    	  });
	
}

function analyseAndroidProject(projectList, reportDir){
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
        		FileManagerUtil.appendFile(reportPath, model.OutputDir+"\n", function(message){
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
	 //to generate svg file.
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

var repo = JSON.parse(FileManagerUtil.readFileSync(repoDesPath));

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
		  FileManagerUtil.writeFileSync(repoListPath, projectPaths);
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
	//4. calculate sloc for each repo
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
else if(functionSelection === "--analyse-android-apks"){
	
	analyseAndroidApks(repo.projectList, repo.reportDir);

}
else if(functionSelection === "--analyse-android-projects"){
	
analyseAndroidProject(repo.projectList, repo.reportDir);

}
else if(functionSelection === "--filter-logs"){
	
//	filterLogs(repo.projectList, repo.reportDir);
//	
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
		LogFilter.filterAndroidLogs(projectPath+"/"+logFolder, projectPath+"/"+filterFile, projectPath);	
		}
	}

}
else if(functionSelection === "--generate-repo-analysis-report"){

var modelOutputDirs = FileManagerUtil.readFileSync(repo.reportDir + pathSeparator + "analysis-results-folders.txt").split(/\r?\n/g);
var transactionFiles = [];
var filteredTransactionFiles = [];
var modelEvaluationFiles = [];

for(var i in modelOutputDirs){
  //code here using lines[i] which will give you each line
	var modelOutputDir = modelOutputDirs[i];

	if(modelOutputDir === ""){
		continue;
	}
	
	filteredTransactionFiles.push(modelOutputDir + pathSeparator +"filteredTransactionEvaluation.csv");
	transactionFiles.push(modelOutputDir + pathSeparator + "transactionEvaluation.csv");
	modelEvaluationFiles.push(modelOutputDir + pathSeparator + "modelEvaluation.csv");
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
	  
FileManagerUtil.writeFileSync(repo.reportDir + pathSeparator + "modelEvaluations.csv", modelEvaluationConsolidation);

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

FileManagerUtil.writeFileSync(repo.repoDir + pathSeparator + "transactionEvaluations.csv", transactionEvaluationConsolidation);

}
