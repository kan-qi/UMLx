/**
 * This module is used to parse different elements in XMI files to construct the user-system interaction model.
 */
(function() {
	var fs = require('fs');
//	var xml2js = require('xml2js');
//	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	function contains(arr, obj) {  
	    var i = arr.length;  
	    while (i--) {  
	        if (arr[i] === obj) {  
	            return true;  
	        }  
	    }  
	    return false;  
	}  
	
	function parseUserStoryDiagram(XMIUseCases, XMIUMLModel, Model){

		//create a catelog for the actors.
		var XMIScrumEpics = jp.query(XMIUMLModel, '$..[\'Scrum:epic\'][?(@[\'$\'][\'base_UseCase\'])]');
		var XMIScrumUserStories = jp.query(XMIUMLModel, '$..[\'Scrum:userstory\'][?(@[\'$\'][\'base_Class\'])]');
		var XMIScrumTasks = jp.query(XMIUMLModel, '$..[\'Scrum:task\'][?(@[\'$\'][\'base_Class\'])]');
		var XMIDependencies = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\'] == \'uml:Dependency\')]');
		
		var epicsByID = {};
		for(var i in XMIScrumEpics){
			var XMIScrumEpic = XMIScrumEpics[i];
			var epic = {
					_id: XMIScrumEpic['$']['xmi:id'],
					name: XMIScrumEpic['$']['name']
			}
			
			epicsByID[epic._id] = epic;
		}
		
		var tasksByID = {};
		
		for(var i in XMIScrumTasks){
			var XMIScrumTask = XMIScrumTasks[i];
			
			//identify the name by id
			var XMIScrumTaskClasses = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:id\'] == \''+XMIScrumTask['$']['base_Class']+'\')]');
			
			if(!XMIScrumTaskClasses[0]){
				continue;
			}
			
			var task = {
					_id:  XMIScrumTask['$']['base_Class'],
					Name: XMIScrumTaskClasses[0]['$']['name'],
					ProjectManagerEstimate: Number(XMIScrumTask['$']['Project_Manager_Estimate__Person-Hours_']),
					EstimatedDuration: Number(XMIScrumTask['$']['Estimated_Duration__work_days_']),
					ActualEffort: Number(XMIScrumTask['$']['Actual__Person-hours_']),
					DeveloperEstimate: Number(XMIScrumTask['$']['Developer_Estimate__Person-hours_']),
					
			}
			
			tasksByID[task._id] = task;
		}
		
		var userStoryByID = {};
		for(var i in XMIScrumUserStories){
			var XMIScrumUserStory = XMIScrumUserStories[i];
			
			//identify the name by id
			var XMIScrumUserStoryClasses = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:id\'] == \''+XMIScrumUserStory['$']['base_Class']+'\')]');
			
			if(!XMIScrumUserStoryClasses[0]){
				continue;
			}
			
			
			var userStory = {
					_id:  XMIScrumUserStory['$']['base_Class'],
					Name: XMIScrumUserStoryClasses[0]['$']['name'],
					ProjectManagerEstimate: Number(XMIScrumUserStory['$']['Project_Manager_Estimate__Person-Hours_']),
					EstimatedDuration: Number(XMIScrumUserStory['$']['Estimated_Duration__work_days_']),
					ActualEffort: Number(XMIScrumUserStory['$']['Actual__Person-hours_']),
					DeveloperEstimate: Number(XMIScrumUserStory['$']['Developer_Estimate__Person-hours_']),
					Priority:  Number(XMIScrumUserStory['$']['Priority']),
					Tasks: []
			}
		

			userStoryByID[userStory._id] = userStory;
			
		}
		

//		console.log("identifying story classes");
//		console.log(userStoryByID);
//		
		
		for(var i in XMIDependencies){
			var XMIDependency = XMIDependencies[i];
			var supplierID = XMIDependency['$']['client'];
			var clientID = XMIDependency['$']['supplier'];
			
			var userStory = userStoryByID[supplierID];
			var task = tasksByID[clientID];
			if(userStory && task){
			userStory.Tasks.push(task);
			}
			
			var epic = epicsByID[supplierID];
			var userStory = userStoryByID[clientID];
			if(epic){
				userStory.Epic = epic;
			}
			
		}
		
		Model.UserStories = [];
		var UserStoriesByName = {};
		
		for(var i in userStoryByID){
			Model.UserStories.push(userStoryByID[i]);
			UserStoriesByName[userStoryByID[i].Name] = userStoryByID[i];
		}
		
//		console.log("user story output");
//		console.log(Model.UserStories[0].Tasks);
		
	}


	module.exports = {
			parseUserStoryDiagram : parseUserStoryDiagram
	}
}());