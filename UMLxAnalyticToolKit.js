var UMLxAnalyticToolKitCore = require("./utils/UMLxAnalyticToolKitCore.js");

//Input xml file directory
var inputDir = process.argv[2];

var outputDir = process.argv[3];

var projectName = process.argv[4];


UMLxAnalyticToolKitCore.analyseSrc(inputDir, outputDir, projectName, function(){

    console.log('analysis finished!');

});