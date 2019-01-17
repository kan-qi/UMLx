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

	var dicClassUnits = {};
	var dicMethodUnits = {};
	var dicCompositeClasses = {};
	var dicClassComposite = {}; // {subclass.UUID, compositeClassUnit.UUID}
	var dicCompositeSubclasses = {}; // {compositeClassUnit.UUID, [subclass.UUID]}
	var dicMethodClass = {};	 // {method.uuid, class.uuid}
	var dicActionElementMethod = {};

	function analyseCode(jsonString, outputDir) {
		
		var androidAnalysisResults = FileManagerUtils.readJSONSync("H:\\ResearchSpace\\ResearchProjects\\UMLx\\facility-tools\\GATOR_Tool\\gator-3.5\\output\\android-analysis-output.json");

		var referencedClassUnits = androidAnalysisResults.classUnits;
		
		var dicClassUnits = {};
		var dicMethodUnits = {};
		var dicMethodClass = {};
		var dicMethodParameters = {};
		
		for(var referencedClassUnit in referencedClassUnits){
			dicClassUnits[referencedClassUnit.uuid] = referencedClassUnit;
			for(var referencedMethodUnit in referencedClassUnit.methodUnits){
				dicMethodUnits[referencedMethodUnit.uuid] = referencedMethodUnit;
				dicMethodClass[referencedMethodUnit.uuid] = referencedClassUnit.uuid;
				for(var referencedParameter in referencedMethodUnit.parameterTypes){
					dicMethodParameters[referencedMethodUnit.uuid] = referencedParameter;
				}
			}
		}
		
		
		var dicCompositeSubclasses = {};
		var referencedCompositeClassUnits = androidAnalysisResults.compositeClassUnits;
		
		for(var referencedCompositeClassUnit in referencedCompositeClassUnits){
			for(var subClassUnit in referencedCompositeClassUnit.classUnits){
				dicCompositeSubclasses[referencedCompositeClassUnit.uuid] = subClassUnit;
			}
		}
		
		var callGraph = androidAnalysisResults.callGraph;
		var accessGraph = androidAnalysisResults.accessGraph;
		
//		var typeDependencyGraph = constructTypeDependencyGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);		
//		var extendsGraph = constructExtendsGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
//		var compositionGraph = constructCompositionGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);


		return {
			dicClassUnits: dicClassUnits,
			dicMethodUnits: dicMethodUnits,
			dicMethodClass: dicMethodClass,
			callGraph: callGraph,
			accessGraph: accessGraph,
//			extendsGraph: extendsGraph,
//			compositionGraph: compositionGraph,
//			typeDependencyGraph: typeDependencyGraph,
			referencedClassUnits: referencedClassUnits,
			referencedClassUnitsComposite: referencedCompositeClassUnits,
			dicCompositeSubclasses: dicCompositeSubclasses,
			dicMethodParameters: dicMethodParameters
		};
	}

	module.exports = {
		analyseCode: analyseCode
	}
}());