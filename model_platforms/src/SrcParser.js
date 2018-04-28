/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 * 
 * This script relies on KDM and Java model 
 * 
 * The goal is the establish the control flow between the modules...
 * Identify the stimuli.
 * Identify the boundary.
 * Identify the sytem components.....
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	var callGraphConstructor = require("./CallGraphConstructor.js");

//	var xpath = require('xpath');
//	var dom = require('xmldom').DOMParser;
	
	var xmiSring = "";
	
	function extractUserSystermInteractionModel(xmiString, ModelOutputDir, ModelAccessDir, callbackfunc) {
//		fs.readFile(filePath, "utf8", function(err, data) {
//			console.log("file content");
//			console.log(data);
//			parser.parseString(data, function(err, result) {
				
				var Model = {
						Actors:[],
						Roles:[],
						UseCases: [],
						DomainModel: {
							Elements: [],
							Usages: [],
							Realization:[],
							Assoc: [],
							OutputDir : ModelOutputDir+"/domainModel",
							AccessDir : ModelAccessDir+"/domainModel",
							DiagramType : "class_diagram",
		                    InheritanceStats: null
						}
				};
				
//				xmiString = result;
				graph = constructCallGraph(xmiString);
				console.log("graphs");
				console.log(graph);
				
				function findNextActivities(currentActivity, activities){
					var nextActivities = [];
					for(var i in activities){
						var activity = activities[i];
						if(currentActivity.end == activity.start){
							nextActivities.push(activity);
						}
					}
					return nextActivities;
				}
				
				var UseCase = {
						_id: "src",
						Name: "src",
						PrecedenceRelations : [],
						Activities : [],
						OutputDir : ModelOutputDir+"/src",
						AccessDir : ModelAccessDir+"/src",
						DiagramType : "none"
//						Attachment: XMIUseCase
				}
				
			
				Model.UseCases.push(UseCase);
				
//				return Model;
				
//				
				if(callbackfunc){
					callbackfunc(Model);
				}
				
//			});
//		});
	}
	
//	function drawKDMDiagram(useCase, edges, nodes){
//		var path = useCase.OutputDir+"/"+"kdm_diagram.dotty"
//		useCase.DiagramType = "kdm_diagram";
//		drawReferences(edges, nodes, path);
//		
//	}
	
//	function drawCallGraph(controlElements){
//		
//	}
	
	module.exports = {
			extractUserSystermInteractionModel : extractUserSystermInteractionModel,
	}
}());
