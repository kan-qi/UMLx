var tasksProcessingUtil = require("../TasksProcessingUtil.js");

tasksProcessingUtil.parseTasksFromCSVFile("C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\DRProjects\\590_weekly_report_submission_resilient_agile_projects.csv", function(tasks){
	console.log("parsed tasks");
	console.log(tasks);

	tasksProcessingUtil.associateTasksWithUseCases(tasks, "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\DRProjects\\tasks_association_graph.dotty", function(){
	console.log("finished");
	});
});

