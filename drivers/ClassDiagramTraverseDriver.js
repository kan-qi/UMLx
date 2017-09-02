/**
 *  Work as a test stub
 */

var modelXMLParser = require('../model_platforms/ea/XMI2.1Parser.js');
var classDiagramDrawer = require('../domainmodel/classdiagram/ClassDiagramDrawer.js');
var pathProfiler = require('../domainmodel/classdiagram/ClassDiagramProfiler.js');
var diagramProcessor = require('../domainmodel/classdiagram/ClassDiagramProcessor.js');
var eval = require('eval');
var mkdirp = require('mkdirp');
var fs = require('fs');

var xmlPath = '../data/Experiment/class_example.xml';
var outputDir = "../data/Experiment/output_class_diagram";
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
	modelXMLParser.extractClassDiagrams(xmlPath, function(classDiagrams){
		var statistics = "class_diagram, num_attribute, num_operation, DET, RET, ILF, EIF\n";
//		console.log(classDiagrams);
		for(var i in classDiagrams) {
		var classDiagram = classDiagrams[i];
		classDiagramDrawer.draw(outputDir, classDiagram, function(){});
		var numAttribute = classDiagram.Attributes.length;
		var numOperation = classDiagram.Operations.length;
		var DET = numAttribute;
		var RET = 1;
		var ILFEvaluation = [
			['', 'x>=1&&x<=19', 'x>=20&&x<=50', 'x>50'],
			['y==1', '7', '7', '10'],
			['y>=2&&y<=5', '7', '10', '15'],
			['y>5', '10', '15', '15'],
		];
		var EIFEvaluation = [
			['', 'x>=1&&x<=19', 'x>=20&&x<=50', 'x>50'],
			['y==1', '5', '5', '7'],
			['y>=2&&y<=5', '5', '7', '10'],
			['y>5', '7', '10', '10'],
		];
		var ILF = 0;
//		console.log(ILFEvaluation[0]);
//		console.log(numAttribute);
		if(DET > 0 & RET > 0){
		for(var j = 1; j<ILFEvaluation[0].length; j++){
			var ILFCondition = ILFEvaluation[0][j];
			var detEvaluationStr = "var x="+DET+";if("+ILFCondition+"){module.exports = true;}else{module.exports = false;}";
			var detResult = eval(detEvaluationStr);
			if(detResult){
				for(var k= 1; k<ILFEvaluation.length; k++ ){
					var EIFCondition = ILFEvaluation[k][j];
					var retEvaluationStr = "var y="+RET+";if("+EIFCondition+"){module.exports = true;}else{module.exports = false;}";
					var retResult = eval(retEvaluationStr);
//					console.log(retResult);
					if(retResult){
						ILF = ILFEvaluation[j][k];
						break;
					}
				}
			break;
			}
		}
		}
//		console.log(ILF);
		var EIF = 0;
		statistics += classDiagram.Name.replace(/,/gi, " ")+","+
					numAttribute+","+
					numOperation+","+
					DET+","+
					RET+","+
					ILF+","+
					EIF+"\n";

		fs.writeFile(outputDir+"/statistics.csv", statistics, function(err) {
		    if(err) {
		        return console.log(err);
		    }

		    console.log("Statistics are saved!");
		});
		
		}
});

	
});