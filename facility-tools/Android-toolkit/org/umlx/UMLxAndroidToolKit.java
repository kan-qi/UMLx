
package org.umlx;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.umlx.utils.FileManagerUtil;
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
<<<<<<< HEAD
=======
    
>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8
    private static int numOfLayoutFiles(String inputDir, String outputDir) {
    	  FileManagerUtil fileUtil = new FileManagerUtil(outputDir);
          Map<String, List<String>> filePaths = new HashMap<String, List<String>>();
          Map<String, List<String>> xmlPaths = new HashMap<String, List<String>>();
  			try {
  			filePaths = fileUtil.findFiles(inputDir, "^layout(.*)", false);
  			List<String> directList = new ArrayList<String>();
  			for(String targetPath : filePaths.keySet()){
  	            //System.out.println(filePaths.get(targetPath));
  	            directList.addAll(filePaths.get(targetPath));
  	        }
  			xmlPaths = fileUtil.findFiles(directList, "(.*)xml$", true);
  			} catch (IOException e) {
  			// TODO Auto-generated catch block
  			e.printStackTrace();
  			}
  		
  		 int numLayouts = 0;
          for(String targetPath : xmlPaths.keySet()){
//              System.out.println(xmlPaths.get(targetPath));
        	  	numLayouts += xmlPaths.get(targetPath).size();
          }
          
          return numLayouts;
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
            map.put(srcSig, neighborSet);
        }
        Gson gson = new GsonBuilder().disableHtmlEscaping().create();
        String json = gson.toJson(map);
        return json;
    }

    private static void printUsage(){
        System.out.println("Incorrect arguments: [0] = apk-file-path, [1] = output-dir, [2] = package");
    }

    public static void main(String[] args){

//      java -cp "out/production/Android-toolkit;libs/*" org.umlx.UMLxAndroidToolKit "f:/D/AndroidAnalysis/APKs/AntennaPod_3_18.apk" "f:/D/Andr
//      oid_SDK/platforms" "./"
<<<<<<< HEAD

//      java -cp "./out/production/Android-toolkit:./libs/*" org.umlx.UMLxAndroidToolKit "/mnt/f/D/AndroidAnalysis/APKs/AntennaPod_3_18.apk" "/mnt/f/D/Android_SDK/platforms" "/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/Android-toolkit/output"

//        java -cp "out/production/Android-toolkit;libs/*" org.umlx.UMLxAndroidToolKit "f:/D/AndroidAnalysis/APKs/AntennaPod_3_18.apk" "f:/D/Andr
//        oid_SDK/platforms" "./"
=======
>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8

//      java -cp "./out/production/Android-toolkit:./libs/*" org.umlx.UMLxAndroidToolKit "/mnt/f/D/AndroidAnalysis/APKs/AntennaPod_3_18.apk" "/mnt/f/D/Android_SDK/platforms" "/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/Android-toolkit/output"


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

        if(args.length > 2){
            Configs.appPkg = args[2];
        }

//      org.umlx.Configs.project = "/mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk";
//      org.umlx.Configs.sdkDir = "/mnt/f/D/Android_SDK/platforms";
//      org.umlx.Configs.outputDir = "/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/Android-toolkit/output";
<<<<<<< HEAD


//        org.umlx.Configs.project = "/mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk";
//        org.umlx.Configs.sdkDir = "/mnt/f/D/Android_SDK/platforms";
//        org.umlx.Configs.outputDir = "/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/Android-toolkit/output";
=======
>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8


        //read manifest object
        try {
            manifest = new ProcessManifest(Configs.project);
        } catch (IOException e) {
            e.printStackTrace();
        } catch (XmlPullParserException e) {
            e.printStackTrace();
        }

        if(manifest == null){
            System.out.println("issue with parsing manifest file from sdk");
            return;
        }

        Configs.sdkVer = manifest.targetSdkVersion();

        if(Configs.appPkg == null) {
            Configs.appPkg = manifest.getPackageName();
            System.out.println("Parsing package name from manifest.");
            for (String packageSuffix : Configs.excludingSuffice) {
                if (Configs.appPkg.endsWith(packageSuffix)) {
                    Configs.appPkg = Configs.appPkg.substring(0, Configs.appPkg.length() - packageSuffix.length());
                }
            }
        }

        System.out.println(Configs.appPkg);

        File apkFile = new File(Configs.project);
        String extension = apkFile.getName().substring(apkFile.getName().lastIndexOf("."));
        if (!extension.equals(".apk") || !apkFile.exists()){
            DebugOutput.v().println("apk-file not exists "+ apkFile.getName());
            return;
        }

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

        //scan the xml files for the layout.
        //scan the number of files under the folder: Resoruces/res/layout*
        int numOfLayoutFiles = numOfLayoutFiles(Configs.outputDir+"/Resources/res", Configs.outputDir);

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
                for(String mtd : flowDroidCallbacks.get(cls)) {
<<<<<<< HEAD

//                  SootMethod entryPoint = c.getMethodByNameUnsafe(mtd);

=======
//                  SootMethod entryPoint = c.getMethodByNameUnsafe(mtd);
>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8
                    SootMethod entryPoint = c.getMethodUnsafe(mtd);
                    if (entryPoint == null) {
                        continue;
                    }
                    callbackMethodSigs.put(c, entryPoint);
                }
        }

        // Read callbacks from gator
        for(String cls: gatorCallbacks.keySet()){
            SootClass c = Scene.v().loadClass(cls, SootClass.BODIES);
            c.setApplicationClass();
            components.add(c);
            for(String mtd : gatorCallbacks.get(cls)){
                SootMethod entryPoint = c.getMethodUnsafe(mtd);
                if(entryPoint == null){
                    continue;
                }
                callbackMethodSigs.put(c, entryPoint);
                System.out.println(entryPoint.getName());
            }
        }

        for(SootClass c : callbackMethodSigs.keySet()) {
            for (SootMethod method : callbackMethodSigs.get(c)) {
//              GatorHandlersWriter.v().println("<" + c.getName() + ": " + method.getSignature()+">");
                GatorHandlersWriter.v().println(method.getSignature());
            }
        }

        createMainMethod();

        int numServices = 0;
       	int numActivities = 0;
       	int numBroadcastReceivers = 0;
       	int numContentProviders = 0;

        DebugOutput.v().println("classes and methods1:");
        DebugOutput.v().println("package: " + Configs.appPkg);
        for (SootClass cs : Scene.v().getClasses()){
            ClassWriter.v().println(cs.getName());
            DebugOutput.v().println("classes: "+cs.getName());
//          if(cs.getName().equals("org.apache.log.LogTarget")){
//              cs.setPhantomClass();
//              continue;
//           }

            if(cs.isPhantomClass()){
                continue;
            }

            if (cs.getName().startsWith(Configs.appPkg) || cs.getName().indexOf(Configs.appPkg) >= 0) {
                cs.setApplicationClass();
                DebugOutput.v().println("application classes: "+cs.getName());
            }
            else {
                cs.setLibraryClass();
                DebugOutput.v().println("library classes: "+cs.getName());
            }

//          for (SootMethod mtd : cs.getMethods()) {
//              DebugOutput.v().println("methods:"+mtd.getName());
//          }

            SootClass AndroidServiceCls = Scene.v().getSootClass("android.app.Service");
            SootClass AndroidContentProviderCls = Scene.v().getSootClass("android.content.ContentProvider");
            SootClass AndroidActivityCls = Scene.v().getSootClass("android.app.Activity");
            SootClass AndroidBroadcastReceiverCls = Scene.v().getSootClass("android.content.BroadcastReceiver");
            //add the counters for activity, broadcast receiver, content provider, and services

            FastHierarchy fastHierarchy = null;

            try {
                fastHierarchy = Scene.v().getFastHierarchy();
            } catch(Exception e){
                e.printStackTrace();
            }

            if(fastHierarchy != null) {
                if (Scene.v().getFastHierarchy().isSubclass(cs, AndroidServiceCls)) {
                    numServices++;
                } else if (Scene.v().getFastHierarchy().isSubclass(cs, AndroidContentProviderCls)) {
                    numContentProviders++;
                } else if (Scene.v().getFastHierarchy().isSubclass(cs, AndroidActivityCls)) {
                    numActivities++;
                } else if (Scene.v().getFastHierarchy().isSubclass(cs, AndroidBroadcastReceiverCls)) {
                    numBroadcastReceivers++;
                }
            }
        }


        ICFG icfg = new ICFG();
//
        PackManager.v().getPack("jtp").add( new Transform("jtp.myTransform", new BodyTransformer() {
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
<<<<<<< HEAD

        List<String> names = GatorConnector.v().activityNames;
        for (int i = 0; i < names.size(); i++)
            names.set(i, "\"" + names.get(i) + "\"");
        String nameStrJSON = "[" + String.join(",", names) + "]";
=======
       
>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8
        //dump other Android app attributes
		String AndroidAttrs = "{\"Services\":\""+numServices+
					"\",\"Activities\":\""+numActivities+
					"\",\"BroadcastReceivers\":\""+numBroadcastReceivers+
					"\",\"ContentProviders\":\""+numContentProviders+
					"\",\"LayoutFiles\":\""+numOfLayoutFiles+
					"\",\"Views\":\""+GatorConnector.v().numViews+
					"\",\"Screens\":\""+GatorConnector.v().numScreens+
<<<<<<< HEAD
                    "\",\"ActivityNames\": "+nameStrJSON+
					",\"EventHandlers\":\""+GatorConnector.v().numEventHandlers+"\"}";

=======
					"\",\"EventHandlers\":\""+GatorConnector.v().numEventHandlers+"\"}";
			
>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8
		AndroidAttrsWriter.v().print(AndroidAttrs);
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

        if (!dummyMainMethod.getDeclaringClass().isInScene()) {
            Scene.v().addClass(dummyMainMethod.getDeclaringClass());
        }

        // addClass() declares the given class as a library class. We need to
        // fix this.
        dummyMainMethod.getDeclaringClass().setApplicationClass();

        Options.v().set_main_class(dummyMainMethod.getDeclaringClass().getName());

        System.out.println(dummyMainMethod.getName());
        System.out.println(dummyMainMethod.getDeclaringClass().getName());
    }

}

