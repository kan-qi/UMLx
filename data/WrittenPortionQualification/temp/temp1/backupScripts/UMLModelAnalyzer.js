(function() {
	/**
	 *  Work as a test stub
	 */

	var modelXMLParser = require('./model_platforms/ea/XMI2.1Parser.js');
	var robustnessDiagramDrawer = require('./domainmodel/robustnessdiagram/RobustnessDiagramDrawer.js');
	var pathProfiler = require('./domainmodel/robustnessdiagram/RobustnessDiagramProfiler.js');
	var diagramProcessor = require('./domainmodel/robustnessdiagram/RobustnessDiagramProcessor.js');
	var mkdirp = require('mkdirp');
	var fs = require('fs');
	var exec = require('child_process').exec;

	// your module code goes here
//	var aapt_path_windows = "\\bins\\android-sdk-windows\\aapt.exe";
//	var aapt_path_mac = "/bins/android-sdk-mac/aapt";
//	var aapt_path_linux = "/bins/android-sdk-linux/aapt";

//	var exec = require('child_process').exec;
	
	
	function generateGraphStatisticalCharts(modelStatistics, callbackfunc){
		var command = '"C:\\Program Files\\R\\R-3.2.2\\bin\\Rscript\" .\\Rscript\\RepoAnalyticsScript.R "'+modelStatistics.OutputDir+"/"+modelStatistics.ElementStatisticsFileName+'" "public\output\repo"';
//		console.log(command);
		var child = exec(command, function(error, stdout, stderr) {

			if (error !== null) {
				console.log('exec error: ' + error);
				callbackfunc(false);
			} 
			callbackfunc(modelStatistics);
		});
	}
	
	function analyseRepo(repo, callbackfunc){
		
		var repoStatistics = {
				RepoId: null,
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
				ModelStatistics: []
		}
		
		if(repo === undefined || repo === null){
			return repoStatistics;
		}
		
		repoStatistics.RepoId = repo._id;
		repoStatistics.OutputDir = repo.outputDir;
		repoStatistics.AccessDir = repo.accessDir;
		
		var pathStatistics = "id,path,semantics,path_length, graph,model\n";
		var pathNum = 0;
		var elementStatistics = "id,element,type,outboundDegree, inboundDegree\n";
		var elementNum = 0;
		
		for(var id in repo.models){
			var modelInfo = repo.models[id];
			var modelAnalytics = modelInfo.ModelAnalytics;
//			if(modelAnalytics === undefined){
				modelInfo.ModelAnalytics = analyseModel(modelInfo);
				modelAnalytics = modelInfo.ModelAnalytics;
//			}
			
			repoStatistics.TotalPathLength += modelAnalytics.TotalPathLength;
			repoStatistics.PathNum += modelAnalytics.PathNum;
			repoStatistics.NumInterfaceOperation += modelAnalytics.NumInterfaceOperation;
			repoStatistics.NumDataOperation += modelAnalytics.NumDataOperation;
			repoStatistics.NumControlOperation += modelAnalytics.NumControlOperation;
			repoStatistics.NumPartialMatched += modelAnalytics.NumPartialMatched;
			
			repoStatistics.TotalLinks += modelAnalytics.TotalLinks;
			repoStatistics.ActorNum += modelAnalytics.ActorNum;
			repoStatistics.BoundaryNum += modelAnalytics.BoundaryNum;
			repoStatistics.ControlNum += modelAnalytics.EntityNum;
			
			repoStatistics.TotalDegree += modelAnalytics.TotalDegree;
			repoStatistics.ElementNum += modelAnalytics.ElementNum;
			
			
			repoStatistics['ModelStatistics'].push(modelAnalytics);
			
			for(var graphAnyId in modelAnalytics.GraphStatistics){
//				console.log("dump graph statistics");
				var graphData = modelAnalytics.GraphStatistics[graphAnyId];
				for(var pathId in graphData.Paths){
				pathNum++;
				pathStatistics += pathNum+","+
				graphData.Paths[pathId].Path.replace(/,/gi, "")+","+ 
				graphData.Paths[pathId].Type.replace(/,/gi, "")+","+ 
				graphData.Paths[pathId].PathLength+","+ 
				graphData+","+ 
				modelAnalytics.id+"\n";
				}
				
				for(var elementId in graphData.Elements){
				elementNum++;
				elementStatistics += elementNum+","+ 
				graphData.Elements[elementId].Name.replace(/,/gi, "")+","+ 
				graphData.Elements[elementId].Type.replace(/,/gi, "")+","+ 
				graphData.Elements[elementId].OutboundNumber+","+ 
				graphData.Elements[elementId].InboundNumber+"\n";
				}
			}
			
		}
		
		repoStatistics.PathStatistics = pathStatistics;
		repoStatistics.ElementStatistics = elementStatistics;
		repoStatistics.ElementStatisticsFileName = "elementStatistics.csv";
		repoStatistics.PathStatisticsFileName = "pathStatistics.csv";
//		console.log("element statistics");
//		console.log(elementStatistics);
//		console.log("path statistics");
//		console.log(pathStatistics);
//		console.log("repoStatistics");
//		console.log(repoStatistics);
//		console.log("repoStatistics");
		repoStatistics.AvgPathLength = repoStatistics.TotalPathLength/repoStatistics.PathNum;
		repoStatistics.AvgDegree = repoStatistics.TotalDegree/repoStatistics.ElementNum;
		
		dumpRepoAnalytics(repoStatistics, callbackfunc)
		return repoStatistics;
	}
	
	function dumpRepoAnalytics(repoStatistics, callbackfunc){
		console.log(repoStatistics.OutputDir);
		mkdirp(repoStatistics.OutputDir, function(err) { 
			if(err) {
				console.log(err);
				if(callbackfunc !== undefined){
		    	callbackfunc(false);
				}
		        return;
		    }
			
		fs.writeFile(repoStatistics.OutputDir+"/"+repoStatistics.PathStatisticsFileName, repoStatistics.PathStatistics, function(err) {
		    if(err) {
		    	console.log(err);
		    	if(callbackfunc !== undefined){
			    	callbackfunc(false);
					}
		        return;
		    }

//		    console.log("Paths statistics were saved!");
		    
		    fs.writeFile(repoStatistics.OutputDir+"/"+repoStatistics.ElementStatisticsFileName, repoStatistics.ElementStatistics, function(err){
				 if(err) {
					 	console.log(err);
					 	if(callbackfunc !== undefined){
					    	callbackfunc(false);
							}
				        return; 
				    }
				 	
//				    console.log("Elements statistics were saved!");
				    
				    generateRepoStatisticalCharts(repoStatistics, callbackfunc);
				  
			});
		});
		

		});
	}
	
	
	function generateRepoStatisticalCharts(repoStatistics, callbackfunc){
		var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/RepoAnalyticsScript.R "'+repoStatistics.OutputDir+"/"+repoStatistics.ElementStatisticsFileName+'" "'+repoStatistics.OutputDir+"/"+repoStatistics.PathStatisticsFileName+'" "'+repoStatistics.OutputDir+"/"+'" "."';
//		console.log('generate model statistics');
//		console.log(command);
		var child = exec(command, function(error, stdout, stderr) {

			if (error !== null) {
				console.log('exec error: ' + error);
				if(callbackfunc !== undefined){
			    	callbackfunc(false);
					}
			} 
			if(callbackfunc !== undefined){
			callbackfunc(repoStatistics);
			}
		});
	}
	
	
	function analyseModel(modelInfo, callbackfunc){
		// for now only iterate through the robustness diagrams
		var modelStatistics = {
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
				GraphStatistics: [],
				Elements: [],
				Paths: []
		};
		
		for(var i in modelInfo.robustnessDiagrams){
			var robustnessDiagram = modelInfo.robustnessDiagrams[i];
			var graphAnalytics = robustnessDiagram.GraphAnalytics;
//			if(graphAnalytics === undefined){
				robustnessDiagram.GraphAnalytics = analyseGraph(robustnessDiagram);
				graphAnalytics = robustnessDiagram.GraphAnalytics;
//			}
			
			modelStatistics.TotalPathLength += graphAnalytics.TotalPathLength;
			modelStatistics.PathNum += graphAnalytics.PathNum;
			modelStatistics.NumInterfaceOperation += graphAnalytics.NumInterfaceOperation;
			modelStatistics.NumDataOperation += graphAnalytics.NumDataOperation;
			modelStatistics.NumControlOperation += graphAnalytics.NumControlOperation;
			modelStatistics.NumPartialMatched += graphAnalytics.NumPartialMatched;
			
			modelStatistics.TotalLinks += graphAnalytics.TotalLinks;
			modelStatistics.ActorNum += graphAnalytics.ActorNum;
			modelStatistics.BoundaryNum += graphAnalytics.BoundaryNum;
			modelStatistics.ControlNum += graphAnalytics.EntityNum;
			
			modelStatistics.TotalDegree += graphAnalytics.TotalDegree;
			modelStatistics.ElementNum += graphAnalytics.ElementNum;
			modelStatistics['GraphStatistics'].push(graphAnalytics);
			
//			console.log(modelStatistics);
			
			graphAnalytics.Paths.forEach(function(path) {
			    modelStatistics.Paths.push(path);
			});
			
			graphAnalytics.Elements.forEach(function(element) {
			    modelStatistics.Elements.push(element);
			});
			
		}
		
		modelStatistics.AvgPathLength = modelStatistics.TotalPathLength/modelStatistics.PathNum;
		modelStatistics.AvgDegree = modelStatistics.TotalDegree/modelStatistics.ElementNum;
		
		//modelStatistics.OutputDir = "public/output/"+modelStatistics._id+"/";
		modelStatistics.DiagramPathsFileName = "diagram_paths.csv";
		modelStatistics.DiagramProfileFileName = "diagram_profile.csv";
		modelStatistics.DiagramStatisticsFileName = "diagram_statistics.csv";

		modelStatistics.PathStatisticsFileName = "paths_profile.csv";
		modelStatistics.ElementStatisticsFileName = "elements_profile.csv";
		
		var pathStatistics = "id,path,semantics,path_length, graph,model\n";
		var pathNum = 0;
		var elementStatistics = "id,element,type,outboundDegree, inboundDegree\n";
		var elementNum = 0;
		
		
		for(var j in modelStatistics.GraphStatistics){
//			console.log("dump graph statistics");
			var graphData = modelStatistics.GraphStatistics[j];
			for(var pathId in graphData.Paths){
			pathNum++;
			pathStatistics += pathNum+","+
			graphData.Paths[pathId].Path.replace(/,/gi, "")+","+ 
			graphData.Paths[pathId].Type.replace(/,/gi, "")+","+ 
			graphData.Paths[pathId].PathLength+","+ 
			graphData+","+ 
			modelStatistics._id+"\n";
			}
			
			for(var elementId in graphData.Elements){
			elementNum++;
			elementStatistics += elementNum+","+ 
			graphData.Elements[elementId].Name.replace(/,/gi, "")+","+ 
			graphData.Elements[elementId].Type.replace(/,/gi, "")+","+ 
			graphData.Elements[elementId].OutboundNumber+","+ 
			graphData.Elements[elementId].InboundNumber+"\n";
			}
		}
		
		modelStatistics.ElementStatistics = elementStatistics;
		modelStatistics.PathStatistics = pathStatistics;
		
		dumpModelAnalytics(modelStatistics, callbackfunc)
		return modelStatistics;
	}
	
	
	function dumpModelAnalytics(modelAnalytics, callbackfunc){
//		console.log("=================path,element===============");
//		console.log(pathStatistics);
//		console.log(elementStatistics);
//		
		mkdirp(modelAnalytics.OutputDir, function(err) { 
			if(err) {
				console.log(err);
				if(callbackfunc !== undefined){
		    	callbackfunc(false);
				}
		        return;
		    }
			
		fs.writeFile(modelAnalytics.OutputDir+"/"+modelAnalytics.PathStatisticsFileName, modelAnalytics.PathStatistics, function(err) {
		    if(err) {
		    	console.log(err);
		    	if(callbackfunc !== undefined){
			    	callbackfunc(false);
					}
		        return;
		    }

//		    console.log("Paths statistics were saved!");
		    
		    fs.writeFile(modelAnalytics.OutputDir+"/"+modelAnalytics.ElementStatisticsFileName, modelAnalytics.ElementStatistics, function(err){
				 if(err) {
					 	console.log(err);
					 	if(callbackfunc !== undefined){
					    	callbackfunc(false);
							}
				        return; 
				    }
				 	
				    console.log("Elements statistics were saved!");
				    generateModelStatisticalCharts(modelAnalytics, callbackfunc);
				  
			});
		});
		

		});
	}
	
	function dumpModelAnalyticsBackup(modelStatistics, callbackfunc){
			var pathsProfile = "path,pattern\n";
			var diagramProfile = "";
			var diagramStatistics = "Usecase, avg_degree, avg_path_length, architectural_diff, num_path, num_interface_operation, number_data_operation, number_control, number_partial_matched\n";
			
			var graphAnalytics = modelStatistics.GraphAnalytics;
			for(var i in graphAnalytics) {
			var graphData = graphAnalytics[i];
			pathsProfile += "\n";
			pathsProfile += graphData.Name+"\n";
			
			var paths = graphData.Paths;
			for(var j in paths){
			pathsProfile += paths[j].path + "," + paths[j].type + "\n";
			}

			//console.log("...............profile................");
			//console.log("graphId:" + graphData.id);
			
			diagramProfile += "Name,"+graphData.Name+"\n";
			diagramProfile += "TotalLinks,"+graphData.TotalLinks+"\n";
			diagramProfile += "ActorNum,"+graphData.ActorNum+"\n";
			diagramProfile += "BoundaryNum,"+graphData.BoundaryNum+"\n";
			diagramProfile += "ControlNum,"+graphData.EntityNum+"\n";
			diagramProfile += "Element, Outbound, Inbound\n";
			
			
			diagramStatistics += graphData.Name.replace(/,/gi, " ")+","+graphData.AvgDegree+","+graphData.AvgPathLength+","+(graphData.AvgDegree*graphData.AvgPathLength)+","+graphData.PathNum+","+graphData.NumInterfaceOperation+","+graphData.NumDataOperation+","+graphData.NumControlOperation+","+graphData.NumPartialMatched;
			diagramStatistics += "\n";
			diagramProfile += "\n";
			
			}
			
			modelStatistics.OutputDir = "public/output/"+modelStatistics._id+"/";
			modelStatistics.DiagramPathsFileName = "diagram_paths.csv";
			modelStatistics.diagramProfileFileName = "diagram_profile.csv";
			modelStatistics.diagramStatisticsFileName = "diagram_statistics.csv";
			
			mkdirp(modelStatistics.OutputDir, function(err) { 
				if(err) {
					console.log(err);
			    	callbackfunc(false);
			        return;
			    }
				
			fs.writeFile(modelStatistics.OutputDir+"/"+modelStatistics.DiagramPathsFileName, pathsProfile, function(err) {
			    if(err) {
			    	console.log(err);
			    	callbackfunc(false);
			        return;
			    }

			    console.log("Paths are saved!");
			    
			    fs.writeFile(modelStatistics.OutputDir+"/"+modelStatistics.diagramProfileFileName, diagramProfile, function(err){
					 if(err) {
						 	console.log(err);
						 	callbackfunc(false);
					        return; 
					    }

					    console.log("Profile was saved!");
					    
					    fs.writeFile(modelStatistics.OutputDir+"/"+modelStatistics.diagramStatisticsFileName, diagramStatistics, function(err) {
						    if(err) {
						    	console.log(err);
						    	callbackfunc(false);
						        return;
						    }
						    
						    console.log("Statistics are saved!");
						    generateStatisticalCharts(modelStatistics, callbackfunc);
						    
						});
				});
			});
			

			});
			
		}

	
	
	function generateModelStatisticalCharts(modelStatistics, callbackfunc){
		var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/RepoAnalyticsScript.R "'+modelStatistics.OutputDir+"/"+modelStatistics.ElementStatisticsFileName+'" "'+modelStatistics.OutputDir+"/"+modelStatistics.PathStatisticsFileName+'" "'+modelStatistics.OutputDir+"/"+'" "."';
//		console.log(command);
		var child = exec(command, function(error, stdout, stderr) {

			if (error !== null) {
				console.log('exec error: ' + error);
				if(callbackfunc !== undefined){
				callbackfunc(false);
				}
			}
			if(callbackfunc !== undefined){
			callbackfunc(modelStatistics);
			}
		});
	}
	

	
	function analyseGraph(graphInfo){
		//get rid of the ids, use name only
		var graphAnalytics = {
				_id:graphInfo._id,
				Name: graphInfo.Name,
				AvgPathLength : 0,
				TotalPathLength: 0,
				PathNum: 0,
				TotalLinks: graphInfo.TotalLinks,
				ActorNum: graphInfo.ActorNum,
				BoundaryNum: graphInfo.BoundaryNum,
				ControlNum: 0,
				TotalDegree : 0,
				ElementNum: graphInfo.EntityNum,
				AvgDegree: 0,
				NumInterfaceOperation : 0,
				NumDataOperation: 0,
				NumControlOperation: 0,
				NumPartialMatched: 0,
				Elements: [],
				Paths: []
		};

		var elementSet=graphInfo.Elements; // tag: elements
		var totalDegree = 0;
		var elementNum = 0;
		for(var i in elementSet){
			var Element = elementSet[i]; //tag: elements
//			console.log(Element);
			graphAnalytics["Elements"].push({Name:Element.Name, OutboundNumber: Element.OutboundNumber, InboundNumber:Element.InboundNumber, Type:Element.Type});
			totalDegree += Element.InboundNumber;
			elementNum++;
		}
		
		var avgDegree = totalDegree/elementNum;
		
		graphAnalytics['TotalDegree'] = totalDegree;
		graphAnalytics['ElementNum'] = elementNum;
		graphAnalytics["AvgDegree"] = avgDegree;
		
		var paths = graphInfo.Paths;
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
				line += graphInfo.Elements[element].Name+"->";
				totalPathLength++;
			}
			var path = paths[i];
//			console.dir(line + path.operation.semantics);
			graphAnalytics["Paths"].push({Path:line, Type:path.operation.semantics, PathLength: paths[i]['Elements'].length});
			 
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
		
		graphAnalytics.TotalPathLength = totalPathLength;
		graphAnalytics.PathNum = paths.length;
		graphAnalytics.AvgPathLength = avgPathLength;
		graphAnalytics.NumInterfaceOperation = numInterfaceOperation;
		graphAnalytics.NumDataOperation = numDataOperation;
		graphAnalytics.NumControlOperation = numControlOperation;
		graphAnalytics.NumPartialMatched = numPartialMatched;
		return graphAnalytics;
	}
	
	
	module.exports = {
		getRepoStatistics: analyseRepo,
		getModelStatistics: analyseModel,
		getModelMeasures: function(modelInfo){
			return {
				eucp:12345,
				exucp:1234,
				fcp:1332
			}
		},
		getGraphAnalytics: analyseGraph,
		dumpGraphAnalytics : function(graphInfo){
			
		},
		dumpModelAnalytics: dumpModelAnalytics,
		dumpModelAnalyticsFromModelInfo: function(modelInfo, callbackfunc){
			var pathsProfile = "path,pattern\n";
			var diagramProfile = "";
			var statistics = "Usecase, avg_degree, avg_path_length, architectural_diff, num_path, num_interface_operation, number_data_operation, number_control, number_partial_matched\n";
			
			var diagrams = modelInfo.robustnessDiagrams;
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
			
			statistics += diagram.Name.replace(/,/gi, " ")+","+avgDegree+","+avgPathLength+","+(avgDegree*avgPathLength)+","+paths.length+","+numInterfaceOperation+","+numDataOperation+","+numControlOperation+","+numPartialMatched;
			statistics += "\n";
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
					    
					    fs.writeFile("output/statistics.csv", statistics, function(err) {
						    if(err) {
						    	callbackfunc(false);
						        return console.log(err);
						    }
						    
						    console.log("Statistics are saved!");
						    
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
				modelXMLParser.extractRobustnessDiagrams(umlModelInfo.umlFilePath, function(robustnessDiagrams){
//					console.log("extract robustness diagrams");
//					console.log(robustnessDiagrams);
					var robustnessDiagramArray = [];
					for(var i in robustnessDiagrams) {
					(function(robustnessDiagram, id){
					robustnessDiagram._id = id;
					pathProfiler.traverseRobustnessDiagram(robustnessDiagram, diagramProcessor);
//					console.log(robustnessDiagrams[i].Name);

					var fileName = robustnessDiagram.Name.replace(/ /gi, "_") + Date.now();
					robustnessDiagram.outputDir = umlModelInfo.outputDir+"/"+fileName;
					robustnessDiagram.accessDir = umlModelInfo.accessDir+"/"+fileName;
					mkdirp(robustnessDiagram.outputDir, function(err) { 
						if(err) {
							console.log(err);
					        return;
					    }
					console.log("fileName:"+robustnessDiagram.Name);
					robustnessDiagram.dotGraphFile = 'robustness.dotty';
					robustnessDiagram.svgGraphFile = 'robustness.svg';
					robustnessDiagramDrawer.draw(robustnessDiagram, function(robustnessDiagram){
						var child = exec('dot -Tsvg "' + robustnessDiagram.outputDir+"/"+ robustnessDiagram.dotGraphFile + '">"'+robustnessDiagram.outputDir+"/"+robustnessDiagram.svgGraphFile+'"', function(error, stdout, stderr) {
							if (error !== null) {
								console.log('exec error: ' + error);
							} 
						});
					});
					});
					})(robustnessDiagrams[i], i);
					
					robustnessDiagramArray.push(robustnessDiagrams[i]);
					}
					
					umlModelInfo.robustnessDiagrams = robustnessDiagramArray;
					callbackfnc(umlModelInfo);

			});

				
			});
		}
	}
}());