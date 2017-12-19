/**
 *  Work as a test stub
 */

var modelXMLParser = require('../model_platforms/ea/XMI2.1Parser.js');
var sequenceDiagramDrawer = require('../domainmodel/sequencediagram/SequenceDiagramDrawer.js');
var pathProfiler = require('../domainmodel/sequencediagram/SequenceDiagramProfiler.js');
var diagramProcessor = require('../domainmodel/sequencediagram/SequenceDiagramProcessor.js');
var mkdirp = require('mkdirp');
var fs = require('fs');

var xmlPath = '../data/Experiment/sequence_example.xml';
var outputDir = "../data/Experiment/output_sequence_diagram";
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
	modelXMLParser.extractSequenceDiagrams(xmlPath, function(sequenceDiagrams){
		var pathsProfile = "path,pattern\n";
		var sequenceProfile = "";
		var statistics = "Usecase, avg_degree, avg_path_length, architectural_diff, num_path, num_interface_operation, number_data_operation, number_control, number_partial_matched\n";
		for(var i in sequenceDiagrams) {
		var sequenceDiagram = sequenceDiagrams[i];
		pathsProfile += "\n";
		pathsProfile += sequenceDiagram.Name+"\n";
		sequenceDiagramDrawer.draw(outputDir, sequenceDiagram, function(){});
		var sequenceDiagramProfile = pathProfiler.traverseSequenceDiagram(sequenceDiagram, diagramProcessor);
		var paths = sequenceDiagramProfile.Paths;
		console.log("...............paths.................");
		var avgPathLength = 0;
		var EQ = 0;
		var EO = 0;
		var EI = 0;
		var unmatched = 0;
		for(var i in paths){
			var line = "";
			var path = paths[i];
			for(var j in path.Elements)
			{
				var element = path['Elements'][j];
				line += sequenceDiagram.Elements[element].Name+"->";
				avgPathLength++;
			}
			
			console.dir(path.operations);
			
			for(var j in path.operations){
				var operation = path.operations[j];
				pathsProfile += line + "," + operation.semantics + "\n";
				 
				if(operation.pattern === "pattern#1"){
					EI++;
				}
				else if(operation.pattern === "pattern#2"){
					EO++;
				}
				else if(operation.pattern === "pattern#3"){
					EQ++;
				}
				else if(operation.pattern === "pattern#4"){
					EI++;
					EQ++;
				}
				else if(operation.pattern === "pattern#5"){
					EQ++;
				}
				else{
					unmatched++;
				}
			}
			
			}
		avgPathLength = avgPathLength/paths.length;
		
		console.log("...............profile................");
		
		sequenceProfile += "Name,"+sequenceDiagram.Name+"\n";
		sequenceProfile += "TotalLinks,"+sequenceDiagram.TotalLinks+"\n";
		sequenceProfile += "ActorNum,"+sequenceDiagram.ActorNum+"\n";
		sequenceProfile += "BoundaryNum,"+sequenceDiagram.BoundaryNum+"\n";
		sequenceProfile += "ControlNum,"+sequenceDiagram.EntityNum+"\n";
		sequenceProfile += "Element, Outbound, Inbound\n";
		
		var elementSet=sequenceDiagram.Elements; // tag: elements
		var avgDegree = 0;
		var elementNum = 0;
		for(var i in elementSet){
			var Element = elementSet[i]; //tag: elements
			sequenceProfile += Element.Name+","+Element.OutboundNumber+","+Element.InboundNumber+"\n";
			avgDegree += Element.InboundNumber;
			elementNum++;
		}
		avgDegree = avgDegree/elementNum;
		statistics += sequenceDiagram.Name.replace(/,/gi, " ")+","+avgDegree+","+avgPathLength+","+(avgDegree*avgPathLength)+","+paths.length+","+EO+","+EI+","+EQ+","+unmatched;
		statistics += "\n";
		sequenceProfile += "\n";
		}

		fs.writeFile(outputDir+"/paths.csv", pathsProfile, function(err) {
		    if(err) {
		        return console.log(err);
		    }

		    console.log("Paths are saved!");
		});
		
		fs.writeFile(outputDir+"/sequence_profile.csv", sequenceProfile, function(err){
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