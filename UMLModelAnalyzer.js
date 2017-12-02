(function() {
	/**
	 *  Work as a test stub
	 */
	var modelXMLParser = require('./model_platforms/ea/XMI2.1Parserv1.1.js');
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

			modelXMLParser.extractModel(umlModelInfo.umlFilePath, function(model){
//				console.log("extract model");
//				each model contains multiple use case models and multiple domain models, it is necessary to consolidate the extract models from different packages into one.
//				console.log(models);
				umlModelInfo.UseCases = [];
				umlModelInfo.DomainModel = {
						OutputDir: umlModelInfo.OutputDir+"/domainModel",
						AccessDir: umlModelInfo.AccessDir+"/domainModel",
						DotGraphFile: 'domainModel.dotty',
						SvgGraphFile: 'domainModel.svg',
						Diagrams: [],
//						DomainModelAnalytics: initDomainModelAnalytics(umlModelInfo)
				};
//				umlModelInfo.ModelAnalytics = initModelAnalytics(umlModelInfo);
				
					console.log("use cases");
					var useCases = model.UseCases;
					console.log(useCases);
						for(var i in useCases) {
							(function(useCase, id){
//								console.log(useCase);
								useCase._id = id;
//								var fileName = useCase.Name.replace(/[^A-Za-z0-9_]/gi, "_") + "_"+useCase._id;
								var fileName = useCase._id;
								useCase.OutputDir = umlModelInfo.OutputDir+"/"+fileName;
								useCase.AccessDir = umlModelInfo.AccessDir+"/"+fileName;
								for(var k in useCase.Diagrams){
									var diagram = useCase.Diagrams[k];
									diagram.OutputDir = useCase.OutputDir;
									diagram.AccessDir = useCase.AccessDir;
//									diagramProfiler.profileDiagram(diagram, function(){
//										console.log("diagram is processed!");
//									});
//									console.log("Diagram file name:"+diagram.Name);
								}
//								mkdirp(useCase.OutputDir, function(err) {
//									if(err) {
//										console.log(err);
//										// the folders may already exists during re-analyse
//									}
//									// draw diagrams
//									
//								});
//								useCase.UseCaseAnalytics = initUseCaseAnalytics(useCase);
							})(useCases[i], i);
							umlModelInfo.UseCases.push(useCases[i]);
						}
						
					var domainModel = model.DomainModel;
					console.log("domainModel");
					console.log(domainModel);
						for(var i in domainModel.Diagrams){
							var diagram = domainModel.Diagrams[i];
//							diagram._id = j;
//							var fileName = diagram.Name.replace(/[^A-Za-z0-9_]/gi, "_") + Date.now();
							diagram.OutputDir = umlModelInfo.DomainModel.OutputDir;
							diagram.AccessDir = umlModelInfo.DomainModel.AccessDir;
//							diagramProfiler.profileDiagram(diagram);
							umlModelInfo.DomainModel.Diagrams.push(diagram);
//							console.log("diagram file name:"+diagram.Name);
						}


				if(callbackfunc){
					callbackfunc(umlModelInfo);
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
					modelXMLParser.extractModels(umlModelInfo.umlFilePath, func);			
				});
			},
	}
}());