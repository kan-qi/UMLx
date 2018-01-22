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
 * summary: search for independent paths, and recognize the patterns.
 * Date: 3/08/2016
 */



(function(){
	//the last element is the pattern type. 0 is reserved for not matched type
	 //for the partially matched elements, the value should be a distribution.
	 var operationalPatterns = [
	 ["actor", "boundary", "control", "entity", "pattern#1", "data management"],
	 ["actor", "boundary", "control", "entity", "control", "boundary","pattern#2","data management with feedback"],
	 ["actor", "boundary", "control", "boundary", "pattern#3", "validation or interface management"],
	 ["actor", "boundary", "control", "actor", "pattern#4", "Invocation from external system"],
	 ["actor", "control", "entity","pattern#5", "Invocation of services provided by external system"]
	 ];
	 
	 
	 function establishPatternRepository(operationalPatterns)
	 {
	 	var repositoryRoot = {
	 		label: "[root]",
	 		childElements: new Array()
	 	};
	 		
	 	for (var i=0; i < operationalPatterns.length; i++){
	 		var pattern = operationalPatterns[i];
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
	 	
	 	return repositoryRoot;
	 }
	 
	 function recognizePattern(path, robustnessDiagram, repository){
			//standardize the path into command pattern, which is to remove the duplicate elements
			var reducedPathElements = new Array();
				for(var i=0; i<path.Elements.length; i++){
					var lastElement = null;
					if(reducedPathElements.length > 0){
						lastElement = reducedPathElements[reducedPathElements.length - 1];
					}
					var element = robustnessDiagram['Elements'][path['Elements'][i]];
					var elementType = element.Type;
					if(lastElement == null || lastElement != elementType){
					 reducedPathElements.push(elementType);
					}
				}
				
			var regIndexOfLabel = function (elements, rx) {
		        for (var i in elements) {
		            if (elements[i].label.toString().match(rx)) {
		                return i;
		            }
		        }
		        return -1;
		    };
			var indexOfLabel = function (elements, target) {
		        for (var i in elements) {
		            if (elements[i].label.toString() == target) {
		                return i;
		            }
		        }
		        return -1;
		    };
			
			var patternType = 0;
			var currentElement = repository;
			var indexOfType = -1;
			var searchDepth = -1;
			while ((indexOfType = regIndexOfLabel(currentElement.childElements, /^pattern#\d+$/i)) == -1 ){
				var indexOfMatched = -1;
				var toMatchElement = "Invalid";
				++searchDepth;
				if(searchDepth > reducedPathElements.length -1 ){
					break;
				}
				else{
					toMatchElement = reducedPathElements[searchDepth];
				}
				if((indexOfMatched = indexOfLabel(currentElement.childElements, toMatchElement)) == -1){
					break;
				}
				else{
					currentElement = currentElement.childElements[indexOfMatched];
				}
			}
			
			if(indexOfType == -1){
				return {
				pattern: "pattern#0",
				semantics: "partially matched operational pattern"
				};
			}
			else{
				return {
					pattern: currentElement.childElements[indexOfType].label,
					semantics: currentElement.childElements[indexOfType].childElements[0].label
				};
			}
		}
	 
	var patternRepoRoot = establishPatternRepository(operationalPatterns);
	
	module.exports = {
			processPath: function(path, robustnessDiagram){
				path.operation = recognizePattern(path, robustnessDiagram, patternRepoRoot);
			},
			processElement: function(edge){
				
			},
			processLink: function(node){
				
			}
	}
})();
