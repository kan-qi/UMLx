
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

var openSourceProjects = [
	testProject12, 
	testProject13, 
	
	testProject14, 
	testProject15, 
	testProject16, 
	testProject17, 
	testProject18, 
	testProject19, 
	testProject20,
	
	testProject21, 
	testProject22,
	testProject23, 
	testProject24,
	testProject25,
	testProject26,
	testProject27
	
	testProject28, 
	testProject29,
	testProject30,
	testProject31, 
	testProject32,
	testProject33,
	testProject34
	];

var fs = require('fs');
var exec = require('child_process').exec;

var UMLxAnalyticToolKit = require("../../utils/UMLxAnalyticToolKitCore.js");

function analyseRepo(){
	
	  //use promise to construct the repo objects
    function analyseProject(projectPath){
        return new Promise((resolve, reject) => {
        		
        	var outputFolder = projectPath;
        	var inputFile = projectPath + "/eclipse_gen_umlx_kdm.xmi";
        	
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
    
    return Promise.all(openSourceProjects.map(projectPath=>{
        return analyseProject(projectPath);
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

//function analyseRepo(){
//	
//	  //use promise to construct the repo objects
//  function analyseProject(projectPath){
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
//  return Promise.all(openSourceProjects.map(projectPath=>{
//      return analyseProject(projectPath);
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

analyseRepo();


