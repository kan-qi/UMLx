/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 *
 * This script relies on KDM and Java model
 *
 * The goal is the establish the control flow between the modules:
 * Identify the boundary (via KDM).
 * Identify the system components.
 * Establish the control flow between the components
 * Identify the stimuli.
 * 
 * /*
	 * There are three layers:
	 * codeElement-code:ClassUnit
	 * 		-source
	 * 			- region
	 * 		-codeRelation-code:Imports
	 *		-codeElement-code:StorableUnit
	 *      -codeElement-code:MethodUnit
	 *        -source
	 *        -codeElement-code:signature
	 *        	-parameterUnit
	 *        -codeElement-action:BlockUnit
	 *          -codeElement-action:ActionElement
	 *            -codeElement-action:ActionElement
	 *            -actionRelation-action:Address
	 *            -actionRelation-action:Reads
	 *            -actionRelation-action:Calls
	 *            -actionRelation-action:Creates
	 *            -codeElement-code:ClassUnit
	 *      -codeElement-code:InterfaceUnit
	 *           -codeRelation-code:Imports
	 *           -codeRelation-code:MethodUnit
	 *      -codeElement-code:ClassUnit
	 *           
	 * The function is recursively designed to take care of the structure.
	 *           
 */

(function () {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	var uuidV1 = require('uuid/v1');
	var kdmModelUtils = require("./KDMModelUtils.js");
	var kdmModelDrawer = require("./KDMModelDrawer.js");
	var FileManagerUtils = require("../../utils/FileManagerUtils.js");

//	var dicClassUnits = {};
//	var dicMethodUnits = {};
//	var dicCompositeClasses = {};
//	var dicClassComposite = {}; // {subclass.UUID, compositeClassUnit.UUID}
//	var dicCompositeSubclasses = {}; // {compositeClassUnit.UUID, [subclass.UUID]}
//	var dicMethodClass = {};	 // {method.UUID, class.UUID}
//	var dicActionElementMethod = {};

	function analyseCode(jsonString, outputDir) {
		
//		var androidAnalysisResults = FileManagerUtils.readJSONSync("H:\\ResearchSpace\\ResearchProjects\\UMLx\\facility-tools\\GATOR_Tool\\gator-3.5\\output\\android-analysis-output.json");

		var androidAnalysisResults = jsonString;
		
		var referencedClassUnits = androidAnalysisResults.classUnits;
		
		var dicClassUnits = {};
		var dicMethodUnits = {};
		var dicMethodClass = {};
		var dicMethodParameters = {};
		var methodUnitsByName = {};
		
		for(var i in referencedClassUnits){
			console.log("iterate class");
			var referencedClassUnit = referencedClassUnits[i];
			
			console.log(referencedClassUnits[i].UUID);
			
			//process the name
			var packageName = referencedClassUnit.name.substring(0, referencedClassUnit.name.lastIndexOf('.'));
			var className = referencedClassUnit.name.substring(referencedClassUnit.name.lastIndexOf('.')+1, referencedClassUnit.name.length);
			
			referencedClassUnit.name = className;
			referencedClassUnit.packageName = packageName;
			
			dicClassUnits[referencedClassUnit.UUID] = referencedClassUnit;
			
			for(var j in referencedClassUnit.methodUnits){
				var referencedMethodUnit = referencedClassUnit.methodUnits[j];
				dicMethodUnits[referencedMethodUnit.UUID] = {
						UUID: referencedMethodUnit.UUID,
						signature:{
							name:referencedMethodUnit.name,
							parameterUnits:referencedMethodUnit.parameterUnits
						}
				}
				
				methodUnitsByName[referencedClassUnit.name+":"+referencedMethodUnit.name] = referencedMethodUnit;
				
				
				dicMethodClass[referencedMethodUnit.UUID] = referencedClassUnit.UUID;
				
				for(var k in referencedMethodUnit.parameterTypes){
					var referencedParameter = referencedMethodUnit.parameterTypes[k];
					if(!dicMethodParameters[referencedMethodUnit.UUID]){
						dicMethodParameters[referencedMethodUnit.UUID] = [];
					}
					console.log(dicMethodParameters[referencedMethodUnit.UUID]);
					dicMethodParameters[referencedMethodUnit.UUID].push({type: referencedParameter});
				}
			}
			
			referencedClassUnit.StorableUnits = [];
			
			for(var j in referencedClassUnit.attrUnits){
				var referencedAttrUnit = referencedClassUnit.attrUnits[j];
				referencedClassUnit.StorableUnits.push({
						name:referencedAttrUnit.name,
						type:referencedAttrUnit.type,
						UUID:referencedAttrUnit.UUID
				})
				
			}
		}
		
		var dicCompositeSubclasses = {};
		var dicClassComposite = {};
		var referencedCompositeClassUnits = androidAnalysisResults.compositeClassUnits;
		var dicCompositeClassUnits = {};
		
		for(var i in referencedCompositeClassUnits){
			var referencedCompositeClassUnit = referencedCompositeClassUnits[i];
			
			//process the name
			var packageName = referencedCompositeClassUnit.name.substring(0, referencedCompositeClassUnit.name.lastIndexOf('.'));
			var className = referencedCompositeClassUnit.name.substring(referencedCompositeClassUnit.name.lastIndexOf('.')+1, referencedCompositeClassUnit.name.length);
			
			referencedCompositeClassUnit.name = className;
			referencedCompositeClassUnit.packageName = packageName;
			
			for(var j in referencedCompositeClassUnit.classUnits){
				var subClassUnit = referencedCompositeClassUnit.classUnits[j];
				if(!dicCompositeSubclasses[referencedCompositeClassUnit.UUID]){
					dicCompositeSubclasses[referencedCompositeClassUnit.UUID] = [];
				}
				dicCompositeSubclasses[referencedCompositeClassUnit.UUID].push(subClassUnit);
				dicClassComposite[subClassUnit] = referencedCompositeClassUnit.UUID;
				dicCompositeClassUnits[referencedCompositeClassUnit.UUID] = referencedCompositeClassUnit;
			}
		}
		
		//construct access graph
		var accessGraph = {
			nodes: [],
			edges: [],
			nodesComposite: [],
			edgesComposite: []
		}
		
		for(var i in androidAnalysisResults.accessGraph.edges){
			var edge = androidAnalysisResults.accessGraph.edges[i];
			
			var accessMethodUnit = dicMethodUnits[edge.start.methodUnit];
			var accessClassUnit = dicClassUnits[edge.start.classUnit];
			var accessCompositeClassUnit = dicCompositeClassUnits[dicClassComposite[edge.start.classUnit]];
			
			if(!accessMethodUnit || ! accessClassUnit){
				continue;
			}
			
			var accessNode = {
					name: accessClassUnit.name+":"+accessMethodUnit.signature.name,
					component:accessClassUnit,
					UUID: accessMethodUnit.UUID,
					methodName: accessMethodUnit.signature.name
			}
			accessGraph.nodes.push(accessNode);
			var accessCompositeNode = {
					name: accessCompositeClassUnit.name+":"+accessMethodUnit.signature.name,
					component:accessCompositeClassUnit,
					UUID: accessMethodUnit.UUID,
					methodName: accessMethodUnit.signature.name
			}
			accessGraph.nodesComposite.push(accessCompositeNode);
			
			var accessedAttrUnit = edge.end.attrUnit;
			var accessedClassUnit = dicClassUnits[edge.end.classUnit];
			var accessedCompositeClassUnit = dicCompositeClassUnits[dicClassComposite[edge.end.classUnit]];
			
			if(!accessedAttrUnit || !accessedClassUnit || !accessedCompositeClassUnit){
				continue;
			}
			
			var accessedNode = {
					name: accessedClassUnit.name+":"+accessedAttrUnit.name,
					component:accessedClassUnit,
					UUID: accessedAttrUnit.UUID,
					attrName: accessedAttrUnit.name,
					attrType: accessedAttrUnit.type
			}
			
			accessGraph.nodes.push(accessedNode);
			
			var accessedCompositeNode = {
					name: accessedCompositeClassUnit.name+":"+accessedAttrUnit.name,
					component:accessedCompositeClassUnit,
					UUID: accessedAttrUnit.UUID,
					attrName: accessedAttrUnit.name,
					attrType: accessedAttrUnit.type
			}
			
			accessGraph.nodesComposite.push(accessedCompositeNode);
			
			accessGraph.edges.push({start:accessNode, end:accessedNode});
			accessGraph.edgesComposite.push({start:accessCompositeNode, end:accessedCompositeNode});
			
		}
		
		
		var callGraph = {
				nodes: [],
				edges: [],
				nodesComposite: [],
				edgesComposite: []
			}
			
			for(var i in androidAnalysisResults.callGraph.edges){
				var edge = androidAnalysisResults.callGraph.edges[i];
				var callMethodUnit = dicMethodUnits[edge.start.methodUnit];
				var callClassUnit = dicClassUnits[edge.start.classUnit];
				var callCompositeClassUnit = dicCompositeClassUnits[dicClassComposite[edge.start.classUnit]];
				
				if(!callMethodUnit || !callClassUnit || !callCompositeClassUnit){
					continue;
				}
				
				var callNode = {
						name: callClassUnit.name+":"+callMethodUnit.signature.name,
						component:callClassUnit,
						UUID: callMethodUnit.UUID,
						methodName: callMethodUnit.signature.name
				}
				callGraph.nodes.push(callNode);
				var callCompositeNode = {
						name: callCompositeClassUnit.name+":"+callMethodUnit.signature.name,
						component:callCompositeClassUnit,
						UUID: callMethodUnit.UUID,
						methodName: callMethodUnit.signature.name
				}
				callGraph.nodesComposite.push(callNode);
				
				var calleeMethodUnit = dicMethodUnits[edge.end.methodUnit];
				var calleeClassUnit = dicClassUnits[edge.end.classUnit];
				var calleeCompositeClassUnit = dicCompositeClassUnits[dicClassComposite[edge.end.classUnit]];
				var calleeNode = {
						name: calleeClassUnit.name+":"+calleeMethodUnit.signature.name,
						component:calleeClassUnit,
						UUID: calleeMethodUnit.UUID,
						methodName: calleeMethodUnit.signature.name
				}
				
				callGraph.nodes.push(calleeNode);
				
				var calleeCompositeNode = {
						name: calleeCompositeClassUnit.name+":"+calleeMethodUnit.signature.name,
						component:calleeCompositeClassUnit,
						UUID: calleeMethodUnit.UUID,
						methodName: calleeMethodUnit.signature.name
				}
				
				callGraph.nodesComposite.push(calleeNode);
				
				callGraph.edges.push({start:callNode, end:calleeNode});
				callGraph.edgesComposite.push({start:callCompositeNode, end:calleeCompositeNode});
				
			}
		
//		var accessGraph = androidAnalysisResults.accessGraph;
		
//		var typeDependencyGraph = constructTypeDependencyGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);		
//		var extendsGraph = constructExtendsGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
//		var compositionGraph = constructCompositionGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);

		var debug = require("../../utils/DebuggerOutput.js");

		var result = {
			dicClassUnits: dicClassUnits,
			dicCompositeClassUnits: dicCompositeClassUnits,
			dicClassComposite: dicClassComposite,
			dicMethodUnits: dicMethodUnits,
			dicMethodClass: dicMethodClass,
			callGraph: callGraph,
			accessGraph: accessGraph,
			extendsGraph: convertExtensionDependencyGraph(androidAnalysisResults, dicClassUnits, dicClassComposite, dicCompositeClassUnits),
//			compositionGraph: compositionGraph,
			typeDependencyGraph: convertTypeDependencyGraph(androidAnalysisResults, dicClassUnits, dicClassComposite, dicCompositeClassUnits, methodUnitsByName),
			referencedClassUnits: referencedClassUnits,
			referencedCompositeClassUnits: referencedCompositeClassUnits,
			dicCompositeSubclasses: dicCompositeSubclasses,
			dicMethodParameters: dicMethodParameters
		};
		
		
		debug.writeJson2("converted-android-analysis-results-dicClassUnits", dicClassUnits);
		debug.writeJson2("converted-android-analysis-results-dicMethodUnits", dicMethodUnits);
		debug.writeJson2("converted-android-analysis-results-extension-graph", result.extendsGraph);
		debug.writeJson2("converted-android-analysis-results-typeDependencyGraph", result.typeDependencyGraph);
		
		return result;
	}
	
	function convertExtensionDependencyGraph(androidAnalysisResults, dicClassUnits, dicClassComposite, dicCompositeClassUnits){
		//construct access graph
		var typeDependencyGraph = {
			nodes: [],
			edges: [],
			nodesComposite: [],
			edgesComposite: []
		};
		
		var dicNodes = {};
		var dicNodesComposite = {};
		
		for(var i in androidAnalysisResults.extendsGraph){
			var edge = androidAnalysisResults.extendsGraph[i];
			var fromClass = dicClassUnits[edge.from.UUID];
			var toClass = dicClassUnits[edge.to.UUID];
			
			if(!fromClass || !toClass){
				continue;
			}
			
			var fromNode = {
					name: fromClass.name,
					UUID: fromClass.UUID,
					component: fromClass
			}
			
			var toNode = {
					name: toClass.name,
					UUID: toClass.UUID,
					component: toClass
			}
			
			
			if(!dicNodes[fromNode.UUID]){
				typeDependencyGraph.nodes.push(fromNode);
				dicNodes[fromNode.UUID] = 1;
			}
			
			if(!dicNodes[toNode.UUID]){
				typeDependencyGraph.nodes.push(toNode);
				dicNodes[toNode.UUID] = 1;
			}
			
			typeDependencyGraph.edges.push({start: fromNode, end: toNode});
			
			var fromCompositeClassUnit = dicCompositeClassUnits[dicClassComposite[fromNode.UUID]];
			var toCompositeClassUnit = dicCompositeClassUnits[dicClassComposite[toNode.UUID]];
			
			var fromNodeComposite = {
					name: fromCompositeClassUnit.name,
					UUID: fromCompositeClassUnit.UUID,
					component: fromCompositeClassUnit
			}
			
			var toNodeComposite = {
					name: toCompositeClassUnit.name,
					UUID: toCompositeClassUnit.UUID,
					component: toCompositeClassUnit
			}
			
			if(!dicNodes[fromNodeComposite.UUID]){
				typeDependencyGraph.nodesComposite.push(fromNodeComposite);
				dicNodesComposite[fromNodeComposite.UUID] = 1;
			}
			
			if(!dicNodes[toNodeComposite.UUID]){
				typeDependencyGraph.nodesComposite.push(toNodeComposite);
				dicNodesComposite[toNodeComposite.UUID] = 1;
			}
			
			typeDependencyGraph.edgesComposite.push({start: fromNodeComposite, end: toNodeComposite});
			
		}
		
		return typeDependencyGraph;
	}
	
	function convertTypeDependencyGraph(androidAnalysisResults, dicClassUnits, dicClassComposite, dicCompositeClassUnits, methodUnitsByName){
		//construct access graph
		var typeDependencyGraph = {
			nodesAttr: [],
			edgesAttr: [],
			nodesP: [],
			edgesP: [],
			nodesPara: [],
			edgesPara: [],
			nodesAttrComposite: [],
			edgesAttrComposite: [],
			nodesPComposite: [],
			edgesPComposite: []
		};
		
		var nodesAttrByID = {};
		var edgesAttrByID = {};
		
		var nodesPByID = {};
		var edgesPByID  = {};
		
		var nodesParaByID = {};
		var edgesParaByID = {};
		
		var nodesAttrCompositeByID = {};
		var edgesAttrCompositeByID = {};
		
		var nodesPCompositeByID = {};
		var edgesPCompositeByID = {};
	
		for(var i in androidAnalysisResults.typeDependencyGraph.nodes){
			var node = androidAnalysisResults.typeDependencyGraph.nodes[i];
			var dependencies = node.dependencies;
			var classUnit = dicClassUnits[node.uuid];
			if(!classUnit){
				continue;
			}
			console.log("class unit");
			console.log(node.uuid);
			console.log(dicClassUnits);
			var compositeClassUnit = dicCompositeClassUnits[dicClassComposite[classUnit.UUID]];
			for(var j in dependencies){
				var dependency = dependencies[j];
				console.log()
				console.log(dependency["uuid"]);
				var targetClassUnit = dicClassUnits[dependency["uuid"]];
				var targetCompositeClassUnit = dicCompositeClassUnits[dicClassComposite[targetClassUnit.UUID]];
				
				var returnDependencies = dependency.returnDependencies;
				for(var k in returnDependencies){
					var returnDependency = returnDependencies[k];
					var methodUnit = methodUnitsByName[classUnit.name+":"+returnDependency];
					
					if(methodUnit){
					var startNode = nodesParaByID[classUnit.name+":"+returnDependency];
					if(!startNode){
						startNode = {
							name: classUnit.name+":"+returnDependency,
							method:methodUnit,
							component: {
								name: classUnit.name,
								classUnit: classUnit.UUID
							}
						}
						nodesParaByID[classUnit.name+":"+returnDependency] = startNode;
					}
				
					
					var endNode = nodesParaByID[targetClassUnit.UUID];
					if(!endNode){
					endNode = {
							name: targetClassUnit.name,
							component: {
								name: targetClassUnit.name,
								classUnit: targetClassUnit.UUID
							},
							UUID: targetClassUnit.UUID
					}
					nodesParaByID[UUID] = endNode;
					}

					edgesPara.push({start: startNode, end: endNode});
					
					}
				}
				
				var paramDependencies = dependency.paramDependencies;
				
				for(var k in paramDependencies){
					var paramDependency = paramDependencies[k];
					var methodUnit = methodUnitsByName[classUnit.name+":"+k];
					
					if(methodUnit){
					var startNode = nodesParaByID[classUnit.name+":"+k];
					if(!startNode){
						startNode = {
							name: classUnit.name+":"+k,
							method:methodUnit,
							component: {
								name: classUnit.name,
								classUnit: classUnit.UUID
							}
						}
						nodesParaByID[classUnit.name+":"+k] = startNode;
					}
					
					var endNode = nodesParaByID[targetClassUnit.UUID];
					if(!endNode){
					endNode = {
							name: targetClassUnit.name,
							component: {
								name: targetClassUnit.name,
								classUnit: targetClassUnit.UUID
							},
							UUID: targetClassUnit.UUID
					}
					nodesParaByID[UUID] = endNode;
					}
					
					edgesPara.push({start: startNode, end: endNode});
					
					}
				}
				
				var localDependencies = dependency.localDependencies;
				
				for(var k in localDependencies){
					var localDependency = localDependencies[k];
					var methodUnit = methodUnitsByName[classUnit.name+":"+k];
					
					if(methodUnit){
					var startNode = nodesPByID[classUnit.name+":"+k];
					if(!startNode){
						startNode = {
							name: classUnit.name+":"+k,
							method:methodUnit,
							component: {
								name: classUnit.name,
								classUnit: classUnit.UUID
							}
						}
						nodesPByID[classUnit.name+":"+k] = startNode;
					}
					
						var startNodeComposite = nodesPCompositeByID[compositeClassUnit.UUID];
						if(!startNodeComposite){
							startNodeComposite = {
								name: compositeClassUnit.UUID,
								UUID: compositeClassUnit.name,
								component: {
									name: compositeClassUnit.name,
									compositeClassUnit: compositeClassUnit.UUID
								}
							}
							nodesPCompositeByID[compositeClassUnit.UUID] = startNodeComposite;
						}
					
					var endNode = nodesPByID[targetClassUnit.UUID];
					if(!endNode){
					endNode = {
							name: targetClassUnit.name,
							component: {
								name: targetClassUnit.name,
								classUnit: targetClassUnit.UUID
							},
							UUID: targetClassUnit.UUID
					}
					nodesPByID[UUID] = endNode;
					}
					
					var endNodeComposite = nodesPCompositeByID[targetCompositeClassUnit.UUID];
					if(!endNodeComposite){
						endNodeComposite = {
							name: targetCompositeClassUnit.UUID,
							UUID: targetCompositeClassUnit.name,
							component: {
								name: targetCompositeClassUnit.name,
								compositeClassUnit: targetCompositeClassUnit.UUID
							}
						}
						nodesPCompositeByID[targetCompositeClassUnit.UUID] = endNodeComposite;
					}
					
					edgesP.push({start: startNode, end: endNode});
					edgesPComposite.push({start: startNodeComposite, end: endNodeComposite});
					
					}
				}
				
				var attrDependencies = dependency.attrDependencies;
				
				for(var k in attrDependencies){
					var attrDependency = attrDependencies[k];
					var methodUnit = methodUnitsByName[classUnit.name+":"+attrDependency];
					
					if(methodUnit){
					var startNode = nodesAttrByID[classUnit.name+":"+attrDependency];
					if(!startNode){
						startNode = {
							name: classUnit.name+":"+attrDependency,
							component: {
								name: classUnit.name,
								classUnit: classUnit.UUID
							},
							attributeName:attrDependency
						}
						nodesAttrByID[classUnit.name+":"+attrDependency] = startNode;
					}
					
					var startNodeComposite = nodesAttrCompositeByID[compositeClassUnit.UUID];
					if(!startNodeComposite){
						startNodeComposite = {
							name: compositeClassUnit.UUID,
							UUID: compositeClassUnit.name,
							component: {
								name: compositeClassUnit.name,
								compositeClassUnit: compositeClassUnit.UUID
							}
						}
						nodesPCompositeByID[compositeClassUnit.UUID] = startNodeComposite;
					}
					
					var endNode = nodesAttrByID[targetClassUnit.UUID];
					if(!endNode){
					endNode = {
							name: targetClassUnit.name,
							component: {
								name: targetClassUnit.name,
								classUnit: targetClassUnit.UUID
							},
							UUID: targetClassUnit.UUID
					}
					nodesAttrByID[UUID] = endNode;
					}
					
					var endNodeComposite = nodesAttrCompositeByID[targetCompositeClassUnit.UUID];
					if(!endNodeComposite){
						endNodeComposite = {
							name: targetCompositeClassUnit.UUID,
							UUID: targetCompositeClassUnit.name,
							component: {
								name: targetCompositeClassUnit.name,
								compositeClassUnit: targetCompositeClassUnit.UUID
							}
						}
						nodesAttrCompositeByID[targetCompositeClassUnit.UUID] = endNodeComposite;
					}
					
					edgesAttr.push({start: startNode, end: endNode});
					edgesAttrComposite.push({start: startNodeComposite, end: endNodeComposite});
					}
				}
			}
			
		}
		
		return typeDependencyGraph;
	}

	module.exports = {
		analyseCode: analyseCode
	}
}());