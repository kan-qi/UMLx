const umlModelInfoManager = require("./UMLModelInfoManagerMongoDB.js");
const umlFileManager = require("./UMLFileManager.js");
const umlModelExtractor = require("./UMLModelExtractor.js");
const umlEvaluator = require("./UMLEvaluator.js");
const effortPredictor = require("./EffortPredictor.js");
console.l = console.log;
// console.log = function() {};
process.on("message", (packed_obj) => {
    packed_obj = JSON.parse(packed_obj);
    let umlFilePath = packed_obj['umlFilePath']
        , umlModelType = packed_obj['umlModelType']
        , formInfo = packed_obj['formInfo']
        , umlModelName = packed_obj['umlModelName']
        , projectInfo = packed_obj['projectInfo']
        , estimationModel = packed_obj['estimationModel'];
    console.l("in worker, umlfilepath: " + umlFilePath);
    console.l("in worker, package_json: " + packed_obj);
    let return_obj = {};
    umlModelInfoManager.queryTempRepoInfo(function(repoInfo){
        if(!repoInfo){
            return_obj['func'] = 'error';
            return_obj['estimationResults'] = '';
            return_obj['modelInfo'] = '';
            process.send(return_obj);
            return;
        }
        let umlFileInfo = umlFileManager.getUMLFileInfo(repoInfo, umlFilePath, umlModelType, formInfo);
        console.log('umlFileInfo => ' + JSON.stringify(umlFileInfo));
        let modelInfo = umlModelInfoManager.initModelInfo(umlFileInfo, umlModelName, repoInfo);
        modelInfo.projectInfo = projectInfo;
        console.log('updated model info');
        console.log(modelInfo);

        umlModelExtractor.extractModelInfo(modelInfo, function(modelInfo){
            if(!modelInfo){
                return_obj['func'] = 'error';
                return_obj['estimationResults'] = '';
                return_obj['modelInfo'] = '';
                process.send(JSON.stringify(return_obj));
                return;
            }
            console.log("model is extracted");
            umlEvaluator.evaluateModel(modelInfo, function(){
                console.log("model analysis complete");
                effortPredictor.predictEffortByModel(modelInfo, estimationModel, function(estimationResults){
                    if(!estimationResults){
                        console.log("error");
                        return_obj['func'] = 'error';
                        return_obj['estimationResults'] = '';
                        return_obj['modelInfo'] = '';
                        process.send(JSON.stringify(return_obj));
                        return;
                    }
                    modelInfo[estimationModel] = estimationResults;
                    modelInfo.repo_id = repoInfo._id;

//                    umlModelInfoManager.saveEstimation(modelInfo, function(modelInfo){
                        if(formInfo['result_page'] && formInfo['result_page'] === 'simplified'){
                            return_obj['func'] = 'estimationResultPaneSimplified';
                            return_obj['estimationResults'] = estimationResults;
                            return_obj['modelInfo'] = modelInfo;
                            process.send(JSON.stringify(return_obj));
                        }
                        else if(formInfo['result_page'] && formInfo['result_page'] === 'analysis'){
                            return_obj['func'] = 'estimationResultPaneAnalysis';
                            return_obj['estimationResults'] = estimationResults;
                            return_obj['modelInfo'] = modelInfo;
                            process.send(JSON.stringify(return_obj));
                        }
                        else{
                            return_obj['func'] = 'estimationResultPane';
                            return_obj['estimationResults'] = estimationResults;
                            return_obj['modelInfo'] = modelInfo;
                            process.send(JSON.stringify(return_obj));
                        }
//                    });
                });
            });
        });
    });
});