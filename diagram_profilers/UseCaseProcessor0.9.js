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
//	 var transactionalPatterns = [
//	 ['actor', 'boundary', 'control[+]', 'entity', 'pattern#1', 'data management', 'transactional'],
//	 ['actor', 'boundary', 'control[+]', 'entity', 'control[+]', 'boundary','pattern#2','data management with feedback', 'transactional'],
//	 ['actor', 'boundary', 'control[+]', 'boundary', 'pattern#3', 'validation or interface management', 'transactional'],
//	 ['actor', 'boundary', 'control[+]', 'actor', 'pattern#4', 'Invocation from external system', 'transactional'],
//	 ['actor', 'control[+]', 'entity','pattern#5', 'Invocation of services provided by external system', 'transactional']
//	 ];
//	 
	 var transactionalPatterns = [
		 ['actor', 'boundary', 'control[+]', 'entity', 'pattern#1', 'DM', 'transactional','Data management'],
		 ['actor', 'boundary', 'control[+]', 'entity', 'control', 'boundary','pattern#2','DM+INT', 'transactional', 'Data management with feedback or inquiry'],
		 ['actor', 'boundary', 'control[+]', 'boundary', 'pattern#3', 'INT', 'transactional', 'validation or interface management'],
		 ['actor', 'boundary', 'control[+]', 'actor', 'pattern#4', 'EXTIVK', 'transactional','Invocation from external system'],
		 ['actor', 'control[+]', 'entity','pattern#5', 'EXTCLL', 'transactional', 'Invocation of services provided by external system'],
		 ['actor', 'control[+]', 'boundary','pattern#6', 'EXTCLL', 'transactional', 'Invocation of services provided by external system'],
		 ['actor', 'boundary', 'control[+]','pattern#7', 'CTRL', 'transactional', 'Control Transaction']
		 ];
	 
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
	 ['actor', 'boundary', 'control[+]', 'entity', 'pattern#1', 'EI', 'functional', 'External input'],
	 ['entity', 'control[+]', 'boundary', 'actor', 'pattern#2', 'EO', 'functional', 'External output'],
	 ['entity', 'boundary', 'actor', 'pattern#2', 'EO', 'functional', 'External Output'],
	 ['actor', 'boundary', 'control[+]', 'boundary', 'pattern#3', 'EQ', 'functional', 'External inquiry'],
	 ['actor', 'boundary', 'control[+]', 'boundary','actor', 'pattern#4', 'EI,EQ', 'functional', 'External input and inquiry'],
	 ['boundary', 'entity', 'boundary','actor', 'pattern#4', 'EI,EQ', 'functional', 'External input and inquiry'],
	 ['actor', 'boundary', 'control[+]', 'entity', 'control[+]', 'boundary', 'actor[!E]', 'pattern#5', 'EQ', 'functional', 'External input and inquiry'],
	 ['actor', 'boundary', 'control[+]', 'entity', 'boundary', 'actor[!E]', 'pattern#5', 'EQ', 'functional', 'External input and inquiry']
	 ];
	 
	 
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
	 
	var functionalPatternTreeRoot = establishPatternParseTree(functionalPatterns);
	var transactionalPatternTreeRoot = establishPatternParseTree(transactionalPatterns);
	
	module.exports = {
			processDiagram: function(diagram, usecase){
				return true;
			},
			processPath: function(path, diagram, usecase){

				var PathStr = "";
				for(var i = 0; i < path.Elements.length; i++)
				{
					var element = path['Elements'][i];
					PathStr += diagram.Elements[element].Name;
					if(i != path.Elements.length - 1){
						PathStr += "->";
					}
				}
				path.PathStr = PathStr;
				
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
						path.Operations.transactional = transactionalOperationStr.split(/,/g);
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
