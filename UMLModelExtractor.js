/**
 * This module is responsible for extracting models from the xmi files by constructing a hierarchy of the elements in UML models and replacing the UUIDs as references.
 */

(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var xmiParser = require('./model_platforms/ea/XMI2.1Parser.js');
	var pathsDrawer = require("./model_drawers/TransactionsDrawer.js");
	var modelDrawer = require("./model_drawers/UserSystemInteractionModelDrawer.js");
	var domainModelDrawer = require("./model_drawers/DomainModelDrawer.js");
	var mkdirp = require('mkdirp');
	
	function extractModelInfo(umlModelInfo, callbackfunc) {
		mkdirp(umlModelInfo.OutputDir, function(err) {
			// path exists unless there was an error
			if(err) {
				callbackfunc(false);
				console.log(err);
				return;
			}

			xmiParser.extractUserSystermInteractionModel(umlModelInfo.umlFilePath, function(model){
				console.log("extract model");
				
				var debug = require("./utils/DebuggerOutput.js");
				debug.writeJson("extratedModel", model);
				
				if(!model){
					return;
				}
				
				// set up the model info properties
				for(var i in umlModelInfo){
					model[i] = umlModelInfo[i];
				}
				
				
				// set up the domain model
				var domainModel = model.DomainModel;
//				var domainModel = model.DomainModel;
				domainModel.OutputDir = model.OutputDir+"/domainModel";
				domainModel.AccessDir = model.AccessDir+"/domainModel";
//				domainModel.DotGraphFile = '';
//				domainModel.SvgGraphFile = 'domainModel.svg';
//				console.log("domainModel");
//				console.log(domainModel);
				
				debug.writeJson("modelModel", domainModel);

//				domainModelDrawer.drawDomainModel(domainModel, domainModel.OutputDir+"/domainModel.dotty", function(){
//					console.log("domain model drawn");
//				});
					
				//set up the use cases.
//				console.log("use cases");
//				console.log(useCases);
				for(var i in model.UseCases) {
								var useCase = model.UseCases[i];
//								console.log(useCase);
//								useCase._id = id;
//								var fileName = useCase.Name.replace(/[^A-Za-z0-9_]/gi, "_") + "_"+useCase._id;
								var fileName = useCase._id;
								useCase.OutputDir = model.OutputDir+"/"+fileName;
								useCase.AccessDir = model.AccessDir+"/"+fileName;
								
								useCase.Paths = traverseUseCaseForPaths(useCase);
								
								debug.writeJson("useCase_"+useCase.Name, useCase);
								
								modelDrawer.drawPrecedenceDiagram(useCase, domainModel, useCase.OutputDir+"/useCase.dotty", function(){

									console.log("use case is drawn");
								});
								modelDrawer.drawSimplePrecedenceDiagram(useCase, domainModel, useCase.OutputDir+"/useCase_simple.dotty", function(){

									console.log("simple use case is drawn");
								});
								pathsDrawer.drawPaths(useCase.Paths, useCase.OutputDir+"/paths.dotty", function(){
									console.log("paths are drawn");
								});
								
//								useCaseDrawer.drawUseCase(useCase, useCase.OutputDir+"/useCase.dotty", function(){
//									console.log("use case is drawn");
//								});
								
//								pathsDrawer.drawPaths(useCasePaths, useCase.OutputDir+"/paths.dotty", function(){
//									console.log("use case is drawn");
//								});
						}
			
				debug.writeJson("model", model);
//				modelDrawer.drawModel(model, model.OutputDir+"/model.dotty", function(){
//					console.log("model is drawn");
//				});

				if(callbackfunc){
					callbackfunc(model);
				}

			});


		});
	}
	
	function traverseUseCaseForPaths(useCase){
		
		console.log("UMLDiagramTraverser: traverseBehaviralDiagram");
		

		function isCycled(path){
			var lastNode = path[path.length-1];
				for(var i=0; i < path.length-1; i++){
					if(path[i] == lastNode){
						return true;
					}
				}
			return false;
		}

			var toExpandCollection = new Array();
			
			for (var j in useCase.Activities){
				var activity = useCase.Activities[j];
				//define the node structure to keep the infor while traversing the graph
				if(activity.Stimulus){
				var node = {
					//id: startElement, //ElementGUID
					Node: activity,
					PathToNode: [activity],
					OutScope: activity.OutScope
				};
				toExpandCollection.push(node);
				}
			}
			
			var Paths = new Array();
			var toExpand;
			while((toExpand = toExpandCollection.pop()) != null){
				var node = toExpand.Node;
				var pathToNode = toExpand.PathToNode;

					var childNodes = [];
					for(var j in useCase.PrecedenceRelations){
						var edge = useCase.PrecedenceRelations[j];
						if(edge.start == node){
							childNodes.push(edge.end);
						}
					}
				
				if(childNodes.length == 0){
					Paths.push({Nodes: pathToNode, OutScope: toExpand.OutScope});
				}
				else{
					for(var j in childNodes){
						var childNode = childNodes[j];
						if(!childNode){
							continue;
						}
						
						//if childNode is an outside activity
						
						var OutScope = false;
						if(toExpand.OutScope||childNode.OutScope){
							OutScope = true;
						}
						
						var toExpandNode = {
							Node: childNode,
							PathToNode: pathToNode.concat(childNode),
							OutScope: OutScope
						}
						
						console.log("toExpandNode");
						console.log(toExpandNode);
						
						console.log("child node");
						console.log(childNodes);
						console.log(childNode);
						console.log(childNode.Name);
						console.log(childNode.Group);

						if(!isCycled(toExpandNode.PathToNode) && childNode.Group === "System"){
						toExpandCollection.push(toExpandNode);
						}
						else{
						Paths.push({Nodes: toExpandNode.PathToNode, OutScope: toExpandNode.OutScope});
						}
					}		
				}
				
				
			}
			
//			console.log(Paths);
//			useCase.Paths = Paths;
			
			return Paths;
			
	}

	
	module.exports = {
		extractModelInfo : extractModelInfo,
		extractModelInfoTest : function(umlModelInfo, func){
			mkdirp(umlModelInfo.OutputDir, function(err) {
				// path exists unless there was an error
				if(err) {
					return console.log(err);
				}
//				modelExtractor.extractModels(umlModelInfo.umlFilePath, func);			
			});
		},
	}
}());