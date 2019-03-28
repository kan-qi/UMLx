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
	
	//[] represents the similarity across the patterns.
	//# represents tags for the elements within the same pattern. To distinguish an element in the pattern.
	//Building patterns with exact representation, but parsing the condition when matching
	 
	
	module.exports = {
//			processDiagram: function(diagram, usecase){
//				return true;
//			},
			processPath: function(path, usecase){
				var pathLength = 0;
				var avgDegree = 0;
				var archDiff = 0;
				var boundaryNum = 0;
				var controlNum = 0;
				var entityNum = 0;
				var actorNum = 0;
				var PathStr = "";
				for(var i = 0; i < path.Nodes.length; i++)
				{
					var node = path.Nodes[i];
//					var components = diagram.allocate(node);
					
					if(node.Component){
						var component = node.Component;
						avgDegree += component.InboundNumber;

						if(component.Type=="actor")actorNum++;
						if(component.Type=="boundary")boundaryNum++;
						if(component.Type=="control")controlNum++;
						if(component.Type=="entity")entityNum++;
					}
					
					pathLength++;
					PathStr += node.Name;
					if(i != path.Nodes.length - 1){
						PathStr += "->";
					}
					
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
				return true;
				
			},
			processElement: function(element, usecase){
				return true;
			},
			processLink: function(link){
				return true;
			}
	}
})();
