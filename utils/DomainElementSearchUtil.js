(function(){
	var fs = require('fs');
	var exec = require('child_process').exec;

	var stringSimilarity = require('string-similarity');

	function matchComponent(activityName, DomainElementsBySN){
		//flatout the domainModel
		
		var domainElementStrings = [];
		var domainElementsByString = {};
		for(var i in DomainElementsBySN){
			var domainElement = DomainElementsBySN[i];
			var stringRepresentation = i;
			for(var j in domainElement.Operations){
				var operation = domainElement.Operations[j];
				stringRepresentation += operation.Name;
			}
			domainElementStrings.push(stringRepresentation);
			domainElementsByString[stringRepresentation] = domainElement;
		}
		
		console.log(activityName);
		console.log(DomainElementsBySN);
		console.log(domainElementStrings);
		
		var matchedDomainElement = {};
		if(domainElementStrings.length>0){
		var matches = stringSimilarity.findBestMatch(activityName, domainElementStrings);
		matchedDomainElement = domainElementsByString[matches.bestMatch.target];
		}
		
		console.log(matchedDomainElement);
		
		var operations = [];
		for(var i in matchedDomainElement.Operations){
			var operation = matchedDomainElement.Operations[i];
			operations.push(operation.Name);
		}
		
		console.log(operations);
		
		var matchedOperationName = ""
		if(operations.length > 0){
		var operationMatches = stringSimilarity.findBestMatch(activityName, operations);
		matchedOperationName = operationMatches.bestMatch.target;
		}
		
		var matchedOperation = null;
		for(var i in matchedDomainElement.Operations){
			var operation = matchedDomainElement.Operations[i];
			if(operation.Name === matchedOperationName){
				matchedOperation = operation;
			}
		}
		
		return {
			component: matchedDomainElement,
			method: matchedOperation
		}

	}
	
	
	module.exports = {
			matchComponent:matchComponent
	}
})();
