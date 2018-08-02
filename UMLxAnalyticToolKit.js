var UMLxAnalyticToolKitCore = require("./utils/UMLxAnalyticToolKitCore.js");

//Input xml file directory 
var inputDir = process.argv[2];

var outputDir = process.argv[3];
//var times = 1;
//var location_transfer = "";
//var test_loca = "./abc/analysisresults";
<<<<<<< HEAD

if (process.argv[3]) {//
    outputDir = process.argv[3]+"/"+analysisDate+"@"+Date.now();

    for (let j of process.argv[3]) {
        if (j === '/') times ++;
    }

    for (let i = 0; i < times; i ++) {
        location_transfer += "../"
    }
    location_transfer += 'public/'
}
else {
    outputDir = "public/analysisResult/"+analysisDate+"@"+Date.now();
    location_transfer = '../../'
}


var useCasesSum = 0;
var transactionsSum = 0;
var classesSum = 0;
var actorsSum = 0;
var swti = [];
var swtii = [];
var swtiii = [];
var categories=[];
var rt_object = {swtI:[],swtII:[],swtIII:[],category:[]};

var useCaseEvaluationStr = "";
var domainModelEvaluationStr = "";
var modelEvaluationStr = "";

var useCaseNum = 1;

function analyzeUML(callback) {
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
					modelEvaluator(model, function(model2){
						if (callback) {
							callback(model2);
						}
					});
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
		// var useCase = model.UseCases[i];
		// useCase.Paths = traverseUseCaseForPaths(useCase);
        //
		// for(let j in useCase.Paths){
		// 	let path = useCase.Paths[j];
		// 	var PathStrByIDs = "";
		// 	for(let k in path.Elements){
		// 		let node = path.Elements[k];
		// 		PathStrByIDs += node._id+"->";
		// 	}
		// 	path.PathStrByIDs = path.PathStrByIDs;
		// }
        var useCase = model.UseCases[i];
        useCase.Transactions = traverseUseCaseForTransactions(useCase);

        var debug = require("./utils/DebuggerOutput.js");
        debug.writeJson("use_case_to_expand_"+useCase._id, useCase);

        for(var j in useCase.Transactions){
            var transaction = useCase.Transactions[j];
            var TransactionStrByIDs = "";
            for(var k in transaction.Elements){
                var node = transaction.Elements[k];
                TransactionStrByIDs += node._id+"->";
            }
            transaction.TransactionStrByIDs = transaction.TransactionStrByIDs;
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

function traverseUseCaseForTransactions(useCase){

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

//			console.log(Paths);
//			useCase.Paths = Paths;

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

function modelEvaluator(model, callback) {

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
									
							RScriptExec.runRScript(command, function(result){
								if (callback) {
									callback(model);
								}
							});
						});
					}
				});
			}
	});
}

function readUsecaseJson(model, callback) {
    let html_table = `<div style='height:6%'>&nbsp;</div>
						<table class='table table-hover table-bordered'; id='usecase_table2'; style='width:100%'>
							<tr>
								<th>Usecase ID</th>
								<th>Column Name</th>
								<th>Mean</th>
								<th>Variance</th>
								<th>First Quartile</th>
								<th>Median</th>
								<th>Third Quartile</th>
								<th>Kurtosis</th>
							</tr>
						`;

	let count = 0;

	for(usecase of model.UseCases) {
		let filePath = usecase.OutputDir + "/element_statistics.json";
		fs.exists(filePath, (exists) => {
			count ++;
			if (exists) {
				count --;
                fs.readFile(filePath, (err, data) => {
                	count ++;
                    if (err) throw err;
                    let obj = JSON.parse(data);
                    console.log(obj);

                    for(let i = 0;i < obj.length;i++){
                    	let element = obj[i];
                    	if(i === 0) {
                            html_table += `<tr class="estimation-table">
									<td rowspan="${obj.length}"> ID </td>
									<td> ${element['column name']} </td>
									<td> ${element.statistics['mean']} </td>
									<td> ${element.statistics.variance} </td>
									<td> ${element.statistics.first_quartile} </td>
									<td> ${element.statistics.median} </td>
									<td> ${element.statistics.third_quartile} </td>
									<td> ${element.statistics.kurtosis} </td>
									</tr>
                    			`;
						}
						else {
                            html_table += `<tr class="estimation-table">
									<td> ${element['column name']} </td>
									<td> ${element.statistics['mean']} </td>
									<td> ${element.statistics.variance} </td>
									<td> ${element.statistics.first_quartile} </td>
									<td> ${element.statistics.median} </td>
									<td> ${element.statistics.third_quartile} </td>
									<td> ${element.statistics.kurtosis} </td>
									</tr>
								`;
						}
					}

                    if (count === model.UseCases.length && callback) {
                        html_table += `</table>`;
                        callback(html_table);
					}
                });
			}
        });
	}
}


function createStream(callback) {
	let chart_url = outputDir + "/useCaseEvaluation.csv";
	fs.createReadStream(chart_url)
		.pipe(csv())
		.on('data', function (data) {
			swti.push(parseInt(data.SWTI));
			swtii.push([parseInt(data.SWTII)]);
			swtiii.push([parseInt(data.SWTIII)]);
			categories.push("'"+("UC"+data.NUM)+"'");
		})
		.on('end', function(data) {
			// console.log("hello" + swti);
			// console.log("hello" + swtii);
			// console.log("hello" + swtiii);
			// console.log("hello" + categories);
			rt_object.swtI = swti;
			rt_object.swtII = swtii;
			rt_object.swtIII = swtiii;
			rt_object.category = categories;
			if (callback) {
				callback();
			}
		});
}

function getHTML(xcategories,yswti,yswtii,yswtiii,html_table,callback) {
	let model_analysis_button =
		`
		<div class='model-analytics-ops pull-right'>
			<div class="dropdown">
				<button data-toggle="dropdown" type="button" aria-haspopup="true" aria-expanded="false" class="btn btn-secondary dropdown-toggle btn-default">Dump Repo<span class="caret"></span></button>
				<ul class="dropdown-menu">
					<li><a href="./modelEvaluation.csv" class="dumpEvaluationData dropdown-item">Evaluation For Models</a></li>
					<li><a href="./modelEvaluation.csv" class="dumpEvaluationData dropdown-item">Evaluation For Models (simulation)</a></li>
					<li><a href="./useCaseEvaluation.csv" class="dumpEvaluationData dropdown-item">Evaluation For Use Cases</a></li>
					<li><a href="./domainModelEvaluation.csv" class="dumpEvaluationData dropdown-item">Evaluation For Domain Models</a></li>
					<li><a href="./transactionAnalytics.csv" class="dumpEvaluationData dropdown-item">Evaluation For Transactions</a></li>
					<li><a href="./entityAnalytics.csv.csv" class="dumpEvaluationData dropdown-item">Evaluation For Classes</a></li>
					<li><a href="./elementAnalytics.csv" class="dumpEvaluationData dropdown-item">Evaluation For Elements</a></li>
				</ul>
			</div>
			
			<div class='dropdown'>
				<button data-toggle="dropdown" type="button" aria-haspopup="true" aria-expanded="false" class="btn btn-secondary dropdown-toggle btn-default">Load<span class="caret"></span></button>
				<ul class="dropdown-menu">
					<li><a id="update-model" onclick="" href="javaScript:void(0);" class="dropdown-item">Model Version</a></li>
				</ul>
			</div>
			
			<div class="dropdown">
				<button data-toggle="dropdown" type="button" aria-haspopup="true" aria-expanded="false" class="btn dropdown-toggle btn-default">Analysis<span class="caret"></span></button>
				<ul class="dropdown-menu">
					<li><a href="javaScript:void(0);"class="request-repo-analytics dropdown-item">Reanalyse Repo</a></li>
					<li><a href="javaScript:void(0);" class="dropdown-item">Reload Repo</a></li>
				</ul>
			</div>
		</div>
		`;

	let cards_selection =
		`
		<div class="col-sm-12 status-row">
			<div class="col-sm-3">
				<div class="blue-card analytics-card">
					<div class="col-sm-4 image-box">
						<img src="${location_transfer}img/project.png" alt="">
					</div>
					<div class="col-sm-8 text-box">
						<h2>${useCasesSum}</h2>
						<span>Use Cases</span>
					</div>
				</div>
			</div>
			<div class="col-sm-3">
				<div class="red-card analytics-card">
					<div class="col-sm-4 image-box">
						<img src="${location_transfer}img/project.png" alt="">
					</div>
					<div class="col-sm-8 text-box">
						<h2>${transactionsSum}</h2>
						<span>Transactions</span>
					</div>
				</div>
			</div>
			<div class="col-sm-3">
				<div class="green-card analytics-card">
					<div class="col-sm-4 image-box">
						<img src="${location_transfer}img/project.png" alt="">
					</div>
					<div class="col-sm-8 text-box">
						<h2>${classesSum}</h2>
						<span>Classes</span>
					</div>
				</div>
			</div>
			<div class="col-sm-3">
				<div class="purple-card analytics-card">
					<div class="col-sm-4 image-box">
						<img src="${location_transfer}img/project.png" alt="">
					</div>
					<div class="col-sm-8 text-box">
						<h2>${actorsSum}</h2>
						<span>Actors</span>
					</div>
				</div>
			</div>
		</div>
	
		<div id="result_chart">here should be distributions</div>
		`;

	let model_analysis_chart =
		`
		<div class="model-info-content">
			<ul class="nav nav-tabs">
				<li class="active">
					<a data-toggle="tab" href="#model-analytics">Overview</a>
				</li>
				<li>
					<a data-toggle="tab" href="#usecase-analysis" onclick="">Model Elements</a>
				</li>
			</ul>
			<div class="tab-content">
				<div id="model-analytics" class="tab-pane fade in active">
					${cards_selection}
				</div>
				<div id="usecase-analysis" class="tab-pane fade">
					<div id="model-usecase-analysis">
						<h3>loading...</h3>
					</div>
				</div>
				<div id="repo-analysis-detail" class="panel-body">
					<div class="repo-metrics table-responsive">
						${html_table}
					</div>
				</div> 
			</div>
		</div>	  
		`
	;

	let htmlBody =
		`
		<!DOCTYPE html>
		<html>
			<head>
				<title>UMLx</title>
				<link href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css', rel='stylesheet'>
				<link href='${location_transfer}css/style.css', rel='stylesheet'>
				<link href="${location_transfer}css/lightgallery.css" rel="stylesheet">
			</head>
			
			<body>
				<div class="banner">
					<div class="content-flex">
						<div class="col-md-10 banner-title">
							<h2>UMLx</h2>
						</div>
					</div>
				</div>
	
				<div id='main-panel'>
					<div id='display-panel'>
						<div class='block panel panel-default'>
							<div id='panel-heading'>
								${model_analysis_button}
							</div>
	
							<div id="model-stats-chart" class="panel-body">
								${model_analysis_chart}
							</div>
						</div>
					</div>
				</div>
				
	
				<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
				<script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
				<script type="text/javascript" src="https://code.highcharts.com/highcharts.src.js"></script>
				<script type="text/javascript" src="https://code.highcharts.com/modules/histogram-bellcurve.js"></script>
				<script type="text/javascript" src="http://ariutta.github.io/svg-pan-zoom/dist/svg-pan-zoom.min.js"></script>
				<script type="text/javascript" src="http://d3js.org/d3.v4.min.js"></script>
				<script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
				<script type="text/javascript" src="${location_transfer}/js/charts.js"></script>
				<script type="text/javascript" src="${location_transfer}/js/scripts.js"></script>
				<script type="text/javascript" src="http://requirejs.org/docs/release/2.2.0/minified/require.js"></script>
				<script> 
					function display(){
						$('#result_chart').highcharts({
							chart: {
								type: 'column',
								spacingLeft: 0
							},
	
							title: {
								text: 'Evaluation of Use Case Complexity'
							},
			
							xAxis: {
								categories: [${xcategories}],
								crosshair: true
							},
							yAxis: {
								min: 0,
								title: {
									text: 'Frequency'
								}
							},
							tooltip: {
								headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
								pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
									'<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
								footerFormat: '</table>',
								shared: true,
								useHTML: true
							},
							plotOptions: {
								column: {
									pointPadding: 0.2,
									borderWidth: 0
								}
							},
							series: [ 
								{
									name: 'SWTI',
									data: [${yswti}]
								}, 
								{
									name: 'SWTII',
									data: [${yswtii}]
								}, 
								{
									name: 'SWTIII',
									data: [${yswtiii}]
								}
							]
						});
					}
	
					window.onload = display;
				</script>
			</body>
		</html>
		`;
	if (callback) {
		callback(htmlBody);
	}
}

function writeHTML(htmlBody){
    fs.writeFile(outputDir + "/result.html", htmlBody, (err) => {
        if(err) throw err;
        console.log("Result HTML Page has been successfully created!");
    });
}



analyzeUML(function (model) {
    readUsecaseJson(model, function (html_table) {
        createStream(function () {
            const yswi = rt_object.swtI;
            const yswtii = rt_object.swtII;
            const yswtiii = rt_object.swtIII;
            const xcategories = rt_object.category;
            console.log("xcategories"+xcategories);
            console.log("yswi"+yswi);
            console.log("yswii"+yswtii);
            console.log("yswiii"+yswtiii);
            getHTML(xcategories,yswi,yswtii,yswtiii,html_table, function (data) {
                writeHTML(data);
                console.log(`result : [${xcategories}]`);
            });
        });
    });

=======
//
//if (process.argv[3]) {//
//    outputDir = +"/"+analysisDate+"@"+Date.now();
//
//    for (let j of process.argv[3]) {
//        if (j === '/') times ++;
//    }
//
//    for (let i = 0; i < times; i ++) {
//        location_transfer += "../"
//    }
//    location_transfer += 'public/'
//}
//else {
//    outputDir = "public/analysisResult/"+analysisDate+"@"+Date.now();
//    location_transfer = '../../'
//}


UMLxAnalyticToolKitCore.analyseSrc(inputDir, outputDir, function(){
	
	console.log('analysis finished!');
	  
>>>>>>> kqi
});
