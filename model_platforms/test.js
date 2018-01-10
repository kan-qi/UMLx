var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var xmiParser = require('./XMI2.1Parser.js');
//var xmiParser = require('./XMI2.1ActivityDiagramParser.js');
//var xmiParser = require('./XMI2.1RobustnessDiagramParser.js');
var fs = require("fs");

fs.readFile("./model_platforms/bookTicketsExamplev1.4.xml", function(err, data) {
	parser.parseString(data, function(err, result) {
		Model = xmiParser.extractModelComponents(result);
		for(var i in Model.UseCases){
			var UseCase = Model.UseCases[i];
			console.log("output use case");
			drawPrecedenceDiagramFunc(UseCase, "./model_platforms/usecase_"+i+".dotty");
		}
	});
});

//fs.readFile("./model_platforms/bookTicketsExamplev1.3.xml", function(err, data) {
//	parser.parseString(data, function(err, result) {
//		UseCases = xmiParser.extractModelComponents(result);
//	});
//});



function drawPrecedenceDiagramFunc(UseCase, graphFilePath, callbackfunc){
	var nodes = UseCase.nodes;
	var precedenceRelations = UseCase.precedenceRelations;
	console.log(precedenceRelations);
	var graph = 'digraph g {';
	

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
	for (var j in nodes){
		var node = nodes[j];
		if(node.group){
			if(!groups[node.group]){
				groups[node.group] = [];
			}
			var group = groups[node.group];
			group.push(node);
		}
		else{
			others.push(node);
		}
	}
	
	var groupNum = 0;
	for(var j in groups){
		var group = groups[j];
		graph += "subgraph cluster"+groupNum+" {";
		for(var k in group){
			var node = group[k];
			if(node.stimulus){
				color = "red";
			} else if(node.inScope){
				color = "green";
			}
			
			var label = node.name;
			
			if(node.type === "fragment_start"){
				graph += dottyDraw.draw(node.id+'[label="'+label+'" shape=diamond style=filled fillcolor=yellow];');
			}
			else if(node.type === "fragment_end"){
				graph += dottyDraw.draw(node.id+'[label="'+label+'" shape=ellipse style=filled fillcolor=yellow];');
			}
			else{
				graph += dottyDraw.draw(node.id+'[label="'+label+'" shape=ellipse style=filled fillcolor='+color+'];');
			}
			
		}
		groupNum ++;
		graph += "label = \""+j+"\";}";
	}
	
	for(var j in others){
		var node = others[j];
		var color = "gray";
		if(node.stimulus){
			color = "red";
		}
		else if(node.inScope){
			color = "green";
		}
		
		var label = node.name;
//		if(node.group){
//			label=label+"GG"+node.group;
//		}
//		dotty += '"'+node.Name+'";';
		if(node.type === "fragment_start"){
			graph += dottyDraw.draw(node.id+'[label="'+label+'" shape=diamond style=filled fillcolor=yellow];');
		}
		else if(node.type === "fragment_end"){
			graph += dottyDraw.draw(node.id+'[label="'+label+'" shape=ellipse style=filled fillcolor=yellow];');
		}
		else{
			graph += dottyDraw.draw(node.id+'[label="'+label+'" shape=ellipse style=filled fillcolor='+color+'];');
		}
	}
	
	console.log("nodes...");
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
		console.log("drawing is down");
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