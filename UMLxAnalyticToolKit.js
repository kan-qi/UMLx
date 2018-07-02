var fs = require("fs");
var mkdirp = require("mkdirp");
var rimraf = require('rimraf');

var jp = require('jsonpath');
var xml2js = require('xml2js');

var parser = new xml2js.Parser();
var eaParser = require('./model_platforms/ea/XMI2.1Parser.js');
var srcParser = require('./model_platforms/src/SrcParser.js');

var pathsDrawer = require("./model_drawers/TransactionsDrawer.js");
var vpParser = require('./model_platforms/visual_paradigm/XML2.1Parser.js');
var modelDrawer = require("./model_drawers/UserSystemInteractionModelDrawer.js");
var domainModelDrawer = require("./model_drawers/DomainModelDrawer.js");

var umlEvaluator = require("./UMLEvaluator.js");
var umlFileManager = require("./UMLFileManager.js");
var RScriptExec = require('./utils/RScriptUtil.js');

// current available evaluators
var umlModelElementEvaluator = require('./evaluators/UMLModelElementsEvaluator/UMLModelElementEvaluator.js');
var functionPointEvaluator = require('./evaluators/FunctionPointEvaluator/FunctionPointEvaluator.js');
var transactionEvaluator = require('./evaluators/TransactionEvaluator/TransactionEvaluator.js');
var modelVersionEvaluator = require('./evaluators/ModelVersionEvaluator/UMLModelVersionEvaluator.js');
var useCasePointCalculator = require('./evaluators/UseCasePointEvaluator/UseCasePointCalculator.js');
var cocomoCalculator = require('./evaluators/COCOMOEvaluator/COCOMOCalculator.js');
var projectTypeEvaluator = require('./evaluators/ProjectTypeEvaluator.js');
var useCasePointWeightEvaluator = require('./evaluators/UseCasePointEvaluator/UseCasePointWeightEvaluator.js');
var UMLSizeMetricEvaluator = require('./evaluators/UMLModelSizeMetricEvaluator/UMLModelSizeMetricEvaluator.js');
	
//	var evaluators = [cocomoCalculator, useCasePointCalculator, umlDiagramEvaluator,functionPointCalculator, projectEvaluator, useCasePointWeightEvaluator];
var evaluators = [umlModelElementEvaluator,functionPointEvaluator, transactionEvaluator,modelVersionEvaluator, projectTypeEvaluator, cocomoCalculator,useCasePointWeightEvaluator,useCasePointCalculator,UMLSizeMetricEvaluator];


//Input xml file directory 
var inputDir = process.argv[2];
//Manully setted output directory
let date = new Date();
let analysisDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
var outputDir = "public/analysisResult/"+analysisDate+"@"+Date.now();

function analyzeUML() {
    //create output directory for analysis result
	mkdirp(outputDir, (err) => {
		if(err) {
			console.log("Error: Fail to create output directory!");
			throw(err);
		}

		fs.readFile(inputDir, "utf8", (err, data) => {
			if(err) { 
				console.log("Error: Fail to read XMI file!");
				throw(err);
			}
			
			parser.parseString(data, (err, str) => {
				if(err) {
					console.log("Error: Fail to convert file data to string!");
					throw(err);
				}

				//determine what type of xmi it is
				var xmiParser = null;

				if(jp.query(str, '$..["xmi:Extension"][?(@["$"]["extender"]=="Enterprise Architect")]')[0]) {
					xmiParser = eaParser;
				}

				if(jp.query(str, '$..["xmi:Extension"][?(@["$"]["extender"]=="Visual Paradigm")]')[0]) {
					xmiParser = vpParser;
				}

				if(jp.query(str, '$..["kdm:Segment"]')[0]){
					xmiParser = srcParser;
				}

				if(xmiParser === null) {
					console.log("Error: Could not find XMI Parser!");
					return;
				}
				//extract model information due to different xmi parser
				xmiParser.extractUserSystermInteractionModel(str, outputDir, inputDir, (model) => {
					modelExtractor(model);
					model.OutputDir = outputDir;
					model.AccessDir = inputDir;
					modelEvaluator(model);
				});
			});
	    });
	});

	return outputDir;
}

function modelExtractor(model) {
	var domainModel = model.DomainModel;
	domainModel.DotGraphFile = '';
	domainModel.SvgGraphFile = 'domainModel.svg';

	// console.log(`Fucking: ${JSON.stringify(domainModel)}`);

	domainModelDrawer.drawDomainModel(domainModel, outputDir+"/domainModel.dotty", () => {
		console.log("Domain Model is drawn");
	});

	for(let i in model.UseCases) {
		var useCase = model.UseCases[i];
		useCase.Paths = traverseUseCaseForPaths(useCase);
	
		for(let j in useCase.Paths){
			let path = useCase.Paths[j];
			var PathStrByIDs = "";
			for(let k in path.Elements){
				let node = path.Elements[k];
				PathStrByIDs += node._id+"->";
			}
			path.PathStrByIDs = path.PathStrByIDs;
		}
		
		modelDrawer.drawPrecedenceDiagram(useCase, domainModel, useCase.OutputDir+"/useCase.dotty", () => {
			console.log("Use Case is drawn");
		});

		modelDrawer.drawSimplePrecedenceDiagram(useCase, domainModel, useCase.OutputDir+"/useCase_simple.dotty", () => {
			console.log("Simple Use Case is drawn");
		});
		
		pathsDrawer.drawPaths(useCase.Paths, useCase.OutputDir+"/paths.dotty", function(){
			console.log("Paths are drawn");
		});
	}

	modelDrawer.drawDomainModel(domainModel, domainModel.OutputDir+"/domainModel.dotty", function(){
		console.log("Domain Model is drawn");
	});
}


function traverseUseCaseForPaths(useCase){
	console.log("UMLDiagramTraverser: traverseBehaviralDiagram");
	
	function isCycled(path){
		var lastNode = path[path.length-1];
			for(var i=0; i < path.length-1; i++){
				if(path[i] == lastNode){
					return true;
				}
			}
		return false;
	}

	var toExpandCollection = new Array();
	
	for (var j in useCase.Activities){
		var activity = useCase.Activities[j];
		//define the node structure to keep the infor while traversing the graph
		if(activity.Stimulus){
		var node = {
			//id: startElement, //ElementGUID
			Node: activity,
			PathToNode: [activity],
			OutScope: activity.OutScope
		};
		toExpandCollection.push(node);
		}
	}
	
	var Paths = new Array();
	var toExpand;
	
	var debug = require("./utils/DebuggerOutput.js");
	debug.writeJson("use_cas_toExpand_"+useCase._id, toExpandCollection);
	
	while((toExpand = toExpandCollection.pop()) != null){
		var node = toExpand.Node;
		var pathToNode = toExpand.PathToNode;

			var childNodes = [];
			for(var j in useCase.PrecedenceRelations){
				var edge = useCase.PrecedenceRelations[j];
				if(edge.start == node){
					childNodes.push(edge.end);
				}
			}
		
		if(childNodes.length == 0){
			Paths.push({Nodes: pathToNode, OutScope: toExpand.OutScope});
		}
		else{
			for(var j in childNodes){
				var childNode = childNodes[j];
				if(!childNode){
					continue;
				}
				
				//if childNode is an outside activity
				
				var OutScope = false;
				if(toExpand.OutScope||childNode.OutScope){
					OutScope = true;
				}
				
				var toExpandNode = {
					Node: childNode,
					PathToNode: pathToNode.concat(childNode),
					OutScope: OutScope
				}
				
				console.log("toExpandNode");
				console.log(toExpandNode);
				
				console.log("child node");
				console.log(childNodes);
				console.log(childNode);
				console.log(childNode.Name);
				console.log(childNode.Group);

				if(!isCycled(toExpandNode.PathToNode) && childNode.Group === "System"){
					toExpandCollection.push(toExpandNode);
				}
				else{
					Paths.push({Nodes: toExpandNode.PathToNode, OutScope: toExpandNode.OutScope});
				}
			}		
		}
	}		
	return Paths;		
}

function evaluateUseCase(useCase, model, callbackfunc){
		
	if(callbackfunc){
	// iterate the evaluators, which will do analysis on at the repo level and populate repo analytics

		if(!useCase){
			callbackfunc(false);
			return;
		}
		
	for(var i in evaluators){
		var evaluator = evaluators[i];
		if(evaluator.evaluateUseCase){
			evaluator.evaluateUseCase(useCase, model, function(){
				console.log("use case evaluation finishes");
			});
		}
	}
	
	callbackfunc(useCase);
	
	}
	else{
		return useCase;
	}
}

function evaluateDomainModel(domainModel, callbackfunc){
	if(callbackfunc){
		// iterate the evaluators, which will do analysis on at the repo level and populate repo analytics
		if(!domainModel){
			callbackfunc(false);
			return;
		}
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.evaluateDomainModel){
				evaluator.evaluateDomainModel(domainModel, function(){
					console.log("domain model evaluation finishes");
				});
			}
		}
		
		callbackfunc(domainModel);
		
	}
	else{
		return domainModel;
	}
}
// to converge use case empirics and use case analytics, dump it and evaluate it.
function toUseCaseEvaluationStr(useCase, useCaseNum){
		var useCaseEvaluationStr = "NUM,UC";
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toUseCaseEvaluationHeader){
				useCaseEvaluationStr += "," + evaluator.toUseCaseEvaluationHeader();
			}
		}
		
		useCaseEvaluationStr += "\n";
		
		if(useCaseNum !== 1){
			useCaseEvaluationStr = "";
		}
		
		useCaseEvaluationStr += useCaseNum+","+ useCase.Name.replace(/,/gi, "");
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toUseCaseEvaluationRow){
				useCaseEvaluationStr += "," + evaluator.toUseCaseEvaluationRow(useCase, useCaseNum);
			}
		}
		
		useCaseEvaluationStr += "\n";
		
		return useCaseEvaluationStr;
}

function toDomainModelEvaluationStr(domainModel, domainModelNum){
	var domainModelEvaluationStr = "NUM,DM";
	
	for(var i in evaluators){
		var evaluator = evaluators[i];
		if(evaluator.toDomainModelEvaluationHeader){
			domainModelEvaluationStr += "," + evaluator.toDomainModelEvaluationHeader();
		}
	}
	
	domainModelEvaluationStr += "\n";
	
	if(domainModelNum !== 1){
		domainModelEvaluationStr = "";
	}
	
	domainModelEvaluationStr += domainModelNum+",domain_model";
	
	for(var i in evaluators){
		var evaluator = evaluators[i];
		if(evaluator.toDomainModelEvaluationRow){
			domainModelEvaluationStr += "," + evaluator.toDomainModelEvaluationRow(domainModel, domainModelNum);
		}
	}
	
	domainModelEvaluationStr += "\n";
	
	return domainModelEvaluationStr;
}

function toModelEvaluationStr(model, modelNum){
	var modelEvaluationStr = "NUM,PROJ";
			
	for(var i in evaluators){
		var evaluator = evaluators[i];
		if(evaluator.toModelEvaluationHeader){
			modelEvaluationStr += ","+evaluator.toModelEvaluationHeader();
		}
	}
			
	modelEvaluationStr += "\n";
		
	if(modelNum !== 1){
		modelEvaluationStr = "";
	}
			
			
	// modelEvaluationStr += modelNum+","+ model.Name.replace(/,/gi, "");
			
	for(var i in evaluators){
		var evaluator = evaluators[i];
		if(evaluator.toModelEvaluationRow){
			modelEvaluationStr += "," + evaluator.toModelEvaluationRow(model, modelNum);
		}
	}
			
	modelEvaluationStr += "\n";
		
	return modelEvaluationStr;
}

function modelEvaluator(model) {

	var useCaseNum = 1;
	var useCaseEvaluationStr = "";
	
	var domainModelNum = 1;
	var domainModelEvaluationStr = "";
	
	var modelNum = 1;
	var modelEvaluationStr = "";

	for(var i in model.UseCases){
		var useCase = model.UseCases[i];
		evaluateUseCase(useCase, model, function(){
			console.log('use case analysis is complete');
		});	

		useCaseEvaluationStr += toUseCaseEvaluationStr(useCase, useCaseNum);
		useCaseNum ++;
	}
	// console.log(`toUseCaseStr: ${useCaseEvaluationStr} has number: ${useCaseNum}`);
	var domainModel = model.DomainModel;
	if(domainModel){
		evaluateDomainModel(domainModel, function(){
			console.log('doamin model analysis is complete');
		});
		
		domainModelEvaluationStr += toDomainModelEvaluationStr(domainModel, domainModelNum);
		domainModelNum ++;
	}
	// console.log(`toDomainModelStr: ${domainModelEvaluationStr} has number: ${domainModelNum}`);

	model.OutputDir = outputDir;
	for(var i in evaluators){
		var evaluator = evaluators[i];
		if(evaluator.evaluateModel){
			evaluator.evaluateModel(model, function(){
				console.log('model evaluation finishes');
			});
		}
	}
	modelEvaluationStr += toModelEvaluationStr(model, modelNum);
	// console.log(`modelStr: ${modelEvaluationStr} has number: ${modelNum}`);
	model.ModelEvaluationFileName = "modelEvaluation.csv";
	model.UseCaseEvaluationFileName = "useCaseEvaluation.csv";
	model.DomainModelEvaluationFileName = "domainModelEvaluation.csv";
	model.UseCaseStatisticsOutputDir = outputDir+"/use_case_evaluation_statistics";
	model.DomainModelStatisticsOutputDir = outputDir+"/domain_model_evaluation_statistics";
	
	var files = [{fileName : model.UseCaseEvaluationFileName , content : useCaseEvaluationStr},
				{fileName : model.DomainModelEvaluationFileName , content : domainModelEvaluationStr},
				{fileName : model.ModelEvaluationFileName , content : modelEvaluationStr}];

	umlFileManager.writeFiles(outputDir, files, function(err){
			if(err) {
				console.log(err);
			}
			else {
				for(var i in evaluators){
					var evaluator = evaluators[i];
					if(evaluator.analyseModelEvaluation){
						evaluator.analyseModelEvaluation(model);
					}
				}
						
				umlFileManager.makeDirs([model.UseCaseStatisticsOutputDir, model.DomainModelStatisticsOutputDir], function(result){
					console.log("test for model mkdir");
					if(result){
						console.log("apply statistical analysis on the output evaluation");
						var command = './Rscript/OutputStatistics.R "'+model.OutputDir+"/"+model.UseCaseEvaluationFileName+'" "'+model.UseCaseStatisticsOutputDir+'" "."';
						RScriptExec.runRScript(command,function(result){
							var command = './Rscript/OutputStatistics.R "'+model.OutputDir+"/"+model.DomainModelEvaluationFileName+'" "'+model.DomainModelStatisticsOutputDir+'" "."';
									
							RScriptExec.runRScript(command);
						});
					}
				});
			}
	});
}

analyzeUML();
