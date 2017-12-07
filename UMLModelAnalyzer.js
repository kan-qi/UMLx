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
				
				for(var i in umlModelInfo){
					model[i] = umlModelInfo[i];
				}
//					console.log("use cases");
					var useCases = model.UseCases;
//					console.log(useCases);
						for(var i in useCases) {
							(function(useCase){
//								console.log(useCase);
//								useCase._id = id;
//								var fileName = useCase.Name.replace(/[^A-Za-z0-9_]/gi, "_") + "_"+useCase._id;
								var fileName = useCase._id;
								useCase.OutputDir = model.OutputDir+"/"+fileName;
								useCase.AccessDir = model.AccessDir+"/"+fileName;
								for(var k in useCase.Diagrams){
									var diagram = useCase.Diagrams[k];
									diagram.OutputDir = useCase.OutputDir;
									diagram.AccessDir = useCase.AccessDir;
								}
							})(useCases[i]);
						}
						
					var domainModel = model.DomainModel;
//					var domainModel = model.DomainModel;
					domainModel.OutputDir = model.OutputDir+"/domainModel";
					domainModel.AccessDir = model.AccessDir+"/domainModel";
					domainModel.DotGraphFile = 'domainModel.dotty';
					domainModel.SvgGraphFile = 'domainModel.svg';
//					console.log("domainModel");
//					console.log(domainModel);
						for(var i in domainModel.Diagrams){
							var diagram = domainModel.Diagrams[i];
							diagram.OutputDir = domainModel.OutputDir;
							diagram.AccessDir = domainModel.AccessDir;
						}

						var debug = require("./utils/DebuggerOutput.js");
						debug.writeJson("model",model);

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