/**
 * This module is responsible for extracting models from the xmi files by constructing a hierarchy of the elements in UML models and replacing the UUIDs as references.
 */

(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
    var parser = new xml2js.Parser();
	var eaParser = require('./model_platforms/ea/XMI2.1Parser.js');
	var srcParser = require('./model_platforms/src/SrcParser.js');
	var vpParser = require('./model_platforms/visual_paradigm/XMI2.1Parser.js');
	var pathsDrawer = require("./model_drawers/TransactionsDrawer.js");
	var modelDrawer = require("./model_drawers/UserSystemInteractionModelDrawer.js");
	var domainModelDrawer = require("./model_drawers/DomainModelDrawer.js");
	var mkdirp = require('mkdirp');
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	
	function extractModelInfo(umlModelInfo, callbackfunc) {
//		console.log(umlModelInfo);
		
		var constructModel = function(modelParser, modelString, umlModelInfo, callbackfunc){
			var path = require('path');
			console.log(umlModelInfo.umlFilePath);
			var workDir = path.dirname(umlModelInfo.umlFilePath);
			modelParser.extractUserSystermInteractionModel(modelString, workDir, umlModelInfo.OutputDir, umlModelInfo.AccessDir, function(model){
				console.log("extract model");
				
//				var debug = require("./utils/DebuggerOutput.js");
//				debug.writeJson("extratedModel_"+model._id, model);
				
				if(!model){
					return;
				}
				
				
				// set up the model info properties
				for(var i in model){
					umlModelInfo[i] = model[i];
				}
				
				// set up the domain model
				var domainModel = umlModelInfo.DomainModel;
				
				for(var i in umlModelInfo.UseCases) {
								var useCase = umlModelInfo.UseCases[i];
//								useCase._id = id;
//								var fileName = useCase.Name.replace(/[^A-Za-z0-9_]/gi, "_") + "_"+useCase._id;
								
								useCase.Transactions = traverseUseCaseForTransactions(useCase);
								
								for(var j in useCase.Transactions){
									var transaction = useCase.Transactions[j];
									var TransactionStrByIDs = "";
									for(var k in transaction.Elements){
										var node = transaction.Elements[k];
										TransactionStrByIDs += node._id+"->";
									}
									transaction.TransactionStrByIDs = transaction.TransactionStrByIDs;
								}
								
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
			
//				debug.writeJson("model_"+model._id, umlModelInfo);
				modelDrawer.drawDomainModel(domainModel, domainModel.OutputDir+"/domainModel.dotty", function(){
					console.log("domain model is drawn");
				});

				if(callbackfunc){
					callbackfunc(umlModelInfo);
				}

			});
		}
		
		mkdirp(umlModelInfo.OutputDir, function(err) {
			console.log("create dir");
			if(err) {
				callbackfunc(false);
				console.log(err);
				return;
			}

			fs.readFile(umlModelInfo.umlFilePath, "utf8", function(err, data) {
			
			if(umlModelInfo.umlFilePath.endsWith(".json")){
				var modelJson = JSON.parse(data);
				modelParser = srcParser;
				modelParser.isJSONBased = true;
				constructModel(modelParser, modelJson, umlModelInfo, callbackfunc);
			}
			else {
			
			parser.parseString(data, function(err, xmiString) {
			// determine what type xmi file it is.
			var xmiParser = null;
			if(jp.query(xmiString, '$..["xmi:Extension"][?(@["$"]["extender"]=="Enterprise Architect")]')[0]) {
				xmiParser = eaParser;
			}
			else if(jp.query(xmiString, '$..["xmi:Extension"][?(@["$"]["extender"]=="Visual Paradigm")]')[0]) {
				xmiParser = vpParser;
			}
			else if(jp.query(xmiString, '$..["kdm:Segment"]')[0]){
				xmiParser = srcParser;
			}
			
			if(xmiParser == null){
				if(callbackfunc){
					callbackfunc(false);
				}
				console.log("parser not found");
				return;
			}
			
			constructModel(xmiParser, xmiString, umlModelInfo, callbackfunc);
			
			});
			
			}
			
			
		});
	});
	}
	
	function traverseUseCaseForTransactions(useCase){
		
//		console.log("UMLDiagramTraverser: traverseBehaviralDiagram");
	
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
			
//			var debug = require("./utils/DebuggerOutput.js");
//			debug.writeJson("use_cas_toExpand_"+useCase._id, toExpandCollection);
			
			while((toExpand = toExpandCollection.pop()) != null){
				console.log("path searching...");
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

						if(!isCycled(toExpandNode.PathToNode) && childNode.Group === "System"){
						toExpandCollection.push(toExpandNode);
						}
						else{
						Paths.push({Nodes: toExpandNode.PathToNode, OutScope: toExpandNode.OutScope});
						}
					}		
				}
				
				
			}
			
			//eliminate the duplicates
			var pathsByString = {};
			var uniquePaths = [];
			for(var i in Paths){
				path = Paths[i];
				var pathString = "";
				for(var j in path.Nodes){
					var node = path.Nodes[j];
					pathString += node._id;
				}
//				var key = pathString.replace(/[^\w\s]/gi, '');
				if(!pathsByString[pathString]){
					pathsByString[pathString] = 1;
					uniquePaths.push(path);
				}
				else{
				console.log("duplicate");
				}
			}

			return uniquePaths;
	}

	
	module.exports = {
		extractModelInfo : extractModelInfo,
		extractModelInfoTest : function(umlModelInfo, func){
			mkdirp(umlModelInfo.OutputDir, function(err) {
				// path exists unless there was an error
				if(err) {
					return console.log(err);
				}
			});
		},
	}
}());