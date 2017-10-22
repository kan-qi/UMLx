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

//	console.log(umlEvaluator);
	
//	var exec = require('child_process').exec;

	function analyseRepo(repo, callbackfunc){

		if(!callbackfunc){
			return repo.RepoAnalytics;
		}
		
		var repoAnalytics = initRepoAnalytics(repo);
		repo.RepoAnalytics = repoAnalytics;

		for(var i in repo.models){
			var modelInfo = repo.models[i];

			modelInfo.ModelAnalytics = analyseModel(modelInfo, function(){
					console.log("model analysis complete");
				});

			var modelAnalytics = modelInfo.ModelAnalytics;

			repoAnalytics.TotalPathLength += modelAnalytics.TotalPathLength;
			repoAnalytics.PathNum += modelAnalytics.PathNum;
			repoAnalytics.INT += modelAnalytics.INT;
			repoAnalytics.DM += modelAnalytics.DM;
			repoAnalytics.CTRL += modelAnalytics.CTRL;
			repoAnalytics.TRAN_NA += modelAnalytics.TRAN_NA;
			repoAnalytics.FUNC_NA += modelAnalytics.FUNC_NA;
			repoAnalytics.FN += modelAnalytics.FN;
			repoAnalytics.EI += modelAnalytics.EI;
			repoAnalytics.EO += modelAnalytics.EO;
			repoAnalytics.EQ += modelAnalytics.EQ;
			repoAnalytics.EXTIVK += modelAnalytics.EXTIVK;
			repoAnalytics.EXTCLL += modelAnalytics.EXTCLL;
			repoAnalytics.NT += modelAnalytics.NT;
//			repoAnalytics.NWT += modelAnalytics.NWT;
//			repoAnalytics.NWT_DE += modelAnalytics.NWT_DE;
			repoAnalytics.CCSS += modelAnalytics.CCSS;
			repoAnalytics.TotalLinks += modelAnalytics.TotalLinks;
			repoAnalytics.ActorNum += modelAnalytics.ActorNum;
			repoAnalytics.BoundaryNum += modelAnalytics.BoundaryNum;
			repoAnalytics.ControlNum += modelAnalytics.ControlNum;
			repoAnalytics.EntityNum += modelAnalytics.EntityNum;

			repoAnalytics.TotalDegree += modelAnalytics.TotalDegree;
			repoAnalytics.ElementNum += modelAnalytics.ElementNum;
		}

			repoAnalytics.AvgPathLength = repoAnalytics.PathNum == 0 ? 0 : repoAnalytics.TotalPathLength/repoAnalytics.PathNum;
			repoAnalytics.AvgDegree = repoAnalytics.ElementNum == 0 ? 0 : repoAnalytics.TotalDegree/repoAnalytics.ElementNum;

			
		if(callbackfunc !== undefined){
			dumpRepoAnalytics(repo, callbackfunc);
		}
		return repo.RepoAnalytics;
	}
	
	function toPathAnalyticsStr(path){
		
	}

	function dumpRepoAnalytics(repo, callbackfunc){
		var repoAnalytics = repo.RepoAnalytics;
//		console.log(repoAnalytics.OutputDir);

		var pathAnalyticsStr = "id,path,functional,transactional,path_length,avg_degree,arch_diff,diagram,use_case,model\n";
		var pathNum = 0;
		var expandedPathAnalyticsStr = "id,path,transactional,path_length,diagram,useCase\n";
		var expandedPathNum = 0;
		var elementAnalyticsStr = "id,element,type,outboundDegree,inboundDegree,diagram,useCase,model\n";
		var elementNum = 0;
		var useCaseAnalyticsStr = "id,useCase,average_degree,average_path_length,architecture_difficulty,path_number\n";
		var useCaseNum = 0;
		
		var modelVersionInfoStr = "id,model_name,update_time,number_of_paths\n"


		for(var i in repo.models){
			var model = repo.models[i];
			var modelAnalytics = model.ModelAnalytics;
			for(var j in model.UseCases){
//				console.log("dump useCase Analytics");
				var useCaseAnalytics = model.UseCases[j].UseCaseAnalytics;
				for(var k in useCaseAnalytics.Diagrams){
					var diagramAnalytics = useCaseAnalytics.Diagrams[k].DiagramAnalytics;
					for(var m in diagramAnalytics.Paths){
						pathNum++;
//						console.log(diagramAnalytics.Paths[n]);
//						console.log(diagramAnalytics.Paths[m]);
						pathAnalyticsStr += pathNum+","+
						diagramAnalytics.Paths[m].PathStr.replace(/,/gi, "")+","+ 
						diagramAnalytics.Paths[m].Operations.functional.join('|')+","+ 
						diagramAnalytics.Paths[m].Operations.transactional.join('|')+","+ 
						diagramAnalytics.Paths[m].pathLength+","+ 
						diagramAnalytics.Paths[m].avgDegree+","+
						diagramAnalytics.Paths[m].archDiff+","+
						diagramAnalytics.Name.replace(/,/gi, "")+","+ 
						useCaseAnalytics.Name.replace(/,/gi, "")+","+ 
						modelAnalytics.Name.replace(/,/gi, "")+"\n";
					}
					
					for(var m in diagramAnalytics.Paths){
						for(var n in diagramAnalytics.Paths[m].Operations.transactional){
						var transactionalOperation = diagramAnalytics.Paths[m].Operations.transactional[n];
						expandedPathNum++;
						expandedPathAnalyticsStr += expandedPathNum+","+
						diagramAnalytics.Paths[m].PathStr.replace(/,/gi, "")+","+ 
						transactionalOperation+","+ 
						diagramAnalytics.Paths[m].Elements.length+","+ 
						diagramAnalytics.Name+","+ 
						useCaseAnalytics.Name+"\n";
						}
					}


					for(var m in diagramAnalytics.Elements){
						elementNum++;
						elementAnalyticsStr += elementNum+","+ 
						diagramAnalytics.Elements[m].Name.replace(/,/gi, "")+","+ 
						diagramAnalytics.Elements[m].Type.replace(/,/gi, "")+","+ 
						diagramAnalytics.Elements[m].OutboundNumber+","+ 
						diagramAnalytics.Elements[m].InboundNumber+","+
						diagramAnalytics.Name.replace(/,/gi, "")+","+ 
						useCaseAnalytics.Name.replace(/,/gi, "")+","+ 
						modelAnalytics.Name.replace(/,/gi, "")+"\n";
					}
				}

				//useCase analytics
				useCaseNum++;
				useCaseAnalyticsStr += useCaseNum+","+
				useCaseAnalytics.Name+","+
				useCaseAnalytics.AvgDegree+","+
				useCaseAnalytics.AvgPathLength+","+
				useCaseAnalytics.ArchDiff+","+
				useCaseAnalytics.PathNum+"\n"
			}
			

			modelVersionInfoStr += model._id+","+model.umlModelName+","+model.creationTime+","+model.ModelAnalytics.PathNum+"\n";
			for(var i in model.Versions){
				var version = model.Versions[i];
				modelVersionInfoStr += version._id+","+version.umlModelName+","+version.creationTime+","+version.ModelAnalytics.PathNum+"\n";
			}
		}


//		repoAnalytics.PathAnalytics = pathAnalytics;
//		repoAnalytics.ElementAnalytics = elementAnalytics;
//		console.log("element Analytics");

		mkdirp(repoAnalytics.OutputDir, function(err) { 
			if(err) {
				console.log(err);
				if(callbackfunc !== undefined){
					callbackfunc(false);
				}
				return;
			}

			fs.writeFile(repoAnalytics.OutputDir+"/"+repoAnalytics.PathAnalyticsFileName, pathAnalyticsStr, function(err) {
				if(err) {
					console.log(err);
					if(callbackfunc !== undefined){
						callbackfunc(false);
					}
					return;
				}
				
				fs.writeFile(repoAnalytics.OutputDir+"/expandedPathAnalytics.csv", expandedPathAnalyticsStr, function(err){
					if(err) {
						console.log(err);
						if(callbackfunc !== undefined){
							callbackfunc(false);
						}
						return; 
					}

//				console.log("Paths Analytics were saved!");

				fs.writeFile(repoAnalytics.OutputDir+"/"+repoAnalytics.ElementAnalyticsFileName, elementAnalyticsStr, function(err){
					if(err) {
						console.log(err);
						if(callbackfunc !== undefined){
							callbackfunc(false);
						}
						return; 
					}

					fs.writeFile(repoAnalytics.OutputDir+"/"+repoAnalytics.UseCaseAnalyticsFileName, useCaseAnalyticsStr, function(err){
						if(err) {
							console.log(err);
							if(callbackfunc !== undefined){
								callbackfunc(false);
							}
							return; 
						}

						fs.writeFile(repoAnalytics.OutputDir+"/model_version_info.csv", modelVersionInfoStr, function(err){
							if(err) {
								console.log(err);
								if(callbackfunc !== undefined){
									callbackfunc(false);
								}
								return; 
							}

//							console.log("Elements Analytics were saved!");

							generateRepoStatisticalCharts(repoAnalytics, callbackfunc);

						});

					});
				  });
				});
			});


		});
	}


	function generateRepoStatisticalCharts(repoAnalytics, callbackfunc){
		var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/RepoAnalyticsScript.R "'+repoAnalytics.OutputDir+"/"+repoAnalytics.ElementAnalyticsFileName+'" "'+repoAnalytics.OutputDir+"/"+repoAnalytics.PathAnalyticsFileName+'" "'+repoAnalytics.OutputDir+'/expandedPathAnalytics.csv" "'+repoAnalytics.OutputDir+"/"+repoAnalytics.UseCaseAnalyticsFileName+'" "'+modelAnalytics.OutputDir+'/model_version_info.csv" "'+repoAnalytics.OutputDir+'" "."';
//		console.log('generate model Analytics');
//		console.log(command);
		var child = exec(command, function(error, stdout, stderr) {

			if (error !== null) {
//				console.log('exec error: ' + error);
				console.log('exec error: repo id=' + repoAnalytics._id)
				if(callbackfunc !== undefined){
					callbackfunc(false);
				}
			} 
			if(callbackfunc !== undefined){
				callbackfunc(repoAnalytics);
			}
		});
	}

	//if callback != null, dump model info.
	function analyseModel(modelInfo, callbackfunc){

		if(!callbackfunc){
			return modelInfo.ModelAnalytics;
		}

		var modelAnalytics = initModelAnalytics(modelInfo);
		modelInfo.ModelAnalytics = modelAnalytics;

		//analyse use cases
		for(var i in modelInfo.UseCases){
			var useCase = modelInfo.UseCases[i];
			var useCaseAnalytics = null;
			useCaseAnalytics = analyseUseCase(useCase, function(){
				console.log('useCase analysis is complete');
			});
			

//			var UEXUCW = 0;
		
//			console.log(modelAnalytics);
			modelAnalytics.TotalPathLength += useCaseAnalytics.TotalPathLength;
			modelAnalytics.PathNum += useCaseAnalytics.PathNum;
			modelAnalytics.UseCaseNum ++;
			modelAnalytics.DiagramNum += useCaseAnalytics.DiagramNum;
			modelAnalytics.INT += useCaseAnalytics.INT;
			modelAnalytics.DM += useCaseAnalytics.DM;
			modelAnalytics.CTRL += useCaseAnalytics.CTRL;
			modelAnalytics.EXTIVK += useCaseAnalytics.EXTIVK;
			modelAnalytics.EXTCLL += useCaseAnalytics.EXTCLL;
			modelAnalytics.TRAN_NA += useCaseAnalytics.TRAN_NA;
			modelAnalytics.NT += useCaseAnalytics.NT;
//			modelAnalytics.NWT += useCaseAnalytics.NWT;
//			modelAnalytics.NWT_DE += useCaseAnalytics.NWT_DE;
			
//			console.log(useCaseAnalytics);

			modelAnalytics.TotalLinks += useCaseAnalytics.TotalLinks;
			modelAnalytics.ActorNum += useCaseAnalytics.ActorNum;
			modelAnalytics.BoundaryNum += useCaseAnalytics.BoundaryNum;
			modelAnalytics.ControlNum += useCaseAnalytics.ControlNum;
			modelAnalytics.EntityNum += useCaseAnalytics.EntityNum;

			modelAnalytics.TotalDegree += useCaseAnalytics.TotalDegree;
			modelAnalytics.ElementNum += useCaseAnalytics.ElementNum;

//			modelAnalytics.UEUCW += useCaseAnalytics.UEUCW;
//			modelAnalytics.UEXUCW += useCaseAnalytics.UEXUCW; //IT rerpesents Number of Transactions, replaced with IT.
			modelAnalytics.EI += useCaseAnalytics.EI;
			modelAnalytics.EO += useCaseAnalytics.EO;
			modelAnalytics.EQ += useCaseAnalytics.EQ;
			modelAnalytics.FUNC_NA += useCaseAnalytics.FUNC_NA;
			modelAnalytics.FN += useCaseAnalytics.FN;
//			modelAnalytics.AFP += parseFloat(useCaseAnalytics.ILF)+parseFloat(useCaseAnalytics.EIF)+parseFloat(useCaseAnalytics.EI)+parseFloat(useCaseAnalytics.EO)+parseFloat(useCaseAnalytics.EQ);
			modelAnalytics.Effort += useCaseAnalytics.Effort;
		}
		
		modelAnalytics.AvgPathLength = modelAnalytics.PathNum == 0 ? 0: modelAnalytics.TotalPathLength/modelAnalytics.PathNum;
		modelAnalytics.AvgDegree = modelAnalytics.ElementNum == 0 ? 0 : modelAnalytics.TotalDegree/modelAnalytics.ElementNum;
		//analyse domain model
		var domainModelAnalytics = null;
		domainModelAnalytics = analyseDomainModel(modelInfo.DomainModel, function(){
				console.log('useCase analysis is complete');
			});
//		modelAnalytics.ILF = domainModelAnalytics.ILF;
//		modelAnalytics.EIF = domainModelAnalytics.EIF;
		modelAnalytics.AttributeNum = domainModelAnalytics.AttributeNum;
		modelAnalytics.OperationNum = domainModelAnalytics.OperationNum;
		modelAnalytics.ElementNum = domainModelAnalytics.ElementNum;
		modelAnalytics.DiagramNum += domainModelAnalytics.DiagramNum;
		modelAnalytics.ClassNum = domainModelAnalytics.ClassNum;

		// for everything related to AFP, for example, EIF and ILF, they are moved into evaluators/FunctionPointEvaluator.js
//		modelAnalytics.AFP += parseFloat(modelAnalytics.ILF)+parseFloat(modelAnalytics.EIF)+parseFloat(modelAnalytics.EI)+parseFloat(modelAnalytics.EO)+parseFloat(modelAnalytics.EQ);

//		modelInfo.ModelAnalytics = modelAnalytics;

		//redo model evaluation.
		umlEvaluator.redoModelEvaluation(modelInfo);

		if(callbackfunc !== undefined){
			dumpModelAnalytics(modelInfo, callbackfunc)
		}
		
//		console.log(modelInfo.ModelAnalytics);
		return modelInfo.ModelAnalytics;
	}
	
	function dumpModelAnalytics(model, callbackfunc){
		var modelAnalytics = model.ModelAnalytics;
//		console.log(modelAnalytics);
		var pathAnalyticsStr = "id,path,functional,transactional,path_length, boundary_num, control_num, entity_num, actor_num, utw, diagram,useCase\n";
		var pathNum = 0;
		//only for temporary analysis
		var expandedPathAnalyticsStr = "id,path,transactional,path_length,diagram,useCase\n";
		var expandedPathNum = 0;
		var elementAnalyticsStr = "id,element,type,outbound_degree,inbound_degree,diagram,useCase\n";
		var elementNum = 0;
//		var useCaseAnalyticsStr = "NUM, UC, total_links, actor_num, boundary_num, control_num, entity_num, element_num, interface_operation_num, data_operation_num, control_operation_num, partial_matched_num, average_degree,average_path_length,architecture_difficulty,path_number\n";
		var useCaseAnalyticsStr = "NUM, UC, total_links, actor_num, boundary_num, control_num, entity_num, element_num, DM, INT, CTRL, EXTIVK, EXTCLL, TRAN_NA, NT, EI, EO, EQ, FUNC_NA, FN, average_degree,average_path_length,ArchDiff,PathNum\n";
//		var useCaseAnalyticsStr = "NUM, UC, total_links, actor_num, boundary_num, control_num, entity_num, element_num, DM, INT, CTRL, EXTIVK, EXTCLL, TRAN_NA, NT, EI, EO, EQ, FUNC_NA, FN, average_degree,average_path_length,ArchDiff,PathNum,EUCPW,EXUCPW\n";
		var useCaseNum = 0;
		var domainModelAnalyticsStr = "id, element_name, attribute_num,operation_num\n";
		
		var modelVersionInfoStr = "id,model_name,update_time,number_of_paths\n"
		
		for(var i in model.UseCases){
//			console.log("dump useCase Analytics");
			var useCaseAnalytics = model.UseCases[i].UseCaseAnalytics;
			for(var j in useCaseAnalytics.Diagrams){
				var diagramAnalytics = useCaseAnalytics.Diagrams[j].DiagramAnalytics;
//				console.log(diagramAnalytics);
				for(var k in diagramAnalytics.Paths){
					var path = diagramAnalytics.Paths[k];
					//to evaluate the unadjusted transactional weight for each transaction for exucp
					
					console.log(path);
					pathNum++;
					pathAnalyticsStr += pathNum+","+
					path.PathStr.replace(/,/gi, "")+","+ 
					path.Operations.functional.join('|')+","+ 
					path.Operations.transactional.join('|')+","+ 
					path.Elements.length+","+
					path.boundaryNum+","+
					path.controlNum+","+
					path.entityNum+","+
					path.actorNum+","+
					path.utw+","+
					diagramAnalytics.Name+","+ 
					useCaseAnalytics.Name+"\n";
				}
				
				for(var k in diagramAnalytics.Paths){
					for(var m in diagramAnalytics.Paths[k].Operations.transactional){
					var transactionalOperation = diagramAnalytics.Paths[k].Operations.transactional[m];
					expandedPathNum++;
					expandedPathAnalyticsStr += expandedPathNum+","+
					diagramAnalytics.Paths[k].PathStr.replace(/,/gi, "")+","+ 
					transactionalOperation+","+ 
					diagramAnalytics.Paths[k].Elements.length+","+ 
					diagramAnalytics.Name+","+ 
					useCaseAnalytics.Name+"\n";
					}
				}

				//element analytics
				for(var k in diagramAnalytics.Elements){
					elementNum++;
					elementAnalyticsStr += elementNum+","+ 
					diagramAnalytics.Elements[k].Name.replace(/,/gi, "")+","+ 
					diagramAnalytics.Elements[k].Type.replace(/,/gi, "")+","+ 
					diagramAnalytics.Elements[k].OutboundNumber+","+ 
					diagramAnalytics.Elements[k].InboundNumber+","+
					diagramAnalytics.Name+","+ 
					useCaseAnalytics.Name+"\n";
				}
			}
			
		
			//useCase analytics
			useCaseNum++;
			useCaseAnalyticsStr += useCaseNum+","+
			useCaseAnalytics.Name.replace(/,/gi, "")+","+
			useCaseAnalytics.TotalLinks+","+
			useCaseAnalytics.ActorNum+","+
			useCaseAnalytics.BoundaryNum+","+
			useCaseAnalytics.ControlNum+","+
			useCaseAnalytics.EntityNum+","+
			useCaseAnalytics.ElementNum+","+
			useCaseAnalytics.INT+","+
			useCaseAnalytics.DM+","+
			useCaseAnalytics.CTRL+","+
			useCaseAnalytics.EXTIVK+","+
			useCaseAnalytics.EXTCLL+","+
			useCaseAnalytics.TRAN_NA+","+
			useCaseAnalytics.NT+","+
			useCaseAnalytics.EI+","+
			useCaseAnalytics.EO+","+
			useCaseAnalytics.EQ+","+
			useCaseAnalytics.FUNC_NA+","+
			useCaseAnalytics.FN+","+
			useCaseAnalytics.AvgDegree+","+
			useCaseAnalytics.AvgPathLength+","+
			useCaseAnalytics.ArchDiff+","+
			useCaseAnalytics.PathNum+"\n";
//			useCaseAnalytics.UEUCW+","+
//			useCaseAnalytics.UEXUCW+"\n";
		}

		for(var i in model.DomainModel.Diagrams){
			var diagram = model.DomainModel.Diagrams[i];
			domainModelAnalyticsStr += diagram._id + ","+
			diagram.Name + ","+
			diagram.AttributeNum+","+
			diagram.OperationNum+","+
			diagram.ElementNum+"\n";
		}
		
		modelVersionInfoStr += model._id+","+model.umlModelName+","+model.creationTime+","+model.ModelAnalytics.PathNum+"\n";
		for(var i in model.Versions){
			var version = model.Versions[i];
			modelVersionInfoStr += version._id+","+version.umlModelName+","+version.creationTime+","+version.ModelAnalytics.PathNum+"\n";
		}

		mkdirp(modelAnalytics.OutputDir, function(err) { 
			if(err) {
				console.log(err);
				if(callbackfunc !== undefined){
					callbackfunc(false);
				}
				return;
			}

			fs.writeFile(modelAnalytics.OutputDir+"/"+modelAnalytics.PathAnalyticsFileName, pathAnalyticsStr, function(err) {
				if(err) {
					console.log(err);
					if(callbackfunc !== undefined){
						callbackfunc(false);
					}
					return;
				}

//				console.log("Paths Analytics were saved!");

				fs.writeFile(modelAnalytics.OutputDir+"/"+modelAnalytics.ElementAnalyticsFileName, elementAnalyticsStr, function(err){
					if(err) {
						console.log(err);
						if(callbackfunc !== undefined){
							callbackfunc(false);
						}
						return; 
					}

					fs.writeFile(modelAnalytics.OutputDir+"/"+modelAnalytics.UseCaseAnalyticsFileName, useCaseAnalyticsStr, function(err){
						if(err) {
							console.log(err);
							if(callbackfunc !== undefined){
								callbackfunc(false);
							}
							return; 
						}

						fs.writeFile(modelAnalytics.OutputDir+"/"+modelAnalytics.DomainModelAnalyticsFileName, domainModelAnalyticsStr, function(err){
							if(err) {
								console.log(err);
								if(callbackfunc !== undefined){
									callbackfunc(false);
								}
								return; 
							}

							fs.writeFile(modelAnalytics.OutputDir+"/expandedPathAnalytics.csv", expandedPathAnalyticsStr, function(err){
								if(err) {
									console.log(err);
									if(callbackfunc !== undefined){
										callbackfunc(false);
									}
									return; 
								}
								fs.writeFile(modelAnalytics.OutputDir+"/model_version_info.csv", modelVersionInfoStr, function(err){
									if(err) {
										console.log(err);
										if(callbackfunc !== undefined){
											callbackfunc(false);
										}
										return; 
									}

									console.log("Elements Analytics were saved!");
									generateModelStatisticalCharts(modelAnalytics, callbackfunc);

								});

							});

						});

					});
				});
			});


		});
	}



	function generateModelStatisticalCharts(modelAnalytics, callbackfunc){
		var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/ModelAnalyticsScript.R "'+modelAnalytics.OutputDir+"/"+modelAnalytics.ElementAnalyticsFileName+'" "'+modelAnalytics.OutputDir+"/"+modelAnalytics.PathAnalyticsFileName+'" "'+modelAnalytics.OutputDir+'/expandedPathAnalytics.csv" "'+modelAnalytics.OutputDir+"/"+modelAnalytics.UseCaseAnalyticsFileName+'" "'+modelAnalytics.OutputDir+"/"+modelAnalytics.DomainModelAnalyticsFileName+'" "'+modelAnalytics.OutputDir+'/model_version_info.csv" "'+modelAnalytics.OutputDir+'" "."';
		console.log(command);
		var child = exec(command, function(error, stdout, stderr) {

			if (error !== null) {
//				console.log('exec error: ' + error);
				console.log('exec error: model id=' + modelAnalytics._id)
				if(callbackfunc !== undefined){
					callbackfunc(false);
				}
			}
			if(callbackfunc !== undefined){
				callbackfunc(modelAnalytics);
			}
		});
		
	}

	function analyseDomainModel(domainModelInfo, callbackfunc){
		if(!callbackfunc){
			return domainModelInfo.DomainModelAnalytics;
		}
		var domainModelAnalytics = initDomainModelAnalytics(domainModelInfo);
		domainModelInfo.DomainModelAnalytics = domainModelAnalytics;

//		console.log('-----------domain model------------');
//		console.log(domainModelInfo);
		for(var i in domainModelInfo.Diagrams){
			var diagram = domainModelInfo.Diagrams[i];
			if(!domainModelProcessor.processDiagram(diagram)){
				continue;
			}

			var diagramAnalytics = initDiagramAnalytics(diagram);
			diagram.DiagramAnalytics = diagramAnalytics;
			diagram.DiagramAnalytics.AttributeAnalyticsFileName = "attributeAnalytics.csv";
			diagram.DiagramAnalytics.OperationAnalyticsFileName = "oprationAnalytics.csv";
			domainModelAnalytics.Diagrams.push(diagram);

			var attributeNum = 0;
			var operationNum = 0;
			var elementNum = 0;

			for(var j in diagram.Elements){
				var element = diagram.Elements[j];
				if(domainModelProcessor.processElement(element)){
					elementNum ++;
					var classElement = {
							Attributes:[],
							Operations:[],
							Name:element.Name,
							Type:'class'
					}
					diagramAnalytics.Elements.push(classElement);
					for(var k in element.Attributes){
						var attribute = element.Attributes[k];
						if(domainModelProcessor.processAttribute(attribute)){
							attributeNum++;
							classElement.Attributes.push(attribute);
						}
					}

					for(var k in element.Operations){
						var operation = element.Operations[k];
						if(domainModelProcessor.processOperation(operation)){
							operationNum++;
							classElement.Operations.push(operation);
						}
					}
				}
				domainModelAnalytics.ClassNum++;
			}

			diagramAnalytics.AttributeNum = attributeNum;
			diagramAnalytics.OperationNum = operationNum;
			diagramAnalytics.ElementNum = elementNum;



			domainModelAnalytics.AttributeNum += diagramAnalytics.AttributeNum;
			domainModelAnalytics.OperationNum += diagramAnalytics.OperationNum;
			domainModelAnalytics.ElementNum += diagramAnalytics.ElementNum;
//			domainModelAnalytics.ILF += diagramAnalytics.ILF;
//			domainModelAnalytics.EIF += diagramAnalytics.EIF;
			
			domainModelAnalytics.DiagramNum ++;
		}
		
		
		if(callbackfunc){
			dumpDomainModelAnalytics(domainModelInfo, callbackfunc);
		}

		return domainModelAnalytics;
	}

	function dumpDomainModelAnalytics(domainModelInfo, callbackfunc){

		var domainModelAnalytics = domainModelInfo.DomainModelAnalytics;

		var elementAnalyticsStr = "id,element,attributeNum,operationNum,diagram\n";
		var attributeAnalyticsStr = "id,attribute,type,element,diagram\n";
		var operationAnalyticsStr = "id,operation,element,diagram\n";

		var elementNum = 0;
		var attributeNum = 0;
		var operationNum = 0;

		for(var i in domainModelAnalytics.Diagrams){
			var diagramAnalytics = domainModelAnalytics.Diagrams[i].DiagramAnalytics;
			for(var j in diagramAnalytics.Elements){
				var element = diagramAnalytics.Elements[j];
				elementNum++;
				elementAnalyticsStr += elementNum+ ","+
				element.Name + ","+
				element.Attributes.length+","+
				element.Operations.length+","+
				diagramAnalytics.Name+"\n";
				for(var k in element.Attributes){
					attributeNum++;
					var attribute = element.Attributes[k];
					attributeAnalyticsStr += attributeNum+","+
					attribute.Name+","+
					attribute.Type+","+
					element.Name+","+
					diagramAnalytics.Name+"\n";
				}

				for(var k in element.Operations){
					operationNum++;
					var operation = element.Operations[k];
					operationAnalyticsStr += operationNum+","+
					operation.Name+","+
					element.Name+","+
					diagramAnalytics.Name+"\n";
				}
			}
		}

//		console.log(domainModelAnalytics);

		mkdirp(domainModelAnalytics.OutputDir, function(err) { 
			if(err) {
				console.log(err);
				if(callbackfunc !== undefined){
					callbackfunc(false);
				}
				return;
			}

			fs.writeFile(domainModelAnalytics.OutputDir+"/"+domainModelAnalytics.ElementAnalyticsFileName, elementAnalyticsStr, function(err){
				if(err) {
					console.log(err);
					if(callbackfunc !== undefined){
						callbackfunc(false);
					}
					return; 
				}

				fs.writeFile(domainModelAnalytics.OutputDir+"/"+domainModelAnalytics.AttributeAnalyticsFileName, attributeAnalyticsStr, function(err){
					if(err) {
						console.log(err);
						if(callbackfunc !== undefined){
							callbackfunc(false);
						}
						return; 
					}

					fs.writeFile(domainModelAnalytics.OutputDir+"/"+domainModelAnalytics.OperationAnalyticsFileName, operationAnalyticsStr, function(err){
						if(err) {
							console.log(err);
							if(callbackfunc !== undefined){
								callbackfunc(false);
							}
							return; 
						}

						// also draw domain model
						domainModelDrawer.drawDomainModel(domainModelInfo, function(graphFilePath){
							var command = 'dot -Tsvg "' + graphFilePath + '">"'+domainModelInfo.outputDir+"/"+domainModelInfo.svgGraphFile+'"';
//							console.log(command);
							var child = exec(command, function(error, stdout, stderr) {
								if (error !== null) {
									console.log('exec error: ' + error);
								}

								console.log("domain model is drawed!");
								generateDomainModelStatisticalCharts(domainModelAnalytics, callbackfunc);
							});
						})

					});

				});

			});
		});

	}

	function generateDomainModelStatisticalCharts(domainModelAnalytics, callbackfunc){
		var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/DomainModelAnalyticsScript.R "'+domainModelAnalytics.OutputDir+"/"+domainModelAnalytics.ElementAnalyticsFileName+'" "'+domainModelAnalytics.OutputDir+"/"+domainModelAnalytics.AttributeAnalyticsFileName+'" "'+domainModelAnalytics.OutputDir+"/"+domainModelAnalytics.OperationAnalyticsFileName+'" "'+domainModelAnalytics.OutputDir+'" "."';
//		console.log(command);
		var child = exec(command, function(error, stdout, stderr) {

			if (error !== null) {
//				console.log('exec error: ' + error);
				console.log('exec error: model id=' + domainModelAnalytics._id)
				if(callbackfunc !== undefined){
					callbackfunc(false);
				}
			}
			if(callbackfunc !== undefined){
				callbackfunc(domainModelAnalytics);
			}
		});
	}

	function analyseUseCase(useCaseInfo, callbackfunc){
		if(!callbackfunc){
			return useCaseInfo.UseCaseAnalytics;
		}
//		Analyse use case from scratch
//		console.log('analyse use case');
//		console.log(useCaseInfo);
		var useCaseAnalytics = initUseCaseAnalytics(useCaseInfo);
		useCaseInfo.UseCaseAnalytics = useCaseAnalytics;
//
//		console.log(useCaseInfo);
		for(var i in useCaseInfo.Diagrams){
			var diagram = useCaseInfo.Diagrams[i];
			//refresh diagram analytics
			if(useCaseProcessor.processDiagram(diagram, useCaseInfo)){
				var diagramAnalytics = initDiagramAnalytics(diagram);
				diagram.DiagramAnalytics = diagramAnalytics;
//				diagram.DiagramAnalytics = initDiagramAnalytics(diagram);
				diagram.DiagramAnalytics.Paths = [];
				diagram.DiagramAnalytics.PathAnalyticsFileName = 'pathsAnalytics.csv';
				useCaseAnalytics.Diagrams.push(diagram);

				//element analytics
				var totalDegree = 0;
				var elementNum = 0;
				var totalLinks = 0;
				var actorNum = 0;
				var boundaryNum = 0;
				var controlNum = 0;
				var entityNum = 0;
				
//				console.log(diagram);
				// to remove the duplicates across the diagrams.
				for(var j in diagram.Elements){
					var Element = diagram.Elements[j]; //tag: elements
//					console.log(Element);
					//process element to determine if it is duplicate
					if(useCaseProcessor.processElement(Element, diagram, useCaseInfo)){
						elementNum++;
						diagramAnalytics.Elements.push(Element);
//						diagramAnalytics.Elements.push({Name:Element.Name, OutboundNumber: Element.OutboundNumber, InboundNumber:Element.InboundNumber, Type:Element.Type});
						totalDegree += Element.InboundNumber;
						var type = Element.Type;
						if(type === "actor"){
							actorNum++;
						}
						else if(type === "boundary"){
							boundaryNum++;
						}
						else if(type === "control"){
							controlNum++;
						}
						else if(type === "entity"){
							entityNum++;
						}
						totalLinks += Element.InboundNumber;
					}
				}

				diagramAnalytics.TotalDegree = totalDegree;
				diagramAnalytics.ElementNum = elementNum;
				diagramAnalytics.TotalLinks = totalLinks;
				diagramAnalytics.ActorNum = actorNum;
				diagramAnalytics.BoundaryNum = boundaryNum;
				diagramAnalytics.ControlNum = controlNum;
				diagramAnalytics.EntityNum = entityNum;
				if(diagramAnalytics.ElementNum !== 0){
					diagramAnalytics.AvgDegree = diagramAnalytics.TotalDegree/diagramAnalytics.ElementNum;
				}
				else{
					diagramAnalytics.AvgDegree = 0;
				}

				//path analytics
				var totalPathLength = 0;
				var PathNum = 0
				var INT = 0;
				var DM = 0;
				var CTRL = 0;
				var EXTIVK = 0;
				var EXTCLL = 0;
				var TRAN_NA = 0;
				var NT = 0;
				var EI = 0;
				var EO = 0;
				var EQ = 0;
				var FUNC_NA = 0;
				var FN = 0;
				
				for(var j in diagram.Paths){
					var Path = diagram.Paths[j];
					if(useCaseProcessor.processPath(Path, diagram, useCaseInfo)){
//						console.log('--------Process Path-------');	
						PathNum++;
//						diagramAnalytics.Paths.push({Path:path.PathStr, Operations:path.Operations, PathLength: path.Elements.length});
						diagramAnalytics.Paths.push(Path);
						var operations = Path.Operations;
						totalPathLength += Path.Elements.length;
//						var functionalOperations = operations.functional;
//						if(functionalOperations.indexOf('EI') > -1){
//							EI++;
//							FN++;
//						}
//						if(functionalOperations.indexOf('EQ') > -1){
//							EQ++;
//							FN++;
//						}
//						if(functionalOperations.indexOf('EO') > -1){
//							EO++;
//							FN++;
//						}
//						if(functionalOperations.indexOf('FUNC_NA') > -1){
//							FUNC_NA++;
//						}
						
						var transactionalOperations = operations.transactional;
						if(transactionalOperations.indexOf("EI") > -1){
							EI++;
						}
						if(transactionalOperations.indexOf("EQ") > -1){
							EQ++;
						}
						if(transactionalOperations.indexOf("DM") > -1){
							DM++;
						}
						if(transactionalOperations.indexOf("INT") > -1){
							INT++;
						}
						if(transactionalOperations.indexOf("CTRL") > -1){
							CTRL++;
						}
						if(transactionalOperations.indexOf("EXTIVK") > -1){
							EXTIVK++;
						}
						if(transactionalOperations.indexOf("EXTCLL") > -1){
							EXTCLL++;
						}
						if(transactionalOperations.indexOf("TRAN_NA") > -1){
							TRAN_NA++;
						}
						else {
							NT ++;
						}
						
					}
				}
			
				diagramAnalytics.TotalPathLength = totalPathLength;
				
				diagramAnalytics.INT = INT;
				diagramAnalytics.DM = DM;
				diagramAnalytics.CTRL = CTRL;
				diagramAnalytics.EXTIVK = EXTIVK;
				diagramAnalytics.EXTCLL = EXTCLL;
				diagramAnalytics.TRAN_NA = TRAN_NA;
				diagramAnalytics.NT = NT;
//				diagramAnalytics.NWT = NWT;
//				diagramAnalytics.NWT_DE = NWT_DE;
				diagramAnalytics.EI = EI;
				diagramAnalytics.EO = EO;
				diagramAnalytics.EQ = EQ;
				diagramAnalytics.FUNC_NA = FUNC_NA;
				diagramAnalytics.FN = FN;
				diagramAnalytics.PathNum = PathNum;
				
//				console.log(diagramAnalytics);
				
				diagramAnalytics.AvgPathLength = diagramAnalytics.PathNum == 0? 0 : diagramAnalytics.TotalPathLength/diagramAnalytics.PathNum;
				
				useCaseAnalytics.TotalDegree += diagramAnalytics.TotalDegree;
				useCaseAnalytics.ElementNum += diagramAnalytics.ElementNum;
				useCaseAnalytics.AvgDegree += diagramAnalytics.AvgDegree;
				useCaseAnalytics.TotalLinks += diagramAnalytics.TotalLinks;
				useCaseAnalytics.ActorNum += diagramAnalytics.ActorNum;
				useCaseAnalytics.BoundaryNum += diagramAnalytics.BoundaryNum;
				useCaseAnalytics.ControlNum += diagramAnalytics.ControlNum;
				useCaseAnalytics.EntityNum += diagramAnalytics.EntityNum;
				useCaseAnalytics.TotalPathLength += diagramAnalytics.TotalPathLength;
				useCaseAnalytics.PathNum += diagramAnalytics.PathNum;
				useCaseAnalytics.INT += diagramAnalytics.INT;
				useCaseAnalytics.DM += diagramAnalytics.DM;
				useCaseAnalytics.CTRL += diagramAnalytics.CTRL;
				useCaseAnalytics.EXTIVK += diagramAnalytics.EXTIVK;
				useCaseAnalytics.EXTCLL += diagramAnalytics.EXTCLL;
				useCaseAnalytics.TRAN_NA += diagramAnalytics.TRAN_NA;
				useCaseAnalytics.NT += diagramAnalytics.NT;
//				useCaseAnalytics.NWT_DE += diagramAnalytics.NWT_DE;
//				useCaseAnalytics.NWT += diagramAnalytics.NWT;
				useCaseAnalytics.EI += diagramAnalytics.EI;
				useCaseAnalytics.EO += diagramAnalytics.EO;
				useCaseAnalytics.EQ += diagramAnalytics.EQ;
				useCaseAnalytics.FUNC_NA += diagramAnalytics.FUNC_NA;
				useCaseAnalytics.FN += diagramAnalytics.FN;
			}
			
			useCaseAnalytics.DiagramNum ++;
		}

		useCaseAnalytics.AvgDegree = useCaseAnalytics.ElementNum == 0? 0: useCaseAnalytics.TotalDegree/useCaseAnalytics.ElementNum;
		useCaseAnalytics.AvgPathLength = useCaseAnalytics.PathNum == 0? 0: useCaseAnalytics.TotalPathLength/useCaseAnalytics.PathNum;
		useCaseAnalytics.ArchDiff = useCaseAnalytics.AvgDegree*useCaseAnalytics.AvgPathLength;
		
//		console.log(modelXMLParser);
		umlEvaluator.redoUseCaseEvaluation(useCaseInfo);

//		useCaseInfo.UseCaseAnalytics = useCaseAnalytics;

		if(callbackfunc){
			dumpUseCaseAnalytics(useCaseInfo, callbackfunc);
		}

//		console.log(useCaseAnalytics);

		return useCaseInfo.UseCaseAnalytics;
	}

	function dumpUseCaseAnalytics(useCaseInfo, callbackfunc){
//		console.log("dump useCase analytics");
		var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
		var pathAnalyticsStr = "id,path,functional,transactional,path_length, boundry_num, control_num, entity_num, actor_num, diagram,useCase\n";
		var pathNum = 0;
		var expandedPathAnalyticsStr = "id,path,transactional,path_length,diagram,useCase\n";
		var expandedPathNum = 0;
		var elementAnalyticsStr = "id,element,type,outboundDegree,inboundDegree,diagram,useCase\n";
		var elementNum = 0;
		var diagramAnalyticsStr = "id,diagram,path_num,interface_operation_num,data_operation_num,control_operation_num,partial_matched_num,EI,EO,EQ\n";
		var diagramNum = 0;

		for(var i in useCaseAnalytics.Diagrams){
			var diagramAnalytics = useCaseAnalytics.Diagrams[i].DiagramAnalytics;
			for(var j in diagramAnalytics.Paths){
				var path = diagramAnalytics.Paths[j];
				pathNum++;
				pathAnalyticsStr += pathNum+","+
				path.PathStr.replace(/,/gi, "")+","+ 
				path.Operations.functional.join('|')+","+ 
				path.Operations.transactional.join('|')+","+ 
				path.Elements.length+","+
				path.boundryNum+","+
				path.controlNum+","+
				path.entityNum+","+
				path.actorNum+","+
				diagramAnalytics.Name+","+
				useCaseAnalytics.Name+"\n";
			}
			
			for(var j in diagramAnalytics.Paths){
				for(var k in diagramAnalytics.Paths[j].Operations.transactional){
				var transactionalOperation = diagramAnalytics.Paths[j].Operations.transactional[k];
				expandedPathNum++;
				expandedPathAnalyticsStr += expandedPathNum+","+
				diagramAnalytics.Paths[j].PathStr.replace(/,/gi, "")+","+ 
				transactionalOperation+","+ 
				diagramAnalytics.Paths[j].Elements.length+","+ 
				diagramAnalytics.Name+","+ 
				useCaseAnalytics.Name+"\n";
				}
			}

			for(var j in diagramAnalytics.Elements){
				var element = diagramAnalytics.Elements[j];
				elementNum++;
				elementAnalyticsStr += elementNum+","+ 
				element.Name.replace(/,/gi, "")+","+ 
				element.Type.replace(/,/gi, "")+","+ 
				element.OutboundNumber+","+ 
				element.InboundNumber+","+
				diagramAnalytics.Name+","+
				useCaseAnalytics.Name+","+"\n";
			}

			diagramNum++;
			diagramAnalyticsStr +=
				diagramNum+","+
				diagramAnalytics.Name+","+
				diagramAnalytics.PathNum+","+
				diagramAnalytics.INT+","+
				diagramAnalytics.DM+","+
				diagramAnalytics.CTRL+","+
				diagramAnalytics.TRAN_NA+","+
				diagramAnalytics.EI+","+
				diagramAnalytics.EO+","+
				diagramAnalytics.EQ+"\n"
		}

		mkdirp(useCaseAnalytics.OutputDir, function(err) { 
			if(err) {
				console.log(err);
				if(callbackfunc !== undefined){
					callbackfunc(false);
				}
				return;
			}
			fs.writeFile(useCaseAnalytics.OutputDir+"/"+useCaseAnalytics.DiagramAnalyticsFileName, diagramAnalyticsStr, function(err) {
				if(err) {
					console.log(err);
					if(callbackfunc !== undefined){
						callbackfunc(false);
					}
					return;
				}
				fs.writeFile(useCaseAnalytics.OutputDir+"/"+useCaseAnalytics.PathAnalyticsFileName, pathAnalyticsStr, function(err) {
					if(err) {
						console.log(err);
						if(callbackfunc !== undefined){
							callbackfunc(false);
						}
						return;
					}
					
					fs.writeFile(useCaseAnalytics.OutputDir+"/expandedPathAnalytics.csv", expandedPathAnalyticsStr, function(err) {
						if(err) {
							console.log(err);
							if(callbackfunc !== undefined){
								callbackfunc(false);
							}
							return;
						}

					console.log("Paths Analytics were saved!");
//					console.log(useCaseAnalytics.OutputDir+"/"+useCaseAnalytics.PathAnalyticsFileName);

					fs.writeFile(useCaseAnalytics.OutputDir+"/"+useCaseAnalytics.ElementAnalyticsFileName, elementAnalyticsStr, function(err){
						if(err) {
							console.log(err);
							if(callbackfunc !== undefined){
								callbackfunc(false);
							}
							return; 
						}

						console.log("Elements Analytics were saved!");
						generateUseCaseStatisticalCharts(useCaseAnalytics, callbackfunc);

					});
					});
				});
			});

		});
	}


	function generateUseCaseStatisticalCharts(useCaseAnalytics, callbackfunc){
		var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/UseCaseAnalyticsScript.R "'+useCaseAnalytics.OutputDir+"/"+useCaseAnalytics.ElementAnalyticsFileName+'" "'+useCaseAnalytics.OutputDir+"/"+useCaseAnalytics.PathAnalyticsFileName+'" "'+useCaseAnalytics.OutputDir+'/expandedPathAnalytics.csv" "'+useCaseAnalytics.OutputDir+'" "."';
//		console.log(command);
		var child = exec(command, function(error, stdout, stderr) {

			if (error !== null) {
				console.log('exec error: ' + error);
//				console.log('exec error: useCase id=' + useCaseAnalytics._id)
				if(callbackfunc !== undefined){
					callbackfunc(false);
				}
			} 

			if(callbackfunc !== undefined){
				callbackfunc(useCaseAnalytics);
			}
		});
	}

	function initModelAnalytics(umlModelInfo){
		return {
			_id:umlModelInfo._id,
			OutputDir: umlModelInfo.outputDir,
			AccessDir: umlModelInfo.accessDir,
			Name:umlModelInfo.umlModelName,
			AvgPathLength : 0,
			TotalPathLength: 0,
			PathNum: 0,
			TotalLinks: 0,
			ActorNum: 0,
			BoundaryNum: 0,
			ControlNum: 0,
			EntityNum: 0,
			TotalDegree : 0,
			ElementNum: 0,
			AvgDegree: 0,
			UseCaseNum: 0,
			DiagramNum: 0,
			ClassNum: 0,
			DM: 0,
			INT : 0,
			CTRL: 0,
			EXTIVK: 0,
			EXTCLL: 0,
			TRAN_NA: 0,
			NT: 0,
//			NWT: 0,
//			NWT_DE: 0,
//			UEUCW:0,
//			UEXUCW:0,
//			UAW:0,	//These attributes are not set, added by the specific evaluators
			EI: 0,
			EO: 0,
			EQ: 0,
			FUNC_NA: 0,
			FN: 0,
//			ILF: 0,
//			EIF: 0,
			TCF:0,
			EF:0,
//			AFP:0,
//			VAF:0,
			Effort:0,
			PathAnalyticsFileName:"pathAnalytics.csv",
			ElementAnalyticsFileName:"elementAnalytics.csv",
			UseCaseAnalyticsFileName:"useCaseAnalytics.csv",
			DomainModelAnalyticsFileName: "domainModelAnalytics.csv",
			ModelEvaluationForUseCasesFileName:"useCasesEvaluation.csv",
		};
	}

	function initDomainModelAnalytics(domainModel){
		return {
			OutputDir:domainModel.outputDir,
			AccessDir:domainModel.accessDir,
//			ILF: 0,
//			EIF: 0,
			AttributeNum: 0,
			OperationNum: 0,
			ElementNum: 0,
			ClassNum:0,
			// store the filtered diagrams.
			DiagramNum:0,
			Diagrams: [],
			ElementAnalyticsFileName: 'elementAnalytics.csv',
			AttributeAnalyticsFileName: 'attributeAnalytics.csv',
			OperationAnalyticsFileName: 'operationAnalytics.csv'
		};
	}

	function initUseCaseAnalytics(useCaseInfo){
		return {
			_id:useCaseInfo._id,
			OutputDir:useCaseInfo.outputDir,
			AccessDir:useCaseInfo.accessDir,
			Name: useCaseInfo.Name,
			AvgPathLength : 0,
			TotalPathLength: 0,
			PathNum: 0,
			TotalLinks: 0,
			ActorNum: 0,
			BoundaryNum: 0,
			ControlNum: 0,
			EntityNum: 0,
			ElementNum: 0,
			TotalDegree : 0,
			AvgDegree: 0,
			UseCaseNum: 0,
			DiagramNum: 0,
//			UEUCW:0,
//			UEXUCW:0,
			INT : 0,
			DM: 0,
			CTRL: 0,
			EXTIVK: 0,
			EXTCLL: 0,
			TRAN_NA: 0,
			NT:0,
//			NWT:0,
//			NWT_DE:0,
			CCSS: 0,
//			IT: 0,
			ArchDiff:0,
//			ILF: 0,
//			EIF: 0,
			EI: 0,
			EO: 0,
			EQ: 0,
			FUNC_NA: 0,
			FN:0,
			Effort: 0,
			// store the filtered diagrams
			Diagrams: [],
			//elements and paths are kept in diagramAnalytics
//			Elements: [],
//			Paths: [],
			PathAnalyticsFileName : "pathAnalytics.csv",
			ElementAnalyticsFileName : "elementAnalytics.csv",
			DiagramAnalyticsFileName: "diagramAnalytics.csv"
		};
	}

	function initDiagramAnalytics(diagramInfo){
		// storing processed element and path information, etc.
		// element is necessary, path is not necessary.
		return {
			_id:diagramInfo._id,
			Name:diagramInfo.Name,
			type: diagramInfo.Type,
			OutputDir: diagramInfo.outputDir,
			AccessDir: diagramInfo.accessDir,
			ElementNum: 0,
			Elements: [],
			ElementAnalyticsFileName: 'elementAnalytics.csv'
		}
	}

	function initRepoAnalytics(repoInfo){
		return {
			_id: repoInfo._id,
			OutputDir: repoInfo.outputDir,
			AccessDir: repoInfo.accessDir,
			AvgPathLength : 0,
			TotalPathLength: 0,
			PathNum: 0,
			TotalLinks: 0,
			ActorNum: 0,
			BoundaryNum: 0,
			ControlNum: 0,
			EntityNum: 0,
			TotalDegree : 0,
			ElementNum: 0,
			AvgDegree: 0,
			FUNC_NA: 0,
			FN:0,
			EI: 0,
			EO: 0,
			EQ: 0,
			INT : 0,
			DM: 0,
			CTRL: 0,
			TRAN_NA: 0,
			EXTIVK: 0,
			EXTCLL: 0,
			NT:0,
			CCSS: 0,
			AvgPathLength:0,
			AvgDegree:0,
			ModelEvaluationFileName:"modelEvaluation.csv",
			ElementAnalyticsFileName:"elementAnalytics.csv",
			PathAnalyticsFileName:"pathAnalytics.csv",
			UseCaseAnalyticsFileName:"useCaseAnalytics.csv",
			DomainModelAnalyticsFileName: "domainModelAnalytics.csv",
			RepoEvaluationForUseCasesFileName : "useCasesEvaluation.csv",
			RepoEvaluationForModelsFileName:"modelsEvaluation.csv"
		}
	}
	
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
						DomainModelAnalytics: initDomainModelAnalytics(umlModelInfo)
				};
				umlModelInfo.ModelAnalytics = initModelAnalytics(umlModelInfo);

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
								useCase.UseCaseAnalytics = initUseCaseAnalytics(useCase);
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
			analyseRepo: analyseRepo,
			analyseModel: analyseModel,
			analyseUseCase: analyseUseCase,
			dumpModelAnalytics: dumpModelAnalytics,
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
			initRepoAnalytics:initRepoAnalytics
	}
}());