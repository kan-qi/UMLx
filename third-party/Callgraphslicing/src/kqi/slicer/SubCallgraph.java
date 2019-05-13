package kqi.slicer;

import java.util.List;
import java.util.Map;

public class SubCallgraph extends Callgraph{

	public SubCallgraph(String label) {
		super(label);
	}

	public SubCallgraph(String tag, Map<String, CallgraphNode> nodes, List<CallgraphEdge> edges) {
		super(tag, nodes, edges);
	}

	public String getPrintable(){
		StringBuilder graph = new StringBuilder("subgraph "+label+" {");
		for(CallgraphNode node : this.nodes.values()){
			graph.append(node.getPrintable()+"\n");
		}
		for(CallgraphEdge edge : this.edges){
			graph.append(edge.getPrintable()+"\n");
		}

		 graph.append("}");
		 return graph.toString();
	}
}
