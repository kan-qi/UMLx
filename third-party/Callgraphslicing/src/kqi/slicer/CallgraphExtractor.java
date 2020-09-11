package kqi.slicer;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import com.ibm.wala.cast.ir.ssa.AstIRFactory;
import com.ibm.wala.cast.js.ipa.callgraph.JSCallGraph;
import com.ibm.wala.cast.js.ipa.callgraph.JSCallGraphUtil;
import com.ibm.wala.cast.js.test.JSCallGraphBuilderUtil;
import com.ibm.wala.cast.js.test.JSCallGraphBuilderUtil.CGBuilderType;
import com.ibm.wala.cast.js.translator.CAstRhinoTranslatorFactory;
import com.ibm.wala.classLoader.SourceModule;
import com.ibm.wala.classLoader.IMethod.SourcePosition;
import com.ibm.wala.ipa.callgraph.CGNode;
import com.ibm.wala.shrikeCT.InvalidClassFileException;
import com.ibm.wala.util.CancelException;
import com.ibm.wala.util.WalaException;

/*
 * 
 * The rules to construct callgraph:
 * 
 * if ctor, then []/{}/new/DEF
 * if DEF, then <JavaScriptLoader, LFunction>
 * if Code body, then method invokation
 * if code body, method definition/file
 * 
 * if ["Code body"]src/function1 -> ["Code body"]src/function2, then add edge <src/function1, src/function2> to callgraph
 * if ["Code body"]&& src/function1 -> ["Code body"]lib/function2, then add edge <src/function1, lib> to callgraph
 * if ["Code body"]src/function1 -> ["ctor"]src/function2, then no edge
 * if ["Code body"]lib/function1 -> ["Code body"]lib/function2, then no edge
 * if ["Code body"]lib/function1 -> ["Code body"]src/function2, then add edge <lib, src/function2> to callgraph
 * if [*]lib/function1->[*]lib/function2, then no edge
 */
public class CallgraphExtractor {
	
	Src[] libraries;
	Src[] srcs;
	Src[] stubs;
	JSCallGraph CG;
	
	String rootNode = "LFakeRoot";
	
	String getSourceFileName(String path){
		return path.substring(path.lastIndexOf("/")+1);
	}
	
	CallgraphExtractor(Src[] stubs, Src[] srcs, Src[] libraries) throws IllegalArgumentException, IOException, CancelException, WalaException{
		this.libraries = libraries;
		this.srcs = srcs;
		this.stubs = stubs;
		

		
		JSCallGraphUtil.setTranslatorFactory(new CAstRhinoTranslatorFactory());
		
		List<SourceModule> sourceModules = new ArrayList<SourceModule>();
		
		for(Src stub : stubs){
			sourceModules.add(JSCallGraphUtil.makeSourceModule(new File(stub.path).toURL(), stub.name));
		}
		
		for(Src library : libraries){
			sourceModules.add(JSCallGraphUtil.makeSourceModule(new File(library.path).toURL(), library.name));
		}
		
		for(Src src : srcs){
			sourceModules.add(JSCallGraphUtil.makeSourceModule(new File(src.path).toURL(), src.name));
		}
		
		CG = (JSCallGraph) JSCallGraphBuilderUtil.makeScriptCG(sourceModules.toArray(new SourceModule[0]),CGBuilderType.ONE_CFA, AstIRFactory.makeDefaultFactory());
	}
	
	void printRawCallgraph(){
		System.out.println(this.CG.toString());
	}
	

	boolean isNodeFromLibraries(CGNode node){
		if(node.getMethod().toString().contains("LObject") || node.getMethod().toString().contains("LArray") || node.getMethod().toString().contains("LStringObject")){
			return true;
		}
		for(Src library : libraries){
			if(node.getMethod().toString().contains(library.name)){
				return true;
			}
		}
		for(Src stub : stubs){
			if(node.getMethod().toString().contains(stub.name)){
				return true;
			}
		}
		return false;
	}
	
	boolean isNodeFromSrcs(CGNode node){
	
		for(Src src : srcs){
			if(node.getMethod().toString().contains(src.name)){
				return true;
			}
		}
		return false;
	}
	
	
//	String[] getJavaScriptConstructorDescriptors(CGNode node){
//		String[] descriptors = null;  
//		if(node.getMethod() instanceof JavaScriptConstructor){
//			descriptors = new String[2]; 
//			JavaScriptConstructor constructor = (JavaScriptConstructor)(node.getMethod());
//			descriptors[0] = constructor.constructedType().getReference().getName().getClassName().toString();
//			descriptors[1] = constructor.constructedType().getReference().getName().getPackage().toString();
//	      }
//		  return descriptors;
//	}
	
	String getMethodSrcFromDescriptor(String descriptor){
		String[] segs = descriptor.split("^L|/");
		return segs[1];
	}
	
	String[] getMethodDescriptors(CGNode node){
		String[] descriptors = null;
		String descriptor = null;
//		if(node.getMethod() instanceof JavaScriptConstructor){
//			JavaScriptConstructor constructor = (JavaScriptConstructor)(node.getMethod());
//			descriptor = constructor.constructedType().getReference().getName().toString();
//	    }
//		else {
//			descriptor = node.getMethod().toString();
//		}
		
		descriptor = node.getMethod().toString();
		if(descriptor.startsWith("synthetic ")) {
			String[] segments = descriptor.split("^\\s*synthetic < |, | >$");
			if(segments.length > 2){
				descriptors = new String[3];
				descriptors[0] = "synthetic";
				descriptors[1] = "fake";
				descriptors[2] = segments[2];
			}
		} else if (descriptor.startsWith("<Code body of function ")) {
			String[] segments = descriptor.split("^<Code body of function |>$");
			if(segments.length > 1){
				descriptors = new String[3];
				descriptors[0] = "Code body of function";
				descriptors[1] = "invk";
				descriptors[2] = segments[1];
			}
			
		} else if (descriptor.startsWith("<ctor for ")) {
			String[] segments = descriptor.split("^<ctor for <|,|>>|>\\(|>>$|\\)>$");
			// as function definition
			if(segments.length > 3){
				descriptors = new String[3];
				descriptors[0] = "ctor for";
				descriptors[1] = "def";
				descriptors[2] = segments[3];
			}
			// as new
			else if(segments.length > 2){
				descriptors = new String[3];
				descriptors[0] = "ctor for";
				descriptors[1] = "new";
				descriptors[2] = segments[2];
			}
		}
		return descriptors;
		}
	
	

	Callgraph extractCallGraph(String label) throws InvalidClassFileException{
//		  TypeName type = TypeName.findOrCreate("L" + dir + "/" + file);
		  if (CG != null) {
			 CGNode root = CG.getFakeRootNode();
			 List<CGNode> queue = new ArrayList<CGNode>();
			 List<CGNode> visited = new ArrayList<CGNode>();
			 Callgraph callgraph = new Callgraph(label);
			 queue.add(root);
			 
			 while(queue.size() > 0){
				 CGNode node = queue.remove(queue.size() - 1);
				 visited.add(node);
				 Iterator<CGNode> iterator =  CG.getSuccNodes(node);
				 while(iterator.hasNext()){
					CGNode child = iterator.next();
					if(visited.contains(child)){
						continue;
					}
					
					queue.add(child);
					String[] edge = null;
					if( (edge = ruleCheckOnEdge(node,child)) == null){
						continue;
					}
//					String nodeDescriptor = getMethodDescriptor(edge[0]);
					CallgraphNode parentNode = callgraph.addNode(edge[0]);
					String nodeSrc = this.getMethodSrcFromDescriptor(edge[0]);
					int startPos = 0;
					int endPos = 0;
					SourcePosition position = node.getMethod().getSourcePosition(0);
					if(position != null){
						 startPos= position.getFirstOffset();
						 endPos = position.getLastOffset();
					}
					parentNode.setSourceInfo(nodeSrc, startPos, endPos);
					
//					String childNodeDescriptor = getMethodDescriptor(child);
					CallgraphNode childNode = callgraph.addNode(edge[1]);
					String childNodeSrc = this.getMethodSrcFromDescriptor(edge[1]);
					int childstartPos = 0;
					int childendPos = 0;
					SourcePosition childPosition = node.getMethod().getSourcePosition(0);
					if(position != null){
						 childstartPos= childPosition.getFirstOffset();
						 childendPos = childPosition.getLastOffset();
					}
					childNode.setSourceInfo(childNodeSrc, childstartPos, childendPos);
					
					if(!callgraph.containEdge(parentNode, childNode)) {
						
						callgraph.addEdge(parentNode, childNode);
					}
					
				 }
			 }
				
			 return callgraph;
		  }
		  return null;
		}
	
	/*
	 * following the following rules:
	 * if ["Code body"]src/function1 -> ["Code body"]src/function2, then add edge <src/function1, src/function2> to callgraph
	 * if ["Code body"]&& src/function1 -> ["Code body"]lib/function2, then add edge <src/function1, lib> to callgraph
	 * if ["Code body"]src/function1 -> ["ctor"]src/function2, then no edge
	 * if ["Code body"]lib/function1 -> ["Code body"]lib/function2, then no edge
	 * if ["Code body"]lib/function1 -> ["Code body"]src/function2, then add edge <lib, src/function2> to callgraph
	 * if [*]lib/function1->[*]lib/function2, then no edge
	 */
	 
	private String[] ruleCheckOnEdge(CGNode node, CGNode child){
		boolean isNodeSrc = isNodeFromSrcs(node);
		boolean isChildSrc = isNodeFromSrcs(child);
		String[] nodeDescriptors = this.getMethodDescriptors(node);
		String[] childDescriptors = this.getMethodDescriptors(child);
		if(nodeDescriptors == null || childDescriptors == null){
			return null;
		}
		if(isNodeSrc){
				if(nodeDescriptors[0].equals("Code body of function")){
					if(isChildSrc) {
						if(childDescriptors[0].equals("Code body of function") || (childDescriptors[0].equals("ctor") && childDescriptors[1].equals("new"))){
						return new String[]{nodeDescriptors[2], childDescriptors[2]};
						}
					}
					else{
						return new String[]{nodeDescriptors[2], childDescriptors[2]};
					}
				}
		}
		else{
			 if (isChildSrc){
				 return new String[]{nodeDescriptors[2], childDescriptors[2]};
			 }
			 else {
				 return null;
			 }
		}
		
		
		return null;
	}
	
	public static class Src{
		String name;
		String path;
		String type;
		
		public Src(String name, String path, String type) {
			this.name = name;
			this.path = path;
			this.type = type;
		}
		
	}

	
	
}
