/**
 * http://usejsdoc.org/
 */

(function(){
	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var exec = require('child_process').exec;
	
	var dottyUtil = require("../utils/DottyUtil.js");
	var codeAnalysisUtil = require("../utils/CodeAnalysisUtil.js");
	
	function processLabel(label){
		if(!label){
			return "undefined";
		}
		var terms = label.split(" ");
		var reformattedLabel = "";
		var lineNum = 3;
		for(var i=0; i<terms.length; i++){
			reformattedLabel += terms[i];
			if(i%lineNum == 2 && i != terms.length-1){
				reformattedLabel += "<BR/>";
			}
			else if(i != terms.length-1){
				reformattedLabel += " ";
			}
		}
		
		console.log("reformatted label");
		console.log(reformattedLabel);
		return reformattedLabel;
	}

	function drawStimulusNode(id, label){
		return '"'+id+'"[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
			<TR><TD><IMG SRC="img/stimulus_icon.png"/></TD></TR>\
		 <TR><TD><B>'+processLabel(label)+'</B></TD></TR>\
		</TABLE>>];';
	}

	function drawNode(id, label){
		
		return '"'+id+'"[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
			<TR><TD><IMG SRC="img/activity_icon.png"/></TD></TR>\
		 <TR><TD><B>'+processLabel(label)+'</B></TD></TR>\
		</TABLE>>];';
	}

	function drawOutOfScopeNode(id, label){
		return '"'+id+'"[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
			<TR><TD><IMG SRC="img/out_of_scope_activity_icon.png"/></TD></TR>\
		 <TR><TD><B>'+processLabel(label)+'</B></TD></TR>\
		</TABLE>>];';
	}

	function drawFragmentNode(id, label){
		return '"'+id+'"[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
			<TR><TD><IMG SRC="img/fragment_node_icon.png"/></TD></TR>\
		 <TR><TD><B>'+processLabel(label)+'</B></TD></TR>\
		</TABLE>>];';
	}

	function getGroupDrawable(Group){
		
		return "label = <<B>"+Group+"</B>>;style=\"bold\";";
	}
	
	function filterName(name){
		if(name == null){
			return null;
		}
		return name.replace(/[\$|\<|\>]/g,"");
	}

	function drawUSIMDiagramFunc(UseCase, DomainModel, graphFilePath, callbackfunc){

		console.log("the domainmodel is: " + JSON.stringify(DomainModel));


//		fs.writeFile('DomainModel_1.txt', JSON.stringify(DomainModel), (err) => {  
//		    if (err) throw err; 
//		}) 
//
//
//		fs.writeFile('UseCase_1.txt', JSON.stringify(UseCase), (err) => {  
//		    if (err) throw err; 
//		}) 


		var activities = UseCase.Activities;
		var precedenceRelations = UseCase.PrecedenceRelations;

		console.log(precedenceRelations);


		var graph = 'digraph g {\
			node [shape=plaintext]';
		
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
				
				var node = drawNode(activity._id, filterName(activity.Name));
				
				if(activity.Stimulus){
					node = drawStimulusNode(activity._id, filterName(activity.Name));
				} else if(activity.OutScope){
					node = drawOutOfScopeNode(activity._id, filterName(activity.Name));
				} else if(activity.Type === "fragment_start" || activity.Type === "fragment_end"){
					console.log("drawing fragment node");
					node = drawFragmentNode(activity._id, filterName(activity.Name));
					console.log(node);
				}
				
				//add edges to domain objects.
				if(activity.Component){
					edgesToDomainObjects.push(dottyDraw.draw('"'+activity._id+'"->"'+activity.Component._id+'"[style = dashed];'));
				}
				
					graph += dottyDraw.draw(node);
				
			}
			GroupNum ++;
			graph += getGroupDrawable(j)+"};";
		}
		
		for(var j in others){
			var activity = others[j];
			var node = drawNode(activity._id, filterName(activity.Name));
			
			if(activity.Stimulus){
				node = drawStimulusNode(activity._id, filterName(activity.Name));
			} else if(activity.OutScope){
				node = drawOutOfScopeNode(activity._id, filterName(activity.Name));
			} else if(activity.Type === "fragment_start" || activity.Type === "fragment_end"){
				console.log("drawing fragment node");
				node = drawFragmentNode(activity._id, filterName(activity.Name));
				console.log(node);
			}
			
				graph += dottyDraw.draw(node);
		}
//		
//		console.log("activities...");
//		console.log(graph);
		
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
//		var j = 0;



		for(var i in DomainModel.Elements){
			//arrange the nodes in the subgraph
			
			
			
			var domainObject = DomainModel.Elements[i];

			var domainObjectToDraw = drawDomainObjectNode(domainObject);
			
			if(domainObjectToDraw){
				graph += dottyDraw.draw(domainObjectToDraw);
				
			}
		}
		
		graph += "label = <<B>Domain Model</B>>;style=\"bold\";};";
		
		

		for(var i in edgesToDomainObjects){
			graph += edgesToDomainObjects[i];
		}

		graph += 'imagepath = \"./public\"}';
		
		console.log("test graph");
		console.log("the modele graph is " + graph);
		dottyUtil.drawDottyGraph(graph, graphFilePath, function(){

			console.log("the usim file is in" +graphFilePath);
			console.log("drawing is down");
		});

		return graph
		
	}

	function drawDomainObjectNode(component){

		var graph = '';
             graph += 'node [fontsize = 8 shape = "record"]';
             graph += ' edge [arrowhead = "ediamond"]'
		
		var curClass = component;

             graph += curClass["_id"];
             graph += '[ id = ' + curClass["_id"];
             graph += ' label = "{';
             graph += filterName(curClass["Name"]);


             var classAttributes = curClass["Attributes"];
             if (classAttributes.length != 0){
                 graph += '|';
                 for(j = 0; j < classAttributes.length; j++) {
                     graph += '-   ' ;
                     graph += filterName(classAttributes[j]["Name"]);
                     graph += ':'+classAttributes[j]["Type"];
                     graph += '\\l';
                 }
             }

             var classOperations = curClass["Operations"];
             if (classOperations.length != 0){
                 graph += '|';
                 for(j = 0; j < classOperations.length;j++) {
                	 graph += '+   ' ;
                     graph += filterName(classOperations[j]["Name"]) + '(';
                     var para_len = classOperations[j]["Parameters"].length;
                     for (k = 0; k < classOperations[j]["Parameters"].length; k++) {
                    	 if(k != 0){
                    		 graph += ",";
                    	 }
                    	 graph += classOperations[j]["Parameters"][k]["Type"];
                     }

                     graph += ')';
                     graph += "\\l";
                 }
             }

             graph += '}"]';

                 
		return graph ;
	}

	function drawTransactionsDiagramFunc(UseCase, DomainModel, graphFilePath, callbackfunc){
		var activities = UseCase.Activities;
		var precedenceRelations = UseCase.PrecedenceRelations;
		console.log(precedenceRelations);
		var graph = 'digraph g {\
			fontsize=24\
			node [shape=plaintext fontsize=24]';
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
			
			var node = drawNode(activity._id, filterName(activity.Name));
			
			if(activity.Stimulus){
				node = drawStimulusNode(activity._id, filterName(activity.Name));
			} else if(activity.OutScope){
				node = drawOutOfScopeNode(activity._id, filterName(activity.Name));
			} else if(activity.Type === "fragment_start" || activity.Type === "fragment_end"){
				node = drawFragmentNode(activity._id, filterName(activity.Name));
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
		
		
		graph += 'imagepath = \"./public\"}';
	
		dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
			console.log("drawing is down");
		});

		return graph;
	}


	
	function drawDomainModelFunc(DomainModel, graphFilePath, callbackfunc){


		var graph = 'digraph g {';
		graph += "node[shape=record]";

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
		
		
//		var j = 0;
		for(var i in DomainModel.Elements){
			//arrange the nodes in the subgraph
			
			
			
			var domainObject = DomainModel.Elements[i];
			var domainObjectToDraw = drawDomainObjectNode(domainObject);
			
			if(domainObjectToDraw){
				graph += dottyDraw.draw(domainObjectToDraw);
				
			}
		}
		
		graph += 'imagepath = \"./public\"}';
		
		dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
			console.log("drawing is down");
		});

		return graph;
		
	}

	function createDomainModelDiagram(domainModel, graphFilePath, callbackfunc){

		console.log("the whole class diagram model is" + domainModel);
		console.log("the whole class diagram model is"+JSON.stringify(domainModel));
		var  domainModelElements = domainModel.Elements;
		      console.log("run the create class dia");
              console.log("class diagram model is"+domainModelElements);
              console.log("class diagram model is"+JSON.stringify(domainModelElements));
              
			var graph = 'digraph class_diagram {';
             graph += 'node [fontsize = 8 shape = "record"]';
             graph += ' edge [arrowhead = "ediamond"]'

            for(i = 0;  i < domainModelElements.length; i++){
                 var curClass = domainModelElements[i];
                 graph += curClass["_id"];
                 graph += '[ id = ' + curClass["_id"];
                 graph += ' label = "{';
                 graph += curClass["Name"];


                 var classAttributes = domainModelElements[i]["Attributes"];
                 if (classAttributes.length != 0){
                     graph += '|';
                     for(j = 0; j < classAttributes.length; j++) {
                         graph += '-   ' ;
                         graph += classAttributes[j]["Name"];
                         graph += ':'+classAttributes[j]["Type"];
                         graph += '\\l';
                     }
                 }


                 var classOperations = domainModelElements[i]["Operations"];
                 if (classOperations.length != 0){
                     graph += '|';
                     for(j = 0; j < classOperations.length;j++) {

                    	 graph += '+   ' ;
                         graph += classOperations[j]["Name"] + '(';
                         var para_len = classOperations[j]["Parameters"].length;
                         for (k = 0; k < classOperations[j]["Parameters"].length; k++) {
                        	 if(k != 0){
                        		 graph += ",";
                        	 }
                        	 graph += classOperations[j]["Parameters"][k]["Type"];
                         }

                         graph += ')';
                         graph += "\\l";
                     }
                 }

                 graph += '}"]';

                 var classAss = domainModelElements[i]["Associations"];
                 if(classAss != null){
                 	for(j = 0; j < classAss.length;j++) {
	                     graph += curClass["_id"] ;
	                     graph += '->';
	                     graph += classAss[j]["id"] + ' ';

	                 }
                 }
                 
			 }

            graph += 'imagepath = \"./public\"}';

     		console.log("the diagram model graph is:"+graph);
			console.log("the graphFilePath is:"+ graphFilePath);
     		dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
     			console.log("class Diagram is done");
     		});

            return graph;
		}

	
	function drawComponentDiagram(dicComponent, graphFilePath, callbackfunc){
		


		if(typeof dicComponent === 'undefined'){
     		return;
     	}

        console.log("dicComponent is "+ dicComponent[Object.keys(dicComponent)[0]]);
        var  dicComponentElements = dicComponent[Object.keys(dicComponent)[0]]["classUnits"];  
        
		var graph = 'digraph class_diagram {';
            graph += 'node [fontsize = 8 shape = "record"]';
            graph += ' edge [arrowhead = "ediamond"]';

        	 for(i = 0;  i < dicComponentElements.length; i++){
        	   
                 var curClass = dicComponentElements[i];
                 
                 graph += i;
                 graph += '[ id = ' + i;
                 graph += ' label = "{';
                 graph += filterName(curClass["name"]);


                 var attrUnits = dicComponentElements[i]["attrUnits"];

                 if ( attrUnits.length != 0){
                     graph += '|';
                     for(j = 0; j < attrUnits.length; j++) {
                   
                         graph += '-   ' ;
                         graph += filterName(attrUnits[j]["name"]);
                         graph += ':'+attrUnits[j]["kind"];
                         graph += '\\l';
                     }
                 }

                 var classMethodUnits = dicComponentElements[i]["methodUnits"];
                 if (classMethodUnits.length != 0){
                     graph += '|';

                     var tempStr = "";
                     for(j = 0; j < classMethodUnits.length;j++) {

                    	 tempStr += '+   ';
                         tempStr += filterName(classMethodUnits[j]["signature"]["name"]) + '(';
                         var para_len = classMethodUnits[j]["signature"]["parameterUnits"].length;
                         for (k = 0; k < classMethodUnits[j]["signature"]["parameterUnits"].length; k++) {
                        	 if(k != 0){
                        		 tempStr += ",";
                        	 }
                        	 tempStr += classMethodUnits[j]["signature"]["parameterUnits"][k]["type"];
                         }
                         tempStr += ')';
                         tempStr += "\\l";
                     }

                     tempStr = tempStr.replace(/</g, "\u02C2");
                     tempStr = tempStr.replace(/>/g, "\u02C3");

                     graph += tempStr;

                 }

                 var classInterfaceUnits = dicComponentElements[i]["interfaceUnits"];
                 if(classInterfaceUnits){
                 if(classInterfaceUnits.length != 0){
                 	graph += '|';
                 }
                 
                 for(j = 0; j < classInterfaceUnits.length;j++) {
                     graph += '*   ';
                     graph += filterName(classInterfaceUnits[j]["name"]) + ' ';
                 		graph += "\\l";
                 }
                 }

                
                 graph += '}"]';
			}
        	
        	
             
         
            graph += 'imagepath = \"./public\"}';

     		dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
     			console.log("class Diagram is done");
     		});

            return graph;

	}



	function drawClassDiagram(dicClassUnits, graphFilePath, callbackfunc){

		fs.writeFile('dicClassUnits.txt', JSON.stringify(dicClassUnits), (err) => {  
		    if (err) throw err; 
		}) 



		var keys = Object.keys(dicClassUnits);

		var graph = 'digraph class_diagram {';
            graph += 'node [fontsize = 8 shape = "record"]';
            graph += ' edge [arrowhead = "ediamond"]';


        	 for(i = 0;  i < keys.length; i++){
        	   
                 var curClass = dicClassUnits[keys[i]];

                 graph += i;
                 
                 graph += '[ id = ' + i;
                 graph += ' label = "{';
                 graph += filterName(curClass["name"]);


                 var attrUnits = curClass["attrUnits"];

                 
             	if ( attrUnits.length != 0){
                     graph += '|';
                     for(j = 0; j < attrUnits.length; j++) {
      
                         graph += '-   ' ;
                         graph += filterName(attrUnits[j]["name"]);
                         graph += '\\l';
                     }
                 }

         		var classMethodUnits = curClass["methodUnits"];
                 if (classMethodUnits.length != 0){
                     graph += '|';
                     var tempStr = "";
                     for(j = 0; j < classMethodUnits.length;j++) {

                    	 tempStr += '+   ';
                    	 console.log(classMethodUnits[j]);
                         tempStr += filterName(classMethodUnits[j]["signature"]["name"]) + '(';
                         console.log(classMethodUnits[j]);
                         var para_len = classMethodUnits[j]["signature"]["parameterUnits"].length;
                         for (k = 0; k < classMethodUnits[j]["signature"]["parameterUnits"].length; k++) {
                        	 if(k != 0){
                        		 tempStr += ",";
                        	 }
                        	 
                        	 tempStr += classMethodUnits[j]["signature"]["parameterUnits"][k]["type"];
                         }
                         tempStr += ')';
                         tempStr += "\\l";
                     }

                     tempStr = tempStr.replace(/</g, "\u02C2");
                     tempStr = tempStr.replace(/>/g, "\u02C3");

                     graph += tempStr;

                 }

         		var classInterfaceUnits = curClass["interfaceUnits"];
         		if(classInterfaceUnits){
                 if(classInterfaceUnits.length != 0){
                 	graph += '|';
                 }
                 
                 for(j = 0; j < classInterfaceUnits.length;j++) {
                     graph += '*   ';
                     graph += filterName(classInterfaceUnits[j]["name"]) + ' ';
                 		graph += "\\l";
                 }
         		}
             	                 
                 graph += '}"]';

			}
        	
     
            graph += 'imagepath = \"./public\"}';

     		console.log("the dicClassUnits graph is:"+graph);

     		console.log("the dicClassUnits is:"+ graphFilePath);

     		dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
     			console.log("class Diagram is done");
     		});

            return graph;
	

		var debug = require("../utils/DebuggerOutput.js");
		debug.writeJson2("class_unit_graph_7_5", dicClassUnits);
		

	}
	
	function drawCompositeClassDiagram(dicCompositeClassUnits, graphFilePath, callbackfunc){

		fs.writeFile('dicCompositeClassUnits.txt', JSON.stringify(dicCompositeClassUnits), (err) => {  
		    if (err) throw err; 
		}) 
		
		var keys = Object.keys(dicCompositeClassUnits);

		var graph = 'digraph class_diagram {';
            graph += 'node [fontsize = 8 shape = "record"]';
            graph += ' edge [arrowhead = "ediamond"]';


        	 for(i = 0;  i < keys.length; i++){
        	   
                 var curClass = dicCompositeClassUnits[keys[i]];

                 graph += i;
                 
                 graph += '[ id = ' + i;
                 graph += ' label = "{';
                 graph += filterName(curClass["name"]);


                 var attrUnits = curClass["attrUnits"];

                 
                if(attrUnits){
             	if ( attrUnits.length != 0){
                     graph += '|';
                     for(j = 0; j < attrUnits.length; j++) {
                         graph += '-   ' ;
                         graph += filterName(attrUnits[j]["name"]);
                         graph += '\\l';
                     }
                 }
                }

                
         		var classMethodUnits = curClass["methodUnits"];
         		if(classMethodUnits){
                 if (classMethodUnits.length != 0){
                     graph += '|';
                     var tempStr = "";
                     for(j = 0; j < classMethodUnits.length;j++) {

                    	 tempStr += '+   ';
                         tempStr += filterName(classMethodUnits[j]["signature"]["name"]) + '(';
                         var para_len = classMethodUnits[j]["signature"]["parameterUnits"].length;
                         for (k = 0; k < classMethodUnits[j]["signature"]["parameterUnits"].length; k++) {
                        	 if(k != 0){
                        		 tempStr += ",";
                        	 }
                        	 tempStr += classMethodUnits[j]["signature"]["parameterUnits"][k]["type"];
                         }
                         tempStr += ')';
                         tempStr += "\\l";
                     }

                     tempStr = tempStr.replace(/</g, "\u02C2");
                     tempStr = tempStr.replace(/>/g, "\u02C3");

                     graph += tempStr;

                 }
         		}

           	                 
                 graph += '}"]';

			}
        	
     
            graph += 'imagepath = \"./public\"}';

//     		console.log("the dicClassUnits graph is:"+graph);
//
//     		console.log("the dicClassUnits is:"+ graphFilePath);

     		dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
     			console.log("class Diagram is done");
     		});

            return graph;

	}
	
	module.exports = {
			drawTransactionsDiagram:drawTransactionsDiagramFunc,
			drawUSIMDiagram: drawUSIMDiagramFunc,
			drawDomainModel: createDomainModelDiagram,
			drawComponentDiagram: drawComponentDiagram,
			drawClassDiagram: drawClassDiagram,
			drawCompositeClassDiagram: drawCompositeClassDiagram
	}
}())









