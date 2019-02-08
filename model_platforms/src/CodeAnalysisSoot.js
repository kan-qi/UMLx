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
						Signature:{
							name:referencedMethodUnit.name,
							parameterUnits:referencedMethodUnit.parameterUnits
						}
				}
				
				
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
					name: accessClassUnit.name+":"+accessMethodUnit.Signature.name,
					component:accessClassUnit,
					UUID: accessMethodUnit.UUID,
					methodName: accessMethodUnit.Signature.name
			}
			accessGraph.nodes.push(accessNode);
			var accessCompositeNode = {
					name: accessCompositeClassUnit.name+":"+accessMethodUnit.Signature.name,
					component:accessCompositeClassUnit,
					UUID: accessMethodUnit.UUID,
					methodName: accessMethodUnit.Signature.name
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
						name: callClassUnit.name+":"+callMethodUnit.Signature.name,
						component:callClassUnit,
						UUID: callMethodUnit.UUID,
						methodName: callMethodUnit.Signature.name
				}
				callGraph.nodes.push(callNode);
				var callCompositeNode = {
						name: callCompositeClassUnit.name+":"+callMethodUnit.Signature.name,
						component:callCompositeClassUnit,
						UUID: callMethodUnit.UUID,
						methodName: callMethodUnit.Signature.name
				}
				callGraph.nodesComposite.push(callNode);
				
				var calleeMethodUnit = dicMethodUnits[edge.end.methodUnit];
				var calleeClassUnit = dicClassUnits[edge.end.classUnit];
				var calleeCompositeClassUnit = dicCompositeClassUnits[dicClassComposite[edge.end.classUnit]];
				var calleeNode = {
						name: calleeClassUnit.name+":"+calleeMethodUnit.Signature.name,
						component:calleeClassUnit,
						UUID: calleeMethodUnit.UUID,
						methodName: calleeMethodUnit.Signature.name
				}
				
				callGraph.nodes.push(calleeNode);
				
				var calleeCompositeNode = {
						name: calleeCompositeClassUnit.name+":"+calleeMethodUnit.Signature.name,
						component:calleeCompositeClassUnit,
						UUID: calleeMethodUnit.UUID,
						methodName: calleeMethodUnit.Signature.name
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
//			extendsGraph: extendsGraph,
//			compositionGraph: compositionGraph,
//			typeDependencyGraph: typeDependencyGraph,
			referencedClassUnits: referencedClassUnits,
			referencedCompositeClassUnits: referencedCompositeClassUnits,
			dicCompositeSubclasses: dicCompositeSubclasses,
			dicMethodParameters: dicMethodParameters
		};
		
		
		debug.writeJson2("converted-android-analysis-results-dicClassUnits", dicClassUnits);
		debug.writeJson2("converted-android-analysis-results-dicMethodUnits", dicMethodUnits);
		
		return result;
	}

	module.exports = {
		analyseCode: analyseCode
	}
}());