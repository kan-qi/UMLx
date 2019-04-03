var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var xmiParser = require('./XMI2.1Parser.js');
var pathsDrawer = require("../model_drawers/TransactionsDrawer.js");
//var xmiParser = require('./XMI2.1ActivityDiagramParser.js');
//var xmiParser = require('./XMI2.1RobustnessDiagramParser.js');
var fs = require("fs");

fs.readFile("./model_platforms/bookTicketsExamplev1.4.xml", function(err, data) {
	parser.parseString(data, function(err, result) {
		Model = xmiParser.extractModelComponents(result);
		traverseUserSystemInterationModel(Model);
		for(var i in Model.UseCases){
			var UseCase = Model.UseCases[i];
			console.log("output use case");
			drawPrecedenceDiagramFunc(UseCase, "./model_platforms/usecase_"+i+".dotty");
			pathsDrawer.drawPaths(UseCase.Paths, "./model_platforms/usecase_"+i+"_paths.dotty", function(){
				console.log("paths are drawn");
			});
		}
	});
});

//fs.readFile("./model_platforms/bookTicketsExamplev1.3.xml", function(err, data) {
//	parser.parseString(data, function(err, result) {
//		UseCases = xmiParser.extractModelComponents(result);
//	});
//});

function isCycled(path){
	var lastNode = path[path.length-1];
		for(var i=0; i < path.length-1; i++){
			if(path[i] == lastNode){
				return true;
			}
		}
	return false;
}

function traverseUserSystemInterationModel(model){
	
	console.log("UMLDiagramTraverser: traverseBehaviralDiagram");
	
	for(var i in model.UseCases){
		var useCase = model.UseCases[i];
		
//		var entries=diagram.Entries;// tag: elements
		
		var toExpandCollection = new Array();
		
		for (var j in useCase.activities){
			var activity = useCase.activities[j];
			//define the node structure to keep the infor while traversing the graph
			if(activity.stimulus){
			var node = {
				//id: startElement, //ElementGUID
				Node: activity,
				PathToNode: [activity]
			};
			toExpandCollection.push(node);
			}
		}
		
		var Paths = new Array();
		var toExpand;
		while((toExpand = toExpandCollection.pop()) != null){
			var node = toExpand.Node;
			var pathToNode = toExpand.PathToNode;
//			var toExpandID = toExpand.id;
//			var expanded = false;
			// test completeness of the expanded path first to decide if continue to expand
//			var childNodes = diagram.expand(node);
			// if null is returned, then node is an end node.
			
//			diagram.expand = function(node){
			// add condition on actor to prevent stop searching for message [actor, view].
//			if(modelComponents[node.TargetID] && modelComponents[node.TargetID].Type === "boundary"){
//				return;
//			}
//			if(node.outboundNum == 0){
//				return;
//			}
//			else {

				var childNodes = [];
				for(var j in useCase.precedenceRelations){
					var edge = useCase.precedenceRelations[j];
					if(edge.start == node){
						childNodes.push(edge.end);
					}
				}
//				return children;
//			}
			
//		}
			
			if(childNodes.length == 0){
				Paths.push({Nodes: pathToNode});
			}
			else{
				for(var j in childNodes){
					var childNode = childNodes[j];
					
					//if childNode is an outside activity
					
					var toExpandNode = {
						Node: childNode,
						PathToNode: pathToNode.concat(childNode)
					}
					
					console.log("child node");
					console.log(childNode.name);
					console.log(childNode.group);

					if(!isCycled(toExpandNode.PathToNode) && childNode.group === "System"){
					toExpandCollection.push(toExpandNode);
					}
					else{
					Paths.push({Nodes: toExpandNode.PathToNode});
					}
				}		
			}
			
			
		}
		
		console.log("paths");
		console.log(Paths);
		useCase.Paths = Paths;
	}
	
}

function drawPrecedenceDiagramFunc(UseCase, graphFilePath, callbackfunc){
	var activities = UseCase.activities;
	var precedenceRelations = UseCase.precedenceRelations;
	console.log(precedenceRelations);
	var graph = 'digraph g {\
		node [margin=0 fontcolor=blue fontsize=12 width=0.01 shape=circle style=filled]';
	

	// used to get rid of duplicates.
	var drawnObjects = [];
	function DottyDraw(){
		this.drawnObjects = [];
		this.draw = function(dottyObject){
			if(drawnObjects[dottyObject]){
				return "";
			}
			else{
				drawnObjects[dottyObject] = 1;
				return dottyObject;
			}
		}
	}
	var dottyDraw = new DottyDraw();
	
	var groups = {};
	var others = [];
	for (var j in activities){
		var activity = activities[j];
		if(activity.group){
			if(!groups[activity.group]){
				groups[activity.group] = [];
			}
			var group = groups[activity.group];
			group.push(activity);
		}
		else{
			others.push(activity);
		}
	}
	
	var groupNum = 0;
	for(var j in groups){
		var group = groups[j];
		graph += "subgraph cluster"+groupNum+" {";
		for(var k in group){
			var activity = group[k];
			if(activity.stimulus){
				color = "red";
			} else if(activity.inScope){
				color = "green";
			}
			
			var label = activity.name;
			
			if(activity.type === "fragment_start"){
				graph += dottyDraw.draw(activity.id+'[taillabel="'+label+'" labelloc=bottom fixedSize=true shape=diamond style=filled fillcolor=yellow];');
			}
			else if(activity.type === "fragment_end"){
				graph += dottyDraw.draw(activity.id+'[taillabel="'+label+'" labelloc=bottom fixedSize=true style=filled fillcolor=yellow];');
			}
			else{
				graph += dottyDraw.draw(activity.id+'[taillabel="'+label+'" labelloc=bottom fixedSize=true style=filled fillcolor='+color+'];');
			}
			
		}
		groupNum ++;
		graph += "label = \""+j+"\";}";
	}
	
	for(var j in others){
		var activity = others[j];
		var color = "gray";
		if(activity.stimulus){
			color = "red";
		}
		else if(activity.inScope){
			color = "green";
		}
		
		var label = activity.name;
//		if(activity.group){
//			label=label+"GG"+activity.group;
//		}
//		dotty += '"'+activity.Name+'";';
		if(activity.type === "fragment_start"){
			graph += dottyDraw.draw(activity.id+'[taillabel="'+label+'" labelloc=bottom fixedSize=true  shape=diamond style=filled fillcolor=yellow];');
		}
		else if(activity.type === "fragment_end"){
			graph += dottyDraw.draw(activity.id+'[taillabel="'+label+'" labelloc=bottom fixedSize=true style=filled fillcolor=yellow];');
		}
		else{
			graph += dottyDraw.draw(activity.id+'[taillabel="'+label+'" labelloc=bottom fixedSize=true style=filled fillcolor='+color+'];');
		}
	}
	
	console.log("activities...");
	console.log(graph);
	
	var precedenceRelations = UseCase.precedenceRelations;
	for(var i in precedenceRelations){
		var precedenceRelation = precedenceRelations[i];
		console.log(precedenceRelation);
			var start = precedenceRelation.start.id;
			var end = precedenceRelation.end.id;
//			dotty += '"'+start.Name+'"->"'+end.Name+'";';
			graph += dottyDraw.draw('"'+start+'"->"'+end+'";');
	}
	
	
	graph += '}';
	
	dottyUtil = require("../utils/DottyUtil.js");
	dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
		console.log("drawing is done");
	});
//	var graphFilePath = precedenceRelations.OutputDir+'/'+precedenceRelations.DotGraphFile; 
//	console.log(graphFilePath);
//	mkdirp(precedenceRelations.OutputDir, function(err) {
//	    // path exists unless there was an error
//		 if(err) {
//		        return console.log(err);
//		 }
//		 fs.writeFile(graphFilePath, graph, function(err) {
//	    if(err) {
//	        return console.log(err);
//	    }
//	    
//	    var command = 'dot -Tsvg "' + graphFilePath + '">"'+precedenceRelations.OutputDir+"/"+precedenceRelations.SvgGraphFile+'"';
////		console.log(command);
//		var child = exec(command, function(error, stdout, stderr) {
//			if (error !== null) {
//				console.log('exec error: ' + error);
//			}
//
//		    console.log('The file was saved!');
//		    if(callbackfunc){
//		    	callbackfunc(graphFilePath);
//		    }
//		});
//		
//		
//	});
//	});
	return graph
}