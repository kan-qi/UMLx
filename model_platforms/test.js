var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var xmiParser = require('./XMI2.1Parser.js');
var pathsDrawer = require("./TransactionsDrawer.js");
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
			drawPrecedenceDiagramFunc(UseCase, Model.DomainModel, "./model_platforms/usecase_"+i+".dotty");
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
				PathToNode: [activity],
				OutScope: activity.outScope
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
					if(toExpand.OutScope||childNode.outScope){
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
					console.log(childNode.name);
					console.log(childNode.group);

					if(!isCycled(toExpandNode.PathToNode) && childNode.group === "System"){
					toExpandCollection.push(toExpandNode);
					}
					else{
					Paths.push({Nodes: toExpandNode.PathToNode, OutScope: toExpandNode.OutScope});
					}
				}		
			}
			
			
		}
		
		console.log("profile paths");
		var domainModel = model.DomainModel;
		var domainModelById = {};
		for(var i in domainModel){
			var domainElement = domainModel[i];
			domainModelById[domainElement.id] = domainElement;
		}

		for(var i in Paths){
			var DET = 0;
			var DE = 0;
			var path = Paths[i];
			for(var j in path.Nodes){
				var node = path.Nodes[j];
				if(node.receiver&&node.receiver.Class && domainModelById[node.receiver.Class]){
					var domainElement = domainModelById[node.receiver.Class];
					for(var k in domainElement.operations){
						var operation = domainElement.operations[k];
						if(standardizeName(node.name) === standardizeName(operation.name)){
//							console.log("yes");
							DET += operation.parameters.length;
						}
					}
				}
				DE++;
			}
			
			console.log(path);
			console.log("DET:"+DET);
			console.log("DE:"+DE);
		}
//		console.log(Paths);
		useCase.Paths = Paths;
	}
	
}

function standardizeName(name){
	return name.replace(/\s/g, '').toUpperCase();
}

function drawStimulusNode(id, label){
	return id+'[label=<\
		<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
		<TR><TD><IMG SRC="stimulus_icon.png"/></TD></TR>\
	  <TR><TD>'+label+'</TD></TR>\
	</TABLE>>];';
}

function drawNode(id, label){
	return id+'[label=<\
		<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
		<TR><TD><IMG SRC="activity_icon.png"/></TD></TR>\
	  <TR><TD>'+label+'</TD></TR>\
	</TABLE>>];';
}

function drawOutOfScopeNode(id, label){
	return id+'[label=<\
		<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
		<TR><TD><IMG SRC="out_of_scope_activity_icon.png"/></TD></TR>\
	  <TR><TD>'+label+'</TD></TR>\
	</TABLE>>];';
}


//function drawExternalNode(id, label){
//	return id+'[label=<\
//		<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
//		<TR><TD><IMG SRC="external_activity_icon.png"/></TD></TR>\
//	  <TR><TD>'+label+'</TD></TR>\
//	</TABLE>>];';
//}

function getGroupDrawable(group){
	if(group === "System"){
		return "label = \""+group+"\";style=\"bold\";";
	}
	else{
		return "label = \""+group+"\";";
	}
}

function drawDomainObjectNode(component){
	//temporarily eliminate some unnecessary nodes
	if(component.name === "System Boundary" || component.name.startsWith('$')){
		return "";
	}
	var componentInternal = "{";
	var componentInternalIndex = 0;
	componentInternal += "<f"+componentInternalIndex+">"+component.name;
	componentInternalIndex++;
	for (var i in component.attributes){
		var attribute = component.attributes[i];
//		componentInternal += '"'+attribute.name+'"->"'+component.name+'";';
		componentInternal += "|<f"+componentInternalIndex+">"+attribute.type+" "+attribute.name;
		componentInternalIndex++;
	}
	
	for (var i in component.operations){
		var operation = component.operations[i];
//		dotty += '"'+operation.name+'"->"'+component.name+'";';
		var functionSignature = operation.name+"(";
		for(var j in operation.parameters){
			var parameter = operation.parameters[j];
			if(parameter.name === 'return'){
				functionSignature = parameter.type + " "+functionSignature;
			}
			else {
				functionSignature += parameter.type+" "+parameter.name;
			}
		}
		functionSignature += ")";
		componentInternal += "|<f"+componentInternalIndex+">"+functionSignature;
		componentInternalIndex++;
	}
	
	componentInternal += "}";
	
	console.log("domain objects");
	console.log(component);
	console.log(componentInternal);
	return component.id+'[label="'+componentInternal+'" shape=Mrecord];'
//	return component.id+'[label="'+component.name+'" shape=Mrecord];'
//	return "";
	
//	graph += dottyDraw.draw(component.id+pathTag+'[label="'+componentInternal+'" shape=Mrecord];');
//	graph += dottyDraw.draw('"'+component.id+pathTag+'"->"'+target.id+pathTag+'";');
}

function drawPrecedenceDiagramFunc(UseCase, DomainModel, graphFilePath, callbackfunc){
	var activities = UseCase.activities;
	var precedenceRelations = UseCase.precedenceRelations;
	console.log(precedenceRelations);
	var graph = 'digraph g {\
		node [shape=plaintext]';
//		node [margin=0 fontcolor=blue fontsize=12 width=0.01 shape=circle style=filled]';
	

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
	var edgesToDomainObjects = [];
	
	for(var j in groups){
		var group = groups[j];
		graph += "subgraph cluster"+groupNum+" {";
		for(var k in group){
			var activity = group[k];
			
//			var label = activity.name;
//			var node = drawExternalNode(activity.id, activity.name);
			var node = drawNode(activity.id, activity.name);
			
			if(activity.stimulus){
				node = drawStimulusNode(activity.id, activity.name);
			} else if(activity.outScope){
				node = drawOutOfScopeNode(activity.id, activity.name);
			}
			
			//add edges to domain objects.
			if(activity.receiver && activity.receiver.Class){
				edgesToDomainObjects.push(dottyDraw.draw('"'+activity.id+'"->"'+activity.receiver.Class+'"[style = dashed];'));
			}
			
//			console.log("node...");
//			console.log(node);
			
//			if(activity.type === "fragment_start"){
//				graph += dottyDraw.draw(activity.id+'[label=<'+label+'>];');
//				graph += dottyDraw.draw(node);
//			}
//			else if(activity.type === "fragment_end"){
//				graph += dottyDraw.draw(node);
//			}
//			else{
				graph += dottyDraw.draw(node);
//			}
			
		}
		groupNum ++;
//		graph += "label = \""+j+"\";style=\"bold\"}";
		graph += getGroupDrawable(j)+"};";
//		graph += drawGroupShape(group)+";}";
	}
	
	for(var j in others){
		var activity = others[j];
//		var color = "gray";
//		if(activity.stimulus){
//			color = "red";
//		}
//		else if(activity.inScope){
//			color = "green";
//		}
		
//		var label = activity.name;
//		if(activity.group){
//			label=label+"GG"+activity.group;
//		}
//		dotty += '"'+activity.Name+'";';
		
//		var node = drawStimulusNode(activity.id, activity.name);
		
//		var node = drawExternalNode(activity.id, activity.name);
//		
//		if(activity.stimulus){
//			node = drawStimulusNode(activity.id, activity.name);
//		} else if(activity.inScope){
//			node = drawInternalNode(activity.id, activity.name);
//		}
		
		var node = drawNode(activity.id, activity.name);
		
		if(activity.stimulus){
			node = drawStimulusNode(activity.id, activity.name);
		} else if(activity.outScope){
			node = drawOutOfScopeNode(activity.id, activity.name);
		}
		
//		var target = node.target;
//		if(target){
//			graph += dottyDraw.draw(target.id+pathTag+'[label="'+target.name+'"];');
//			graph += dottyDraw.draw('"'+target.id+pathTag+'"->"'+node.id+pathTag+'";');
//			if(target.component){
//				var component = target.component;
//				var componentInternal = "{";
//				var componentInternalIndex = 0;
//				componentInternal += "<f"+componentInternalIndex+">"+component.name;
//				componentInternalIndex++;
//				for (var k in component.Attributes){
//					var attribute = component.Attributes[k];
////					componentInternal += '"'+attribute.name+'"->"'+component.name+'";';
//					componentInternal += "|<f"+componentInternalIndex+">"+attribute.name;
//					componentInternalIndex++;
//				}
//				
//				for (var k in component.Operations){
//					var operation = component.Operations[k];
////					dotty += '"'+operation.name+'"->"'+component.name+'";';
//					componentInternal += "|<f"+componentInternalIndex+">"+operation.name;
//					componentInternalIndex++;
//				}
//				
//				componentInternal += "}";
//				graph += dottyDraw.draw(component.id+pathTag+'[label="'+componentInternal+'" shape=Mrecord];');
//				graph += dottyDraw.draw('"'+component.id+pathTag+'"->"'+target.id+pathTag+'";');
//			}
//		}
		
//		if(activity.type === "fragment_start"){
//			graph += dottyDraw.draw(node);
//		}
//		else if(activity.type === "fragment_end"){
//			graph += dottyDraw.draw(node);
//		}
//		else{
			graph += dottyDraw.draw(node);
//		}
	}
	
	console.log("activities...");
	console.log(graph);
	
	var precedenceRelations = UseCase.precedenceRelations;
	for(var i in precedenceRelations){
		var precedenceRelation = precedenceRelations[i];
		console.log(precedenceRelation);
			if(precedenceRelation.start && precedenceRelation.end){
//			dotty += '"'+start.Name+'"->"'+end.Name+'";';

			var start = precedenceRelation.start.id;
			var end = precedenceRelation.end.id;
			graph += dottyDraw.draw('"'+start+'"->"'+end+'";');
			}
	}
	
	graph += "subgraph cluster"+1000+" {";
	for(var i in DomainModel){
		var domainObject = DomainModel[i];
		graph += dottyDraw.draw(drawDomainObjectNode(domainObject));
	}
	graph += "label = \"Domain Model\";};";
	
	for(var i in edgesToDomainObjects){
		graph += edgesToDomainObjects[i];
	}
	
	graph += 'imagepath = \"./imgs\"}';
	
//	graph = 'digraph structs {\
//	    node [shape=plaintext]\
//	    struct1 [label=<\
//	<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">\
//	  <TR><TD>left</TD><TD PORT="f1">mid dle</TD><TD PORT="f2">right</TD></TR>\
//	</TABLE>>];\
//	    struct2 [label=<\
//	<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">\
//	  <TR><TD PORT="f0">one</TD><TD>two</TD></TR>\
//	</TABLE>>];\
//	    struct3 [label=<\
//	<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">\
//	  <TR>\
//	    <TD ROWSPAN="3">hello<BR/>world</TD>\
//	    <TD COLSPAN="3">b</TD>\
//	    <TD ROWSPAN="3">g</TD>\
//	    <TD ROWSPAN="3">h</TD>\
//	  </TR>\
//	  <TR>\
//	    <TD>c</TD><TD PORT="here">d</TD><TD>e</TD>\
//	  </TR>\
//	  <TR>\
//	    <TD COLSPAN="3">f</TD>\
//	  </TR>\
//	</TABLE>>];\
//	    struct1:f1 -> struct2:f0;\
//	    struct1:f2 -> struct3:here;\
//	}';
	
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