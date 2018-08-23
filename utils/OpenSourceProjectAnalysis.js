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
var EclipseUtil = require("./EclipseUtil.js");
var FileManagerUtil = require("./FileManagerUtil.js");
var RScriptExec = require('./RScriptUtil.js');

var UMLxAnalyticToolKit = require("./UMLxAnalyticToolKitCore.js");

function recoverKDMModel(projectList){
	
	var currentWorkSpace = "C:\\Users\\flyqk\\workspace\\.metadata"
	FileManagerUtil.deleteFolderRecursive(currentWorkSpace);

	  //use promise to construct the repo objects
    function recoverModel(projectPath, modelFile, override){
        return new Promise((resolve, reject) => {
        		
        	var modelFile = projectPath + "\\"+modelFile;
        	
        	console.log(modelFile);
        	
        	fs.exists(modelFile, (exists) => {
        	if(exists && !override){
        		console.log(modelFile +" already exist.");
        		resolve();
        	}
        	else{
            //to recover kdm model
        		
        		EclipseUtil.generateKDMModel2(projectPath, function(filePath){
        			console.log("finished recovering kdm model");
        			console.log(filePath);
            		resolve();
        		});
        		
        	}
      	  });
        	
        });
    }
    
    return Promise.all(projectList.map(project=>{
        return recoverModel(project.path, project.modelFile, false);
    })).then(
        function(){
            return new Promise((resolve, reject) => {
                setTimeout(function(){
                	console.log("recoverFinished");
                    resolve();

                }, 0);
            });
        }

    ).catch(function(err){
        console.log(err);
    });

}

function analyseXMIModel(projectList, reportDir){
	

	var reportPath = reportDir+"\\analysis-results-folders.txt";
//	FileManagerUtil.deleteFileSync(reportPath);
	
	  //use promise to construct the repo objects
    function analyseModel(projectXMI, projectName){
        return new Promise((resolve, reject) => {
//        	config.setDebugOutputDir(projectPath+"/debug");
        	
        	if(!projectName){
        		 let date = new Date();
        	     let analysisDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();

        	    projectName = analysisDate+"@"+Date.now();
        	}
        	var outputDir = path.dirname(projectXMI)+"\\"+projectName+"_analysis";
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
        return analyseModel(project.path+"\\"+project.modelFile, project.tag);
    })).then(
        function(){
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
			var classPath = '"C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
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
	var classPath = '"C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
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
	var classPath = '"C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
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

function generateSlocReport(repoRecordPath){
	 //to generate svg file.
	var classPath = '"C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
  var command = 'java -classpath '+classPath+' repo.AnalysisKit "generate-report" "'+repoRecordPath+'"';
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
	
	var repoListDir= repo.reportDir+"\\temp"
	mkdirp(repoListDir, function(err) {
		  var repoListPath = repoListDir+"\\repositories.txt";
		  var repoRecordPath = repoListDir+"\\sloc";
		  FileManagerUtil.writeFileSync(repo.reportDir+"\\repositories.txt", projectPaths);
		  scanRepo(repoListPath, repoRecordPath);
	});
}
else if(functionSelection === "--select-files"){
//3. open repo browser to select the files that should be include in the list
var repoListDir= repo.reportDir+"\\temp";
var repoRecordPath = repoListDir+"\\sloc";
selectFiles(repoRecordPath);
}
else if(functionSelection === "--analyse-sloc"){
//4. calculate sloc for each repo
var repoListDir= repo.reportDir+"\\temp";
var repoRecordPath = repoListDir+"\\sloc";
analyseSloc(repoRecordPath);
}
else if(functionSelection === "--generate-sloc-report"){
	//4. calculate sloc for each repo
var repoListDir= repo.repoDir+"\\temp";
var repoRecordPath = repoListDir+"\\sloc";
generateSlocReport(repoRecordPath);
}

else if(functionSelection === "--recover-kdm"){
	
recoverKDMModel(repo.projectList)

}
else if(functionSelection === "--analyse-xmi-model"){
analyseXMIModel(repo.projectList, repo.reportDir);
}
else if(functionSelection === "--generate-repo-analysis-report"){

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

}

