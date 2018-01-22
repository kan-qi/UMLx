/**
 * This module is responsible for extracting models from the xmi files by constructing a hierarchy of the elements in UML models and replacing the UUIDs as references.
 */

(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var xmiParser = require('./model_platforms/ea/XMI2.1Parser.js');
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
//								useCaseDrawer.drawUseCase(useCase, useCase.OutputDir+"/useCase.dotty", function(){
//									console.log("use case is drawn");
//								});
								
								console.log("use case paths");
								console.log(useCasePaths);
//								pathsDrawer.drawPaths(useCasePaths, useCase.OutputDir+"/paths.dotty", function(){
//									console.log("use case is drawn");
//								});
						}
			
				debug.writeJson("mode", model);
//				modelDrawer.drawModel(model, model.OutputDir+"/model.dotty", function(){
//					console.log("model is drawn");
//				});

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
//				modelExtractor.extractModels(umlModelInfo.umlFilePath, func);			
			});
		},
	}
}());