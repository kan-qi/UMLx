var EclipseUtil = require("../EclipseUtil.js");

var testProject1 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\workspace\\experimentExample";
var testProject2 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\carbondata_archive\\carbondata_reduced";
var testProject3 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\carbondata_archive\\carbondata\\core";
var testProject4 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\carbondata_archive\\carbondata\\store";
var testProject5 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\carbondata_archive\\carbondata\\common";
var testProject6 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\carbondata_archive\\carbondata\\datamap";
var testProject7 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\carbondata_archive\\carbondata\\examples";
var testProject8 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\carbondata_archive\\carbondata\\hadoop";
var testProject9 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\workspace\\experimentExample1";
var testProject10 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\workspace\\experimentExample2";

EclipseUtil.generateKDMModel2(testProject3, function(tasks){
	console.log("parsed tasks");
	console.log(tasks);

});


