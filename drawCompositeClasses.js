var fs = require('fs');
var dottyUtil = require("./utils/DottyUtil.js");

var inputDir1 = process.argv[2];
var inputDir2 = process.argv[3];
var inputDir3 = process.argv[4];
var inputDir4 = process.argv[5];
var inputDir5 = process.argv[6];


var outputDir1 = process.argv[7];
var outputDir2 = process.argv[8];
var outputDir3 = process.argv[9];

var obj1;
var obj2;
var obj3;
var obj4;
var obj5;


fs.readFile(inputDir1, 'utf-8', (err, str) => {
	obj1 = JSON.parse(str);
});

fs.readFile(inputDir2, 'utf-8', (err, str) => {
	obj2 = JSON.parse(str);
});

fs.readFile(inputDir3, 'utf-8', (err, str) => {
	obj3 = JSON.parse(str);
});

fs.readFile(inputDir4, 'utf-8', (err, str) => {
	obj4 = JSON.parse(str);
});

fs.readFile(inputDir5, 'utf-8', (err, str) => {
	obj5 = JSON.parse(str);
});


setTimeout(myFunction,2000); 

function myFunction() {
  
  drawComponentDiagram1(obj1, obj2, obj3, obj4, obj5, outputDir1);
  drawComponentDiagram2(obj1, obj2, obj3, obj4, obj5, outputDir2);

}


function drawComponentDiagram1(edgesComponent1, edgesComponent2, edgesComponent3, edgesComponent4, edgesComponent5, graphFilePath){

 nodeType1 = ", style=filled, fillcolor=grey";
 nodeType2 = "";



 var graph = "digraph graphname{";

 
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
 //graph = drawItems_UUID(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);
 graph =  drawItems_UUID_subGraph(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);




 graph += "edge [color=yellow]";
 list = [];
 count += myMap.size;
 edgeLabel = "composition";
 edgesComponent =  edgesComponent3["edges"];
 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);
 //graph = drawItems_classUnit_subGraph(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType2);


  
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
 edgeLabel = "type_dependency"; 
 edgesComponent =  edgesComponent5["edgesLocal"];
 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);


 graph += "edge [color=red]";
 list = [];
 count += myMap.size; 
 edgeLabel = "type_dependency"; 
 edgesComponent =  edgesComponent5["edgesParam"];
 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);


 graph += "edge [color=pink]";
 list = [];
 count += myMap.size;
 edgeLabel = "type_dependency"; 
 edgesComponent =  edgesComponent5["edgesReturn"];
 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);

 graph +="}";

 dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
  console.log("class Diagram is done");
 });

    return graph;
}






function drawComponentDiagram2(edgesComponent1, edgesComponent2, edgesComponent3, edgesComponent4, edgesComponent5, graphFilePath){


 var graph = "digraph graphname{";

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
 edgeLabel = "type_dependency"; 
 edgesComponent =  edgesComponent5["nodesLocalComposite"];
 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);


 graph += "edge [color=red]";
 list = [];
 count += myMap.size; 
 edgeLabel = "type_dependency"; 
 edgesComponent =  edgesComponent5["edgesParamComposite"];
 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);


 graph += "edge [color=pink]";
 list = [];
 count += myMap.size;
 edgeLabel = "type_dependency"; 
 edgesComponent =  edgesComponent5["edgesReturnComposite"];
 graph = drawItems_classUnit(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType1);

 
 graph +="}";

 dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
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
	    }
		
	}

	return graph
}


function drawItems_UUID_subGraph(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType) {


	graph += "subgraph cluster_level1{";
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
	    }
		
	}

	graph += "}";

	return graph
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
	    }
		

	}


	return graph
}

function drawItems_classUnit_subGraph(graph, edgesComponent, myMap, count, list, edgeLabel, nodeType) {
	
	graph += "subgraph cluster_level2{";
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
	    }
		

	}

	graph += "}";

	return graph
}





//  node GenerateEdgeGraphWithComponent.js "./tempData/converted-android-analysis-results-access-graph.json" "./tempData/converted-android-analysis-results-call-graph.json" "./tempData/converted-android-analysis-results-composition-graph.json" "./tempData/converted-android-analysis-results-extension-graph.json" "./tempData/converted-android-analysis-results-type-dependency-graph.json" "./tempData/result1_Use_Component.txt" "./tempData/result2_Use_Component.txt" 



