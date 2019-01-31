/**
 * This module is used to parse different elements in XMI files to construct the user-system interaction model.
 */
(function() {
	var fs = require('fs');
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	function parseCallTrace(callStack, components){
		var componentTrace = [];
		for(var m in callStack){
			var cls = m.getCls();
			var cmp = components.get(cls.name);
			componentTrace.add(cmp);
		}
		
		var edges = [];
		var preCmp = null;
		for(var i in componentTrace){
			var component = componentTrace[i];
			if(!preCmp){
				preCmp = component;
				continue;
			}
			
			edges.add({start: preCmp; end: component});
			preCmp = component;
		}
		
		var reducedEdges = [];
		for(var i in edges){
			var edge = edges[i];
			if(edge.start !== endge.end){
				reducedEdges.add(edge);
			}
		}
		
		return reducedEdges;
	}

	module.exports = {
		preseCallTrace : parseCallTrace
	}
}());