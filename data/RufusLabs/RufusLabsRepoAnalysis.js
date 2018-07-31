
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

var rufuslabsProjects = [
//	testProject33,
//	testProject34,
//	testProject35, 
	
//	testProject36, 
//	testProject37, 
//	testProject38, 
//	testProject39, 
//	testProject40,
//	
//	testProject41, 
//	testProject42,
//	testProject43, 
//	testProject44,
//	testProject45,
//	testProject46,
//	testProject47
	
//	testProject48, 
//	testProject49,
//	testProject50, 
//	testProject51,
//	testProject52,
//	testProject53,
	testProject54,
	testProject55,
	testProject56,
	testProject57
	];

var fs = require('fs');
var exec = require('child_process').exec;

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
            var command = 'node UMLxAnalyticToolKit.js "' + inputFile + '" "'+outputFolder+'"';
        	console.log(command);
        	var child = exec(command, function(error, stdout, stderr) {
        		if (error !== null) {
        			console.log('exec error: ' + error);
        		}
        		console.log('The file was saved!');
        		
        		resolve();
        		  
        	});
        	}
      	  });
        	
        });
    }
    
    return Promise.all(rufuslabsProjects.map(projectPath=>{
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

analyseRepo();


