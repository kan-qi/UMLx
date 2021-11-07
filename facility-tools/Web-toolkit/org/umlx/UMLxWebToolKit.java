package org.umlx;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.umlx.utils.CallbackScannerConnector;
import org.umlx.writers.*;
import soot.*;
import soot.jimple.toolkits.callgraph.CallGraph;
import soot.jimple.toolkits.callgraph.Edge;
import soot.options.Options;
import soot.toolkits.graph.DirectedGraph;
import soot.toolkits.graph.ExceptionalUnitGraph;

import soot.util.MultiMap;

import java.io.*;
import java.util.*;

import static soot.SootClass.SIGNATURES;

//dump the call graph from FlowDroid
public class UMLxWebToolKit {
    public UMLxWebToolKit(){}

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
        System.out.println("Incorrect arguments: [0] = project-path, [1] = output-dir, [2] = classPath, [3] = package, [4] = handlersFile");
    }

    public static void main(String[] args) {

//      java -cp "out/production/Android-toolkit;libs/*" org.umlx.UMLxWebToolKit "f:/D/AndroidAnalysis/APKs/AntennaPod_3_18.apk" "f:/D/Andr
//      oid_SDK/platforms" "./"

//      java -cp "./out/production/Android-toolkit:./libs/*" org.umlx.UMLxWebToolKit "/mnt/f/D/AndroidAnalysis/APKs/AntennaPod_3_18.apk" "/mnt/f/D/Android_SDK/platforms" "/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/Android-toolkit/output"

        if (args.length < 2) {
            printUsage();
            return;
        }
        Configs.project = args[0];
        Configs.outputDir = args[1];
        Configs.classPath = args[2];
        Configs.pkg = args[3];
        Configs.handlersFile = args[4];

        MultiMap<String, String> handlerCallbacks = CallbackScannerConnector.v().run(Configs.project,  Configs.handlersFile);


//      String sootClassPath = Scene.v().getSootClassPath() + File.pathSeparator + sootClassPath;
        //Scene.v().setSootClassPath(Scene.v().getSootClassPath() + File.pathSeparator + "D:\\WebAnalysis\\commafeed2\\commafeed\\target\\classes");
        Scene.v().setSootClassPath(Scene.v().getSootClassPath() + File.pathSeparator +Configs.classPath);
        //Options.v().set_keep_line_number(true);
        //Options.v().setPhaseOption("jb", "use-original-names");
        Options.v().set_whole_program(true);
        Options.v().set_allow_phantom_refs(true);
        Options.v().set_process_dir(Collections.singletonList(Configs.classPath));
         //SootClass sootClass = Scene.v().loadClassAndSupport("com.commafeed.CommaFeedApplication");
//        SootClass sootClass = Scene.v().loadClassAndSupport("example.MyController");
        Scene.v().addBasicClass("org.apache.wicket.application.IComponentInstantiationListener",SIGNATURES);
         Scene.v().loadNecessaryClasses();
//        sootClass.setApplicationClass();


        System.out.println("callbacks:");

        //Read callbacks from gator

        List<SootMethod> entryPoints = new ArrayList<SootMethod>();
        for (String cls : handlerCallbacks.keySet()) {
            DebugOutput.v().println("entry point - class: " + cls);
            SootClass c = Scene.v().loadClass(cls, SootClass.BODIES);
            c.setApplicationClass();
            for (String mtd : handlerCallbacks.get(cls)) {
                DebugOutput.v().println("entry point - method: " + mtd);
                SootMethod entryPoint = c.getMethodUnsafe(mtd);
                if (entryPoint == null) {
                    continue;
                }
                entryPoints.add(entryPoint);
                System.out.println(entryPoint.getName());
            }
        }

        Scene.v().setEntryPoints(entryPoints);

        int numClasses = 0;
        int numMethods = 0;

        DebugOutput.v().println("classes and methods1:");
        DebugOutput.v().println("package: " + Configs.pkg);
        for (SootClass cs : Scene.v().getClasses()) {
            ClassWriter.v().println(cs.getName());
            DebugOutput.v().println("classes: " + cs.getName());

            if (cs.isPhantomClass()) {
                continue;
            }

            if (cs.getName().startsWith(Configs.pkg) || cs.getName().indexOf(Configs.pkg) >= 0) {
                cs.setApplicationClass();
                DebugOutput.v().println("application classes: " + cs.getName());
                for (SootMethod m : cs.getMethods()) {
                    MethodsWriter.v().println(m.getSignature());
                }
            } else {
                cs.setLibraryClass();
                DebugOutput.v().println("library classes: " + cs.getName());
            }

            FastHierarchy fastHierarchy = null;

            try {
                fastHierarchy = Scene.v().getFastHierarchy();
            } catch (Exception e) {
                e.printStackTrace();
            }

        }


        ICFG icfg = new ICFG();
//
        PackManager.v().getPack("jtp").add(new Transform("jtp.myTransform", new BodyTransformer() {
            protected void internalTransform(Body body, String phase, Map options) {
//                        System.out.print("jtp.myTransform");
                if (!body.getMethod().getDeclaringClass().getName().startsWith(Configs.pkg)) {
                    return;
                }
                DirectedGraph<Unit> cfg = new ExceptionalUnitGraph(body);
                LinkedList<Unit> stack = new LinkedList<Unit>();
                CallGraph callGraph = Scene.v().getCallGraph();
                CFGWriter.v().println("\n\n" + body.getMethod().getDeclaringClass().getName() + ":" + body.getMethod().getName());

                int index = 0;
                List<Unit> heads = cfg.getHeads();
                stack.addAll(heads);
                Set<Unit> visitedUnits = new HashSet<Unit>();
                while (!stack.isEmpty()) {
                    Unit u = stack.pop();
                    Iterator<Edge> edges = callGraph.edgesOutOf(u);
                    while (edges.hasNext()) {
                        Edge e = edges.next();
                        CFGWriter.v().println("      call:" + e.getTgt().method().getDeclaringClass().getName() + ": " + e.getTgt().method().getName() + ": " + index);
                        icfg.addEdge(new ICFG.CallEdge(e.getSrc().method(), u, e.getTgt().method(), index));
                        index++;
                    }

                    for (Unit sc : cfg.getSuccsOf(u)) {
                        if (!visitedUnits.contains(sc)) {
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

        PackManager.v().getPack("wjtp").add(new Transform("wjtp.umlxcx", new SceneTransformer() {
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

        //dump other Android app attributes
        String WebAttrs = "{" +
                "\",\"Classes\":\"" + numClasses +
                "\",\"Methods\":\"" + numMethods + "\"}";

        AndroidAttrsWriter.v().print(WebAttrs);
    }

}


