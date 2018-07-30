

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Stack;
import java.util.TreeSet;

import soot.Body;
import soot.Scene;
import soot.SootClass;
import soot.SootMethod;
import soot.Unit;
import soot.ValueBox;
import soot.jimple.IfStmt;
import soot.options.Options;
import soot.toolkits.graph.ExceptionalUnitGraph;
import soot.toolkits.graph.UnitGraph;
import soot.util.dot.DotGraph;
import soot.util.dot.DotGraphEdge;
import soot.util.dot.DotGraphNode;
import soot.jimple.ConditionExpr;

public class Slicer {

	public static void main(String[] args) throws IOException {
		if (args.length !=3) {
			System.err.println("Expected 4 arguments: (1) class name (2) name of CFG file (3) soot class path");
			System.exit(-1);
		}
		
		String className= args[0];
		String outputCFGFile = args[1];
		String sootClassPath = args[2];
	

//		String className = "csci610.cfg.samples.Subject2";
//		String outputCFGFile = "./subjects/key/Subject2.dotty";
//		String sootClassPath = "./subjects/bin";
		
		sootClassPath = Scene.v().getSootClassPath() + File.pathSeparator + sootClassPath;
		Scene.v().setSootClassPath(sootClassPath);
		Options.v().set_keep_line_number(true);
		Options.v().setPhaseOption("jb", "use-original-names");
		SootClass sootClass = Scene.v().loadClassAndSupport(className);
		Scene.v().loadNecessaryClasses();
		sootClass.setApplicationClass();


		genControlFlowGraph(sootClass);
		
	}
	
public static void genPostDominanceTree(){
	
}
	
public static ControlGraph genControlFlowGraph(SootClass sootClass) {
	// Retrieve the method and its body
			SootMethod m = sootClass.getMethodByName("main");
			Body b = m.retrieveActiveBody();
			// Build the CFG and run the analysis
			UnitGraph g = new ExceptionalUnitGraph(b);
			
//			profileUnitGraph(g);
			
			ControlGraph controlGraph = new ControlGraph(g, "control_flow_graph");
		
			//The method signature is the entry block.
			String preNode = "entry";
			String exitNode = "exit";
			controlGraph.drawNode(preNode);
			controlGraph.setMethodArguments(new String[]{"args"});
//			String exitNode = "exit";
//			controlGraph.setNodeShape("box");
//			int entryBox = controlGraph.drawNode(preNode);
//			int exitBox = controlGraph.drawNode(exitNode);
//			controlGraph.setNodeShape(entryBox, "box");
//			controlGraph.setNodeShape(exitBox, "box");
//			controlGraph.setShape("circle");
		
		List<Unit> expansionQueue = new LinkedList<Unit>();
		Stack<Unit> expansionStack = new Stack<Unit>();
		List<Unit> heads = g.getHeads();
		List<Unit> tails = g.getTails();

		Set<Edge> expandedEdges = new TreeSet<Edge>();
		for(Unit head : heads){
			controlGraph.drawEdge(preNode, getLineTag(head));
			expansionQueue.add(head);
			expandedEdges.add(new Edge(preNode, getLineTag(head)));
		}
		for(Unit tail: tails){
			controlGraph.drawEdge(getLineTag(tail), exitNode);
			expandedEdges.add(new Edge(getLineTag(tail), exitNode));
		}
		
		
		expansionStack.addAll(heads);

		while (!expansionStack.isEmpty()) {
		print("expansion", expansionStack);
		Unit u = expansionStack.pop();

		expansionQueue.add(u);
		print("expanded", expansionQueue);
		
		preNode = u.getTag("LineNumberTag").toString();
		print("control flow: expanding on ", preNode);
		
			List<Unit> successors = g.getSuccsOf(u);
			Map<String, Integer> branches = new HashMap<String, Integer>();
			for(int i=0; i<successors.size(); i++){
				Unit unit = successors.get(i);
				String node = getLineTag(unit);
				if(!preNode.equals(node)){
					Edge edge = new Edge(preNode, node);
					if(!expandedEdges.contains(edge)){
						int dotEdge = controlGraph.drawEdge(preNode, node);
						branches.put(node, dotEdge);
						expandedEdges.add(edge);
					}
					if(expandedNode(expansionQueue, node)){
					  continue;	
					}
				}
				
				if(u instanceof IfStmt){
				      IfStmt ifStmt = (IfStmt) u;
				      String condition = ((ConditionExpr)ifStmt.getCondition()).getSymbol().trim();
				      String target = ifStmt.getTarget().getTag("LineNumberTag").toString();
				      for(String branch : branches.keySet()){
				    	  int branchId = branches.get(branch);
				    	  ControlGraphEdge edge = controlGraph.getEdgeId(branchId);
				    	  if(branch.equals(target)){
						      edge.setLabel(condition);
				    	  }
				    	  else{
						      edge.setLabel("!"+ condition);
				    	  }
				      }
				}
				
				if(!expandedUnit(expansionQueue, unit)){
				expansionStack.add(unit);
				}
			}
		}
		
		
		return controlGraph;
	}
	
	
	
	
	private static boolean expandedUnit(List<Unit> expansionQueue, Unit unit){
		for(Unit u: expansionQueue){
			if(u.equals(unit)){
				return true;
			}
		}
		return false;
	}
	
	private static boolean expandedNode(List<Unit> expansionQueue, String node){
		for (Unit u: expansionQueue){
			if(getLineTag(u).equals(node)){
				return true;
			}
		}
		return false;
	}
	
	
    static class Edge implements Comparable<Edge>{
		String from;
		String to;
		@Override
		public String toString() {
			return from+"->"+to;
		}
		public Edge(String from, String to) {
			super();
			this.from = from;
			this.to = to;
		}
		@Override
		public int compareTo(Edge o) {
			if(o == null){
			return 1;
			} else{
				return this.toString().compareTo(o.toString());
			}
		}
		
	}
	
	private static String getLineTag(Unit u){
		return u.getTag("LineNumberTag").toString();
	}
	

	
	private static void print(String tag, Collection<Unit> units){
		StringBuilder builder = new StringBuilder();
		builder.append(": ");
		for(Unit unit: units){
			builder.append(unit.getTag("LineNumberTag").toString()+" ");
		}
		builder.append("\n");
		print(tag, builder.toString());
	}
	
	private static void print(String tag, Set<String> nodes){
		StringBuilder builder = new StringBuilder();
		builder.append(": ");
		for(String node: nodes){
			builder.append(node+" ");
		}
		builder.append("\n");
		print(tag, builder.toString());
	}
	
	private static void print(String tag, String message){
		System.out.println(tag+message);
	}
	
	static class ControlGraphNode{
		public ControlGraphNode(String node, List<Unit> units) {
			this.label = node;
			this.units = units;
		}
		List<Unit> units;
		String label;
		String shape;
	}
	
	static class ControlGraphEdge{
		public ControlGraphEdge(int fromId, int toId) {
			this.from = fromId;
			this.to = toId;
			this.label = "";
		}
		public void setLabel(String condition) {
			// TODO Auto-generated method stub
			
		}
		String label;
		int from;
		int to;
	}
	
	static class VariableDefinition implements Comparable<VariableDefinition>{
		public VariableDefinition(String variable, String node) {
			this.node = node;
			this.variable = variable;
		}
		String node;
		String variable;
		
		@Override
		public int compareTo(VariableDefinition o) {
			if(o == null){
				return 1;
			}
			return this.toString().compareTo(o.toString());
		}

		@Override
		public String toString() {
			return variable + ", " + node;
		}
		
		
	}
	
	static class ControlGraph implements Iterable<Integer>{
		ArrayList<ControlGraphNode> nodes = new ArrayList<ControlGraphNode>();
		ArrayList<ControlGraphEdge> edges = new ArrayList<ControlGraphEdge>();
		
		
		String label;
		String shape;
		
		UnitGraph unitGraph;
		
		int size(){
			return nodes.size();
		}

		int getEntryId(){
			return 0;
		}
		
		
		public Set<Integer> findParents(int nodeId) {
			Set<Integer> parentIds = new TreeSet<Integer>();
			for (ControlGraphEdge edge : edges){
				if(edge.to == nodeId){
					parentIds.add(edge.from);
				}
			}
			return parentIds;
		}

		ControlGraph(UnitGraph unitGraph, String label){
			this.unitGraph = unitGraph;
			this.label = label;
			this.shape = "box";
		}
		
		Set<Integer> expandNode(int nodeId) {
			Set<Integer> expandedNodes = new TreeSet<Integer>();
			for(ControlGraphEdge edge: edges){
				if(edge.from == nodeId){
					expandedNodes.add(edge.to);
				}
			}
			
			return expandedNodes;
		}
		
		ControlGraphNode getNodeById(int nodeId){
			return this.nodes.get(nodeId);
		}
		
		ControlGraphEdge getEdgeId(int edgeId){
			return this.edges.get(edgeId);
		}

//		public Set<ControlGraphNode> getNodes() {
//			return nodes;
//		}

		int drawEdge(String from, String to){
			int fromId = drawNode(from);
			int toId = drawNode(to);
			for(int i=0; i<edges.size(); i++){
			    ControlGraphEdge edge = edges.get(i);
			    if(edge.from == fromId && edge.to == toId ){
			    	return i;
			    }
			}
			
			ControlGraphEdge newEdge = new ControlGraphEdge(fromId, toId);
			edges.add(newEdge);
			return edges.size() - 1;
		}
		
		public void setLabel(int edgeId, String label){
			if(edgeId > -1 && edgeId < edges.size()){
				edges.get(edgeId).label = label;
			}
		}
		
		int drawNode(String node){
			for(int i=0; i<nodes.size(); i++){
			    ControlGraphNode existingNode = nodes.get(i);
			    if(existingNode.label.equals(node)){
			    	return i;
			    }
			}
			
			Iterator<Unit> iterator = unitGraph.iterator();
			List<Unit> units = new ArrayList<Unit>();
			while(iterator.hasNext()){
				Unit unit = iterator.next();
				if(getLineTag(unit).equals(node)){
					units.add(unit);
				}
			}
			nodes.add(new ControlGraphNode(node, units));
			return nodes.size() -1;
		}
		
		void setShape(String shape){
			this.shape = shape;
		}
		
		void setNodeShape(int nodeId, String shape){
			if(nodeId > -1 && nodeId < nodes.size()){
				nodes.get(nodeId).shape = shape;
			}
		}
		
		
		public boolean isUsed(int nodeId, VariableDefinition variableDef) {
			ControlGraphNode node = getNodeById(nodeId);
			if(node.label.equals("entry")){
				return false;
			}
		
			for(Unit unit: node.units){
				List<ValueBox> valueBoxes = unit.getUseBoxes();
				for(ValueBox valueBox: valueBoxes){
					String variable = valueBox.getValue().toString();
					if(!variable.startsWith("$") && variableDef.variable.equals(variable)){
						return true;
					}
				}
			}
			return false;
		}
		
		boolean isKilled(int nodeId, VariableDefinition variableDef) {
			Set<VariableDefinition> defs = getVariableDefinitions(nodeId);
			for(VariableDefinition def : defs){
				if(def.variable.equals(variableDef.variable)&&!def.node.equals(variableDef.node)){
						return true;
					}
			}
			return false;
		}
		
		private String[] methodArguments;
		

		public void setMethodArguments(String[] methodArguments) {
			this.methodArguments = methodArguments;
		}

		Set<VariableDefinition> getVariableDefinitions(int nodeId) {
			ControlGraphNode node = getNodeById(nodeId);

			Set<VariableDefinition> variableDefs = new TreeSet<VariableDefinition>();
			
			if(node.label.equals("entry")){
				for(String arg: methodArguments){
					variableDefs.add(new VariableDefinition(arg, node.label));
				}
			}
			
			for(Unit unit : node.units){
				List<ValueBox>  valueBoxes = unit.getDefBoxes();
				for(ValueBox valueBox: valueBoxes){
					String variable = valueBox.getValue().toString();
					if(!variable.startsWith("$") && !variable.startsWith("args")){
					variableDefs.add(new VariableDefinition(variable, node.label));
					}
				}
			}
			return variableDefs;
		}
		
		void plot(String filePath){
			DotGraph dot = new DotGraph("DU Graph");
			for(ControlGraphNode node: nodes){
				dot.drawNode(node.label);
			}
			
			for(ControlGraphEdge edge: edges){
				dot.drawEdge(nodes.get(edge.from).label, nodes.get(edge.to).label);
			}
			dot.plot(filePath);
		}
		
		@Override
		public Iterator<Integer> iterator() {
			return  new Iterator<Integer>(){

				int currentIndex = -1;
				
				@Override
				public boolean hasNext() {
					if(currentIndex < nodes.size() - 1) {
						return true;
					}
					return false;
				}

				@Override
				public Integer next() {
					return hasNext()?++currentIndex:-1;
				}

				@Override
				public void remove(){
					
				}
					
				};
		}
	}

}
