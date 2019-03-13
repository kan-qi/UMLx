var path = require('path');
var mkdirp = require('mkdirp');

var testProject12 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\carbondata_archive\\carbondata";
var testProject13 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\fabric-sdk-java";
var testProject14 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\fluo-yarn";
var testProject15 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\hise";
var testProject16 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\httpasyncclient";
var testProject17 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\httpcomponents-core";
var testProject18 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\jackrabbit";
var testProject19 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\jackrabbit-filevault";
var testProject20 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\jackrabbit-oak";

var testProject21 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\jackrabbit-ocm";
var testProject22 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\james-jspf";
var testProject23 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\james-mime4j";
var testProject24 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\james-project";
var testProject25 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\JBREX_work_space";
var testProject26 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\jbrex-master";
var testProject27 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\jclouds";

var testProject28 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\kalumet";
var testProject29 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\karaf";
var testProject30 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\mybatis-3";

var testProject31 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\Repo Analyser";
var testProject32 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\Thunder Fighter 2048";
var testProject33 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\webAnalyzer";


//var config = require("../../config.js");

var targetProjects1 = [
//	testProject12, //carbondata_archive\\carbondata  analysis generated
//	testProject13, //fabric-sdk-java xmi exists, analysis generated
//	testProject14, //fluo-yarn xmi exists, analysis generated
//	testProject15, //hise failed/generated
//	testProject16, //httpasyncclient
//	testProject17, //httpcomponents-core //generated
//	testProject18, //jackrabbit // out of memory error
//	testProject19, //jackrabbit-filevault //generated........
//	testProject20, //jackrabbit-oak //met issue.
//
//	testProject21, //jackrabbit-ocm //generated.
//	testProject22, //james-jspf //generated
//	testProject23, //james-mime4j //generated
	
//	testProject24, //james-project //class cast exception
//	testProject25, //JBREX_work_space //not a project
//	testProject26, //jbrex-master // it has a series of projects.
//	testProject27, //jclouds //has an issue when recovering.

//	testProject28, //kalumet //generated, but has an issue. there was an issue when analysing xmi files.
//	testProject29, //karaf //has an issue/
//	testProject30, //mybatis-3 //has an issue
//
//	testProject31, //Repo Analyser
//	testProject32, //Thunder Fighter 2048
//	testProject33, //webAnalyz er
	];

// open source project list 2
var targetProjects2 = [
	testProject12, //carbondata_archive\\carbondata  analysis generated
	testProject17, //httpcomponents-core //generated
	testProject19, //jackrabbit-filevault //generated........
	testProject21, //jackrabbit-ocm //generated.
	testProject22, //james-jspf //generated
	testProject23, //james-mime4j //generated
//	testProject28, //kalumet //generated, but has an issue. there was an issue when analysing xmi files.
	];

//open source project list 2
var targetProjects3 = [
//	testProject12, //carbondata_archive\\carbondata  analysis generated
//	testProject14, //fluo-yarn
	testProject28, //kalumet //generated, but has an issue. there was an issue when analysing xmi files.
	];

var fs = require('fs');
var exec = require('child_process').exec;
var EclipseUtil = require("../../utils/EclipseUtil.js");
var FileManagerUtil = require("../../utils/FileManagerUtil.js");
var RScriptExec = require('../../utils/RScriptUtil.js');

var UMLxAnalyticToolKit = require("../../utils/UMLxAnalyticToolKitCore.js");

function recoverKDMModel(repoListPath){
	
	var currentWorkSpace = "C:\\Users\\flyqk\\workspace\\.metadata"
	FileManagerUtil.deleteFolderRecursive(currentWorkSpace);

	  //use promise to construct the repo objects
    function recoverModel(projectPath, override){
        return new Promise((resolve, reject) => {
        		
        	var modelFile = projectPath + "/eclipse_gen_umlx_kdm.xmi";
        	
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
    
    return Promise.all(targetProjects.map(projectPath=>{
        return recoverModel(projectPath, false);
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

function analyseXMIModel(projectXMIs){
	

	var reportPath = reportDir+"\\analysis-results-folders.txt";
//	FileManagerUtil.deleteFileSync(reportPath);
	
	  //use promise to construct the repo objects
    function analyseModel(projectXMI){
        return new Promise((resolve, reject) => {
//        	config.setDebugOutputDir(projectPath+"/debug");

        	//specific for the source analysis projects.
        	var projectName = path.basename(path.dirname(projectXMI)).replace(/\..+$/, '');
        	var outputDir = path.dirname(projectXMI)+"\\"+projectName;
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
    
    return Promise.all(projectXMIs.map(projectXMI=>{
        return analyseModel(projectXMI);
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


function requestEffortData(targetProjects){
	
	  //use promise to construct the repo objects
  function requestEffort(projectPath, override){
      return new Promise((resolve, reject) => {
      		
//      	var outputFolder = projectPath;
//      	var inputFile = projectPath + "/eclipse_gen_umlx_kdm.xmi";
      	var outputFilePath = projectPath + "/requested_effort.txt";
      	
      	fs.exists(outputFilePath, (exists) => {
      	if(exists && !override){
      		console.log(outputFilePathe+" doesn't exist.");
      		resolve();
      	}
      	else{

          	var gitUrlFile = projectPath + "/git-url.txt";
          	
      		fs.exists(gitUrlFile, (exists) => {
      	      	if(!exists){
      	      		console.log(gitUrlFile+" doesn't exist.");
      	      		resolve();
      	      	}
      	      	else{
      	      	fs.readFile(gitUrlFile, 'utf-8', (err, str) => {
 				   if (err) throw err;
// 				    console.log(data);
 				   
      		var gitUrl = str;
      		var command = './data/TransactionWeighting/active_contributors_every_30.R "'+gitUrl+'" "'+outputFilePath+'" ';
			
          //to generate svg file.
      		RScriptExec.runRScript(command,function(result){
				if (!result) {
//					console.log('exec error: ' + error);
					console.log("project effort estimation error");
				}
				console.log(gitUrl+": effort request finished.");
				resolve();
			});

 			});
      	      	}
    	  });
      	}
      });
  });
  }
  
  return Promise.all(targetProjects.map(projectPath=>{
      return requestEffort(projectPath);
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

//function analyseXMIModel(){
//	
//	  //use promise to construct the repo objects
//  function analyseModel(projectPath){
//      return new Promise((resolve, reject) => {
//      		
//      	var outputFolder = projectPath;
//      	var inputFile = projectPath + "/eclipse_gen_umlx_kdm.xmi";
//      	var logFile = projectPath+"/src_analysis.log"
//      	
//      	var access = fs.createWriteStream(logFile);
//      	
//      	fs.exists(inputFile, (exists) => {
//      	if(!exists){
//      		console.log(inputFile+" doesn't exist.");
//      		resolve();
//      	}
//      	else{
//          //to generate svg file.
//          var command = 'node --max_old_space_size=4096 UMLxAnalyticToolKit.js "' + inputFile + '" "'+outputFolder+'"';
//      	console.log(command);
//      	var child = exec(command, {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
//      		if (error !== null) {
//      			console.log('exec error: ' + error);
//      		}
//      		console.log('The file was saved!');
//      		
//      		resolve();
//      		  
//      	});
//      	
//      	child.stdout.write = child.stderr.write = access.write.bind(access);
//      	
//      	child.stdout.on('data', function(data) {
//      	    console.log(data); 
//      	});
//      	}
//    	  });
//      	
//      });
//  }
//  
//  return Promise.all(targetProjects.map(projectPath=>{
//      return analyseModel(projectPath);
//  })).then(
//      function(){
//          return new Promise((resolve, reject) => {
//              setTimeout(function(){
//              	console.log("analysis finished");
//                  resolve();
//
//              }, 0);
//          });
//      }
//
//  ).catch(function(err){
//      console.log(err);
//  });
//	
//}


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

function generateReport(repoRecordPath){
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

var repoListPath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\repositories.txt";
//var repoRecordPath = ".\\data\\RufusLabs\\sloc";
var repoRecordPath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\OpenSource\\sloc";

var functionSelection = process.argv[2];

var reportDir = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source";

var targetProjects = targetProjects3;


//1. create a list of projects:
 		
if(functionSelection === "--scan-repo"){
//2. scan the projects in repo
scanRepo(repoListPath, repoRecordPath);
}
else if(functionSelection === "--select-files"){
//3. open repo browser to select the files that should be include in the list
selectFiles(repoRecordPath);
}
else if(functionSelection === "--analyse-sloc"){
//4. calculate sloc for each repo
analyseSloc(repoRecordPath);
}
else if(functionSelection === "--generate-report"){
	//4. calculate sloc for each repo
generateReport(repoRecordPath);
}

else if(functionSelection === "--recover-kdm"){
	
recoverKDMModel(repoListPath)

}
else if(functionSelection === "--analyse-xmi-model"){
	
var projectXMIs = [];
for(var i in targetProjects){
	projectXMIs.push(targetProjects[i]+"\\eclipse_gen_umlx_kdm.xmi");
}
	
analyseXMIModel(projectXMIs);

}
else if(functionSelection === "--request-effort-data"){
	
requestEffortData(targetProjects);

}
else if(functionSelection === "--generate-model-analysis-report"){
  
  var modelOutputDirs = FileManagerUtil.readFileSync(reportDir+"\\analysis-results-folders.txt").split(/\r?\n/g);
  var transactionFiles = [];
  var modelEvaluationFiles = [];
  for(var i in modelOutputDirs){
      //code here using lines[i] which will give you each line
  	var modelOutputDir = modelOutputDirs[i];

  	if(modelOutputDir === ""){
  		continue;
  	}
  	
  	transactionFiles.push(modelOutputDir+"\\"+"transactionAnalytics.csv");
  	modelEvaluationFiles.push(modelOutputDir+"\\"+"modelEvaluation.csv");
  }
  
  var modelEvaluationContents = FileManagerUtil.readFilesSync(modelEvaluationFiles);
  var modelEvaluationConsolidation = "";
  for(var i in modelEvaluationContents){
	  var modelEvaluationLines = modelEvaluationContents[i].split(/\r?\n/g);
	  if(i == 0){
		  modelEvaluationConsolidation += modelEvaluationLines[0]+","+"transaction_file";
	  }
	 
	  modelEvaluationConsolidation += "\n"+modelEvaluationLines[1]+","+transactionFiles[i];
  }
  
  FileManagerUtil.writeFileSync(reportDir+"\\modelEvaluations.csv", modelEvaluationConsolidation);
}
else if(functionSelection === "--generate-repo-analysis-report"){
	
	var repoDir = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects";
	var repoModelEvaluationDirs = [
//			reportDir2010_2011+"\\modelEvaluations-8-14-1.csv",
			reportDir2011_2012+"\\modelEvaluations-8-14-1.csv",
			reportDir2012_2013+"\\modelEvaluations-8-14-1.csv",
			reportDir2013_2014+"\\modelEvaluations-8-14-1.csv",
			reportDir2014_2015+"\\modelEvaluations-8-14-1.csv",
			reportDir2015_2016+"\\modelEvaluations-8-14-1.csv",
			reportDir2016_2017+"\\modelEvaluations-8-14-1.csv",
	]

	var modelEvaluationContents = FileManagerUtil.readFilesSync(repoModelEvaluationDirs);
	var modelEvaluationConsolidation = "";
	var transactionFilePaths = [];
	for(var i in modelEvaluationContents){
		 var modelEvaluationLines = modelEvaluationContents[i].split(/\r?\n/g);
		  if(i == 0){
			  modelEvaluationConsolidation += modelEvaluationLines[0]
		  }
		  
			  for(var j = 1; j < modelEvaluationLines.length; j++){
			  if(modelEvaluationLines[j] === ""){
				  continue;
			  }
			  modelEvaluationConsolidation += "\n"+modelEvaluationLines[j].replace("transactionEvaluation", "filteredTransactionEvaluation");
			  var fields = modelEvaluationLines[j].split(/,/g);
			  transactionFilePaths.push(fields[fields.length - 1]);
			  }
	}
		  
	FileManagerUtil.writeFileSync(repoDir+"\\modelEvaluations-8-16.csv", modelEvaluationConsolidation);

	var transactionEvaluationContents = FileManagerUtil.readFilesSync(transactionFilePaths);
	var transactionEvaluationConsolidation = "";

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
		  
		  var transactionFilePath = transactionFilePaths[i];
		  FileManagerUtil.writeFileSync(path.dirname(transactionFilePath)+"\\filteredTransactionEvaluation.csv",  filteredTransactionEvaluationStr);
	}

	FileManagerUtil.writeFileSync(repoDir+"\\transactionEvaluations-8-16.csv", transactionEvaluationConsolidation);

	}


/*
 * 
 * Things to do:
 * 
 * the scanning function still has issues.
 * merge the scripts into one
 * integrate the estimation script into the tool.
 * testing more on the tool
 * 
 */
