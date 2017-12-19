/**
 *  Work as a test stub
 */

var modelXMLParser = require('../model_platforms/ea/XMI2.1Parser.js');
var robustnessDiagramDrawer = require('../domainmodel/robustnessdiagram/RobustnessDiagramDrawer.js');
var pathProfiler = require('../domainmodel/robustnessdiagram/RobustnessDiagramProfiler.js');
var diagramProcessor = require('../domainmodel/robustnessdiagram/RobustnessDiagramProcessor.js');
var mkdirp = require('mkdirp');
var fs = require('fs');

var xmlPath = '../data/Experiment/test_model_uml2.1.xml';
var outputDir = "../data/Experiment/output_robustness_diagram";
process.argv.forEach(function (val, index, array) {
	console.log(index + ': ' + val);
	if(index == 2){
		xmlPath = val;
	}
	else if(index == 3){
		outputDir = val;
		
	}
	});
mkdirp(outputDir, function(err) { 

    // path exists unless there was an error
	
	//modelXMLParser.parseXMIModel('./data/2014_spring_577b_use_case_model_uml2.1.xml');
	//modelXMLParser.parseXMIModel('./data/2014_fall_577b_use_case_model_uml2.1.xml');
	modelXMLParser.extractRobustnessDiagrams(xmlPath, function(robustnessDiagrams){
		var pathsProfile = "path,pattern\n";
		var robustnessProfile = "";
		var statistics = "Usecase, avg_degree, avg_path_length, architectural_diff, num_path, num_interface_operation, number_data_operation, number_control, number_partial_matched\n";
		for(var i in robustnessDiagrams) {
		var robustnessDiagram = robustnessDiagrams[i];
		pathsProfile += "\n";
		pathsProfile += robustnessDiagram.Name+"\n";
		robustnessDiagramDrawer.draw(outputDir, robustnessDiagram.Name+'.dotty', robustnessDiagram);
		var robustnessDiagramProfile = pathProfiler.traverseRobustnessDiagram(robustnessDiagram, diagramProcessor);
		var paths = robustnessDiagramProfile.Paths;
		console.log("...............paths.................");
		var avgPathLength = 0;
		var numInterfaceOperation = 0;
		var numDataOperation = 0;
		var numControlOperation = 0;
		var numPartialMatched = 0;
		for(var i in paths){
			var line = "";
			for(var j in paths[i].Elements)
			{
				var element = paths[i]['Elements'][j];
				line += robustnessDiagram.Elements[element].Name+"->";
				avgPathLength++;
			}
			var path = paths[i];
			console.dir(line + path.operation.semantics);
			pathsProfile += line + "," + path.operation.semantics + "\n";
			 
			if(path.operation.pattern === "pattern#1"){
				numDataOperation++;
			}
			else if(path.operation.pattern === "pattern#2"){
				numDataOperation++;
			}
			else if(path.operation.pattern === "pattern#3"){
				numInterfaceOperation++;
			}
			else if(path.operation.pattern === "pattern#4"){
				numControlOperation++;
			}
			else if(path.operation.pattern === "pattern#5"){
				numControlOperation++;
			}
			else{
				numPartialMatched++;
			}
			}
		avgPathLength = avgPathLength/paths.length;
		
		console.log("...............profile................");
		
		robustnessProfile += "Name,"+robustnessDiagram.Name+"\n";
		robustnessProfile += "TotalLinks,"+robustnessDiagram.TotalLinks+"\n";
		robustnessProfile += "ActorNum,"+robustnessDiagram.ActorNum+"\n";
		robustnessProfile += "BoundaryNum,"+robustnessDiagram.BoundaryNum+"\n";
		robustnessProfile += "ControlNum,"+robustnessDiagram.EntityNum+"\n";
		robustnessProfile += "Element, Outbound, Inbound\n";
		
		var elementSet=robustnessDiagram.Elements; // tag: elements
		var avgDegree = 0;
		var elementNum = 0;
		for(var i in elementSet){
			var Element = elementSet[i]; //tag: elements
			robustnessProfile += Element.Name+","+Element.OutboundNumber+","+Element.InboundNumber+"\n";
			avgDegree += Element.InboundNumber;
			elementNum++;
		}
		avgDegree = avgDegree/elementNum;
		statistics += robustnessDiagram.Name.replace(/,/gi, " ")+","+avgDegree+","+avgPathLength+","+(avgDegree*avgPathLength)+","+paths.length+","+numInterfaceOperation+","+numDataOperation+","+numControlOperation+","+numPartialMatched;
		statistics += "\n";
		robustnessProfile += "\n";
		}

		fs.writeFile(outputDir+"/paths.csv", pathsProfile, function(err) {
		    if(err) {
		        return console.log(err);
		    }

		    console.log("Paths are saved!");
		});
		
		fs.writeFile(outputDir+"/robustness_profile.csv", robustnessProfile, function(err){
			 if(err) {
			        return console.log(err);
			    }

			    console.log("Profile was saved!");
		});
		
		fs.writeFile(outputDir+"/statistics.csv", statistics, function(err) {
		    if(err) {
		        return console.log(err);
		    }

		    console.log("Statistics are saved!");
		});
		

});

	
});