package org.umlx.graphs;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.umlx.units.ClassUnit;
import org.umlx.units.CompositeClassUnit;
import org.umlx.units.MethodUnit;
import org.umlx.writers.GraphsWriter;

import soot.Body;
import soot.SootClass;
import soot.Unit;
import soot.jimple.FieldRef;
import soot.jimple.Stmt;

public class TypeDependencyGraph {

	public static void constructTypeDependencyGraph(List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic) {
		HashMap mappings = new HashMap<String, TypeDependencyGraphNode>();

		for (ClassUnit classUnit : classUnits) {
			// Create a TypeDependencyGraphNode for the class if it doesn't exist yet
			if (!mappings.containsKey(classUnit.getName())) {
				TypeDependencyGraphNode classNode = new TypeDependencyGraphNode(classUnit);
				mappings.put(classUnit.getName(), classNode);
			}


			TypeDependencyGraphNode currentClassNode = (TypeDependencyGraphNode) mappings.get(classUnit.getName());


			// Loop through methods of the class
			List<MethodUnit> methods = classUnit.getMethods();
			for (MethodUnit method : methods) {
				// Document the method return type
				String returnTypeName = method.getReturnType();
				if (classUnitByName.containsKey(returnTypeName)) {
					ClassUnit returnType = (ClassUnit) classUnitByName.get(returnTypeName);
					if (!mappings.containsKey(returnTypeName)) {
						TypeDependencyGraphNode node = new TypeDependencyGraphNode(returnType);
						mappings.put(returnTypeName, node);
					}

					// Add the method return type dependency
					TypeDependencyGraphNode returnTypeNode = (TypeDependencyGraphNode) mappings.get(returnTypeName);
					currentClassNode.addReturnTypeDependency(returnTypeNode, method.getName());

					// Loop through parameter types of the method
					List<String> parameterTypes = method.getParameterTypes();
					for (String parameterTypeName : parameterTypes) {
						if (classUnitByName.containsKey(parameterTypeName)) {
							ClassUnit parameterType = (ClassUnit) classUnitByName.get(parameterTypeName);
							if (!mappings.containsKey(parameterTypeName)) {
								TypeDependencyGraphNode node = new TypeDependencyGraphNode(parameterType);
								mappings.put(parameterTypeName, node);
							}

							// Add the method parameter type dependency
							TypeDependencyGraphNode parameterTypeNode = (TypeDependencyGraphNode) mappings.get(parameterTypeName);
							currentClassNode.addParameterTypeDependency(returnTypeNode, method.getName());
						}
					}

					// Loop through method code lines to find local variables
					Body methodBlockUnit = null;

					try {
						methodBlockUnit = method.getAttachment().retrieveActiveBody();
					} catch (Exception e) {
						e.printStackTrace();
						continue;
					}

					for (Unit u : methodBlockUnit.getUnits()) {
						Stmt s = (Stmt) u;
						if (s.containsFieldRef()) {
							FieldRef fieldRef = s.getFieldRef();
							SootClass targetClassUnitType = fieldRef.getFieldRef().declaringClass();
							ClassUnit targetClassUnit = classUnitByName.get(targetClassUnitType.getName());
							if (targetClassUnit == null) {
								continue;
							}

							if (classUnitByName.containsKey(targetClassUnit.getName())) {
								ClassUnit targetClassType = (ClassUnit) classUnitByName.get(targetClassUnit.getName());
								if (!mappings.containsKey(targetClassUnit.getName())) {
									TypeDependencyGraphNode node = new TypeDependencyGraphNode(targetClassType);
									mappings.put(targetClassUnit.getName(), node);
								}

								// Add the local variable dependency
								TypeDependencyGraphNode localVarNode = (TypeDependencyGraphNode) mappings.get(targetClassUnit.getName());
								currentClassNode.addLocalVariableTypeDependency(localVarNode, method.getName());
							}
						}
					}
				}
			}
		}

		convertTypeDependencyGraphToJSON(mappings);
	}

	static void convertTypeDependencyGraphToJSON(HashMap<String, TypeDependencyGraphNode> typeDepGraph) {
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
				for (Map.Entry<String, Integer> paramDep : dependency.parameterDependencies.entrySet()) {
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
				for (Map.Entry<String, Integer> localVarDep : dependency.localVarDependencies.entrySet()) {
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
}


class TypeDependencyGraphNode {
	String className;
	String uuid;
	Map<String, String> methods;
	Map<String, TypeDependencyUnit> typeDependencies;    // Other classes that this class has relationships with

	public TypeDependencyGraphNode(ClassUnit classUnit) {
		this.className = classUnit.getName();
		this.uuid = classUnit.getUuid();
		this.methods = new HashMap<String, String>();
		this.typeDependencies = new HashMap<String, TypeDependencyUnit>();

		for (MethodUnit method : classUnit.getMethods()) {
			this.methods.put(method.getName(), method.getUuid());
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

		return (TypeDependencyUnit) this.typeDependencies.get(typeDependency.className);
	}
}


class TypeDependencyUnit {
	TypeDependencyGraphNode typeDependency;    // The class that the parent node has a dependency on
	List<String> returnDependencies;    // Keep track of the method names returning this type
	Map<String, Integer> parameterDependencies;    // Keep track of method names and how many parameters
	Map<String, Integer> localVarDependencies;    // Keep track of method names and how many within it

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
