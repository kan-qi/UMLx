package org.umlx;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.umlx.utils.FlowDroidConnector;
import org.umlx.utils.GatorConnector;
import org.umlx.writers.*;
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
import java.nio.file.Path;
import java.nio.file.Paths;
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
            map.put(srcSig, neighborSet);
        }
        Gson gson = new GsonBuilder().disableHtmlEscaping().create();
        String json = gson.toJson(map);
        return json;
    }

    private static void printUsage(){
        System.out.println("Incorrect arguments: [0] = apk-file-path, [1] = output-dir");
    }

    public static void main(String[] args){

//        java -cp "out/production/Android-toolkit;libs/*" org.umlx.UMLxAndroidToolKit "f:/D/AndroidAnalysis/APKs/AntennaPod_3_18.apk" "f:/D/Andr
//        oid_SDK/platforms" "./"

//        java -cp "./out/production/Android-toolkit:./libs/*" org.umlx.UMLxAndroidToolKit "/mnt/f/D/AndroidAnalysis/APKs/AntennaPod_3_18.apk" "/mnt/f/D/Android_SDK/platforms" "/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/Android-toolkit/output"

        if (args.length < 2){
            printUsage();
            return;
        }

        Path sdkDir = Paths.get(System.getenv("ANDROID_SDK"));

        if (!sdkDir.toFile().exists()){
            System.out.println("Please configure ANDROID_SDK.");
            return;
        }

        Configs.sdkDir = sdkDir.toString();

        Configs.project = args[0];
//      Configs.sdkDir = args[1];
        Configs.outputDir = args[1];


//        org.umlx.Configs.project = "/mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk";
//        org.umlx.Configs.sdkDir = "/mnt/f/D/Android_SDK/platforms";
//        org.umlx.Configs.outputDir = "/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/Android-toolkit/output";

        //read manifest object
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
        Configs.appPkg = manifest.getPackageName();

        File apkFile = new File(Configs.project);
//        String extension = apkFile.getName().substring(apkFile.getName().lastIndexOf("."));
//        if (!extension.equals(".apk") || !apkFile.exists()){
//            DebugOutput.v().println("apk-file not exists "+ apkFile.getName());
//            return;
//        }

        Configs.appName = apkFile.getName();

        File sdkFile = new File(Configs.sdkDir);
        if (!sdkFile.exists()){
            DebugOutput.v().println("android-jar-directory not exists "+ sdkFile.getName());
            return;
        }

        DebugOutput.v().println("Setup Application...");
        DebugOutput.v().println("platforms: "+ Configs.sdkDir+" project: "+ Configs.project);

        MultiMap<String, String> gatorCallbacks = GatorConnector.v().run(Configs.project, Configs.sdkDir, Configs.outputDir, Configs.sdkVer);
        MultiMap<String, String> flowDroidCallbacks = FlowDroidConnector.v().run(Configs.project, Configs.sdkDir, Configs.outputDir);

        soot.G.reset();
        Options.v().set_src_prec(Options.src_prec_apk);
        Options.v().set_process_dir(Collections.singletonList(Configs.project));
        Options.v().set_android_jars(Configs.sdkDir+"/platforms");
        // Enable whole-program mode
        Options.v().set_whole_program(true);
        Options.v().set_allow_phantom_refs(true);
        Options.v().set_output_format(Options.output_format_none);
        Options.v().set_process_multiple_dex(true);
        Scene.v().loadNecessaryClasses();
        Options.v().set_app(true);


        System.out.println("callbacks:");

        // Read callbacks from flowdroid
        for(String cls: flowDroidCallbacks.keySet()){
                SootClass c = Scene.v().loadClass(cls, SootClass.BODIES);
                c.setApplicationClass();
                components.add(c);
                for(String mtd : flowDroidCallbacks.get(cls)){
                    SootMethod entryPoint = c.getMethodByName(mtd);
                    callbackMethodSigs.put(c, entryPoint);
                }
        }

        // Read callbacks from gator
        for(String cls: gatorCallbacks.keySet()){
            SootClass c = Scene.v().loadClass(cls, SootClass.BODIES);
            c.setApplicationClass();
            components.add(c);
            for(String mtd : gatorCallbacks.get(cls)){
                SootMethod entryPoint = c.getMethod(mtd);
                callbackMethodSigs.put(c, entryPoint);
                System.out.println(entryPoint.getName());
            }
        }

        createMainMethod();

        DebugOutput.v().println("classes and methods1:");
        for (SootClass cs : Scene.v().getClasses()) {
            ClassWriter.v().println(cs.getName());
            DebugOutput.v().println("classes: "+cs.getName());
//            if(cs.getName().equals("org.apache.log.LogTarget")){
//                cs.setPhantomClass();
//                continue;
//            }
            if (cs.getName().startsWith(Configs.appPkg)) {
                cs.setApplicationClass();
                DebugOutput.v().println("application classes: "+cs.getName());
            }
//            else {
//                cs.setLibraryClass();
//                DebugOutput.v().println("library classes: "+cs.getName());
//            }

            for (SootMethod mtd : cs.getMethods()) {

                    DebugOutput.v().println("methods:"+mtd.getName());
            }
        }


        ICFG icfg = new ICFG();
//
        PackManager.v().getPack("jtp").add(
                new Transform("jtp.myTransform", new BodyTransformer() {
                    protected void internalTransform(Body body, String phase, Map options) {
//                        System.out.print("jtp.myTransform");
                        if(!body.getMethod().getDeclaringClass().getName().startsWith(Configs.appPkg)){
                            return;
                        }
                        DirectedGraph<Unit> cfg = new ExceptionalUnitGraph(body);
                        LinkedList<Unit> stack = new LinkedList<Unit>();
                        CallGraph callGraph = Scene.v().getCallGraph();
                        CFGWriter.v().println("\n\n"+body.getMethod().getDeclaringClass().getName()+":"+body.getMethod().getName());

                        int index  = 0;
                        List<Unit> heads = cfg.getHeads();
                        stack.addAll(heads);
                        Set<Unit> visitedUnits = new HashSet<Unit>();
                        while(!stack.isEmpty()){
                           Unit u = stack.pop();
                           Iterator<Edge> edges = callGraph.edgesOutOf(u);
                           while(edges.hasNext()) {
                               Edge e = edges.next();
                               CFGWriter.v().println("      call:"+e.getTgt().method().getDeclaringClass().getName()+": "+e.getTgt().method().getName()+": "+index);
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

        Options.v().setPhaseOption("jb", "on");
        Options.v().setPhaseOption("cg", "on");

        Options.v().setPhaseOption("jtp.npc", "on");
        final CodeAnalysis.CodeAnalysisResult[] codeAnalysisResult = new CodeAnalysis.CodeAnalysisResult[1];

        PackManager.v().getPack("wjtp").add(new Transform("wjtp.umlxcx", new SceneTransformer(){

            @Override
            protected void internalTransform(String s, Map<String, String> map) {
               codeAnalysisResult[0] = CodeAnalysis.v().run();
            }
        }));

        Options.v().setPhaseOption("wjtp", "enabled:true");

        System.out.println("soot analysis start");

        PackManager.v().runPacks();

        System.out.println("soot analysis end");

        PackManager.v().writeOutput();

        CFGWriter1.v().print(icfg.toJSON(codeAnalysisResult[0]));

        CFGWriter2.v().print(icfg.serialize(codeAnalysisResult[0]));

        CallGraph callGraph = Scene.v().getCallGraph();

        String res = dumpCallGraph(callGraph);

        CallGraphWriter.v().printf("%s", res);
    }


    static AndroidEntryPointCreator entryPointCreator = null;
    static Set<SootClass> components = new HashSet<SootClass>();
    static ProcessManifest manifest = null;
    static MultiMap<SootClass, SootMethod> callbackMethodSigs = new HashMultiMap<>();

    static private AndroidEntryPointCreator createEntryPointCreator() {
        // If we we already have an entry point creator, we make sure to clean up our
        // leftovers from previous runs
        if (entryPointCreator == null)
            entryPointCreator = new AndroidEntryPointCreator(manifest, components);
        else {
            entryPointCreator.removeGeneratedMethods(true);
            entryPointCreator.reset();
        }

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

        DebugOutput.v().println("compoents and callbacks: end");
        entryPointCreator.setCallbackFunctions(filteredCallbackMethodSigs);
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


