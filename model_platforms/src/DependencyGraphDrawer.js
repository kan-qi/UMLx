

/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 * 
 * This script relies on KDM and Java model 
 * 
 * The goal is the establish the control flow between the modules...
 * Identify the stimuli.
 * Identify the boundary.
 * Identify the sytem components.....
 */
(function() {

	var fs = require('fs');
	var dottyUtil = require("../../utils/DottyUtil.js");
	
	/*
	 * This method is used to draw different dependency graphs between different nodes.
	 */	
	 	function drawNode(id, label){
		
			return '"'+id+'"[label=<\
				<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
				<TR><TD><IMG SRC="img/activity_icon.png"/></TD></TR>\
			 <TR><TD><B>'+processLabel(label)+'</B></TD></TR>\
			</TABLE>>];';
		}


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




		function drawClassDependencyGraph(codeAnalysisResults, outputDir){

			var edgesComponent1 = codeAnalysisResults.accessGraph;
			var edgesComponent2 = codeAnalysisResults.callGraph;
			var edgesComponent3 = codeAnalysisResults.compositionGraph;
			var edgesComponent4 = codeAnalysisResults.extendsGraph;
			var edgesComponent5 = codeAnalysisResults.typeDependencyGraph;

			 nodeType1 = "";
			 nodeType2 = "";

			 var graph = "digraph graphname{";

			 graph += "splines=false;";

			 var count = 0;
			 var myMap = new Map(); 


			 graph += "edge [color=brown]";

			 list = [];
			 count += myMap.size;
			 //count = myMap.size;
			 edgeLabel = "access";
			 edgesComponent =  edgesComponent1["edges"];
			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);
	 
			 graph += "edge [color=black]";
			 list = [];
			 count += myMap.size;
			 //count = myMap.size;
			 edgeLabel = "call";
			 edgesComponent =  edgesComponent2["edges"];
			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);

			
			 

			 graph += "edge [color=yellow]";
			 list = [];
			 count += myMap.size;
			 //count = myMap.size;
			 edgeLabel = "composition";
			 edgesComponent =  edgesComponent3["edges"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);

			 
			 
			  
			 graph += "edge [color=green]";
			 list = [];
			 count += myMap.size;
			 //count = myMap.size;
			 console.log("the map size is" + myMap.size);
			 console.log("the count is" + count);
			 edgeLabel = "extension";
			 edgesComponent =  edgesComponent4["edges"];
			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);
			 //graph = drawItems_UUID_subGraph(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);


			 graph += "edge [color=blue]";
			 list = [];
			 count += myMap.size;
			 //count = myMap.size;
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["edgesLocal"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);

	


			 graph += "edge [color=red]";
			 list = [];
			 count += myMap.size;
			 //count = myMap.size; 
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["edgesParam"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);




			 graph += "edge [color=pink]";
			 list = [];
			 count += myMap.size;
			 //count = myMap.size;
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["edgesReturn"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);

			 graph +="}";

			 console.log("*****************");
			 console.log(myMap.size);
			 var iterator1 = myMap.values();
			 for(var zz = 0; zz < myMap.size; zz ++){
			 	console.log(iterator1.next().value);
			 }
			 keys = Object.keys(myMap);
			 console.log("*****************");


			  console.log("the test outputDir is" + outputDir);

			  console.log("the dependency graph is " + graph);

			 outputDir += "/ClassDependencyGraph.dotty";

			 dottyUtil.drawDottyGraph(graph, outputDir, function(){

			 	console.log("Here is just a test");
			 	console.log("the outputDir is" + outputDir);
			    
			 });

			 return graph;
		}


		function drawClassDependencyGraphGroupedByCompositeClass(codeAnalysisResults, componentInfo, outputDir){

			var edgesComponent1 = codeAnalysisResults.accessGraph;
			var edgesComponent2 = codeAnalysisResults.callGraph;
			var edgesComponent3 = codeAnalysisResults.compositionGraph;
			var edgesComponent4 = codeAnalysisResults.extendsGraph;
			var edgesComponent5 = codeAnalysisResults.typeDependencyGraph;

			var allComposiste = codeAnalysisResults.dicCompositeClassUnits;

			 nodeType1 = ", style=filled, fillcolor=grey";
			 nodeType2 = "";

			 var graph = "digraph graphname{";

			 graph += "splines=false;";

			 
			 var count = 0;
			 var myMap = new Map(); 


			 graph += "edge [color=brown]";

			 list = [];
			 count += myMap.size;
			 edgeLabel = "access";
			 edgesComponent =  edgesComponent1["edges"];
			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);

			 
			 graph += "edge [color=black]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "call";
			 edgesComponent =  edgesComponent2["edges"];
			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);
			 

			 graph += "edge [color=yellow]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "composition";
			 edgesComponent =  edgesComponent3["edges"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);
			 
			  
			 graph += "edge [color=green]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "extension";
			 edgesComponent =  edgesComponent4["edges"];

			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);
			 //graph = drawItems_UUID_subGraph(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);


			 graph += "edge [color=blue]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["edgesLocal"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);


			 graph += "edge [color=red]";
			 list = [];
			 count += myMap.size; 
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["edgesParam"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);


			 graph += "edge [color=pink]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["edgesReturn"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);

			 graph = drawItems_Composist(graph, allComposiste, myMap);

			 graph +="}";

			 outputDir += "/ClassDependencyGraphGroupedByCompositeClass.dotty";



			 dottyUtil.drawDottyGraph(graph, outputDir, function(){

			 	console.log("Here is just a test");
			 	console.log("the outputDir is" + outputDir);
			    
			 });

			 return graph;
        }


        function drawClassDependencyGraphGroupedByComponent(codeAnalysisResults, componentInfo, outputDir){


        	// Miss Component Information.


        	var edgesComponent1 = codeAnalysisResults.accessGraph;
			var edgesComponent2 = codeAnalysisResults.callGraph;
			var edgesComponent3 = codeAnalysisResults.compositionGraph;
			var edgesComponent4 = codeAnalysisResults.extendsGraph;
			var edgesComponent5 = codeAnalysisResults.typeDependencyGraph;

		
			var allComponents = componentInfo.dicComponents;


			 //nodeType1 = ", style=filled, fillcolor=grey";
			 nodeType1 = "";
			 nodeType2 = "";

			 var graph = "digraph graphname{";


			 graph += "splines=false;";

			 
			 var count = 0;
			 var myMap = new Map(); 


			 graph += "edge [color=brown]";

			 list = [];
			 count += myMap.size;
			 edgeLabel = "access";
			 edgesComponent =  edgesComponent1["edges"];
			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);

			 
			 graph += "edge [color=black]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "call";
			 edgesComponent =  edgesComponent2["edges"];
			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);
			 

			 graph += "edge [color=yellow]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "composition";
			 edgesComponent =  edgesComponent3["edges"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);
			 
			  
			 graph += "edge [color=green]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "extension";
			 edgesComponent =  edgesComponent4["edges"];

			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);
			 //graph = drawItems_UUID_subGraph(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);


			 graph += "edge [color=blue]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["edgesLocal"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);


			 graph += "edge [color=red]";
			 list = [];
			 count += myMap.size; 
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["edgesParam"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);

			 

			 graph += "edge [color=pink]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["edgesReturn"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);

			 console.log("the length is " + myMap.size);
			 var iterator1 = myMap.values();
			 for(var zz = 0; zz < myMap.size; zz ++){
			 	console.log(iterator1.next().value);
			 }
			 keys = Object.keys(myMap);
			 console.log("the length is " + keys.length);

			 for (var i = 0, keys = Object.keys(myMap), ii = keys.length; i < ii; i++) {
				  console.log('key : ' + keys[i] + ' val : ' + myMap[keys[i]]);
			 }

			 graph = drawItems_Components(graph, allComponents, myMap);

			 graph +="}";

			 console.log("the dependencyGroupComponent graph is " + graph);


			 outputDir += "/ClassDependencyGraphGroupedByComponent.dotty";


			 fs.writeFile('dependencyGroupComponent.txt', graph, (err) => {
			    if (err) throw err;
			})

			 dottyUtil.drawDottyGraph(graph, outputDir, function(){

			 	console.log("Here is just a test");
			 	console.log("the outputDir is" + outputDir);
			    
			 });

			 return graph;
        }


		function drawCompositeClassDependencyGraph(codeAnalysisResults, outputDir){

			var edgesComponent1 = codeAnalysisResults.accessGraph;
			var edgesComponent2 = codeAnalysisResults.callGraph;
			var edgesComponent3 = codeAnalysisResults.compositionGraph;
			var edgesComponent4 = codeAnalysisResults.extendsGraph;
			var edgesComponent5 = codeAnalysisResults.typeDependencyGraph;


			 nodeType1 = "";
			 nodeType2 = "";

			 var graph = "digraph graphname{";

			 graph += "splines=false;";

			 var count = 0;
			 var myMap = new Map(); 

			 graph += "edge [color=brown]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "access";
			 edgesComponent =  edgesComponent1["edgesComposite"];
			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);

			 
			 graph += "edge [color=black]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "call";
			 edgesComponent =  edgesComponent2["edgesComposite"];
			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);


			 graph += "edge [color=yellow]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "composition";
			 edgesComponent =  edgesComponent3["edgesComposite"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);


			 graph += "edge [color=green]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "extension";
			 edgesComponent =  edgesComponent4["edgesComposite"];
			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);


			 graph += "edge [color=blue]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["nodesLocalComposite"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);


			 graph += "edge [color=red]";
			 list = [];
			 count += myMap.size; 
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["edgesParamComposite"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);


			 graph += "edge [color=pink]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["edgesReturnComposite"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);

			 
			 graph +="}";

			 outputDir += "/CompositeClassDependencyGraph.dotty";

			 dottyUtil.drawDottyGraph(graph, outputDir, function(){
			  console.log("class Diagram is done");
			 });

			return graph;
		}


		function drawCompositeClassDependencyGraphByComponent(codeAnalysisResults, componentInfo, outputDir){

			var edgesComponent1 = codeAnalysisResults.accessGraph;
			var edgesComponent2 = codeAnalysisResults.callGraph;
			var edgesComponent3 = codeAnalysisResults.compositionGraph;
			var edgesComponent4 = codeAnalysisResults.extendsGraph;
			var edgesComponent5 = codeAnalysisResults.typeDependencyGraph;


			var allComponents = componentInfo.dicComponents;

			 nodeType1 = "";
			 nodeType2 = "";

			 var graph = "digraph graphname{";

			 graph += "splines=false;";

			 var count = 0;
			 var myMap = new Map(); 

			 graph += "edge [color=brown]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "access";
			 edgesComponent =  edgesComponent1["edgesComposite"];
			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);

			 
			 graph += "edge [color=black]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "call";
			 edgesComponent =  edgesComponent2["edgesComposite"];
			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);


			 graph += "edge [color=yellow]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "composition";
			 edgesComponent =  edgesComponent3["edgesComposite"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);


			 graph += "edge [color=green]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "extension";
			 edgesComponent =  edgesComponent4["edgesComposite"];
			 graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);


			 graph += "edge [color=blue]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["nodesLocalComposite"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);


			 graph += "edge [color=red]";
			 list = [];
			 count += myMap.size; 
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["edgesParamComposite"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);


			 graph += "edge [color=pink]";
			 list = [];
			 count += myMap.size;
			 edgeLabel = "TypeDepends"; 
			 edgesComponent =  edgesComponent5["edgesReturnComposite"];
			 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);



			 graph = drawItems_Components(graph, allComponents, myMap);

			 
			 graph +="}";

			 outputDir += "/CompositeClassDependencyGraphByComponent.dotty";



			 console.log("The CompositeByComponent graph is" + graph);

			 dottyUtil.drawDottyGraph(graph, outputDir, function(){
			  console.log("class Diagram is done");
			 });

			return graph;
		}


		function drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType) {

			for(i = 0; i < edgesComponent.length; i ++){

				var startUUID = edgesComponent[i]['start']['component']["UUID"];
				var endUUID = edgesComponent[i]['end']['component']["UUID"];

				if(!myMap.has(startUUID)){
					myMap.set(startUUID, count++);
				}

				if(!myMap.has(endUUID)){
					myMap.set(endUUID, count++);
				}

				startUUID = myMap.get(startUUID);
				endUUID = myMap.get(endUUID);

				var flag = true;

				var arrayLength = list.length;
			    for (var j = 0; j < arrayLength; j++) {
			        if(list[j]['start'] == startUUID && list[j]['end'] == endUUID ){
			        	flag = false;
			        	break;
			        }
			    }


			    if(flag == true){
			    	list.push({'start': startUUID, 'end': endUUID});

			     	graph +=startUUID+" [label=\""+ edgesComponent[i]['start']['component']['name'] + "\""+ nodeType +"]   "+endUUID+" [label=\""
					+edgesComponent[i]['end']['component']['name']+ "\""+ nodeType +"]   "+startUUID+"->"+endUUID+" [label=" + edgeLabel +", fontcolor=black]";

					// graph += drawNode(startUUID, edgesComponent[i]['start']['component']['name'])+ "   " + 
					// 		 drawNode(endUUID, edgesComponent[i]['end']['component']['name'])
					// 		 startUUID+"->"+endUUID+" [label=" + edgeLabel +", fontcolor=black]";
			    }
				
			}

			return graph;
		}

		function drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType) {

			for(i = 0; i < edgesComponent.length; i ++){
				var startUUID = edgesComponent[i]['start']['component']["classUnit"];
				var endUUID = edgesComponent[i]['end']['component']["classUnit"];

				if(!myMap.has(startUUID)){
					myMap.set(startUUID, count++);
				}

				if(!myMap.has(endUUID)){
					myMap.set(endUUID, count++);
				}

				startUUID = myMap.get(startUUID);
				endUUID = myMap.get(endUUID);


				var flag = true;

				var arrayLength = list.length;
			    for (var j = 0; j < arrayLength; j++) {
			        if(list[j]['start'] == startUUID && list[j]['end'] == endUUID ){
			        	flag = false;
			        	break;
			        }
			    }

			    if(flag == true){
			    	list.push({'start': startUUID, 'end': endUUID});


			    	graph +=startUUID+" [label=\""+ edgesComponent[i]['start']['component']['name'] + "\""+ nodeType +"]   "+endUUID+" [label=\""
					+edgesComponent[i]['end']['component']['name']+ "\""+ nodeType +"]   "+startUUID+"->"+endUUID+" [label=" + edgeLabel +", fontcolor=black]";

					// graph += drawNode(startUUID, edgesComponent[i]['start']['component']['name'])+ "   " + 
					// 		 drawNode(endUUID, edgesComponent[i]['end']['component']['name'])
					// 		 startUUID+"->"+endUUID+" [label=" + edgeLabel +", fontcolor=black]";
			    }
				

			}
			return graph;
		}

		
		function drawItems_Components(graph, allComponents, myMap) {

			nodeType1 = "style=filled, fillcolor=grey";
			nodeType2 = "";


			 var mySet = new Set();

			var size = Object.keys(allComponents).length; 
			var count = 0;
			for(var i = 0; i < size; i ++){

				var component = allComponents[Object.keys(allComponents)[i]]["classUnits"];
				var name = allComponents[Object.keys(allComponents)[i]]["name"];

				name = name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

				graph += "subgraph cluster_level"+i+"{";

				graph += "label =";
				graph += name+ " ";

				var special_count =0;

				for(j = 0; j < component.length; j ++){
					var UUID = component[j]["UUID"];
					if(myMap.has(UUID)){
						special_count ++; 
					}
				}

				if(special_count > 1){
					for(j = 0; j < component.length; j ++){
						var UUID = component[j]["UUID"];
						if(myMap.has(UUID)){
							graph += myMap.get(UUID) + "[style=filled, fillcolor=grey]" + ";";
							//graph += myMap.get(UUID) + " ;";
							mySet.add(myMap.get(UUID));
							console.log("the number is" + myMap.get(UUID));
						}
					}
				}

				graph += "}";
			}
			return graph;
		}


		function drawItems_Composist(graph, allComponents, myMap) {

			nodeType1 = "style=filled, fillcolor=grey";
			 nodeType2 = "";


			var size = Object.keys(allComponents).length; 

			var count = 0;

			for(var i = 0; i < size; i ++){

				var component = allComponents[Object.keys(allComponents)[i]]["classUnits"];
				var name = allComponents[Object.keys(allComponents)[i]]["name"];

				name = name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

				graph += "subgraph cluster_level"+i+"{";

				graph += "label =";
				graph += name + " ";


				var special_count =0;

				for(j = 0; j < component.length; j ++){
					var UUID = component[j];
					console.log(UUID);
					if(myMap.has(UUID)){
						special_count ++;
					}
				}

				if(special_count > 1){
					for(j = 0; j < component.length; j ++){
						var UUID = component[j];
						console.log(UUID);
						if(myMap.has(UUID)){
							graph += myMap.get(UUID) + "[style=filled, fillcolor=grey]" + ";";
							//graph += myMap.get(UUID) + " ;";
						}
					}
				}


				graph += "}";
			}

			return graph;
		}

	
	module.exports = {
			drawClassDependencyGraph : drawClassDependencyGraph,
			drawClassDependencyGraphGroupedByCompositeClass: drawClassDependencyGraphGroupedByCompositeClass,
			drawClassDependencyGraphGroupedByComponent:  drawClassDependencyGraphGroupedByComponent,
			drawCompositeClassDependencyGraph: drawCompositeClassDependencyGraph,
			drawCompositeClassDependencyGraphByComponent: drawCompositeClassDependencyGraphByComponent
	}
}());
