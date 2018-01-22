/*
 * Script Name: count numbers of the independent paths for each type of operational scenarios 
 * Author: kqi
 * Purpose: to search through the diagram to find out all the independent paths, 
 * and to find out the corresponding operational scenarios they corresponds.
 * There are five different identified basic operational scenarios:
 * 1. actor -> boundary -> control -> entity, mainly for data management
 * 2. actor -> boundary -> control -> entity -> control -> boundary, mainly for data management with feedback
 * 3. actor -> boundary -> control -> boundary, mainly for validation or interface management
 * 4. actor1 -> boundary -> control -> actor2, mainly for calling for service outside of the system
 * 5. actor2 -> control -> entity, mainly for outside system calling all services from the system
 * 
 * I'll have to rework on the pattern tree. To integrate widecard functionality.
 * 
 * summary: search for independent paths, and recognize the patterns.
 * Date: 8/9/2017
 * 
 * There is no functional operations any more, the hierarchy of operational characteristics are listed below:
 * 
 * transaction (TN): {
 *  control (CTRL): {
 *  	data management (DM) : {
 *  		external input (EI),
 *  		external inquiry (EQ)
 *  	}
 *      interface management (INT),
 *      external invocation (EXTIVK),
 *      external call (EXTCLL)
 *  }
 * }
 */

(function(){
	//the last element is the pattern type. 0 is reserved for not matched type
	 //for the partially matched elements, the value should be a distribution.
//	 var transactionalPatterns = [
//	 ['actor', 'boundary', 'control[+]', 'entity', 'pattern#1', 'data management', 'transactional'],
//	 ['actor', 'boundary', 'control[+]', 'entity', 'control[+]', 'boundary','pattern#2','data management with feedback', 'transactional'],
//	 ['actor', 'boundary', 'control[+]', 'boundary', 'pattern#3', 'validation or interface management', 'transactional'],
//	 ['actor', 'boundary', 'control[+]', 'actor', 'pattern#4', 'Invocation from external system', 'transactional'],
//	 ['actor', 'control[+]', 'entity','pattern#5', 'Invocation of services provided by external system', 'transactional']
//	 ];
//	 
//	 var transactionalPatterns = [
//		 ['actor', 'boundary', 'control[+]', 'entity', 'pattern#1', 'EI', 'transactional','Data management'],
//		 ['actor', 'boundary', 'control[+]', 'entity', 'control[+]', 'boundary','pattern#2','EQ,INT', 'transactional', 'Data management with feedback or inquiry'],
//		 ['actor', 'boundary', 'control[+]', 'boundary', 'pattern#3', 'INT', 'transactional', 'validation or interface management'],
//		 ['actor', 'boundary', 'control[+]', 'actor', 'pattern#4', 'EXTIVK', 'transactional','Invocation from external system'],
//		 ['actor', 'control[+]', 'actor', 'pattern#5', 'EXTIVK', 'transactional','Invocation from external system'],
//		 ['actor', 'boundary', 'control[+]', 'entity', 'control[+]', 'actor', 'pattern#6', 'EXTIVK,EQ', 'transactional','Invocation from external system'],
//		 ['actor', 'control[+]', 'entity','pattern#7', 'EXTCLL,EI', 'transactional', 'Invocation of services provided by external system'],
//		 ['actor', 'control[+]', 'boundary','pattern#8', 'EXTCLL,INT', 'transactional', 'Invocation of services provided by external system'],
//		 ['actor', 'control[+]', 'pattern#9', 'CTRL', 'transactional','Control flow without operating on any entities or interfaces'],
//	];
	 

	
	//[] represents the similarity across the patterns.
	//# represents tags for the elements within the same pattern. To distinguish an element in the pattern.
	//Building patterns with exact representation, but parsing the condition when matching
	 
	
	 
	 function establishPatternParseTree(patterns)
	 {
		 var patternRoot = {
	 		label: 'root',
	 		childElements: new Array()
	 	};
	 	
	 	for (var i=0; i < patterns.length; i++){
	 		var pattern = patterns[i];
	 		var currentElement = patternRoot;
	 		for(var j=0; j< pattern.length; j++){
	 			var patternElement = pattern[j];
	 			if(!currentElement.childElements){
	 				currentElement.childElements = new Array();
	 			}
	 			var childElements = currentElement.childElements;
	 			var matchedChildElement = null;
	 			for (var m=0; m < childElements.length; m++){
	 				var childElement = childElements[m];
	 				if(childElement.label == patternElement){
	 					matchedChildElement = childElement;
	 				}
	 			}
	 			if(matchedChildElement == null){
	 				matchedChildElement = {
	 					label: patternElement
	 				};
	 				childElements.push(matchedChildElement);
	 			}
	 /** potential use of distinguish patterns as prefix of other patterns
	  *  this problem is avoided by adding a number at the end of pattern to indicate
	  *  the type of the pattern.
	 			if(j == pattern.length -1 ){
	 				matchedChildElement.childElements.push(
	 					{
	 						label: '[leaf]',
	 					}
	 				);
	 			}
	 			
	 **/			currentElement = matchedChildElement;
	 		}
	 	}
	 	
//	 	console.log(patternRoot);
	 	return patternRoot;
	 }
	 
	 function recognizePattern(path, diagram, patternRoot){
		 	var preprocessedPath = new Array();
			for(var i=0; i<path.Elements.length; i++){
				var element = diagram['Elements'][path['Elements'][i]];
				preprocessedPath.push(element.Type);
			}
			
//			console.log(preprocessedPath);
				
			var regIndexOfLabel = function (elements, rx) {
		        for (var i in elements) {
		            if (elements[i].label.toString().match(rx)) {
		                return i;
		            }
		        }
		        return false;
		    };
		    
			var nextElements = function (currentElement, target) {
				var matchedElements = [];
				var label = currentElement.label;
				var matchingConditions = label.match(/\[.*\]/g);
//				console.log(matchingConditions);
				var matchingLabel = label.replace(/\[.*\]/g, '');
				
				if(matchingLabel === target && matchingConditions && (matchingConditions.indexOf('[+]') != 1)) {
					matchedElements.push(currentElement);
				}
				
		        for (var i in currentElement.childElements) {
		        	var childLabel = currentElement.childElements[i].label;
		        	var childMatchingConditions = childLabel.match(/\[.*\]/g);
					var childMatchingLabel = childLabel.replace(/\[.*\]/g, '');
					
					if(childMatchingLabel === target) {
						matchedElements.push(currentElement.childElements[i]);
					}
		        }
		        return matchedElements;
		    };
			
			var currentPatternElements = [patternRoot];
			var searchIndex = 0;
			
//			console.log('===========Search Pattern============');
			while(searchIndex < preprocessedPath.length){
				var matchingTarget = preprocessedPath[searchIndex];
//				console.log(matchingTarget);
				var patternElement = null;
				var matchedPatternElementArray = [];
				while((patternElement = currentPatternElements.shift())){
					matchedPatternElementArray = matchedPatternElementArray.concat(nextElements(patternElement, matchingTarget));
				}
				currentPatternElements = matchedPatternElementArray;
				searchIndex ++;
			}
//			console.log(currentPatternElements);
//			console.log('--------------------------------------');
			
			var matchedPatterns = [];
			for(var i in currentPatternElements){
				var matchedPatternElement = currentPatternElements[i];
				var indexOfType = regIndexOfLabel(matchedPatternElement.childElements, /^pattern#\d+$/i);
				if(indexOfType){
					matchedPatterns.push(
							{
								pattern: matchedPatternElement.childElements[indexOfType].label,
								semantics: matchedPatternElement.childElements[indexOfType].childElements[0].label,
								type: matchedPatternElement.childElements[indexOfType].childElements[0].childElements[0].label,
								comment: matchedPatternElement.childElements[indexOfType].childElements[0].childElements[0].childElements[0].label
							}
					);
				}
			}
			

			
			return matchedPatterns;
		}
	 
//	var functionalPatternTreeRoot = establishPatternParseTree(functionalPatterns);
//	var transactionalPatternTreeRoot = establishPatternParseTree(transactionalPatterns);
	
	function matchCategories(categories, characteristic){
//		console.log(categories);
//		console.log("characteristic");
//		console.log(characteristic);
		var categoriesToReturn = [];
		for(var category in categories){
			var results = ((function(category, categories){
//			console.log('categories.....');
//			console.log(category);
			if(category === characteristic){
					return [category];
			}
			else if(categories[category] === "#"){
					return [];
			}
			else {
				var matchedCategories = matchCategories(categories[category], characteristic);
				if(matchedCategories.length > 0){
					matchedCategories.unshift(category);
				}
				return matchedCategories;
			}
		})(category, categories));
		
//		console.log("result------------");
//		console.log(results);
		for(var i in results){
			if(categoriesToReturn.indexOf(results[i]) == -1){
				categoriesToReturn.push(results[i]);
			}
		}
		}
		
		return categoriesToReturn;
	}
	
	module.exports = {
			processDiagram: function(diagram, usecase){
				return true;
			},
			processPath: function(path, diagram, usecase){
				var pathLength = 0;
				var avgDegree = 0;
				var archDiff = 0;
				var boundaryNum = 0;
				var controlNum = 0;
				var entityNum = 0;
				var actorNum = 0;
				var PathStr = "";
				for(var i = 0; i < path.Elements.length; i++)
				{
					var elementID = path['Elements'][i];
					var element = diagram.Elements[elementID];
					if(!element){
						return false;
					}
					avgDegree += element.InboundNumber;
					pathLength++;
					PathStr += element.Name;
					if(i != path.Elements.length - 1){
						PathStr += "->";
					}
					
					if(element.Type=="actor")actorNum++;
					if(element.Type=="boundary")boundaryNum++;
					if(element.Type=="control")controlNum++;
					if(element.Type=="entity")entityNum++;
				}
				path.PathStr = PathStr;
				if(pathLength > 0){
					avgDegree = avgDegree / pathLength;
				}
				else {
					avgDegree = 0;
				}
				archDiff = avgDegree*pathLength;
				
				path.pathLength = pathLength;
				path.avgDegree = avgDegree;
				path.archDiff = archDiff;
				path.boundaryNum = boundaryNum;
				path.controlNum = controlNum;
				path.entityNum = entityNum;
				path.actorNum = actorNum;
				
				path.Operations = {};
				var functionalOperations = recognizePattern(path, diagram, functionalPatternTreeRoot);
				var functionalOperationStr = "";
				for(var i=0; i < functionalOperations.length; i++){
					if(i !== 0){
						functionalOperationStr += ",";
					}
					functionalOperationStr += functionalOperations[i].semantics;
				}
				
				if(functionalOperationStr !== ''){
				path.Operations.functional = functionalOperationStr.split(/,/g);
				}
				else{
				path.Operations.functional = ['FUNC_NA'];
				}
				
				var transactionalOperations = recognizePattern(path, diagram, transactionalPatternTreeRoot);
				var transactionalOperationStr = "";
				for(var i=0; i < transactionalOperations.length; i++){
					if(i !== 0){
						transactionalOperationStr += ",";
					}
					transactionalOperationStr += transactionalOperations[i].semantics;
					}
					if(transactionalOperationStr !== ''){
						var operationalCharacteristics = transactionalOperationStr.split(/,/g);
						// search the characteristics hierarchy to identify the categories
//						console.log('operational characteristics');
//						console.log(operationalCharacteristics);
						var categories = {
								CTRL: {
									DM: {
										EI: '#',
										EQ: '#'
									},
									INT: '#',
									EXTIVK: '#',
									EXTCLL: '#'
								},
								
						}
						
						var matchedCategories = [];
						for(var j in operationalCharacteristics){
							var returnedCategories = matchCategories(categories, operationalCharacteristics[j]);
//							console.log("returned categories");
//							console.log(returnedCategories);
							for(var k in returnedCategories){
								if(matchedCategories.indexOf(returnedCategories[k]) == -1){
									matchedCategories.push(returnedCategories[k]);
								}
							}
						}
						path.Operations.transactional = matchedCategories;
//						console.log(path.Operations.transactional);
					}
					else{
						path.Operations.transactional = ['TRAN_NA'];
					}
					
				path.Tag = path.Operations.functional.join(',');
				if(path.Operations.transactional.length > 0){
					path.Tag += ","+path.Operations.transactional.join(',');
				}
				
				var duplicate = false;
				for(var i in usecase.UseCaseAnalytics.Paths){
					var existingPath = usecase.UseCaseAnalytics.Paths[i];
					if(existingPath.PathStr === path.PathStr){
							duplicate = true;
							break;
					}
				}
				
				return !duplicate;
			},
			processElement: function(element, diagram, usecase){
				// determine if the element is the duplicate of a existing one, if it is, keep the one that is more complex: OutboundNumber+InboundNumber
				// some of the element may not have type. just filter out the element.
				if(!element.Type){
					return;
				}
				var duplicate = false;
				var usecaseAnalytics = usecase.UseCaseAnalytics;
				for(var j in usecaseAnalytics.Elements){
					var existingElement = usecaseAnalytics.Elements[j];
					if(existingElement && existingElement.Name === element.Name &&
							existingElement.Type === element.Type){
						if(existingElement.OutboundNumber+existingElement.InboundNumber >= element.OutboundNumber+element.InboundNumber){
							duplicate = true;
							break;
						}
						else {
							//remove the existing element for an updated element
							usecaseAnalytics.Elements.splice(j, 1);
						}
					}
				}
				
				return !duplicate;
			},
			processLink: function(link){
				return true;
			}
	}
})();
