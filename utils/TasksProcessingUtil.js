(function(){
	var fs = require('fs');
	var csvDataUtil = require("./CSVDataUtil.js");
	var dottyUtil = require("./DottyUtil.js");
	
	function associateTasksWithUseCases(tasks, graphFilePath, callbackfunc){
		var useCases = {
		};
		
		for(var i in tasks){
			var task = tasks[i];
			// preprocess a few fields, for example, effort
			task.Effort = parseTimeRecord(task.Effort);
			
			console.log("processed effort");
			console.log(task.Effort);
			
			var useCaseLabels = task.UseCases.split(",");
			for(var j in useCaseLabels){
			var useCase = useCases[useCaseLabels[j]];
			if(!useCase){
				useCases[useCaseLabels[j]] = {
						Effort: 0,
						Tasks:[]
				};
				useCase = useCases[useCaseLabels[j]];
			}
			
			// there should be some strategies to calculate the time for use cases.
			useCase.Effort += task.Effort;
			
			useCase.Tasks.push(task);
			}
		}
		
		
		// draw the relationship into a diagram
		
		var nodes = [];
		var edges = [];
		
		for(var i in useCases){
			var useCase = useCases[i];
			
			console.log("use case");
			console.log(useCase);
			
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
	
	function parseTimeRecord(timeRecord){
		console.log("time record");
		console.log(timeRecord);
		var daysRex = /^[0-9]+d$/g;
		var dayRecords = timeRecord.match(daysRex);
		var days = 0;
		for(var i in dayRecords){
			days += Number(dayRecords[i].replace(/\D+/g, ''));
		}
		console.log("parsed days");
		console.log(days);
		
		var hoursRex = /^[0-9]+h$/g;
		var hourRecords = timeRecord.match(hoursRex);
		var hours = 0;
		for(var i in hourRecords){
			hours += Number(hourRecords[i].replace(/\D+/g, ''));
			console.log(hourRecords[i].replace(/\D+/g, ''));
		}
		console.log("parsed hours");
		console.log(hours);
		
		var minsRex = /^[0-9]+m$/g;
		var minRecords = timeRecord.match(minsRex);
		var mins = 0;
		for(var i in minRecords){
			mins += Number(minRecords[i].replace(/\D+/g, ''));
		}
		console.log(mins);
		
		return days*8+hours+mins/60;
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
