(function() {
	// Retrieve
	
	/*
	 *  This script will call the classes within repoAnalyzer.
	 * 
	 */
	
	var classPath = "C:/Users/Kan Qi/Google Drive/ResearchSpace/Research Projects/Repo Analyser/bin/"
	var projectDir = "C:/Users/Kan Qi/Google Drive/ResearchSpace/Research Projects/UMLx";
	var umlModelEvaluator = require("./UMLEvaluator.js");
	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	
	function copyModelInfo(modelInfo, deep){
		if(!modelInfo){
			return null;
		}
		var modelInfoCopy = {
				fileId: modelInfo.fileId,
			    _id: modelInfo._id,
			    fileSize: modelInfo.fileSize,
			    creationTime: modelInfo.creationTime,
			    fileUrl: modelInfo.fileUrl,
			    umlFilePath: modelInfo.umlFilePath,
			    umlModelType: modelInfo.umlModelType,
			    umlModelName: modelInfo.umlModelName,
			    outputDir: modelInfo.outputDir,
			    accessDir: modelInfo.accessDir,
			    diagrams: [],
			    ModelAnalytics: {
			    	  _id: modelInfo.ModelAnalytics._id,
					  OutputDir: modelInfo.ModelAnalytics.OutputDir,
					  AccessDir: modelInfo.ModelAnalytics.AccessDir,
					  Name: modelInfo.ModelAnalytics.Name,
					  AvgPathLength: modelInfo.ModelAnalytics.AvgPathLength,
					  TotalPathLength: modelInfo.ModelAnalytics.TotalPathLength,
					  PathNum: modelInfo.ModelAnalytics.PathNum,
					  TotalLinks: modelInfo.ModelAnalytics.TotalLinks,
					  ActorNum: modelInfo.ModelAnalytics.ActorNum,
					  BoundaryNum: modelInfo.ModelAnalytics.BoundaryNum,
					  ControlNum: modelInfo.ModelAnalytics.ControlNum,
					  TotalDegree: modelInfo.ModelAnalytics.TotalDegree,
					  ElementNum: modelInfo.ModelAnalytics.ElementNum,
					  AvgDegree: modelInfo.ModelAnalytics.AvgDegree,
					  NumInterfaceOperation: modelInfo.ModelAnalytics.NumInterfaceOperation,
					  NumDataOperation: modelInfo.ModelAnalytics.NumDataOperation,
					  NumControlOperation: modelInfo.ModelAnalytics.NumControlOperation,
					  NumPartialMatched: modelInfo.ModelAnalytics.NumPartialMatched,
					  UEUCW: modelInfo.ModelAnalytics.UEUCW,
					  UEXUCW: modelInfo.ModelAnalytics.UEXUCW,
					  UAW: modelInfo.ModelAnalytics.UAW,
					  TCF: modelInfo.ModelAnalytics.TCF,
					  ECF: modelInfo.ModelAnalytics.ECF,
					  AFP: modelInfo.ModelAnalytics.AFP,
					  VAF: modelInfo.ModelAnalytics.VAF,
					  Effort: modelInfo.ModelAnalytics.Effort,
					  PathAnalyticsFileName: modelInfo.ModelAnalytics.PathAnalyticsFileName,
					  ElementAnalyticsFileName: modelInfo.ModelAnalytics.ElementAnalyticsFileName,
					  ModelEvaluationFileName: modelInfo.ModelAnalytics.ModelEvaluationFileName,
					  Elements:[],
					  Paths:[]
			    }
		}
		
		if(deep){
			for(var i in modelInfo.ModelAnalytics.Elements){
				modelInfoCopy.ModelAnalytics.Elements.push(JSON.parse(JSON.stringify(modelInfo.ModelAnalytics.Elements[i])));
			}
			
			for(var i in modelInfo.ModelAnalytics.Paths){
				modelInfoCopy.ModelAnalytics.Paths.push(JSON.parse(JSON.stringify(modelInfo.ModelAnalytics.Paths[i])));
			}
		}
		else{
			for(var i in modelInfo.ModelAnalytics.Elements){
				modelInfoCopy.ModelAnalytics.Elements.push(modelInfo.ModelAnalytics.Elements[i]);
			}
			
			for(var i in modelInfo.ModelAnalytics.Paths){
				modelInfoCopy.ModelAnalytics.Elements.push(modelInfo.ModelAnalytics.Elements[i]);
			}
		}
		
		
		for(var i in modelInfo.diagrams){
			var diagramInfo = modelInfo.diagrams[i];
			
			var diagramCopy = {
					Name: diagramInfo.Name,
				    Elements: {},
				    _id: diagramInfo._id,
				    TotalLinks: diagramInfo.TotalLinks,
				    ActorNum: diagramInfo.ActorNum,
				    BoundaryNum: diagramInfo.BoundaryNum,
				    ControlNum: diagramInfo.ControlNum,
				    EntityNum: diagramInfo.EntityNum,
				    Paths:[],
				    outputDir: diagramInfo.outputDir,
				    accessDir: diagramInfo.accessDir,
				    dotGraphFile: diagramInfo.dotGraphFile,
				    svgDiagramFile: diagramInfo.svgDigramFile,
				    DiagramAnalytics:{
				    	 _id: diagramInfo.DiagramAnalytics._id,
				         OutputDir: diagramInfo.DiagramAnalytics.OutputDir,
				         AccessDir: diagramInfo.DiagramAnalytics.AccessDir,
				         Name: diagramInfo.DiagramAnalytics.Name,
				         AvgPathLength: diagramInfo.DiagramAnalytics.AvgPathLength,
				         TotalPathLength: diagramInfo.DiagramAnalytics.TotalPathLength,
				         PathNum: diagramInfo.DiagramAnalytics.PathNum,
				         TotalLinks: diagramInfo.DiagramAnalytics.TotalLinks,
				         ActorNum: diagramInfo.DiagramAnalytics.ActorNum,
				         BoundaryNum: diagramInfo.DiagramAnalytics.BoundaryNum,
				         ControlNum: diagramInfo.DiagramAnalytics.ControlNum,
				         TotalDegree: diagramInfo.DiagramAnalytics.TotalDegree,
				         ElementNum: diagramInfo.DiagramAnalytics.ElementNum,
				         AvgDegree: diagramInfo.DiagramAnalytics.AvgDegree,
				         NumInterfaceOperation: diagramInfo.DiagramAnalytics.NumInterfaceOperation,
				         NumDataOperation: diagramInfo.DiagramAnalytics.NumDataOperation,
				         NumControlOperation: diagramInfo.DiagramAnalytics.NumControlOperation,
				         NumPartialMatched: diagramInfo.DiagramAnalytics.NumPartialMatched,
				         CCSS: diagramInfo.DiagramAnalytics.CCSS,
				         IT: diagramInfo.DiagramAnalytics.IT,
				         ILF: diagramInfo.DiagramAnalytics.ILF,
				         ELF: diagramInfo.DiagramAnalytics.ELF,
				         EI: diagramInfo.DiagramAnalytics.EI,
				         EO: diagramInfo.DiagramAnalytics.EO,
				         EQ: diagramInfo.DiagramAnalytics.EQ,
				         Effort: diagramInfo.DiagramAnalytics.Effort,
				         Elements: [],
				         Paths: [],
				         PathAnalyticsFileName: diagramInfo.DiagramAnalytics.PathAnalyticsFileName,
				         ElementAnalyticsFileName: diagramInfo.DiagramAnalytics.ElementAnalyticsFileName }
				    }
				    
			
			if(deep){
				for(var j in diagramInfo.Elements){
					diagramCopy.Elements[j] = JSON.parse(JSON.stringify(diagramInfo.Elements[j]));
				}
				
				for(var j in diagramInfo.Paths){
					diagramCopy.Paths.push(JSON.parse(JSON.stringify(diagramInfo.Paths[j])));
				}
				
				for(var j in diagramInfo.DiagramAnalytics.Paths){
					diagramCopy.DiagramAnalytics.Paths.push(JSON.parse(JSON.stringify(diagramInfo.DiagramAnalytics.Paths[j])));
				}
				
				for(var j in diagramInfo.DiagramAnalytics.Elements){
					diagramCopy.DiagramAnalytics.Elements[j].push(JSON.parse(JSON.stringify(diagramInfo.DiagramAnalytics.Elements[j])));
				}
			}
			else{
				for(var j in diagramInfo.Elements){
					diagramCopy.Elements[j] = diagramInfo.Elements[j];
				}
				
				for(var j in diagramInfo.Paths){
					diagramCopy.Paths.push(diagramInfo.Paths[j]);
				}
				
				for(var j in diagramInfo.DiagramAnalytics.Paths){
					diagramCopy.DiagramAnalytics.Paths.push(diagramInfo.DiagramAnalytics.Paths[j]);
				}
				
				for(var j in diagramInfo.DiagramAnalytics.Elements){
					diagramCopy.DiagramAnalytics.Elements.push(diagramInfo.DiagramAnalytics.Elements[j]);
				}
			}
			
			modelInfoCopy.diagrams.push(diagramCopy);
		}
		
		return modelInfoCopy;
	}
	
	
	function copyModelInfoArray(modelInfoArray, deep){
		var modelInfoArrayCopy = [];
		for(var i in modelInfoArray){
			modelInfoArrayCopy.push(copyModelInfo(modelInfoArray[i], deep));
		}
		
		return modelInfoArrayCopy;
	}
	
	function getCombinedModelInfoList(modelInfo){
//		console.log(modelInfo.diagrams[0]);
	 function generateModelInfoCombination(modelInfo){
		console.log('generate model combination');
		var modelInfoCopy = copyModelInfo(modelInfo);
//		console.log(modelInfoCopy.diagrams.length);
		if(modelInfoCopy.diagrams.length <= 1){
			var modelInfoCombination = [];
			modelInfoCombination.push(modelInfoCopy);
			return modelInfoCombination;
		}
		var diagram = modelInfoCopy.diagrams.shift();
//		console.log("diagrams:"+modelInfoCopy.diagrams.length);
		var modelInfoCombination = generateModelInfoCombination(modelInfoCopy);
//		var modelInfoCombinationCopy = JSON.parse(JSON.stringify(modelInfoCombination));
		var modelInfoCombinationCopy = copyModelInfoArray(modelInfoCombination);
		for(var i in modelInfoCombinationCopy){
			var modelInfoInCombination = modelInfoCombinationCopy[i];
			modelInfoInCombination.diagrams.push(diagram);
		}
		modelInfoCombination = modelInfoCombination.concat(modelInfoCombinationCopy);
		return modelInfoCombination;
		}
		
		var modelInfoCombination = generateModelInfoCombination(modelInfo);
		for(var i in modelInfoCombination){
			var modelInfo = modelInfoCombination[i];
			umlModelEvaluator.analyseModel(modelInfo);
		}
		
		console.log('return combined model info list');
		
		return modelInfoCombination;
	}
	
	
	function generateRandomModelInfo(modelInfo, index){
		//generate random numbers
//		var randomModelInfo = JSON.parse(JSON.stringify(modelInfo));
		console.log("model info simulation");
		var randomModelInfo = copyModelInfo(modelInfo);
		randomModelInfo.umlModelName = randomModelInfo.umlModelName+"#S"+index;
		randomModelInfo.ModelAnalytics.Name = randomModelInfo.ModelAnalytics.Name+"#S"+index;
		var diagramNum = randomModelInfo.diagrams.length;
		if(diagramNum < 2){
			return false;
		}
		var randomDiagramNum = random(1, diagramNum);
		var diagramsToSelect = [];
		for(var i=0; i<randomDiagramNum; i++){
			diagramsToSelect.push(i);
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
		umlModelEvaluator.analyseModel(randomModelInfo);
		
		return randomModelInfo;
	}
	
	function random (low, high) {
	    return Math.random() * (high - low) + low;
	}

	function simulateModel(modelInfo){
		var modelEvaluations = [];
		var models = [];
		if(simulation){
			//models = models.concat(getCombinedModelInfoList(modelInfo));
			// to generate 200 data points
			models.push(modelInfo);
//			var simulationNum = Math.pow(modelInfo.diagrams.length, 2);
			var simulationNum = {
			0:0,
			1:1,
			2:3,
			3:7,
			4:15,
			5:31,
			6:63,
			7:127,
			8:159,
			9:179,
			10:199,
			11:209,
			12:219,
			13:229,
			14:234,
			15:239,
			16:244,
			17:249,
			18:252,
			19:255,
			20:258,
			21:261,
			22:263,
			23:265,
			24:267,
			25:267
			};
			
			var usecaseNumIndex = (modelInfo.UseCases.length > 25)?25:modelInfo.UseCases.length;
//			if(diagramNumIndex < 8){
//				var modelInfoCombination = getCombinedModelInfoList(modelInfo);
//				models = models.concat(modelInfoCombination);
//			}
//			else {
			for(var i=0; i<simulationNum[usecaseNumIndex]/3; i++){
				modelInfoCopy = generateRandomModelInfo(modelInfo, i);
				if(modelInfoCopy){
				models.push(modelInfoCopy);
				}
			}
//			}
		}
		else{
			models.push(modelInfo);
		}
		
		
		for(var i in models){
		
		modelEvaluations.push(modelEvaluation);
		}
		
		return modelEvaluations;
	}
	
	
	
	
	module.exports = {
		simulateModel: simulateModel
	}
}())