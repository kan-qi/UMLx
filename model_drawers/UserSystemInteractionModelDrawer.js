/**
 * http://usejsdoc.org/
 */

(function(){
//	var Viz = require('viz.js');
	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var exec = require('child_process').exec;
	
	var dottyUtil = require("../utils/DottyUtil.js");
	
	function drawStimulusNode(id, label){
		return id+'[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
			<TR><TD><IMG SRC="Stimulus_icon.png"/></TD></TR>\
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

	function drawFragmentNode(id, label){
		return id+'[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
			<TR><TD><IMG SRC="fragment_node_icon.png"/></TD></TR>\
		  <TR><TD>'+label+'</TD></TR>\
		</TABLE>>];';
	}

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
		if(component.Name === "System Boundary" || component.Name.startsWith('$')){
			return "";
		}
		var componentInternal = "{";
		var componentInternalIndex = 0;
		componentInternal += "<f"+componentInternalIndex+">"+component.Name;
		componentInternalIndex++;
		for (var i in component.Attributes){
			var attribute = component.Attributes[i];
//			componentInternal += '"'+attribute.Name+'"->"'+component.Name+'";';
			componentInternal += "|<f"+componentInternalIndex+">"+attribute.Type.substring(7).replace("__", "[]")+" "+attribute.Name;
			componentInternalIndex++;
		}
		
		for (var i in component.Operations){
			var operation = component.Operations[i];
//			dotty += '"'+operation.Name+'"->"'+component.Name+'";';
			var functionSignature = operation.Name+"(";
			console.log("test parameters");
			console.log(operation.Parameters);
			for(var j in operation.Parameters){
				var parameter = operation.Parameters[j];
				if(parameter.Name === 'return'){
					functionSignature = parameter.Type.substring(7).replace("__", "[]") + " "+functionSignature;
				}
				else {
					functionSignature = functionSignature + parameter.Type.substring(7).replace("__", "[]") + " " + parameter.Name;
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
	}

	function drawPrecedenceDiagramFunc(UseCase, DomainModel, graphFilePath, callbackfunc){
		var activities = UseCase.Activities;
		var precedenceRelations = UseCase.PrecedenceRelations;
		console.log(precedenceRelations);
		var graph = 'digraph g {\
			node [shape=plaintext]';

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
					graph += dottyDraw.draw(node);
				
			}
			GroupNum ++;
			graph += getGroupDrawable(j)+"};";
		}
		
		for(var j in others){
			var activity = others[j];
			
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
//				dotty += '"'+start.Name+'"->"'+end.Name+'";';

				var start = precedenceRelation.start._id;
				var end = precedenceRelation.end._id;
				graph += dottyDraw.draw('"'+start+'"->"'+end+'";');
				}
		}
		
		graph += "subgraph cluster"+1000+" {";
		for(var i in DomainModel.Elements){
			var domainObject = DomainModel.Elements[i];
			graph += dottyDraw.draw(drawDomainObjectNode(domainObject));
		}
		graph += "label = \"Domain Model\";};";
		
		for(var i in edgesToDomainObjects){
			graph += edgesToDomainObjects[i];
		}
		
		graph += 'imagepath = \"./imgs\"}';
		
		dottyUtil = require("../../../utils/DottyUtil.js");
		dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
			console.log("drawing is down");
		});

		return graph
		
	}

	function drawSimplePrecedenceDiagramFunc(UseCase, DomainModel, graphFilePath, callbackfunc){
		var activities = UseCase.Activities;
		var precedenceRelations = UseCase.PrecedenceRelations;
		console.log(precedenceRelations);
		var graph = 'digraph g {\
			node [shape=plaintext]';
//			node [margin=0 fontcolor=blue fontsize=12 width=0.01 shape=circle style=filled]';
		
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
//				dotty += '"'+start.Name+'"->"'+end.Name+'";';

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
	
	module.exports = {
		drawModel:function(model, filePath, callbackfunc){
			drawModel(model, filePath, callbackfunc);
		},
	}
}())