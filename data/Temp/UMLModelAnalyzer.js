(function() {
	/**
	 *  Work as a test stub
	 */

	var modelXMLParser = require('./model_platforms/ea/XMI2.1Parser.js');
	var diagramDrawer = require('./domainmodel/robustnessdiagram/RobustnessDiagramDrawer.js');
	var pathProfiler = require('./domainmodel/robustnessdiagram/RobustnessDiagramProfiler.js');
	var diagramProcessor = require('./domainmodel/robustnessdiagram/RobustnessDiagramProcessor.js');
	var mkdirp = require('mkdirp');
	var fs = require('fs');
	var exec = require('child_process').exec;

//	var exec = require('child_process').exec;
	
	function analyseRepo(repo, callbackfunc){
		
//		console.log("here is the repo:");
//		console.log(repo);
		
		var repoAnalytics = {
				_id: null,
				OutputDir: null,
				AccessDir: null,
				AvgPathLength : 0,
				TotalPathLength: 0,
				PathNum: 0,
				TotalLinks: 0,
				ActorNum: 0,
				BoundaryNum: 0,
				ControlNum: 0,
				TotalDegree : 0,
				ElementNum: 0,
				AvgDegree: 0,
				NumInterfaceOperation : 0,
				NumDataOperation: 0,
				NumControlOperation: 0,
				NumPartialMatched: 0,
				AvgPathLength:0,
				AvgDegree:0,
				RepoEvaluationFileName:"repoEvaluation.csv",
				ModelEvaluationFileName:"modelEvaluation.csv",
				ElementAnalyticsFileName:"elementAnalytics.csv",
				PathAnalyticsFileName:"pathAnalytics.csv"
		}
		
		
		if(repo === undefined || repo === null){
			return repoAnalytics;
		}
		
		repoAnalytics._id = repo._id;
		repoAnalytics.OutputDir = repo.outputDir;
		repoAnalytics.AccessDir = repo.accessDir;
		
		for(var i in repo.models){
			var modelInfo = repo.models[i];
			
			if(modelInfo.ModelAnalytics === undefined){
				if(callbackfunc !== undefined){
				modelInfo.ModelAnalytics = analyseModel(modelInfo, function(){
					console.log("model analysis complete");
				});
				}
				else{
					modelInfo.ModelAnalytics = analyseModel(modelInfo);
				}
			}
			
			var modelAnalytics = modelInfo.ModelAnalytics;
			
			repoAnalytics.TotalPathLength += modelAnalytics.TotalPathLength;
			repoAnalytics.PathNum += modelAnalytics.PathNum;
			repoAnalytics.NumInterfaceOperation += modelAnalytics.NumInterfaceOperation;
			repoAnalytics.NumDataOperation += modelAnalytics.NumDataOperation;
			repoAnalytics.NumControlOperation += modelAnalytics.NumControlOperation;
			repoAnalytics.NumPartialMatched += modelAnalytics.NumPartialMatched;
			
			repoAnalytics.TotalLinks += modelAnalytics.TotalLinks;
			repoAnalytics.ActorNum += modelAnalytics.ActorNum;
			repoAnalytics.BoundaryNum += modelAnalytics.BoundaryNum;
			repoAnalytics.ControlNum += modelAnalytics.EntityNum;
			
			repoAnalytics.TotalDegree += modelAnalytics.TotalDegree;
			repoAnalytics.ElementNum += modelAnalytics.ElementNum;
		}
		
		repoAnalytics.AvgPathLength = repoAnalytics.TotalPathLength/repoAnalytics.PathNum;
		repoAnalytics.AvgDegree = repoAnalytics.TotalDegree/repoAnalytics.ElementNum;
		
		repo.RepoAnalytics = repoAnalytics;
		
		if(callbackfunc !== undefined){
		dumpRepoAnalytics(repo, callbackfunc);
		}
		return repo.RepoAnalytics;
	}
	
	function dumpRepoAnalytics(repo, callbackfunc){
		var repoAnalytics = repo.RepoAnalytics;
		console.log(repoAnalytics.OutputDir);
		
		var pathAnalytics = "id,path,semantics,path_length,diagram,model\n";
		var pathNum = 0;
		var elementAnalytics = "id,element,type,outboundDegree,inboundDegree,diagram,model\n";
		var elementNum = 0;
		
		
		for(var i in repo.models){
		  var model = repo.models[i];
		  var modelAnalytics = model.ModelAnalytics;
		  for(var j in model.diagrams){
//			console.log("dump diagram Analytics");
			var diagramAnalytics = model.diagrams[j].DiagramAnalytics;
			for(var pathId in diagramAnalytics.Paths){
			pathNum++;
			pathAnalytics += pathNum+","+
			diagramAnalytics.Paths[pathId].Path.replace(/,/gi, "")+","+ 
			diagramAnalytics.Paths[pathId].Type.replace(/,/gi, "")+","+ 
			diagramAnalytics.Paths[pathId].PathLength+","+ 
			diagramAnalytics.Name.replace(/,/gi, "")+","+ 
			modelAnalytics.Name.replace(/,/gi, "")+"\n";
			}
			
			for(var elementId in diagramAnalytics.Elements){
			elementNum++;
			elementAnalytics += elementNum+","+ 
			diagramAnalytics.Elements[elementId].Name.replace(/,/gi, "")+","+ 
			diagramAnalytics.Elements[elementId].Type.replace(/,/gi, "")+","+ 
			diagramAnalytics.Elements[elementId].OutboundNumber+","+ 
			diagramAnalytics.Elements[elementId].InboundNumber+"\n"+
			diagramAnalytics.Name.replace(/,/gi, "")+","+ 
			modelAnalytics.Name.replace(/,/gi, "")+"\n";
			}
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
			
		fs.writeFile(repoAnalytics.OutputDir+"/"+repoAnalytics.PathAnalyticsFileName, pathAnalytics, function(err) {
		    if(err) {
		    	console.log(err);
		    	if(callbackfunc !== undefined){
			    	callbackfunc(false);
					}
		        return;
		    }

//		    console.log("Paths Analytics were saved!");
		    
		    fs.writeFile(repoAnalytics.OutputDir+"/"+repoAnalytics.ElementAnalyticsFileName, elementAnalytics, function(err){
				 if(err) {
					 	console.log(err);
					 	if(callbackfunc !== undefined){
					    	callbackfunc(false);
							}
				        return; 
				    }
				 	
//				    console.log("Elements Analytics were saved!");
				    
				    generateRepoStatisticalCharts(repoAnalytics, callbackfunc);
				  
			});
		});
		

		});
	}
	
	
	function generateRepoStatisticalCharts(repoAnalytics, callbackfunc){
		var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/RepoAnalyticsScript.R "'+repoAnalytics.OutputDir+"/"+repoAnalytics.ElementAnalyticsFileName+'" "'+repoAnalytics.OutputDir+"/"+repoAnalytics.PathAnalyticsFileName+'" "'+repoAnalytics.OutputDir+"/"+'" "."';
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
	
	
	function dumpRepoEvaluation(repo, simulation, callbackfunc, index, header){
//		var modelEvaluation = "PROJ,UC,CCSS,UEUCW,IT,UEXUCW,UAW,TCF,ECF,EUCP,EXUCP,ILF,ELF,EI,EO,EQ,ADD,CFP,DFP,VAF,AFPC\n";
		var repoAnalytics = repo.RepoAnalytics;
		var repoEvaluationStr = "NUM,PROJ,UEUCW,UEXUCW,UAW,TCF,ECF,EUCP,EXUCP,AFP,VAF,AFPC,PH\n";
		var repoEvaluations = [];
		if(header !== undefined && header === false){
			repoEvaluationStr = "";
		}
		var modelEvaluation = "";
		var repoNum = 0;
		var modelNum = 0;
		var modelEvaluationHeader = false;
		if(index !== undefined){
			repoNum = index;
		}
		
		for(var i in repo.models){
//			console.log("dump diagram Analytics");
			repoNum++;
			var model = repo.models[i];
			var modelAnalytics = model.ModelAnalytics;
			
			if(repoNum === 1){
				modelEvaluationHeader = true;
			} else{
				modelEvaluationHeader = false;
			}
			modelEvaluationResult = dumpModelEvaluation(model, simulation, function(){}, modelNum, modelEvaluationHeader);
			modelNum = modelEvaluationResult.index;
			modelEvaluation += modelEvaluationResult.modelEvaluation;
			
			
			var repoEvaluation = {
					NUM: repoNum,
					PROJ: modelAnalytics.Name.replace(/,/gi, ""),
					UEUCW: modelAnalytics.UEUCW,
					UEXUCW: modelAnalytics.UEXUCW,
					UAW: modelAnalytics.UAW,
					TCF: modelAnalytics.TCF,
					ECF: modelAnalytics.ECF,
					EUCP: (parseFloat(modelAnalytics.UEUCW)+parseFloat(modelAnalytics.UAW))*parseFloat(modelAnalytics.TCF)*parseFloat(modelAnalytics.ECF),
					EXUCP: (parseFloat(modelAnalytics.UEXUCW)+parseFloat(modelAnalytics.UAW))*parseFloat(modelAnalytics.TCF)*parseFloat(modelAnalytics.ECF),
					AFP: modelAnalytics.AFP,
					VAF: modelAnalytics.VAF,
					AFPC: parseFloat(modelAnalytics.AFP)*parseFloat(modelAnalytics.VAF),
					PH: modelAnalytics.PH,
					actual:modelAnalytics.PH
				};
			
			repoEvaluationStr +=
			repoEvaluation.NUM+","+
		    repoEvaluation.PROJ+","+
			repoEvaluation.UEUCW+","+
			repoEvaluation.UEXUCW+","+
			repoEvaluation.UAW+","+
			repoEvaluation.TCF+","+
			repoEvaluation.ECF+","+
			//EUCP
			repoEvaluation.EUCP+","+
			//EXUCP
			repoEvaluation.EXUCP+","+
			repoEvaluation.AFP+","+
			repoEvaluation.VAF+","+
			//AFPC
			repoEvaluation.AFPC+","+
			repoEvaluation.PH+"\n";
			
			repoEvaluations.push(repoEvaluation);
			
		}
		
		var repoEvaluationResult = {index: repoNum, repoEvaluationStr: repoEvaluationStr, repoEvaluations:repoEvaluations};
		
			
		mkdirp(repoAnalytics.OutputDir, function(err) { 
			if(err) {
				console.log(err);
				if(callbackfunc !== undefined){
		    	callbackfunc(false);
				}
		        return;
		    }
			
		    
		    fs.writeFile(repoAnalytics.OutputDir+"/"+repoAnalytics.RepoEvaluationFileName, repoEvaluationStr, function(err){
				 if(err) {
					 	console.log(err);
					 	if(callbackfunc !== undefined){
					    	callbackfunc(false);
							}
				        return; 
				    }
				 fs.writeFile(repoAnalytics.OutputDir+"/"+repoAnalytics.ModelEvaluationFileName, modelEvaluation, function(err){
					 if(err) {
						 	console.log(err);
						 	if(callbackfunc !== undefined){
						    	callbackfunc(false);
								}
					        return; 
					    }
					 	
					    console.log("Repo Evaluation were saved!");
//					    generateModelStatisticalCharts(modelAnalytics, callbackfunc);
					    if(callbackfunc !== undefined){

							console.log(repoAnalytics);
					    	callbackfunc(repoEvaluationResult, repoAnalytics);
						}
					  
				});
			});
		

		});
		
		return repoEvaluationResult;
	}
	
	//if callback != null, dump model info.
	function analyseModel(modelInfo, callbackfunc){
		// for now only iterate through the robustness diagrams
		var modelAnalytics = {
				_id:modelInfo._id,
				OutputDir: modelInfo.outputDir,
				AccessDir: modelInfo.accessDir,
				Name:modelInfo.umlModelName,
				AvgPathLength : 0,
				TotalPathLength: 0,
				PathNum: 0,
				TotalLinks: 0,
				ActorNum: 0,
				BoundaryNum: 0,
				ControlNum: 0,
				TotalDegree : 0,
				ElementNum: 0,
				AvgDegree: 0,
				NumInterfaceOperation : 0,
				NumDataOperation: 0,
				NumControlOperation: 0,
				NumPartialMatched: 0,
				UEUCW:0,
				UEXUCW:0,
				UAW:0,
				TCF:0,
		        ECF:0,
		        AFP:0,
		        VAF:0,
		        PH:0,
		        AvgPathLength:0,
				AvgDegree:0,
		        PathAnalyticsFileName:"paths_profile.csv",
				ElementAnalyticsFileName:"elements_profile.csv",
				ModelEvaluationFileName:"evaluation.csv",
				Elements: [],
				Paths: [],
		};
				
		for(var i in modelInfo.diagrams){
			var diagram = modelInfo.diagrams[i];
			var diagramAnalytics = diagram.DiagramAnalytics;
			if(diagramAnalytics === undefined){
				if(callbackfunc !== undefined){
				// dump diagram analytics
				diagram.DiagramAnalytics = analyseDiagram(diagram, function(){
					console.log('diagram analysis is complete');
				});
				}
				else{
				//don't dump diagram analytics
					diagram.DiagramAnalytics = analyseDiagram(diagram);
				}
				diagramAnalytics = diagram.DiagramAnalytics;
			}
			
			modelAnalytics.TotalPathLength += diagramAnalytics.TotalPathLength;
			modelAnalytics.PathNum += diagramAnalytics.PathNum;
			modelAnalytics.NumInterfaceOperation += diagramAnalytics.NumInterfaceOperation;
			modelAnalytics.NumDataOperation += diagramAnalytics.NumDataOperation;
			modelAnalytics.NumControlOperation += diagramAnalytics.NumControlOperation;
			modelAnalytics.NumPartialMatched += diagramAnalytics.NumPartialMatched;
			
			modelAnalytics.TotalLinks += diagramAnalytics.TotalLinks;
			modelAnalytics.ActorNum += diagramAnalytics.ActorNum;
			modelAnalytics.BoundaryNum += diagramAnalytics.BoundaryNum;
			modelAnalytics.ControlNum += diagramAnalytics.EntityNum;
			
			modelAnalytics.TotalDegree += diagramAnalytics.TotalDegree;
			modelAnalytics.ElementNum += diagramAnalytics.ElementNum;
			
//			console.log(modelAnalytics);
			
			diagramAnalytics.Paths.forEach(function(path) {
			    modelAnalytics.Paths.push(path);
			});
			
			diagramAnalytics.Elements.forEach(function(element) {
			    modelAnalytics.Elements.push(element);
			});
			
		}
		
		modelAnalytics.AvgPathLength = modelAnalytics.TotalPathLength/modelAnalytics.PathNum;
		modelAnalytics.AvgDegree = modelAnalytics.TotalDegree/modelAnalytics.ElementNum;
		
		modelInfo.ModelAnalytics = modelAnalytics;
		
		if(callback !== undefined){
		dumpModelAnalytics(modelInfo, callbackfunc)
		}
		return modelInfo.ModelAnalytics;
	}
	
	
	function dumpModelAnalytics(model, callbackfunc){
		var modelAnalytics = model.ModelAnalytics;
		var pathAnalytics = "id,path,semantics,path_length, diagram,model\n";
		var pathNum = 0;
		var elementAnalytics = "id,element,type,outboundDegree, inboundDegree\n";
		var elementNum = 0;
		
		
		for(var i in model.diagrams){
//			console.log("dump diagram Analytics");
			var diagramAnalytics = model.diagrams[i].DiagramAnalytics;
			for(var pathId in diagramAnalytics.Paths){
			pathNum++;
			pathAnalytics += pathNum+","+
			diagramAnalytics.Paths[pathId].Path.replace(/,/gi, "")+","+ 
			diagramAnalytics.Paths[pathId].Type.replace(/,/gi, "")+","+ 
			diagramAnalytics.Paths[pathId].PathLength+","+ 
			diagramAnalytics+","+ 
			modelAnalytics._id+"\n";
			}
			
			for(var elementId in diagramAnalytics.Elements){
			elementNum++;
			elementAnalytics += elementNum+","+ 
			diagramAnalytics.Elements[elementId].Name.replace(/,/gi, "")+","+ 
			diagramAnalytics.Elements[elementId].Type.replace(/,/gi, "")+","+ 
			diagramAnalytics.Elements[elementId].OutboundNumber+","+ 
			diagramAnalytics.Elements[elementId].InboundNumber+"\n";
			}
		}
		
//		modelAnalytics.ElementAnalytics = elementAnalytics;
//		modelAnalytics.PathAnalytics = pathAnalytics;
		
		console.log("=================path,element===============");
		console.log(pathAnalytics);
		console.log(elementAnalytics);
		
		mkdirp(modelAnalytics.OutputDir, function(err) { 
			if(err) {
				console.log(err);
				if(callbackfunc !== undefined){
		    	callbackfunc(false);
				}
		        return;
		    }
			
		fs.writeFile(modelAnalytics.OutputDir+"/"+modelAnalytics.PathAnalyticsFileName, pathAnalytics, function(err) {
		    if(err) {
		    	console.log(err);
		    	if(callbackfunc !== undefined){
			    	callbackfunc(false);
					}
		        return;
		    }

//		    console.log("Paths Analytics were saved!");
		    
		    fs.writeFile(modelAnalytics.OutputDir+"/"+modelAnalytics.ElementAnalyticsFileName, elementAnalytics, function(err){
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
	}
	
	
	
	function generateModelStatisticalCharts(modelAnalytics, callbackfunc){
		var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/RepoAnalyticsScript.R "'+modelAnalytics.OutputDir+"/"+modelAnalytics.ElementAnalyticsFileName+'" "'+modelAnalytics.OutputDir+"/"+modelAnalytics.PathAnalyticsFileName+'" "'+modelAnalytics.OutputDir+"/"+'" "."';
//		console.log(command);
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
	
	
	
	function generateModelInfoCombination(modelInfo){
		var modelInfoCopy = JSON.parse(JSON.stringify(modelInfo));
		if(modelInformation.diagrams.length == 1){
			var modelInfoCombination = [];
			modelInfoCombination.push(modelInfoCopy);
			return modelInfoCombination;
		}
		var diagram = modelInfoCopy.diagrams.shift();
		var modelInfoCombination = generateModelInfoCombination(modelInfoCopy);
		var modelInfoCombinationCopy = JSON.parse(JSON.stringify(modelInfoCombination));
		for(var i in mdoelInfoCombinationCopy){
			var modelInfoInCombination = modelInfoCombinationCopy[i];
			modelInfoInCombination.diagrams.push(diagram);
		}
		modelInfoCombination.concat(modelInfoCombinationCopy);
		return modelInfoCombination;
	}
	
	
	function gnerateRandomModelInfo(modelInfo){
		//generate random numbers
		var randomModelInfo = JSON.parse(JSON.stringify(modelInfo));
		var diagramNum = randomModelInfo.diagrams.length;
		if(diagramNum < 2){
			return false;
		}
		var randomDigramNum = random(1, diagramNum);
		var diagramsToSelect = [];
		for(var i=0; i<randomDiagramNum; i++){
			diagramToSelect.push(i);
		}
		
		for(var i=0; i<diagramNum-randomDiagramNum; i++){
			var randomArrayLength = diagramsToSelect.length;
			var elementToDelete = random(0, randomArrayLength);
			diagramsToSelect.splice(elementToDelete, 1);
		}
		
		var diagrams = [];
		
		for(var i in diagramsToSelect){
			diagrams.push(modelInfo.diagrams[diagramsToSelect[i]])
		}
		
		randomModelInfo.diagrams = diagrams;
		
	}
	
	function random (low, high) {
	    return Math.random() * (high - low) + low;
	}
	
	function evaluateModel(modelInfo, index){

		var modelAnalytics = modelInfo.ModelAnalytics;
		var modelEvaluation = {
				PROJ: modelAnalytics.Name.replace(/,/gi, ""),
				UEUCW: modelAnalytics.UEUCW,
				UEXUCW: modelAnalytics.UEXUCW,
				UAW: modelAnalytics.UAW,
				TCF: modelAnalytics.TCF,
				ECF: modelAnalytics.ECF,
				EUCP: (parseFloat(modelAnalytics.UEUCW)+parseFloat(modelAnalytics.UAW))*parseFloat(modelAnalytics.TCF)*parseFloat(modelAnalytics.ECF),
				EXUCP: (parseFloat(modelAnalytics.UEXUCW)+parseFloat(modelAnalytics.UAW))*parseFloat(modelAnalytics.TCF)*parseFloat(modelAnalytics.ECF),
				AFP: modelAnalytics.AFP,
				VAF: modelAnalytics.VAF,
				AFPC: parseFloat(modelAnalytics.AFP)*parseFloat(modelAnalytics.VAF),
				PH: modelAnalytics.PH,
				actual:modelAnalytics.PH
		};
		
		return modelEvaluation;
	}
	
	
	function toModelEvaluationStr(modelEvaluation, startIndex, header){
//		var modelEvaluation = "PROJ,UC,CCSS,UEUCW,IT,UEXUCW,UAW,TCF,ECF,EUCP,EXUCP,ILF,ELF,EI,EO,EQ,ADD,CFP,DFP,VAF,AFPC\n";
		var modelEvaluationStr = "NUM,PROJ,UEUCW,UEXUCW,UAW,TCF,ECF,EUCP,EXUCP,AFP,VAF,AFPC,PH\n";
//		var usecaseEvaluationStr = "NUM,PROJ,UC,CCSS,UEUCW,IT,UEXUCW,ILF,ELF,EI,EO,EQ,ADD,CFP,DFP,AFP,PH\n";
		
//		if(header !== undefined && header === false){
		if(header){
			modelEvaluationStr = "";
		}
		
		var index = 0
		if(startIndex !== undefined){
			index = startIndex;
		}
		
		modelEvaluationStr += modelEvaluation.PROJ+","+
		modelEvaluation.UEUCW+","
		modelEvaluation.UEXUCW+","
		modelEvaluation.UAW+","
		modelEvaluation.TCF+","
		modelEvaluation.ECF+","
		modelEvaluation.EUCP+","
		modelEvaluation.EXUCP+","
		modelEvaluation.AFP+","
		modelEvaluation.VAF+","
		modelEvaluation.AFPC+","
		modelEvaluation.PH+"\n";
		
//		
//		mkdirp(modelAnalytics.OutputDir, function(err) { 
//			if(err) {
//				console.log(err);
//				if(callbackfunc !== undefined){
//		    	callbackfunc(false);
//				}
//		        return;
//		    }
//			
//		    
//		    fs.writeFile(modelAnalytics.OutputDir+"/"+modelAnalytics.ModelEvaluationFileName, modelEvaluation, function(err){
//				 if(err) {
//					 	console.log(err);
//					 	if(callbackfunc !== undefined){
//					    	callbackfunc(false);
//							}
//				        return; 
//				    }
//				 	
//				    console.log("Model Evaluation were saved!");
////				    generateModelStatisticalCharts(modelAnalytics, callbackfunc);
//				    
//
//				    if(callbackfunc !== undefined){
//				    	callbackfunc(modelAnalytics.AccessDir+"/"+modelAnalytics.ModelEvaluationFileName);
//					}
//			});
//		
//
//		});
//		
//		return {index: diagramNum, modelEvaluation: modelEvaluation};
		
		return modelEvaluationStr;
	}
	
	function analyseDiagram(diagramInfo, callbackfunc){
		
//		if(diagramInfo.diagramAnalytics !== undefined){
//			return diagramInfo.diagramAnalytics;
//		}
		
		var diagramAnalytics = {
				_id:diagramInfo._id,
				OutputDir:diagramInfo.outputDir,
				AccessDir:diagramInfo.accessDir,
				Name: diagramInfo.Name,
				AvgPathLength : 0,
				TotalPathLength: 0,
				PathNum: 0,
				TotalLinks: diagramInfo.TotalLinks,
				ActorNum: diagramInfo.ActorNum,
				BoundaryNum: diagramInfo.BoundaryNum,
				ControlNum: 0,
				TotalDegree : 0,
				ElementNum: diagramInfo.EntityNum,
				AvgDegree: 0,
				NumInterfaceOperation : 0,
				NumDataOperation: 0,
				NumControlOperation: 0,
				NumPartialMatched: 0,
				CCSS: 0,
				IT: 0,
				ILF: 0,
				ELF: 0,
				EI: 0,
				EO: 0,
				EQ: 0,
				PH: 0,
				Elements: [],
				Paths: [],
		};

		var elementSet=diagramInfo.Elements; // tag: elements
		var totalDegree = 0;
		var elementNum = 0;
		for(var i in elementSet){
			var Element = elementSet[i]; //tag: elements
//			console.log(Element);
			diagramAnalytics["Elements"].push({Name:Element.Name, OutboundNumber: Element.OutboundNumber, InboundNumber:Element.InboundNumber, Type:Element.Type});
			totalDegree += Element.InboundNumber;
			elementNum++;
		}
		
		var avgDegree = totalDegree/elementNum;
		
		diagramAnalytics['TotalDegree'] = totalDegree;
		diagramAnalytics['ElementNum'] = elementNum;
		diagramAnalytics["AvgDegree"] = avgDegree;
		
		var paths = diagramInfo.Paths;
//		console.log("...............paths.................");
		var totalPathLength = 0;
		var numInterfaceOperation = 0;
		var numDataOperation = 0;
		var numControlOperation = 0;
		var numPartialMatched = 0;
		for(var i in paths){
			var line = "";
//			console.log(paths[i]);
			for(var j in paths[i].Elements)
			{
				var element = paths[i]['Elements'][j];
				line += diagramInfo.Elements[element].Name+"->";
				totalPathLength++;
			}
			var path = paths[i];
//			console.dir(line + path.operation.semantics);
			diagramAnalytics["Paths"].push({Path:line, Type:path.operation.semantics, PathLength: paths[i]['Elements'].length});
			 
			if(path.operation.pattern === "pattern#1"){
				numDataOperation++;
			}
			else if(path.operation.pattern === "pattern#2"){
				numDataOperation++;
			}
			else if(path.operation.pattern === "pattern#3"){
				numInterfaceOperation++;
			}
			else if(path.operation.pattern === "pattern#4"){
				numControlOperation++;
			}
			else if(path.operation.pattern === "pattern#5"){
				numControlOperation++;
			}
			else{
				numPartialMatched++;
			}
		}
		var avgPathLength = totalPathLength/paths.length;
		
		diagramAnalytics.TotalPathLength = totalPathLength;
		diagramAnalytics.PathNum = paths.length;
		diagramAnalytics.AvgPathLength = avgPathLength;
		diagramAnalytics.NumInterfaceOperation = numInterfaceOperation;
		diagramAnalytics.NumDataOperation = numDataOperation;
		diagramAnalytics.NumControlOperation = numControlOperation;
		diagramAnalytics.NumPartialMatched = numPartialMatched;
		

		diagramAnalytics.PathAnalyticsFileName = "paths_profile.csv";
		diagramAnalytics.ElementAnalyticsFileName = "elements_profile.csv";
		
		diagramInfo.DiagramAnalytics = diagramAnalytics;
		
		if(callbackfunc !== undefined){
		dumpDiagramAnalytics(diagramInfo, callbackfunc);
		}
		
		return diagramInfo.DiagramAnalytics;
	}
	
	function dumpDiagramAnalytics(diagramInfo, callbackfunc){

		diagramAnalytics = diagramInfo.DiagramAnalytics;
		var pathAnalytics = "id,path,semantics,path_length, diagram,model\n";
		var pathNum = 0;
		var elementAnalytics = "id,element,type,outboundDegree, inboundDegree\n";
		var elementNum = 0;
		
			for(var pathId in diagramAnalytics.Paths){
			pathNum++;
			pathAnalytics += pathNum+","+
			diagramAnalytics.Paths[pathId].Path.replace(/,/gi, "")+","+ 
			diagramAnalytics.Paths[pathId].Type.replace(/,/gi, "")+","+ 
			diagramAnalytics.Paths[pathId].PathLength+","+ 
			diagramAnalytics+","+ 
			diagramAnalytics._id+"\n";
			}
			
			for(var elementId in diagramAnalytics.Elements){
			elementNum++;
			elementAnalytics += elementNum+","+ 
			diagramAnalytics.Elements[elementId].Name.replace(/,/gi, "")+","+ 
			diagramAnalytics.Elements[elementId].Type.replace(/,/gi, "")+","+ 
			diagramAnalytics.Elements[elementId].OutboundNumber+","+ 
			diagramAnalytics.Elements[elementId].InboundNumber+"\n";
			}
		
//			diagramAnalytics.ElementAnalytics = elementAnalytics;
//			diagramAnalytics.PathAnalytics = pathAnalytics;
		
			
//			console.log("=================path,element===============");
//			console.log(pathAnalytics);
//			console.log(elementAnalytics);
			
		mkdirp(diagramAnalytics.OutputDir, function(err) { 
			if(err) {
				console.log(err);
				if(callbackfunc !== undefined){
		    	callbackfunc(false);
				}
		        return;
		    }
			
		fs.writeFile(diagramAnalytics.OutputDir+"/"+diagramAnalytics.PathAnalyticsFileName, pathAnalytics, function(err) {
		    if(err) {
		    	console.log(err);
		    	if(callbackfunc !== undefined){
			    	callbackfunc(false);
					}
		        return;
		    }

//		    console.log("Paths Analytics were saved!");
		    
		    fs.writeFile(diagramAnalytics.OutputDir+"/"+diagramAnalytics.ElementAnalyticsFileName, elementAnalytics, function(err){
				 if(err) {
					 	console.log(err);
					 	if(callbackfunc !== undefined){
					    	callbackfunc(false);
							}
				        return; 
				    }
				 	
				    console.log("Elements Analytics were saved!");
				    generateDiagramStatisticalCharts(diagramAnalytics, callbackfunc);
				  
			});
		});
		

		});
	}
	
	
	function generateDiagramStatisticalCharts(diagramAnalytics, callbackfunc){
		var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/RepoAnalyticsScript.R "'+diagramAnalytics.OutputDir+"/"+diagramAnalytics.ElementAnalyticsFileName+'" "'+diagramAnalytics.OutputDir+"/"+diagramAnalytics.PathAnalyticsFileName+'" "'+diagramAnalytics.OutputDir+"/"+'" "."';
//		console.log(command);
		var child = exec(command, function(error, stdout, stderr) {

			if (error !== null) {
//				console.log('exec error: ' + error);
				console.log('exec error: diagram id=' + diagramAnalytics._id)
				if(callbackfunc !== undefined){
				callbackfunc(false);
				}
			} 
			
			if(callbackfunc !== undefined){
			callbackfunc(diagramAnalytics);
			}
		});
	}
	
	function evaluateDiagram(diagramInfo, projectName){
//		var usecaseEvaluationStr = "NUM,PROJ,UC,CCSS,UEUCW,IT,UEXUCW,ILF,ELF,EI,EO,EQ,ADD,CFP,DFP,AFP,PH\n";
		var diagramAnalytics = diagramInfo.diagramAnalytics;
		var diagramEvaluaion = {
				PROJ:projectName.replace(/,/gi, ""),
				UC:diagramAnalytics.Name.replace(/,/gi, ""),
				CCSS:diagramAnalytics.CCSS,
				UEUCW:diagramAnalytics.CCSS,
				IT:diagramAnalytics.IT,
				UEXUCW:diagramAnalytics.IT,
				ILF:diagramAnalytics.ILF,
				ELF:diagramAnalytics.ELF,
				EI:diagramAnalytics.EI,
				EO:diagramAnalytics.EO,
				EQ:diagramAnalytics.EQ,
				ADD:parseFloat(diagramAnalytics.ILF)+parseFloat(diagramAnalytics.ELF)+parseFloat(diagramAnalytics.EI)+parseFloat(diagramAnalytics.EO)+parseFloat(diagramAnalytics.EQ),
				CFP:0,
				DFP:0,
				AFP:parseFloat(diagramAnalytics.ILF)+parseFloat(diagramAnalytics.ELF)+parseFloat(diagramAnalytics.EI)+parseFloat(diagramAnalytics.EO)+parseFloat(diagramAnalytics.EQ),
				PH:diagramAnalytics.PH,
				actual:diagramAnalytics.PH
		};
		
		return diagramEvaluation;
	}
	
	function toDiagramEvaluationStr(diagramEvaluation, index, header){

		var usecaseEvaluationStr = "NUM,PROJ,UC,CCSS,UEUCW,IT,UEXUCW,ILF,ELF,EI,EO,EQ,ADD,CFP,DFP,AFP,PH\n";
		if(header){
			usecaseEvaluationStr = "";
		}
		
			usecaseEvaluationStr +=  index+","+
		    diagramEvaluation.PROJ+","+
		    diagramEvaluation.UC+","+
			diagramEvaluation.CCSS+","+
			//UEUCW
			diagramEvaluation.UEUCW+","+
			diagramEvaluation.IT+","+
			//UEUCW
			diagramEvaluation.UEXUCW+","+
			diagramEvaluation.ILF+","+
			diagramEvaluation.ELF+","+
			diagramEvaluation.EI+","+
			diagramEvaluation.EO+","+
			diagramEvaluation.EQ+","+
			//AFP
			diagramEvaluation.ADD+","+
			diagramEvaluation.CFP+","+
			diagramEvaluation.DFP+","+
			diagramEvaluation.AFP+","+
			diagramEvaluation.PH+"\n"
			
			return usecaseEvaluationStr;
	}
	
	
	module.exports = {
		getRepoAnalytics: analyseRepo,
		getModelAnalytics: analyseModel,
		getModelMeasures: function(modelInfo){
			return {
				eucp:12345,
				exucp:1234,
				fcp:1332
			}
		},
		getDiagramAnalytics: analyseDiagram,
		dumpDiagramAnalytics : function(diagramInfo){
			
		},
		dumpModelAnalytics: dumpModelAnalytics,
		dumpModelAnalyticsFromModelInfo: function(modelInfo, callbackfunc){
			var pathsProfile = "path,pattern\n";
			var diagramProfile = "";
			var Analytics = "Usecase, avg_degree, avg_path_length, architectural_diff, num_path, num_interface_operation, number_data_operation, number_control, number_partial_matched\n";
			
			var diagrams = modelInfo.diagrams;
			for(var i in diagrams) {
			var diagram = diagrams[i];
			pathsProfile += "\n";
			pathsProfile += diagram.Name+"\n";
			

//			console.log("...............profile................");
			
			diagramProfile += "Name,"+diagram.Name+"\n";
			diagramProfile += "TotalLinks,"+diagram.TotalLinks+"\n";
			diagramProfile += "ActorNum,"+diagram.ActorNum+"\n";
			diagramProfile += "BoundaryNum,"+diagram.BoundaryNum+"\n";
			diagramProfile += "ControlNum,"+diagram.EntityNum+"\n";
			diagramProfile += "Element, Outbound, Inbound\n";
			
			var elementSet=diagram.Elements; // tag: elements
			var totalDegree = 0;
			var elementNum = 0;
			for(var i in elementSet){
				var Element = elementSet[i]; //tag: elements
				diagramProfile += Element.Name+","+Element.OutboundNumber+","+Element.InboundNumber+"\n";
				totalDegree += Element.InboundNumber;
				elementNum++;
			}
			var avgDegree = totalDegree/elementNum;
			
			var paths = diagram.Paths;
			//console.log("...............paths.................");
			var totalPathLength = 0;
			var numInterfaceOperation = 0;
			var numDataOperation = 0;
			var numControlOperation = 0;
			var numPartialMatched = 0;
			for(var i in paths){
				var line = "";
				for(var j in paths[i].Elements)
				{
					var element = paths[i]['Elements'][j];
					line += diagram.Elements[element].Name+"->";
					totalPathLength++;
				}
				var path = paths[i];
//				console.dir(line + path.operation.semantics);
				pathsProfile += line + "," + path.operation.semantics + "\n";
				 
				if(path.operation.pattern === "pattern#1"){
					numDataOperation++;
				}
				else if(path.operation.pattern === "pattern#2"){
					numDataOperation++;
				}
				else if(path.operation.pattern === "pattern#3"){
					numInterfaceOperation++;
				}
				else if(path.operation.pattern === "pattern#4"){
					numControlOperation++;
				}
				else if(path.operation.pattern === "pattern#5"){
					numControlOperation++;
				}
				else{
					numPartialMatched++;
				}
			}
			var avgPathLength = totalPathLength/paths.length;
			
			Analytics += diagram.Name.replace(/,/gi, " ")+","+avgDegree+","+avgPathLength+","+(avgDegree*avgPathLength)+","+paths.length+","+numInterfaceOperation+","+numDataOperation+","+numControlOperation+","+numPartialMatched;
			Analytics += "\n";
			diagramProfile += "\n";
			
			}

			fs.writeFile("output/paths.csv", pathsProfile, function(err) {
			    if(err) {
			    	callbackfunc(false);
			        return console.log(err);
			    }

			    console.log("Paths are saved!");
			    
			    fs.writeFile("output/diagram_profile.csv", diagramProfile, function(err){
					 if(err) {
						 	callbackfunc(false);
					        return console.log(err);
					    }

					    console.log("Profile was saved!");
					    
					    fs.writeFile("output/Analytics.csv", Analytics, function(err) {
						    if(err) {
						    	callbackfunc(false);
						        return console.log(err);
						    }
						    
						    console.log("Analytics are saved!");
						    
//						    generateStatisticalCharts(callbackfunc);
						    
						});
				});
			});
			
		},
		extractModelInfo : function(umlModelInfo, callbackfnc) {
//			var xmlPath = './data/2014 spring 577b location based ad.xml';
//			var xmlPath = umlModelInfo.umlFilePath;
//			var outputDir = "public/output/"+umlFileInfo.fileId;
			
			mkdirp(umlModelInfo.outputDir, function(err) {
			    // path exists unless there was an error
				 if(err) {
					 	callbackfunc(false);
				        return console.log(err);
				 }
				
				//modelXMLParser.parseXMIModel('./data/2014_spring_577b_use_case_model_uml2.1.xml');
				//modelXMLParser.parseXMIModel('./data/2014_fall_577b_use_case_model_uml2.1.xml');
				modelXMLParser.extractRobustnessDiagrams(umlModelInfo.umlFilePath, function(diagrams){
//					console.log("extract robustness diagrams");
//					console.log(diagrams);
					var diagramArray = [];
					for(var i in diagrams) {
					(function(diagram, id){
					diagram._id = id;
					pathProfiler.traverseRobustnessDiagram(diagram, diagramProcessor);
//					console.log(diagrams[i].Name);

					var fileName = diagram.Name.replace(/[^A-Za-z0-9_]/gi, "_") + Date.now();
					diagram.outputDir = umlModelInfo.outputDir+"/"+fileName;
					diagram.accessDir = umlModelInfo.accessDir+"/"+fileName;
					mkdirp(diagram.outputDir, function(err) { 
						if(err) {
							console.log(err);
					        return;
					    }
					console.log("fileName:"+diagram.Name);
					diagram.dotGraphFile = 'robustness.dotty';
					diagram.svgDiagramFile = 'robustness.svg';
					diagramDrawer.draw(diagram, function(diagram){
						var child = exec('dot -Tsvg "' + diagram.outputDir+"/"+ diagram.dotGraphFile + '">"'+diagram.outputDir+"/"+diagram.svgDiagramFile+'"', function(error, stdout, stderr) {
							if (error !== null) {
								console.log('exec error: ' + error);
							} 
						});
					});
					});
					})(diagrams[i], i);
					
					diagramArray.push(diagrams[i]);
					}
					
					umlModelInfo.diagrams = diagramArray;
					callbackfnc(umlModelInfo);

			});

				
			});
	},
		dumpRepoEvaluation:dumpRepoEvaluation,
		dumpModelEvaluation:dumpModelEvaluation
	}
}());