
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.Stack;
import java.util.TreeSet;

import soot.Body;
import soot.Scene;
import soot.SootClass;
import soot.SootMethod;
import soot.Unit;
import soot.UnitBox;
import soot.ValueBox;
import soot.jimple.ConditionExpr;
import soot.jimple.IfStmt;
import soot.options.Options;
import soot.toolkits.graph.ExceptionalUnitGraph;
import soot.toolkits.graph.UnitGraph;
import soot.util.dot.DotGraph;

public class RDDU {

	public static void main(String[] args) throws IOException {
		if (args.length !=4) {
			System.err.println("Expected 4 arguments: (1) class name (2) name of RD file (3) name of DU file (4) soot class path");
			System.exit(-1);
		}
		
		String className= args[0];
		String outputRDFile = args[1];
		String outputDUFile = args[2];
		String sootClassPath = args[3];
		
//		String className = "Example1";
//		String outputRDFile = "output.rd.txt";
//		String outputDUFile = "output.dotty";
//		String sootClassPath = "/home/kqi/Desktop/HW2_Example";
			
		sootClassPath = Scene.v().getSootClassPath() + File.pathSeparator + sootClassPath;
		Scene.v().setSootClassPath(sootClassPath);
		Options.v().set_keep_line_number(true);
		Options.v().setPhaseOption("jb", "use-original-names");
		SootClass sootClass = Scene.v().loadClassAndSupport(className);
		Scene.v().loadNecessaryClasses();
		sootClass.setApplicationClass();
	
		ControlGraph controlGraph = genControlFlowGraph(sootClass);
//		controlGraph.plot("control_graph.dotty");
		RDDUGen gen = new RDDUGen(outputDUFile, outputRDFile, controlGraph);
//		DUGen gen = new DUGen(subjectDUGraphPath, controlGraph);
		gen.genDUChains();
		gen.genRDGraph();
		
//		String fileNameWithOutExt = "output";
//		String destination = "./sootOutput/" + fileNameWithOutExt;
//		controlGraph.plot(destination + controlGraph.controlGraph_EXTENSION);
//		controlGraph.plot(subjectcontrolGraphtyPath);
	}
	
	static class DUGen{
		String DUGraphFilePath = "./du_graph.dot";
		ControlGraph controlGraph;
//		UnitGraph unitGraph;
		DUGen(String DUGraphFilePath, ControlGraph controlGraph){
			 this.DUGraphFilePath = DUGraphFilePath;
			 this.controlGraph = controlGraph;
//			 this.unitGraph = unitGraph;
		}
		
		void genDUChains(){
			DotGraph dot = new DotGraph("DU Graph");
			dot.setNodeShape("box");
//			Set<ControlGraphNode> nodes = controlGraph.getNodes();
			Iterator<Integer> iterator = controlGraph.iterator();
			while(iterator.hasNext()){
				int nodeId = iterator.next();
//				ControlGraphNode node = controlGraph.getNodeById(nodeId);
				Set<VariableDefinition> variableDefinitions = controlGraph.getVariableDefinitions(nodeId);
				for(VariableDefinition variableDef: variableDefinitions){
//					System.out.println("examine variable:" + variableDef.toString());
					Stack<Integer> toExpandStack = new Stack<Integer>();
					ArrayList<Integer> visitedCollection = new ArrayList<Integer>();
					ArrayList<String[]> edges = new ArrayList<String[]>();
//					if(controlGraph.isUsed(nodeId,variableDef)){
//						dot.drawEdge(variableDef.toString(), controlGraph.getNodeById(nodeId).label);
//					}
//					if(controlGraph.isKilled(nodeId,variableDef)){
//						continue;
//					} 
					toExpandStack.push(nodeId);
					while(!toExpandStack.isEmpty()){
						int toExpandId = toExpandStack.pop();
						visitedCollection.add(toExpandId);
						Set<Integer> expandedNodeIds = controlGraph.expandNode(toExpandId);
							for(int expandedNodeId : expandedNodeIds){
								// check if the node is already expanded.
//								ControlGraphNode expandedNode = controlGraph.getNodeById(expandedNodeId);
								
								if(controlGraph.isUsed(expandedNodeId,variableDef)){
									String from = variableDef.toString();
									String to = controlGraph.getNodeById(expandedNodeId).label;
									boolean existedEdge = false;
									for(String[] edge : edges){
										if(edge[0].equals(from) && edge[1].equals(to)){
											existedEdge = true;
											break;
										}
									}
									if(existedEdge){
										continue;
									}
									dot.drawEdge(from, to);
									edges.add(new String[]{from, to});
								}
								if(controlGraph.isKilled(expandedNodeId,variableDef)){
									continue;
								}
								boolean isExpanded = false;
								for(int visitedNodeId : visitedCollection){
									if(visitedNodeId == expandedNodeId){
										isExpanded = true;
										break;
									}
								}
								if(isExpanded){
									continue;
								}
								toExpandStack.push(expandedNodeId);
							}
					}
				}
				
			}
			dot.plot(DUGraphFilePath);
		}

	
		
	}
	
	static class RDDUGen extends DUGen{
		int times = 0;
		String rdFilePath = "./output.rd.txt";
		RDDUGen(String DUGraphFilePath, String rdFilePath, ControlGraph controlGraph) {
			super(DUGraphFilePath, controlGraph);
			
			this.rdFilePath = rdFilePath;
			
			// init the gen and kill sets collections by bfs
			this.genKillSetsArray = new GenKillSets[controlGraph.size()];
			for(int i = 0; i<this.genKillSetsArray.length; i++){
				this.genKillSetsArray[i] = new GenKillSets();
			}
			this.currentIteration = new InOutSets[controlGraph.size()];
			for(int i = 0; i<this.currentIteration.length; i++){
				this.currentIteration[i] = new InOutSets();
			}
			this.iterations = new ArrayList<InOutSets[]>();
			
			Stack<Integer> toExpandStack = new Stack<Integer>();
			List<Integer> visitedCollection = new ArrayList<Integer>();
			int entryId = controlGraph.getEntryId();
			this.genKillSetsArray[entryId].gen.addAll(getGenSet(entryId));
			this.genKillSetsArray[entryId].kill.addAll(new TreeSet()); 
			this.currentIteration[entryId].in.addAll(new TreeSet());//empty in and empty kill
			this.currentIteration[entryId].out.addAll(calculateOutSet(entryId));
			toExpandStack.push(entryId);
			
			while(!toExpandStack.isEmpty()) {
				int toExpandId = toExpandStack.pop();
				visitedCollection.add(toExpandId);
				Set<Integer> expandedNodeIds = controlGraph.expandNode(toExpandId);
				for(int expandedNodeId : expandedNodeIds){
					if(visitedCollection.contains(expandedNodeId)){
						continue;
					}
					Set<VariableDefinition> parentOutSet = this.currentIteration[toExpandId].out;
					Set<VariableDefinition> genSet = this.getGenSet(expandedNodeId);
					Set<VariableDefinition> killSet = this.calculateKillSet(genSet, parentOutSet);
					this.genKillSetsArray[expandedNodeId].gen.addAll(genSet);
					this.genKillSetsArray[expandedNodeId].kill.addAll(killSet);
					this.currentIteration[expandedNodeId].in.addAll(parentOutSet);
					this.currentIteration[expandedNodeId].out.addAll(calculateOutSet(expandedNodeId));
					toExpandStack.push(expandedNodeId);
				}
			}
			
			this.iterations.add(currentIteration);
			this.currentIteration = new InOutSets[controlGraph.size()];
			for(int i = 0; i<this.currentIteration.length; i++){
				this.currentIteration[i] = new InOutSets();
			}
			this.times++;
		  
		}
		
		private Set<VariableDefinition> calculateOutSet(int nodeId){
			Set<VariableDefinition> gen = this.genKillSetsArray[nodeId].gen;
			Set<VariableDefinition> kill = this.genKillSetsArray[nodeId].kill;
			Set<VariableDefinition> in = this.currentIteration[nodeId].in;
			Set<VariableDefinition> out = new TreeSet<VariableDefinition>();
			out.addAll(in);
			out.removeAll(kill);
			out.addAll(gen);
			return out;
		}
		
		private Set<VariableDefinition> calculateKillSet(Set<VariableDefinition> genSet, Set<VariableDefinition> inSet){
			Set<VariableDefinition> killSet = new TreeSet<VariableDefinition>();
			for(VariableDefinition inDef : inSet){
				for(VariableDefinition genDef : genSet){
					if(inDef.variable.equals(genDef.variable)){
						killSet.add(inDef);
						break;
					}
				}
			}
			return killSet;
		}
		
		private Set<VariableDefinition> getGenSet(int nodeId){
			return controlGraph.getVariableDefinitions(nodeId);
		}

		static class InOutSets{
			Set<VariableDefinition> in = new TreeSet<VariableDefinition>();
			Set<VariableDefinition> out = new TreeSet<VariableDefinition>();
			@Override
			public String toString() {
				return "InOutSets [in=" + in + ", out=" + out + "]";
			}
			
			
		}
		
		static class GenKillSets{
			Set<VariableDefinition> gen = new TreeSet<VariableDefinition>();
			Set<VariableDefinition> kill = new TreeSet<VariableDefinition>();
			@Override
			public String toString() {
				return "GenKillSets [gen=" + gen + ", kill=" + kill + "]";
			}
		}
		
		GenKillSets[] genKillSetsArray;
		InOutSets[]  currentIteration;
		List<InOutSets[]> iterations;
		
		
		void genRDGraph() throws FileNotFoundException{
//			ArrayList<String> nodes = controlGraph.getNodes();
//			Iterator<Integer> iterator = null; 
			
			boolean change = true;
			while(change){
				InOutSets[] lastIteration = this.iterations.get(times -1);
				change = false;
				for(int i= 0; i<currentIteration.length; i++){
					Set<Integer> parents = controlGraph.findParents(i); //= findParent(nods[j]);
					Set<VariableDefinition> inSet = new TreeSet<VariableDefinition>(); // = new Set();
					for(int parent: parents){
						inSet.addAll(lastIteration[parent].out);
					}
					this.currentIteration[i].in = inSet;
					Set<VariableDefinition> oldOut = lastIteration[i].out;
//					Set<VariableDefinition> genSet = this.genKillSetsArray[i].gen;
//					Set<VariableDefinition> killSet = this.calculateKillSet(genSet, inSet);
					Set<VariableDefinition> outSet = this.calculateOutSet(i);
					this.currentIteration[i].out = outSet;
					
					if(!outSet.equals(oldOut)) {//might need to re-implement the "equal" function.
					
						change = true;
					
					}
				}

				this.times++;
				
				if(change){
				this.iterations.add(currentIteration);
				this.currentIteration = new InOutSets[controlGraph.size()];
				for(int i = 0; i<this.currentIteration.length; i++){
					this.currentIteration[i] = new InOutSets();
				}
				}
			
			}

			System.out.println("Iterations:" + times);
			
			// format: Line #\t<Var name, line #>\t<Var name, line #>\t....\t<Var name, line #>\n 
			
			StringBuilder output = new StringBuilder();
			for(int i=1; i<currentIteration.length; i++){
				InOutSets inOutSet = currentIteration[i];
				Set<VariableDefinition> inSet = inOutSet.in;
				output.append(controlGraph.getNodeById(i).label+"\t");
				for(VariableDefinition def: inSet){
					output.append("<"+def.toString()+">\t");
				}
				output.append("\n");
			}
			

			System.out.println(output);
			
			PrintWriter out = new PrintWriter(this.rdFilePath);
			out.print(output);
			out.close();
		}

	}
	
	
	private static void print(String tag, List<Unit> units){
		StringBuilder builder = new StringBuilder();
		builder.append(": ");
		for(Unit unit: units){
			builder.append(unit.getTag("LineNumberTag").toString()+" ");
		}
		builder.append("\n");
		print(tag, builder.toString());
	}
	
	private static String getLineTag(Unit u){
		return u.getTag("LineNumberTag").toString();
	}
	
	private static void print(String tag, String message){
		if(tag.startsWith("control flow:")){
			return;
		}
		
		System.out.println(tag+message);
	}
	
	private static void profileUnitGraph(UnitGraph g){
		// Iterate over the results
		Iterator<Unit> iterator = g.iterator();
		int index = 0;
		while(iterator.hasNext()){
//			Unit u = i.next();
//			controlGraph.drawNode(u.getTag("LineNumberTag").toString());
			Unit u = iterator.next();
			print("control flow:",(index++)+": src line_"+u.getTag("LineNumberTag").toString()+" "+u.toString());
//			if(!u.getTag("LineNumberTag").toString().equals(preNode)){
//				controlGraph.drawEdge(preNode, u.getTag("LineNumberTag").toString());
//			}
//			preNode = u.getTag("LineNumberTag").toString();
//			
//			print("control flow:",(index++)+": src line_"+u.getTag("LineNumberTag").toString()+" "+u.toString());
			print("control flow:","is fall through: "+u.fallsThrough()+" is branches: "+u.branches());
			print("control flow:","...................................");
			if(u.getTag("LineNumberTag").toString().equals("9")){
				print("control flow:","=======================================");
				print("control flow:","=======================================");
				print("control flow:","---------------------------------------");
				List<UnitBox> unitBoxes = u.getUnitBoxes();
				List<Unit> units = g.getSuccsOf(u);
				print("control flow:","unitBoxes:");
				for(UnitBox box: unitBoxes){
					print("control flow:",box.getUnit().toString());
				}
				print("control flow:","---------------------------------------");
				print("control flow:","units:");
				for(Unit unit: units){
					print("control flow:",unit.toString());
				}
				print("control flow:","=======================================");
				print("control flow:","=======================================");
			}
		}
		print("control flow:","============profile end===============\n\n");
	}
	
	private static ControlGraph genControlFlowGraph(SootClass sootClass) {
		// Retrieve the method and its body
		SootMethod m = sootClass.getMethodByName("main");
		Body b = m.retrieveActiveBody();
		// Build the CFG and run the analysis
		UnitGraph g = new ExceptionalUnitGraph(b);
		
//		profileUnitGraph(g);
		
		ControlGraph controlGraph = new ControlGraph(g, "control_flow_graph");
	
		//The method signature is the entry block.
		String preNode = "entry";
		controlGraph.drawNode(preNode);
		controlGraph.setMethodArguments(new String[]{"args"});
//		String exitNode = "exit";
//		controlGraph.setNodeShape("box");
//		int entryBox = controlGraph.drawNode(preNode);
//		int exitBox = controlGraph.drawNode(exitNode);
//		controlGraph.setNodeShape(entryBox, "box");
//		controlGraph.setNodeShape(exitBox, "box");
//		controlGraph.setShape("circle");
	
		List<Unit> expansionQueue = new LinkedList<Unit>();
		List<Unit> expandedQueue = new LinkedList<Unit>();
		List<Unit> heads = g.getHeads();
		List<Unit> tails = g.getTails();
		for(Unit head : heads){
			controlGraph.drawEdge(preNode, head.getTag("LineNumberTag").toString());
//			controlGraph.drawNode(head.getTag("LineNumberTag").toString());
//			print("head:", head.getTag("LineNumberTag").toString());
		}
//		
//		while(i.hasNext()){
//			Unit u = i.next();
//			print("control flow:",(index++)+": src line_"+u.getTag("LineNumberTag").toString()+" "+u.toString());
//			if(!u.getTag("LineNumberTag").toString().equals(preNode)){
//				controlGraph.drawEdge(preNode, u.getTag("LineNumberTag").toString());
//			}
//			preNode = u.getTag("LineNumberTag").toString();
//		}
		
		expansionQueue.addAll(heads);
		while (!expansionQueue.isEmpty()) {
		print("control flow: expansion ", expansionQueue);
		Unit u = expansionQueue.remove(0);
		expandedQueue.add(u);
		print("control flow: expanded ", expandedQueue);
		
		print("control flow:",u.getTag("LineNumberTag").toString());
		preNode = u.getTag("LineNumberTag").toString();
		List<Unit> successors = g.getSuccsOf(u);
		
//		if(preNode.equals("8") || preNode.equals("9")){
//			print("control flow:","watch:");
//		}
		
		while(u.fallsThrough()){
			int fallsThroughEdge = -1;
			Unit fallsThroughNode = successors.get(0);
			String fallsThroughNodeLine = fallsThroughNode.getTag("LineNumberTag").toString();
			if(!fallsThroughNodeLine.equals(preNode)){
				fallsThroughEdge = controlGraph.drawEdge(preNode, fallsThroughNodeLine);
				print("control flow:","draw line: "+preNode+"_"+fallsThroughNodeLine);
				print("control flow:","fall through:"+fallsThroughNodeLine);
				boolean isFallsThroughExpanded = false;
				for (Unit expanded: expandedQueue){
					if(getLineTag(expanded).equals(getLineTag(fallsThroughNode))){
						isFallsThroughExpanded = true;
						break;
					}
				}
				if(isFallsThroughExpanded){
					break;
				}
			}
			if(u.branches()){
				print("control flow:",preNode+" node is also a branch, with branches: "+successors.size());
				for (int i=1; i<successors.size(); i++){
					Unit branch = successors.get(i);
					String branchLine = branch.getTag("LineNumberTag").toString();
					if(!branchLine.equals(preNode)){
					int edge = controlGraph.drawEdge(preNode, branchLine);
					if(u instanceof IfStmt){
					      IfStmt if_stmt = (IfStmt) u;
					      controlGraph.setLabel(edge, ((ConditionExpr)if_stmt.getCondition()).getSymbol().trim());
					      controlGraph.setLabel(fallsThroughEdge, "!"+((ConditionExpr)if_stmt.getCondition()).getSymbol().trim());
					}
					print("control flow:","draw line: "+preNode+"_"+branchLine);
					}
					
					boolean isExpanded = false;
					for (Unit expanded: expandedQueue){
						if(getLineTag(expanded).equals(getLineTag(branch))){
							isExpanded = true;
							break;
						}
					}
					if(isExpanded){
						continue;
					}
//					if(!fallsThroughNodeLine.equals(preNode)){
					expansionQueue.add(branch);
					print("control flow:","branchs:"+branchLine);
//					}
				}
			}
			preNode = fallsThroughNodeLine;
			u = fallsThroughNode;
			successors = g.getSuccsOf(u);
		}
		
		if(u.branches()){
			print("control flow:",preNode+" node is a branch, with branches: "+successors.size());
			for (Unit branch : successors){
				String branchLine = branch.getTag("LineNumberTag").toString();
				
				if(!branchLine.equals(preNode)){
				int edge = controlGraph.drawEdge(preNode, branchLine);
				if(u instanceof IfStmt){
				      IfStmt if_stmt = (IfStmt) u;
				      controlGraph.setLabel(edge, ((ConditionExpr)if_stmt.getCondition()).getSymbol().trim());
				}
				print("control flow:","draw line: "+preNode+"_"+branchLine);
				}
				
				boolean isExpanded = false;
				for (Unit expanded: expandedQueue){
					if(getLineTag(expanded).equals(getLineTag(branch))){
						isExpanded = true;
						break;
					}
				}
				if(isExpanded){
					print("control flow:","branch is expanded: "+branch.getTag("LineNumberTag").toString());
					continue;
				}
				
				expansionQueue.add(branch);
				print("control flow:","branchs:"+branchLine);
//				}
			}
		}
		
		}
		
//		for(Unit tail : tails){
//			controlGraph.drawEdge(tail.getTag("LineNumberTag").toString(), exitNode);
//		}
		
		return controlGraph;
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