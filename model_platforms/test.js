var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var xmiParser = require('./XMI2.1Parser.js');
//var xmiParser = require('./XMI2.1ActivityDiagramParser.js');
//var xmiParser = require('./XMI2.1RobustnessDiagramParser.js');
var fs = require("fs");

fs.readFile("./model_platforms/bookTicketsExamplev1.3.xml", function(err, data) {
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
	
	for(var j in nodes){
		var node = nodes[j];
//		dotty += '"'+node.Name+'";';
		if(node.type === "fragment_start"){
			graph += dottyDraw.draw(node.id+'[label="'+node.name+'" shape=diamond fillcolor = gray];');
		}
		else if(node.type === "fragment_end"){
			graph += dottyDraw.draw(node.id+'[label="'+node.name+'" shape=ellipse fillcolor = gray];');
		}
		else{
			graph += dottyDraw.draw(node.id+'[label="'+node.name+'" shape=ellipse];');
		}
	}
	
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