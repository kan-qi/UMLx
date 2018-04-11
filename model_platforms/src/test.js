
//	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\Repo Analyser\\repoAnalyzer_kdm.xmi";
//	var ModelOutputDir = "C:\Users\flyqk\Documents\Google Drive\ResearchSpace\Research Projects\UMLx\\data\\ReverseEngineering"
//	var ModelOutputDir = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\Repo Analyser";
	
	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\workspace\\experimentExample\\experimentExample_kdm.xmi";
	var ModelOutputDir = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\workspace\\experimentExample";
	
var parser = require("./SrcParser.js");
				console.log("hello");
				parser.extractUserSystermInteractionModel(filePath, ModelOutputDir, ModelOutputDir, function(){
					console.log("finished");
				});
				
				