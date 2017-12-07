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
 * Date: 7/16/2016
 */



(function(){
	//the last element is the pattern type. 0 is reserved for not matched type
	 //for the partially matched elements, the value should be a distribution.
//	 var operationalPatterns = [
//	 ["actor", "boundary", "control", "entity", "pattern#1", "data management"],
//	 ["actor", "boundary", "control", "entity", "control", "boundary","pattern#2","data management with feedback"],
//	 ["actor", "boundary", "control", "boundary", "pattern#3", "validation or interface management"],
//	 ["actor", "boundary", "control", "actor", "pattern#4", "Invocation from external system"],
//	 ["actor", "control", "entity","pattern#5", "Invocation of services provided by external system"]
//	 ];
//	 
	 // the wild card pattern should be further designed. Adding more wildcard types.
//	 var functionalPatterns = [
//	 ['actor[-]', 'boundary', 'control[+]', 'entity', 'pattern#1', 'EI'],
//	 ['entity', 'control[+]', 'boundary', 'actor[-]', 'pattern#2', 'EO'],
//	 ['actor', 'boundary', 'control[+]', 'boundary', 'pattern#3', 'EQ'],
//	 ['actor[#1]', 'boundary', 'control[+]', 'boundary','actor[#2]', 'pattern#4', 'EI+EQ'],
//	 ['actor[#1]', 'boundary', 'control[+]', 'entity', 'control[+]', 'boundary', 'actor[#2]', 'pattern#5', 'EQ']
//	 ]
	
	//[] represents the similarity across the patterns.
	//# represents tags for the elements within the same pattern. To distinguish an element in the pattern.
	//Building patterns with exact representation, but parsing the condition when matching
	 
	 var functionalPatterns = [
	 ['actor', 'boundary', 'control[+]', 'entity', 'pattern#1', 'EI'],
	 ['entity', 'control[+]', 'boundary', 'actor', 'pattern#2', 'EO'],
	 ['entity', 'boundary', 'actor', 'pattern#2', 'EO'],
	 ['actor', 'boundary', 'control[+]', 'boundary', 'pattern#3', 'EQ'],
	 ['actor', 'boundary', 'control[+]', 'boundary','actor', 'pattern#4', 'EI+EQ'],
	 ['boundary', 'entity', 'boundary','actor', 'pattern#4', 'EI+EQ'],
	 ['actor', 'boundary', 'control[+]', 'entity', 'control[+]', 'boundary', 'actor[!E]', 'pattern#5', 'EQ'],
	 ['actor', 'boundary', 'control[+]', 'entity', 'boundary', 'actor[!E]', 'pattern#5', 'EQ']
	 ]
	 
	 
	 function establishPatternRepository(patterns)
	 {
	 	var repositoryRoot = {
	 		label: "root",
	 		childElements: new Array()
	 	};
	 		
//	 	for (var i=0; i < operationalPatterns.length; i++){
//	 		var pattern = operationalPatterns[i];
//	 		var currentElement = repositoryRoot;
//	 		for(var j=0; j< pattern.length; j++){
//	 			var patternElement = pattern[j];
//	 			if(!currentElement.hasOwnProperty("childElements") || currentElement.childElements == null){
//	 				currentElement.childElements = new Array();
//	 			}
//	 			var childElements = currentElement.childElements;
//	 			var matchedChildElement = null;
//	 			for (var m=0; m < childElements.length; m++){
//	 				var childElement = childElements[m];
//	 				if(childElement.label == patternElement){
//	 					matchedChildElement = childElement;
//	 				}
//	 			}
//	 			if(matchedChildElement == null){
//	 				matchedChildElement = {
//	 					label: patternElement
//	 				};
//	 				childElements.push(matchedChildElement);
//	 			}
//	 /** potential use of distinguish patterns as prefix of other patterns
//	  *  this problem is avoided by adding a number at the end of pattern to indicate
//	  *  the type of the pattern.
//	 			if(j == pattern.length -1 ){
//	 				matchedChildElement.childElements.push(
//	 					{
//	 						label: "[leaf]",
//	 					}
//	 				);
//	 			}
//	 			
//	 **/			currentElement = matchedChildElement;
//	 		}
//	 	}
//	 	
	 	
	 	for (var i=0; i < functionalPatterns.length; i++){
	 		var pattern = functionalPatterns[i];
	 		var currentElement = repositoryRoot;
	 		for(var j=0; j< pattern.length; j++){
	 			var patternElement = pattern[j];
	 			if(!currentElement.hasOwnProperty("childElements") || currentElement.childElements == null){
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
	 						label: "[leaf]",
	 					}
	 				);
	 			}
	 			
	 **/			currentElement = matchedChildElement;
	 		}
	 	}
	 	
	 	console.log(repositoryRoot);
	 	return repositoryRoot;
	 }
	 
	 function recognizePattern(path, diagram, repository){
			//standardize the path into command pattern, which is to remove the duplicate elements
		 	// or we can do non consolidation.
//			var preprocessedPath = new Array();
//				for(var i=0; i<path.Elements.length; i++){
//					var lastElement = null;
//					if(preprocessedPath.length > 0){
//						lastElement = preprocessedPath[preprocessedPath.length - 1];
//					}
//					var element = diagram['Elements'][path['Elements'][i]];
//					var elementType = element.Type;
//					if(lastElement == null || lastElement != elementType){
//					preprocessedPath.push(elementType);
//					}
//					else{
//					 preprocessedPath[preprocessedPath.length - 1] = elementType+"[+]";
//					}
//				}
//				
//				console.log(preprocessedPath);
		 
		 var preprocessedPath = new Array();
			for(var i=0; i<path.Elements.length; i++){
				var element = diagram['Elements'][path['Elements'][i]];
				preprocessedPath.push(element.Type);
			}
			
			console.log(preprocessedPath);
				
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
			
			var currentPatternElements = [repository];
			var searchIndex = 0;
			
			console.log('===========Search Pattern============');
			while(searchIndex < preprocessedPath.length){
				var matchingTarget = preprocessedPath[searchIndex];
				console.log(matchingTarget);
				var patternElement = null;
				var matchedPatternElementArray = [];
				while((patternElement = currentPatternElements.shift())){
					matchedPatternElementArray = matchedPatternElementArray.concat(nextElements(patternElement, matchingTarget));
				}
				currentPatternElements = matchedPatternElementArray;
				searchIndex ++;
			}
			
			console.log(currentPatternElements);
			console.log('--------------------------------------');
			
			var matchedPatterns = [];
			for(var i in currentPatternElements){
				var matchedPatternElement = currentPatternElements[i];
				var indexOfType = regIndexOfLabel(matchedPatternElement.childElements, /^pattern#\d+$/i);
				if(indexOfType){
					matchedPatterns.push(
							{
								pattern: matchedPatternElement.childElements[indexOfType].label,
								semantics: matchedPatternElement.childElements[indexOfType].childElements[0].label
							}
					);
				}
			}
			
//			while ((indexOfType = regIndexOfLabel(currentElement.childElements, /^pattern#\d+$/i)) == -1 ){
//				var indexOfMatched = -1;
//				var toMatchElement = "Invalid";
//				searchDepth++;
//				if(searchDepth > preprocessedPath.length -1 ){
//					break;
//				}
//				else{
//					toMatchElement = preprocessedPath[searchDepth];
//				}
//				if((indexOfMatched = indexOfLabel(currentElement.childElements, toMatchElement)) == -1){
//					break;
//				}
//				else{
//					currentElement = currentElement.childElements[indexOfMatched];
//				}
//			}
			
//			if(indexOfType == -1){
//				return {
//				pattern: "pattern#0",
//				semantics: "not matched pattern"
//				};
//			}
//			else{
//				return {
//					pattern: currentElement.childElements[indexOfType].label,
//					semantics: currentElement.childElements[indexOfType].childElements[0].label
//				};
//			}
			
			return matchedPatterns;
		}
	 
	var patternRepoRoot = establishPatternRepository();
	
	module.exports = {
			processPath: function(path, robustnessDiagram){
				path.operations = recognizePattern(path, robustnessDiagram, patternRepoRoot);
			},
			processElement: function(edge){
				
			},
			processLink: function(node){
				
			}
	}
})();
