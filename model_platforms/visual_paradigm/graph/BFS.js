function computeIndegree(graph){
	
	console.log ('the graph is ', graph);
	var nodes = graph.nodes;
	var edges = graph.edges;
	
	var indegree = {}
	
	for (var node = 0; node < nodes.length; node++){
		var count = 0;
		var graphNode = nodes[node];
		for (var edge = 0; edge < edges.length; edge++){
			
			var graphEdge = edges[edge];
			
			if (graphNode.Id == graphEdge.toEnd){
				count = count + 1;
			}
		}
		indegree[graphNode.Id] = count;
	}
	
	return indegree;
}


function computeStartNodes(indegree){
	
	var startNodes = [];
	
	for (var key in indegree){
		if (indegree[key] == 0){
			startNodes.push(key);
		}
	}
	return startNodes;
}


function traverseAllGraph(response){
	
	for ( var key in response) {
		var graph =  response[key];
		var indegree = computeIndegree(graph);
		
		
		
		var startNodes = computeStartNodes(indegree);
		breadFirstSearch(startNodes,graph);
	}
}


function breadFirstSearch(startNodes, graph){
	
	var nodes = graph.nodes;
	var edges = graph.edges;
	
	var node_id_index = {}
	var node_index_id = {}
	index = 0;
	for (var node =0 ; node < nodes.length; node++){
		var graphNode = nodes[node];
		node_id_index[graphNode.Id] = index;
		node_index_id[index] = graphNode.Id;
		index = index +  1;
	}
	
	var adjacency_matrix = new Array(nodes.length);
	for (var node = 0; node < nodes.length; node++){
		adjacency_matrix[node] = new Array(nodes.length);
		
		for (var otherNode = 0; otherNode < nodes.length; otherNode++){
			adjacency_matrix[node][otherNode] = 0;
		}
		
	}
	
	for (var edge =0 ; edge < edges.length; edge++ ){
		var graphEdge = edges[edge];
		adjacency_matrix[node_id_index[graphEdge.fromEnd]][node_id_index[graphEdge.toEnd]] = 1;
	}
	
	
	
	
	for (var startNode = 0; startNode < startNodes.length; startNode++){
		
		var visited = new Array(nodes.length).fill(false);
		var start_node = startNodes[startNode];
		var queue = [];
		var path = [];
		
		var checking = [];
		
		queue.push(node_id_index[start_node]);
		visited[node_id_index[start_node]] = true;
		
		while (queue.length != 0){
			
			var element = queue.shift();
			path.push(node_index_id[element]);
			checking.push(nodes[element].Name);
			
			
			for (var node = 0 ; node < nodes.length; node++){
				if ( !visited[node] && adjacency_matrix[element][node] == 1){
					visited[node] = true;
					queue.push(node);
				}
			}
		}
		
	}

}

module.exports = {traverseAllGraph};