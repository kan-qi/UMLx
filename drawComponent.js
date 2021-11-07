var fs = require('fs');
var dottyUtil = require("./utils/DottyUtil.js");

var inputDir = process.argv[2];
var outputDir = process.argv[3];

var obj;

fs.readFile(inputDir, 'utf-8', (err, str) => {
	obj = JSON.parse(str);
	drawComponentDiagram(obj, outputDir);
});



function drawComponentDiagram(allComponents, graphFilePath){

 nodeType1 = ", style=filled, fillcolor=grey";
 nodeType2 = "";

 var graph = "digraph graphname{";

 var count = 0;
 var myMap = new Map(); 


 graph += "edge [color=brown]";

 list = [];
 count += myMap.size;
 Components =  allComponents["edges"];
 graph = drawItems_Components(graph, Components, myMap, count, list, edgeLabel, nodeType2);

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



function drawItems_Components(graph, allComponents, myMap, count, list, edgeLabel, nodeType) {


	var size = Object.keys(allComponents).length; 


	for(int i = 0; i < size; i ++){

		var component = allComponents[Object.keys(allComponents)[i]];

		graph += "subgraph {";

		for(i = 0; i < edgesComponent.length; i ++){

	    	graph +=startUUID+" [label=\""+ edgesComponent[i]['start']['component']['name'] + "\""+ nodeType +"]   "+endUUID+" [label=\""
			+edgesComponent[i]['end']['component']['name']+ "\""+ nodeType +"]   "+startUUID+"->"+endUUID+" [label=" + edgeLabel +", fontcolor=black]";
	    			
		}

		graph += "}";
	}

	return graph
}









//  node GenerateEdgeGraphWithComponent.js "./tempData/converted-android-analysis-results-access-graph.json" "./tempData/converted-android-analysis-results-call-graph.json" "./tempData/converted-android-analysis-results-composition-graph.json" "./tempData/converted-android-analysis-results-extension-graph.json" "./tempData/converted-android-analysis-results-type-dependency-graph.json" "./tempData/result1_Use_Component.txt" "./tempData/result2_Use_Component.txt" 




