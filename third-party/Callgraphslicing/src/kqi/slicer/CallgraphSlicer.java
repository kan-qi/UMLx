package kqi.slicer;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.ibm.wala.util.CancelException;
import com.ibm.wala.util.WalaException;

public class CallgraphSlicer extends CallgraphExtractor{
	
	public CallgraphSlicer(Src[] stubs, Src[] srcs, Src[] libraries)throws IllegalArgumentException, IOException, CancelException, WalaException {
		super(stubs, srcs, libraries);
	}

	void sliceCallgraph(Callgraph callgraph){
		for(CallgraphNode node : callgraph.nodes.values()){
			if(node.label.equals(rootNode)){
				node.setMajorCategory(determineMajorCategory(node, callgraph, new ArrayList<CallgraphNode>()));
			}
		}
	}
	
	private String[] majorCategories = new String[]{"model", "view", "control"};
	private String determineMajorCategory(CallgraphNode node, Callgraph callgraph, List<CallgraphNode> ancestors){
		String majorCategory = "none";
		for(CallgraphEdge edge : callgraph.getEdges()){
			CallgraphNode start = edge.start;
			if(start.label.equals(node.label)){
				CallgraphNode child = edge.end;
				List<CallgraphNode> newAncestors = new ArrayList<CallgraphNode>();
				newAncestors.addAll(ancestors);
				newAncestors.add(node);
				
				String childMajorCategory = "none";
						
				if(ancestors.contains(child)){
					childMajorCategory = child.getMajorCategory();
				}
				else {
					childMajorCategory = determineMajorCategory(child, callgraph, newAncestors);
				}
				
				child.setMajorCategory(childMajorCategory);
				if(childMajorCategory.equals("none")){
					
				}
				else if(majorCategory.equals("none")){
					majorCategory = childMajorCategory;
				}
				else if(!majorCategory.equals(childMajorCategory)){
					majorCategory = "control";
				}
				
			}
		}
		
		if(majorCategory.equals("none")){
			majorCategory = determineMajorCategoryByLib(node);
		}
		
		
		return majorCategory;
	}
	
	private String determineMajorCategoryByLib(CallgraphNode node) {
		for(Src lib : libraries){
			if(node.label.contains(lib.name)){
			return lib.type;
			}
		}
		
		for(Src src : stubs){
			if(node.label.contains(src.name)){
			return src.type;
			}
		}
		
		return "none";
	}

	
}
