var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var xmiParser = require('../XMI2.1Parser.js');
var pathsDrawer = require("../../../model_drawers/TransactionsDrawer.js");
var modelDrawer = require("../../../model_drawers/UserSystemInteractionModelDrawer.js");
//var xmiParser = require('./XMI2.1ActivityDiagramParser.js');
//var xmiParser = require('./XMI2.1RobustnessDiagramParser.js');
//var fs = require("fs");

//fs.readFile("./model_platforms/bookTicketsExamplev1.4.xml", function(err, data) {
//	parser.parseString(data, function(err, result) {
//		Model = xmiParser.extractModelComponents(result);
//		traverseUserSystemInterationModel(Model);
//		for(var i in Model.UseCases){
//			var UseCase = Model.UseCases[i];
//			console.log("output use case");
//			drawPrecedenceDiagramFunc(UseCase, Model.DomainModel, "./model_platforms/usecase_"+i+".dotty");
//			pathsDrawer.drawPaths(UseCase.Paths, "./model_platforms/usecase_"+i+"_paths.dotty", function(){
//				console.log("paths are drawn");
//			});
//		}
//	});
//});

xmiParser.extractUserSystermInteractionModel("./model_platforms/ea/experiments/ItemManagerExample.xml", function(Model){

	traverseUserSystemInterationModel(Model);
	for(var i in Model.UseCases){
		var UseCase = Model.UseCases[i];
		console.log("output use case");
		modelDrawer.drawPrecedenceDiagram(UseCase, Model.DomainModel, "./model_platforms/ea/experiments/usecase_"+i+".dotty");
		modelDrawer.drawSimplePrecedenceDiagram(UseCase, Model.DomainModel, "./model_platforms/ea/experiments/usecase_simple_"+i+".dotty");
		pathsDrawer.drawPaths(UseCase.Paths, "./model_platforms/ea/experiments/usecase_"+i+"_paths.dotty", function(){
			console.log("paths are drawn");
		});
	}
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
		while((toExpand = toExpandCollection.pop()) != null){
			var node = toExpand.Node;
			var pathToNode = toExpand.PathToNode;
//			var toExpandID = toExpand._id;
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
				for(var j in useCase.PrecedenceRelations){
					var edge = useCase.PrecedenceRelations[j];
					if(edge.start == node){
						childNodes.push(edge.end);
					}
				}
//				return children;
//			}
			
//		}
			
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
		
		console.log("profile paths");
//		var domainModel = model.DomainModel;
//		var domainModelById = {};
//		for(var i in domainModel){
//			var domainElement = domainModel[i];
//			domainModelById[domainElement._id] = domainElement;
//		}

		for(var i in Paths){
			var DET = 0;
			var DE = 0;
			var path = Paths[i];
			var componentStr = "";
			for(var j in path.Nodes){
				var node = path.Nodes[j];
//				if(node.receiver&&node.receiver.Class && domainModelById[node.receiver.Class]){
//					var domainElement = domainModelById[node.receiver.Class];
//					for(var k in domainElement.operations){
//						var operation = domainElement.operations[k];
//						if(standardizeName(node.Name) === standardizeName(operation.Name)){
////							console.log("yes");
//							DET += operation.parameters.length;
//						}
//					}
//				}
				
				if(node.Component){
					var component = node.Component;
//					var domainElement = domainModelById[node.receiver.Class];
					for(var k in component.operations){
						var operation = component.operations[k];
						if(standardizeName(node.Name) === standardizeName(operation.Name)){
//							console.log("yes");
							DET += operation.parameters.length;
						}
					}
					
					componentStr += component.Type;
				}
				
				DE++;
			}
			
			console.log("component str");
			console.log(componentStr);
			console.log(path);
			console.log("DET:"+DET);
			console.log("DE:"+DE);
		}
//		console.log(Paths);
		useCase.Paths = Paths;
	}
	
}

function standardizeName(Name){
	return Name.replace(/\s/g, '').toUpperCase();
}