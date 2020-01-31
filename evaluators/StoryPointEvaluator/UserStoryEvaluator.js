/**
 * http://usejsdoc.org/
 * 
 * Integrate use case point evaluator to calculate eucp, exucp, ducp
 * 
 * Includes the methods  to calculate EUCP, EXUCP, DUCP, 
 */


(function() {
	
	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	
	
	function toModelEvaluationHeader(){
		return "Num_User_Story, Num_Tasks, project_manager_estimate, developer_estimate";
	}
	
	function toModelEvaluationRow(modelInfo, index){

		return modelInfo['UserStoryData'].UserStoryNum+","+
		modelInfo['UserStoryData'].TaskNum+","+
		modelInfo['UserStoryData'].project_manager_estimate+","+
		modelInfo['UserStoryData'].developer_estimate;
	}
	
	
	function evaluateModel(modelInfo){
		//calculate the normalized use case point effort.
		
		modelInfo['UserStoryData'] = {
				user_story_num: 0,
				task_num: 0,
				project_manager_estimate: 0,
				developer_estimate: 0
		}
		
		// iterate through the use cases and associate it use user stories
		
		var userStoryNum = 0;
		var taskNum = 0;
		var projectManagerEstimate = 0;
		var developerEstimate = 0;
		
		for(var i in modelInfo.UserStories){
			var userStory = modelInfo.UserStories[i];
			userStoryNum++;
			
			var projectManagerEstimateForUserStory = 0;
			var developerEstimateForUserStory = 0;
			for(var j in userStory.Tasks){
				var task = userStory.Tasks[j];
				taskNum++;
				projectManagerEstimateForUserStory += task.ProjectManagerEstimate;
				developerEstimateForUserStory += task.DeveloperEstimate;
			}
			
			if(!userStory.ProjectManagerEstimate || userStory.ProjectManagerEstimate === 0){
				userStory.ProjectManagerEstimate = projectManagerEstimateForUserStory;
			}
			
			if(!userStory.DeveloperEstimate || userStory.DeveloperEstimate === 0){
				userStory.DeveloperEstimate = developerEstimateForUserStory;
			}
			
			projectManagerEstimate += projectManagerEstimateForUserStory;
			developerEstimate += developerEstimateForUserStory;
		}
		
		modelInfo['UserStoryData'].UserStoryNum = userStoryNum;
		modelInfo['UserStoryData'].TaskNum = taskNum;
		modelInfo['UserStoryData'].project_manager_estimate = projectManagerEstimate;
		modelInfo['UserStoryData'].developer_estimate = developerEstimate;
		
	}
	

	module.exports = {
		toModelEvaluationHeader: toModelEvaluationHeader,
		toModelEvaluationRow: toModelEvaluationRow,
		evaluateModel: evaluateModel
	}
	
	
}())