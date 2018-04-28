
//	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\Repo Analyser\\repoAnalyzer_kdm.xmi";
//	var ModelOutputDir = "C:\Users\flyqk\Documents\Google Drive\ResearchSpace\Research Projects\UMLx\\data\\ReverseEngineering"
//	var ModelOutputDir = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\Repo Analyser";
	
var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	
//	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\workspace\\experimentExample\\experimentExample_kdm.xmi";
	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\workspace\\experimentExample\\experimentExample_kdm_simplified.xmi";
	var ModelOutputDir = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\workspace\\experimentExample";
	
var srcParser = require("./SrcParser.js");
				console.log("hello");

				fs.readFile(filePath, "utf8", function(err, data) {
					parser.parseString(data, function(err, xmiString) {
				srcParser.extractUserSystermInteractionModel(xmiString, ModelOutputDir, ModelOutputDir, function(){
					console.log("finished");
				});
				
					});
				});