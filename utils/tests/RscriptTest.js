var RScriptUtil = require("../RScriptUtil.js");

RScriptUtil.runRScript('"./Rscript/OutputStatistics.R" "public/output/repo5b5b5f6d8b8322406095775e/a80a79f0136830ed9a44d613a36862e3/EAID_B3CA0599_A67C_49cf_A642_8840FA403ECD/elementAnalytics.csv"', function(results){
	console.log("parsed results");
	console.log(results);

});

