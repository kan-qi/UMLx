/**
 * http://usejsdoc.org/
 */


commitEffortUtil = require("./CommitEffortUtil.js");
csvUtil = require("../../utils/DataSheetUtil.js");

csvUtil.loadCSVFile("./commit_history-1.csv", true, function(data){
csvUtil.loadCSVFile("./timesheet.csv", true, function(timesheet){
	commitEffortUtil.analyseEffort(data, timesheet)
});
});