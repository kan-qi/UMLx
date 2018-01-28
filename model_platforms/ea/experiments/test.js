var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var xmiParser = require('../XMI2.1Parser.js');
var pathsDrawer = require("./TransactionsDrawer.js");
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
		drawPrecedenceDiagramFunc(UseCase, Model.DomainModel, "./model_platforms/ea/experiments/usecase_"+i+".dotty");
		drawSimplePrecedenceDiagramFunc(UseCase, Model.DomainModel, "./model_platforms/ea/experiments/usecase_simple_"+i+".dotty");
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
		var domainModel = model.DomainModel;
		var domainModelById = {};
		for(var i in domainModel){
			var domainElement = domainModel[i];
			domainModelById[domainElement._id] = domainElement;
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
						if(standardizeName(node.Name) === standardizeName(operation.Name)){
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

function standardizeName(Name){
	return Name.replace(/\s/g, '').toUpperCase();
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
		<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" WIDTH="20">\
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
	
//	 <TR><TD><FONT POINT-SIZE="20">'+label+'</FONT></TD></TR>\
}

function drawFragmentNode(id, label){
	return id+'[label=<\
		<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
		<TR><TD><IMG SRC="fragment_node_icon.png"/></TD></TR>\
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

function getGroupDrawable(Group){
	if(Group === "System"){
		return "label = \""+Group+"\";style=\"bold\";";
	}
	else{
		return "label = \""+Group+"\";";
	}
}

function drawDomainObjectNode(component){
	//temporarily eliminate some unnecessary nodes
	console.log("domain objects");
	console.log(component);
	if(component.Name === "System Boundary" || component.Name.startsWith('$') || component.Name === "SearchInvalidMessage" || component.Name.startsWith('ItemList')){
		return null;
	}
	var componentInternal = "{";
	var componentInternalIndex = 0;
	componentInternal += "<f"+componentInternalIndex+">"+component.Name;
	componentInternalIndex++;
	for (var i in component.Attributes){
		var attribute = component.Attributes[i];
//		componentInternal += '"'+attribute.Name+'"->"'+component.Name+'";';
		componentInternal += "|<f"+componentInternalIndex+">"+attribute.Type.substring(7).replace("__", "[]")+" "+attribute.Name;
		componentInternalIndex++;
	}
	
	for (var i in component.Operations){
		var operation = component.Operations[i];
//		dotty += '"'+operation.Name+'"->"'+component.Name+'";';
		var functionSignature = operation.Name+"(";
		console.log("test parameters");
		console.log(operation.Parameters);
		for(var j in operation.Parameters){
			var parameter = operation.Parameters[j];
			if(parameter.Name === 'return'){
				functionSignature = parameter.Type.substring(7).replace("__", "[]") + " "+functionSignature;
			}
			else {
//				functionSignature = functionSignature + parameter.Type.substring(7).replace("__", "[]") + " " + parameter.Name;
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
	return component._id+'[label="'+componentInternal+'" shape=Mrecord];'
//	return component._id+'[label="'+component.Name+'" shape=Mrecord];'
//	return "";
	
//	graph += dottyDraw.draw(component._id+pathTag+'[label="'+componentInternal+'" shape=Mrecord];');
//	graph += dottyDraw.draw('"'+component._id+pathTag+'"->"'+target._id+pathTag+'";');
}

function drawPrecedenceDiagramFunc(UseCase, DomainModel, graphFilePath, callbackfunc){
	var activities = UseCase.Activities;
	var precedenceRelations = UseCase.PrecedenceRelations;
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
	
	var Groups = {};
	var others = [];
	for (var j in activities){
		var activity = activities[j];
		if(activity.Group){
			if(!Groups[activity.Group]){
				Groups[activity.Group] = [];
			}
			var Group = Groups[activity.Group];
			Group.push(activity);
		}
		else{
			others.push(activity);
		}
	}
	
	var GroupNum = 0;
	var edgesToDomainObjects = [];
	
	for(var j in Groups){
		var Group = Groups[j];
		graph += "subgraph cluster"+GroupNum+" {";
		for(var k in Group){
			var activity = Group[k];
			
//			var label = activity.Name;
//			var node = drawExternalNode(activity._id, activity.Name);
			var node = drawNode(activity._id, activity.Name);
			
			if(activity.Stimulus){
				node = drawStimulusNode(activity._id, activity.Name);
			} else if(activity.OutScope){
				node = drawOutOfScopeNode(activity._id, activity.Name);
			} else if(activity.Type === "fragment_start" || activity.Type === "fragment_end"){
				console.log("drawing fragment node");
				node = drawFragmentNode(activity._id, activity.Name);
				console.log(node);
			}
			
			//add edges to domain objects.
			if(activity.receiver && activity.receiver.Class){
				edgesToDomainObjects.push(dottyDraw.draw('"'+activity._id+'"->"'+activity.receiver.Class+'"[style = dashed];'));
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
		GroupNum ++;
//		graph += "label = \""+j+"\";style=\"bold\"}";
		graph += getGroupDrawable(j)+"};";
//		graph += drawGroupShape(Group)+";}";
	}
	
	for(var j in others){
		var activity = others[j];
//		var color = "gray";
//		if(activity.Stimulus){
//			color = "red";
//		}
//		else if(activity.inScope){
//			color = "green";
//		}
		
//		var label = activity.Name;
//		if(activity.Group){
//			label=label+"GG"+activity.Group;
//		}
//		dotty += '"'+activity.Name+'";';
		
//		var node = drawStimulusNode(activity.id, activity.Name);
		
//		var node = drawExternalNode(activity.id, activity.Name);
//		
//		if(activity.Stimulus){
//			node = drawStimulusNode(activity.id, activity.Name);
//		} else if(activity.inScope){
//			node = drawInternalNode(activity.id, activity.Name);
//		}
		
		var node = drawNode(activity._id, activity.Name);
		
		if(activity.Stimulus){
			node = drawStimulusNode(activity._id, activity.Name);
		} else if(activity.OutScope){
			node = drawOutOfScopeNode(activity._id, activity.Name);
		} else if(activity.Type === "fragment_start" || activity.Type === "fragment_end"){
			console.log("drawing fragment node");
			node = drawFragmentNode(activity._id, activity.Name);
			console.log(node);
		}
		
//		var target = node.target;
//		if(target){
//			graph += dottyDraw.draw(target._id+pathTag+'[label="'+target.Name+'"];');
//			graph += dottyDraw.draw('"'+target._id+pathTag+'"->"'+node._id+pathTag+'";');
//			if(target.component){
//				var component = target.component;
//				var componentInternal = "{";
//				var componentInternalIndex = 0;
//				componentInternal += "<f"+componentInternalIndex+">"+component.Name;
//				componentInternalIndex++;
//				for (var k in component.Attributes){
//					var attribute = component.Attributes[k];
////					componentInternal += '"'+attribute.Name+'"->"'+component.Name+'";';
//					componentInternal += "|<f"+componentInternalIndex+">"+attribute.Name;
//					componentInternalIndex++;
//				}
//				
//				for (var k in component.Operations){
//					var operation = component.Operations[k];
////					dotty += '"'+operation.Name+'"->"'+component.Name+'";';
//					componentInternal += "|<f"+componentInternalIndex+">"+operation.Name;
//					componentInternalIndex++;
//				}
//				
//				componentInternal += "}";
//				graph += dottyDraw.draw(component._id+pathTag+'[label="'+componentInternal+'" shape=Mrecord];');
//				graph += dottyDraw.draw('"'+component._id+pathTag+'"->"'+target._id+pathTag+'";');
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
	
	var precedenceRelations = UseCase.PrecedenceRelations;
	for(var i in precedenceRelations){
		var precedenceRelation = precedenceRelations[i];
		console.log(precedenceRelation);
			if(precedenceRelation.start && precedenceRelation.end){
//			dotty += '"'+start.Name+'"->"'+end.Name+'";';

			var start = precedenceRelation.start._id;
			var end = precedenceRelation.end._id;
			graph += dottyDraw.draw('"'+start+'"->"'+end+'";');
			}
	}
	
	graph += "subgraph cluster"+1000+" {";
	var j = 0;
	for(var i in DomainModel.Elements){
		//arrange the nodes in the subgraph
		
		
		
		var domainObject = DomainModel.Elements[i];
		var domainObjectToDraw = drawDomainObjectNode(domainObject);
		
		if(domainObjectToDraw){
//			if(j%3 == 0){
//				graph += "{rank=same;";
//				var index = 1001+j;
//				graph += "subgraph cluster"+index+" {";
//			}
			graph += dottyDraw.draw(domainObjectToDraw);
			
//			if(j%3 == 2){
//				graph += "};";
//			}
//			j++;
		}
	}
	
//	if(j % 3 != 0){
//		graph +="};";
//	}
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
	
	dottyUtil = require("../../../utils/DottyUtil.js");
	console.log("test graph");
	console.log(graph);
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

function drawSimplePrecedenceDiagramFunc(UseCase, DomainModel, graphFilePath, callbackfunc){
	var activities = UseCase.Activities;
	var precedenceRelations = UseCase.PrecedenceRelations;
	console.log(precedenceRelations);
	var graph = 'digraph g {\
		fontsize=24\
		node [shape=plaintext fontsize=24]';
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
	
	for(var i in activities){
		var activity = activities[i];
		
		var node = drawNode(activity._id, activity.Name);
		
		if(activity.Stimulus){
			node = drawStimulusNode(activity._id, activity.Name);
		} else if(activity.OutScope){
			node = drawOutOfScopeNode(activity._id, activity.Name);
		} else if(activity.Type === "fragment_start" || activity.Type === "fragment_end"){
			console.log("drawing fragment node");
			node = drawFragmentNode(activity._id, activity.Name);
			console.log(node);
		}
		
			graph += dottyDraw.draw(node);
	}
	
	console.log("activities...");
	console.log(graph);
	
	var precedenceRelations = UseCase.PrecedenceRelations;
	for(var i in precedenceRelations){
		var precedenceRelation = precedenceRelations[i];
		console.log(precedenceRelation);
			if(precedenceRelation.start && precedenceRelation.end){
//			dotty += '"'+start.Name+'"->"'+end.Name+'";';

			var start = precedenceRelation.start._id;
			var end = precedenceRelation.end._id;
			graph += dottyDraw.draw('"'+start+'"->"'+end+'";');
			}
	}
	
	
	graph += 'imagepath = \"./imgs\"}';
	
	
	dottyUtil = require("../../../utils/DottyUtil.js");
	dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
		console.log("drawing is down");
	});

	return graph
	
}