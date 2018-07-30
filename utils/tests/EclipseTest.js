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

//for(var i in openSourceProjects){
//	EclipseUtil.generateKDMModel2(openSourceProjects[i], function(tasks){
//		console.log("parsed tasks");
//		console.log(tasks);
//	});
//}

EclipseUtil.generateKDMModel(testProject32, function(tasks){
	console.log("parsed tasks");
	console.log(tasks);
});


