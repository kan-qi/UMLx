import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.xmlpull.v1.XmlPullParserException;
import soot.*;
import soot.jimple.infoflow.android.Debug3;
import soot.jimple.infoflow.android.SetupApplication;
import soot.jimple.infoflow.android.callbacks.AbstractCallbackAnalyzer;
import soot.jimple.infoflow.android.callbacks.CallbackDefinition;
import soot.jimple.infoflow.android.callbacks.DefaultCallbackAnalyzer;
import soot.jimple.infoflow.android.callbacks.filters.AlienHostComponentFilter;
import soot.jimple.infoflow.android.callbacks.filters.ApplicationCallbackFilter;
import soot.jimple.infoflow.android.callbacks.filters.UnreachableConstructorFilter;
import soot.jimple.infoflow.android.entryPointCreators.AndroidEntryPointCreator;
import soot.jimple.infoflow.android.manifest.ProcessManifest;
import soot.jimple.toolkits.callgraph.CallGraph;
import soot.jimple.toolkits.callgraph.Edge;
import soot.options.Options;
import soot.toolkits.graph.DirectedGraph;
import soot.toolkits.graph.ExceptionalUnitGraph;
import soot.util.HashMultiMap;
import soot.util.MultiMap;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

//dump the call graph from FlowDroid
public class FlowDroidConnector {
    private static FlowDroidConnector theInstance;

    // time analysis begins
    private long startTime;

    private FlowDroidConnector() throws Exception {
        //set the parameters of FlowDroid.
    }

    private static class FlowDroidApp extends SetupApplication{

        public FlowDroidApp(String androidJar, String apkFileLocation) {
            super(androidJar, apkFileLocation);
//            this.parseAppResources();
//            this.createLayoutFileParser();
//            calculateCallbackMethods(lfp, entryPoint);
//
//            AbstractCallbackAnalyzer jimpleClass = callbackClasses == null
//                    ? new DefaultCallbackAnalyzer(config, entryPointClasses, callbackFile)
//                    : new DefaultCallbackAnalyzer(config, entryPointClasses, callbackClasses);
//            if (valueProvider != null)
//                jimpleClass.setValueProvider(valueProvider);
//            jimpleClass.addCallbackFilter(new AlienHostComponentFilter(entrypoints));
//            jimpleClass.addCallbackFilter(new ApplicationCallbackFilter(entrypoints));
//            jimpleClass.addCallbackFilter(new UnreachableConstructorFilter());
//            jimpleClass.collectCallbackMethods();


        }

        public MultiMap<SootClass, CallbackDefinition> getCallbackMethods(){
            return this.callbackMethods;
        }
    }

//    public MultiMap<SootClass, SootMethod> run(){
//        MultiMap<SootClass, SootMethod> handlers = new HashMultiMap<SootClass, SootMethod>();
////		String Configs.project = Configs.project;
////		String Configs.sdkDir = Configs.sdkDir + "/platforms/";
//
//		File apkFile = new File(Configs.project);
//		String extension = apkFile.getName().substring(apkFile.getName().lastIndexOf("."));
//		if (!extension.equals(".apk") || !apkFile.exists()){
//			DebugOutput.v().println("apk-file not exists "+ apkFile.getName());
//			return null;
//		}
//
//		File sdkFile = new File(Configs.sdkDir);
//		if (!sdkFile.exists()){
//			DebugOutput.v().println("android-jar-directory not exists "+ sdkFile.getName());
//			return null;
//		}
//
//		Path curDir = Paths.get(System.getenv("GatorRoot"));
//
//		Path sourceSinkPath = Paths.get(curDir.toString(), "SourcesAndSinks.txt");
//		File sourceSinkFile = sourceSinkPath.toFile();
//		if (!sourceSinkFile.exists()){
//			DebugOutput.v().println("SourcesAndSinks.txt not exists");
//			return null;
//		}
//
//		Path callbackPath = Paths.get(curDir.toString(), "AndroidCallbacks.txt");
//		File callbackFile = callbackPath.toFile();
//		if (!callbackFile.exists()){
//			DebugOutput.v().println("AndroidCallbacks.txt not exists");
//			return null;
//		}
//
//		FlowDroidApp app = new FlowDroidApp(Configs.sdkDir, Configs.project);
//
//
//		app.setOutputDir(Configs.outputDir);
//
////		Path gatorFilePath = Paths.get(Configs.outputDir, Configs.benchmarkName + ".xml");
////		File gatorFile = gatorFilePath.toFile();
////		if(!gatorFile.exists()) {
////			DebugOutput.v().println("Gator file doesn't exist...");
//////		return null;
////		}
////		else {
////			app.setGatorFile(gatorFile.getAbsolutePath());
////		}
//
//
//		DebugOutput.v().println("Setup Application...");
//		DebugOutput.v().println("platforms: "+Configs.sdkDir+" project: "+Configs.project);
//
//		soot.G.reset();
//		Options.v().set_src_prec(Options.src_prec_apk);
//		Options.v().set_process_dir(Collections.singletonList(Configs.project));
//		Options.v().set_android_jars(Configs.sdkDir);
//		Options.v().set_whole_program(true);
//		Options.v().set_allow_phantom_refs(true);
//		Options.v().set_output_format(Options.output_format_none);
//		Options.v().setPhaseOption("cg.spark", "on");
//		Scene.v().loadNecessaryClasses();
//
//		app.setCallbackFile(callbackPath.toAbsolutePath().toString());
//
//		try {
//			app.runInfoflow(sourceSinkPath.toAbsolutePath().toString());
//		} catch (IOException e1) {
//			e1.printStackTrace();
//		} catch (XmlPullParserException e1) {
//			e1.printStackTrace();
//		}
//
//
//        MultiMap<SootClass, CallbackDefinition> callbacks = app.getCallbackMethods();
//
//
//
////		CallGraph callGraph = Scene.v().getCallGraph();
//
//		//String res = dumpCallGraph(callGraph);
//
//		//Debug5.v().printf("%s", res);
//
////		return callGraph;
//
//        DebugOutput.v().println("profile call back method gator");
//        for (SootClass callbackClass : callbacks.keySet()) {
//            DebugOutput.v().println("callbackClass:" + callbackClass.getName());
//            Set<CallbackDefinition> callbackDefinitions = callbacks.get(callbackClass);
////            Set<SootMethod> handlerMtds = handlers.get(callbackClass);
////            if(handlerMtds == null){
////                handlerMtds = new HashSet<SootMethod>();
////                handlers.put(callbackClass, handlerMtds);
////            }
//
//            for (CallbackDefinition callbackDef : callbackDefinitions) {
////                DebugOutput.v().println(callbackDef.profile());
////                handlerMtds.add(callbackDef.getTargetMethod().getName());
//                handlers.put(callbackClass, callbackDef.getTargetMethod());
//            }
//        }
//        return handlers;
//	}


    public MultiMap<String, String> run(){

        MultiMap<SootClass, SootMethod> handlers = new HashMultiMap<SootClass, SootMethod>();
        JSONParser parser = new JSONParser();

        try {

            Object obj = parser.parse(new FileReader("./output/flowdroid-callbacks.json"));
            JSONObject jsonObject = (JSONObject) obj;

            System.out.println("callbacks:");

            for(Object key: jsonObject.keySet()){
                String keyStr = (String)key;
                System.out.println(keyStr);
                SootClass c = Scene.v().loadClass(keyStr, SootClass.BODIES);
                c.setApplicationClass();
//        Options.v().set_main_class("de.danoeh.antennapod.activity.StorageErrorActivity");
                components.add(c);
                JSONArray keyvalue = (JSONArray)jsonObject.get(keyStr);
                for(Object val : keyvalue.toArray()){
                    String mtd = (String)val;
                    System.out.println("  "+mtd);
                    SootMethod entryPoint1 = c.getMethodByName(mtd);
                    callbackMethodSigs.put(c, entryPoint1);
                }

            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return handlers;
    }

    //output the call graph to JSON formate
    private static void dumpCallbackDefs(MultiMap<SootClass, CallbackDefinition> callbacks){
        Map<String, Set<String>> map = new HashMap<String, Set<String>>();

        for (SootClass callbackClass : callbacks.keySet()) {
            Set<CallbackDefinition> callbackDefinitions = callbacks.get(callbackClass);
            Set<String> calledMtds = new HashSet<String>();
            for (CallbackDefinition callbackDef : callbackDefinitions) {
                if(callbackClass == callbackDef.getTargetMethod().getDeclaringClass()) {
                        calledMtds.add(callbackDef.getTargetMethod().getName());
                }
            }
            map.put(callbackClass.getName(), calledMtds);
        }

        Gson gson = new GsonBuilder().disableHtmlEscaping().create();
        String json = gson.toJson(map);
//        return json;
        CallbackWriter.v().print(json);
    }

    public static synchronized FlowDroidConnector v() {
        if (theInstance == null) {
            try {
                theInstance = new FlowDroidConnector();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return theInstance;
    }


    public static void main(String[] args){
        Configs.project = args[0];
        Configs.sdkDir = args[1];
        File apkFile = new File(Configs.project);
        String extension = apkFile.getName().substring(apkFile.getName().lastIndexOf("."));
        if (!extension.equals(".apk") || !apkFile.exists()){
            DebugOutput.v().println("apk-file not exists "+ apkFile.getName());
            return;
        }

        File sdkFile = new File(Configs.sdkDir);
        if (!sdkFile.exists()){
            DebugOutput.v().println("android-jar-directory not exists "+ sdkFile.getName());
            return;
        }

        Path curDir = Paths.get(System.getenv("GatorRoot"));

        Path sourceSinkPath = Paths.get(curDir.toString(), "SourcesAndSinks.txt");
        File sourceSinkFile = sourceSinkPath.toFile();
        if (!sourceSinkFile.exists()){
            DebugOutput.v().println("SourcesAndSinks.txt not exists");
            return;
        }

        Path callbackPath = Paths.get(curDir.toString(), "AndroidCallbacks.txt");
        File callbackFile = callbackPath.toFile();
        if (!callbackFile.exists()){
            DebugOutput.v().println("AndroidCallbacks.txt not exists");
            return;
        }

        FlowDroidApp app = new FlowDroidApp(Configs.sdkDir, Configs.project);
        app.setOutputDir(Configs.outputDir);

        Path gatorFilePath = Paths.get(Configs.outputDir, Configs.benchmarkName + ".xml");
        File gatorFile = gatorFilePath.toFile();
        if(!gatorFile.exists()) {
            DebugOutput.v().println("Gator file doesn't exist...");
//		return null;
        }
        else {
            app.setGatorFile(gatorFile.getAbsolutePath());
        }


        DebugOutput.v().println("Setup Application...");
        DebugOutput.v().println("platforms: "+Configs.sdkDir+" project: "+Configs.project);

        soot.G.reset();
        Options.v().set_src_prec(Options.src_prec_apk);
        Options.v().set_process_dir(Collections.singletonList(Configs.project));
        Options.v().set_android_jars(Configs.sdkDir);
        Options.v().set_whole_program(true);
        Options.v().set_allow_phantom_refs(true);
        Options.v().set_output_format(Options.output_format_none);
        Options.v().setPhaseOption("cg.spark", "on");
        Options.v().set_process_multiple_dex(true);
        Scene.v().loadNecessaryClasses();

        app.setCallbackFile(callbackPath.toAbsolutePath().toString());

        try {
            app.runInfoflow(sourceSinkPath.toAbsolutePath().toString());
        } catch (IOException e1) {
            e1.printStackTrace();
        } catch (XmlPullParserException e1) {
            e1.printStackTrace();
        }

//        CallGraph callGraph = Scene.v().getCallGraph();

        //String res = dumpCallGraph(callGraph);

        //Debug5.v().printf("%s", res);

        MultiMap<SootClass, CallbackDefinition> callbacks = app.getCallbackMethods();



//		CallGraph callGraph = Scene.v().getCallGraph();

        //String res = dumpCallGraph(callGraph);

        //Debug5.v().printf("%s", res);

//		return callGraph;

//        DebugOutput.v().println("profile call back method gator");
//        for (SootClass callbackClass : callbacks.keySet()) {
//            DebugOutput.v().println("callbackClass:" + callbackClass.getName());
//            Set<CallbackDefinition> callbackDefinitions = callbacks.get(callbackClass);
////            Set<SootMethod> handlerMtds = handlers.get(callbackClass);
////            if(handlerMtds == null){
////                handlerMtds = new HashSet<SootMethod>();
////                handlers.put(callbackClass, handlerMtds);
////            }
//
//            for (CallbackDefinition callbackDef : callbackDefinitions) {
////                DebugOutput.v().println(callbackDef.profile());
////                handlerMtds.add(callbackDef.getTargetMethod().getName());
////                DebugOutput.v().println("  callbackmethod1:" + callbackDef.getTargetMethod().getName());
//                if(callbackClass == callbackDef.getTargetMethod().getDeclaringClass()) {
////                    handlers.put(callbackClass, callbackDef.getTargetMethod());
//                    DebugOutput.v().println("  callbackmethod:" + callbackDef.getParentMethod().getName());
//                }
//            }
//        }

        dumpCallbackDefs(callbacks);
    }



}


