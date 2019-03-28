(function(){
	var fs = require('fs');
	var exec = require('child_process').exec;

	var stringSimilarity = require('string-similarity');

	function matchComponent(activityName, DomainElementsBySN){
		//flatout the domainModel
		
		if(!activityName){
			
			return {
				component: null,
				method: null
			}
		}
		
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
		if(matches.bestMatch.rating > 0.5){
		matchedDomainElement = domainElementsByString[matches.bestMatch.target];
		}
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
		if(matches.bestMatch.rating > 0.5){
		matchedOperationName = operationMatches.bestMatch.target;
		}
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
	
	function matchOperation(operationName, domainElement){
		if(!operationName){
			return null;
		}
		
		var operationStrings = [];
		var operationsByString = {};
		for(var j in domainElement.Operations){
			var operation = domainElement.Operations[j];
			operationStrings.push(operation.Name);
			operationsByString[operation.Name] = operation;
		}
		
//		// create the interface method of the component
//		
//		var operation = {
//				Name: domainElement.Name,
//				Visibility: "public",
//				Parameters: []
//		}
//		
//		for(var i in domainElement.Attributes){
//			var attribute = domainElement.Attributes[i];
//			var parameter = {
//					Name: attribute.Name,
//					Type: attribute.Type
//			}
//			operation.Parameters.push(parameter);
//		}
		
//		operation.Parameters.push(parameter);
		
//		if(operation.Name){
//		operationStrings.push(operation.Name);
//		operationsByString[operation.Name] = operation;
//		}
		
		console.log(operationStrings);
		
		var matchedOperation = null;
		if(operationStrings.length>0){
		var matches = stringSimilarity.findBestMatch(operationName, operationStrings);
		if(matches.bestMatch.rating > 0.5){
			matchedOperation = operationsByString[matches.bestMatch.target];
		}
		}
		
		return matchedOperation;
	}
	
	function standardizeName(name){
		if(!name){
			return "undefined";
		}
		return name.replace(/\s/g, '').toUpperCase();
	}
	
	function matchDomainElement(entityName, DomainElementsBySN){
		//flatout the domainModel
		
		if(!entityName){
			return null;
		}
		
		
		var domainElementStrings = [];
		var domainElementsByString = {};
		for(var i in DomainElementsBySN){
			var domainElement = DomainElementsBySN[i];
			var stringRepresentation = domainElement.Name;
//			for(var j in domainElement.Operations){
//				var operation = domainElement.Operations[j];
//				stringRepresentation += operation.Name;
//			}
			if(stringRepresentation){
			domainElementStrings.push(stringRepresentation);
			domainElementsByString[stringRepresentation] = domainElement;
			}
		}
		
//		console.log(activityName);
//		console.log(DomainElementsBySN);
//		console.log(domainElementStrings);
		
		var matchedDomainElement = null;
//		entityName = entityName.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,' ');
		if(domainElementStrings.length>0){
		console.log("string matching");
		console.log(entityName);
		console.log(domainElementStrings);
		var matches = stringSimilarity.findBestMatch(entityName, domainElementStrings);
		if(matches.bestMatch.rating > 0.2){
		matchedDomainElement = domainElementsByString[matches.bestMatch.target];
		}
		}
		
		console.log(matchedDomainElement);
		
//		var operations = [];
//		for(var i in matchedDomainElement.Operations){
//			var operation = matchedDomainElement.Operations[i];
//			operations.push(operation.Name);
//		}
//		
//		console.log(operations);
//		
//		var matchedOperationName = ""
//		if(operations.length > 0){
//		var operationMatches = stringSimilarity.findBestMatch(activityName, operations);
//		matchedOperationName = operationMatches.bestMatch.target;
//		}
//		
//		var matchedOperation = null;
//		for(var i in matchedDomainElement.Operations){
//			var operation = matchedDomainElement.Operations[i];
//			if(operation.Name === matchedOperationName){
//				matchedOperation = operation;
//			}
//		}
		
		return matchedDomainElement;

	}
	
	
	module.exports = {
			matchComponent:matchComponent,
			matchDomainElement: matchDomainElement,
			matchOperation: matchOperation,
			standardizeName: standardizeName
	}
})();
