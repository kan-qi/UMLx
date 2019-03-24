import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.xmlpull.v1.XmlPullParserException;
import soot.*;
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
import java.io.IOException;
import java.util.*;

//dump the call graph from FlowDroid
public class UMLxAndroidToolKit {
    public UMLxAndroidToolKit(){}

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
//            if(e.getSrc().method().getDeclaringClass().toString().contains("de.danoeh.antennapod")) {
                map.put(srcSig, neighborSet);
//            }
        }
        Gson gson = new GsonBuilder().disableHtmlEscaping().create();
        String json = gson.toJson(map);
        return json;
    }

    private static void printUsage(){
        System.out.println("Incorrect arguments: [0] = apk-file, [1] = android-jar-directory");
    }

    public static void main(String[] args){

//        java -cp "out/production/Android-toolkit;libs/*" UMLxAndroidToolKit "f:/D/AndroidAnalysis/APKs/AntennaPod_3_18.apk" "f:/D/Andr
//        oid_SDK/platforms" "./"

//        java -cp "out/production/Android-toolkit;libs/*" UMLxAndroidToolKit "/mnt/f/D/AndroidAnalysis/APKs/AntennaPod_3_18.apk" "/mnt/f/D/Android_SDK/platforms" "./"

//        if (args.length < 2){
//            printUsage();
//            return;
//        }

//        String apkPath = args[0];
//        String androidJarPath = args[1];


//        Configs.project = "f:/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk";

//        Configs.project = "f:/D/AndroidAnalysis/APKs/AntennaPod_3_18.apk";
//        Configs.project = "/mnt/f/D/AndroidAnalysis/APKs/AntennaPod_3_18.apk";

        Configs.project = "/mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk";

//            /mnt/f/D/Android_SDK/platforms/android-25/android.jar
//        Configs.sdkDir = "f:/D/Android_SDK/platforms";
        Configs.sdkDir = "/mnt/f/D/Android_SDK/platforms";

        Configs.outputDir = "/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/Android-toolkit/output";

//        String apkPath = Configs.project;
//        String androidJarPath = Configs.sdkDir + "/platforms/";

        try {
            manifest = new ProcessManifest(Configs.project);
        } catch (IOException e) {
            e.printStackTrace();
        } catch (XmlPullParserException e) {
            e.printStackTrace();
        }

        if(manifest == null){
            System.out.println("issues with parsing sdk");
            return;
        }

        Configs.sdkVer = manifest.targetSdkVersion();

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

//        Path curDir = Paths.get(System.getenv("GatorRoot"));
//
//        Path sourceSinkPath = Paths.get(curDir.toString(), "SourcesAndSinks.txt");
//        File sourceSinkFile = sourceSinkPath.toFile();
//        if (!sourceSinkFile.exists()){
//            DebugOutput.v().println("SourcesAndSinks.txt not exists");
//            return;
//        }

//        Path callbackPath = Paths.get(curDir.toString(), "AndroidCallbacks.txt");
//        File callbackFile = callbackPath.toFile();
//        if (!callbackFile.exists()) {
//            DebugOutput.v().println("AndroidCallbacks.txt not exists");
//            return;
//        }

        DebugOutput.v().println("Setup Application...");
        DebugOutput.v().println("platforms: "+Configs.sdkDir+" project: "+Configs.project);

        MultiMap<String, String> flowDroidCallbacks = FlowDroidConnector.v().run(Configs.project, Configs.sdkDir, Configs.outputDir);
        MultiMap<String, String> gatorCallbacks = GatorConnector.v().run(Configs.project, Configs.sdkDir, Configs.outputDir, Configs.sdkVer);
//
//        System.exit(0);

//      Scene.v().releaseCallGraph();
//      Scene.v().releasePointsToAnalysis();
//      Scene.v().releaseReachableMethods();
//      G.v().resetSpark();
        soot.G.reset();
        Options.v().set_src_prec(Options.src_prec_apk);
        Options.v().set_process_dir(Collections.singletonList(Configs.project));
        Options.v().set_android_jars(Configs.sdkDir);
        Options.v().set_whole_program(true);
        Options.v().set_allow_phantom_refs(true);
        Options.v().set_output_format(Options.output_format_none);
        Options.v().set_process_multiple_dex(true);
//      Options.v().setPhaseOption("cg.spark", "on");
        Scene.v().loadNecessaryClasses();

        // Enable whole-program mode
//      Options.v().set_whole_program(true);
        Options.v().set_app(true);

        //enable whole program mode

        // Call-graph options
//        Options.v().setPhaseOption("cg", "safe-newinstance:true");
//        Options.v().setPhaseOption("cg.cha","enabled:true");

        // Enable SPARK call-graph construction
//        Options.v().setPhaseOption("cg.spark","enabled:true");
//        Options.v().setPhaseOption("cg.spark","verbose:true");
//        Options.v().setPhaseOption("cg.spark","on-fly-cg:true");

        Options.v().set_allow_phantom_refs(true);

        // Set the main class of the application to be analysed
//        Options.v().set_main_class("org.anothermonitor.ActivityMain");
//
//        for(String cls: flowDroidCallbacks.keySet()){
//            Set<String> callbackMtds = gatorCallbacks.get(cls);
//                if(callbackMtds == null){
//                    callbackMtds = new HashSet<String>();
//                    gatorCallbacks.put(cls, callbackMtds);
//                }
//
//                callbackMtds.addAll(flowDroidCallbacks.get(cls));
//        }



        //identify the callbacks using gator and flowdroid-android and converge their results.
//        Map<String, Set<String>> gatorCallbacks = GatorConnector.v().run();

        // Load the main class
//        SootClass c = Scene.v().loadClass("org.anothermonitor.ActivityMain", SootClass.BODIES);


//        System.out.println("hello2");
//        System.out.println(c.getName());
//        for (SootMethod method : c.getMethods()) {
////      methodUnits.add(new CodeAnalysis.MethodUnit(method));
//            System.out.println(method.getName());
//        }

        // Load the "main" method of the main class and set it as a Soot entry point
//        SootMethod entryPoint = c.getMethodByName("getWebsiteLinkWithFallback");
//        SootMethod entryPoint = c.getMethodByName("showSkipPreference");

//        Boolean set = true;
//        List<SootMethod> entryPoints = new ArrayList<SootMethod>();
//        for(SootClass component : callbackMethodSigs.keySet()){
////            component.setApplicationClass();
////            Options.v().set_main_class(component.getName());
//            SootClass c = Scene.v().loadClass(component.getName(), SootClass.BODIES);
//            c.setApplicationClass();
//            components.add(c);
//            for(SootMethod mtd : callbackMethodSigs.get(component)){
////                SootMethod entryPoint = c.getMethodByName("onCreate");
////                entryPoints.add(c.getMethodByName(mtd.getName()));
//                System.out.println(component.getName());
//                System.out.println(mtd.getName());
////                set = true;
////                break;
//
//                callbackMethodSigs.put(c, mtd);
//            }
//
////            if(set){
////                break;
////            }
//        }

//        Scene.v().setEntryPoints(entryPoints);

//        System.out.println("iterate...");
//        DebugOutput.v().println("iterate...");
//        for(SootClass c : flowDroidCallbacks.keySet()){
//            DebugOutput.v().println(c.getName());
//            SootClass component = Scene.v().loadClass(c.getName(), SootClass.BODIES);
//            c.setApplicationClass();
//            components.add(component);
////            callbackMethodSigs.putAll(c, flowDroidCallbacks.get(c));
//            System.out.println(c.getName());
//            DebugOutput.v().println("c: "+c.getName());
//            for(SootMethod mtd : flowDroidCallbacks.get(c)){
////                System.out.println(mtd.getName());
//                SootMethod m = component.getMethodByName(mtd.getName());
//                callbackMethodSigs.put(component, m);
//
//                DebugOutput.v().println("       m: "+m.getName());
//            }
//        }
//
//        createMainMethod();
//
//        System.exit(0);

//        SootClass c = Scene.v().loadClass("de.danoeh.antennapod.activity.MediaplayerActivity", SootClass.BODIES);
//        c.setApplicationClass();
//        Options.v().set_main_class("de.danoeh.antennapod.activity.MediaplayerActivity");
//        SootMethod entryPoint = c.getMethodByName("onCreate");

//        SootClass c = Scene.v().loadClass("de.danoeh.antennapod.activity.StorageErrorActivity", SootClass.BODIES);
//        c.setApplicationClass();
//        Options.v().set_main_class("de.danoeh.antennapod.activity.StorageErrorActivity");
//        SootMethod entryPoint1 = c.getMethodByName("onResume");
//        SootMethod entryPoint2 = c.getMethodByName("onPause");
//        SootMethod entryPoint3 = c.getMethodByName("onRequestPermissionsResult");
//        SootMethod entryPoint4 = c.getMethodByName("onCreate");
//        SootMethod entryPoint5 = c.getMethodByName("onActivityResult");
//        List<SootMethod> entryPoints = new ArrayList<SootMethod>();
//        entryPoints.add(entryPoint1);
//        entryPoints.add(entryPoint2);
//        entryPoints.add(entryPoint3);
//        entryPoints.add(entryPoint4);
//        entryPoints.add(entryPoint5);
////        entryPoints.add(entryPoint);
//        Scene.v().setEntryPoints(entryPoints);


//        SootClass c = Scene.v().loadClass("de.danoeh.antennapod.activity.MediaplayerActivity", SootClass.BODIES);
//        c.setApplicationClass();
//        Options.v().set_main_class("de.danoeh.antennapod.activity.MediaplayerActivity");
//        SootMethod entryPoint = c.getMethodByName("onCreate");

//        SootClass c = Scene.v().loadClass("de.danoeh.antennapod.activity.StorageErrorActivity", SootClass.BODIES);
//        c.setApplicationClass();
////        Options.v().set_main_class("de.danoeh.antennapod.activity.StorageErrorActivity");
//        components.add(c);
//        SootMethod entryPoint1 = c.getMethodByName("onResume");
//        SootMethod entryPoint2 = c.getMethodByName("onPause");
//        SootMethod entryPoint3 = c.getMethodByName("onRequestPermissionsResult");
//        SootMethod entryPoint4 = c.getMethodByName("onCreate");
//        SootMethod entryPoint5 = c.getMethodByName("onActivityResult");
//        callbackMethodSigs.put(c, entryPoint1);
//        callbackMethodSigs.put(c, entryPoint2);
//        callbackMethodSigs.put(c, entryPoint3);
//        callbackMethodSigs.put(c, entryPoint4);
//        callbackMethodSigs.put(c, entryPoint5);

            System.out.println("callbacks:");
//
//            for(String cls: flowDroidCallbacks.keySet()){
//                SootClass c = Scene.v().loadClass(cls, SootClass.BODIES);
//                c.setApplicationClass();
////        Options.v().set_main_class("de.danoeh.antennapod.activity.StorageErrorActivity");
//                components.add(c);
//                for(String mtd : flowDroidCallbacks.get(cls)){
//                    SootMethod entryPoint = c.getMethodByName(mtd);
//                    callbackMethodSigs.put(c, entryPoint);
//                }
//            }

        for(String cls: gatorCallbacks.keySet()){
            SootClass c = Scene.v().loadClass(cls, SootClass.BODIES);
            c.setApplicationClass();
//        Options.v().set_main_class("de.danoeh.antennapod.activity.StorageErrorActivity");
            components.add(c);
            for(String mtd : gatorCallbacks.get(cls)){
//                SootMethod entryPoint = c.getMethodByName(mtd);
                SootMethod entryPoint = c.getMethod(mtd);
                callbackMethodSigs.put(c, entryPoint);
                System.out.println(entryPoint.getName());
            }
        }

//        System.exit(0);
        createMainMethod();

        DebugOutput.v().println("classes and methods:");
        for (SootClass cs : Scene.v().getClasses()) {
            ClassWriter.v().println(cs.getName());
            DebugOutput.v().println("classes: "+cs.getName());
            if (cs.getName().startsWith("de.danoeh.antennapod")) {
                cs.setLibraryClass();
            } else {
                cs.setApplicationClass();
            }

//            if (Configs.isLibraryClass(c.getName()) || Configs.isGeneratedClass(c.getName()) || c.isPhantomClass()) {
//                c.setLibraryClass();
//                classUnit = new CodeAnalysis.ClassUnit(c, false);
//            }
//            else {
//                c.setApplicationClass();
//                classUnit = new CodeAnalysis.ClassUnit(c, true);
//            }

//
//            if(c.getName().equals("de.danoeh.antennapod.PodcastApp")) {
//                components.add(c);
                for (SootMethod mtd : cs.getMethods()) {
//                    if (mtd.equals("onCreate")) {
//                        callbackMethodSigs.put(c, mtd);
//                    }

                    DebugOutput.v().println("       methods:"+mtd.getName());
                }
//            }
//
//            if(c.getName().equals("de.danoeh.antennapod.receiver.PowerConnectionReceiver")) {
//                components.add(c);
//                for (SootMethod mtd : c.getMethods()) {
//                    if (mtd.equals("onReceive")) {
//                        callbackMethodSigs.put(c, mtd);
//                    }
//                }
//            }

        }


        ICFG icfg = new ICFG();
//
        PackManager.v().getPack("jtp").add(
                new Transform("jtp.myTransform", new BodyTransformer() {
                    protected void internalTransform(Body body, String phase, Map options) {
//                        System.out.print("jtp.myTransform");
                        if(!body.getMethod().getDeclaringClass().getName().startsWith("de.danoeh.antennapod")){
                            return;
                        }
                        DirectedGraph<Unit> cfg = new ExceptionalUnitGraph(body);
//                        new LocalMustNotAliasAnalysis();
//                        System.out.println(body.getMethod().getDeclaringClass().getName()+":"+body.getMethod().getName());
                        LinkedList<Unit> stack = new LinkedList<Unit>();
                        CallGraph callGraph = Scene.v().getCallGraph();
                        CFGWriter.v().println("\n\n"+body.getMethod().getDeclaringClass().getName()+":"+body.getMethod().getName());

                        int index  = 0;
                        List<Unit> heads = cfg.getHeads();
                        stack.addAll(heads);
                        Set<Unit> visitedUnits = new HashSet<Unit>();
                        while(!stack.isEmpty()){
                           Unit u = stack.pop();
//                           CFGWriter.v().println(u.toString());
                           Iterator<Edge> edges = callGraph.edgesOutOf(u);
                           while(edges.hasNext()) {
                               Edge e = edges.next();
                               CFGWriter.v().println("      $$EE: "+e.getTgt().method().getDeclaringClass().getName()+": "+e.getTgt().method().getName()+": "+index);
//                               System.out.println(e.getSrc().toString()+": "+index);
                               icfg.addEdge(new ICFG.CallEdge(e.getSrc().method(), u, e.getTgt().method(), index));
                               index++;
                           }
                           for(Unit sc : cfg.getSuccsOf(u)){
                               if(!visitedUnits.contains(sc)){
                                   stack.add(sc);
                                   visitedUnits.add(sc);
                               }
                           }
                        }
                    }
                }
                ));
//
//
//
        Options.v().setPhaseOption("jtp.npc", "on");
        final CodeAnalysis.CodeAnalysisResult[] codeAnalysisResult = new CodeAnalysis.CodeAnalysisResult[1];

        PackManager.v().getPack("wjtp").add(new Transform("wjtp.umlxcx", new SceneTransformer(){

            @Override
            protected void internalTransform(String s, Map<String, String> map) {
               codeAnalysisResult[0] = CodeAnalysis.v().run();
            }
        }));

        Options.v().setPhaseOption("wjtp", "enabled:true");

//        PackManager.v().getPack("wjtp").add(new Transform("wjtp.herosifds", new backups.IFDSDataFlowTransformer()));

//        soot.Main.main(new String[]{});


        System.out.println("soot analysis start");

        PackManager.v().runPacks();

        System.out.println("soot analysis end");

        PackManager.v().writeOutput();

//        CFGWriter2.v().print(icfg.toJSON());

        CFGWriter2.v().print(icfg.serialize(codeAnalysisResult[0]));

        CallGraph callGraph = Scene.v().getCallGraph();

        String res = dumpCallGraph(callGraph);
//
//        System.out.println("exit Code analysis");
//
        CallGraphWriter.v().printf("%s", res);
    }


    static AndroidEntryPointCreator entryPointCreator = null;
    static Set<SootClass> components = new HashSet<SootClass>();
//    MultiMap<SootClass, CallbackDefinition> callbackMethods = new HashMultiMap<>();
    static ProcessManifest manifest = null;
    static MultiMap<SootClass, SootMethod> callbackMethodSigs = new HashMultiMap<>();

    static private AndroidEntryPointCreator createEntryPointCreator() {
//        Set<SootClass> components = getComponentsToAnalyze(component);

        // If we we already have an entry point creator, we make sure to clean up our
        // leftovers from previous runs
        if (entryPointCreator == null)
            entryPointCreator = new AndroidEntryPointCreator(manifest, components);
        else {
            entryPointCreator.removeGeneratedMethods(true);
            entryPointCreator.reset();
        }
//        if (component == null) {
//            // Get all callbacks for all components
//            for (SootClass sc : this.callbackMethods.keySet()) {
//                Set<CallbackDefinition> callbackDefs = this.callbackMethods.get(sc);
//                if (callbackDefs != null)
//                    for (CallbackDefinition cd : callbackDefs)
//                        callbackMethodSigs.put(sc, cd.getTargetMethod());
//            }
//        } else {
            // Get the callbacks for the current component only

        MultiMap<SootClass, SootMethod> filteredCallbackMethodSigs = new HashMultiMap<>();

        DebugOutput.v().println("compoents and callbacks: start");
            for (SootClass sc : components) {
                DebugOutput.v().println("component: "+sc.getName());
                Set<SootMethod> callbackMtds = callbackMethodSigs.get(sc);
                if (callbackMtds != null)
                    for (SootMethod cd : callbackMtds) {
                        filteredCallbackMethodSigs.put(sc, cd);
                        DebugOutput.v().println("method: "+cd.getName());
                    }
            }
//        }

        DebugOutput.v().println("compoents and callbacks: end");
        entryPointCreator.setCallbackFunctions(filteredCallbackMethodSigs);
//        entryPointCreator.setFragments(fragmentClasses);
        entryPointCreator.setComponents(components);
        return entryPointCreator;
    }

    static private void createMainMethod() {

        // Always update the entry point creator to reflect the newest set
        // of callback methods
        entryPointCreator = createEntryPointCreator();
        SootMethod dummyMainMethod = entryPointCreator.createDummyMain();
        Scene.v().setEntryPoints(Collections.singletonList(dummyMainMethod));
        if (!dummyMainMethod.getDeclaringClass().isInScene())
            Scene.v().addClass(dummyMainMethod.getDeclaringClass());

        // addClass() declares the given class as a library class. We need to
        // fix this.
        dummyMainMethod.getDeclaringClass().setApplicationClass();

        Options.v().set_main_class(dummyMainMethod.getDeclaringClass().getName());

        System.out.println(dummyMainMethod.getName());
        System.out.println(dummyMainMethod.getDeclaringClass().getName());
    }

}


