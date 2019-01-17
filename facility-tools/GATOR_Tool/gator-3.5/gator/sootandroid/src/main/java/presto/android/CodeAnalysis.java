/*
 * AnalysisEntrypoint.java - part of the GATOR project
 *
 * Copyright (c) 2018 The Ohio State University
 *
 * This file is distributed under the terms described in LICENSE in the
 * root directory.
 */
package presto.android;

import soot.Body;
import soot.Scene;
import soot.SootClass;
import soot.SootMethod;
import soot.Type;
import soot.Unit;
import soot.Value;
import soot.ValueBox;
import soot.jimple.FieldRef;
import soot.jimple.InvokeExpr;
import soot.jimple.Stmt;
import soot.jimple.infoflow.android.SetupApplication;
import soot.jimple.internal.JAssignStmt;
import soot.jimple.toolkits.callgraph.CallGraph;
import soot.jimple.toolkits.callgraph.Edge;
import soot.options.Options;

import java.io.File;
import java.io.IOException;
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

import org.xmlpull.v1.XmlPullParserException;

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
  
  class MethodUnit{
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
	
	public String toJSONString() {
		StringBuilder str = new StringBuilder();
		str.append("{");
		str.append("\"name\":\""+name+"\",");
		str.append("\"uuid\":\""+uuid+"\",");
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
  
//  private static void visit(CallGraph cg, SootMethod method) {
//	  String identifier = method.getSignature();
//	  visited.put(method.getSignature(), true);
//	  dot.drawNode(identifier);
//	  // iterate over unvisited parents
//	  Iterator<MethodOrMethodContext> ptargets = new Targets(cg.edgesInto(method));
//	  if (ptargets != null) {
//	    while (ptargets.hasNext()) {
//	        SootMethod parent = (SootMethod) ptargets.next();
//	        if (!visited.containsKey(parent.getSignature())) visit(cg, parent);
//	    }
//	  }
//	    // iterate over unvisited children
//	    Iterator<MethodOrMethodContext> ctargets = new Targets(cg.edgesOutOf(method));
//	  if (ctargets != null) {
//	    while (ctargets.hasNext()) {
//	       SootMethod child = (SootMethod) ctargets.next();
//	       dot.drawEdge(identifier, child.getSignature());
//	       Debug1.v().println(method + " may call " + child);
//	       if (!visited.containsKey(child.getSignature())) visit(cg, child);
//	    }
//	  }
//	}
  
//output the call graph to JSON format
	private String constructCallGraph(CallGraph cg, List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, String> methodToClass, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic){
		Set<ClassUnit[]> edges = new HashSet<ClassUnit[]>();
		Set<CompositeClassUnit[]> compositeEdges = new HashSet<CompositeClassUnit[]>();
		
		Iterator<Edge> itr = cg.iterator();
//		Map<String, Set<String>> map = new HashMap<String, Set<String>>();

		while(itr.hasNext()){
			Edge e = itr.next();
			String srcSig = e.getSrc().toString();
			String destSig = e.getTgt().toString();
			
			String srcClassUUID = methodToClass.get(srcSig);
			String targetClassUUID = methodToClass.get(destSig);
			
			ClassUnit srcClass = classUnitByUUID.get(srcClassUUID);
			ClassUnit targetClass = classUnitByUUID.get(targetClassUUID);
			
			edges.add(new ClassUnit[] {srcClass, targetClass});
			
			String srcCompositeClassUUID = classUnitToCompositeClassDic.get(srcClassUUID);
			String targetCompositeClassUUID = classUnitToCompositeClassDic.get(targetClassUUID);
			
			CompositeClassUnit srcCompositeClass = compositeClassUnitByUUID.get(srcCompositeClassUUID);
			CompositeClassUnit targetCompositeClass = compositeClassUnitByUUID.get(targetCompositeClassUUID);
			
			compositeEdges.add(new CompositeClassUnit[] {srcCompositeClass, targetCompositeClass});
			
			
//			Set<String> neighborSet;
//			if(map.containsKey(srcSig)){
//				neighborSet = map.get(srcSig);
//			}else{
//				neighborSet = new HashSet<String>();
//			}
//			
//			neighborSet.add(destSig);
//			map.put(srcSig, neighborSet );
//			
		}
//		Gson gson = new GsonBuilder().disableHtmlEscaping().create();
//		String json = gson.toJson(map);
//		return json;
		
		return convertGraphsToJSON(edges, compositeEdges);
	}
  
  class ClassUnit{
	  public ClassUnit(SootClass sootClass, boolean isWithinBoundary) {
		// TODO Auto-generated constructor stub
		this.name = sootClass.getName();
		this.attachment = sootClass;
		this.uuid = UUID.randomUUID().toString();
		this.isWithinBoundary = isWithinBoundary;
	
		methodUnits = new ArrayList<MethodUnit>();
		for(SootMethod method: this.attachment.getMethods()) {
			methodUnits.add(new MethodUnit(method));
		}
	}
	  String uuid;
	  SootClass attachment;
	  boolean isWithinBoundary;
	  List<MethodUnit> methodUnits;
	  String name;
	  
	  public List<MethodUnit> getMethods(){	
		 return this.methodUnits;
	  }
	  
	  public String toJSONString() {
		  StringBuilder str = new StringBuilder();
		  str.append("{uuid:\""+ 
				  this.uuid+"\","+
				  "name:\""+
				  this.name+"\","+
				  "isWithinBoundary:\""+
				  this.isWithinBoundary+"\","+
				  "methodUnits:["
				  );
		  int i = 0;
		  for(MethodUnit methodUnit : methodUnits) {
			  str.append(methodUnit.toJSONString());
			  if(i != methodUnits.size() - 1) {
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
		  Json.append("{name: \""+name+"\",");
		  Json.append("uuid: \""+uuid+"\",");
		  Json.append("classUnits: [");
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
  
  
public String constructAccessGraph(List<ClassUnit> classUnits, List<CompositeClassUnit> compositeClassUnits, Map<String, ClassUnit> classUnitByName, Map<String, ClassUnit> classUnitByUUID, Map<String, CompositeClassUnit> compositeClassUnitByUUID, Map<String, String> classUnitToCompositeClassDic) {

	  	Set<ClassUnit[]> edges = new HashSet<ClassUnit[]>();

		Set<CompositeClassUnit[]> compositeEdges = new HashSet<CompositeClassUnit[]>(); // call relation
		
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
								referencedClassUnits.add(targetClassUnit);
					}

				
			  }
			}
			
			for(ClassUnit targetClassUnit : referencedClassUnits) {
				if(targetClassUnit == null) {
					continue;
				}
//				Debug1.v().printf("target class unit:%s\n", targetClassUnit.name);
				String targetCompositeClassUnitUUID = classUnitToCompositeClassDic.get(targetClassUnit.uuid);
				CompositeClassUnit targetCompositeClassUnit = compositeClassUnitByUUID.get(targetCompositeClassUnitUUID);
//				Debug1.v().printf("target composite class unit:%s\n", targetCompositeClassUnit.name);
				if(classUnit != targetClassUnit) {
				edges.add(new ClassUnit[] {classUnit, targetClassUnit});
				}
				
				if(compositeClassUnit != targetCompositeClassUnit) {
				compositeEdges.add(new CompositeClassUnit[]{compositeClassUnit, targetCompositeClassUnit});
				}
				
				}

		}
		
		return convertGraphsToJSON(edges, compositeEdges);
		
}


String convertGraphsToJSON(Set<ClassUnit[]> edges, Set<CompositeClassUnit[]> compositeEdges) {
	
	String outputS = "{compositeClassGraph:[";
		int i = 0;
		for(CompositeClassUnit[] compEdge: compositeEdges) {
			if(compEdge[0] == null || compEdge[1] == null) {
				continue;
			}
			outputS += "{start:\""+compEdge[0].uuid+"\",";
//			outputS += "->";
			outputS += "end:\""+compEdge[1].uuid+"\"}";
//			outputS += "\n";
			if(i != compositeEdges.size()-1) {
				outputS += ",";
			}
			i++;
		}
		outputS += "]";
		
		outputS += ",classGraph:[";
		
		i = 0;
		for(ClassUnit[] edge: edges) {
			if(edge[0] == null || edge[1] == null) {
				continue;
			}
			outputS += "{start:\""+edge[0].uuid+"\",";
//			outputS += "->";
			outputS += "end:\""+edge[1].uuid+"\"}";
//			outputS += "\n";
			if(i != edges.size()-1) {
				outputS += ",";
			}
			i++;
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
    		methodToClass.put(methodUnit.signature, classUnit.uuid);
    	}
    	
    }
    
    // output referenced classes
    String outputS = "{";
    outputS += "classUnits:[";
	
  	for(int i = 0; i < classUnits.size(); i++) {
  		ClassUnit CU = classUnits.get(i);
  		outputS += CU.toJSONString();
  		if(i != classUnits.size() -1) {
  		outputS += ",";
  		}
  	}
  	
	outputS += "]";
	outputS += ", compositeClassUnits:[";
    
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
	
//	//output methodToClass
//	outputS += ",methodToClass:[";
//	i = 0;
//	for(String methodSig: methodToClass.keySet()) {
//		String classUUID = methodToClass.get(methodSig);
////		outputS += compCU.uuid;
//		outputS += "{\""+methodSig+"\":"+"\""+classUUID+"\"}";
//		if(i != methodToClass.keySet().size()-1) {
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
	outputS += ",callGraph:"+constructCallGraph(callGraph, classUnits, compositeClassUnits, methodToClass, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
	//	var typeDependencyGraph = constructTypeDependencyGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
	outputS += ",accessGraph:"+constructAccessGraph(classUnits, compositeClassUnits, classUnitByName, classUnitByUUID, compositeClassUnitByUUID, classUnitToCompositeClassDic);
	//	var extendsGraph = constructExtendsGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
//	var compositionGraph = constructCompositionGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);

	outputS += "}";
	
    Debug4.v().printf("%s", outputS);
    
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
