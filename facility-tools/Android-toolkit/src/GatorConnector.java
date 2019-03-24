import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;
import org.xmlpull.v1.XmlPullParserException;
import soot.*;
import soot.jimple.infoflow.android.Debug;
import soot.jimple.infoflow.android.Debug3;
import soot.jimple.infoflow.android.callbacks.CallbackDefinition;
import soot.jimple.infoflow.android.entryPointCreators.AndroidEntryPointCreator;
import soot.jimple.infoflow.android.manifest.ProcessManifest;
import soot.jimple.toolkits.callgraph.CallGraph;
import soot.jimple.toolkits.callgraph.Edge;
import soot.options.Options;
import soot.toolkits.graph.DirectedGraph;
import soot.toolkits.graph.ExceptionalUnitGraph;
import soot.util.Chain;
import soot.util.HashMultiMap;
import soot.util.MultiMap;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;


/*
command1:
java -Xmx16G -cp /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/build/libs/sootandroid-1.0-SNAPSHOT-all.jar presto.android.Main \
-sootandroidDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid \
-sdkDir /mnt/f/D/Android_SDK \
-listenerSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/listeners.xml \
-wtgSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/wtg.xml \
-resourcePath /tmp/gator-hskjovz8/res \
-manifestFile /tmp/gator-hskjovz8/AndroidManifest.xml \
-project /mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk \
-apiLevel android-25 \
-guiAnalysis \
-benchmarkName AnotherMonitor_release.apk \
-android /mnt/f/D/Android_SDK/platforms/android-25/android.jar \
-client GUIHierarchyPrinterClient \
-outputDir /mnt/f/D/AndroidAnalysis/batch_analysis/AnotherMonitor-release-4

command2:
./gator a -p /mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk \
-client GUIHierarchyPrinterClient \
-outputDir /mnt/f/D/AndroidAnalysis/batch_analysis/AnotherMonitor-release-4
*/

//dump the call graph from FlowDroid
public class GatorConnector {
    private static GatorConnector theInstance;

    // time analysis begins
    private long startTime;

    private GatorConnector() throws Exception {
            //run the client of gator and derive the gator file and identify the callbacks.
    }

    public static synchronized GatorConnector v() {
        if (theInstance == null) {
            try {
                theInstance = new GatorConnector();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return theInstance;
    }


    public MultiMap<String, String> run(String apkPath, String skdDir, String outputDir){

        MultiMap<String, String> handlers = new HashMultiMap<String, String>();

        File apkFile = new File(apkPath);
        if(!apkFile.exists() || !apkFile.isFile()){
            System.out.println("invalid arguments");
            return handlers;
        }
        String appName = apkFile.getName();

        Path gatorDir = Paths.get(System.getenv("GatorRoot"));

        File gatorDirFolder = gatorDir.toFile();
        if (!gatorDirFolder.exists()){
            System.out.println("Please configure gator.");
            return handlers;
        }

//        String command = gatorDir.toString()+"/gator a -p \""+apkPath+"\" -client GUIHierarchyPrinterClient -outputDir \""+outputDir+"\"";

//        String command = "java -Xmx16G -cp /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/build/libs/sootandroid-1.0-SNAPSHOT-all.jar presto.android.Main -sootandroidDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid -sdkDir /mnt/f/D/Android_SDK -listenerSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/listeners.xml -wtgSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/wtg.xml -resourcePath /tmp/gator-l_9nb_8u/res -manifestFile /tmp/gator-l_9nb_8u/AndroidManifest.xml -project /mnt/f/D/AndroidAnalysis/APKs/AnotherMonitor_release.apk -apiLevel android-26 -guiAnalysis -benchmarkName AntennaPod_3_18.apk -android /mnt/f/D/Android_SDK/platforms/android-26/android.jar -client GUIHierarchyPrinterClient -outputDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/Android-toolkit/output";
//
//        System.out.println(command);
//
//        try {
//            CommandLine.run(command);
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }

        String gatorFile = outputDir+"/"+appName+".xml";

//        if (!gatorFile.endsWith(".xml")) {
//            // logger.warn("Skipping file %s in layout folder...", fileName);
//            return handlers;
//        }

//        if (gatorFile != null) {
            List<String[]> eventHandlers = null;
            try {
                eventHandlers = parseGatorFile(new File(gatorFile));
            } catch (SAXException e) {
                e.printStackTrace();
            } catch (ParserConfigurationException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }

            for (String[] eventHandler : eventHandlers) {
                String className = eventHandler[0];
                String methodName = eventHandler[1];
                String viewName = eventHandler[2];
                String activityName = eventHandler[3];

//                if (activityName == null || activityName.equals("")) {
//                    continue;
//                }
//
//                Debug.v().println("className: " + className + " methodName: " + methodName + " viewName: " + viewName
//                        + " activityName: " + activityName);
//
//                SootClass activityClass = Scene.v().getSootClass(activityName);
//                if (activityClass == null) {
//                    continue;
//                }
//
//                Debug.v().println(className);
//                SootClass callbackClass = Scene.v().getSootClass(className);
//                if (callbackClass == null) {
//                    continue;
//                }
//                Debug.v().println(callbackClass.getName());
////                this.callbackClasses.add(className);
//                SootMethod callbackMethod = callbackClass.getMethodUnsafe(methodName);
//                Debug.v().println(methodName);
//                if (callbackMethod == null) {
//                    continue;
//                }
//
//                // get the parent classes
//                Hierarchy hierarchy = Scene.v().getActiveHierarchy();
//                List<SootClass> superClasses = new ArrayList<SootClass>();
//                superClasses.addAll(hierarchy.getSuperclassesOf(callbackClass));
//
//                // get the interfaces
//                Chain<SootClass> callbackInterfaces = callbackClass.getInterfaces();
//                superClasses.addAll(callbackInterfaces);
//
//                for (SootClass callbackInterface : callbackInterfaces) {
//                    superClasses.addAll(hierarchy.getSuperinterfacesOf(callbackInterface));
//                }
//
//                // List<SootClass> superinterfaces =
//                // hierarchy.getSuperinterfacesOf(callbackClass);
//
//                // superClasses.addAll(hierarchy.getSuperinterfacesOf(callbackClass));
//
//                // SootMethod smViewOnClick = Scene.v().getMethod(methodName);
//                // SootMethod smViewOnClick = callbackClass.getMethodUnsafe(methodName).getPa;
//                // Debug.v().println(smViewOnClick.getName());
//                // if (smViewOnClick == null) {
//                // continue;
//                // }
//
//                SootMethod smViewOnClick = null;
//
//                for (SootClass superClass : superClasses) {
//                    // smViewOnClick = superClass.getMethod(callbackMethod.getSubSignature());
//                    for (SootMethod sootMethod : superClass.getMethods()) {
//                        if (sootMethod.getSubSignature().equals(callbackMethod.getSubSignature())) {
//                            smViewOnClick = sootMethod;
//                            break;
//                        }
//                    }
//                }
//
//                if (smViewOnClick == null) {
//                    continue;
//                }

//                callbackMethods.put(activityClass,
//                        new CallbackDefinition(callbackMethod, smViewOnClick, CallbackDefinition.CallbackType.Widget));

//                Set<String> handlerMtds = handlers.get(activityClass.getName());
//                if(handlerMtds == null){
//                    handlerMtds = new HashSet<String>();
//                    handlers.putAll(activityClass.getName(), handlerMtds);
//                }
//
//                handlerMtds.add(callbackMethod.getName());

                System.out.println("class name:"+className);
                System.out.println("method name:"+methodName);

                handlers.put(className, methodName);

            }

//            Debug3.v().println("profile call back method gator");
//            for (SootClass callbackClass : callbackMethods.keySet()) {
//                Debug3.v().println("callbackClass:" + callbackClass.getName());
//                Set<CallbackDefinition> callbackDefinitions = callbackMethods.get(callbackClass);
//                for (CallbackDefinition callbackDef : callbackDefinitions) {
//                    Debug3.v().println(callbackDef.profile());
//                }
//            }
//        }

        return handlers;
    }

    public List<String[]> parseGatorFile(File gatorFile) throws IOException, SAXException, ParserConfigurationException {
        Debug.v().println("parseGatorFile");

        List<String[]> eventHandlers = new ArrayList<String[]>();

        if (gatorFile == null || !gatorFile.exists()) {
            System.out.println("gator file doesn't exist.");
            return eventHandlers;
        }

//        if (!gatorFile.endsWith(".xml")) {
//            // logger.warn("Skipping file %s in layout folder...", fileName);
//            return eventHandlers;
//        }

        // InputStream targetStream = new FileInputStream(new File(gatorFile));

//        Debug.v().println(gatorFile);

        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        Document doc = dBuilder.parse(gatorFile);

        // optional, but recommended
        // read this -
        // http://stackoverflow.com/questions/13786607/normalization-in-dom-parsing-with-java-how-does-it-work
        doc.getDocumentElement().normalize();

        // get the first element
        Element element = doc.getDocumentElement();

        // Parse the child nodes
        for (int i = 0; i < element.getChildNodes().getLength(); i++) {
            Node childNode = element.getChildNodes().item(i);
            parseGatorNode(gatorFile, childNode, element, null, eventHandlers);
        }

        return eventHandlers;

    }

    private void parseGatorNode(File gatorFile, Node node, Node parent, Node activityNode,
                                List<String[]> eventHandlers) {
        // Debug.v().println("parseGatorNode");
        // Debug.v().println(node.getNodeName());

        if (node.getNodeName() == null || node.getNodeName().isEmpty()) {
            // logger.warn("Encountered a null or empty node name in file %s, skipping
            // node...", layoutFile);
            return;
        }

        String tname = node.getNodeName().trim();
        if (tname.equals("Activity") || tname.equals("Dialog")) {
            // String activityName =
            // node.getAttributes().getNamedItem("name").getNodeValue();
            activityNode = node;

        } else if (tname.equals("EventAndHandler")) {
            String handler = node.getAttributes().getNamedItem("handler").getNodeValue();
            Debug.v().println("parseGatorNode");
            String[] handlerElements = handler.split(":");
            Debug.v().println(handler);
            if (handlerElements.length == 2) {
                String className = handlerElements[0].trim().replaceAll("[<|>]", "");
                String methodName = handlerElements[1].trim().replaceAll("[<|>]", "");
                String viewName = parent != null ? parent.getAttributes().getNamedItem("type").getNodeValue() : "";
                String activityName = activityNode != null
                        ? activityNode.getAttributes().getNamedItem("name").getNodeValue()
                        : "";
                String[] eventHandler = new String[] { className, methodName, viewName, activityName };
                eventHandlers.add(eventHandler);
            }
        }

        // Parse the child nodes
        for (int i = 0; i < node.getChildNodes().getLength(); i++) {
            Node childNode = node.getChildNodes().item(i);
            parseGatorNode(gatorFile, childNode, node, activityNode, eventHandlers);
        }
    }
}


