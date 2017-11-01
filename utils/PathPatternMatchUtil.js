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
	
	module.exports = {
			establishPatternParseTree: establishPatternParseTree,
			recognizePattern: recognizePattern
	}
})();
