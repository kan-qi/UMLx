!INC Local Scripts.EAConstants-JScript

/*
 * Script Name: 
 * Author: 
 * Purpose: 
 * Date: 
 */
 
 
/*
* manually set the max matching range
*
*
*/

var MAX_MATCH_RANGE = 1000;

function queryByPatternStrict(pattern, index){
	Session.Output("========================start querying by pattern (strict)========================");
	var currentNode = index;
	var iteratedNum = 0;
	var toMatchElement = pattern.shift();
	Session.Output("to match pattern element: " + toMatchElement);
	var isLastPatternElement = (pattern.length == 0 ? true : false);
	var segs = toMatchElement.match(/^(actor|boundary|control|entity)(\+|\*|\{([0-9]*),\s*([0-9]*)\}|\?)?$/i);
	if(segs == null){
		return new Array();
	}
	var type = segs[1];
	Session.Output("type to match: " + type);
	var rangeType = segs[2];
	rangeType = rangeType.match(/^\{\S*\}$/i) != null ? "range" : rangeType;
	var min = 1;
	var max = 1;
	
	switch (rangeType){
		case "*":
			min = 0;
			max = MAX_MATCH_RANGE;
			break;
		case "+":
			min = 1;
			max = MAX_MATCH_RANGE;
			break;
		case "?":
			min = 0;
			max = 1;
			break;
		case "range":
			min = segs[3];
			max = segs[4];
		default:
			min = 1;
			max = 1;
	}
	
	Session.Output("range: " + min+","+max);
	
	var pathIds = new Array();
	
	while(currentNode != null && currentNode.hasOwnProperty("childElements")){
		Session.Output("current node for searching: "+currentNode.label);
		var childNodes = currentNode.childElements;
		var matchedNode = null;
		for (var i=0; i<childNodes.length; i++){
			Session.Output("test matching element: " + childNodes[i].label);
			if(childNodes[i].label == type){
				matchedNode = childNodes[i];
				Session.Output("matched node in index: " + matchedNode.label);
				break;
			}
		}
		
		if(matchedNode != null){
		iteratedNum++;
		Session.Output("**********************iterated number: " + iteratedNum);
		if(iteratedNum < min){
		}
		else if(iteratedNum <= max){
			if(isLastPatternElement){//if it is the last element in the pattern, then adding the paths.
			if(matchedNode.hasOwnProperty("pathIds")&& matchedNode.pathIds != null){
			Session.Output("last pattern element with paths: " + matchedNode.pathIds.length);
			pathIds = pathIds.concat(matchedNode.pathIds);	
			}
			}
			else{ //if it is not the last element in the pattern, then keep searching for the left patterns
			//copy pattern for further searching.
			// there is no place to prevent expanding before reaching the limit of pattern. wrong.
			pathIds = pathIds.concat(queryByPatternStrict(pattern.slice(0), matchedNode));
			}
			if(iteratedNum == max){ //break from search for larger number of matching path elements.
				break;
			}
		 }
		}
		currentNode = matchedNode;
	}
	
	Session.Output("========================End querying by pattern (strict)========================");
	return pathIds;
}

/*
* Lib method:
* translate path into pattern representation: {actor, control, model, entity}
*
*/

function toPattern(path){
	var pattern = new Array();
	for(var i=0; i<path.length; i++){
		var element = Repository.GetElementByGuid(path[i]);
		var elementType = (element.Stereotype == "" ? element.MetaType.toLowerCase() : element.Stereotype.toLowerCase());
		pattern.push(elementType);
	}
	return pattern;
}

/*
* lib method
* convert path to its pattern representation in string
*/
function toPatternString(path){
		var patternString = "";
		for(var j=0; j<path.length; j++){
			var element = Repository.GetElementByGuid(path[j]);
			var elementType = (element.Stereotype == "" ? element.MetaType.toLowerCase() : element.Stereotype.toLowerCase());			
			patternString += element.Name+"("+elementType+")";
			if(j != path.length -1){
				patternString += "->"
			}
		}
	return patternString;
}
 
 
//function main()
//{
	// TODO: Enter script code here!
//}

//main();