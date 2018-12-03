
var testProject57 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\VisualParadigmAnalysis";

var rufuslabsProjects = [
    testProject57
];

var fs = require('fs');
var exec = require('child_process').exec;

var UMLxAnalyticToolKit = require("../../utils/UMLxAnalyticToolKitCore.js");

function analyseRepo(){

    //use promise to construct the repo objects
    function analyseProject(projectPath){
        return new Promise((resolve, reject) => {

            var outputFolder = projectPath+"\\visual_paradigm_analysis";
//            var inputFile = projectPath + "/eclipse_gen_umlx_kdm.xmi";
            var inputFile = projectPath + "\\visual_paradigm_example_8_24.xml.uml";

            fs.exists(inputFile, (exists) => {
                if(!exists){
                    console.log(inputFile+" doesn't exist.");
                    resolve();
                }
                else{
                    //to generate svg file.
                    UMLxAnalyticToolKit.analyseSrc(inputFile, outputFolder, "visual_paradigm_analysis", function(){

                        console.log('analysis finished!');

                        resolve();

                    });

                }
            });

        });
    }

    return Promise.all(rufuslabsProjects.map(projectPath=>{
        return analyseProject(projectPath);
    })).then(
        function(){
            return new Promise((resolve, reject) => {
                setTimeout(function(){
                    console.log("analysis finished");
                    resolve();

                }, 0);
            });
        }

    ).catch(function(err){
        console.log(err);
    });

}

analyseRepo();
