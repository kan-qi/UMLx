/*
 * AnalysisEntrypoint.java - part of the GATOR project
 *
 * Copyright (c) 2018 The Ohio State University
 *
 * This file is distributed under the terms described in LICENSE in the
 * root directory.
 */
package presto.android;

import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import presto.android.xml.XMLParser;
import soot.Body;
import soot.Scene;
import soot.SootClass;
import soot.SootField;
import soot.SootMethod;
import soot.Type;
import soot.Unit;
import soot.Value;
import soot.ValueBox;
import soot.jimple.FieldRef;
import soot.jimple.InvokeExpr;
import soot.jimple.Stmt;
import soot.jimple.infoflow.android.Debug;
import soot.jimple.infoflow.android.SetupApplication;
import soot.jimple.infoflow.android.axml.AXmlAttribute;
import soot.jimple.infoflow.android.axml.AXmlHandler;
import soot.jimple.infoflow.android.axml.AXmlNode;
import soot.jimple.infoflow.android.axml.parsers.AXML20Parser;
import soot.jimple.infoflow.android.resources.IResourceHandler;
import soot.jimple.infoflow.android.SetupApplication;
import soot.jimple.toolkits.callgraph.CallGraph;
import soot.jimple.toolkits.callgraph.Edge;
import soot.options.Options;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import presto.android.GraphsWriter;

import org.xmlpull.v1.XmlPullParserException;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import pxb.android.axml.AxmlVisitor;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

/**
 * @author Kan Qi
 *
 */
public class CodeAnalysis {
  private static CodeAnalysis theInstance;

  private CodeAnalysis() {
  }

	public static synchronized CodeAnalysis v() {
		if (theInstance == null) {
			theInstance = new CodeAnalysis();
		}
		return theInstance;
	}

	class MethodUnit {
		public MethodUnit(SootMethod method) {
			this.uuid = UUID.randomUUID().toString();
			this.name = method.getName();
			this.returnType = method.getReturnType().toString();
			this.parameterTypes = new ArrayList<String>();
			for(Type parameter : method.getParameterTypes()) {
				this.parameterTypes.add(parameter.toString());
			}
			this.attachment = method;
			this.signature = method.getSignature();
		}
		String returnType;
		List<String> parameterTypes;
		String name;
		String uuid;
		SootMethod attachment;
		String signature;

		public String getReturnType() {
			return this.returnType;
		}

		public List<String> getParameterTypes() {
			return this.parameterTypes;
		}

		public String toJSONString() {
			StringBuilder str = new StringBuilder();
			str.append("{");
			str.append("\"name\":\""+name+"\",");
			str.append("\"UUID\":\""+uuid+"\",");
			str.append("\"returnType\":\""+returnType+"\",");
			str.append("\"parameterTypes\":[");
			int i = 0;
			for(String parameterType : parameterTypes) {
				str.append("\""+parameterType+"\"");
				if(i != parameterTypes.size()-1) {
					str.append(",");
				}
				i++;
			}
			str.append("]}");
			return str.toString();
		}
	}


//private class Parameter{
//	String name;
//	String type;
//
//	Parameter(name, type){
//		this.name = name;
//		this.type = type;
//	}
//
//	public String toJSONString() {
//		StringBuilder str = new StringBuilder();
//		str.append("{");
//		str.append("\"name\":\""+name+"\",");
//		str.append("\"type\":\""+type);
//		str.append("}");
//		return str.toString();
//	}
//}


	private class CallGraphNode{
		MethodUnit methodUnit;
		ClassUnit classUnit;

		CallGraphNode(MethodUnit methodUnit, ClassUnit classUnit) {
			super();
			this.methodUnit = methodUnit;
			this.classUnit = classUnit;
		}

	}

	//output the call graph to JSON format
	private void constructCallGraph(CallGraph cg, List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, MethodUnit> methodBySig, Map<String, String> methodToClass, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic){

		System.out.println("construct of call graph starts.");
  public static synchronized CodeAnalysis v() {
    if (theInstance == null) {
      theInstance = new CodeAnalysis();
    }
    return theInstance;
  }

  class MethodUnit {
	  public MethodUnit(SootMethod method) {
		  this.uuid = UUID.randomUUID().toString();
		  this.name = method.getName();
		  this.returnType = method.getReturnType().toString();
		  this.parameterTypes = new ArrayList<String>();
		  for(Type parameter : method.getParameterTypes()) {
			  this.parameterTypes.add(parameter.toString());
		  }
		  this.attachment = method;
		  this.signature = method.getSignature();
	  }
	String returnType;
	List<String> parameterTypes;
	String name;
	String uuid;
	SootMethod attachment;
	String signature;

	public String getReturnType() {
		return this.returnType;
	}

	public List<String> getParameterTypes() {
		return this.parameterTypes;
	}

	public String toJSONString() {
		StringBuilder str = new StringBuilder();
		str.append("{");
		str.append("\"name\":\""+name+"\",");
		str.append("\"UUID\":\""+uuid+"\",");
		str.append("\"returnType\":\""+returnType+"\",");
		str.append("\"parameterTypes\":[");
		int i = 0;
		for(String parameterType : parameterTypes) {
			str.append("\""+parameterType+"\"");
			if(i != parameterTypes.size()-1) {
				str.append(",");
			}
			i++;
		}
		str.append("]}");
		return str.toString();
	}
  }


private class CallGraphNode{
	MethodUnit methodUnit;
	ClassUnit classUnit;

	CallGraphNode(MethodUnit methodUnit, ClassUnit classUnit) {
		super();
		this.methodUnit = methodUnit;
		this.classUnit = classUnit;
	}

}

//output the call graph to JSON format
private String constructCallGraph(CallGraph cg, List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, MethodUnit> methodBySig, Map<String, String> methodToClass, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic){

		System.out.println("construct of call graph starts.");
		Set<CallGraphNode[]> edges = new HashSet<CallGraphNode[]>();

		if(cg != null) {
			Iterator<Edge> itr = cg.iterator();

		if(cg != null) {
		Iterator<Edge> itr = cg.iterator();

			while(itr.hasNext()){
				Edge e = itr.next();
				String srcSig = e.getSrc().toString();
				String destSig = e.getTgt().toString();

				MethodUnit srcMethod = methodBySig.get(srcSig);
				MethodUnit destMethod = methodBySig.get(destSig);

				if(srcMethod == null || destMethod == null) {
					continue;
				}

				String srcClassUUID = methodToClass.get(srcMethod.uuid);
				String targetClassUUID = methodToClass.get(destMethod.uuid);

				ClassUnit srcClass = classUnitByUUID.get(srcClassUUID);
				ClassUnit targetClass = classUnitByUUID.get(targetClassUUID);

				CallGraphNode srcNode = new CallGraphNode(srcMethod, srcClass);
				CallGraphNode targetNode = new CallGraphNode(destMethod, targetClass);

				edges.add(new CallGraphNode[] {srcNode, targetNode});
			}
		}


		System.out.println("construct of call graph finishes.");

		convertCallGraphToJSON(edges);
	}

		while(itr.hasNext()){
			Edge e = itr.next();
			String srcSig = e.getSrc().toString();
			String destSig = e.getTgt().toString();

			MethodUnit srcMethod = methodBySig.get(srcSig);
			MethodUnit destMethod = methodBySig.get(destSig);

			if(srcMethod == null || destMethod == null) {
				continue;
			}

			String srcClassUUID = methodToClass.get(srcMethod.uuid);
			String targetClassUUID = methodToClass.get(destMethod.uuid);

			ClassUnit srcClass = classUnitByUUID.get(srcClassUUID);
			ClassUnit targetClass = classUnitByUUID.get(targetClassUUID);

			CallGraphNode srcNode = new CallGraphNode(srcMethod, srcClass);
			CallGraphNode targetNode = new CallGraphNode(destMethod, targetClass);

			edges.add(new CallGraphNode[] {srcNode, targetNode});

//			String srcCompositeClassUUID = classUnitToCompositeClassDic.get(srcClassUUID);
//			String targetCompositeClassUUID = classUnitToCompositeClassDic.get(targetClassUUID);
//
//			CompositeClassUnit srcCompositeClass = compositeClassUnitByUUID.get(srcCompositeClassUUID);
//			CompositeClassUnit targetCompositeClass = compositeClassUnitByUUID.get(targetCompositeClassUUID);
		}
		}


		System.out.println("construct of call graph finishes.");

		return convertCallGraphToJSON(edges);
	}


String convertCallGraphToJSON(Set<CallGraphNode[]> edges) {
	
	String outputS = "{";
		outputS += "\"edges\":[";
		
		int i = 0;
		for(CallGraphNode[] edge: edges) {
			if(edge[0] == null || edge[1] == null) {
				continue;
			}
			i++;
			if(i != 1) {
				outputS += ",";
			}
			outputS += "{\"start\":{\"methodUnit\":\""+edge[0].methodUnit.uuid+"\",\"classUnit\":\""+edge[0].classUnit.uuid+"\"},";
//			outputS += "->";
			outputS += "\"end\":{\"methodUnit\":\""+edge[1].methodUnit.uuid+"\",\"classUnit\":\""+edge[1].classUnit.uuid+"\"}}";
//			outputS += "\n";
			
		}
		outputS += "]}";
		
//		Debug1.v().printf("composite graph: %s", outputS);
//		Debug4.v().printf("json: %s", outputS);
		
		return outputS;
	}

  
  class ClassUnit{
	  public ClassUnit(SootClass sootClass, boolean isWithinBoundary) {
		// TODO Auto-generated constructor stub
		this.name = sootClass.getName();
		this.attachment = sootClass;
		this.uuid = UUID.randomUUID().toString();
		this.isWithinBoundary = isWithinBoundary;
	
		methodUnits = new ArrayList<MethodUnit>();
		attrUnits = new ArrayList<AttrUnit>();
		for(SootMethod method: this.attachment.getMethods()) {
			methodUnits.add(new MethodUnit(method));
		}
		
		for(SootField sootField : this.attachment.getFields()) {
			AttrUnit attrUnit = new AttrUnit(sootField.getName(), sootField.getType().toString());
			attrUnits.add(attrUnit);
		}
	}
	  String uuid;
	  SootClass attachment;
	  boolean isWithinBoundary;
	  List<MethodUnit> methodUnits;
	  List<AttrUnit> attrUnits;
	  String name;
	  
	  public List<AttrUnit> getAttr(){
		  return this.attrUnits;
	  }
	  
	  public List<MethodUnit> getMethods(){	
		 return this.methodUnits;
	  }
	  
	  public String toJSONString() {
		  StringBuilder str = new StringBuilder();
		  str.append("{\"UUID\":\""+ 
				  this.uuid+"\","+
				  "\"name\":\""+
				  this.name+"\","+
				  "\"isWithinBoundary\":\""+
				  this.isWithinBoundary+"\","+
				  "\"methodUnits\":["
				  );
		  int i = 0;
		  for(MethodUnit methodUnit : methodUnits) {
			  str.append(methodUnit.toJSONString());
			  if(i != methodUnits.size() - 1) {
			  str.append(",");
			  }
			  i++;
		  }
		  str.append( "],\"attrUnits\":[");
		  i = 0;
		  for(AttrUnit attrUnit : attrUnits) {
			  str.append(attrUnit.toJSONString());
			  if(i != attrUnits.size() - 1) {
			  str.append(",");
			  }
			  i++;
		  }
		  str.append("]}");
		  return str.toString();
	  }
  }
  
  class CompositeClassUnit implements Set<ClassUnit>{
	  Set<ClassUnit> classUnits;
	  String name;
	  String uuid;
	  
	  public CompositeClassUnit(String name) {
		  this.classUnits = new HashSet<ClassUnit>();
//		  this.classUnits.add(classUnit);
//		  this.name = classUnit.getName();
		  this.name = name;
		  this.uuid = UUID.randomUUID().toString();
	  }
	  
	  public boolean contains(ClassUnit classUnit) {
		  return classUnits.contains(classUnit);
	  }
	 
	  public String toJSONString() {
		  Iterator<ClassUnit> iterator = classUnits.iterator();
		  StringBuilder Json = new StringBuilder();
		  Json.append("{\"name\": \""+name+"\",");
		  Json.append("\"UUID\": \""+uuid+"\",");
		  Json.append("\"classUnits\": [");
		  while(iterator.hasNext()) {
			  ClassUnit classUnit = iterator.next();
//			  Json.append(classUnit.toJSONString());
//			  Json.append("\""+classUnit.getName()+"\"");
			  Json.append("\""+classUnit.uuid+"\"");
			  if(iterator.hasNext()) {
				  Json.append(",");
			  }
		  }
		  Json.append("]}");
		  return Json.toString();
	  }

	@Override
	public boolean add(ClassUnit e) {
		// TODO Auto-generated method stub
		return this.classUnits.add(e);
	}

	@Override
	public boolean addAll(Collection<? extends ClassUnit> c) {
		// TODO Auto-generated method stub
		return this.classUnits.addAll(c);
	}

	@Override
	public void clear() {
		this.classUnits.clear();
		
	}

	@Override
	public boolean contains(Object o) {
		// TODO Auto-generated method stub
		return this.classUnits.contains(o);
	}

	@Override
	public boolean containsAll(Collection<?> c) {
		// TODO Auto-generated method stub
		return this.classUnits.containsAll(c);
	}

	@Override
	public boolean isEmpty() {
		// TODO Auto-generated method stub
		return this.classUnits.isEmpty();
	}

	@Override
	public Iterator<ClassUnit> iterator() {
		// TODO Auto-generated method stub
		return this.classUnits.iterator();
	}

	@Override
	public boolean remove(Object o) {
		// TODO Auto-generated method stub
		return this.classUnits.remove(0);
	}

	@Override
	public boolean removeAll(Collection<?> c) {
		// TODO Auto-generated method stub
		return this.classUnits.removeAll(c);
	}

	@Override
	public boolean retainAll(Collection<?> c) {
		// TODO Auto-generated method stub
		return this.classUnits.retainAll(c);
	}

	@Override
	public int size() {
		// TODO Auto-generated method stub
		return this.classUnits.size();
	}

	@Override
	public Object[] toArray() {
		// TODO Auto-generated method stub
		return this.classUnits.toArray();
	}

	@Override
	public <T> T[] toArray(T[] a) {
		// TODO Auto-generated method stub
		return this.classUnits.toArray(a);
	}
  }
  
  
  private class AccessGraphNode{
		MethodUnit methodUnit;
		AttrUnit attrUnit;
		ClassUnit classUnit;
		
		AccessGraphNode(MethodUnit methodUnit, AttrUnit attrUnit, ClassUnit classUnit) {
			super();
			this.methodUnit = methodUnit;
			this.classUnit = classUnit;
			this.attrUnit = attrUnit;
		}
		
	}

	private class TypeDependencyGraphNode {
		String className;
		String uuid;
		Map<String, String> methods;
		Map<String, TypeDependencyUnit> typeDependencies;	// Other classes that this class has relationships with

		public TypeDependencyGraphNode(ClassUnit classUnit) {
			this.className = classUnit.name;
			this.uuid = classUnit.uuid;
			this.methods = new HashMap<String, String>();
			this.typeDependencies = new HashMap<String, TypeDependencyUnit>();

			for (MethodUnit method : classUnit.getMethods()){
				this.methods.put(method.name, method.uuid);
			}
		}

		public void addReturnTypeDependency(TypeDependencyGraphNode typeDependency, String methodName) {
			TypeDependencyUnit edge = this.getTypeDependencyUnit(typeDependency);
			edge.addReturnDependency(methodName);
		}

		public void addParameterTypeDependency(TypeDependencyGraphNode typeDependency, String methodName) {
			TypeDependencyUnit edge = this.getTypeDependencyUnit(typeDependency);
			edge.addParameterDependency(methodName);
		}

		public void addLocalVariableTypeDependency(TypeDependencyGraphNode typeDependency, String methodName) {
			TypeDependencyUnit edge = this.getTypeDependencyUnit(typeDependency);
			edge.addLocalVarDependency(methodName);
		}

		private TypeDependencyUnit getTypeDependencyUnit(TypeDependencyGraphNode typeDependency) {
			if (!this.typeDependencies.containsKey(typeDependency.className)) {
				TypeDependencyUnit typeDepEdge = new TypeDependencyUnit(typeDependency);
				this.typeDependencies.put(typeDependency.className, typeDepEdge);
			}

			return (TypeDependencyUnit)this.typeDependencies.get(typeDependency.className);
		}
	}

	private class TypeDependencyUnit {
		TypeDependencyGraphNode typeDependency;	// The class that the parent node has a dependency on
		List<String> returnDependencies;	// Keep track of the method names returning this type
		Map<String, Integer> parameterDependencies;	// Keep track of method names and how many parameters
		Map<String, Integer> localVarDependencies;	// Keep track of method names and how many within it

		public TypeDependencyUnit(TypeDependencyGraphNode typeDependency) {
			this.typeDependency = typeDependency;

			this.returnDependencies = new ArrayList<String>();
			this.parameterDependencies = new HashMap<String, Integer>();
			this.localVarDependencies = new HashMap<String, Integer>();
		}

		public void addReturnDependency(String methodName) {
			this.returnDependencies.add(methodName);
		}

		public void addParameterDependency(String methodName) {
			if (!this.parameterDependencies.containsKey(methodName)) {
				this.parameterDependencies.put(methodName, 1);
			} else {
				this.parameterDependencies.put(methodName, this.parameterDependencies.get(methodName) + 1);
			}
		}

		public void addLocalVarDependency(String methodName) {
			if (!this.localVarDependencies.containsKey(methodName)) {
				this.localVarDependencies.put(methodName, 1);
			} else {
				this.localVarDependencies.put(methodName, this.localVarDependencies.get(methodName) + 1);
			}
		}
	}

	private class AttrUnit {
		String name;
		String type;
		String uuid;

		public AttrUnit(String name, String type) {
			this.name = name;
			this.type = type;
			this.uuid = UUID.randomUUID().toString();
		}

		public String toJSONString() {
			return "{\"name\":\""+this.name+"\", \"type\":\""+this.type+"\", \"UUID\":\""+this.uuid+"\"}";
		}
	}

	private class AttributeDependencyGraphNode{
		String className;
		String uuid;
		Map<String, String> attributes;
		Map<String, AttributeDependencyUnit> attributeDependencies;	// Other classes that this class has relationships with

		public AttributeDependencyGraphNode(ClassUnit classUnit) {
			this.className = classUnit.name;
			this.uuid = classUnit.uuid;
			this.attributes = new HashMap<String, String>();
			this.attributeDependencies = new HashMap<String, AttributeDependencyUnit>();

			for (AttrUnit attribute : classUnit.getAttributes()) {
				this.attributes.put(attribute.name, attribute.uuid);
			}
		}

		public void addAttributeAttributeDependency(AttributeDependencyGraphNode attributeDependency, String attrName) {
			AttributeDependencyUnit edge = this.getAttributeDependencyUnit(attributeDependency);
			edge.addAttributeDependency(attrName);
		}

		private AttributeDependencyUnit getAttributeDependencyUnit(AttributeDependencyGraphNode attributeDependency) {
			if (!this.attributeDependencies.containsKey(attributeDependency.className)) {
				AttributeDependencyUnit attrDepEdge = new AttributeDependencyUnit(attributeDependency);
				this.attributeDependencies.put(attributeDependency.className, attrDepEdge);
			}

			return (AttributeDependencyUnit)this.attributeDependencies.get(attributeDependency.className);
		}
	}


	private class AttributeDependencyUnit {
		AttributeDependencyGraphNode AttributeDependency;	// The class that the parent node has a dependency on
		List<String> attributeDependencies;	// Keep track of attribute names

		public AttributeDependencyUnit(AttributeDependencyGraphNode AttributeDependency) {
			this.AttributeDependency = AttributeDependency;
			this.attributeDependencies = new ArrayList<String>();
		}

		public void addAttributeDependency(String attrName) {
			this.attributeDependencies.add(attrName);
		}
	}


	public void constructCompositionGraph(List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic) {

		HashMap mappings = new HashMap<String, AttributeDependencyGraphNode>();

		for (ClassUnit classUnit : classUnits) {
			// Create a AttributeDependencyGraphNode for the class if it doesn't exist yet
			if (!mappings.containsKey(classUnit.name)) {
				AttributeDependencyGraphNode classNode = new AttributeDependencyGraphNode(classUnit);
				mappings.put(classUnit.name, classNode);
			}

			AttributeDependencyGraphNode currentClassNode = (AttributeDependencyGraphNode)mappings.get(classUnit.name);

			// Loop through attributes of the class
			List<AttrUnit> attributes = classUnit.getAttributes();
			for (AttrUnit attribute : attributes) {
				// Create a AttributeDependencyGraphNode for the attribute type if it doesn't exist yet
				if (classUnitByName.containsKey(attribute.type)) {
					ClassUnit attrType = (ClassUnit)classUnitByName.get(attribute.type);
					if (!mappings.containsKey(attribute.type)) {
						AttributeDependencyGraphNode node = new AttributeDependencyGraphNode(attrType);
						mappings.put(attribute.type, node);
					}

					// Add the attribute type dependency
					AttributeDependencyGraphNode attrNode = (AttributeDependencyGraphNode)mappings.get(attribute.type);
					currentClassNode.addAttributeAttributeDependency(attrNode, attribute.name);
				}
			}
		}

		convertCompositionGraph(mappings);
	}

	public void constructTypeDependencyGraph(List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic) {
		HashMap mappings = new HashMap<String, TypeDependencyGraphNode>();

		for (ClassUnit classUnit : classUnits) {
			// Create a TypeDependencyGraphNode for the class if it doesn't exist yet
			if (!mappings.containsKey(classUnit.name)) {
				TypeDependencyGraphNode classNode = new TypeDependencyGraphNode(classUnit);
				mappings.put(classUnit.name, classNode);
			}


			TypeDependencyGraphNode currentClassNode = (TypeDependencyGraphNode)mappings.get(classUnit.name);


			// Loop through methods of the class
			List<MethodUnit> methods = classUnit.getMethods();
			for (MethodUnit method : methods) {
				// Document the method return type
				String returnTypeName = method.getReturnType();
				if (classUnitByName.containsKey(returnTypeName)) {
					ClassUnit returnType = (ClassUnit)classUnitByName.get(returnTypeName);
					if (!mappings.containsKey(returnTypeName)) {
						TypeDependencyGraphNode node = new TypeDependencyGraphNode(returnType);
						mappings.put(returnTypeName, node);
					}

					// Add the method return type dependency
					TypeDependencyGraphNode returnTypeNode = (TypeDependencyGraphNode)mappings.get(returnTypeName);
					currentClassNode.addReturnTypeDependency(returnTypeNode, method.name);

					// Loop through parameter types of the method
					List<String> parameterTypes = method.getParameterTypes();
					for (String parameterTypeName : parameterTypes) {
						if (classUnitByName.containsKey(parameterTypeName)) {
							ClassUnit parameterType = (ClassUnit)classUnitByName.get(parameterTypeName);
							if (!mappings.containsKey(parameterTypeName)) {
								TypeDependencyGraphNode node = new TypeDependencyGraphNode(parameterType);
								mappings.put(parameterTypeName, node);
							}

							// Add the method parameter type dependency
							TypeDependencyGraphNode parameterTypeNode = (TypeDependencyGraphNode)mappings.get(parameterTypeName);
							currentClassNode.addParameterTypeDependency(returnTypeNode, method.name);
						}
					}

					// Loop through method code lines to find local variables
					Body methodBlockUnit = null;

					try {
						methodBlockUnit = method.attachment.retrieveActiveBody();
					} catch(Exception e) {
						e.printStackTrace();
						continue;
					}

					for (Unit u : methodBlockUnit.getUnits()) {
						Stmt s = (Stmt) u;
						if(s.containsFieldRef()) {
							FieldRef fieldRef = s.getFieldRef();
							SootClass targetClassUnitType = fieldRef.getFieldRef().declaringClass();
							ClassUnit targetClassUnit = classUnitByName.get(targetClassUnitType.getName());
							if(targetClassUnit == null) {
								continue;
							}

							if (classUnitByName.containsKey(targetClassUnit.name)) {
								ClassUnit targetClassType = (ClassUnit)classUnitByName.get(targetClassUnit.name);
								if (!mappings.containsKey(targetClassUnit.name)) {
									TypeDependencyGraphNode node = new TypeDependencyGraphNode(targetClassType);
									mappings.put(targetClassUnit.name, node);
								}

								// Add the local variable dependency
								TypeDependencyGraphNode localVarNode = (TypeDependencyGraphNode)mappings.get(targetClassUnit.name);
								currentClassNode.addLocalVariableTypeDependency(localVarNode, method.name);
							}
						}
					}
				}
			}
		}

		convertTypeDependencyGraphToJSON(mappings);
	}

	void convertTypeDependencyGraphToJSON(HashMap<String, TypeDependencyGraphNode> typeDepGraph) {
		GraphsWriter.v().writeGraph("typeDependencyGraph", "{\"nodes\":[");

		// Loop through each class node
		int classIter = 0;
		int classCount = typeDepGraph.size();
		for (TypeDependencyGraphNode node : typeDepGraph.values()) {
			GraphsWriter.v().writeGraph("typeDependencyGraph", "{\"class\":\"" + node.className + "\",\"uuid\":\"" + node.uuid + "\",\"methodCount\":" + node.methods.size() + ",\"dependencies\":[");

			// Loop through each class it depends on
			int typeDepIter = 0;
			int typeDepCount = node.typeDependencies.size();
			for (TypeDependencyUnit dependency : node.typeDependencies.values()) {
				GraphsWriter.v().writeGraph("typeDependencyGraph", "{\"class\":\"" + dependency.typeDependency.className + "\",\"uuid\":\"" + dependency.typeDependency.uuid + "\"");

				int depCount;
				int iterCount = 0;

				GraphsWriter.v().writeGraph("typeDependencyGraph", ",\"returnDependencies\":[");
				depCount = dependency.returnDependencies.size();
				for (String returnDep : dependency.returnDependencies) {
					String returnDepUuid = node.methods.get(returnDep);
					GraphsWriter.v().writeGraph("typeDependencyGraph", "{\"methodName\":\"" + returnDep + "\",\"methodUuid\":\"" + returnDepUuid + "\"}");
					iterCount++;
					if (iterCount < depCount) {
						GraphsWriter.v().writeGraph("typeDependencyGraph", ",");
					}
				}
				GraphsWriter.v().writeGraph("typeDependencyGraph", "]");

				GraphsWriter.v().writeGraph("typeDependencyGraph", ",\"paramDependencies\":[");
				depCount = dependency.parameterDependencies.size();
				iterCount = 0;
				for (Map.Entry<String, Integer> paramDep : dependency.parameterDependencies.entrySet()){
					String paramDepUuid = node.methods.get(paramDep.getKey());
					GraphsWriter.v().writeGraph("typeDependencyGraph", "{\"methodName\":\"" + paramDep.getKey() + "\",\"methodUuid\":\"" + paramDepUuid + "\",\"count\":" + paramDep.getValue() + "}");
					iterCount++;
					if (iterCount < depCount) {
						GraphsWriter.v().writeGraph("typeDependencyGraph", ",");
					}
				}
				GraphsWriter.v().writeGraph("typeDependencyGraph", "]");

				GraphsWriter.v().writeGraph("typeDependencyGraph", ",\"localVarDependencies\":[");
				depCount = dependency.localVarDependencies.size();
				iterCount = 0;
				for (Map.Entry<String, Integer> localVarDep : dependency.localVarDependencies.entrySet()){
					String localVarUuid = node.methods.get(localVarDep.getKey());
					GraphsWriter.v().writeGraph("typeDependencyGraph", "{\"methodName\":\"" + localVarDep.getKey() + "\",\"methodUuid\":\"" + localVarUuid + "\",\"count\":" + localVarDep.getValue() + "}");
					iterCount++;
					if (iterCount < depCount) {
						GraphsWriter.v().writeGraph("typeDependencyGraph", ",");
					}
				}
				GraphsWriter.v().writeGraph("typeDependencyGraph", "]}");

				typeDepIter++;
				if (typeDepIter < typeDepCount) {
					GraphsWriter.v().writeGraph("typeDependencyGraph", ",");
				}
			}

			GraphsWriter.v().writeGraph("typeDependencyGraph", "]}");

			classIter++;
			if (classIter < classCount) {
				GraphsWriter.v().writeGraph("typeDependencyGraph", ",");
			}
		}

		GraphsWriter.v().writeGraph("typeDependencyGraph", "]}");

	}

	void convertCompositionGraph(HashMap<String, AttributeDependencyGraphNode> attributeCompGraph) {
		GraphsWriter.v().writeGraph("compositionGraph", "{\"nodes\":[");

		// Loop through each class node
		int classIter = 0;
		int classCount = attributeCompGraph.size();
		for (AttributeDependencyGraphNode node : attributeCompGraph.values()) {
			GraphsWriter.v().writeGraph("compositionGraph",  "{\"class\":\"" + node.className + "\",\"uuid\":\"" + node.uuid + "\",\"dependencies\":[");

			// Loop through each class it has an attribute dependency on
			int typeDepIter = 0;
			int typeDepCount = node.attributeDependencies.size();
			for (AttributeDependencyUnit dependency : node.attributeDependencies.values()) {
				GraphsWriter.v().writeGraph("compositionGraph",  "{\"class\":\"" + dependency.AttributeDependency.className + "\",\"uuid\":\"" + dependency.AttributeDependency.uuid + "\"");

				int depCount;
				int iterCount = 0;

				GraphsWriter.v().writeGraph("compositionGraph",",\"attrDependencies\":[");
				depCount = dependency.attributeDependencies.size();
				iterCount = 0;
				for (String attrDep : dependency.attributeDependencies) {
					String attrUuid = node.attributes.get(attrDep);
					GraphsWriter.v().writeGraph("compositionGraph",  "{\"attributeName\":\"" + attrDep + "\",\"attributeUuid\":\"" + attrUuid + "\"}");
					iterCount++;
					if (iterCount < depCount) {
						GraphsWriter.v().writeGraph("compositionGraph",  ",");
					}
				}
				GraphsWriter.v().writeGraph("compositionGraph",  "]}");

				typeDepIter++;
				if (typeDepIter < typeDepCount) {
					GraphsWriter.v().writeGraph("compositionGraph",  ",");
				}
			}

			GraphsWriter.v().writeGraph("compositionGraph",  "]}");

			classIter++;
			if (classIter < classCount) {
				GraphsWriter.v().writeGraph("compositionGraph",  ",");
			}
		}

		GraphsWriter.v().writeGraph("compositionGraph",  "]}");

//	return output;
	}

	public void constructExtendsGraph(List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic) {
		System.out.println("construct of extends graph starts.");

		List<List<ClassUnit>> extendsClasses = new ArrayList<List<ClassUnit>>();
		GraphsWriter.v().writeGraph("extendsGraph",  "{");
		for (ClassUnit classUnit : classUnits) {
			SootClass sootClassUnit = classUnit.attachment;
			SootClass superClassUnit = null;
			try {
				superClassUnit = sootClassUnit.getSuperclass();
			} catch(Exception e) {
				System.out.println(e.toString());
			}

			if(superClassUnit == null) {
				continue;
			}

			String from = superClassUnit.getName();
			//if parent class is not in the map, ignore it
			if(classUnitByName.containsKey(classUnit.name) && classUnitByName.containsKey(from)){
				ClassUnit parent = classUnitByName.get(from);
				List<ClassUnit> temp = new ArrayList();
				temp.add(parent);
				temp.add(classUnit);
				extendsClasses.add(temp);
			}
		}


		int i = 0;
		for(List<ClassUnit> extendpair:extendsClasses){
			String parentName = extendpair.get(0).name;
			String parentUUID = extendpair.get(0).uuid;
			String childName = extendpair.get(1).name;
			String childUUID = extendpair.get(1).uuid;
			GraphsWriter.v().writeGraph("extendsGraph",  "\""+i+"\":{\"from\":{\"name\":\""+parentName+"\",\"uuid\":\""+parentUUID+"\"},\"to\":{\"name\":\""+childName+"\",\"uuid\":\""+childUUID+"\"}}");
			if(i != extendsClasses.size()-1){
				GraphsWriter.v().writeGraph("extendsGraph",  ",");
			}
			i++;

		}

		GraphsWriter.v().writeGraph("extendsGraph",  "}");

		System.out.println("construct of extends graph finishes.");

//	int ind = 10;
//	return res;
	}

	public void constructAccessGraph(List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic) {

	  	Set<AccessGraphNode[]> edges = new HashSet<AccessGraphNode[]>();

//		Set<CompositeClassUnit[]> compositeEdges = new HashSet<CompositeClassUnit[]>(); // call relation
		
		for (ClassUnit classUnit : classUnits) {
			
//			Debug1.v().printf("class unit id:%s\n", classUnit.uuid);
			String compositeClassUnitUUID = classUnitToCompositeClassDic.get(classUnit.uuid);
//			Debug1.v().printf("composite class unit id:%s\n", compositeClassUnitUUID);
			CompositeClassUnit compositeClassUnit = compositeClassUnitByUUID.get(compositeClassUnitUUID);
//			Debug1.v().printf("composite class unit:%s\n", compositeClassUnit.name);

			Set<ClassUnit> referencedClassUnits = new HashSet<ClassUnit>();
			
			List<MethodUnit> methodUnits = classUnit.getMethods();
			for (MethodUnit methodUnit : methodUnits) {
//				var methodUnit = methodUnits[q];

//				if (!methodUnit || !classUnit.isWithinBoundary) {
//					continue;
//				}
				
//				Debug1.v().printf("method:%s\n", methodUnit.name);
				Debug2.v().printf("method:%s", methodUnit.name);
				
//				if(!methodUnit.hasActiveBody()) {
//					continue;
//				}
				
//				Body methodBlockUnit = methodUnit.getActiveBody();
				
//				if(!methodUnit.name.equals("onCreate")) {
//					continue;
//				}
				
//				if(methodUnit.attachment.getSource() == null) {
//					continue;
//				}
				
				
				Body methodBlockUnit = null;
				
				try{
					methodBlockUnit = methodUnit.attachment.retrieveActiveBody();
				}catch(Exception e) {
					e.printStackTrace();
					continue;
				}
				
//				Debug1.v().printf("active body:%s\n", methodUnit.name);
				Debug2.v().printf("active body:%s", methodUnit.name);
				
//				if( s.containsFieldRef() ) {
//	                FieldRef fr = s.getFieldRef();
//	                if( fr instanceof StaticFieldRef ) {
//	                    SootClass cl = fr.getFieldRef().declaringClass();
//	                    for (SootMethod clinit : EntryPoints.v().clinitsOf(cl)) {
//	                        addEdge( source, s, clinit, Kind.CLINIT );
//	                    }
//	                }
//	            }
				
				AccessGraphNode srcAccessGraphNode = new AccessGraphNode(methodUnit, null, classUnit);
				ArrayList<AccessGraphNode> referencedAccessGraphNodes = new ArrayList<AccessGraphNode>();
//				ArrayList<AccessGraphCompositeNode> referencedAccessGraphCompositeNodes = new ArrayList<AccessGraphCompositeNode>();
				
				for (Unit u : methodBlockUnit.getUnits()) {
//					Debug1.v().printf("unit:%s\n", u.toString());
					Stmt s = (Stmt) u;
//					if(SootUtilities.isInvoke(s)) {
//						InvokeExpr invokeExpr = s.getInvokeExpr();
//						invokeExpr.getArgs();
//					}
//					else 
						if(s.containsFieldRef()) {
						FieldRef fieldRef = s.getFieldRef();
//					}
//				      List<ValueBox> useBoxes = s.getUseBoxes();
//				      for (ValueBox useBox : useBoxes) {
//				        Value val = useBox.getValue();
//				        Debug1.v().printf("value:%s\n", val.toString());
//				        if(val instanceof FieldRef) {
//				         Debug1.v().printf("field:%s\n", fieldRef.toString());
				        Debug2.v().printf("field:%s\n", fieldRef.toString());
//				          FieldRef fieldRef = (FieldRef) val;
				          SootClass targetClassUnitType = fieldRef.getFieldRef().declaringClass();
//				          Debug1.v().printf("target class:%s\n", targetClassUnitType.getName());
					        
						ClassUnit targetClassUnit = classUnitByName.get(targetClassUnitType.getName());
//						referencedClassUnits.add(targetClassUnit);
						
						if(targetClassUnit == null) {
							continue;
						}
						
						AttrUnit attrUnit = new AttrUnit(fieldRef.getField().getName(), fieldRef.getField().getType().toString());
						
						AccessGraphNode targetAccessGraphNode = new AccessGraphNode(null, attrUnit, targetClassUnit);
						
						referencedAccessGraphNodes.add(targetAccessGraphNode);
						
//						String targetCompositeClassUnitUUID = classUnitToCompositeClassDic.get(classUnit.uuid);
//						CompositeClassUnit targetCompositeClassUnit = compositeClassUnitByUUID.get(targetCompositeClassUnitUUID);
//						AccessGraphCompositeNode targetAccessGraphCompositeNode = new AccessGraphCompositeNode(null, attrUnit, targetCompositeClassUnit);
//		
//						referencedAccessGraphCompositeNodes.add(targetAccessGraphCompositeNode);
				}
			  }
			
			for(AccessGraphNode accessGraphNode : referencedAccessGraphNodes) {
//				if(accessGraphNode == null) {
//					continue;
//				}
//				Debug1.v().printf("target class unit:%s\n", targetClassUnit.name);
				
//				Debug1.v().printf("target composite class unit:%s\n", targetCompositeClassUnit.name);
//				if(srcAccessGraphNode != accessGraphNode) {
				edges.add(new AccessGraphNode[] {srcAccessGraphNode, accessGraphNode});
//				}
				
//				if(compositeClassUnit != targetCompositeClassUnit) {
//				compositeEdges.add(new CompositeClassUnit[]{compositeClassUnit, targetCompositeClassUnit});
//				}
			}
			

		}
		}
		
		return convertAccessGraphToJSON(edges);
		
}

String convertAccessGraphToJSON(Set<AccessGraphNode[]> edges) {
	
	String outputS = "{";
//	outputS += "\"compositeClassGraph\":[";
//		int i = 0;
//		for(CompositeClassUnit[] compEdge: compositeEdges) {
//			if(compEdge[0] == null || compEdge[1] == null) {
//				continue;
//			}
//			i++;
//			if(i != 1) {
//				outputS += ",";
//			}
//			outputS += "{\"start\":\""+compEdge[0].uuid+"\",";
////			outputS += "->";
//			outputS += "\"end\":\""+compEdge[1].uuid+"\"}";
////			outputS += "\n";
//		}
//		outputS += "]";
		
//		outputS += "\"classGraph\":[";
		
		outputS += "\"edges\":[";
		
		int i = 0;
		for(AccessGraphNode[] edge: edges) {
			if(edge[0] == null || edge[1] == null) {
				continue;
			}
			i++;
			if(i != 1) {
				outputS += ",";
			}
			
			
			outputS += "{\"start\":{\"methodUnit\":\""+edge[0].methodUnit.uuid+"\",\"classUnit\":\""+edge[0].classUnit.uuid+"\"},";
//			outputS += "->";
//			AttrUnit attrUnit = new AttrUnit("attN1", "attT1");
			
			outputS += "\"end\":{\"attrUnit\":"+edge[1].attrUnit.toJSONString()+",\"classUnit\":\""+edge[1].classUnit.uuid+"\"}}";
//			outputS += "\n";
			
//			outputS += "{\"start\":\""+edge[0].uuid+"\",";
////			outputS += "->";
//			outputS += "\"end\":\""+edge[1].uuid+"\"}";
////			outputS += "\n";
			
		}
		outputS += "]}";
		
//		Debug1.v().printf("composite graph: %s", outputS);
//		Debug4.v().printf("json: %s", outputS);
		
		return outputS;
	}

//public static Set<Class> getDependencies(Scene scene, CallGraph callGraph, Class<?> clazz) {
//    Set<Class> dependencies = Sets.newHashSet();
//
//    SootClass sootClass = scene.getSootClass(clazz.getName());
//
//    for(SootMethod method: sootClass.getMethods())
//        if(!method.isPhantom())
//            callGraph.edgesInto(method).forEachRemaining(edge -> {
//                try {
//                    dependencies.add(Class.forName(edge.getSrc().method().getDeclaringClass().getName()));
//                } catch (ClassNotFoundException e) {
//                    log.info(String.format("Class not found: %s", edge.getSrc().method().getDeclaringClass().getName()));
//                }
//            });
//
//    return dependencies;
//}

  private String parseCallbackFunctions(String UIHierarchyXML) {
	  return "";
  }

  public void run() {	  
    Logger.stat("#Classes: " + Scene.v().getClasses().size() +
            ", #AppClasses: " + Scene.v().getApplicationClasses().size());
    Logger.trace("TIMECOST", "Start at " + System.currentTimeMillis());
    
//  Logger.stat("#Stmt: " + numStmt[0] + " (not correct)");
//  Debug2.v().printf("classes: %s", sb.toString());
    
    List<ClassUnit> allClassUnits = new ArrayList<ClassUnit>();
    
//    StringBuilder sb = new StringBuilder();
    for (SootClass c : Scene.v().getClasses()) {
//    sb.append(c.getName()+"\n");
      ClassUnit classUnit = null;
//      if(c.isApplicationClass()) {
//    	  Debug2.v().printf("application class: %s\n", c.getName());
//      }
//      if(c.isPhantomClass()) {
//    	  Debug2.v().printf("phantom class: %s\n", c.getName());
//      }
//      if(Configs.isLibraryClass(c.getName())) {
//    	  Debug2.v().printf("library class: %s\n", c.getName());
//      }
      
      if (Configs.isLibraryClass(c.getName()) || Configs.isGeneratedClass(c.getName()) || c.isPhantomClass()) {
//        if ((!c.isPhantomClass()) && c.isApplicationClass()) {
//          c.setLibraryClass();
//        }
    	 c.setLibraryClass();
    	 classUnit = new ClassUnit(c, false);
      }
      else {
    	 c.setApplicationClass();
    	 classUnit = new ClassUnit(c, true);
      }
      
      allClassUnits.add(classUnit);
    }
    
    List<CompositeClassUnit> compositeClassUnits = new ArrayList<CompositeClassUnit>();
    
    Map<String, ClassUnit> classUnitByUUID = new HashMap<String, ClassUnit>();
    Map<String, ClassUnit> classUnitByName = new HashMap<String, ClassUnit>();
    
    Map<String, CompositeClassUnit> compositeClassUnitByUUID = new HashMap<String, CompositeClassUnit>();
    Map<String, CompositeClassUnit> compositeClassUnitByName = new HashMap<String, CompositeClassUnit>();
    Map<String, String> classUnitToCompositeClassDic = new HashMap<String, String>();
    Map<String, MethodUnit> methodBySig = new HashMap<String, MethodUnit>();
    Map<String, String> methodToClass = new HashMap<String, String>();
    
//    List<ClassUnit> toIterate = new ArrayList<ClassUnit>(classUnits);
    List<ClassUnit> classUnits = new ArrayList<ClassUnit>();
    for(ClassUnit classUnit : allClassUnits) {
//    	ClassUnit classUnit = toIterate.remove(0);
    	if(!classUnit.isWithinBoundary) {
    		continue;
    	}

//		Debug1.v().println(classUnit.name);
		
		String className = classUnit.name;
		String compositeClassUnitName = getComponentName(className);
		
		CompositeClassUnit targetCompositeClassUnit = compositeClassUnitByName.get(compositeClassUnitName);
		
		if(targetCompositeClassUnit == null) {
			targetCompositeClassUnit = new CompositeClassUnit(compositeClassUnitName);
			compositeClassUnitByName.put(compositeClassUnitName, targetCompositeClassUnit);
			compositeClassUnitByUUID.put(targetCompositeClassUnit.uuid, targetCompositeClassUnit);
		}
		
		targetCompositeClassUnit.add(classUnit);
		
		classUnitToCompositeClassDic.put(classUnit.uuid, targetCompositeClassUnit.uuid);
		
        classUnitByName.put(classUnit.name, classUnit);
        classUnitByUUID.put(classUnit.uuid, classUnit);
    	classUnits.add(classUnit);
    	
    	List<MethodUnit> methodUnits = classUnit.getMethods();
    	
    	for(MethodUnit methodUnit : methodUnits) {
    		methodBySig.put(methodUnit.signature, methodUnit);
    		methodToClass.put(methodUnit.uuid, classUnit.uuid);
    	}
    }
    
    // output referenced classes
    String outputS = "{";
    outputS += "\"classUnits\":[";
	
  	for(int i = 0; i < classUnits.size(); i++) {
  		ClassUnit CU = classUnits.get(i);
  		outputS += CU.toJSONString();
  		if(i != classUnits.size() -1) {
  		outputS += ",";
  		}
  	}
  	
	outputS += "]";
	outputS += ", \"compositeClassUnits\":[";
    
	// output referenced composite classes
	int i = 0;
	for(String uuid: compositeClassUnitByUUID.keySet()) {
		CompositeClassUnit compCU = compositeClassUnitByUUID.get(uuid);
//		outputS += compCU.uuid;
		outputS += compCU.toJSONString();
		if(i != compositeClassUnitByUUID.keySet().size()-1) {
		outputS += ",";
		}
		i++;
	}
	outputS += "]";
	
//	//output methodBySig
//	outputS += ",methodBySig:[";
//	i = 0;
//	for(String methodSig: methodBySig.keySet()) {
//		String classUUID = methodBySig.get(methodSig);
////		outputS += compCU.uuid;
//		outputS += "{\""+methodSig+"\":"+"\""+classUUID+"\"}";
//		if(i != methodBySig.keySet().size()-1) {
//		outputS += ",";
//		}
//		i++;
//	}
//	outputS += "]";
	
	//output classUnitByUUID
	//output compositeClassUnitByUUID
	//output classUnitToCompositeClassDic

    for(String m : classUnitToCompositeClassDic.keySet()) {
    	Debug2.v().printf("class id: %s; composite id: %s\n", m, classUnitToCompositeClassDic.get(m));
//    	Debug1.v().printf("class id: %s; composite id: %s\n", m, classUnitToCompositeClassDic.get(m));
    }
    
    //create the hierarchy of the class units for the composite class units.
    
    // Analysis
    // TODO: use reflection to allow nice little extensions.
    
//    identifyAggregateClassUnits(xmiString);
    
    CallGraph callGraph = genCallGraph();
//	outputS += ",\"callGraph\":"+constructCallGraph(callGraph, classUnits, compositeClassUnits, methodBySig, methodToClass, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
	//	var typeDependencyGraph = constructTypeDependencyGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
//	outputS += ",\"accessGraph\":"+constructAccessGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
	outputS += ",\"callGraph\":"+constructCallGraph(callGraph, classUnits, compositeClassUnits, methodBySig, methodToClass, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
	//	var typeDependencyGraph = constructTypeDependencyGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
	outputS += ",\"accessGraph\":"+constructAccessGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
	//	var extendsGraph = constructExtendsGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
//	var compositionGraph = constructCompositionGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);

	outputS += "}";
	
    Debug4.v().printf("%s", outputS);
    
    String res = constructCompositionGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
    Debug2.v().printf(res);
  }
  
  
/*
 * Derive call graphs from source code.
 */
  
private CallGraph genCallGraph() {

	String apkPath = Configs.project;
//  String androidJarPath = Configs.sdkDir + "/platforms/" + Configs.apiLevel;
  	String androidJarPath = Configs.sdkDir + "/platforms/";
  
    File apkFile = new File(apkPath);
	String extension = apkFile.getName().substring(apkFile.getName().lastIndexOf("."));
	if (!extension.equals(".apk") || !apkFile.exists()){
		Debug1.v().println("apk-file not exists "+ apkFile.getName());
		return null;
	}

	File sdkFile = new File(androidJarPath);
	if (!sdkFile.exists()){
		Debug1.v().println("android-jar-directory not exists "+ sdkFile.getName());
		return null;			
	}
		
	Path curDir = Paths.get(System.getProperty("user.dir"));
	
	Path sourceSinkPath = Paths.get(curDir.toString(), "SourcesAndSinks.txt");
	File sourceSinkFile = sourceSinkPath.toFile();
	if (!sourceSinkFile.exists()){
		Debug1.v().println("SourcesAndSinks.txt not exists");
		return null;				
	}
	
	Path callbackPath = Paths.get(curDir.toString(), "AndroidCallbacks.txt");
	File callbackFile = callbackPath.toFile();
	if (!callbackFile.exists()){
		Debug1.v().println("AndroidCallbacks.txt not exists");
		return null;				
	}

	SetupApplication app = new SetupApplication(androidJarPath, apkPath);
	app.setOutputDir(Configs.outputDir);
	
//	Path curDir = Paths.get(System.getProperty("user.dir"));
	Path gatorFilePath = Paths.get(Configs.outputDir, Configs.benchmarkName + ".xml");
	File gatorFile = gatorFilePath.toFile();
	if(!gatorFile.exists()) {
		Debug1.v().println("Gator file doesn't exist...");
		return null;
	}
	
	app.setGatorFile(gatorFile.getAbsolutePath());
	
	Debug1.v().println("Setup Application...");
	Debug1.v().println("platforms: "+androidJarPath+" project: "+apkPath);
  
//  AndroidEntryPointCreator c = app.getEntryPointCreator();
//  SootMethod entryPoint = c.createDummyMain();
//  Options.v().set_main_class(entryPoint.getSignature());
//  Scene.v().setEntryPoints(Collections.singletonList(entryPoint));
  
//  Debug1.v().println(entryPoint.getActiveBody());
  
  	soot.G.reset();
  	Options.v().set_src_prec(Options.src_prec_apk);
	Options.v().set_process_dir(Collections.singletonList(apkPath));
	Options.v().set_android_jars(androidJarPath);
	Options.v().set_whole_program(true);
	Options.v().set_allow_phantom_refs(true);
	Options.v().set_output_format(Options.output_format_none);
	Options.v().setPhaseOption("cg.spark", "on");
	Scene.v().loadNecessaryClasses(); 
	
//	app.setCallbackFile("./AndroidCallbacks.txt");

	app.setCallbackFile(callbackPath.toAbsolutePath().toString());
	
	try {
		app.runInfoflow(sourceSinkPath.toAbsolutePath().toString());
	} catch (IOException e1) {
		// TODO Auto-generated catch block
		e1.printStackTrace();
	} catch (XmlPullParserException e1) {
		// TODO Auto-generated catch block
		e1.printStackTrace();
	}
	
	CallGraph callGraph = Scene.v().getCallGraph();
	
	String res = dumpCallGraph(callGraph);
	
	Debug5.v().printf("%s", res);
	
	return callGraph;
}

//output the call graph to JSON formate
private static String dumpCallGraph(CallGraph cg){
		Iterator<Edge> itr = cg.iterator();
		Map<String, Set<String>> map = new HashMap<String, Set<String>>();

		while(itr.hasNext()){
			Edge e = itr.next();
			String srcSig = e.getSrc().toString();
			String destSig = e.getTgt().toString();
			Set<String> neighborSet;
			if(map.containsKey(srcSig)){
				neighborSet = map.get(srcSig);
			}else{
				neighborSet = new HashSet<String>();
			}
			neighborSet.add(destSig);
			map.put(srcSig, neighborSet );
			
		}
		Gson gson = new GsonBuilder().disableHtmlEscaping().create();
		String json = gson.toJson(map);
		return json;
}

private String getComponentName(String classPath) {
	int pos = classPath.lastIndexOf(".");
	if(pos < 0) {
		return classPath;
	}
	String packageName = classPath.substring(0, pos);
	String className = classPath.substring(pos+1, classPath.length());
	int firstPos = -1;
	for(int i = 0; i < className.length(); i++) {
		if(className.charAt(i) == '$') {
			firstPos = i;
			break;
		}
	}
	
	if(firstPos == -1) {
		return packageName+"."+className;
	}
	else {
		return packageName+"."+className.substring(0, firstPos);
	}
}
  
}
