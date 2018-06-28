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
		var XMIScrumEpics = jp.query(XMIUMLModel, '$..\'Scrum:epic\'[?(@[\'$\'][\'base_UseCase\'])]');
		var XMIScrumUserStories = jp.query(XMIUMLModel, '$..\'Scrum:userstory\'[?(@[\'$\'][\'base_Class\'])]');
		var XMIScrumTasks = jp.query(XMIUMLModel, '$..\'Scrum:task\'[?(@[\'$\'][\'base_Class\'])]');
		var XMIDependencies = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\'] == \'uml:Dependency\')]');
		
		var tasksByID = {};
		for(var i in XMIScrumTasks){
			var XMIScrumTask = XMIScrumTasks[i];
			var task = {
					_id:  XMIScrumTask['$']['base_Class'],
					ProjectManagerEstimate: XMIScrumTask['$']['Project_Manager_Estimate__Person-Hours_'],
					EstimatedDuration: XMIScrumTask['$']['Estimated_Duration__work_days_'],
					ActualEffort: XMIScrumTask['$']['Actual__Person-hours_'],
					DeveloperEstimate: XMIScrumTask['$']['Developer_Estimate__Person-hours_'],
					
			}
			
			tasksByID[task._id] = task;
		}
		
		var userStoryByID = {};
		for(var i in XMIScrumUserStories){
			var XMIScrumUserStory = XMIScrumUserStroies[i];
			var userStory = {
					_id:  XMIScrumTask['$']['base_Class'],
					ProjectManagerEstimate: XMIScrumTask['$']['Project_Manager_Estimate__Person-Hours_'],
					EstimatedDuration: XMIScrumTask['$']['Estimated_Duration__work_days_'],
					ActualEffort: XMIScrumTask['$']['Actual__Person-hours_'],
					DeveloperEstimate: XMIScrumTask['$']['Developer_Estimate__Person-hours_'],
					Priority:  XMIScrumTask['$']['Priority'],
					Tasks: []
			}
		

			userStoryByID[userStory._id] = userStory;
			
		}
		
		for(var i in XMIDependencies){
			var XMIDependency = XMIDependencies[i];
			var supplierID = XMIDependency['$']['supplier'];
			var clientID = XMIDependency['$']['client'];
			
			var userStory = userStoryByID[supplierID];
			var task = tasksByID[clientID];
			userStoryTasks.push(task);
		}
		
	}


	module.exports = {
			parseUserStoryDiagram : parseUserStoryDiagram
	}
}());