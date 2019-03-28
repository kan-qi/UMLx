var fs = require('fs');
var dottyUtil = require("./utils/DottyUtil.js");

var inputDir = process.argv[2];
var outputDir = process.argv[3];

console.log("inputDir is" + inputDir);
console.log("outputDir is" + outputDir);

fs.readFile(inputDir, 'utf-8', (err, str) => {
	dicClassUnits = JSON.parse(str);
	drawClassDiagram(dicClassUnits['classUnits'], graphFilePath);
});



function drawClassDiagram(dicClassUnits, graphFilePath){


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

	}





//  node GenerateEdgeGraphWithComponent.js "./tempData/converted-android-analysis-results-access-graph.json" "./tempData/converted-android-analysis-results-call-graph.json" "./tempData/converted-android-analysis-results-composition-graph.json" "./tempData/converted-android-analysis-results-extension-graph.json" "./tempData/converted-android-analysis-results-type-dependency-graph.json" "./tempData/result1_Use_Component.txt" "./tempData/result2_Use_Component.txt" 




