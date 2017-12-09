/**
 * This module is responsible for analyzing the extract model, by applying certain algorithms, for example, path search, components allocation, degree searching.
 */


(function() {
	/**
	 *  Work as a test stub
	 */
//	var modelXMLParser = require('./model_platforms/ea/XMI2.1Parserv1.1.js');
	var modelExtractor = require('./UMLModelExtractor.js');
//	var diagramProfiler = require('./diagram_profilers/UMLDiagramProfiler.js');
	var mkdirp = require('mkdirp');
	var fs = require('fs');
	//To process second order information, for example, determine duplicate or identify patterns.
//	var useCaseProcessor = require('./diagram_profilers/UseCaseProcessor.js');
//	var domainModelProcessor = require('./diagram_profilers/DomainModelProcessor.js');
//	var domainModelDrawer = require('./diagram_profilers/DomainModelDrawer.js');
	var umlEvaluator = require('./UMLEvaluator.js');
	
	var pathsDrawer = require("./model_drawers/PathsDrawer.js");
	var useCaseDrawer = require("./model_drawers/UseCaseDrawer.js");
	var modelDrawer = require("./model_drawers/ModelDrawer.js");
	var domainModelDrawer = require("./model_drawers/DomainModelDrawer.js");
	
	var debug = require("./utils/DebuggerOutput.js");
	

	function standardiseName(name){
		return name.replace(/\s/g, '').toUpperCase();
	}

	
	function isCycled(path){
		var lastNode = path[path.length-1];
			for(var i=0; i < path.length-1; i++){
				if(path[i] == lastNode){
					return true;
				}
			}
		return false;
	}

	function traverseBehavioralDiagram(diagram){
		console.log("UMLDiagramTraverser: traverseBehaviralDiagram");
		var entries=diagram.Entries;// tag: elements
		
		var toExpandCollection = new Array();
		
		for (var i=0; i < entries.length; i++){
			var entry = entries[i];
			//define the node structure to keep the infor while traversing the graph
			var node = {
				//id: startElement, //ElementGUID
				Node: entry,
				PathToNode: [entry]
			};
			toExpandCollection.push(node);
		}
		
		var Paths = new Array();
		var toExpand;
		while((toExpand = toExpandCollection.pop()) != null){
			var node = toExpand.Node;
			var pathToNode = toExpand.PathToNode;
//			var toExpandID = toExpand.id;
//			var expanded = false;
			// test completeness of the expanded path first to decide if continue to expand
//			var childNodes = diagram.expand(node);
			// if null is returned, then node is an end node.
			
//			diagram.expand = function(node){
			// add condition on actor to prevent stop searching for message [actor, view].
//			if(modelComponents[node.TargetID] && modelComponents[node.TargetID].Type === "boundary"){
//				return;
//			}
//			if(node.outboundNum == 0){
//				return;
//			}
//			else {

				var childNodes = [];
				for(var i in diagram.Edges){
					var edge = diagram.Edges[i];
					if(edge.start == node){
						childNodes.push(edge.end);
					}
				}

//				return children;
//			}
			
//		}
			
			if(!childNodes){
				Paths.push({Nodes: pathToNode});
			}
			else{

				for(var i in childNodes){
					var childNode = childNodes[i];
					var toExpandNode = {
							Node: childNode,
							PathToNode: pathToNode.concat(childNode)
						}

					if(!isCycled(toExpandNode.PathToNode)){
					toExpandCollection.push(toExpandNode);
					}
					else{
					 Paths.push({Nodes: toExpandNode.PathToNode});
					}
				}		
			}
			
			
		}
		
		return Paths;
	}	
	
	function extractModelInfo(umlModelInfo, callbackfunc) {
		mkdirp(umlModelInfo.OutputDir, function(err) {
			// path exists unless there was an error
			if(err) {
				callbackfunc(false);
				console.log(err);
				return;
			}

			modelExtractor.extractModel(umlModelInfo.umlFilePath, function(model){
				console.log("extract model");
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
				 for(var i in domainModel.Diagrams){
						var diagram = domainModel.Diagrams[i];
						diagram.OutputDir = domainModel.OutputDir;
						diagram.AccessDir = domainModel.AccessDir;
				}
				 
				// make extra processing for the domain model diagrams. To reference their elements 
					domainModel.findElement = function(elementName){
						if(!elementName){
							return null;
						}
						console.log("checking class elments");
						console.log(elementName);
						for(var i in this.Diagrams){
							var diagram = this.Diagrams[i];
							for(var j in diagram.Elements){
								var element = diagram.Elements[j];
								console.log("iterating class element");
								console.log(element.Name);
								//apply the rules to convert to standard names, and use the standard ones to compare with each other.
								if(standardiseName(elementName) === standardiseName(element.Name)){
									return element;
								}
							}
						}
					}

				debug.writeJson("modelModel", domainModel);

				domainModelDrawer.drawDomainModel(domainModel, domainModel.OutputDir+"/domainModel.dotty", function(){
					console.log("domain model drawn");
				});
					
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
								
								var useCasePaths = [];
								
								for(var k in useCase.Diagrams){
									var diagram = useCase.Diagrams[k];
									diagram.OutputDir = useCase.OutputDir;
									diagram.AccessDir = useCase.AccessDir;
									
									for(var j in diagram.Nodes){
										var node = diagram.Nodes[j];
										var source = node.source;
										if(source){
										var sourceComponent = model.DomainModel.findElement(source.Name);
										source.component = sourceComponent;
										}
//										console.log("source component");
//										console.log(source);
										var target = node.target;
										if(target){
										var targetComponent = model.DomainModel.findElement(target.Name);
										target.component = targetComponent;
										}
									}
									
									console.log(diagram);
									diagram.Paths = traverseBehavioralDiagram(diagram);
									
								// associate information for the paths.
									
								for(var j in diagram.Paths){
									var path = diagram.Paths[j];
									var pathStr = "";
									var components = [];
									for(var k in path.Nodes)
									{	
										var node = path.Nodes[k];
										
										if(i == 0){
											if(node.source){
											components.push(node.source);
											}
										}
						
										if(node.target){
											components.push(node.target);
										}
										
//										var node = path[i];
//										var elementID = path['Elements'][i];
//										var components = diagram.allocate(node);
//										if(!element){
//											break;
//										}
//										for(var j in components){
//											totalDegree += components[j].InboundNumber;
//											tranLength++;	
//										}
										
										pathStr += node.Name;
										if( i != path.Nodes.length - 1){
											pathStr += "->";
										}
									}
									
									path.PathStr = pathStr;
									path.Components = components;
									
									useCasePaths.push(path);
								}
								
//								useCasePaths = useCasePaths.concat(diagram.Paths);
								}
								

								debug.writeJson("useCase_"+useCase.Name, useCase);
								useCaseDrawer.drawUseCase(useCase, useCase.OutputDir+"/useCase.dotty", function(){
									console.log("use case is drawn");
								});
								
								console.log("use case paths");
								console.log(useCasePaths);
								pathsDrawer.drawPaths(useCasePaths, useCase.OutputDir+"/paths.dotty", function(){
									console.log("use case is drawn");
								});
						}
			
				debug.writeJson("mode", model);
				modelDrawer.drawModel(model, model.OutputDir+"/model.dotty", function(){
					console.log("model is drawn");
				});

				if(callbackfunc){
					callbackfunc(model);
				}

			});


		});
	}

	module.exports = {
			extractModelInfo : extractModelInfo,
			extractModelInfoTest : function(umlModelInfo, func){
				mkdirp(umlModelInfo.OutputDir, function(err) {
					// path exists unless there was an error
					if(err) {
						return console.log(err);
					}
					modelExtractor.extractModels(umlModelInfo.umlFilePath, func);			
				});
			},
	}
}());