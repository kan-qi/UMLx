var dataSheetUtil = require("../../utils/DataSheetUtil.js");

var testModel = require("../../EffortPredictor.js");

//dataSheetUtil.loadJSONFile("./tests/data/model_example.json", function(model){
//	testModel.predictEffort(model, function(modelInfo){
//		console.log(modelInfo['eucp_lm']);
//	});
//});

dataSheetUtil.loadJSONFile("./tests/data/model_example.json", function(model){
	testModel.predictEffortByModel(model, 'eucp_lm', function(modelInfo){
		console.log(modelInfo);
	});
});



