var EclipseUtil = require("../EclipseUtil.js");

var testProject1 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\workspace\\experimentExample";
var testProject2 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\carbondata_archive\\carbondata_reduced";
var testProject3 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\carbondata_archive\\carbondata\\core";
var testProject4 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\carbondata_archive\\carbondata\\store";
var testProject5 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\carbondata_archive\\carbondata\\common";
var testProject6 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\carbondata_archive\\carbondata\\datamap";
var testProject7 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\carbondata_archive\\carbondata\\examples";
var testProject8 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\carbondata_archive\\carbondata\\hadoop";
var testProject9 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\workspace\\experimentExample1";
var testProject10 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\workspace\\experimentExample2";

var testProject11 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\hise";
var testProject12 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\alltheapps";
var testProject13 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\Thunder Fighter 2048";

var testProject14 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\fabric-sdk-java";
var testProject15 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\fluo-yarn";
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

var testProject31 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\carbondata_archive\\carbondata";

var testProject32 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\carbondata_archive\\carbondata";

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




var openSourceProjects = [
//	testProject14, 
//	testProject15, 
//	testProject16, 
//	testProject17, 
//	testProject18, 
//	testProject19, 
//	testProject20,
	
//	testProject21, 
//	testProject22,
//	testProject23, 
//	testProject24,
//	testProject25,
//	testProject26,
//	testProject27
	
	testProject28, 
	testProject29,
	testProject30
	];


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

var deleteFolderRecorsive = function(dir, rmSelf) {
    var files;
    rmSelf = (rmSelf === undefined) ? true : rmSelf;
    dir = dir + "/";
    try { files = fs.readdirSync(dir); } catch (e) { console.log("!Oops, directory not exist."); return; }
    if (files.length > 0) {
        files.forEach(function(x, i) {
            if (fs.statSync(dir + x).isDirectory()) {
            	deleteFolderRecorsive(dir + x);
            } else {
                fs.unlinkSync(dir + x);
            }
        });
    }
    if (rmSelf) {
        // check if user want to delete the directory ir just the files in this directory
        fs.rmdirSync(dir);
    }
}

//var currentWorkSpace = "C:\\Users\\flyqk\\workspace\\.metadata"
//deleteFolderRecorsive(currentWorkSpace);

//for(var i in openSourceProjects){
//	EclipseUtil.generateKDMModel2(openSourceProjects[i], function(tasks){
//		console.log("parsed tasks");
//		console.log(tasks);
//	});
//}

for(var i in rufuslabsProjects){
EclipseUtil.generateKDMModel(rufuslabsProjects[i], function(tasks){
	console.log("parsed tasks");
	console.log(tasks);
});
}

//EclipseUtil.generateKDMModel(testProject32, function(tasks){
//	console.log("parsed tasks");
//	console.log(tasks);
//});


