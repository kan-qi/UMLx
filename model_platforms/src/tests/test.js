
//	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\Repo Analyser\\repoAnalyzer_kdm.xmi";
//	var ModelOutputDir = "C:\Users\flyqk\Documents\Google Drive\ResearchSpace\Research Projects\UMLx\\data\\ReverseEngineering"
//	var ModelOutputDir = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\Repo Analyser";

var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();

//	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\workspace\\experimentExample\\experimentExample_kdm.xmi";
//	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\workspace\\experimentExample\\experimentExample_kdm_simplified.xmi";
//	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\model_platforms\\src\\tests\\repoAnalyzer_kdm.xmi";
//	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\carbondata_archive\\carbondata\\CarbonData_java.xmi";
//	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\fabric-sdk-java\\fabric-sdk-java_kdm.xmi";
//	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\alltheapps\\alltheapps_kdm.xmi";
//	var ModelOutputDir = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\CaseStudies\\workspace\\experimentExample";
	var ModelOutputDir = "./model_platforms/src/simplified";
//	var ModelOutputDir = "./model_platforms/src/carbonData";
//	var ModelOutputDir = "./model_platforms/src/repoAnalyzer";
//	var ModelOutputDir = "./model_platforms/src/alltheapps";

//	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\model_platforms\\src\\tests\\repoAnalyzer_kdm.xmi";
//	var filePath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\model_platforms\\src\\tests\\experimentExample_kdm.xmi";
	// var filePath = ".\\model_platforms\\src\\tests\\experimentExample_kdm_simplified.xmi";
	var filePath = "./model_platforms/src/tests/experimentExample_kdm_simplified.xmi"
<<<<<<< HEAD
		
		var modelDrawer = require("../../../model_drawers/UserSystemInteractionModelDrawer.js");
=======
>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9

var srcParser = require("../SrcParser.js");
				console.log("hello");

				fs.readFile(filePath, "utf8", function(err, data) {
					parser.parseString(data, function(err, xmiString) {
<<<<<<< HEAD
				srcParser.extractUserSystermInteractionModel(xmiString, ModelOutputDir, ModelOutputDir, function(Model){
					
					for(var i in Model.UseCases){
						var useCase = Model.UseCases[i];
						modelDrawer.drawPrecedenceDiagram(useCase, Model.DomainModel, ModelOutputDir+"/useCase_experiment.dotty", function(){
						console.log("use case is drawn");
					});
					}
					
=======
				srcParser.extractUserSystermInteractionModel(xmiString, ModelOutputDir, ModelOutputDir, function(){
>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9
					console.log("finished");
				});

					});
				});
