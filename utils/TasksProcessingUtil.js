(function(){
	var fs = require('fs');
	var csvDataUtil = require("./CSVDataUtil.js");
	var dottyUtil = require("./DottyUtil.js");
	
	function associateTasksWithUseCases(tasks, graphFilePath, callbackfunc){
		var useCases = {
		};
		
		for(var i in tasks){
			var task = tasks[i];
			var useCaseLabels = task.UseCases.split(",");
			for(var j in useCaseLabels){
			var useCase = useCases[useCaseLabels[j]];
			if(!useCase){
				useCases[useCaseLabels[j]] = {Tasks:[]};
				useCase = useCases[useCaseLabels[j]];
			}
			useCase.Tasks.push(task);
			}
		}
		
		console.log("use cases");
		console.log(useCases);
		
		// draw the relationship into a diagram
		
		var nodes = [];
		var edges = [];
		
		for(var i in useCases){
			var useCase = useCases[i];
			var useCaseLabel = i.substring(1,5);
			nodes.push(useCaseLabel);
			console.log(i);
			var tasks = useCase.Tasks;
			for(var j in tasks){
				var taskLabel = tasks[j].Description.substring(1,5);
				console.log(taskLabel);
				nodes.push(taskLabel);
				edges.push({start: taskLabel, end: useCaseLabel});
				
			}
		}
		
		console.log("nodes");
		console.log(nodes);
		console.log("edges");
		console.log(edges);
		
		dottyUtil.drawPlainDiagram(nodes, edges, graphFilePath, callbackfunc);
	}
	
	function parseTasksFromCSVFile(csvFile, callbackfunc){
		csvDataUtil.loadCSVFile(csvFile, true, function(tasks){
			console.log("parsed tasks");
			console.log(tasks);
			if(callbackfunc){
				callbackfunc(tasks);
			}
		});
	}
	
	module.exports = {
			parseTasksFromCSVFile: parseTasksFromCSVFile,
			associateTasksWithUseCases:associateTasksWithUseCases
	}
})();
