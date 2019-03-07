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
		var constructModel = null;
        if(umlModelInfo.apkFile){
        	
        	constructModel = function(modelParser, modelString, umlModelInfo, callbackfunc){
                console.l("apk file found => go to UMLxAndroidAnalyzer.js");
    			var workDir = path.dirname(umlModelInfo.umlFilePath);
                modelParser.analyseAPKGator(
//                    uploadedFile.path, 
                		umlModelInfo.umlFilePath, workDir, umlModelInfo.OutputDir,
                    (result) => {
                        if (result != true) {
                        	console.l("Android APK Analysis failed");
                        	if(callbackfunc){
                        		callbackfunc(false);
                        	}
                        }
                        else {
                        	console.l("Android APK Analysis succeed");
                        	if(callbackfunc){
                        		callbackfunc(result);
                        	}
                        }
//                        process.send('ok');
                        
                    }
                );
                //process.send('ok');
        	}
		
        }
        else{
        	constructModel  = function(modelParser, modelString, umlModelInfo, callbackfunc){
    			var path = require('path');
    			var workDir = path.dirname(umlModelInfo.umlFilePath);
    			modelParser.extractUserSystermInteractionModel(modelString, workDir, umlModelInfo.OutputDir, umlModelInfo.AccessDir, function(model){
    				
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
    								
    								modelDrawer.drawUSIMDiagram(useCase, domainModel, useCase.OutputDir+"/usim.dotty", function(){

    									console.log("use case is drawn");
    								});
    								modelDrawer.drawTransactionsDiagram(useCase, domainModel, useCase.OutputDir+"/transactions.dotty", function(){

    									console.log("simple use case is drawn");
    								});
    								
    								pathsDrawer.drawPaths(useCase.Paths, useCase.OutputDir+"/paths.dotty", function(){
    									console.log("paths are drawn");
    								});
    				}
    			
    				modelDrawer.drawDomainModel(domainModel, domainModel.OutputDir+"/domainModel.dotty", function(){
    					console.log("domain model is drawn");
    				});

    				if(callbackfunc){
    					callbackfunc(umlModelInfo);
    				}

    			}, umlModelInfo);
    		}
        }
		mkdirp(umlModelInfo.OutputDir, function(err) {

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
			else if(umlModelInfo.umlFilePath.endsWith(".apk")){
				umlModelInfo.apkFile = true;
				constructModel(androidAnalyzer, null, umlModelInfo, callbackfunc);
			}
			else {
			console.log("xml parser");
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
	
//	function traverseUseCaseForTransactions(useCase){
//		
////		console.log("UMLDiagramTraverser: traverseBehaviralDiagram");
//	
//		function isCycled(path){
//			var lastNode = path[path.length-1];
//				for(var i=0; i < path.length-1; i++){
//					if(path[i] == lastNode){
//						return true;
//					}
//				}
//			return false;
//		}
//
//			var toExpandCollection = new Array();
//			
//			for (var j in useCase.Activities){
//				var activity = useCase.Activities[j];
//				//define the node structure to keep the infor while traversing the graph
//				if(activity.Stimulus){
//				var node = {
//					//id: startElement, //ElementGUID
//					Node: activity,
//					PathToNode: [activity],
//					OutScope: activity.OutScope
//				};
//				toExpandCollection.push(node);
//				}
//			}
//			
//			var Paths = new Array();
//			var toExpand;
//			
//			while((toExpand = toExpandCollection.pop()) != null){
//				console.log("path searching...");
//				var node = toExpand.Node;
//				var pathToNode = toExpand.PathToNode;
//
//					var childNodes = [];
//					for(var j in useCase.PrecedenceRelations){
//						var edge = useCase.PrecedenceRelations[j];
//						if(edge.start == node){
//							childNodes.push(edge.end);
//						}
//					}
//				
//				if(childNodes.length == 0){
//					Paths.push({Nodes: pathToNode, OutScope: toExpand.OutScope});
//				}
//				else{
//					for(var j in childNodes){
//						var childNode = childNodes[j];
//						if(!childNode){
//							continue;
//						}
//						
//						var OutScope = false;
//						if(toExpand.OutScope||childNode.OutScope){
//							OutScope = true;
//						}
//						
//						var toExpandNode = {
//							Node: childNode,
//							PathToNode: pathToNode.concat(childNode),
//							OutScope: OutScope
//						}
//
//						if(!isCycled(toExpandNode.PathToNode) && childNode.Group === "System"){
//						toExpandCollection.push(toExpandNode);
//						}
//						else{
//						Paths.push({Nodes: toExpandNode.PathToNode, OutScope: toExpandNode.OutScope});
//						}
//					}		
//				}
//				
//				
//			}
//			
//			//eliminate the duplicates
//			var pathsByString = {};
//			var uniquePaths = [];
//			for(var i in Paths){
//				path = Paths[i];
//				var pathString = "";
//				for(var j in path.Nodes){
//					var node = path.Nodes[j];
//					pathString += node._id;
//				}
//				if(!pathsByString[pathString]){
//					pathsByString[pathString] = 1;
//					uniquePaths.push(path);
//				}
//				else{
//				console.log("duplicate");
//				}
//			}
//
//			return uniquePaths;
//	}

	
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