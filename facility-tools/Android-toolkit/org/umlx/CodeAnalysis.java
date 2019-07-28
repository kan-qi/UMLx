package org.umlx;

/*
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