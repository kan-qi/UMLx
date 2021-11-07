<<<<<<< HEAD
package org.umlx;/*
 * org.umlx.CodeAnalysis.java
 */

import org.umlx.writers.GraphsWriter;
import soot.Body;
import soot.Scene;
import soot.SootClass;
import soot.SootField;
import soot.SootMethod;
import soot.Type;
import soot.Unit;
import soot.jimple.FieldRef;
import soot.jimple.Stmt;
import soot.jimple.toolkits.callgraph.CallGraph;
import soot.jimple.toolkits.callgraph.Edge;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

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
		Set<CallGraphNode[]> edges = new HashSet<CallGraphNode[]>();

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


	void convertCallGraphToJSON(Set<CallGraphNode[]> edges) {

		GraphsWriter.v().writeGraph("callGraph", "{");
		GraphsWriter.v().writeGraph("callGraph",  "\"edges\":[");

		int i = 0;
		for(CallGraphNode[] edge: edges) {
			if(edge[0] == null || edge[1] == null) {
				continue;
			}
			i++;
			if(i != 1) {
				GraphsWriter.v().writeGraph("callGraph",  ",");
			}
			GraphsWriter.v().writeGraph("callGraph",  "{\"start\":{\"methodUnit\":\""+edge[0].methodUnit.uuid+"\",\"classUnit\":\""+edge[0].classUnit.uuid+"\"},");
			GraphsWriter.v().writeGraph("callGraph",  "\"end\":{\"methodUnit\":\""+edge[1].methodUnit.uuid+"\",\"classUnit\":\""+edge[1].classUnit.uuid+"\"}}");

		}
		GraphsWriter.v().writeGraph("callGraph",  "]}");

	}


	class ClassUnit{
		public ClassUnit(SootClass sootClass, boolean isWithinBoundary) {
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

		public List<AttrUnit> getAttributes() {
			return this.attrUnits;
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
			return this.classUnits.add(e);
		}

		@Override
		public boolean addAll(Collection<? extends ClassUnit> c) {
			return this.classUnits.addAll(c);
		}

		@Override
		public void clear() {
			this.classUnits.clear();

		}

		@Override
		public boolean contains(Object o) {
			return this.classUnits.contains(o);
		}

		@Override
		public boolean containsAll(Collection<?> c) {
			return this.classUnits.containsAll(c);
		}

		@Override
		public boolean isEmpty() {
			return this.classUnits.isEmpty();
		}

		@Override
		public Iterator<ClassUnit> iterator() {
			return this.classUnits.iterator();
		}

		@Override
		public boolean remove(Object o) {
			return this.classUnits.remove(0);
		}

		@Override
		public boolean removeAll(Collection<?> c) {
			return this.classUnits.removeAll(c);
		}

		@Override
		public boolean retainAll(Collection<?> c) {
			return this.classUnits.retainAll(c);
		}

		@Override
		public int size() {
			return this.classUnits.size();
		}

		@Override
		public Object[] toArray() {
			return this.classUnits.toArray();
		}

		@Override
		public <T> T[] toArray(T[] a) {
			return this.classUnits.toArray(a);
		}
	}


	private class AccessGraphNode {
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

		System.out.println("composition graph construct starts.");
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
		System.out.println("composition graph construct ends.");
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

		for (ClassUnit classUnit : classUnits) {

			String compositeClassUnitUUID = classUnitToCompositeClassDic.get(classUnit.uuid);
			CompositeClassUnit compositeClassUnit = compositeClassUnitByUUID.get(compositeClassUnitUUID);

			Set<ClassUnit> referencedClassUnits = new HashSet<ClassUnit>();

			List<MethodUnit> methodUnits = classUnit.getMethods();
			for (MethodUnit methodUnit : methodUnits) {
				//need to identify the methods within the boundary.

				DebugOutput.v().printf("method:%s", methodUnit.name);

				Body methodBlockUnit = null;

				try{
					methodBlockUnit = methodUnit.attachment.retrieveActiveBody();
				}catch(Exception e) {
					e.printStackTrace();
					continue;
				}

				DebugOutput.v().printf("active body:%s", methodUnit.name);

				AccessGraphNode srcAccessGraphNode = new AccessGraphNode(methodUnit, null, classUnit);
				ArrayList<AccessGraphNode> referencedAccessGraphNodes = new ArrayList<AccessGraphNode>();

				for (Unit u : methodBlockUnit.getUnits()) {
					Stmt s = (Stmt) u;
					if(s.containsFieldRef()) {
						FieldRef fieldRef = s.getFieldRef();
//				        org.umlx.DebugOutput.v().printf("field:%s\n", fieldRef.toString());
						SootClass targetClassUnitType = fieldRef.getFieldRef().declaringClass();

						ClassUnit targetClassUnit = classUnitByName.get(targetClassUnitType.getName());

						if(targetClassUnit == null) {
							continue;
						}

						AttrUnit attrUnit = new AttrUnit(fieldRef.getField().getName(), fieldRef.getField().getType().toString());

						AccessGraphNode targetAccessGraphNode = new AccessGraphNode(null, attrUnit, targetClassUnit);

						referencedAccessGraphNodes.add(targetAccessGraphNode);

					}
				}

				for(AccessGraphNode accessGraphNode : referencedAccessGraphNodes) {
					edges.add(new AccessGraphNode[] {srcAccessGraphNode, accessGraphNode});
				}

			}
		}

		System.out.println("construct of access graph finishes");

		convertAccessGraphToJSON(edges);

	}

	void convertAccessGraphToJSON(Set<AccessGraphNode[]> edges) {

		System.out.println("convert access graph starts.");

		GraphsWriter.v().writeGraph("accessGraph",  "{");

		GraphsWriter.v().writeGraph("accessGraph",  "\"edges\":[");

		int i = 0;
		for(AccessGraphNode[] edge: edges) {
			if(edge[0] == null || edge[1] == null) {
				continue;
			}
			i++;
			System.out.println("processing method: "+edge[0].methodUnit.uuid);

			if(i != 1) {
				GraphsWriter.v().writeGraph("accessGraph",  ",");
			}

			GraphsWriter.v().writeGraph("accessGraph",  "{\"start\":{\"methodUnit\":\""+edge[0].methodUnit.uuid+"\",\"classUnit\":\""+edge[0].classUnit.uuid+"\"},");

			GraphsWriter.v().writeGraph("accessGraph",  "\"end\":{\"attrUnit\":"+edge[1].attrUnit.toJSONString()+",\"classUnit\":\""+edge[1].classUnit.uuid+"\"}}");

		}
		GraphsWriter.v().writeGraph("accessGraph",  "]}");

		System.out.println("convert access graph finishes.");

	}

	public static class CodeAnalysisResult{
		Map<String, ClassUnit> classUnitByUUID;
		Map<String, ClassUnit> classUnitByName;
		Map<String, MethodUnit> methodBySig;
		Map<String, String> methodToClass;
		Map<SootMethod, String> methodUnitUUIDs;
		Map<SootClass, String> classUnitUUIDs;
	}

	public CodeAnalysisResult run() {
//		Logger.stat("#Classes: " + Scene.v().getClasses().size() +
//				", #AppClasses: " + Scene.v().getApplicationClasses().size());
//		Logger.trace("TIMECOST", "Start at " + System.currentTimeMillis());
//
//		Debug3.v().println(org.umlx.Configs.appPkg);

		List<ClassUnit> allClassUnits = new ArrayList<ClassUnit>();

		for (SootClass c : Scene.v().getClasses()) {
			ClassUnit classUnit = null;

//			if (Configs.isLibraryClass(c.getName()) || Configs.isGeneratedClass(c.getName()) || c.isPhantomClass()) {
//				c.setLibraryClass();
//				classUnit = new ClassUnit(c, false);
//			}
//			else {
//				c.setApplicationClass();
//				classUnit = new ClassUnit(c, true);
//			}

			if (!c.isApplicationClass()) {
//				c.setLibraryClass();
				classUnit = new ClassUnit(c, false);
			}
			else {
//				c.setApplicationClass();
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

		Map<SootClass, String> classUnitUUIDs = new HashMap<SootClass, String>();
		Map<SootMethod, String> methodUnitUUIDs = new HashMap<SootMethod, String>();

		List<ClassUnit> classUnits = new ArrayList<ClassUnit>();
		for(ClassUnit classUnit : allClassUnits) {
			if(!classUnit.isWithinBoundary) {
				continue;
			}

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
			classUnitUUIDs.put(classUnit.attachment, classUnit.uuid);

			classUnits.add(classUnit);

			List<MethodUnit> methodUnits = classUnit.getMethods();

			for(MethodUnit methodUnit : methodUnits) {
				methodBySig.put(methodUnit.signature, methodUnit);
				methodToClass.put(methodUnit.uuid, classUnit.uuid);
				methodUnitUUIDs.put(methodUnit.attachment, methodUnit.uuid);
			}
		}

		// output referenced classes
//    org.umlx.writers.GraphsWriter.v().writeGraph("nodes", "%s", outputS);
		GraphsWriter.v().writeGraph("android-analysis-output", "{\"classUnits\":[");

		for(int i = 0; i < classUnits.size(); i++) {
			ClassUnit CU = classUnits.get(i);
			GraphsWriter.v().writeGraph("android-analysis-output", CU.toJSONString());
			if(i != classUnits.size() -1) {
				GraphsWriter.v().writeGraph("android-analysis-output", ",");
			}
		}

		GraphsWriter.v().writeGraph("android-analysis-output", "]");
		GraphsWriter.v().writeGraph("android-analysis-output", ", \"compositeClassUnits\":[");

		// output referenced composite classes
		int i = 0;
		for(String uuid: compositeClassUnitByUUID.keySet()) {
			CompositeClassUnit compCU = compositeClassUnitByUUID.get(uuid);
			GraphsWriter.v().writeGraph("android-analysis-output", compCU.toJSONString());
			if(i != compositeClassUnitByUUID.keySet().size()-1) {
				GraphsWriter.v().writeGraph("android-analysis-output", ",");
			}
			i++;
		}
		GraphsWriter.v().writeGraph("android-analysis-output", "]");

		for(String m : classUnitToCompositeClassDic.keySet()) {
			DebugOutput.v().printf("class id: %s; composite id: %s\n", m, classUnitToCompositeClassDic.get(m));
		}

		CallGraph callGraph = Scene.v().getCallGraph();

//  outputS += ",\"typeDependencyGraph\":"+constructTypeDependencyGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
//	outputS += ",\"callGraph\":"+constructCallGraph(callGraph, classUnits, compositeClassUnits, methodBySig, methodToClass, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
//	outputS += ",\"accessGraph\":"+constructAccessGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
//	outputS += ",\"extendsGraph\":"+constructExtendsGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
//	outputS += ",\"compositionGraph\":"+constructCompositionGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
//
//	outputS += "}";

//    Debug4.v().printf("%s", outputS);

		constructTypeDependencyGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
		constructCallGraph(callGraph, classUnits, compositeClassUnits, methodBySig, methodToClass, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
		constructAccessGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
		constructExtendsGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
		constructCompositionGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
//
		GraphsWriter.v().writeGraph("android-analysis-output",",\"typeDependencyGraph\":\""+ Configs.outputDir+"/typedependencygraph.json\"");
		GraphsWriter.v().writeGraph("android-analysis-output",",\"callGraph\":\""+ Configs.outputDir+"/callgraph.json\"");
		GraphsWriter.v().writeGraph("android-analysis-output", ",\"accessGraph\":\""+ Configs.outputDir+"/accessgraph.json\"");
		GraphsWriter.v().writeGraph("android-analysis-output", ",\"extendsGraph\":\""+ Configs.outputDir+"/extendsgraph.json\"");
		GraphsWriter.v().writeGraph("android-analysis-output", ",\"compositionGraph\":\""+ Configs.outputDir+"/compositiongraph.json\"");
		GraphsWriter.v().writeGraph("android-analysis-output", ",\"cfg\":\""+ Configs.outputDir+"/soot-cfg-2.json\"");
		GraphsWriter.v().writeGraph("android-analysis-output", "}");

//	outputS += "}";


		CodeAnalysisResult result = new CodeAnalysisResult();
		result.classUnitByUUID = classUnitByUUID;
		result.classUnitByName = classUnitByName;
		result.methodBySig = methodBySig;
		result.methodToClass = methodToClass;
		result.methodUnitUUIDs = methodUnitUUIDs;
		result.classUnitUUIDs = classUnitUUIDs;

		return result;
	}

	/*
	 * Derive call graphs from source code.
	 */

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

=======
package org.umlx;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.umlx.graphs.AccessGraph;
import org.umlx.graphs.CallGraph;
import org.umlx.graphs.CompositionGraph;
import org.umlx.graphs.ExtendsGraph;
import org.umlx.graphs.TypeDependencyGraph;
import org.umlx.units.ClassUnit;
import org.umlx.units.CompositeClassUnit;
import org.umlx.units.MethodUnit;

/*
 * org.umlx.CodeAnalysis.java
 */

import org.umlx.writers.GraphsWriter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import soot.Scene;
import soot.SootClass;
import soot.SootMethod;
import soot.jimple.toolkits.callgraph.Edge;

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


	public static class CodeAnalysisResult{
		Map<String, ClassUnit> classUnitByUUID;
		Map<String, ClassUnit> classUnitByName;
		Map<String, MethodUnit> methodBySig;
		Map<String, String> methodToClass;
		Map<SootMethod, String> methodUnitUUIDs;
		Map<SootClass, String> classUnitUUIDs;
	}

	public CodeAnalysisResult run() {
//		Logger.stat("#Classes: " + Scene.v().getClasses().size() +
//				", #AppClasses: " + Scene.v().getApplicationClasses().size());
//		Logger.trace("TIMECOST", "Start at " + System.currentTimeMillis());
//
//		Debug3.v().println(org.umlx.Configs.appPkg);

		List<ClassUnit> allClassUnits = new ArrayList<ClassUnit>();

		for (SootClass c : Scene.v().getClasses()) {
			ClassUnit classUnit = null;

//			if (Configs.isLibraryClass(c.getName()) || Configs.isGeneratedClass(c.getName()) || c.isPhantomClass()) {
//				c.setLibraryClass();
//				classUnit = new ClassUnit(c, false);
//			}
//			else {
//				c.setApplicationClass();
//				classUnit = new ClassUnit(c, true);
//			}

			if (!c.isApplicationClass()) {
//				c.setLibraryClass();
				classUnit = new ClassUnit(c, false);
			}
			else {
//				c.setApplicationClass();
				classUnit = new ClassUnit(c, true);
			}


			if(c.isAbstract()){
				classUnit.setType("abstract");
			}
			else if(c.isInterface()){
				classUnit.setType("interface");
			}
			else {
				classUnit.setType("class");
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

		Map<SootClass, String> classUnitUUIDs = new HashMap<SootClass, String>();
		Map<SootMethod, String> methodUnitUUIDs = new HashMap<SootMethod, String>();

		List<ClassUnit> classUnits = new ArrayList<ClassUnit>();
		for(ClassUnit classUnit : allClassUnits) {
			if(!classUnit.isWithinBoundary()) {
				continue;
			}

			String className = classUnit.getName();
			String compositeClassUnitName = getComponentName(className);

			CompositeClassUnit targetCompositeClassUnit = compositeClassUnitByName.get(compositeClassUnitName);

			if(targetCompositeClassUnit == null) {
				targetCompositeClassUnit = new CompositeClassUnit(compositeClassUnitName);
				compositeClassUnitByName.put(compositeClassUnitName, targetCompositeClassUnit);
				compositeClassUnitByUUID.put(targetCompositeClassUnit.getUuid(), targetCompositeClassUnit);
			}

			targetCompositeClassUnit.add(classUnit);

			classUnitToCompositeClassDic.put(classUnit.getUuid(), targetCompositeClassUnit.getUuid());

			classUnitByName.put(classUnit.getName(), classUnit);
			classUnitByUUID.put(classUnit.getUuid(), classUnit);
			classUnitUUIDs.put(classUnit.getAttachment(), classUnit.getUuid());

			classUnits.add(classUnit);

			List<MethodUnit> methodUnits = classUnit.getMethods();

			for(MethodUnit methodUnit : methodUnits) {
				methodBySig.put(methodUnit.getSignature(), methodUnit);
				methodToClass.put(methodUnit.getUuid(), classUnit.getUuid());
				methodUnitUUIDs.put(methodUnit.getAttachment(), methodUnit.getUuid());
			}
		}

		// output referenced classes
//    org.umlx.writers.GraphsWriter.v().writeGraph("nodes", "%s", outputS);
		GraphsWriter.v().writeGraph("android-analysis-output", "{\"classUnits\":[");

		for(int i = 0; i < classUnits.size(); i++) {
			ClassUnit CU = classUnits.get(i);
			GraphsWriter.v().writeGraph("android-analysis-output", CU.toJSONString());
			if(i != classUnits.size() -1) {
				GraphsWriter.v().writeGraph("android-analysis-output", ",");
			}
		}

		GraphsWriter.v().writeGraph("android-analysis-output", "]");
		GraphsWriter.v().writeGraph("android-analysis-output", ", \"compositeClassUnits\":[");

		// output referenced composite classes
		int i = 0;
		for(String uuid: compositeClassUnitByUUID.keySet()) {
			CompositeClassUnit compCU = compositeClassUnitByUUID.get(uuid);
			GraphsWriter.v().writeGraph("android-analysis-output", compCU.toJSONString());
			if(i != compositeClassUnitByUUID.keySet().size()-1) {
				GraphsWriter.v().writeGraph("android-analysis-output", ",");
			}
			i++;
		}
		GraphsWriter.v().writeGraph("android-analysis-output", "]");

		for(String m : classUnitToCompositeClassDic.keySet()) {
			DebugOutput.v().printf("class id: %s; composite id: %s\n", m, classUnitToCompositeClassDic.get(m));
		}

		soot.jimple.toolkits.callgraph.CallGraph callGraph = Scene.v().getCallGraph();

//  outputS += ",\"typeDependencyGraph\":"+constructTypeDependencyGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
//	outputS += ",\"callGraph\":"+constructCallGraph(callGraph, classUnits, compositeClassUnits, methodBySig, methodToClass, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
//	outputS += ",\"accessGraph\":"+constructAccessGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
//	outputS += ",\"extendsGraph\":"+constructExtendsGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
//	outputS += ",\"compositionGraph\":"+constructCompositionGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
//
//	outputS += "}";

//    Debug4.v().printf("%s", outputS);

		TypeDependencyGraph.constructTypeDependencyGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
		CallGraph.constructCallGraph(callGraph, classUnits, compositeClassUnits, methodBySig, methodToClass, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
		AccessGraph.constructAccessGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
		ExtendsGraph.constructExtendsGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
		CompositionGraph.constructCompositionGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
//
		GraphsWriter.v().writeGraph("android-analysis-output",",\"typeDependencyGraph\":\""+ Configs.outputDir+"/typedependencygraph.json\"");
		GraphsWriter.v().writeGraph("android-analysis-output",",\"callGraph\":\""+ Configs.outputDir+"/callgraph.json\"");
		GraphsWriter.v().writeGraph("android-analysis-output", ",\"accessGraph\":\""+ Configs.outputDir+"/accessgraph.json\"");
		GraphsWriter.v().writeGraph("android-analysis-output", ",\"extendsGraph\":\""+ Configs.outputDir+"/extendsgraph.json\"");
		GraphsWriter.v().writeGraph("android-analysis-output", ",\"compositionGraph\":\""+ Configs.outputDir+"/compositiongraph.json\"");
		GraphsWriter.v().writeGraph("android-analysis-output", ",\"cfg\":\""+ Configs.outputDir+"/soot-cfg-2.json\"");
		GraphsWriter.v().writeGraph("android-analysis-output", "}");
		
		

//	outputS += "}";

		CodeAnalysisResult result = new CodeAnalysisResult();
		result.classUnitByUUID = classUnitByUUID;
		result.classUnitByName = classUnitByName;
		result.methodBySig = methodBySig;
		result.methodToClass = methodToClass;
		result.methodUnitUUIDs = methodUnitUUIDs;
		result.classUnitUUIDs = classUnitUUIDs;

		return result;
	}

	/*
	 * Derive call graphs from source code.
	 */

	//output the call graph to JSON formate
	private static String dumpCallGraph(soot.jimple.toolkits.callgraph.CallGraph cg){
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

>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8
}