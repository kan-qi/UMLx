var fs = require('fs');
var dottyUtil = require("./utils/DottyUtil.js");

var inputDir1 = process.argv[2];
var inputDir2 = process.argv[3];
var inputDir3 = process.argv[4];
var inputDir4 = process.argv[5];
var inputDir5 = process.argv[6];


var outputDir = process.argv[7];


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


setTimeout(myFunction,1000); 

function myFunction() {
  drawComponentDiagram(obj1, obj2, obj3, obj4, obj5, outputDir);
}


//node GenerateEdgeGraph.js "./tempData/test1.json" "./tempData/test2.json" "./tempData/test3.json" "./tempData/test4.json" "./tempData/test5.json" "./tempData/test.txt" 

function drawComponentDiagram(edgesComponent1, edgesComponent2, edgesComponent3, edgesComponent4, edgesComponent5, graphFilePath){

 	console.log("edgesComponent1 is " + edgesComponent1);



 	var edgesComponent = edgesComponent1["edges"];

 	var myMap = new Map(); 
 	var count = 0;
	var graph = "digraph graphname{";

	// graph += "edge [color=Blue]";

	// console.log(edgesComponent.length);

	// for(i = 0; i < edgesComponent.length; i ++){
	// 	var startUUID = edgesComponent[i]['start']["UUID"];
	// 	var endUUID = edgesComponent[i]['end']["UUID"];

	// 	if(!myMap.has(startUUID)){
	// 		myMap.set(startUUID, count++);
	// 	}

	// 	if(!myMap.has(endUUID)){
	// 		myMap.set(endUUID, count++);
	// 	}

	// 	startUUID = myMap.get(startUUID);
	// 	console.log(startUUID);

	// 	endUUID = myMap.get(endUUID);
	// 	console.log(endUUID);


	// 	graph +=startUUID+" [label=\""+ edgesComponent[i]['start']['name'] + "\"]   "+endUUID+" [label=\""
	// 	+edgesComponent[0]['end']['name']+ "\"] "+startUUID+"->"+endUUID+" [fontcolor=darkgreen]";
	// }


	// myMap = new Map(); 
	// graph += "edge [color=black]";
	// edgesComponent =  edgesComponent2["edges"];
	// drawItems(graph, edgesComponent, myMap, count);



	// myMap = new Map(); 
	// graph += "edge [color=yellow]";

	// edgesComponent =  edgesComponent3["edges"];
	// drawItems(graph, edgesComponent, myMap, count);



	 
	// graph += "edge [color=green]";

	// myMap = new Map();
	// edgesComponent =  edgesComponent4["edges"];
	// drawItems(graph, edgesComponent, myMap, count);



	
	graph += "edge [color=red]";
	myMap = new Map(); 
	edgesComponent =  edgesComponent5["edgesParam"];
	graph = drawItems(graph, edgesComponent, myMap, count);

	count += myMap.size;
	myMap = new Map(); 
	edgesComponent =  edgesComponent5["edgesReturn"];
	graph = drawItems(graph, edgesComponent, myMap, count);

	count += myMap.size;
	myMap = new Map(); 	
	edgesComponent =  edgesComponent5["edgesParamComposite"];
	graph = drawItems(graph, edgesComponent, myMap, count);

	count += myMap.size;
	myMap = new Map(); 
	edgesComponent =  edgesComponent5["edgesReturnComposite"];
	graph = drawItems(graph, edgesComponent, myMap, count);

	graph +="}";

	dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
		console.log("class Diagram is done");
	});

    return graph;
}


function drawItems(graph, edgesComponent, myMap, count) {
	

	for(i = 0; i < edgesComponent.length; i ++){
		var startUUID = edgesComponent[i]['start']["UUID"];
		var endUUID = edgesComponent[i]['end']["UUID"];

		if(!myMap.has(startUUID)){
			myMap.set(startUUID, count++);
		}

		if(!myMap.has(endUUID)){
			myMap.set(endUUID, count++);
		}

		startUUID = myMap.get(startUUID);
		endUUID = myMap.get(endUUID);

		graph +=startUUID+" [label=\""+ edgesComponent[i]['start']['name'] + "\"]   "+endUUID+" [label=\""
		+edgesComponent[0]['end']['name']+ "\"] "+startUUID+"->"+endUUID+" [fontcolor=darkgreen]";


	}

	return graph
}




function drawComponentDiagram(edgesComponent1, edgesComponent2, edgesComponent3, edgesComponent4, edgesComponent5, graphFilePath){


 var graph = "digraph graphname{";
 graph += "edge [color=Blue]";
 
 var count = 0;
 var myMap = new Map(); 
 var edgesComponent = edgesComponent1["edges"];
 graph = drawItems(graph, edgesComponent, myMap, count);

 count += myMap.size;
 myMap = new Map(); 
 var edgesComponent = edgesComponent1["edgesComposite"];
 graph = drawItems(graph, edgesComponent, myMap, count);


 
 graph += "edge [color=black]";
 
 count += myMap.size;
 myMap = new Map(); 
 edgesComponent =  edgesComponent2["edges"];
 graph = drawItems(graph, edgesComponent, myMap, count);

 count += myMap.size;
 myMap = new Map(); 
 edgesComponent =  edgesComponent2["edgesComposite"];
 graph = drawItems(graph, edgesComponent, myMap, count);



 
 graph += "edge [color=yellow]";

 count += myMap.size;
 myMap = new Map(); 
 edgesComponent =  edgesComponent3["edges"];
 graph = drawItems(graph, edgesComponent, myMap, count);

 count += myMap.size;
 myMap = new Map(); 
 edgesComponent =  edgesComponent3["edgesComposite"];
 graph = drawItems(graph, edgesComponent, myMap, count);



  
 graph += "edge [color=green]";

 count += myMap.size;
 myMap = new Map();
 edgesComponent =  edgesComponent4["edges"];
 graph = drawItems(graph, edgesComponent, myMap, count);

 count += myMap.size;
 myMap = new Map();
 edgesComponent =  edgesComponent4["edgesComposite"];
 graph = drawItems(graph, edgesComponent, myMap, count);

 



 
 graph += "edge [color=red]";

 count += myMap.size;
 myMap = new Map(); 
 edgesComponent =  edgesComponent5["edgesParam"];
 graph = drawItems(graph, edgesComponent, myMap, count);

 count += myMap.size;
 myMap = new Map(); 
 edgesComponent =  edgesComponent5["edgesReturn"];
 graph = drawItems(graph, edgesComponent, myMap, count);

 count += myMap.size;
 myMap = new Map();  
 edgesComponent =  edgesComponent5["edgesParamComposite"];
 graph = drawItems(graph, edgesComponent, myMap, count);

 count += myMap.size;
 myMap = new Map(); 
 edgesComponent =  edgesComponent5["edgesReturnComposite"];
 graph = drawItems(graph, edgesComponent, myMap, count);

 graph +="}";

 dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
  console.log("class Diagram is done");
 });

    return graph;
}








