/*
 * case study steps:
 * 
 * 1. create a list of projects:
 * 		dir /b /a > repo.txt
 * 2. scan the projects in repo
 * 		use repo scan files for each project and establish a repo record
 * 3. open repo browser to select the files that should be include in the list
 * 4. calculate sloc for each repo
 * 
 */
var testProject33 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\all-apps";
var testProject34 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\alltheapps";
var testProject35 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\btchatprotobuf";
var testProject36 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\cuffbackgroundservice";
var testProject37 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\dialer";
var testProject38 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\incallui";
var testProject39 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\incomingcallscreen";
var testProject40 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\integrated-nav-bar";
var testProject41 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\launcher-3";
var testProject42 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\lockscreen";
var testProject43 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\musicplayer";
var testProject44 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\musicplayerwithlockscreencom";
var testProject45 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\navigationbar";
var testProject46 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\old_dialer";
var testProject47 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\old_rufusconnect";
var testProject48 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\rufus_connect_ios";
var testProject49 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\rufusconnectandroid";
var testProject50 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\rufuscuffbackgroundservices";
var testProject51 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\rufuscufflauncher";
var testProject52 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\rufuscuffprotocolbuffers";
var testProject53 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\rufuslabsupdateservice";
var testProject54 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\rufuslocation";
var testProject55 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\rufusmms";
var testProject56 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\serviceuser";
var testProject57 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\rufus_labs\\weather-widget";

var targetProjects = [
//	testProject33, // generated
//	testProject34, // not exists alltheapps
//	testProject35, // not exists 
//		
//	testProject36, // not exists 
//	testProject37, // generated
//	testProject38, // not exists
//	testProject39, // generated incomingcallscreen
	testProject40, // integrated-nav-bar
	
//	testProject41, //launcher-3
//	testProject42, //lockscreen
//	testProject43, //musicplayer
//	testProject44,
//	testProject45,
//	testProject46,
//	testProject47,
//	
//	testProject48, 
//	testProject49,
//	testProject50, 
//	testProject51,
//	testProject52,
//	testProject53,
//	testProject54,
//	testProject55,
//	testProject56,
//	testProject57
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

function estimateEffort(xmiModelFileName){
	  //use promise to construct the repo objects
    function predictEffort(projectPath){
        return new Promise((resolve, reject) => {
      	  
      	console.log(projectPath);

      	var command = './Rscript/EffortEstimation.R "eucp_linear_regression_model.rds" "'+projectPath+'/modelEvaluation.csv" "'+projectPath+'" "eucp_effort_prediction"';
			
			console.log("estimation command");
			console.log(command);
			
			RScriptExec.runRScript(command,function(result){
				if (!result) {
//					console.log('exec error: ' + error);
					console.log("project effort estimation error");
					
				} else {
					fs.readFile(projectPath+"/eucp_effort_prediction_result.json", 'utf-8', (err, str) => {
						if (err) throw err;
						   console.log(str);
						   var projectEffort = JSON.parse(str).result;
						   console.log("eucp estimate: "+projectEffort);
                //console.log(modelInfo);
					});
				}
				
				var command2 = './Rscript/EffortEstimation.R "exucp_linear_regression_model.rds" "'+projectPath+'/modelEvaluation.csv" "'+projectPath+'" "exucp_effort_prediction"';
	  			
				RScriptExec.runRScript(command2,function(result){
	  				if (!result) {
//	  					console.log('exec error: ' + error);
	  					console.log("project effort estimation error");
	  					
	  				} else {
	  					fs.readFile(projectPath+"/exucp_effort_prediction_result.json", 'utf-8', (err, str) => {
	  						   if (err) throw err;
	  						   console.log(str);
	  						   
	  						   var projectEffort = JSON.parse(str).result;
	  						   
	  						   console.log("exucp estimate: "+projectEffort);
	                  //console.log(modelInfo);
	  					});
	  				}
	  				
	  				var command3 = './Rscript/EffortEstimation.R "ducp_linear_regression_model.rds" "'+projectPath+'/modelEvaluation.csv" "'+projectPath+'" "ducp_effort_prediction"';
	  			
	  				RScriptExec.runRScript(command3,function(result){
	  				if (!result) {
//	  					console.log('exec error: ' + error);
	  					console.log("project effort estimation error");
	  					
	  				} else {
	  					fs.readFile(projectPath+"/ducp_effort_prediction_result.json", 'utf-8', (err, str) => {
	  						   if (err) throw err;
	  						   console.log(str);
	  						   
	  						   var projectEffort = JSON.parse(str).result;
	  						   
	  						   console.log("ducp estimate: "+projectEffort);
	                  //console.log(modelInfo);
	  					});
	  				}
	  				
	  				resolve();
	          });
	          });
			});
        });
    }
    
	    return Promise.all(targetProjects.map(projectPath=>{
        return predictEffort(projectPath);
    })).then(
        function(){
            return new Promise((resolve, reject) => {
                setTimeout(function(){
              	  console.log("prediction effort finishes");

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
else if(functionSelection === "--estimate-effort"){
	
estimateEffort(repoListPath);

}


