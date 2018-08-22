var UMLxAnalyticToolKitCore = require("./utils/UMLxAnalyticToolKitCore.js");

//Input xml file directory
var inputDir = process.argv[2];

var outputDir = process.argv[3];
//var times = 1;
//var location_transfer = "";
//var test_loca = "./abc/analysisresults";
//
//if (process.argv[3]) {//
//    outputDir = +"/"+analysisDate+"@"+Date.now();
//
//    for (let j of process.argv[3]) {
//        if (j === '/') times ++;
//    }
//
//    for (let i = 0; i < times; i ++) {
//        location_transfer += "../"
//    }
//    location_transfer += 'public/'
//}
//else {
//    outputDir = "public/analysisResult/"+analysisDate+"@"+Date.now();
//    location_transfer = '../../'
//}


UMLxAnalyticToolKitCore.analyseSrc(inputDir, outputDir, projectName, function(){

    console.log('analysis finished!');

});