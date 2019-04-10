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
//	var pathsDrawer = require("./model_drawers/TransactionsDrawer.js");
	var modelDrawer = require("./model_drawers/UserSystemInteractionModelDrawer.js");
	var domainModelDrawer = require("./model_drawers/DomainModelDrawer.js");
	var mkdirp = require('mkdirp');
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	
	function extractModelInfo(umlModelInfo, callbackfunc) {
		
		var constructModel = function(modelParser, modelString, umlModelInfo, callbackfunc){
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

				// a few facts about the model for debugging
				var numUseCase = umlModelInfo.UseCases.length;
				var numTransaction = 0;
				var numDomainElements = umlModelInfo.DomainModel.Elements.length;
				
				// set up the domain model
				var domainModel = umlModelInfo.DomainModel;

				var debug = require("./utils/DebuggerOutput.js");
				debug.writeJson2("constructed_domain_model", domainModel, umlModelInfo.OutputDir);
				
				for(var i in umlModelInfo.UseCases) {
								var useCase = umlModelInfo.UseCases[i];
								
								modelDrawer.drawUSIMDiagram(useCase, domainModel, useCase.OutputDir+"/usim.dotty", function(){

									console.log("use case is drawn");
								});
								modelDrawer.drawTransactionsDiagram(useCase, useCase.OutputDir+"/transactions.dotty", function(){

									console.log("simple use case is drawn");
								});

								numTransaction += useCase.Transactions.length;
//								pathsDrawer.drawPaths(useCase.Paths, useCase.OutputDir+"/paths.dotty", function(){
//									console.log("paths are drawn");
//								});
				}


				var debug = require("./utils/DebuggerOutput.js");
				debug.writeJson2("modelStats", {
				    numUseCase: numUseCase,
				    numTransaction: numTransaction,
				    numDomainElements: numDomainElements
				}, umlModelInfo.OutputDir);

				console.log({
                            				    numUseCase: numUseCase,
                            				    numTransaction: numTransaction,
                            				    numDomainElements: numDomainElements
                            				});
//			    process.exit(0);
			
				modelDrawer.drawDomainModel(domainModel, domainModel.OutputDir+"/domainModel.dotty", function(){
					console.log("domain model is drawn");
				});


//				var debug = require("./utils/DebuggerOutput.js");
//				debug.writeJson2("constructed_usim_model", umlModelInfo, umlModelInfo.OutputDir);

				if(callbackfunc){
					callbackfunc(umlModelInfo);
				}

			}, umlModelInfo);
		}
		
		mkdirp(umlModelInfo.OutputDir, function(err) {

			if(err) {
				callbackfunc(false);
				console.log(err);
				return;
			}

			fs.readFile(umlModelInfo.umlFilePath, "utf8", function(err, data) {
			
			if(umlModelInfo.umlFilePath.endsWith(".json")){
				var modelJson = JSON.parse(data.trim());
				modelParser = srcParser;
				modelParser.isJSONBased = true;
				constructModel(modelParser, modelJson, umlModelInfo, callbackfunc);
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