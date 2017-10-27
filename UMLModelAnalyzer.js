(function() {
	/**
	 *  Work as a test stub
	 */
	var modelXMLParser = require('./model_platforms/ea/XMI2.1Parser.js');
	var diagramProfiler = require('./diagram_profilers/UMLDiagramProfiler.js');
	var mkdirp = require('mkdirp');
	var fs = require('fs');
	var exec = require('child_process').exec;
	//To process second order information, for example, determine duplicate or identify patterns.
	var useCaseProcessor = require('./diagram_profilers/UseCaseProcessor.js');
	var domainModelProcessor = require('./diagram_profilers/DomainModelProcessor.js');
	var domainModelDrawer = require('./diagram_profilers/DomainModelDrawer.js');
	var umlEvaluator = require('./UMLEvaluator.js');
	


	function extractModelInfo(umlModelInfo, callbackfunc) {
		mkdirp(umlModelInfo.outputDir, function(err) {
			// path exists unless there was an error
			if(err) {
				callbackfunc(false);
				console.log(err);
				return;
			}

			modelXMLParser.extractModels(umlModelInfo.umlFilePath, function(models){
//				console.log("extract model");
//				each model contains multiple use case models and multiple domain models, it is necessary to consolidate the extract models from different packages into one.
//				console.log(models);
				umlModelInfo.UseCases = [];
				umlModelInfo.DomainModel = {
						outputDir: umlModelInfo.outputDir+"/domainModel",
						accessDir: umlModelInfo.accessDir+"/domainModel",
						dotGraphFile: 'domainModel.dotty',
						svgGraphFile: 'domainModel.svg',
						Diagrams: [],
//						DomainModelAnalytics: initDomainModelAnalytics(umlModelInfo)
				};
//				umlModelInfo.ModelAnalytics = initModelAnalytics(umlModelInfo);

				for (var i in models.Packages){
					var modelPackage = models.Packages[i];
					if(modelPackage.UseCases){
						for(var j in modelPackage.UseCases) {
							(function(useCase, id){
//								console.log(useCase);
								useCase._id = id;
//								var fileName = useCase.Name.replace(/[^A-Za-z0-9_]/gi, "_") + "_"+useCase._id;
								var fileName = useCase._id;
								useCase.outputDir = umlModelInfo.outputDir+"/"+fileName;
								useCase.accessDir = umlModelInfo.accessDir+"/"+fileName;
								for(var k in useCase.Diagrams){
									var diagram = useCase.Diagrams[k];
									diagram.outputDir = useCase.outputDir;
									diagram.accessDir = useCase.accessDir;
									diagramProfiler.profileDiagram(diagram, function(){
										console.log("diagram is processed!");
									});
//									console.log("Diagram file name:"+diagram.Name);
								}
//								mkdirp(useCase.outputDir, function(err) {
//									if(err) {
//										console.log(err);
//										// the folders may already exists during re-analyse
//									}
//									// draw diagrams
//									
//								});
//								useCase.UseCaseAnalytics = initUseCaseAnalytics(useCase);
							})(modelPackage.UseCases[j], j);
							umlModelInfo.UseCases.push(modelPackage.UseCases[j]);
						}
					}

					if(modelPackage.DomainModel && modelPackage.DomainModel.Diagrams){
						for(var j in modelPackage.DomainModel.Diagrams){
							var diagram = modelPackage.DomainModel.Diagrams[j];
							diagram._id = j;
//							var fileName = diagram.Name.replace(/[^A-Za-z0-9_]/gi, "_") + Date.now();
							diagram.outputDir = umlModelInfo.DomainModel.outputDir;
							diagram.accessDir = umlModelInfo.DomainModel.accessDir;
							diagramProfiler.profileDiagram(diagram);
							umlModelInfo.DomainModel.Diagrams.push(diagram);
//							console.log("diagram file name:"+diagram.Name);
						}
					}
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
				mkdirp(umlModelInfo.outputDir, function(err) {
					// path exists unless there was an error
					if(err) {
						return console.log(err);
					}
					modelXMLParser.extractModels(umlModelInfo.umlFilePath, func);			
				});
			},
	}
}());