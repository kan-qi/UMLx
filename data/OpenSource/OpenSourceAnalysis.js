
var testProject12 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\alltheapps";

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
var testProject34 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\carbondata_archive\\carbondata";

var targetProjects = [
//	testProject12, //alltheapps
//
//	testProject13, //fabric-sdk-java
	testProject14, //fluo-yarn
//	testProject15, //hise
//	testProject16, //httpasyncclient
//	testProject17, //httpcomponents-core
//	testProject18, //jackrabbit
//	testProject19, //jackrabbit-filevault
//	testProject20, //jackrabbit-oak
//
//	testProject21, //jackrabbit-ocm
//	testProject22, //james-jspf
//	testProject23, //james-mime4j
//	testProject24, //james-project
//	testProject25, //JBREX_work_space
//	testProject26, //jbrex-master
//	testProject27, //jclouds
//
//	testProject28, //kalumet
//	testProject29, //karaf
//	testProject30, //mybatis-3
//
//	testProject31, //Repo Analyser
//	testProject32, //Thunder Fighter 2048
//	testProject33, //webAnalyzer
//	testProject34, //carbondata_archive\\carbondata
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

function analyseXMIModel(xmiModelFileName){
	
	  //use promise to construct the repo objects
    function analyseModel(projectPath){
        return new Promise((resolve, reject) => {
        		
        	var outputFolder = projectPath;
//        	var inputFile = projectPath + "/eclipse_gen_umlx_kdm.xmi";
        	var inputFile = projectPath + "/"+xmiModelFileName;
        	
        	fs.exists(inputFile, (exists) => {
        	if(!exists){
        		console.log(inputFile+" doesn't exist.");
        		resolve();
        	}
        	else{
            //to generate svg file.
        	UMLxAnalyticToolKit.analyseSrc(inputFile, outputFolder, function(){
        		
        		console.log('analysis finished!');
        		
        		resolve();
        		  
        	});
        	
        	}
      	  });
        	
        });
    }
    
    return Promise.all(targetProjects.map(projectPath=>{
        return analyseModel(projectPath);
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

function requestEffortData(xmiModelFileName){
	
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
	
analyseXMIModel("eclipse_gen_umlx_kdm.xmi");

}
else if(functionSelection === "--request-effort-data"){
	
requestEffortData(repoListPath);

}

