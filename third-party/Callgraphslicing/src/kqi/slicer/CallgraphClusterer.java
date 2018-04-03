package kqi.slicer;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.ibm.wala.util.CancelException;
import com.ibm.wala.util.WalaException;

public class CallgraphClusterer extends CallgraphSlicer{

	public CallgraphClusterer(Src[] stubs, Src[] srcs, Src[] libraries)
			throws IllegalArgumentException, IOException, CancelException, WalaException {
		super(stubs, srcs, libraries);
	}
	
	
	public Callgraph clusterCallgraph(Callgraph callgraph){
		sliceCallgraph(callgraph);
		List<Callgraph> minorSubgraphs = new ArrayList<Callgraph>();
		Callgraph viewSubgraph = callgraph.getSubCallgraphByTag("view");
		minorSubgraphs.addAll(viewSubgraph.getDisconnectedGraphs());
		Callgraph modelSubgraph = callgraph.getSubCallgraphByTag("model");
		minorSubgraphs.addAll(modelSubgraph.getDisconnectedGraphs());
		Callgraph controlSubgraph = callgraph.getSubCallgraphByTag("control");
		minorSubgraphs.addAll(controlSubgraph.getDisconnectedGraphs());
		
		for(int i=0; i<minorSubgraphs.size();i++){
			Callgraph component = minorSubgraphs.get(i);
			component.label = "cluster_"+i;
		}
		
		Callgraph clusteredGraph = new Callgraph("clustered graph");
		clusteredGraph.putTags(new String[]{"compound=true"});
//		minorSubgraphs.add(noneSubgraph);
		

//		Callgraph moduleGraph = new Callgraph("major category");
		for(Callgraph subCallgraph1 : minorSubgraphs){
			CallgraphNode node1 = clusteredGraph.putNode(subCallgraph1.label, subCallgraph1);
			for(Callgraph subCallgraph2 : minorSubgraphs){
				if(subCallgraph1 != subCallgraph2){
					CallgraphNode node2 = clusteredGraph.putNode(subCallgraph2.label, subCallgraph2);
					List<CallgraphEdge> edges = callgraph.selectDirectedEdgesBetweenSubgraphs(subCallgraph1, subCallgraph2);
					if(edges.size() > 0){
						CallgraphEdge referenceEdge = edges.get(0);
						CallgraphEdge edge = new CallgraphEdge(referenceEdge.start, referenceEdge.end, "ltail="+node1.label, "lhead="+node2.label);
						clusteredGraph.putEdge(edge);
						callgraph.removeEdges(edges);
					}
				}
			}
		}
		
		System.out.println("module call graph .................");
		
		return clusteredGraph;
	}
	
	
	public Callgraph clusterCallgraphByMajorCategories(Callgraph callgraph){
		sliceCallgraph(callgraph);
//		Map<String, ArrayList<CallgraphNode>> majorCategories = new HashMap<String, ArrayList<CallgraphNode>>();
//		for(CallgraphNode node : callgraph.getNodes()){
//			ArrayList nodes = majorCategories.get(node.getMajorCategory());
//			if(nodes == null){
//				nodes = new ArrayList<CallgraphNode>();
//			}
//			nodes.add(node);
//			majorCategories.put(node.getMajorCategory(), nodes);
//		}
		
		

//		int minorNumber = 0;
//		List<Callgraph> minorSubgraphs = new ArrayList<Callgraph>();
//		Callgraph viewSubgraph = callgraph.getSubCallgraphByTag("view");
//		minorSubgraphs.addAll(viewSubgraph.getDisconnectedGraphs());
//		Callgraph modelSubgraph = callgraph.getSubCallgraphByTag("model");
//		minorSubgraphs.addAll(modelSubgraph.getDisconnectedGraphs());
//		Callgraph controlSubgraph = callgraph.getSubCallgraphByTag("control");
//		minorSubgraphs.addAll(controlSubgraph.getDisconnectedGraphs());
//		for(Callgraph subCallgraph : minorSubgraphs){
//			subCallgraph.tagNodes("minorNumber", ++minorNumber);
//			subCallgraph.tag("minorNumber", minorNumber);
//				List<SrcSection> srcSections = new ArrayList<SrcSection>();
//				for(CallgraphNode node : subCallgraph.nodes.values()){
//					SrcSection srcSection = new SrcSection();
//					srcSection.startPos = node.getStartPos();
//					srcSection.endPos = node.getEndPos();
//					srcSection.path = node.getSourceFile();
//					srcSections.add(srcSection);
//				}
//				
//				String logicSloc = "";
//				try {
//					logicSloc = new UCCWrapper().calLogicSrcCodeLines(srcSections.toArray(new SrcSection[0]));
//				} catch (IOException e) {
//					e.printStackTrace();
//				} catch (InterruptedException e) {
//					e.printStackTrace();
//				}
//			System.out.println("--------------subgraph--------------");
//			subCallgraph.setLogicSloc(logicSloc);
//			subCallgraph.printCallgraph();
//		}
//		
//
//		Callgraph moduleGraph = new Callgraph();
//		for(Callgraph subCallgraph1 : minorSubgraphs){
//			CallgraphNode node1 = moduleGraph.addNode(subCallgraph1.tag("minorNumber"));
//			for(Callgraph subCallgraph2 : minorSubgraphs){
//				if(subCallgraph1 != subCallgraph2){
//					CallgraphNode node2 = moduleGraph.addNode(subCallgraph2.tag("minorNumber"));
//					List<CallgraphEdge> edges = callgraph.selectEdgesBetweenSubgraphs(subCallgraph1, subCallgraph2);
//					if(edges.size() > 0){
//						moduleGraph.addEdge(node1, node2);
//					}
//				}
//			}
//		}
//		
//		System.out.println("module call graph .................");
//		moduleGraph.printCallgraph();
//		moduleGraph.dumpGraph("moduleGraph.dotty");
	
		

		int minorNumber = 0;
		List<Callgraph> minorSubgraphs = new ArrayList<Callgraph>();
		Callgraph viewSubgraph = callgraph.subtractSubCallgraphByTag("view");
//		minorSubgraphs.addAll(viewSubgraph.getDisconnectedGraphs());
		viewSubgraph.label = "cluster_0";
		minorSubgraphs.add(viewSubgraph);
		Callgraph modelSubgraph = callgraph.subtractSubCallgraphByTag("model");
//		minorSubgraphs.addAll(modelSubgraph.getDisconnectedGraphs());
		modelSubgraph.label = "cluster_1";
		minorSubgraphs.add(modelSubgraph);
		Callgraph controlSubgraph = callgraph.subtractSubCallgraphByTag("control");
//		minorSubgraphs.addAll(controlSubgraph.getDisconnectedGraphs());
		controlSubgraph.label = "cluster_2";
		minorSubgraphs.add(controlSubgraph);
		Callgraph clusteredGraph = callgraph;
		clusteredGraph.putTags(new String[]{"compound=true"});
//		minorSubgraphs.addAll(controlSubgraph.getDisconnectedGraphs());
//		minorSubgraphs.add(noneSubgraph);
		

//		Callgraph moduleGraph = new Callgraph("major category");
		for(Callgraph subCallgraph1 : minorSubgraphs){
			CallgraphNode node1 = clusteredGraph.putNode(subCallgraph1.label, subCallgraph1);
			for(Callgraph subCallgraph2 : minorSubgraphs){
				if(subCallgraph1 != subCallgraph2){
					CallgraphNode node2 = clusteredGraph.putNode(subCallgraph2.label, subCallgraph2);
					List<CallgraphEdge> edges = callgraph.selectDirectedEdgesBetweenSubgraphs(subCallgraph1, subCallgraph2);
					if(edges.size() > 0){
						CallgraphEdge referenceEdge = edges.remove(0);
						referenceEdge.putTags("ltail="+node1.label, "lhead="+node2.label);
						callgraph.removeEdges(edges);
					}
				}
			}
		}
		
		System.out.println("module call graph .................");
		
		return clusteredGraph;
	}

}
