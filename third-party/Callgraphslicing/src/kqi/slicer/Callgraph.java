package kqi.slicer;

import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

public class Callgraph extends CallgraphNode{
	List<CallgraphEdge> edges = new ArrayList<CallgraphEdge>();
	Map<String, CallgraphNode> nodes = new HashMap<String, CallgraphNode>();
//	Map<String, String> tags = new HashMap<String, String>();
	
	public Collection<CallgraphEdge> getEdges(){
		return edges;
	}
	
	public Collection<CallgraphNode> getNodes(){
		return nodes.values();
	}
	
	public Callgraph(String label){
		super(label);
	}
	
	protected Callgraph(String label, Map<String, CallgraphNode> nodes, List<CallgraphEdge> edges){
		super(label);
		this.nodes.putAll(nodes);
		this.edges.addAll(edges);
	}
	
	
//	void tag(String tagName, String tagValue){
//		tags.put(tagName, tagValue);
//	}
//	
//	String tag(String tagName){
//		return tags.get(tagName);
//	}
	
	String dumpGraph(String path){
//		writer.write(CG.toString());
		PrintWriter writer = null;
		String printable = "";
		try {

			System.out.println("-------------dump callgraph--------------");
			writer = new PrintWriter(path);
			printable = this.getPrintable();
			writer.write(printable);
			writer.flush();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} finally {
			if(writer != null){
				writer.close();
			}
		}
		return printable;
		
	}
	
	Callgraph getSubGraphgraph(String majorCategory){
		Callgraph subgraph = new Callgraph(majorCategory);
		for(CallgraphNode node : nodes.values()){
			if(node.getMajorCategory().equals(majorCategory)){
				subgraph.addNode(node.label);
			}
		}
		
		for(CallgraphEdge edge: this.edges){
			CallgraphNode start = subgraph.getNode(edge.start.label);
			CallgraphNode end = subgraph.getNode(edge.end.label);
			if( start !=null && end != null){
				subgraph.addEdge(start, end);
			}
		}
		
		return subgraph;
	}
	
	void tagNodes(String tagName, String tagValue){
		for(CallgraphNode node : this.nodes.values()){
			node.tag(tagName, tagValue);
		}
	}
	
	void tagNodes(String tagName, Integer tagValue){
		tagNodes(tagName, tagValue.toString());
	}
	
	Long calculateSrcLines(){
		return 0L;
	}
	
	
	List<CallgraphEdge> selectEdgesBetweenNodes(CallgraphNode end1, CallgraphNode end2){
		List<CallgraphEdge> edgeSet = new ArrayList<CallgraphEdge>();
		for(CallgraphEdge edge : this.edges){
			if((edge.start == end1 && edge.end == end2) || (edge.start == end2 && edge.end == end1)){
				edgeSet.add(edge);
			}
		}
		return edgeSet;
	}
	
	List<CallgraphEdge> selectEdgesBetweenSubgraphs(Callgraph graph1, Callgraph graph2){
		List<CallgraphEdge> edgeSet = new ArrayList<CallgraphEdge>();
		for(CallgraphEdge edge : edges){
			if((graph1.containNode(edge.start) && graph2.containNode(edge.end)) || (graph1.containNode(edge.end) && graph2.containNode(edge.start))){
				edgeSet.add(edge);
			}
		}
		
		return edgeSet;
	}
	
	List<CallgraphEdge> selectDirectedEdgesBetweenSubgraphs(Callgraph graph1, Callgraph graph2){
		List<CallgraphEdge> edgeSet = new ArrayList<CallgraphEdge>();
		for(CallgraphEdge edge : edges){
			if((graph1.containNode(edge.start) && graph2.containNode(edge.end))){
				edgeSet.add(edge);
			}
		}
		
		return edgeSet;
	}
	
	String getSummary(){
		StringBuilder summary = new StringBuilder();
		for(CallgraphNode node : this.nodes.values()){
			summary.append(node.label);
			summary.append("\n");
		}
		
		return summary.toString();
	}
	
	public String toString(){
		StringBuilder content = new StringBuilder();
		for(CallgraphNode node : this.nodes.values()){
			content.append(node.label);
			content.append("|");
		}
		
		return content.toString();
	}
	
	boolean containNode(CallgraphNode callgraphNode){
		for(CallgraphNode node: this.nodes.values()){
			if(callgraphNode == node){
				return true;
			}
		}
		return false;
	}
	
	/*
	 * Greedy algorithm to delete cut in between the elements with the most edges
	 */
	
	
	public SubCallgraph getSubCallgraphByNodes(List<CallgraphNode> nodes, String tag){

		List<CallgraphEdge> edges = new ArrayList<CallgraphEdge>();
		for(CallgraphEdge edge : this.edges){
			if( nodes.contains(edge.start) && nodes.contains(edge.end) ){
				edges.add(edge);
			}
		}
		
		Map<String, CallgraphNode> nodeList = new HashMap<String, CallgraphNode>();
		for(CallgraphNode node : nodes){
			nodeList.put(node.label, node);
		}
		
		return new SubCallgraph(tag, nodeList, edges);
		
	}
	
//	List<SubCallgraph> getKCluster(int k){
//		ArrayList<CallgraphNode> nodes = new ArrayList<CallgraphNode>(this.nodes.values());
//		
//		this.getDisconnectedGraphs();
//		
//	}
	
	/*
	 *  return a list of sub call graphs by k clustering. Constraint: n <= k, by apply dynamic programming.
	 */
	List<SubCallgraph> getKClusters(int k){
		ArrayList<CallgraphNode> nodes = new ArrayList<CallgraphNode>(this.nodes.values());
		int[][] evaluationMatrix = new int[nodes.size()][k];
		for(int i = 0; i < evaluationMatrix.length; i++){
			for(int j=0; j < evaluationMatrix[0].length; j++){
				evaluationMatrix[i][j] = -1;
			}
		}
	
		kComponentClustering(nodes, k, evaluationMatrix);
		Set<Integer> cuts = new TreeSet<Integer>();
		for(int i = 0; i<k; i++){
			int cut = 2048;
			for(int l=0; l<evaluationMatrix.length; l++){
				if(evaluationMatrix[l][i] < cut){
					cut = evaluationMatrix[l][i];
					cuts.add(l);
				}
			}
		}
		return getDisconnectedGraph(cuts);
	}
	

	private int kComponentClustering(List<CallgraphNode> nodes, int k, int[][] evaluationMatrix){
		int rating = evaluationMatrix[nodes.size()-1][k];
		if(rating == -1){
			if(nodes.size() < 3){
					rating = 0;
					if(nodes.size() == 2 && k > 1){
					List<CallgraphEdge> edges = this.getEdgesBetweenNodes(nodes.get(0), nodes.get(1));
					rating = edges.size();
					}
				
			}
			else {
			for(int i=0; i<nodes.size(); i++){
				for(int j=0; j<k; j++){
			List<CallgraphNode> nodesToEvaluate1 = nodes.subList(nodes.size()-1-i, nodes.size()-1);
			List<CallgraphNode> nodesToEvaluate2 = nodes.subList(0, nodes.size()-2-i);
			int edgesNum = this.getCrossingEdgesBetweenGroups(nodesToEvaluate1, nodesToEvaluate2).size();
			int result = kComponentClustering(nodesToEvaluate2, j, evaluationMatrix) + kComponentClustering(nodesToEvaluate2, k-j, evaluationMatrix)+ edgesNum;
			rating = result > rating ? result : rating;
			}
			}
			}
			
		}
		
		evaluationMatrix[nodes.size()-1][k] = rating;
		return rating;
	}
	

	private List<SubCallgraph> getDisconnectedGraph(Set<Integer> cuts) {
		return null;
	}
	
	SubCallgraph subtractSubCallgraphByTag(String tag){
		Map<String, CallgraphNode> nodes = new HashMap<String, CallgraphNode>();
		Iterator<String> iterator = this.nodes.keySet().iterator();
		while(iterator.hasNext()){
			String key = iterator.next();
			CallgraphNode node = this.nodes.get(key);
			if(node.getMajorCategory().equals(tag)){
				nodes.put(node.label, node);
				iterator.remove();
			}
		}
		
		List<CallgraphEdge> edges = new ArrayList<CallgraphEdge>();
		Iterator<CallgraphEdge> edgeIterator = this.edges.iterator();
		while(edgeIterator.hasNext()){
			CallgraphEdge edge = edgeIterator.next();
			if( nodes.containsValue(edge.start) && nodes.containsValue(edge.end) ){
				edges.add(edge);
				edgeIterator.remove();
			}
		}
		
		return new SubCallgraph(tag, nodes, edges);
	}
	
	SubCallgraph getSubCallgraphByTag(String tag){
//		Callgraph subgraph = new Callgraph();
		Map<String, CallgraphNode> nodes = new HashMap<String, CallgraphNode>();
		for(CallgraphNode node : this.nodes.values()){
			if(node.getMajorCategory().equals(tag)){
				nodes.put(node.label, node);
			}
		}
		
		List<CallgraphEdge> edges = new ArrayList<CallgraphEdge>();
		for(CallgraphEdge edge : this.edges){
			if( nodes.containsValue(edge.start) && nodes.containsValue(edge.end) ){
				edges.add(edge);
			}
		}
		
		return new SubCallgraph(tag, nodes, edges);
	}
	
	void removeEdges(List<CallgraphEdge> edgeSet){
		this.edges.removeAll(edgeSet);
	}
	
	List<CallgraphNode> getChildNodes(CallgraphNode node){
		List<CallgraphNode> childNodes = new ArrayList<CallgraphNode>();
		for(CallgraphEdge edge : this.edges){
			CallgraphNode start = edge.start;
			if(start.label.equals(node.label)){
				CallgraphNode child = edge.end;
				childNodes.add(child);
			}
		}
		return childNodes;
	}
	
	
	List<Callgraph> getDisconnectedGraphs(){
		List<Callgraph> callgraphSet = new ArrayList<Callgraph>();
		List<CallgraphNode> nodes = new ArrayList<CallgraphNode>();
		nodes.addAll(this.nodes.values());
		List<CallgraphNode> categorizedNodes = new ArrayList<CallgraphNode>();
		
		int i = 0;
		while(!nodes.isEmpty()){
			i++;
			CallgraphNode node = nodes.get(0);
			Map<String, CallgraphNode> subgraphNodes = new HashMap<String, CallgraphNode>();
			List<CallgraphEdge> subgraphEdges = new ArrayList<CallgraphEdge>();
			List<CallgraphNode> queue = new ArrayList<CallgraphNode>();
			queue.add(node);
			subgraphNodes.put(node.label, node);
			categorizedNodes.add(node);
			while(!queue.isEmpty()){
				CallgraphNode parent = queue.remove(queue.size()-1);
				nodes.remove(parent);
				List<CallgraphEdge> edges = this.getOutBoundEdges(node);
				for(CallgraphEdge edge : edges){
					CallgraphNode childNode = edge.end;
					if(categorizedNodes.contains(childNode)){
						continue;
					}
					if(subgraphNodes.get(childNode.label) != null){
						continue;
					}
					subgraphNodes.put(childNode.label, childNode);
					subgraphEdges.add(edge);
					queue.add(childNode);
				}
			}
			callgraphSet.add(new SubCallgraph(String.valueOf(i), subgraphNodes, subgraphEdges));
		}
		
		return callgraphSet;
	}
	
	List<CallgraphEdge> getConnectedEdges(CallgraphNode node){
		List<CallgraphEdge> connectedEdges = new ArrayList<CallgraphEdge>();
		for(CallgraphEdge edge: this.edges){
			if(edge.start == node || edge.end == node){
				connectedEdges.add(edge);
			}
		}
		return connectedEdges;
	}
	
	List<CallgraphEdge> getOutBoundEdges(CallgraphNode node){
		List<CallgraphEdge> connectedEdges = new ArrayList<CallgraphEdge>();
		for(CallgraphEdge edge: this.edges){
			if(edge.start == node){
				connectedEdges.add(edge);
			}
		}
		return connectedEdges;
	}
	
	
	
	private List<CallgraphEdge> getCrossingEdgesBetweenGroups(List<CallgraphNode> group1, List<CallgraphNode> group2){
		List<CallgraphEdge> edgeSet = new ArrayList<CallgraphEdge>();
		for(CallgraphEdge edge : edges){
			if((group1.contains(edge.start) && group2.contains(edge.end))){
				edgeSet.add(edge);
			}
		}
		
		return edgeSet;
	}
	
	List<CallgraphEdge> getEdgesBetweenNodes(CallgraphNode node1, CallgraphNode node2){
		List<CallgraphEdge> edgeSet = new ArrayList<CallgraphEdge>();
		for(CallgraphEdge edge : edges){
			if((node1 == edge.start) && (node2 == edge.end)){
				edgeSet.add(edge);
			}
		}
		
		return edgeSet;
	}
	
//	private List<Callgraph> cutGraph(Callgraph graph, int size){
//		
//		List<Callgraph> callgraphs = new ArrayList<Callgraph>();
//		
//		if(size == 1){
//			for(CallgraphNode node : graph.nodes.values()){
//				List<CallgraphEdge> connectedEdges = graph.getConnectedEdges(node);
//				if(connectedEdges.isEmpty()){
//					Map<String, CallgraphNode> nodes = new HashMap<String, CallgraphNode>();
//					nodes.put(node.label, node);
//					callgraphs.add(new Callgraph(nodes, new ArrayList<CallgraphEdge>()));
//				}
//			}
//		}
//		else {
//		List<CallgraphNode> nodes = new ArrayList<CallgraphNode>();
//		nodes.addAll(graph.nodes.values());
//		
//		
//		callgraphs.addAll(cutGraph(graph, size -1));
//		}
//		
//		return callgraphs;
//	}
//	
//	private List<CallgraphNode> subset(List<CallgraphNode> nodes, int size){
//		List<CallgraphNode> subset = new ArrayList<CallgraphNode>();
//		return subset;
//	}
	
	CallgraphNode addNode(String label){
		CallgraphNode node = nodes.get(label);
		if(node == null){
		nodes.put(label, new CallgraphNode(label));
		node = nodes.get(label);
		}
		return node;
	}
	
	CallgraphNode putNode(String label, CallgraphNode node){
		nodes.put(label, node);
		return nodes.get(label);
	}
	
	int addEdge(CallgraphNode start, CallgraphNode end, String tag){
		if(!nodes.containsValue(start) || !nodes.containsValue(end)){
			return -1;
		}
		for(int i = 0; i<edges.size(); i++){
			if(edges.get(i).start == start && edges.get(i).end == end){
				return i;
			}
		}
		edges.add(new CallgraphEdge(start, end));
		return edges.size()-1;
	}
	
	int addEdge(CallgraphNode start, CallgraphNode end){
		if(!nodes.containsValue(start) || !nodes.containsValue(end)){
			return -1;
		}
		for(int i = 0; i<edges.size(); i++){
			if(edges.get(i).start == start && edges.get(i).end == end){
				return i;
			}
		}
		edges.add(new CallgraphEdge(start, end));
		return edges.size()-1;
	}
	
	void putEdge(CallgraphEdge edge){
		this.edges.add(edge);
	}
	
	
	boolean containEdge(CallgraphNode start, CallgraphNode end){
		for(CallgraphEdge edge : edges){
			if(edge.start == start && edge.end == end){
				return true;
			}
		}
		return false;
	}
	
	CallgraphEdge getEdge(int index){
		return edges.get(index);
	}
	
	CallgraphNode getNode(String label){
		return nodes.get(label);
	}
	
	ArrayList<String> tags = new ArrayList<String>();
	
	public String getPrintable(){
		StringBuilder graph = new StringBuilder("digraph g {");
		for(String tag: this.tags){
			graph.append(tag+"\n");
		}
		for(CallgraphNode node : this.nodes.values()){
			graph.append(node.getPrintable()+"\n");
		}
		for(CallgraphEdge edge : this.edges){
			graph.append(edge.getPrintable()+"\n");
		}

		 graph.append("}");
		 return graph.toString();
	}
	
	void printCallgraph(){
		 System.out.println("digraph g {");
		for(CallgraphNode node : this.nodes.values()){
		    System.out.println(node.getPrintable());
		}
		for(CallgraphEdge edge : this.edges){
			System.out.println(edge.getPrintable());
		}

		 System.out.println("}");
		 System.out.println("logic sloc: "+logicSloc);
	}
	
	String logicSloc = "";

	public void setLogicSloc(String logicSloc) {
		this.logicSloc = logicSloc;
	}
//
//	public void tag(String tagName, Integer tagValue) {
//		this.tag(tagName, tagValue.toString());
//	}

	public void putTags(String[] tags) {
		for(String tag : tags){
			this.tags.add(tag);
		}
	}
	
//	String majorCategory = "none";
}

