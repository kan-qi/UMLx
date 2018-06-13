var fs = require("fs");
var mkdirp = require("mkdirp");
var rimraf = require('rimraf');

var jp = require('jsonpath');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var eaParser = require('./model_platforms/ea/XMI2.1Parser.js');
var srcParser = require('./model_platforms/src/SrcParser.js');
var vpParser = require('./model_platforms/visual_paradigm/XML2.1Parser.js');

function analyzeUML() {
	//Input xml file directory 
	var inputDir = process.argv[2];
	//Manully setted output directory
	var date = new Date();
    var analysisDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
    var outputDir = "public/analysisResult/"+analysisDate+"@"+Date.now()+"/";

    //create output directory for analysis result
	mkdirp(outputDir, (err) => {
		if(err) {
			console.log("Error: Fail to create output directory!");
			throw(err);
		}

		fs.readFile(inputDir, "utf8", (err, data) => {
			if(err) { 
				console.log("Error: Fail to read XMI file!");
				throw(err);
			}
			
			parser.parseString(data, (err, str) => {
				if(err) {
					console.log("Error: Fail to convert file data to string!");
					throw(err);
				}

				//determine what type of xmi it is
				var xmiParser = null;

				if(jp.query(str, '$..["xmi:Extension"][?(@["$"]["extender"]=="Enterprise Architect")]')[0]) {
					xmiParser = eaParser;
				}

				if(jp.query(str, '$..["xmi:Extension"][?(@["$"]["extender"]=="Visual Paradigm")]')[0]) {
					xmiParser = vpParser;
				}

				if(jp.query(str, '$..["kdm:Segment"]')[0]){
					xmiParser = srcParser;
				}

				if(xmiParser === null) {
					console.log("Error: Could not find XMI Parser!");
					return;
				}
				//extract model information due to different xmi parser
				xmiParser.extractUserSystermInteractionModel(str, outputDir, inputDir, (err, model) => {
					if(err) {
						console.log("Error: Fail to extract model Info!");
						console.log(err);
					}
					console.log("Out Put dir:");
					console.log(outputDir);
					// console.log("Successfully extract model Info and saved them to output Directory: " + outputDir);
				})
			});
		});
	});

	return outputDir;
}

analyzeUML();
