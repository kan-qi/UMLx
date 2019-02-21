(function() {

	  //use promise to construct the repo objects
    function analyseProject(projectXMI, clusterFile, stimulusFile, logFile, projectName, path, useCaseRec, reportDir, callback){
      
        if(!projectName){
        		projectName = ""
        }
        	
   		 let date = new Date();
   	     let analysisDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
   	     analysisDate = analysisDate+"@"+Date.now();
   	   
   	     projectName = projectName + "_"+analysisDate;
        	
        	var outputDir = reportDir +"\\"+projectName+"_analysis";
        	global.debugOutputDir = outputDir + "/debug";
        	var inputFile = projectXMI;
        	
        	console.log(inputFile);
        	
        	mkdirp(outputDir, function(err) { 
        	fs.exists(inputFile, (exists) => {
        	if(!exists){
        		console.log(inputFile+" doesn't exist.");
        		if(callback){
        			callback(false);
        		}
        	}
        	else{
            //to generate svg file.
        	UMLxAnalyticToolKit.analyseSrc(inputFile, outputDir, projectName, function(model){
        		if(!model){
        			console.log('analysis error!');
            		return;
        		}
        		console.log("finished sr analysis");
        		FileManagerUtil.appendFile(reportPath, model.OutputDir+"\n", function(message){
            		console.log('analysis finished!');
            		console.log(message);
            		
            		if(callback){
            			callback(model);
            		}
        		})
        		  
        	}, {clusterFile: clusterFile, stimulusFile: stimulusFile, logFile: logFile, path: path, useCaseRec: useCaseRec});
        	
        	}
      	  });
        });
    }
	
	module.exports = {
			analyseAPKGator: function(apkFilePath, callback){
				//our gator analyzer is currently called by the following command.
				
				//./gator a -p /mnt/d/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/demo-release-unsigned.apk -client GUIHierarchyPrinterClient
			
				// we need to find a way to call the command from nodejs.
				
				// example of doing similar things are in ./utils/EclipseUtil.js, for example, line 13, using "exec"
			}
			
	}
}())